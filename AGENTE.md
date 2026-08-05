# 🤖 Documentação para Agentes de IA – ApprovalFlow

Este documento serve como guia completo de referência arquitetural, técnica e comportamental para qualquer agente de inteligência artificial (ou desenvolvedor) que vá atuar, manter ou expandir o projeto **ApprovalFlow**.

---

## 1. Visão Geral do Projeto

### Objetivo do Sistema
O **ApprovalFlow** é uma aplicação web corporativa voltada para a gestão centralizada de tarefas e solicitações com fluxo de aprovação departamental. O sistema possibilita que colaboradores enviem demandas, aprovações sejam processadas por gestores responsáveis e a administração mantenha o controle total sobre usuários, departamentos e métricas globais.

### Problema que Ele Resolve
Em muitas empresas, solicitações de compras, novas contratações, licenças de software ou suporte de TI ocorrem de forma desorganizada através de e-mails ou mensagens informais. Isso resulta em:
- Falta de governança e de histórico de aprovações.
- Gargalos operacionais sem visibilidade de prazos desejados.
- Ausência de papéis claros de aprovação por departamento.
- Dificuldade na geração de relatórios e auditoria de ações.

O ApprovalFlow padroniza a abertura de tarefas, gerencia papéis de aprovação e registra um histórico auditável (*audit trail*) para cada ação executada.

### Público-Alvo
- **Colaboradores (`colaborador`)**: Funcionários que registram solicitações/tarefas para seus departamentos ou outros setores.
- **Aprovadores (`aprovador`)**: Gestores e supervisores habilitados a aprovar ou rejeitar solicitações de determinados departamentos.
- **Administradores (`admin`)**: Equipe de governança/TI com privilégios totais para gerenciar usuários, vincular departamentos a aprovadores, configurar setores e analisar estatísticas organizacionais.

### Principais Características
- **Autenticação Segura**: Sessão baseada em cookies `httpOnly` contendo tokens JWT (HS256 com `jose`).
- **Controle de Acesso Baseado em Funções (RBAC)**: Proteção de rotas no Middleware Next.js e controle granular na API e UI.
- **Fluxo de Aprovação e Rejeição**: Capacidade de aprovar ou rejeitar demandas com comentários de justificativa.
- **Histórico de Auditoria (`task_history`)**: Registro imutável de todas as transações da tarefa (`criada`, `aprovada`, `rejeitada`, `editada`, `reenviada`).
- **Dashboards Dinâmicos por Papel**: Visões customizadas para Colaborador, Aprovador e Administrador com gráficos comparativos (`recharts`).
- **Gestão de Departamentos e Usuários**: Painéis administrativos para criação de setores (com paleta de cores) e edição de papéis/permissões de usuários.
- **Sistema de Notificações Internas**: Notificações em tempo real no Header para avisos de criação, aprovação e rejeição de tarefas.
- **Design System com Suporte a Temas**: Interface responsiva e moderna desenvolvida com Tailwind CSS v4, suporte a temas Claro/Escuro via `next-themes`.

---

## 2. Arquitetura

### Estrutura de Pastas
O projeto adota uma arquitetura em camadas orientada a funcionalidades (*Feature-Driven Architecture* combined with *Clean Directory Separation*) no Next.js (App Router):

