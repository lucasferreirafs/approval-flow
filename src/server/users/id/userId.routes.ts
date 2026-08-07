import { jsonResponse } from "@/lib/api-response"
import { getCurrentUser } from "@/lib/get-current-user"
import prisma from "@/lib/prisma"
import { updateUserSchema } from "@/schemas"
import { Prisma } from "../../../../generated/prisma/client"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isValidUserId(userId: string | undefined): userId is string {
   return Boolean(userId && UUID_REGEX.test(userId))
}

export async function GET( _request: Request, { params }: { params: Promise<{ userId: string }> } ) {
   try {
      const user = await getCurrentUser()
      if (!user) {
         return jsonResponse(
            { success: false, message: "Usuário não autenticado." },
            { status: 401 }
         )
      }

      const { userId } = await params
      if (!isValidUserId(userId)) {
         return jsonResponse(
            { success: false, message: "ID do usuário inválido." },
            { status: 400 }
         )
      }

      const targetUser = await prisma.users.findUnique({
         where: { id: userId },
         select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department_id: true,
            avatar: true,
         },
      })

      if (!targetUser) {
         return jsonResponse(
            { success: false, message: "Usuário não encontrado." },
            { status: 404 }
         )
      }

      return jsonResponse({ success: true, data: targetUser }, { status: 200 })
   } catch (error: unknown) {
      console.error("Erro ao buscar usuário:", error)

      return jsonResponse(
         { success: false, message: "Ocorreu um erro interno ao buscar o usuário." },
         { status: 500 }
      )
   }
}

export async function PUT( request: Request, { params }: { params: Promise<{ userId: string }> } ) {
   try {
      const user = await getCurrentUser()
      if (!user) {
         return jsonResponse(
            { success: false, message: "Usuário não autenticado." },
            { status: 401 }
         )
      }

      const { userId } = await params
      if (!isValidUserId(userId)) {
         return jsonResponse(
            { success: false, message: "ID do usuário inválido." },
            { status: 400 }
         )
      }

      const isAdmin = user.role === "admin"
      if (user.id !== userId && !isAdmin) {
         return jsonResponse(
            { success: false, message: "Você não tem permissão para realizar esta ação." },
            { status: 403 }
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

      const result = updateUserSchema.safeParse(body)
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

      const data = result.data
      if (!data.role && !data.department_id && !data.name && !data.email) {
         return jsonResponse(
            { success: false, message: "Nenhum campo para atualizar foi fornecido." },
            { status: 400 }
         )
      }

      if (!isAdmin && (data.role || data.department_id)) {
         return jsonResponse(
            { success: false, message: "Você não tem permissão para alterar papel ou departamento." },
            { status: 403 }
         )
      }

      const targetUser = await prisma.users.findUnique({
         where: { id: userId },
         select: { email: true },
      })

      if (!targetUser) {
         return jsonResponse(
            { success: false, message: "Usuário não encontrado." },
            { status: 404 }
         )
      }

      const email = data.email?.trim().toLowerCase()
      if (email && email !== targetUser.email) {
         const emailExists = await prisma.users.findUnique({
            where: { email },
            select: { id: true },
         })

         if (emailExists) {
            return jsonResponse(
               { success: false, message: "Este e-mail já está em uso." },
               { status: 409 }
            )
         }
      }

      if (data.department_id) {
         const departmentExists = await prisma.departments.findUnique({
            where: { id: data.department_id },
            select: { id: true },
         })

         if (!departmentExists) {
            return jsonResponse(
               { success: false, message: "Departamento não encontrado." },
               { status: 404 }
            )
         }
      }

      const updatedUser = await prisma.users.update({
         where: { id: userId },
         data: {
            ...(data.role ? { role: data.role } : {}),
            ...(data.department_id ? { department_id: data.department_id } : {}),
            ...(data.name ? { name: data.name.trim() } : {}),
            ...(email ? { email } : {}),
         },
         select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department_id: true,
            updated_at: true,
         },
      })

      return jsonResponse(
         {
            success: true,
            message: "Usuário atualizado com sucesso.",
            data: updatedUser,
         },
         { status: 200 }
      )
   } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
         if (error.code === "P2002") {
            return jsonResponse(
               { success: false, message: "Este e-mail já está em uso." },
               { status: 409 }
            )
         }

         if (error.code === "P2003") {
            return jsonResponse(
               { success: false, message: "Departamento não encontrado." },
               { status: 404 }
            )
         }

         if (error.code === "P2025") {
            return jsonResponse(
               { success: false, message: "Usuário não encontrado." },
               { status: 404 }
            )
         }
      }

      console.error("Erro ao atualizar usuário:", error)

      return jsonResponse(
         { success: false, message: "Ocorreu um erro interno ao atualizar o usuário." },
         { status: 500 }
      )
   }
}

export async function DELETE(
   _request: Request,
   { params }: { params: Promise<{ userId: string }> }
) {
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
            { success: false, message: "Apenas administradores podem excluir usuários." },
            { status: 403 }
         )
      }

      const { userId } = await params
      if (!isValidUserId(userId)) {
         return jsonResponse(
            { success: false, message: "ID do usuário inválido." },
            { status: 400 }
         )
      }

      if (user.id === userId) {
         return jsonResponse(
            { success: false, message: "Você não pode excluir sua própria conta." },
            { status: 400 }
         )
      }

      const targetUser = await prisma.users.findUnique({
         where: { id: userId },
         select: {
            id: true,
            _count: {
               select: {
                  tasks_tasks_created_byTousers: true,
                  tasks_tasks_approver_idTousers: true,
               },
            },
         },
      })

      if (!targetUser) {
         return jsonResponse(
            { success: false, message: "Usuário não encontrado." },
            { status: 404 }
         )
      }

      const createdTasksCount = targetUser._count.tasks_tasks_created_byTousers
      const approvedTasksCount = targetUser._count.tasks_tasks_approver_idTousers

      if (createdTasksCount > 0) {
         return jsonResponse(
            {
               success: false,
               message: `Não é possível excluir. Este usuário criou ${createdTasksCount} tarefa(s). Reatribua ou exclua as tarefas primeiro.`,
            },
            { status: 409 }
         )
      }

      if (approvedTasksCount > 0) {
         return jsonResponse(
            {
               success: false,
               message: `Não é possível excluir. Este usuário aprovou/rejeitou ${approvedTasksCount} tarefa(s).`,
            },
            { status: 409 }
         )
      }

      const deletedUser = await prisma.users.delete({
         where: { id: userId },
         select: {
            id: true,
            name: true,
         },
      })

      return jsonResponse(
         {
            success: true,
            message: "Usuário excluído com sucesso.",
            data: deletedUser,
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

      console.error("Erro ao excluir usuário:", error)

      return jsonResponse(
         { success: false, message: "Ocorreu um erro interno ao excluir o usuário." },
         { status: 500 }
      )
   }
}
