import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ historyId: string }> }) {
   try {

      const { historyId } = await params

      if(!historyId) {
         return NextResponse.json({ success: false }, { status: 400 })
      }

      const taskHistory = await prisma.task_history.findMany({
         where: { task_id: historyId }
      })

      if (!taskHistory) {
         return NextResponse.json({ success: false }, { status: 404 })
      }

      return NextResponse.json(
         { 
            success: true, 
            data: taskHistory 
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