```
approval-flow/
├── .env                       # Variáveis de ambiente
├── Dockerfile                 # Configuração de container Docker
├── docker-compose.yaml        # Serviço PostgreSQL 17
├── next.config.ts             # Configurações do Next.js
├── package.json               # Dependências do projeto
├── prisma.config.ts           # Configuração do Prisma ORM 7
├── prisma/
│   ├── schema.prisma          # Definição de modelos e enums do banco
│   ├── seed.ts                # Populate inicial de dados para desenvolvimento
│   └── migrations/            # Histórico de migrações SQL
├── generated/
│   └── prisma/                # Cliente Prisma gerado (output customizado)
└── src/
    ├── app/                   # App Router do Next.js
    │   ├── (auth)/            # Grupo de rotas públicas de autenticação (/login, /register)
    │   ├── (approvalflow)/    # Grupo de rotas protegidas (/dashboard, /tasks, /approvals, /admin/...)
    │   ├── 403/               # Página de acesso negado
    │   ├── api/               # PONTOS DE ENTRADA HTTP (re-exportam handlers de @/server)
    │   ├── globals.css        # Estilos globais e tokens do Tailwind CSS
    │   └── layout.tsx         # Root layout (Providers de tema, toast e analytics)
    ├── components/            # Componentes visuais compartilhados
    │   ├── ui/                # Wrappers customizados de UI (CustomButton, CustomModal, CustomSelect, etc.)
    │   ├── layout/            # Componentes de estrutura (AppLayout, AppShell, Header, SideBar)
    │   ├── charts/            # Gráficos com Recharts (TaskStatusChart, DepartmentStatusChart)
    │   └── dashboard/         # Views de Dashboard por role (AdminDashboard, ApproverDashboard, CollaboratorDashboard)
    ├── config/                # Mapeamentos e constantes globais (roles.ts)
    ├── contexts/              # Contextos React (toast-context.tsx, session-context.tsx)
    ├── features/              # Módulos funcionais e suas páginas React
    │   ├── admin/             # Páginas de gestão de departamentos e usuários
    │   ├── approvals/         # Página de aprovações pendentes
    │   ├── auth/              # Páginas de Login e Registro
    │   ├── dashboard/         # Página unificada de Dashboard
    │   ├── profile/           # Página de Perfil do Usuário
    │   ├── settings/          # Configurações do usuário
    │   └── tasks/             # Criação, listagem, edição e detalhes de tarefas
    ├── interfaces/            # Contratos de tipos e interfaces TypeScript
    ├── lib/                   # Utilitários de infraestrutura (prisma.ts, auth.ts, permissions.ts, api/...)
    ├── schemas/               # Schemas de validação Zod (authentication, task, user, department)
    ├── server/                # REGRAS DE NEGÓCIO E ROTAS DE SERVIDOR (Handlers das rotas de /api)
    │   ├── auth/              # Lógica de login, register, logout
    │   ├── departments/       # Lógica de CRUD de departamentos
    │   ├── notifications/     # Lógica de leitura e listagem de notificações
    │   ├── tasks/             # Lógica de movimentação, criação e aprovação de tarefas
    │   └── users/             # Lógica de listagem e atualização de usuários
    └── utils/                 # Funções utilitárias puras (date.ts, formatters, etc.)
```

### Organização do Código e Padrões Arquiteturais
1. **Desacoplamento de Handlers da API (`App Router Layering`)**:
   As rotas dentro de `src/app/api/.../route.ts` atuam apenas como exportadores finos que delegam a execução diretamente para arquivos em `src/server/...`:
   ```ts
   // Exemplo em src/app/api/tasks/route.ts
   export { GET } from "@/server/tasks/tasks.routes"
   ```
2. **Separação UI / Feature Pages**:
   As páginas do Next.js em `src/app/(approvalflow)/.../page.tsx` apenas renderizam os componentes correspondentes localizados em `src/features/<modulo>/pages/<Modulo>Page.tsx`.
3. **Componentes UI Atômicos/Envelopados**:
   Componentes de interface genéricos em `src/components/ui/` (`CustomButton`, `CustomModal`, `CustomSelect`, `CustomInput`) garantem um visual consistente sem dependência direta de bibliotecas de componentes externas pesadas.
4. **Camada de Schemas de Validação (`Zod`)**:
   Toda validação de dados de entrada na API e em formulários frontend é realizada via schemas Zod declarados em `src/schemas/`.

