import { comparePassword, signJwt } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { loginSchema } from "@/schemas/authentication.schema"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = loginSchema.safeParse(body)

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
    const user = await prisma.users.findUnique({
      where: {
        email: data.email,
      }
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "E-mail ou senha inválidos.",
        },
        { status: 401 }
      )
    }

    const valid = await comparePassword(data.password, user?.password_hash)

    if (!valid) {
      return NextResponse.json(
        { success: false, message: "Não foi possível realizar o login. Verifique sua senha." }
      )
    }

    const token = await signJwt({
      sub: user.id,
      email: user.email,
      nome: user.name,
      avatar: user.avatar
    })

    const response = NextResponse.json(
      {
        success: true,
        message: "Login realizado com sucesso!",
        user: {
          id: user.id,
          nome: user.name,
          email: user.email,
          avatar: user.avatar
        }
      },
      { status: 200 }
    )

    response.cookies.set("approval_flow_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    })
    
    return response

  } catch (error: unknown) {
    console.error(error)
    return NextResponse.json(
      { success: false, message: "Erro interno. Tente novamente." },
      { status: 500 }
    )
  }
}
