import { z } from "zod"

export const formTaskSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "Este campo é obrigatório.")
        .max(100, "O título deve ter no máximo 100 caracteres."),

    description: z
        .string()
        .trim()
        .min(1, "Este campo é obrigatório.")
        .max(1000, "A descrição deve ter no máximo 1000 caracteres."),

    department: z
        .string("Este campo é obrigatório.")
        .min(1, "Este campo é obrigatório."),

    desiredDate: z
        .string()
        .min(1, "Este campo é obrigatório.")
        .refine((date) => !isNaN(Date.parse(date)), {
            message: "Data inválida.",
        })
        .refine((date) => new Date(date) >= new Date(new Date().toDateString()), {
            message: "Ops! A data escolhida já passou. Selecione uma data futura.",
        }),
})

export const formTaskUpdate = formTaskSchema.extend({
    taskId: z.string().uuid("ID da tarefa inválido").optional(),
})

export const formTaskApiSchema = formTaskSchema.extend({
    department_id: z.string().uuid("ID do departamento inválido"),
    taskId: z.string().uuid("ID da tarefa inválido").optional(),
})

export const taskHistorySchema = z.object({
    taskId: z.string().uuid(),
    action: z.enum(["criada", "aprovada", "rejeitada", "editada", "reenviada"]),
    comment: z.string().nullable(),
}).transform((data) => {
    const statusMap = {
        "criada": "pendente",
        "aprovada": "aprovada",
        "rejeitada": "rejeitada",
        "editada": "pendente",
        "reenviada": "pendente",
    } as const

    return {
        ...data,
        status: statusMap[data.action],
    }
})

export type TaskHistoryInput = z.infer<typeof taskHistorySchema>
export type FormTaskSchema = z.infer<typeof formTaskSchema>
export type FormTaskApiSchema = z.infer<typeof formTaskApiSchema>
export type FormTaskUpdate = z.infer<typeof formTaskUpdate>