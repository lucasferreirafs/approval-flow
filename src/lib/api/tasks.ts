import { EnrichedTask, Task } from "@/interfaces"
import { fetchUserData } from "./users"
import { fetchDepartmentData } from "./departments"

// Enriquecer uma tarefa com dados de usuário e departamento
export const enrichTaskWithData = async (task: Task): Promise<EnrichedTask> => {
   const [createdByUser, departmentData] = await Promise.all([
      fetchUserData(task.created_by),
      fetchDepartmentData(task.department_id)
   ])

   return {
      ...task,
      createdByUser: createdByUser || undefined,
      departmentData: departmentData || undefined
   }
}

// Enriquecer lista de tarefas
export const enrichTasks = async (tasksList: Task[]): Promise<EnrichedTask[]> => {
   return Promise.all(tasksList.map(enrichTaskWithData))
}