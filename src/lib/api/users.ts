import { DepartmentData, User, UserData, UserWithDept } from "@/interfaces"

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

// Enriquecer usuários com nome do departamento
export const enrichUsersWithDepartment = (usersList: User[], deptList: DepartmentData[]): UserWithDept[] => {
  return usersList.map(user => ({
    ...user,
    department_name: deptList.find(d => d.id === user.department_id)?.name
  }))
}