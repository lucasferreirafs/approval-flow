import { jsonResponse } from "@/lib/api-response"
import { hashPassword } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { registerApiSchema } from "@/schemas/authentication.schema"
import { Prisma } from "../../../generated/prisma/client"

export async function POST(request: Request) {
  try {
    let body: unknown

    try {
      body = await request.json()
    } catch {
      return jsonResponse(
        { success: false, message: "A requisição contém dados inválidos." },
        { status: 400 }
      )
    }

    const result = registerApiSchema.safeParse(body)

    if (!result.success) {
      return jsonResponse(
        {
          success: false,
          message: "Dados de cadastro inválidos.",
          errors: result.error.flatten(),
        },
        { status: 422 }
      )
    }

    const email = result.data.email.trim().toLowerCase()
    const [existingUser, department] = await Promise.all([
      prisma.users.findUnique({
        where: { email },
        select: { id: true },
      }),
      prisma.departments.findUnique({
        where: { id: result.data.department },
        select: { id: true },
      }),
    ])

    if (existingUser) {
      return jsonResponse(
        { success: false, message: "Não foi possível realizar o cadastro com estes dados." },
        { status: 409 }
      )
    }

    if (!department) {
      return jsonResponse(
        { success: false, message: "O departamento selecionado não foi encontrado." },
        { status: 422 }
      )
    }

    const passwordHash = await hashPassword(result.data.password)

    await prisma.users.create({
      data: {
        name: result.data.name.trim(),
        email,
        password_hash: passwordHash,
        department_id: department.id,
      },
    })

    return jsonResponse(
      { success: true, message: "Usuário cadastrado com sucesso!" },
      { status: 201 }
    )
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return jsonResponse(
          { success: false, message: "Não foi possível realizar o cadastro com estes dados." },
          { status: 409 }
        )
      }

      if (error.code === "P2003") {
        return jsonResponse(
          { success: false, message: "O departamento selecionado não foi encontrado." },
          { status: 422 }
        )
      }
    }

    console.error("Erro ao cadastrar usuário:", error)

    return jsonResponse(
      { success: false, message: "Erro interno. Tente novamente." },
      { status: 500 }
    )
  }
}
