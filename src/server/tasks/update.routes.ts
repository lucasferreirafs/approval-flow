import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/get-current-user"
import prisma from "@/lib/prisma"
import { formTaskApiSchema } from "@/schemas"

export async function PUT(request: Request) {
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

      // Validação dos dados de entrada
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

      // Validação do taskId (obrigatório para atualização)
      if (!data.taskId) {
         return NextResponse.json(
            {
               success: false,
               message: "ID da tarefa é obrigatório.",
            },
            { status: 400 }
         )
      }

      const desiredDate = new Date(data.desiredDate)

      // Verificação de existência da tarefa e autorização de autoria
      const existingTask = await prisma.tasks.findUnique({
         where: { id: data.taskId },
         select: {
            id: true,
            title: true,
            created_by: true,
            department_id: true,
            status: true,
         },
      })

      if (!existingTask) {
         return NextResponse.json(
            {
               success: false,
               message: "Tarefa não encontrada.",
            },
            { status: 404 }
         )
      }

      // Apenas o criador da tarefa ou um administrador pode editá-la
      if (existingTask.created_by !== user.id && user.role !== "admin") {
         return NextResponse.json(
            {
               success: false,
               message: "Você não tem permissão para editar esta tarefa.",
            },
            { status: 403 }
         )
      }

      // Validação de existência do departamento de destino
      const departmentExists = await prisma.departments.findUnique({
         where: { id: data.department_id },
         select: { id: true },
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

      // Transação atômica para atualização da tarefa, histórico e notificações
      const { updatedTask, newHistory, createdNotificationsCount } =
         await prisma.$transaction(async (tx) => {
            // Atualiza os dados da tarefa e redefine o status para 'pendente'
            const updatedTask = await tx.tasks.update({
               where: { id: data.taskId },
               data: {
                  title: data.title,
                  description: data.description,
                  department_id: data.department_id,
                  desired_date: desiredDate,
                  status: "pendente",
                  approver_id: null,
                  approved_at: null,
                  rejected_at: null,
                  rejection_reason: null,
               },
            })

            // Registra a ação no histórico
            // A ação é 'reenviada' se o status anterior era rejeitada, caso contrário 'editada'
            const historyAction =
               existingTask.status === "rejeitada" ? "reenviada" : "editada"
            const historyComment =
               existingTask.status === "rejeitada"
                  ? "Tarefa corrigida e reenviada para aprovação."
                  : "Tarefa editada pelo usuário."

            const newHistory = await tx.task_history.create({
               data: {
                  task_id: data.taskId!,
                  action: historyAction,
                  user_id: user.id,
                  user_name: user.name,
                  comment: historyComment,
               },
            })

            // Busca aprovadores do departamento de destino com notify_task_created ativado
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

            // Monta e envia as notificações em lote para os aprovadores elegíveis
            const uniqueApproverIds = Array.from(
               new Set(approvers.map((a) => a.id).filter((id) => id !== user.id))
            )

            let createdNotificationsCount = 0
            if (uniqueApproverIds.length > 0) {
               const notificationTitle =
                  historyAction === "reenviada"
                     ? "Tarefa Reenviada para Aprovação"
                     : "Tarefa Editada — Aguarda Aprovação"

               const notificationMessage =
                  historyAction === "reenviada"
                     ? `A tarefa "${updatedTask.title}" foi corrigida por ${user.name} e reenviada para aprovação.`
                     : `A tarefa "${updatedTask.title}" foi editada por ${user.name} e aguarda nova análise.`

               const batchResult = await tx.notifications.createMany({
                  data: uniqueApproverIds.map((approverId) => ({
                     user_id: approverId,
                     title: notificationTitle,
                     message: notificationMessage,
                     type: "info" as const,
                  })),
               })
               createdNotificationsCount = batchResult.count
            }

            return { updatedTask, newHistory, createdNotificationsCount }
         })

      return NextResponse.json(
         {
            success: true,
            message: "Tarefa atualizada com sucesso.",
            data: {
               task: updatedTask,
               history: newHistory,
               notificationsCreated: createdNotificationsCount,
            },
         },
         { status: 200 }
      )
   } catch (error: unknown) {
      console.error("Erro ao atualizar tarefa:", error)
      return NextResponse.json(
         {
            success: false,
            message: "Ocorreu um erro interno ao atualizar a tarefa.",
            error: process.env.NODE_ENV === "development"
               ? (error instanceof Error ? error.message : "Erro desconhecido")
               : undefined,
         },
         { status: 500 }
      )
   }
}
