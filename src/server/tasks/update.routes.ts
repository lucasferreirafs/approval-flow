import { getCurrentUser } from "@/lib/get-current-user"
import prisma from "@/lib/prisma"
import { formTaskApiSchema } from "@/schemas"
import { NextResponse } from "next/server"

export async function PUT(req: Request) {
   try {
      const user = await getCurrentUser()
      if (!user) {
         return NextResponse.json({
            success: false,
            message: "Usuário não autenticado.",
         }, { status: 401 })
      }

      const body = await req.json()
      const result = formTaskApiSchema.safeParse(body)

      if (!result.success) {
         return NextResponse.json({
            success: false,
            message: "Informações inválida.",
            errors: result.error.flatten().fieldErrors,
         }, { status: 422 })
      }

      const { data } = result
      const desiredDate = new Date(data.desiredDate)

      if (!data.taskId) {
         return NextResponse.json({
            success: false,
            message: "ID da tarefa inválido."
         }, { status: 422 })
      }

      const task = await prisma.tasks.update({
         where: { id: data.taskId },
         data: {
            title: data.title,
            description: data.description,
            department_id: data.department_id,
            desired_date: desiredDate,
            status: "pendente",
         }
      })

      const history = await prisma.task_history.create({
         data: {
            task_id: data.taskId,
            action: "editada",
            user_id: user.id,
            user_name: user.name,
            comment: "Tarefa editada pelo usuário",
         }
      })

      return NextResponse.json(
         {
            success: true,
            message: "Tarefa atualizada com sucesso.",
            data: { task, history },
         }, { status: 200 }
      )

   } catch (error: unknown) {
      console.error(error)
      return NextResponse.json(
         {
            success: false,
            message: "Ocorreu um erro interno.",
         }, { status: 500 }
      )
   }
}