import { getCurrentUser } from "@/lib/get-current-user"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
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
                message: "Você não tem permissão para realizar esta ação.",
            }, { status: 403 })
        }

        const allUsers = await prisma.users.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department_id: true,
                avatar: true,
                is_approver: true,
                created_at: true,
            },
            orderBy: {
                name: 'asc'
            }
        })

        return NextResponse.json({
            success: true,
            data: allUsers
        }, { status: 200 })

    } catch (error: unknown) {
        console.error("Erro ao listar usuários:", error)
        return NextResponse.json({
            success: false,
            message: "Ocorreu um erro interno.",
            error: process.env.NODE_ENV === 'development'
                ? (error instanceof Error ? error.message : "Erro desconhecido")
                : undefined,
        }, { status: 500 })
    }
}