### Fluxo Geral da Aplicação
1. **Requisição Inicial**: O cliente aciona uma URL.
2. **Middleware (`src/middleware.ts`)**:
   - Verifica a existência e validade do cookie JWT (`approval_flow_token`).
   - Se rota for pública (`/login`, `/register`) e o token for válido $\rightarrow$ redireciona para `/dashboard`.
   - Se rota for protegida e o token for ausente/inválido $\rightarrow$ redireciona para `/login`.
   - Executa `hasRoutePermission(role, pathname)` contra `ROLE_ROUTES` (`src/config/roles.ts`). Se não autorizado $\rightarrow$ redireciona para `/403`.
3. **Execução no Servidor / API**:
   - A requisição HTTP atinge `src/app/api/.../route.ts`, que executa o handler em `src/server/...`.
   - O handler extrai a sessão via `getCurrentUser()` (`src/lib/get-current-user.ts`), valida o body com Zod e executa consultas/transações transacionais com o `prisma`.
4. **Respostas e Interface**:
   - A API retorna respostas padronizadas `{ success: boolean, data?: any, message?: string, errors?: any }`.
   - A UI reage atualizando estados via formulários React Hook Form, disparando toasts pelo `ToastContext` e navegando via `next/navigation`.

---

## 3. Stack Tecnológica

| Categoria | Tecnologia | Versão / Descrição |
| :--- | :--- | :--- |
| **Linguagem** | TypeScript | `^5.9.3` |
| **Framework Web** | Next.js | `16.2.9` (App Router com Turbopack em dev) |
| **Biblioteca de UI** | React | `19.2.4` / React DOM `19.2.4` |
| **Estilização** | Tailwind CSS | `^4.0.0` com `@tailwindcss/postcss` |
| **Gerenciamento de Formulários** | React Hook Form | `^7.81.0` com `@hookform/resolvers` |
| **Validação de Schemas** | Zod | `^4.4.3` |
| **Autenticação & Segurança** | Jose / BcryptJS | `jose` (`^6.2.3`) para JWT / `bcryptjs` (`^3.0.3`) para hash de senhas |
| **Banco de Dados** | PostgreSQL | Versão 17 (via Docker Compose) |
| **ORM** | Prisma ORM | `^7.8.0` com adaptador `@prisma/adapter-pg` e driver `pg` (`^8.22.0`) |
| **Visualização de Dados** | Recharts | `^3.9.1` |
| **Ícones** | Lucide React | `^1.20.0` |
| **Gerenciamento de Tema** | Next Themes | `^0.4.6` |
| **Analytics** | Vercel Analytics | `^2.0.1` |
| **Infraestrutura Local** | Docker / Docker Compose | Container PostgreSQL `postgres:17-alpine` |

---

## 4. Funcionalidades

### 1. Autenticação e Autorização
- **Login (`POST /api/login`)**: Autentica e-mail e senha, compara hash bcrypt, assina token JWT de 8h contendo `id`, `email`, `name`, `perfil` e `role`, e grava o cookie `approval_flow_token`.
- **Registro (`POST /api/register`)**: Permite o cadastro de novos usuários vinculando-os a um departamento inicial com a função padrão de `colaborador`.
- **Logout (`POST /api/logout`)**: Expira o cookie de autenticação e encerra a sessão.

### 2. Gestão de Tarefas
- **Listagem e Filtros (`GET /api/tasks`)**: Retorna tarefas de acordo com o papel do usuário logado (filtro por status, departamento e data desejada).
- **Criação de Tarefa (`POST /api/tasks/new`)**: Cria uma nova tarefa com status `pendente` e insere o primeiro registro no `task_history` (`action: "criada"`).
- **Detalhamento (`GET /api/tasks/[taskId]`)**: Retorna detalhes completos da tarefa, incluindo criador, departamento e histórico auditável de ações.
- **Edição / Reenvio (`PUT /api/tasks/update`)**: Permite que o criador modifique os dados de uma tarefa e atualize seu status para a reavaliação.
- **Aprovação (`POST /api/tasks/approve`)**: Registra a aprovação da tarefa pelo aprovador autorizados, alterando seu status para `aprovada` e adicionando o histórico `aprovada`.
- **Rejeição (`POST /api/tasks/reject`)**: Registra a recusa da solicitação, salvando a justificativa em `rejection_reason` e gerando o histórico `rejeitada`.

