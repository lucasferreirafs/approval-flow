import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const users = await prisma.users.findMany()

        if (!users) {
            return NextResponse.json(
                { success: false, message: "Nenhum usuário encontrado." },
                { status: 404 }
            )
        }
        return NextResponse.json({ success: true, data: users }, { status: 200 })

    } catch (error: unknown) {
        console.error(error)
        return NextResponse.json(
            { success: false, message: "Ocorreu um erro interno." },
            { status: 500 }
        )
    }
}