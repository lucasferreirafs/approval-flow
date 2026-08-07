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

export const loginSchema = z.object({
    email: z
        .string("Preencha o campo de e-mail.")
        .email("Por favor, informe um endereço de e-mail válido."),
    password: z
        .string("Digite sua senha.")
        .min(8, "A senha deve ter pelo menos 8 caracteres"),
})


export const changePassword = z.object({
    currentPassword: z
        .string("Digite sua senha.")
        .min(8, "A senha deve ter pelo menos 8 caracteres")
        .max(128, "A senha deve ter no máximo 128 caracteres"),
    newPassword: z
        .string("Digite sua senha.")
        .min(8, "A senha deve ter pelo menos 8 caracteres")
        .max(128, "A senha deve ter no máximo 128 caracteres"),
    confirmPassword: z
        .string("Digite sua senha.")
        .min(8, "A senha deve ter pelo menos 8 caracteres")
        .max(128, "A senha deve ter no máximo 128 caracteres"),
}).refine(
    (data) => data.newPassword === data.confirmPassword,
    {
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
    }
).refine(
    (data) => data.currentPassword !== data.newPassword,
    {
        message: "A nova senha deve ser diferente da senha atual",
        path: ["newPassword"],
    }
)


export type RegisterSchema = z.infer<typeof registerSchema>
export type RegisterApiSchema = z.infer<typeof registerApiSchema>
export type ChangePassword = z.infer<typeof changePassword>
