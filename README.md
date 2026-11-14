# 📋 ApprovalFlow

> **Sistema Corporativo de Gestão de Demandas com Fluxo Departamental de Aprovação e Trilha de Auditoria.**

![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-7.8.0-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?style=for-the-badge&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker)

<br />

<div align="center">
  <img src="docs/screenshots/dashboard.png" alt="ApprovalFlow - Dashboard Principal" width="100%" />
</div>

---

## 📌 Sumário

1. [Sobre o Projeto](#-sobre-o-projeto)
2. [Demonstração Visual](#-demonstração-visual)
3. [Problema que o Sistema Resolve](#-problema-que-o-sistema-resolve)
4. [Perfis de Acesso (RBAC)](#-perfis-de-acesso-rbac)
5. [Principais Funcionalidades](#-principais-funcionalidades)
6. [Arquitetura e Estrutura de Diretórios](#-arquitetura-e-estrutura-de-diretórios)
7. [Fluxo de Aprovação](#-fluxo-de-aprovação)
8. [Modelo de Dados (Diagrama E-R)](#-modelo-de-dados-diagrama-e-r)
9. [Stack Tecnológica](#-stack-tecnológica)
10. [Pré-requisitos](#-pré-requisitos)
11. [Guia de Instalação e Execução](#-guia-de-instalação-e-execução)
12. [Variáveis de Ambiente](#-variáveis-de-ambiente)
13. [Rotas e Endpoints da API](#-rotas-e-endpoints-da-api)
14. [Scripts Disponíveis](#-scripts-disponíveis)
15. [Padrões de Desenvolvimento](#-padrões-de-desenvolvimento)

---

## 💡 Sobre o Projeto

O **ApprovalFlow** é uma plataforma corporativa completa desenvolvida para padronizar, gerenciar e auditar o ciclo de vida de solicitações internas (como demandas de compras, contratações, permissões de TI, suporte operacional e reembolsos).

O sistema implementa uma camada rigorosa de **Controle de Acesso Baseado em Funções (RBAC)**, separando responsabilidades entre quem solicita, quem aprova e quem administra a infraestrutura organizacional, garantindo transparência por meio de um histórico auditável imutável (*audit trail*).

---

## 📸 Demonstração Visual

### 📊 Dashboard Analítico (Visão do Administrador)
*Métricas da organização em tempo real, indicadores operacionais (KPIs), taxa de aprovação e gráfico analítico de distribuição de tarefas por status.*
![Dashboard Analítico](docs/screenshots/dashboard.png)

<br />

### ✍️ Central de Aprovações (Fila Departamental)
*Fila com as solicitações pendentes de avaliação para os setores sob responsabilidade do usuário, com ações rápidas para Aprovar ou Rejeitar (com justificativa).*
![Fila de Aprovações](docs/screenshots/approvals.png)

<br />

### 🔐 Autenticação e Segurança
*Interface de acesso corporativo com suporte a temas Claro e Escuro, validação de credenciais e proteção via cookies httpOnly.*
![Tela de Login](docs/screenshots/preview.png)

---

## 🎯 Problema que o Sistema Resolve

Em muitas organizações, aprovações ocorrem por canais descentralizados (e-mails, mensagens instantâneas ou planilhas soltas), acarretando:
- **Perda de rastreabilidade:** Dificuldade em saber quem aprovou, quando e sob quais justificativas.
- **Gargalos operacionais:** Demandas esquecidas sem cumprimento de prazos desejados.
- **Vulnerabilidades de governança:** Falta de segregação clara de alçadas por departamento.
- **Ausência de métricas:** Inexistência de dados consolidados sobre volume e tempo de resposta por setor.

O **ApprovalFlow** centraliza todo esse fluxo com formulários padronizados, delegação de aprovadores por departamento e dashboards analíticos com métricas em tempo real.

---

## 👥 Perfis de Acesso (RBAC)

O sistema conta com três níveis de acesso com permissões e visões personalizadas:

| Perfil | Identificador | Responsabilidades e Acessos |
| :--- | :--- | :--- |
| **Colaborador** | `colaborador` | Cria solicitações, acompanha o status de suas demandas em tempo real, edita/reenvia demandas rejeitadas e consulta seu histórico de auditoria. |
| **Aprovador** | `aprovador` | Acesso à fila de solicitações pendentes dos departamentos que gerencia. Pode **aprovar** ou **rejeitar** (com justificativa obrigatória) demandas do seu setor. |
| **Administrador** | `admin` | Acesso global irrestrito: gestão de departamentos (criação, edição e cores), gestão de usuários (atribuição de papéis e vínculos de aprovação), além de dashboards organizacionais com gráficos comparativos. |

---

## ✨ Principais Funcionalidades

### 🔐 Autenticação e Segurança
- Autenticação stateless baseada em **JWT (HS256)** via biblioteca `jose`.
- Armazenamento seguro de tokens em cookies `httpOnly`.
- Senhas criptografadas com hash forte via **BcryptJS** (fator de custo 12).
- Proteção e redirecionamento de rotas via **Next.js Middleware** com mapeamento de permissões centralizado.
- Página dedicada de Acesso Negado (`/403`).

### 📝 Gestão do Ciclo de Tarefas
- **Criação com Validação Rigorosa:** Validação via Zod (título, descrição, setor de destino e prazo não retroativo).
- **Trilha de Auditoria (*Audit Trail*):** Toda criação, alteração, aprovação ou rejeição gera um registro imutável em `task_history` contendo autor, data, ação e comentários.
- **Fluxo de Devolução:** Tarefas rejeitadas podem ser revisadas e reenviadas pelo solicitante, retornando ao estado `pendente`.

### 📊 Dashboards Analíticos por Papel
- **Colaborador:** Visão geral de tarefas pessoais divididas por status (Pendentes, Aprovadas, Rejeitadas).
- **Aprovador:** Fila prioritária de aprovações pendentes dos seus setores, histórico de decisões e tempo de resposta.
- **Admin:** Indicadores globais da empresa, gráficos de distribuição por status e volume de demandas por departamento desenvolvidos com `Recharts`.

### 🏢 Administração Organizacional (Admin)
- **Gestão de Departamentos:** Cadastro e edição de setores com seletor de paleta de cores HEX para identificação visual.
- **Gestão de Usuários:** Listagem de colaboradores, alteração de perfis de acesso e associação de departamentos que o usuário tem autorização para aprovar (`user_approvable_departments`).

### 🔔 Notificações e Experiência do Usuário
- Central de notificações in-app no cabeçalho com badges de status de leitura.
- Suporte nativo a **Modo Claro / Modo Escuro** via `next-themes`.
- Sistema customizado de feedback com toasts acessíveis (`toast-context`).

---

## 🏛️ Arquitetura e Estrutura de Diretórios

O projeto utiliza o **App Router** do Next.js combinado com uma arquitetura modular orientada a funcionalidades (*Feature-Driven*) e separação estrita de camadas de servidor:

```
approval-flow/
├── .env                       # Variáveis de ambiente da aplicação
├── Dockerfile                 # Configuração do container Node da aplicação
├── docker-compose.yaml        # Orquestração do banco PostgreSQL 17
├── next.config.ts             # Configuração do Next.js
├── prisma.config.ts           # Configuração de migrações e seed do Prisma ORM
├── prisma/
│   ├── schema.prisma          # Definição do schema, enums e relacionamentos
│   ├── seed.ts                # Povoamento inicial de departamentos, usuários e tarefas
│   └── migrations/            # Histórico versionado de migrações SQL
├── generated/
│   └── prisma/                # Cliente Prisma tipado gerado customizadamente
└── src/
    ├── app/                   # App Router do Next.js
    │   ├── (auth)/            # Rotas públicas (/login, /register)
    │   ├── (approvalflow)/    # Rotas protegidas por autenticação e RBAC
    │   │   ├── admin/         # Sub-rotas administrativas (/admin/departments, /admin/users)
    │   │   ├── approvals/     # Fila de aprovações do gestor (/approvals)
    │   │   ├── dashboard/     # Painel principal (/dashboard)
    │   │   ├── profile/       # Perfil e segurança do usuário (/profile)
    │   │   ├── settings/      # Preferências de notificação (/settings)
    │   │   └── tasks/         # Gestão de tarefas (/tasks, /tasks/new, /tasks/[id])
    │   ├── 403/               # Página de acesso negado
    │   ├── api/               # PONTOS DE ENTRADA HTTP (re-exportam handlers de @/server)
    │   ├── layout.tsx         # Root Layout com Providers (Tema, Toasts, Analytics)
    │   └── globals.css        # Variáveis CSS e tokens de estilo Tailwind
    ├── components/            # Componentes visuais reutilizáveis
    │   ├── charts/            # Componentes de gráficos (Recharts)
    │   ├── dashboard/         # Views específicas de dashboard por role
    │   ├── layout/            # Estrutura padrão (AppShell, Header, SideBar, AppLayout)
    │   └── ui/                # Componentes atômicos (CustomButton, CustomModal, CustomInput, etc.)
    ├── config/                # Mapeamento de rotas e roles (roles.ts)
    ├── contexts/              # Context API (session-context, toast-context)
    ├── features/              # Páginas e lógicas encapsuladas por funcionalidade
    ├── interfaces/            # Contratos e tipos TypeScript
    ├── lib/                   # Utilitários de infraestrutura (prisma, auth, permissions, api-response)
    ├── schemas/               # Schemas de validação Zod (task, user, department, auth)
    ├── server/                # REGRAS DE NEGÓCIO E HANDLERS DA API
    │   ├── auth/              # Handlers de login, logout, registro
    │   ├── departments/       # Lógica de setores
    │   ├── notifications/     # Lógica de notificações
    │   ├── tasks/             # Lógica de criação, atualização e aprovação
    │   └── users/             # Lógica de consulta e atualização de usuários
    └── utils/                 # Funções utilitárias puras (datas, formatação)
```

> **Regra de Ouro da Arquitetura:** Os arquivos em `src/app/api/.../route.ts` apenas exportam os manipuladores implementados em `src/server/...`, mantendo a camada de transporte desacoplada da regra de negócio.

---

## 🔄 Fluxo de Aprovação

```mermaid
flowchart TD
    A([Colaborador cria Solicitação]) --> B[Tarefa registrada como PENDENTE]
    B --> C[Audit Trail: Ação 'criada']
    C --> D{Aprovador avalia a tarefa}
    
    D -->|Aprovar| E[Status: APROVADA]
    E --> F[Audit Trail: Ação 'aprovada' + Comentário opcional]
    F --> G([Notificação de Sucesso ao Solicitante])
    
    D -->|Rejeitar| H[Status: REJEITADA]
    H --> I[Audit Trail: Ação 'rejeitada' + Motivo obrigatório]
    I --> J([Notificação de Recusa ao Solicitante])
    
    J --> K{Solicitante deseja ajustar?}
    K -->|Sim| L[Edição e Reenvio da Demanda]
    L --> M[Audit Trail: Ação 'reenviada']
    M --> B
    K -->|Não| N([Processo Encerrado])
```

---

## 🗄️ Modelo de Dados (Diagrama E-R)

```mermaid
erDiagram
    users {
        uuid id PK
        string name
        string email UK
        string password_hash
        user_role role
        uuid department_id FK
        boolean is_approver
        string avatar
        datetime created_at
    }

    departments {
        uuid id PK
        string name UK
        string description
        string color
        datetime created_at
    }

    tasks {
        uuid id PK
        string title
        string description
        uuid department_id FK
        task_status status
        uuid created_by FK
        date desired_date
        uuid approver_id FK
        datetime approved_at
        datetime rejected_at
        string rejection_reason
    }

    task_history {
        uuid id PK
        uuid task_id FK
        task_action action
        datetime date
        uuid user_id FK
        string user_name
        string comment
    }

    user_approvable_departments {
        uuid user_id PK,FK
        uuid department_id PK,FK
    }

    notifications {
        uuid id PK
        uuid user_id FK
        string title
        string message
        boolean read
        notification_type type
        datetime created_at
    }

    departments ||--o{ users : "possui"
    departments ||--o{ tasks : "recebe"
    departments ||--o{ user_approvable_departments : "autoriza"
    users ||--o{ tasks : "cria / aprova"
    users ||--o{ task_history : "executa"
    users ||--o{ notifications : "recebe"
    users ||--o{ user_approvable_departments : "tem_permissao"
    tasks ||--o{ task_history : "possui_historico"
```

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Detalhes |
| :--- | :--- | :--- |
| **Linguagem** | [TypeScript](https://www.typescriptlang.org/) `v5.9.3` | Tipagem estática em toda a aplicação. |
| **Framework Web** | [Next.js](https://nextjs.org/) `v16.2.9` | App Router, Server Actions / Route Handlers, Turbopack. |
| **Biblioteca de UI** | [React](https://react.dev/) `v19.2.4` | Componentes reativos e interfaces declarativas. |
| **Estilização** | [Tailwind CSS](https://tailwindcss.com/) `v4.0.0` | Design system baseado em utilitários e CSS moderno. |
| **Banco de Dados** | [PostgreSQL](https://www.postgresql.org/) `17` | Banco relacional robusto executado via Docker. |
| **ORM** | [Prisma ORM](https://www.prisma.io/) `v7.8.0` | Modelagem, migrações com `@prisma/adapter-pg` e client tipado. |
| **Formulários** | [React Hook Form](https://react-hook-form.com/) `v7.81.0` | Gerenciamento de estado de formulários com alta performance. |
| **Validação** | [Zod](https://zod.dev/) `v4.4.3` | Schemas de validação compartilhados entre client e server. |
| **Segurança & JWT** | [jose](https://github.com/panva/jose) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Assinatura/validação de tokens JWT e hash de senhas. |
| **Gráficos** | [Recharts](https://recharts.org/) `v3.9.1` | Visualização de dados analíticos nos dashboards. |
| **Ícones** | [Lucide React](https://lucide.dev/) | Ícones leves e customizáveis. |
| **Temas** | [Next Themes](https://github.com/pacocoursey/next-themes) | Alternância dinâmica entre Light e Dark mode. |
| **Containerização** | [Docker](https://www.docker.com/) & Docker Compose | Ambiente de banco de dados e build conteinerizado. |

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de possuir instalado em sua máquina:
- **Node.js** na versão `20.x` ou `22.x` (LTS recomendada).
- **npm** (incluso com o Node) ou gerenciador de pacotes equivalente.
- **Docker** e **Docker Compose** ativos para execução do banco de dados PostgreSQL.

---

## 🚀 Guia de Instalação e Execução

### 1. Clonar o Repositório
```bash
git clone https://github.com/lucasferreirafs/approval-flow.git
cd approval-flow
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar as Variáveis de Ambiente
Copie ou verifique o arquivo `.env` na raiz do projeto (detalhes na seção [Variáveis de Ambiente](#-variáveis-de-ambiente)):
```bash
# Exemplo básico em .env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=sua_senha
POSTGRES_DB=approvalflow
DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/approvalflow?schema=public
JWT_SECRET=sua_chave_secreta_jwt_de_pelo_menos_32_caracteres
```

### 4. Inicializar o Banco de Dados com Docker
Suba o container do PostgreSQL em segundo plano:
```bash
docker compose up -d
```

### 5. Executar Migrações e Povoar Dados Iniciais (Seed)
Gere os tipos do Prisma, execute as migrações no banco e insira dados fictícios de demonstração:
```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

> **Nota:** O script `seed.ts` criará automaticamente os setores padrão (*Tecnologia da Informação*, *Recursos Humanos* e *Financeiro*), além de usuários de exemplo, permissões de aprovação e tarefas demonstrativas.

### 6. Executar o Servidor de Desenvolvimento
Inicie a aplicação com o Next.js Turbopack:
```bash
npm run dev
```

Abra seu navegador e acesse: [http://localhost:3000](http://localhost:3000) (você será automaticamente redirecionado para a tela de `/login`).

---

## 🔑 Contas de Demonstração (Seed)

Após executar o comando `npx prisma db seed`, os seguintes usuários padrão estarão disponíveis no banco:

| Nome | E-mail | Senha Padrão | Perfil | Setor | Escopo de Aprovação |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Carlos Administrador** | `admin@empresa.com` | `admin123` | `admin` | Tecnologia da Informação | TI, RH e Financeiro |
| **Ana Silva** | `ana.rh@empresa.com` | `admin123` | `aprovador` | Recursos Humanos | Recursos Humanos |
| **Bruno Costa** | `bruno.ti@empresa.com` | `admin123` | `colaborador` | Tecnologia da Informação | — |
| **Diana Martins** | `diana.fin@empresa.com` | `admin123` | `colaborador` | Financeiro | — |

> 💡 **Dica de Acesso:** Você também pode utilizar a página de registro (`/register`) para criar uma nova conta de colaborador imediatamente.

---

## ⚙️ Variáveis de Ambiente

As configurações são definidas no arquivo `.env` na raiz do repositório:

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `POSTGRES_USER` | Usuário do banco PostgreSQL no container | `postgres` |
| `POSTGRES_PASSWORD` | Senha do usuário do PostgreSQL | `R8mK2vX7pL4n` |
| `POSTGRES_DB` | Nome do banco de dados relacional | `approvalflow` |
| `DATABASE_URL` | String de conexão completa utilizada pelo Prisma ORM | `postgresql://postgres:senha@localhost:5432/approvalflow?schema=public` |
| `JWT_SECRET` | Chave de alta entropia para assinatura dos tokens JWT | `cd4984219386f304451...` |

---

## 📡 Rotas e Endpoints da API

A camada de API do Next.js App Router expõe os seguintes serviços RESTful:

### Autenticação
- `POST /api/login` – Autentica credenciais e gera cookie com token JWT.
- `POST /api/register` – Cadastra um novo usuário como colaborador.
- `POST /api/logout` – Limpa a sessão e expira o cookie de autenticação.

### Tarefas
- `GET /api/tasks` – Lista tarefas com suporte a filtros por status e departamento.
- `POST /api/tasks/new` – Cria nova solicitação com validação e insere histórico inicial.
- `GET /api/tasks/[taskId]` – Retorna dados completos e linha do tempo de auditoria de uma tarefa.
- `PUT /api/tasks/update` – Atualiza os dados de uma tarefa e a devolve para reavaliação.
- `POST /api/tasks/approve` – Aprova a solicitação (exclusivo para aprovador/admin do setor).
- `POST /api/tasks/reject` – Rejeita a solicitação com justificativa registrada.
- `GET /api/tasks/taskUser/[id]` – Retorna as solicitações submetidas por um usuário específico.

### Departamentos
- `GET /api/departments` – Lista setores cadastrados e quantitativo de colaboradores.
- `POST /api/departments` – Cadastra um novo departamento com paleta de cor HEX (Admin).
- `PUT /api/departments/[departmentId]` – Atualiza informações de um setor existente (Admin).

### Usuários
- `GET /api/users` – Lista todos os usuários cadastrados na organização (Admin).
- `PUT /api/users/[userId]` – Altera papel, departamento e permissões de aprovação (Admin).
- `PUT /api/users/[userId]/update` – Atualiza informações de perfil do próprio usuário.
- `PUT /api/users/password` – Altera a senha do usuário com conferência da senha atual.

### Notificações
- `GET /api/notifications` – Lista notificações recentes do usuário autenticado.
- `PUT /api/notifications/read-all` – Marca todas as notificações do usuário como lidas.
- `PUT /api/notifications/[id]/read` – Marca uma notificação individual como lida.

---

## 📜 Scripts Disponíveis

No arquivo `package.json`, estão configurados os seguintes comandos:

```bash
# Iniciar o servidor de desenvolvimento com Next.js Turbopack
npm run dev

# Gerar o build otimizado para produção
npm run build

# Executar a aplicação em modo de produção após o build
npm run start

# Executar verificação estática de código com o ESLint
npm run lint
```

Comandos adicionais úteis do Prisma:
```bash
# Abrir o visualizador visual de tabelas Prisma Studio
npx prisma studio

# Criar e aplicar uma nova migração a partir do schema.prisma
npx prisma migrate dev --name nome_da_migracao

# Executar o seed do banco de dados manualmente
npx prisma db seed
```

---

## 📐 Padrões de Desenvolvimento

Para colaborar ou estender o projeto, observe as seguintes convenções:

1. **Camada de Regras de Negócio:** Mantenha os arquivos `route.ts` finos, delegando a lógica para `src/server/<modulo>/`.
2. **Validação com Zod:** Todas as entradas da API e formulários de interface devem passar por validação com schemas em `src/schemas/`.
3. **Transações Atômicas:** Sempre que uma operação exigir alterações múltiplas (ex: criar tarefa + registrar histórico), utilize `prisma.$transaction(...)`.
4. **Design System Consistente:** Reutilize os componentes atômicos em `src/components/ui/` (`CustomButton`, `CustomInput`, `CustomModal`, `CustomSelect`).
5. **Idioma:** Todas as mensagens de erro, alertas de interface e textos voltados ao usuário devem ser em **Português do Brasil (pt-BR)**.

---

## 📄 Licença

Este projeto é de uso privado / corporativo. Todos os direitos reservados.
