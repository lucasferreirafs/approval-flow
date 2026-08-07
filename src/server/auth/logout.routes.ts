import { jsonResponse } from "@/lib/api-response"

const AUTH_COOKIE_NAME = "approval_flow_token"

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
