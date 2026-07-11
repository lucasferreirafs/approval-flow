import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ taskId: string }> }) {
   try {

      const { taskId } = await params

      if (!taskId) {
         return NextResponse.json({ success: false }, { status: 400 })
      }

      const task = await prisma.tasks.findUnique({
         where: { id: taskId }
      })

      if (!task) {
         return NextResponse.json({ success: false }, { status: 404 })
      }

      return NextResponse.json(
         {
            success: true,
            data: task
         }, { status: 200 }
      )

   } catch (error: unknown) {
      console.error(error)
      return NextResponse.json(
         {
            success: false,
            message: "Ocorreu um erro interno."
         }, { status: 500 }
      )
   }
}