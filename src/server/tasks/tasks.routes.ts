import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/get-current-user"

export async function GET() {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Usuário não autenticado.",
                }, { status: 401 }
            )
        }

        const tasks = await prisma.tasks.findMany({
            where: {
                created_by: user.id
            },
            orderBy: {
                created_at: "desc"
            }
        })

        return NextResponse.json(
            {
                success: true,
                data: tasks,
            }, { status: 200 }
        )

    } catch (error: unknown) {
        console.error(error)
        return NextResponse.json(
            {
                success: false,
                message: "Erro interno. Tente novamente.",
            }, { status: 500 }
        )
    }
}
