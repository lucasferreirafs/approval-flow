import { jsonResponse } from "@/lib/api-response"
import { getCurrentUser } from "@/lib/get-current-user"
import prisma from "@/lib/prisma"
import { departmentSchema } from "@/schemas"

export async function GET(request: Request, { params }: { params: Promise<{ departmentId: string }> }) {
   try {
      const user = await getCurrentUser()
      if (!user) {
         return jsonResponse({
            success: false,
            message: "Usuário não autenticado.",
         }, { status: 401 })
      }

      const { departmentId } = await params
      if (!departmentId) {
         return jsonResponse({
            success: false,
            message: "ID do departamento é obrigatório.",
         }, { status: 400 })
      }

      const targetDepartment = await prisma.departments.findUnique({
         where: { id: departmentId },
         select: {
            id: true,
            name: true,
            description: true,
            color: true,
            _count: {
               select: { users: true }
            }
         }
      })

      if (!targetDepartment) {
         return jsonResponse({
            success: false,
            message: "Departamento não encontrado.",
         }, { status: 404 })
      }

      const formattedDepartment = {
         id: targetDepartment.id,
         name: targetDepartment.name,
         description: targetDepartment.description,
         color: targetDepartment.color,
         userCount: targetDepartment._count.users,
      }

      return jsonResponse({
         success: true,
         data: formattedDepartment
      }, { status: 200 })

   } catch (error: unknown) {
      console.error("Erro ao buscar departamento:", error)
      return jsonResponse({
         success: false,
         message: "Ocorreu um erro interno.",
         error: process.env.NODE_ENV === 'development'
            ? (error instanceof Error ? error.message : "Erro desconhecido")
            : undefined,
      }, { status: 500 })
   }
}

export async function PUT(request: Request, { params }: { params: Promise<{ departmentId: string }> }) {
   try {
      const user = await getCurrentUser()
      if (!user) {
         return jsonResponse({
            success: false,
            message: "Usuário não autenticado.",
         }, { status: 401 })
      }

      if (user.role !== 'admin') {
         return jsonResponse({
            success: false,
            message: "Apenas administradores podem editar departamentos.",
         }, { status: 403 })
      }

      const { departmentId } = await params
      if (!departmentId) {
         return jsonResponse({
            success: false,
            message: "ID do departamento é obrigatório.",
         }, { status: 400 })
      }

      const existingDepartment = await prisma.departments.findUnique({
         where: { id: departmentId }
      })

      if (!existingDepartment) {
         return jsonResponse({
            success: false,
            message: "Departamento não encontrado.",
         }, { status: 404 })
      }

      const body = await request.json()
      const result = departmentSchema.safeParse(body)

      if (!result.success) {
         return jsonResponse({
            success: false,
            message: "Dados inválidos.",
            errors: result.error.flatten().fieldErrors,
         }, { status: 422 })
      }

      const { data } = result

      if (data.name !== existingDepartment.name) {
         const nameExists = await prisma.departments.findUnique({
            where: { name: data.name }
         })

         if (nameExists) {
            return jsonResponse({
               success: false,
               message: "Já existe um departamento com este nome.",
            }, { status: 409 })
         }
      }

      const updatedDepartment = await prisma.departments.update({
         where: { id: departmentId },
         data: {
            name: data.name,
            description: data.description || null,
            color: data.color || null,
         },
         select: {
            id: true,
            name: true,
            description: true,
            color: true,
            _count: {
               select: { users: true }
            }
         }
      })

      return jsonResponse({
         success: true,
         message: "Departamento atualizado com sucesso.",
         data: {
            id: updatedDepartment.id,
            name: updatedDepartment.name,
            description: updatedDepartment.description,
            color: updatedDepartment.color,
            userCount: updatedDepartment._count.users,
         },
      }, { status: 200 })

   } catch (error: unknown) {
      console.error("Erro ao atualizar departamento:", error)
      return jsonResponse({
         success: false,
         message: "Ocorreu um erro interno.",
         error: process.env.NODE_ENV === 'development'
            ? (error instanceof Error ? error.message : "Erro desconhecido")
            : undefined,
      }, { status: 500 })
   }
}

export async function DELETE( request: Request, { params }: { params: Promise<{ departmentId: string }> } ) {
   try {
      const user = await getCurrentUser()
      if (!user) {
         return jsonResponse({
            success: false,
            message: "Usuário não autenticado.",
         }, { status: 401 })
      }

      if (user.role !== 'admin') {
         return jsonResponse({
            success: false,
            message: "Apenas administradores podem excluir departamentos.",
         }, { status: 403 })
      }

      const { departmentId } = await params
      if (!departmentId) {
         return jsonResponse({
            success: false,
            message: "ID do departamento é obrigatório.",
         }, { status: 400 })
      }

      const existingDepartment = await prisma.departments.findUnique({
         where: { id: departmentId },
         select: {
            id: true,
            _count: { select: { users: true, tasks: true } }
         }
      })

      if (!existingDepartment) {
         return jsonResponse({
            success: false,
            message: "Departamento não encontrado.",
         }, { status: 404 })
      }

      if (existingDepartment._count.users > 0) {
         return jsonResponse({
            success: false,
            message: `Não é possível excluir. Existem ${existingDepartment._count.users} usuário(s) vinculado(s) a este departamento.`,
         }, { status: 409 })
      }

      if (existingDepartment._count.tasks > 0) {
         return jsonResponse({
            success: false,
            message: `Não é possível excluir. Existem ${existingDepartment._count.tasks} tarefa(s) vinculada(s) a este departamento.`,
         }, { status: 409 })
      }

      await prisma.departments.delete({
         where: { id: departmentId }
      })

      return jsonResponse({
         success: true,
         message: "Departamento excluído com sucesso.",
      }, { status: 200 })

   } catch (error: unknown) {
      console.error("Erro ao excluir departamento:", error)
      return jsonResponse({
         success: false,
         message: "Ocorreu um erro interno.",
         error: process.env.NODE_ENV === 'development'
            ? (error instanceof Error ? error.message : "Erro desconhecido")
            : undefined,
      }, { status: 500 })
   }
}