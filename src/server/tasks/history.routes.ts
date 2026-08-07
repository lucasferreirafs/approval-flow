import { jsonResponse } from "@/lib/api-response"
import { getCurrentUser } from "@/lib/get-current-user"
import prisma from "@/lib/prisma"

export async function GET( _request: Request, { params }: { params: Promise<{ historyId: string }> } ) {
   try {
      // 1. Autenticação do usuário
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

      // 2. Validação do parâmetro de rota (historyId se refere ao taskId no contexto desta rota)
      const { historyId } = await params
      if (!historyId) {
         return jsonResponse(
            {
               success: false,
               message: "ID da tarefa é obrigatório.",
            },
            { status: 400 }
         )
      }

      // 3. Autorização: Verifica se o usuário tem acesso à tarefa relacionada a este histórico
      const task = await prisma.tasks.findUnique({
         where: { id: historyId },
         select: { created_by: true },
      })

      if (!task) {
         return jsonResponse(
            {
               success: false,
               message: "Tarefa referenciada não encontrada.",
            },
            { status: 404 }
         )
      }

      const isOwner = task.created_by === user.id
      const isPrivileged = user.role === "admin" || user.role === "aprovador"

      if (!isOwner && !isPrivileged) {
         return jsonResponse(
            {
               success: false,
               message: "Você não tem permissão para visualizar o histórico desta tarefa.",
            },
            { status: 403 }
         )
      }

      // 4. Busca do histórico com ordenação e projeção de campos
      const taskHistory = await prisma.task_history.findMany({
         where: { task_id: historyId },
         orderBy: { date: "asc" }, // Histórico ordenado cronologicamente
         select: {
            id: true,
            action: true,
            user_name: true,
            comment: true,
            date: true,
         },
      })

      return jsonResponse(
         {
            success: true,
            data: taskHistory,
         },
         { status: 200 }
      )
   } catch (error: unknown) {
      console.error("Erro ao buscar histórico da tarefa:", error)
      return jsonResponse(
         {
            success: false,
            message: "Ocorreu um erro interno ao buscar o histórico.",
            error: process.env.NODE_ENV === "development"
               ? (error instanceof Error ? error.message : "Erro desconhecido")
               : undefined,
         },
         { status: 500 }
      )
   }
}
