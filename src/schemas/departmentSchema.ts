import { z } from "zod"

export const departmentSchema = z.object({
   name: z.string().trim().min(1, "O nome é obrigatório.").max(255, "Nome muito longo."),
   description: z.string().trim().max(1000, "Descrição muito longa.").optional().nullable(),
   color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida.").optional().nullable(),
})

export type DepartmentSchema = z.infer<typeof departmentSchema>