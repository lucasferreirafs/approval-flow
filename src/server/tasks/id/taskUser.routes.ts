import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
   try {

      const { id } = await params

      if (!id) {
         return NextResponse.json({ success: false }, { status: 400 })
      }

      const task = await prisma.tasks.findMany({
         where: { created_by: id }
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