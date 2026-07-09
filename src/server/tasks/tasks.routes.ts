import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get("userId")

        if (userId) {
            const tasks = await prisma.tasks.findMany({
                where: {
                    created_by: userId
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
        } else {
            const tasks = await prisma.tasks.findMany()

            return NextResponse.json(
                {
                    success: true,
                    data: tasks,
                }, { status: 200 }
            )
        }

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
