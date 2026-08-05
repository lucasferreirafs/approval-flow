import { NextResponse } from "next/server"

const AUTH_COOKIE_NAME = "approval_flow_token"

function jsonResponse<T>(body: T, init: ResponseInit) {
  const headers = new Headers(init.headers)
  headers.set("Cache-Control", "no-store")

  return NextResponse.json(body, { ...init, headers })
}

export async function POST() {
  try {
    const response = jsonResponse(
      { success: true, message: "Logout realizado com sucesso." },
      { status: 200 }
    )

    response.cookies.set(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    })

    return response
  } catch (error: unknown) {
    console.error("Erro ao realizar logout:", error)

    return jsonResponse(
      { success: false, message: "Erro ao realizar o logout. Tente novamente." },
      { status: 500 }
    )
  }
}
