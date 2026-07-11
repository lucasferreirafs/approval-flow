import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const tasks = await prisma.tasks.findMany()
        if(!tasks) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Nenhuma tarefa encontrada.",
                }, { status: 404 }
            )
        }
        
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