import { comparePassword, signJwt } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { loginSchema } from "@/schemas/authentication.schema"
import { NextResponse } from "next/server"

const AUTH_COOKIE_NAME = "approval_flow_token"
const SESSION_DURATION_IN_SECONDS = 60 * 60 * 8
const DUMMY_PASSWORD_HASH = "$2b$12$t.KmqfVms4/Idh7Vx14GmufbNPCKLN6clVMugYW.nzwKycxYQg55S"

function jsonResponse<T>(body: T, init: ResponseInit) {
  const headers = new Headers(init.headers)
  headers.set("Cache-Control", "no-store")

  return NextResponse.json(body, { ...init, headers })
}

export async function POST(request: Request) {
  try {
    let body: unknown

    try {
      body = await request.json()
    } catch {
      return jsonResponse(
        { success: false, message: "A requisição contém dados inválidos." },
        { status: 400 }
      )
    }

    const result = loginSchema.safeParse(body)

    if (!result.success) {
      return jsonResponse(
        {
          success: false,
          message: "Dados de acesso inválidos.",
          errors: result.error.flatten(),
        },
        { status: 422 }
      )
    }

    const email = result.data.email.trim().toLowerCase()
    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password_hash: true,
        avatar: true,
        role: true,
      },
    })

    // A comparação ocorre mesmo quando o usuário não existe para reduzir a diferença de tempo da resposta.
    const isPasswordValid = await comparePassword(
      result.data.password,
      user?.password_hash ?? DUMMY_PASSWORD_HASH
    )

    if (!user || !isPasswordValid) {
      return jsonResponse(
        { success: false, message: "E-mail ou senha inválidos." },
        { status: 401 }
      )
    }

    const token = await signJwt({
      id: user.id,
      email: user.email,
      name: user.name,
      perfil: user.avatar,
      role: user.role,
    })

    const response = jsonResponse(
      {
        success: true,
        message: "Login realizado com sucesso!",
        user: {
          id: user.id,
          nome: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      },
      { status: 200 }
    )

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_IN_SECONDS,
    })

    return response
  } catch (error: unknown) {
    console.error("Erro ao realizar login:", error)

    return jsonResponse(
      { success: false, message: "Erro interno. Tente novamente." },
      { status: 500 }
    )
  }
}
