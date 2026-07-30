export interface User {
   id: string
   name: string
   email: string
   role: string
   department_id: string
   avatar?: string
   is_approver: boolean
   email_notifications: boolean
   push_notifications: boolean
   notify_task_created: boolean
   notify_task_approved: boolean
   notify_task_rejected: boolean
}

export interface UserData {
   id: string
   name: string
   email: string
}