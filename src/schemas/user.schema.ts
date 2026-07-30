import { z } from "zod"

export const UserRole = z.enum(["colaborador", "aprovador", "admin"])
export type UserRole = z.infer<typeof UserRole>

export const updateUserSchema = z.object({
   role: UserRole.optional(),
   department_id: z.string().uuid("ID do departamento inválido").optional(),
   name: z.string().min(1, "Nome é obrigatório").optional(),
   email: z.string().email("E-mail inválido").optional(),
})

export type UpdateUserSchema = z.infer<typeof updateUserSchema>

export const userSchema = z.object({
   id: z.string().uuid(),
   name: z.string().min(1, "Nome é obrigatório"),
   email: z.string().email("E-mail inválido"),
   role: UserRole,
   department_id: z.string().uuid("ID do departamento inválido"),
   avatar: z.string().optional(),
   is_approver: z.boolean(),
   email_notifications: z.boolean(),
   push_notifications: z.boolean(),
   notify_task_created: z.boolean(),
   notify_task_approved: z.boolean(),
   notify_task_rejected: z.boolean(),
   created_at: z.string().datetime(),
   updated_at: z.string().datetime(),
})

export type User = z.infer<typeof userSchema>