import { cookies } from "next/headers"
import { verifyJwt } from "./auth"

export async function getCurrentUser() {
    const cookieStore = await cookies()

    const token = cookieStore.get("approval_flow_token")?.value

    if (!token) {
        return null
    }
    const payload = await verifyJwt(token)

    if(!payload) {
        return null
    }
    
    return {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        perfil: payload.perfil,
        role: payload.role
    }
}