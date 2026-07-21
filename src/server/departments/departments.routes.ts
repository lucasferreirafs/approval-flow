import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
   try {
      const departments = await prisma.departments.findMany()

      if(!departments) {
         return NextResponse.json(
            {
               success: false,
               message: "Nenhum departamento encontrado."
            }, { status: 404 }
         )
      }

      return NextResponse.json(
         {
            success: true,
            data: departments
         }, { status: 200 }
      )

   } catch (error: unknown) {
      console.error(error)
      return NextResponse.json(
         {
            success: false,
            message: "Erro interno, tente novamente."
         }, { status: 500 }
      )
   }
}