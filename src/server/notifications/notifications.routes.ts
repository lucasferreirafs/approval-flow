import { jsonResponse } from "@/lib/api-response"
import { getCurrentUser } from "@/lib/get-current-user"
import prisma from "@/lib/prisma"
import { notificationPreferencesSchema } from "@/schemas"
import { Prisma } from "../../../generated/prisma/client"

const notificationPreferencesSelect = {
   email_notifications: true,
   push_notifications: true,
   notify_task_created: true,
   notify_task_approved: true,
   notify_task_rejected: true,
} as const

export async function GET() {
   try {
      const user = await getCurrentUser()
      if (!user) {
         return jsonResponse(
            { success: false, message: "Usuário não autenticado." },
            { status: 401 }
         )
      }

      const preferences = await prisma.users.findUnique({
         where: { id: user.id },
         select: notificationPreferencesSelect,
      })

      if (!preferences) {
         return jsonResponse(
            { success: false, message: "Usuário não encontrado." },
            { status: 404 }
         )
      }

      return jsonResponse({ success: true, data: preferences }, { status: 200 })
   } catch (error: unknown) {
      console.error("Erro ao buscar preferências de notificação:", error)

      return jsonResponse(
         { success: false, message: "Ocorreu um erro interno ao buscar as preferências." },
         { status: 500 }
      )
   }
}

export async function PATCH(request: Request) {
   try {
      const user = await getCurrentUser()
      if (!user) {
         return jsonResponse(
            { success: false, message: "Usuário não autenticado." },
            { status: 401 }
         )
      }

      let body: unknown
      try {
         body = await request.json()
      } catch {
         return jsonResponse(
            { success: false, message: "A requisição contém dados inválidos." },
            { status: 400 }
         )
      }

      const result = notificationPreferencesSchema.safeParse(body)
      if (!result.success) {
         return jsonResponse(
            {
               success: false,
               message: "Preferências de notificação inválidas.",
               errors: result.error.flatten().fieldErrors,
            },
            { status: 422 }
         )
      }

      const preferences = await prisma.users.update({
         where: { id: user.id },
         data: result.data,
         select: notificationPreferencesSelect,
      })

      return jsonResponse(
         {
            success: true,
            message: "Preferências de notificação atualizadas com sucesso.",
            data: preferences,
         },
         { status: 200 }
      )
   } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
         return jsonResponse(
            { success: false, message: "Usuário não encontrado." },
            { status: 404 }
         )
      }

      console.error("Erro ao atualizar preferências de notificação:", error)

      return jsonResponse(
         { success: false, message: "Ocorreu um erro interno ao atualizar as preferências." },
         { status: 500 }
      )
   }
}
