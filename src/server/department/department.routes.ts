import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
   try {
      const response = await prisma.departments.findMany()

      return NextResponse.json(
         { success: true, data: response },
         { status: 200 }
      )
   } catch(error: unknown) {
      console.error(error)
      return NextResponse.json(
         { success: false, message: "Erro interno. Tente novamente." },
         { status: 500 }
      )
   }
}