import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/get-current-user"

export async function GET() {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return new NextResponse(JSON.stringify({
                success: false,
                message: "Usuário não autenticado.",
            }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            })
        }

        const tasks = await prisma.tasks.findMany({
            where: {
                created_by: user.id
            },
            orderBy: {
                created_at: "desc"
            }
        })

        return new NextResponse(JSON.stringify({
            success: true,
            data: tasks,
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        })
    } catch (error: unknown) {
        console.error(error)
        return new NextResponse(JSON.stringify({
            success: false,
            message: "Erro interno. Tente novamente.",
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    }
}
