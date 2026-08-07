import { jsonResponse } from "@/lib/api-response"
import { getCurrentUser } from "@/lib/get-current-user"
import prisma from "@/lib/prisma"

export async function GET( _request: Request, { params }: { params: Promise<{ taskId: string }> } ) {
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

      // Validação do parâmetro de rota
      const { taskId } = await params
      if (!taskId) {
         return jsonResponse(
            {
               success: false,
               message: "ID da tarefa é obrigatório.",
            },
            { status: 400 }
         )
      }

      // Busca da tarefa com projeção explícita de campos
      const task = await prisma.tasks.findUnique({
         where: { id: taskId },
         select: {
            id: true,
            title: true,
            description: true,
            status: true,
            department_id: true,
            created_by: true,
            approver_id: true,
            desired_date: true,
            approved_at: true,
            rejected_at: true,
            rejection_reason: true,
            created_at: true,
            updated_at: true,
         },
      })

      if (!task) {
         return jsonResponse(
            {
               success: false,
               message: "Tarefa não encontrada.",
            },
            { status: 404 }
         )
      }

      // Autorização: colaboradores só podem visualizar suas próprias tarefas
      const isOwner = task.created_by === user.id
      const isPrivileged = user.role === "admin" || user.role === "aprovador"

      if (!isOwner && !isPrivileged) {
         return jsonResponse(
            {
               success: false,
               message: "Você não tem permissão para visualizar esta tarefa.",
            },
            { status: 403 }
         )
      }

      return jsonResponse(
         {
            success: true,
            data: task,
         },
         { status: 200 }
      )
   } catch (error: unknown) {
      console.error("Erro ao buscar tarefa:", error)
      return jsonResponse(
         {
            success: false,
            message: "Ocorreu um erro interno ao buscar a tarefa.",
            error: process.env.NODE_ENV === "development"
               ? (error instanceof Error ? error.message : "Erro desconhecido")
               : undefined,
         },
         { status: 500 }
      )
   }
}
