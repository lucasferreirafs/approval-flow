import { getCurrentUser } from "@/lib/get-current-user"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

function jsonResponse<T>(body: T, init: ResponseInit) {
   const headers = new Headers(init.headers)
   headers.set("Cache-Control", "no-store")

   return NextResponse.json(body, { ...init, headers })
}

export async function GET() {
   try {
      const user = await getCurrentUser()
      if (!user) {
         return jsonResponse(
            { success: false, message: "Usuário não autenticado." },
            { status: 401 }
         )
      }

      if (user.role !== "admin") {
         return jsonResponse(
            { success: false, message: "Você não tem permissão para realizar esta ação." },
            { status: 403 }
         )
      }

      const allUsers = await prisma.users.findMany({
         select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department_id: true,
            avatar: true,
            is_approver: true,
            created_at: true,
         },
         orderBy: { name: "asc" },
      })

      return jsonResponse({ success: true, data: allUsers }, { status: 200 })
   } catch (error: unknown) {
      console.error("Erro ao listar usuários:", error)

      return jsonResponse(
         { success: false, message: "Ocorreu um erro interno ao listar os usuários." },
         { status: 500 }
      )
   }
}
