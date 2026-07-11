export interface Task {
   id: string
   title: string
   description: string
   department_id: string
   status: TaskStatus
   created_by: string
   created_at: string
   desired_date: string
   approver_id: string
   approved_at: string
   rejected_at: string
   rejection_reason: string
   updated_at: string
   task_history: TaskHistory[]
}

export interface TaskHistory {
   id: string
   task_id: string
   action: TaskAction
   date: string
   user_id: string | null
   user_name: string
   comment: string | null
}

export const TaskAction = {
   CRIADA: "criada",
   APROVADA: "aprovada",
   REJEITADA: "rejeitada",
   EDITADA: "editada",
   REENVIADA: "reenviada",
} as const

export const TaskStatus = {
   PENDENTE: "pendente",
   APROVADA: "aprovada",
   REJEITADA: "rejeitada",
   CONCLUIDA: "concluida",
} as const

export type TaskAction = typeof TaskAction[keyof typeof TaskAction]
export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus]