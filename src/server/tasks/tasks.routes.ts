import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if(!id) {
            return new NextResponse(JSON.stringify({
                success: false,
                message: "ID da tarefa não fornecido.",
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            })
        }

        const tasks = await prisma.tasks.findMany({
            where: {
                created_by: id
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