### 3. Painéis de Controle (Dashboards)
- **Dashboard Colaborador**: Exibe resumo de tarefas enviadas pelo próprio usuário (Pendentes, Aprovadas, Rejeitadas).
- **Dashboard Aprovador**: Exibe fila de solicitações pendentes de aprovação nos departamentos que o usuário gerencia, métricas de tempo de resposta e histórico.
- **Dashboard Administrador**: Exibe métricas globais da organização, gráficos de distribuição de tarefas por setor e por status, total de usuários e departamentos ativas.

### 4. Gestão de Departamentos (Exclusivo Admin)
- **Listagem de Departamentos (`GET /api/departments`)**: Exibe os setores cadastrados e a contagem de colaboradores associados.
- **Criação de Departamento (`POST /api/departments`)**: Permite cadastrar novos setores especificando nome, descrição e cor identificadora (código HEX).
- **Edição/Atualização (`PUT /api/departments/[departmentId]`)**: Atualiza informações do setor.

### 5. Gestão de Usuários (Exclusivo Admin)
- **Listagem de Usuários (`GET /api/users`)**: Exibe todos os usuários cadastrados na plataforma.
- **Edição de Perfil e Papéis (`PUT /api/users/[userId]`)**: Permite que administradores alterem a função (`colaborador`, `aprovador`, `admin`), departamento e permissões de aprovação do usuário.

### 6. Central de Notificações
- **Notificações em Tempo Real (`GET /api/notifications/[userId]`)**: Retorna notificações não lidas e recentes do usuário.
- **Marcar Como Lidas (`PUT /api/notifications/read-all`)**: Atualiza o status de todas as notificações do usuário.

---

## 5. Padrões de Desenvolvimento

### Convenções de Nomenclatura
- **Arquivos de Rotas API Servidor**: `<recurso>.routes.ts` (ex: `tasks.routes.ts`, `login.routes.ts`).
- **Componentes React**: PascalCase (ex: `TaskDetailsPage.tsx`, `CustomButton.tsx`).
- **Arquivos de Schemas**: `<recurso>.schema.ts` ou `<recurso>Schema.ts`.
- **Interfaces/Tipos**: PascalCase para interfaces e enums, camelCase para propriedades de tipos (ex: `EnrichedTask`, `TaskStatus`).
- **Tabelas do Banco de Dados**: snake_case em plural (ex: `users`, `departments`, `tasks`, `task_history`, `user_approvable_departments`).
- **Campos do Banco de Dados**: snake_case (ex: `department_id`, `created_at`, `password_hash`).

### Organização de Componentes
- Use `"use client"` explicitamente no topo de qualquer arquivo de componente que utilize hooks React (`useState`, `useEffect`, `useContext`, `useForm`).
- Componentes UI genéricos devem ser mantidos em `src/components/ui/` e re-exportados através do arquivo `src/components/ui/index.ts`.
- Páginas funcionais devem ficar encapsuladas na estrutura `src/features/<modulo>/pages/`.

### Estratégias de Validação
- **Formulários**: Sempre integrar `react-hook-form` com `@hookform/resolvers/zod` utilizando os schemas centralizados em `@/schemas`.
- **API Endpoints**: Validar obrigatoriamente a requisição no servidor com `schema.safeParse(body)`. Se `!result.success`, retornar HTTP status `422` ou `400` com os detalhes dos erros (`result.error.flatten()`).

### Tratamento de Erros
- Todos os handlers de rotas no servidor (`src/server/...`) devem estar envolvidos por blocos `try/catch`.
- Erros de autenticação retornam HTTP status `401`.
- Erros de permissão/autorização retornam HTTP status `403`.
- Falhas de validação de dados retornam HTTP status `422` ou `400`.
- Falhas inesperadas retornam HTTP status `500` no formato json:
  ```json
  {
    "success": false,
    "message": "Ocorreu um erro interno."
  }
  ```

