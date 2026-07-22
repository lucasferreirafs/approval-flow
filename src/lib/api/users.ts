import { UserData } from "@/interfaces"

// Buscar dados do usuário
export const fetchUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const res = await fetch(`/api/users/${userId}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error(`Erro ao buscar usuário ${userId}:`, error)
    return null
  }
}