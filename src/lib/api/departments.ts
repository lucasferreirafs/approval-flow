import { DepartmentData, DepartmentOptions } from "@/interfaces"

// Buscar dados do departamento
export const fetchDepartmentData = async (departmentId: string): Promise<DepartmentData | null> => {
   try {
      const res = await fetch(`/api/departments/${departmentId}`)
      if (!res.ok) return null
      const data = await res.json()
      return data.success ? data.data : null
   } catch (error) {
      console.error(`Erro ao buscar departamento ${departmentId}:`, error)
      return null
   }
}

// Mapear opções de departamento
export const mapDepartmentOptions = (departments: DepartmentData[]): DepartmentOptions[] => {
   return departments.map(dept => ({
      id: dept.id,
      value: dept.id,
      label: dept.name,
      color: dept.color,
   }))
}