import { jsonResponse } from "@/lib/api-response"
import { getCurrentUser } from "@/lib/get-current-user"
import prisma from "@/lib/prisma"

export async function PATCH( _request: Request, { params }: { params: Promise<{ id: string }> } ) {
   try {
      const user = await getCurrentUser()
      if (!user) {
         return jsonResponse({
            success: false,
            message: "Usuário não autenticado.",
         }, { status: 401 })
      }

      const { id } = await params
      if (!id) {
         return jsonResponse({
            success: false,
            message: "ID da notificação é obrigatório.",
         }, { status: 400 })
      }

      // Verificar se a notificação existe e pertence ao usuário
      const notification = await prisma.notifications.findUnique({
         where: { id: id },
         select: { id: true, user_id: true, read: true }
      })

      if (!notification) {
         return jsonResponse({
            success: false,
            message: "Notificação não encontrada.",
         }, { status: 404 })
      }

      // Só o dono da notificação pode marcá-la como lida
      if (notification.user_id !== user.id) {
         return jsonResponse({
            success: false,
            message: "Você não tem permissão para alterar esta notificação.",
         }, { status: 403 })
      }

      // Evitar update desnecessário se já estiver lida
      if (notification.read) {
         return jsonResponse({
            success: true,
            message: "Notificação já estava marcada como lida.",
         }, { status: 200 })
      }

      const updatedNotification = await prisma.notifications.update({
         where: { id: id },
         data: { read: true },
         select: {
            id: true,
            title: true,
            message: true,
            read: true,
            created_at: true,
            type: true,
         }
      })

      return jsonResponse({
         success: true,
         message: "Notificação marcada como lida.",
         data: updatedNotification,
      }, { status: 200 })

   } catch (error: unknown) {
      console.error("Erro ao marcar notificação como lida:", error)
      return jsonResponse({
         success: false,
         message: "Ocorreu um erro ao atualizar a notificação.",
         error: process.env.NODE_ENV === 'development'
            ? (error instanceof Error ? error.message : "Erro desconhecido")
            : undefined,
      }, { status: 500 })
   }
}