import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"


export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
   try {
      const { userId } = await params

      if (!userId) {
         return NextResponse.json({ success: false }, { status: 400 })
      }

      const user = await prisma.users.findUnique({
         where: { id: userId },
         select: { id: true, name: true, email: true, avatar: true }
      })

      if (!user) {
         return NextResponse.json({ success: false }, { status: 404 })
      }

      return NextResponse.json({ success: true, data: user }, { status: 200 })
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