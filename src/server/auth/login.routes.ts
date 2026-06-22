// import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"


export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "E-mail ou senha inválidos." },
        { status: 401 }
      )
    }

    return NextResponse.json({email, password})
  } catch (error: unknown) {
    console.error(error)
    return NextResponse.json(
      { success: false, message: "Erro interno. Tente novamente." },
      { status: 500 }
    )
  }
}
