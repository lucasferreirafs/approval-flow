import { getCurrentUser } from "@/lib/get-current-user"
import prisma from "@/lib/prisma"
import { updateUserSchema } from "@/schemas"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
   try {
      const user = await getCurrentUser()
      if (!user) {
         return NextResponse.json({
            success: false,
            message: "Usuário não autenticado.",
         }, { status: 401 })
      }

      const { userId } = await params
      if (!userId) {
         return NextResponse.json({
            success: false,
            message: "ID do usuário é obrigatório.",
         }, { status: 400 })
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
         }
      })

      if (!targetUser) {
         return NextResponse.json({
            success: false,
            message: "Usuário não encontrado.",
         }, { status: 404 })
      }

      return NextResponse.json({
         success: true,
         data: targetUser
      }, { status: 200 })

   } catch (error: unknown) {
      console.error("Erro ao buscar usuário:", error)
      return NextResponse.json({
         success: false,
         message: "Ocorreu um erro ao buscar o usuário.",
         error: process.env.NODE_ENV === 'development'
            ? (error instanceof Error ? error.message : "Erro interno desconhecido")
            : undefined,
      }, { status: 500 })
   }
}

export async function PUT(request: Request, { params }: { params: Promise<{ userId: string }> }) {
   try {
      const user = await getCurrentUser()
      if (!user) {
         return NextResponse.json({
            success: false,
            message: "Usuário não autenticado.",
         }, { status: 401 })
      }

      const { userId } = await params
      if (!userId) {
         return NextResponse.json({
            success: false,
            message: "ID do usuário é obrigatório.",
         }, { status: 400 })
      }

      const targetUser = await prisma.users.findUnique({
         where: { id: userId }
      })

      if (!targetUser) {
         return NextResponse.json({
            success: false,
            message: "Usuário não encontrado.",
         }, { status: 404 })
      }

      if (user.id !== userId && user.role !== 'admin') {
         return NextResponse.json({
            success: false,
            message: "Você não tem permissão para realizar esta ação.",
         }, { status: 403 })
      }

      const body = await request.json()
      const result = updateUserSchema.safeParse(body)

      if (!result.success) {
         return NextResponse.json({
            success: false,
            message: "Informações inválidas.",
            errors: result.error.flatten().fieldErrors,
         }, { status: 422 })
      }

      const { data } = result

      if (!data.role && !data.department_id && !data.name && !data.email) {
         return NextResponse.json({
            success: false,
            message: "Nenhum campo para atualizar foi fornecido.",
         }, { status: 400 })
      }

      if (data.email && data.email !== targetUser.email) {
         const emailExists = await prisma.users.findUnique({
            where: { email: data.email }
         })

         if (emailExists) {
            return NextResponse.json({
               success: false,
               message: "Este e-mail já está em uso.",
            }, { status: 409 })
         }
      }

      if (data.department_id) {
         const departmentExists = await prisma.departments.findUnique({
            where: { id: data.department_id }
         })

         if (!departmentExists) {
            return NextResponse.json({
               success: false,
               message: "Departamento não encontrado.",
            }, { status: 404 })
         }
      }

      const updateData: Record<string, unknown> = {}
      if (data.role) updateData.role = data.role
      if (data.department_id) updateData.department_id = data.department_id
      if (data.name) updateData.name = data.name
      if (data.email) updateData.email = data.email

      const updatedUser = await prisma.users.update({
         where: { id: userId },
         data: updateData,
         select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department_id: true,
            updated_at: true,
         }
      })

      return NextResponse.json({
         success: true,
         message: "Usuário atualizado com sucesso.",
         data: updatedUser,
      }, { status: 200 })

   } catch (error: unknown) {
      console.error("Erro ao atualizar usuário:", error)
      return NextResponse.json({
         success: false,
         message: "Ocorreu um erro ao atualizar o usuário.",
         error: process.env.NODE_ENV === 'development'
            ? (error instanceof Error ? error.message : "Erro interno desconhecido")
            : undefined,
      }, { status: 500 })
   }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ userId: string }> }) {
   try {
      const user = await getCurrentUser()
      if (!user) {
         return NextResponse.json({
            success: false,
            message: "Usuário não autenticado.",
         }, { status: 401 })
      }

      const { userId } = await params
      if (!userId) {
         return NextResponse.json({
            success: false,
            message: "ID do usuário é obrigatório.",
         }, { status: 400 })
      }

      const targetUser = await prisma.users.findUnique({
         where: { id: userId }
      })

      if (!targetUser) {
         return NextResponse.json({
            success: false,
            message: "Usuário não encontrado.",
         }, { status: 404 })
      }

      if (user.id !== userId && user.role !== 'admin') {
         return NextResponse.json({
            success: false,
            message: "Você não tem permissão para deletar este usuário.",
         }, { status: 403 })
      }

      const deletedUser = await prisma.users.delete({
         where: { id: userId },
         select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department_id: true,
            updated_at: true,
         }
      })

      return NextResponse.json(
         {
            success: true,
            message: "Usuário deletado.",
            data: deletedUser
         }, { status: 200 }
      )

   } catch (error: unknown) {
      console.error("Ocorreu um erro: ", error)
      return NextResponse.json({
         success: false,
         message: "Ocorreu um erro ao deletar o usuário.",
         error: process.env.NODE_ENV === 'development'
            ? (error instanceof Error ? error.message : "Erro interno desconhecido")
            : undefined,
      }, { status: 500 })
   }
}