---

## 6. Fluxo de Desenvolvimento

### Como Executar o Projeto Localmente

1. **Clonar o Repositório e Instalar Dependências**:
   ```bash
   npm install
   ```

2. **Configurar Variáveis de Ambiente**:
   Verifique o arquivo `.env` na raiz do projeto contendo as credenciais de banco e chave JWT:
   ```env
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=sua_senha
   POSTGRES_DB=approvalflow
   DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/approvalflow?schema=public
   JWT_SECRET=seu_segredo_jwt_super_seguro
   ```

3. **Subir o Banco de Dados com Docker**:
   ```bash
   docker-compose up -d
   ```

4. **Gerar o Cliente Prisma e Executar Migrações / Seed**:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Iniciar o Servidor de Desenvolvimento**:
   ```bash
   npm run dev
   ```
   A aplicação estará acessível em `http://localhost:3000`.

### Como Adicionar Novas Funcionalidades

1. **Definir/Atualizar o Banco de Dados**:
   - Edite `prisma/schema.prisma` se forem necessários novos modelos ou campos.
   - Execute `npx prisma migrate dev --name nome_da_migracao` para aplicar no banco e atualizar os tipos do Prisma em `generated/prisma`.

2. **Criar o Schema de Validação (Zod)**:
   - Adicione os novos schemas de validação em `src/schemas/`.

3. **Criar o Handler no Servidor**:
   - Crie o arquivo de regras de negócio em `src/server/<modulo>/<acao>.routes.ts`.
   - Adicione verificações de sessão (`getCurrentUser()`) e autorização de role.

4. **Exportar a Rota na API**:
   - Crie o diretório em `src/app/api/<modulo>/.../route.ts` re-exportando o método da rota (`export { POST } from "@/server/..."`).

5. **Criar os Componentes de UI**:
   - Crie a view correspondente em `src/features/<modulo>/pages/`.
   - Registre as permissões de rota em `src/config/roles.ts` e `src/lib/permissions.ts` se uma nova página protegida for introduzida.

### Execução de Testes
> ⚠️ **Informação Importante**: O projeto atualmente não possui uma suíte de testes automatizados (Jest/Vitest/Playwright) configurada no `package.json`. Alterações no código devem ser validadas manualmente através da navegação web ou via chamadas HTTP (Thunder Client / Postman).

### Processo de Build e Deploy
- **Build de Produção**:
  ```bash
  npm run build
  ```
- **Execução em Produção**:
  ```bash
  npm run start
  ```
- **Containerização**: O arquivo `Dockerfile` na raiz permite a compilação e execução da aplicação em containers Node 22 Alpine.

---

## 7. Estrutura do Banco de Dados

### Modelos e Relacionamentos (Prisma ORM)

```mermaid
erdiagram
    users ||--o{ tasks : "created_by / approver_id"
    users ||--o{ task_history : "user_id"
    users ||--o{ notifications : "user_id"
    users }|--|| departments : "department_id"
    users ||--o{ user_approvable_departments : "user_id"
    departments ||--o{ tasks : "department_id"
    departments ||--o{ user_approvable_departments : "department_id"
    tasks ||--o{ task_history : "task_id"
```

1. **`users`**:
   - `id` (UUID, PK)
   - `name`, `email` (Unique), `password_hash`
   - `role` (Enum `user_role`: `colaborador`, `aprovador`, `admin`)
   - `department_id` (FK para `departments`)
   - `is_approver` (Boolean)
   - Configurações de notificação (`email_notifications`, `push_notifications`, `notify_task_created`, etc.)

2. **`departments`**:
   - `id` (UUID, PK)
   - `name` (Unique), `description`, `color` (VarChar 7 - código hex)

