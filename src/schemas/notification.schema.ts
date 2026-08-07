import { z } from "zod"

export const notificationPreferencesSchema = z.object({
   email_notifications: z.boolean(),
   push_notifications: z.boolean(),
   notify_task_created: z.boolean(),
   notify_task_approved: z.boolean(),
   notify_task_rejected: z.boolean(),
}).strict()

export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>
