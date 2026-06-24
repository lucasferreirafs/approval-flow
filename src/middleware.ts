import { jwtVerify } from "jose"
import { type NextRequest, NextResponse } from "next/server"

const PUBLIC_ROUTES = ["/login", "/register"]

async function isValidToken(token: string): Promise<boolean> {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) return false
    const key = new TextEncoder().encode(secret)
    await jwtVerify(token, key)
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("approval_flow_token")?.value
    const { pathname } = request.nextUrl

    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))

    if (isPublicRoute) {
        if (token && (await isValidToken(token))) {
            return NextResponse.redirect(new URL("/dashboard", request.url))
        }
        return NextResponse.next()
    }

    if (!token || !(await isValidToken(token))) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.png|.*\\.jpg|.*\\.svg).*)"
  ],
}