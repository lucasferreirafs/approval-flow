import { jsonResponse } from "@/lib/api-response"
import { getCurrentUser } from "@/lib/get-current-user"
import prisma from "@/lib/prisma"
import { z } from "zod"

// Validação do body
const readAllSchema = z.object({
   userId: z.string().uuid("ID de usuário inválido."),
})

export async function PATCH(request: Request) {
   try {
      const user = await getCurrentUser()
      if (!user) {
         return jsonResponse({
            success: false,
            message: "Usuário não autenticado.",
         }, { status: 401 })
      }

      const body = await request.json()
      const result = readAllSchema.safeParse(body)

      if (!result.success) {
         return jsonResponse({
            success: false,
            message: "Dados inválidos.",
            errors: result.error.flatten().fieldErrors,
         }, { status: 422 })
      }

      const { userId } = result.data

      // Só pode marcar como lidas as próprias notificações
      if (user.id !== userId) {
         return jsonResponse({
            success: false,
            message: "Você não tem permissão para alterar notificações de outro usuário.",
         }, { status: 403 })
      }

      const result_update = await prisma.notifications.updateMany({
         where: {
            user_id: userId,
            read: false,
         },
         data: { read: true }
      })

      return jsonResponse({
         success: true,
         message: `${result_update.count} notificação(ões) marcada(s) como lida(s).`,
         data: { updatedCount: result_update.count },
      }, { status: 200 })

   } catch (error: unknown) {
      console.error("Erro ao marcar notificações como lidas:", error)
      return jsonResponse({
         success: false,
         message: "Ocorreu um erro ao atualizar as notificações.",
         error: process.env.NODE_ENV === 'development'
            ? (error instanceof Error ? error.message : "Erro desconhecido")
            : undefined,
      }, { status: 500 })
   }
}