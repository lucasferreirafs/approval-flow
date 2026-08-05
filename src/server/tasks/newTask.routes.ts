import { NextResponse } from "next/server"
import { formTaskApiSchema } from "@/schemas"
import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/get-current-user"

export async function POST(request: Request) {
   try {
      // Autenticação do usuário
      const user = await getCurrentUser()
      if (!user) {
         return NextResponse.json(
            {
               success: false,
               message: "Usuário não autenticado.",
            },
            { status: 401 }
         )
      }

      // Leitura e validação dos dados de entrada
      const body = await request.json()
      const result = formTaskApiSchema.safeParse(body)

      if (!result.success) {
         return NextResponse.json(
            {
               success: false,
               message: "Informações inválidas.",
               errors: result.error.flatten().fieldErrors,
            },
            { status: 422 }
         )
      }

      const { data } = result
      const desiredDate = new Date(data.desiredDate)

      // Validação de existência do departamento
      const departmentExists = await prisma.departments.findUnique({
         where: { id: data.department_id },
         select: { id: true, name: true },
      })

      if (!departmentExists) {
         return NextResponse.json(
            {
               success: false,
               message: "Departamento informado não foi encontrado.",
            },
            { status: 404 }
         )
      }

      // Execução das operações em uma transação atômica
      const { newTask, newHistory, createdNotificationsCount } = await prisma.$transaction(async (tx) => {
         // Criação da tarefa
         const newTask = await tx.tasks.create({
            data: {
               title: data.title,
               description: data.description,
               department_id: data.department_id,
               desired_date: desiredDate,
               created_by: user.id,
            },
         })

         //Registro no histórico da tarefa
         const newHistory = await tx.task_history.create({
            data: {
               task_id: newTask.id,
               action: "criada",
               user_id: user.id,
               user_name: user.name,
            },
         })

         // Consulta de preferências de notificação do criador
         const creator = await tx.users.findUnique({
            where: { id: user.id },
            select: { id: true, name: true, notify_task_created: true },
         })
         // Consulta dos aprovadores do departamento que têm "notify_task_created" ativado
         const approvers = await tx.users.findMany({
            where: {
               notify_task_created: true,
               OR: [
                  {
                     user_approvable_departments: {
                        some: { department_id: data.department_id },
                     },
                  },
                  {
                     department_id: data.department_id,
                     OR: [
                        { is_approver: true },
                        { role: { in: ["aprovador", "admin"] } },
                     ],
                  },
               ],
            },
            select: { id: true },
         })

         // Montagem da lista de notificações a serem geradas
         const notificationsToCreate: Array<{
            user_id: string
            title: string
            message: string
            type: "info" | "success" | "warning" | "error"
         }> = []

         // Notificação para o criador da tarefa (se notify_task_created for true)
         if (creator?.notify_task_created) {
            notificationsToCreate.push({
               user_id: user.id,
               title: "Tarefa Criada",
               message: `Sua tarefa "${newTask.title}" foi criada com sucesso.`,
               type: "success",
            })
         }

         // Notificação para os aprovadores elegíveis (excluindo o criador, se for o caso)
         const uniqueApproverIds = Array.from(
            new Set(approvers.map((a) => a.id).filter((id) => id !== user.id))
         )

         for (const approverId of uniqueApproverIds) {
            notificationsToCreate.push({
               user_id: approverId,
               title: "Nova Tarefa para Aprovação",
               message: `Uma nova tarefa "${newTask.title}" foi criada por ${creator?.name || user.name} e aguarda aprovação.`,
               type: "info",
            })
         }

         // // Inserção em lote (batch insert) de todas as notificações
         let createdNotificationsCount = 0
         if (notificationsToCreate.length > 0) {
            const batchResult = await tx.notifications.createMany({
               data: notificationsToCreate,
            })
            createdNotificationsCount = batchResult.count
         }

         return { newTask, newHistory, createdNotificationsCount }
      })

      return NextResponse.json(
         {
            success: true,
            message: "Tarefa criada com sucesso!",
            data: {
               task: newTask,
               history: newHistory,
               notificationsCreated: createdNotificationsCount,
            },
         },
         { status: 201 }
      )
   } catch (error: unknown) {
      console.error("Erro ao criar tarefa:", error)
      return NextResponse.json(
         {
            success: false,
            message: "Ocorreu um erro interno ao criar a tarefa.",
            error: process.env.NODE_ENV === "development"
               ? (error instanceof Error ? error.message : "Erro desconhecido")
               : undefined,
         },
         { status: 500 }
      )
   }
}
