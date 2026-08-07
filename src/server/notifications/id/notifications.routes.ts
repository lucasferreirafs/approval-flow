import { jsonResponse } from "@/lib/api-response"
import { getCurrentUser } from "@/lib/get-current-user"
import prisma from "@/lib/prisma"

export async function GET( _request: Request, { params }: { params: Promise<{ id: string }> } ) {
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
            message: "ID do usuário é obrigatório.",
         }, { status: 400 })
      }

      const isOwnAccount = user.id === id
      const isAdmin = user.role === 'admin'

      if (!isOwnAccount && !isAdmin) {
         return jsonResponse({
            success: false,
            message: "Você não tem permissão para ver estas notificações.",
         }, { status: 403 })
      }

      const notifications = await prisma.notifications.findMany({
         where: { user_id: id },
         select: {
            id: true,
            title: true,
            message: true,
            read: true,
            created_at: true,
            type: true,
         },
         orderBy: {
            created_at: 'desc'
         }
      })

      return jsonResponse({
         success: true,
         data: notifications,
      }, { status: 200 })

   } catch (error: unknown) {
      console.error("Erro ao buscar notificações:", error)
      return jsonResponse({
         success: false,
         message: "Ocorreu um erro ao buscar as notificações.",
         error: process.env.NODE_ENV === 'development'
            ? (error instanceof Error ? error.message : "Erro desconhecido")
            : undefined,
      }, { status: 500 })
   }
}