3. **`tasks`**:
   - `id` (UUID, PK)
   - `title`, `description`
   - `department_id` (FK para `departments`)
   - `status` (Enum `task_status`: `pendente`, `aprovada`, `rejeitada`, `concluida`)
   - `created_by` (FK para `users`)
   - `desired_date` (Date)
   - `approver_id` (FK para `users`, opcional)
   - `approved_at`, `rejected_at`, `rejection_reason`

4. **`task_history`**:
   - `id` (UUID, PK)
   - `task_id` (FK para `tasks`)
   - `action` (Enum `task_action`: `criada`, `aprovada`, `rejeitada`, `editada`, `reenviada`)
   - `date` (DateTime)
   - `user_id` (FK para `users`), `user_name`, `comment`

5. **`user_approvable_departments`** (Tabela Pivot):
   - `user_id` (FK para `users`), `department_id` (FK para `departments`)
   - PK Composta (`user_id`, `department_id`)

6. **`notifications`**:
   - `id` (UUID, PK)
   - `user_id` (FK para `users`)
   - `title`, `message`, `read` (Boolean)
   - `type` (Enum `notification_type`: `info`, `success`, `warning`, `error`)

### Convenções do Banco de Dados
- Nomes de tabelas e colunas usam estritamente `snake_case`.
- Chaves primárias usam UUID gerado pelo PostgreSQL (`gen_random_uuid()`).
- Índices são definidos explicitamente no Prisma (`idx_tasks_status`, `idx_notifications_user_unread`, etc.).

---

## 8. Integrações Externas

- **Vercel Analytics (`@vercel/analytics`)**:
  Integrado no `RootLayout` (`src/app/layout.tsx`) para telemetria de tráfego e performance em ambiente de produção Vercel.
- **Dicebear API (`https://api.dicebear.com/`)**:
  Utilizado para geração dinâmica de avatares com base no nome do usuário durante o seed/testes.
- **Outros Serviços**:
  Não foram identificadas integrações com serviços externos de e-mail (SendGrid/Resend), armazenamento S3, filas de mensageria (RabbitMQ/Redis) ou Webhooks. A autenticação e os dados são 100% gerenciados internamente no banco PostgreSQL.

---

## 9. Regras de Negócio

1. **Criação de Tarefa**:
   - Toda tarefa deve obrigatoriamente possuir título, descrição, departamento de destino e data desejada.
   - A data desejada não pode ser retroativa (deve ser a data atual ou futura).
   - O status inicial de qualquer nova tarefa é inalteravelmente `pendente`.
   - Ao ser criada, deve ser inserido automaticamente um registro correspondente na tabela `task_history` com a ação `criada`.

2. **Aprovação e Rejeição**:
   - Apenas usuários com papel `aprovador` ou `admin` que tenham permissão de aprovação no departamento da tarefa podem aprovar ou rejeitar solicitações.
   - Ao aprovar, o status muda para `aprovada`, salva-se o `approver_id` e a data em `approved_at`.
   - Ao rejeitar, é obrigatório registrar a justificativa (`comment` ou `rejection_reason`), o status muda para `rejeitada` e grava-se `rejected_at`.

3. **Edição e Reenvio**:
   - Edições em tarefas existentes alteram o status de volta para `pendente` e geram históricos de ação `editada` ou `reenviada`.

4. **Controle de Acesso por Departamento**:
   - Um colaborador visualiza tarefas criadas por ele ou vinculadas ao seu próprio departamento.
   - Um aprovador visualiza e atua apenas nas tarefas dos setores cadastrados em `user_approvable_departments`.
   - Um admin possui acesso global irrestrito a todas as tarefas, departamentos e usuários.

5. **Gerenciamento de Setores e Usuários**:
   - Nomes de departamentos devem ser únicos na organização.
   - A exclusão de um departamento ou usuário aplica exclusão em cascata em relacionamentos configurados (`notifications`, `user_approvable_departments`), preservando históricos e tarefas vinculadas.

---

## 10. Pontos de Atenção

