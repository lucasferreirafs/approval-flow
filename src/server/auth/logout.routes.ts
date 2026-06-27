import { NextResponse } from "next/server";


export async function POST() {
    try {
        const response = NextResponse.json(
            { success: true, message: "Logout realizado com sucesso." },
            { status: 200 }
        )
        response.cookies.delete("approval_flow_token")

        return response
    } catch(error: unknown) {
        console.error("Ocorreu um erro interno: ", error)
        return NextResponse.json(
            { success: false, message: "Erro ao realizar o Logout, Tente novamente." },
            { status: 500 }
        )
    }
}