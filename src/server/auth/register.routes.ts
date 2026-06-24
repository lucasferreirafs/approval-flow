import { registerApiSchema } from "@/schemas/authentication.schema"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { Prisma } from "../../../generated/prisma/client"
import { hashPassword } from "@/lib/auth"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const result = registerApiSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    errors: result.error.flatten(),
                },
                { status: 400 }
            )
        }

        const { ...data } = result.data
        const passwordHash = await hashPassword(data.password)

        await prisma.users.create({
            data: {
                name: data.name,
                email: data.email,
                password_hash: passwordHash,
                department_id: data.department,
            }
        })

        return NextResponse.json(
            {
                success: true,
                message: "Usuário cadastrado com sucesso!",
            },
            { status: 201 }
        )
    } catch (error: unknown) {

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return NextResponse.json(
                { success: false, message: "Este e-mail já está cadastrado." },
                { status: 409 }
            )
        }

        console.error(error)
        return NextResponse.json(
            { success: false, message: "Erro interno. Tente novamente." },
            { status: 500 },
        )
    }
}
