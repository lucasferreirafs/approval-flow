import { z } from "zod"

export const newTaskSchema = z.object({
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
        .string()
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

export const newTaskApiSchema = newTaskSchema.extend({
    department_id: z.string().uuid("ID do departamento inválido"),
})

export type NewTaskSchema = z.infer<typeof newTaskSchema>
export type NewTaskApiSchema = z.infer<typeof newTaskApiSchema>