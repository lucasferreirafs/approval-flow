import { getCurrentUser } from "@/lib/get-current-user"
import prisma from "@/lib/prisma"
import { departmentSchema } from "@/schemas"
import { NextResponse } from "next/server"

export async function GET() {
   try {
      const allDepartments = await prisma.departments.findMany({
         select: {
            id: true,
            name: true,
            description: true,
            color: true,
            _count: {
               select: { users: true }
            }
         },
         orderBy: {
            name: 'asc'
         }
      })

      const formattedDepartments = allDepartments.map(dept => ({
         id: dept.id,
         name: dept.name,
         description: dept.description,
         color: dept.color,
         userCount: dept._count.users,
      }))

      return NextResponse.json(
         {
            success: true,
            data: formattedDepartments
         }, { status: 200 }
      )

   } catch (error: unknown) {
      console.error("Erro ao listar departamentos:", error)
      return NextResponse.json({
         success: false,
         message: "Ocorreu um erro interno.",
         error: process.env.NODE_ENV === 'development'
            ? (error instanceof Error ? error.message : "Erro desconhecido")
            : undefined,
      }, { status: 500 })
   }
}

export async function POST(request: Request) {
   try {
      const user = await getCurrentUser()
      if (!user) {
         return NextResponse.json({
            success: false,
            message: "Usuário não autenticado.",
         }, { status: 401 })
      }

      if (user.role !== 'admin') {
         return NextResponse.json({
            success: false,
            message: "Apenas administradores podem criar departamentos.",
         }, { status: 403 })
      }

      const body = await request.json()
      const result = departmentSchema.safeParse(body)

      if (!result.success) {
         return NextResponse.json({
            success: false,
            message: "Dados inválidos.",
            errors: result.error.flatten().fieldErrors,
         }, { status: 422 })
      }

      const { data } = result

      const existingDepartment = await prisma.departments.findUnique({
         where: { name: data.name }
      })

      if (existingDepartment) {
         return NextResponse.json({
            success: false,
            message: "Já existe um departamento com este nome.",
         }, { status: 409 })
      }

      const newDepartment = await prisma.departments.create({
         data: {
            name: data.name,
            description: data.description || null,
            color: data.color || null,
         },
         select: {
            id: true,
            name: true,
            description: true,
            color: true,
         }
      })

      return NextResponse.json({
         success: true,
         message: "Departamento criado com sucesso.",
         data: { ...newDepartment, userCount: 0 },
      }, { status: 201 })

   } catch (error: unknown) {
      console.error("Erro ao criar departamento:", error)
      return NextResponse.json({
         success: false,
         message: "Ocorreu um erro interno.",
         error: process.env.NODE_ENV === 'development'
            ? (error instanceof Error ? error.message : "Erro desconhecido")
            : undefined,
      }, { status: 500 })
   }
}