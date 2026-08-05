import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/get-current-user"
import prisma from "@/lib/prisma"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(
   _request: Request,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const user = await getCurrentUser()
      if (!user) {
         return NextResponse.json(
            {
               success: false,
               message: "Usuário não autenticado.",
            },
            { status: 401 }
         )
      }

      const { id } = await params
      if (!id || !UUID_REGEX.test(id)) {
         return NextResponse.json(
            {
               success: false,
               message: "ID do usuário inválido.",
            },
            { status: 400 }
         )
      }

      const isOwner = user.id === id
      const isAdmin = user.role === "admin"
      if (!isOwner && !isAdmin) {
         return NextResponse.json(
            {
               success: false,
               message: "Você não tem permissão para visualizar as tarefas deste usuário.",
            },
            { status: 403 }
         )
      }

      const tasks = await prisma.tasks.findMany({
         where: { created_by: id },
         orderBy: { created_at: "desc" },
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

      return NextResponse.json(
         {
            success: true,
            message: tasks.length === 0 ? "Nenhuma tarefa encontrada." : undefined,
            data: tasks,
         },
         { status: 200 }
      )
   } catch (error: unknown) {
      console.error("Erro ao buscar tarefas do usuário:", error)
      return NextResponse.json(
         {
            success: false,
            message: "Ocorreu um erro interno ao buscar as tarefas do usuário.",
            error: process.env.NODE_ENV === "development"
               ? (error instanceof Error ? error.message : "Erro desconhecido")
               : undefined,
         },
         { status: 500 }
      )
   }
}
