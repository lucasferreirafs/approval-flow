import bcrypt from "bcryptjs"
import { SignJWT } from "jose"

export type JwtPayload = {
  sub: string
  email: string
  nome: string
  avatar: string | null
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function signJwt(payload: JwtPayload) {
    const secret = process.env.JWT_SECRET
    if(!secret) throw new Error("JWT_SECRET não configurado.")
    const key = new TextEncoder().encode(secret)
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("8h")
        .sign(key)
}