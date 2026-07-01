import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const users = await prisma.users.findMany()

        return new NextResponse(JSON.stringify({
            success: true,
            data: users,
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
        });
    }
}