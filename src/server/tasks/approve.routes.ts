import { jsonResponse } from "@/lib/api-response"
import { getCurrentUser } from "@/lib/get-current-user"
import prisma from "@/lib/prisma"
import { taskHistorySchema } from "@/schemas"

export async function POST(request: Request) {
   try {
      // Autenticação do usuário
      const user = await getCurrentUser()
      if (!user) {
         return jsonResponse(
            {
               success: false,
               message: "Usuário não autenticado.",
            },
            { status: 401 }
         )
      }

      // Autorização: Apenas aprovadores ou administradores podem aprovar tarefas
      if (user.role !== "admin" && user.role !== "aprovador") {
         return jsonResponse(
            {
               success: false,
               message: "Você não tem permissão para aprovar tarefas.",
            },
            { status: 403 }
         )
      }

      // Validação dos dados de entrada
      const body = await request.json()
      const result = taskHistorySchema.safeParse(body)

      if (!result.success) {
         return jsonResponse(
            {
               success: false,
               message: "Informações inválidas.",
               errors: result.error.flatten().fieldErrors,
            },
            { status: 422 }
         )
      }

      const { data } = result

      // Verificação de existência da tarefa
      const existingTask = await prisma.tasks.findUnique({
         where: { id: data.taskId },
         select: {
            id: true,
            title: true,
            created_by: true,
            status: true,
         },
      })

      if (!existingTask) {
         return jsonResponse(
            {
               success: false,
               message: "Tarefa não encontrada.",
            },
            { status: 404 }
         )
      }

      // Transação atômica para atualização da tarefa, histórico e notificação
      const { updatedTask, newHistory } = await prisma.$transaction(async (tx) => {
         // Atualiza o status da tarefa para 'aprovada'
         const updatedTask = await tx.tasks.update({
            where: { id: data.taskId },
            data: {
               status: "aprovada",
               approver_id: user.id,
               approved_at: new Date(),
               rejected_at: null,
               rejection_reason: null,
            },
         })

         // Registra a ação no histórico da tarefa
         const newHistory = await tx.task_history.create({
            data: {
               task_id: data.taskId,
               action: "aprovada",
               user_id: user.id,
               user_name: user.name,
               comment: data.comment || null,
            },
         })

         // Busca a preferência de notificação do criador da tarefa
         const creator = await tx.users.findUnique({
            where: { id: existingTask.created_by },
            select: { id: true, notify_task_approved: true },
         })

         // Cria a notificação para o criador se notify_task_approved for true
         if (creator?.notify_task_approved) {
            const commentDetails = data.comment ? ` Comentário: "${data.comment}"` : ""
            await tx.notifications.create({
               data: {
                  user_id: existingTask.created_by,
                  title: "Tarefa Aprovada",
                  message: `Sua tarefa "${existingTask.title}" foi aprovada por ${user.name}.${commentDetails}`,
                  type: "success",
               },
            })
         }

         return { updatedTask, newHistory }
      })

      return jsonResponse(
         {
            success: true,
            message: "Tarefa aprovada com sucesso!",
            data: {
               task: updatedTask,
               history: newHistory,
            },
         },
         { status: 200 }
      )
   } catch (error: unknown) {
      console.error("Erro ao aprovar tarefa:", error)
      return jsonResponse(
         {
            success: false,
            message: "Ocorreu um erro interno ao aprovar a tarefa.",
            error: process.env.NODE_ENV === "development"
               ? (error instanceof Error ? error.message : "Erro desconhecido")
               : undefined,
         },
         { status: 500 }
      )
   }
}

