import { getCurrentUser } from "@/lib/get-current-user";
import prisma from "@/lib/prisma";
import { taskHistorySchema } from "@/schemas";
import { NextResponse } from "next/server";

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
      const result = taskHistorySchema.safeParse(body)
      
      if (!result.success) {
         return NextResponse.json({
            success: false,
            message: "Informações inválida.",
            errors: result.error.flatten().fieldErrors,
         }, { status: 422 })
      }
      const { data } = result

      const task = await prisma.tasks.update({
         where: { id: data.taskId },
         data: {
            status: data.status,
            approver_id: user.id,
            approved_at: data.action === "aprovada" ? new Date() : null,
            rejected_at: data.action === "aprovada" ? new Date() : null,
            rejection_reason: data.comment || null,
         }
      })

      const history = prisma.task_history.create({
         data: {
            task_id: data.taskId,
            action: data.action,
            user_id: user.id,
            user_name: user.name,
            comment: data.comment || null,
         }
      })

      return NextResponse.json(
         {
            success: true,
            message: "Atualizado com sucesso!",
            data: { task, history }
         }, { status: 200 }
      )

   } catch (error: unknown) {
      console.log(error)
      return NextResponse.json(
         {
            success: false,
            message: "Ocorreu um erro interno."
         }, { status: 500 }
      )
   }
}
