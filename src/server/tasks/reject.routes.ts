import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/get-current-user"
import prisma from "@/lib/prisma"
import { taskHistorySchema } from "@/schemas"

export async function POST(request: Request) {
   try {
      // 1. Autenticação do usuário
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

      // Autorização: Apenas aprovadores ou administradores podem rejeitar tarefas
      if (user.role !== "admin" && user.role !== "aprovador") {
         return NextResponse.json(
            {
               success: false,
               message: "Você não tem permissão para rejeitar tarefas.",
            },
            { status: 403 }
         )
      }

      // Validação dos dados de entrada
      const body = await request.json()
      const result = taskHistorySchema.safeParse(body)

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
         return NextResponse.json(
            {
               success: false,
               message: "Tarefa não encontrada.",
            },
            { status: 404 }
         )
      }

      // Transação atômica para atualização da tarefa, histórico e notificação
      const { updatedTask, newHistory } = await prisma.$transaction(async (tx) => {
         // Atualiza o status da tarefa para 'rejeitada' com os campos semânticos corretos
         const updatedTask = await tx.tasks.update({
            where: { id: data.taskId },
            data: {
               status: "rejeitada",
               approver_id: user.id,
               rejected_at: new Date(),
               rejection_reason: data.comment || null,
               approved_at: null,
            },
         })

         // Registra a ação no histórico da tarefa
         const newHistory = await tx.task_history.create({
            data: {
               task_id: data.taskId,
               action: "rejeitada",
               user_id: user.id,
               user_name: user.name,
               comment: data.comment || null,
            },
         })

         // Busca a preferência de notificação do criador da tarefa
         const creator = await tx.users.findUnique({
            where: { id: existingTask.created_by },
            select: { id: true, notify_task_rejected: true },
         })

         // Cria a notificação para o criador se notify_task_rejected for true
         if (creator?.notify_task_rejected) {
            const rejectionDetails = data.comment
               ? ` Motivo: "${data.comment}"`
               : " Nenhum motivo foi informado."
            await tx.notifications.create({
               data: {
                  user_id: existingTask.created_by,
                  title: "Tarefa Rejeitada",
                  message: `Sua tarefa "${existingTask.title}" foi rejeitada por ${user.name}.${rejectionDetails}`,
                  type: "error",
               },
            })
         }

         return { updatedTask, newHistory }
      })

      return NextResponse.json(
         {
            success: true,
            message: "Tarefa rejeitada com sucesso.",
            data: {
               task: updatedTask,
               history: newHistory,
            },
         },
         { status: 200 }
      )
   } catch (error: unknown) {
      console.error("Erro ao rejeitar tarefa:", error)
      return NextResponse.json(
         {
            success: false,
            message: "Ocorreu um erro interno ao rejeitar a tarefa.",
            error: process.env.NODE_ENV === "development"
               ? (error instanceof Error ? error.message : "Erro desconhecido")
               : undefined,
         },
         { status: 500 }
      )
   }
}

