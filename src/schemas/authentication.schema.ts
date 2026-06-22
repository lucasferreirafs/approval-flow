import { z } from 'zod'

export const registerSchema = z.object({
    name: z
        .string()
        .min(3, 'O nome deve ter pelo menos 3 caracteres'),
    email: z
        .string()
        .email('E-mail inválido'),
    password: z
        .string()
        .min(8, 'A senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string(),
    department: z
        .string()
        .min(1, 'Selecione um departamento'),
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: 'As senhas não coincidem',
        path: ['confirmPassword'],
    }
)

// Schema exclusivo para a API — sem confirmPassword
export const registerApiSchema = z.object({
    name: z
        .string()
        .min(3, 'O nome deve ter pelo menos 3 caracteres'),
    email: z
        .string()
        .email('E-mail inválido'),
    password: z
        .string()
        .min(8, 'A senha deve ter pelo menos 8 caracteres'),
    department: z
        .string()
        .min(1, 'Selecione um departamento'),
})

export type RegisterSchema = z.infer<typeof registerSchema>
export type RegisterApiSchema = z.infer<typeof registerApiSchema>