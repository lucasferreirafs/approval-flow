import prisma from "@/lib/prisma"

async function main() {
  console.log('Iniciando a inserção de dados fictícios...')

  // 1. Criando Departamentos
  const ti = await prisma.departments.create({
    data: {
      name: 'Tecnologia da Informação',
      description: 'Responsável pela infraestrutura, suporte e desenvolvimento.',
      color: '#1E3A8A',
    },
  })

  const rh = await prisma.departments.create({
    data: {
      name: 'Recursos Humanos',
      description: 'Gestão de pessoas, talentos e cultura organizacional.',
      color: '#10B981',
    },
  })

  const financeiro = await prisma.departments.create({
    data: {
      name: 'Financeiro',
      description: 'Planejamento financeiro e controladoria.',
      color: '#F59E0B',
    },
  })

  // 2. Criando Usuários
  const admin = await prisma.users.create({
    data: {
      name: 'Carlos Administrador',
      email: 'admin@empresa.com',
      password_hash: '$2b$10$wEfeK3gH88yRDeK1234567uehGkL90pQrStUvWxYzAaBbCcDdEeFf', // Hash simulado
      role: 'admin',
      department_id: ti.id,
      is_approver: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    },
  })

  const ana = await prisma.users.create({
    data: {
      name: 'Ana Silva',
      email: 'ana.rh@empresa.com',
      password_hash: '$2b$10$wEfeK3gH88yRDeK1234567uehGkL90pQrStUvWxYzAaBbCcDdEeFf',
      role: 'aprovador',
      department_id: rh.id,
      is_approver: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    },
  })

  const bruno = await prisma.users.create({
    data: {
      name: 'Bruno Costa',
      email: 'bruno.ti@empresa.com',
      password_hash: '$2b$10$wEfeK3gH88yRDeK1234567uehGkL90pQrStUvWxYzAaBbCcDdEeFf',
      role: 'colaborador',
      department_id: ti.id,
      is_approver: false,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bruno',
    },
  })

  const diana = await prisma.users.create({
    data: {
      name: 'Diana Martins',
      email: 'diana.fin@empresa.com',
      password_hash: '$2b$10$wEfeK3gH88yRDeK1234567uehGkL90pQrStUvWxYzAaBbCcDdEeFf',
      role: 'colaborador',
      department_id: financeiro.id,
      is_approver: false,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
    },
  })

  // 3. Vinculando departamentos que o usuário pode aprovar
  await prisma.user_approvable_departments.createMany({
    data: [
      { user_id: admin.id, department_id: ti.id },
      { user_id: admin.id, department_id: rh.id },
      { user_id: admin.id, department_id: financeiro.id },
      { user_id: ana.id, department_id: rh.id },
    ],
  })

  // 4. Criando uma tarefa concluída/aprovada e seu histórico
  const tarefa1 = await prisma.tasks.create({
    data: {
      title: 'Comprar Licenças do Windows',
      description: 'Necessitamos de 10 novas licenças para os computadores dos estagiários.',
      department_id: ti.id,
      status: 'aprovada',
      created_by: bruno.id,
      desired_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 dias no futuro
      approver_id: admin.id,
      approved_at: new Date(),
    },
  })

  await prisma.task_history.createMany({
    data: [
      {
        task_id: tarefa1.id,
        action: 'criada',
        user_id: bruno.id,
        user_name: bruno.name,
        comment: 'Criação inicial do pedido de licenças.',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        task_id: tarefa1.id,
        action: 'aprovada',
        user_id: admin.id,
        user_name: admin.name,
        comment: 'Aprovado, orçamento disponível no centro de custo da TI.',
        date: new Date(),
      },
    ],
  })

  // 5. Criando uma tarefa pendente
  const tarefa2 = await prisma.tasks.create({
    data: {
      title: 'Contratar Plataforma de Clima',
      description: 'Solicitação de orçamento de software para pesquisa de clima organizacional.',
      department_id: rh.id,
      status: 'pendente',
      created_by: ana.id,
      desired_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.task_history.create({
    data: {
      task_id: tarefa2.id,
      action: 'criada',
      user_id: ana.id,
      user_name: ana.name,
      comment: 'Solicitação inicial enviada para avaliação.',
    },
  })

  // 6. Criando Notificações para os usuários
  await prisma.notifications.createMany({
    data: [
      {
        user_id: bruno.id,
        title: 'Tarefa Aprovada',
        message: 'Sua tarefa "Comprar Licenças do Windows" foi aprovada por Carlos Administrador.',
        read: true,
        type: 'success',
      },
      {
        user_id: diana.id,
        title: 'Tarefa Rejeitada',
        message: 'Sua tarefa "Ajuste de Balancete Mensal" foi rejeitada por falta de documentos.',
        read: false,
        type: 'error',
      },
    ],
  })

  console.log('Todos os dados fictícios foram populados com sucesso!')
}
main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })