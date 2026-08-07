import { jsonResponse } from "@/lib/api-response"
import { comparePassword, hashPassword } from "@/lib/auth"
import { getCurrentUser } from "@/lib/get-current-user"
import prisma from "@/lib/prisma"
import { changePassword } from "@/schemas"
import { Prisma } from "../../../../generated/prisma/client"

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

      const result = changePassword.safeParse(body)
      if (!result.success) {
         return jsonResponse(
            {
               success: false,
               message: "Dados de senha inválidos.",
               errors: result.error.flatten().fieldErrors,
            },
            { status: 422 }
         )
      }

      const currentUser = await prisma.users.findUnique({
         where: { id: user.id },
         select: { password_hash: true },
      })

      if (!currentUser) {
         return jsonResponse(
            { success: false, message: "Usuário não encontrado." },
            { status: 404 }
         )
      }

      const isCurrentPasswordValid = await comparePassword(
         result.data.currentPassword,
         currentUser.password_hash
      )

      if (!isCurrentPasswordValid) {
         return jsonResponse(
            { success: false, message: "A senha atual informada é inválida." },
            { status: 401 }
         )
      }

      const passwordHash = await hashPassword(result.data.newPassword)
      await prisma.users.update({
         where: { id: user.id },
         data: { password_hash: passwordHash },
      })

      return jsonResponse(
         { success: true, message: "Senha atualizada com sucesso." },
         { status: 200 }
      )
   } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
         return jsonResponse(
            { success: false, message: "Usuário não encontrado." },
            { status: 404 }
         )
      }

      console.error("Erro ao atualizar senha:", error)

      return jsonResponse(
         { success: false, message: "Ocorreu um erro interno ao atualizar a senha." },
         { status: 500 }
      )
   }
}
