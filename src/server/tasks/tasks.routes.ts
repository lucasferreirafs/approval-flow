import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/get-current-user"
import prisma from "@/lib/prisma"

export async function GET() {
   try {
      // Autenticação do usuário
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

      // Filtro de Autorização Baseado em Papel
      // Administradores e aprovadores visualizam todas as tarefas
      // Colaboradores comuns só visualizam as tarefas que eles mesmos criaram
      let whereClause = {}
      if (user.role !== "admin" && user.role !== "aprovador") {
         whereClause = { created_by: user.id }
      }

      // Busca das tarefas com projeção de campos e ordenação
      const tasks = await prisma.tasks.findMany({
         where: whereClause,
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
            created_at: true,
            updated_at: true,
         },
      })

      if (!tasks || tasks.length === 0) {
         return NextResponse.json(
            {
               success: true,
               message: "Nenhuma tarefa encontrada.",
               data: [],
            },
            { status: 200 }
         )
      }

      return NextResponse.json(
         {
            success: true,
            data: tasks,
         },
         { status: 200 }
      )
   } catch (error: unknown) {
      console.error("Erro ao buscar lista de tarefas:", error)
      return NextResponse.json(
         {
            success: false,
            message: "Ocorreu um erro interno ao buscar as tarefas.",
            error: process.env.NODE_ENV === "development"
               ? (error instanceof Error ? error.message : "Erro desconhecido")
               : undefined,
         },
         { status: 500 }
      )
   }
}
