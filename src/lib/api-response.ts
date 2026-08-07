import { NextResponse } from "next/server"

export function jsonResponse<T>(body: T, init: ResponseInit) {
   const headers = new Headers(init.headers)
   headers.set("Cache-Control", "no-store")

   return NextResponse.json(body, { ...init, headers })
}