### Limitações Atuais
- **Sem Upload de Arquivos/Anexos**: O sistema atualmente gerencia apenas descrições em texto, sem suporte a upload de documentos comprobatórios ou orçamentos.
- **Notificações Limitadas à Interface**: Embora existam flags no perfil de usuário para notificações por e-mail e push, a infraestrutura para envio externo real de e-mails/push não está integrada.

### Débitos Técnicos
- **Ausência de Testes Automatizados**: Não há testes de unidade nem testes de integração configurados no projeto.
- **Geração de Tipos Prisma Fora de `node_modules`**: O cliente Prisma está sendo gerado na pasta customizada `generated/prisma`. É essencial garantir que o comando `prisma generate` seja executado no build de ambiente.
- **Valores Padrão de Chaves no `.env`**: O repositório contém um arquivo `.env` com valores de demonstração (`JWT_SECRET` estático). Em ambientes de produção reais, estes valores devem ser obrigatoriamente sobrescritos.

### Áreas Sensíveis do Projeto
- **`src/middleware.ts`**: Alterações incorretas neste arquivo podem comprometer toda a segurança do sistema ou gerar loops de redirecionamento.
- **`src/lib/auth.ts`**: Lógica de verificação e criação de JWTs e hash de senhas.
- **`src/config/roles.ts`**: Mapeamento central de permissões de rotas por role. Alterações incompletas podem bloquear o acesso de usuários a telas essenciais ou liberar acessos indevidos.

---

## 11. Instruções para Agentes de IA

Para manter a integridade, consistência e qualidade do código ao atuar neste repositório, todo agente de IA **deve seguir rigorosamente as seguintes diretrizes**:

### 1. Manutenção da Arquitetura de Rotas
- **NUNCA** coloque lógica de banco de dados ou regras de negócio pesadas diretamente nos arquivos `src/app/api/.../route.ts`.
- Mantenha o padrão existente: crie a lógica no diretório `src/server/<modulo>/` e re-exporte o handler no arquivo `route.ts`.

### 2. Validação e Tipagem
- **SEMPRE** crie ou atualize os schemas de validação Zod em `src/schemas/` ao adicionar novos endpoints ou formulários.
- Utilize a função `.safeParse()` para validar corpos de requisições no servidor.
- Não utilize o tipo `any`. Importe ou estenda as interfaces em `src/interfaces/`.

### 3. Modificações de Banco de Dados
- Não altere tabelas no banco de dados sem atualizar o arquivo `prisma/schema.prisma` e gerar as respectivas migrações.
- Lembre-se de que o Prisma Client está configurado para o output `../generated/prisma`. Não tente importá-lo diretamente de `@prisma/client` caso ocorra divergência de tipos. Importe de `@/lib/prisma`.

### 4. Transações do Banco de Dados
- Para operações que envolvem múltiplas inserções/atualizações conectadas (como criar uma tarefa e registrar seu histórico), **SEMPRE** utilize `prisma.$transaction(...)`.

### 5. Estilização e UI
- Utilize os componentes customizados existentes em `src/components/ui/` (`CustomButton`, `CustomInput`, `CustomModal`, `CustomSelect`) para manter a coerência visual.
- Não introduza novas bibliotecas de UI concorrentes (como Shadcn, Material UI ou Chakra UI) sem solicitação explícita.
- Respeite o suporte a modo escuro utilizando classes do Tailwind integradas ao design system (`bg-background`, `text-foreground`, `border-border`, etc.).

### 6. Idioma e Padrão de Respostas
- Todas as mensagens de erro, alertas de validação, toasts e conteúdos exibidos ao usuário na interface **devem ser mantidos em Português do Brasil (pt-BR)**.
- O código-fonte (variáveis, funções, componentes) deve ser escrito em Inglês (ou manter a convenção mista existente do projeto como `department_id`, `created_at`).

---
*Documentação gerada automaticamente para orientação técnica de Agentes de IA em 05/08/2026.*
