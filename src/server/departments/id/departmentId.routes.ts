import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ departmentId: string }> }) {
   try {

      const { departmentId } = await params

      if(!departmentId) {
         return NextResponse.json({ success: false }, { status: 400 })
      }

      const department = await prisma.departments.findUnique({
         where: { id: departmentId },
         select: { id: true, name: true, color: true }
      })

      if (!department) {
         return NextResponse.json({ success: false }, { status: 404 })
      }

      return NextResponse.json(
         { 
            success: true, 
            data: department 
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