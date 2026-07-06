import { NextResponse } from "next/server"
import { newTaskApiSchema } from "@/schemas"
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";

export async function POST(request: Request) {
   try {
      const user = await getCurrentUser()
      if (!user) {
         return NextResponse.json({
            success: false,
            message: "Usuário não autenticado.",
         }, { status: 401 })
      }

      const body = await request.json()
      const result = newTaskApiSchema.safeParse(body)

      if (!result.success) {
         return NextResponse.json({
            success: false,
            message: "Erro de validação.",
            errors: result.error.flatten().fieldErrors,
         }, { status: 422 })
      }

      const { data } = result

      const desiredDate = new Date(data.desiredDate)

      const task = await prisma.tasks.create({
         data: {
            title: data.title,
            description: data.description,
            department_id: data.department_id,
            desired_date: desiredDate,
            created_by: user.id,
         }
      })

      return NextResponse.json({
         success: true,
         message: "Tarefa criada com sucesso!",
         data: task,
      }, { status: 201 })

   } catch (error: unknown) {
      console.error("Erro ao criar tarefa:", error)
      return NextResponse.json({
         success: false,
         message: "Ocorreu um erro interno.",
      }, { status: 500 })
   }
}