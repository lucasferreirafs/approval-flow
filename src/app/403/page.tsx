"use client"

import Link from "next/link"
import { ArrowLeft, ShieldX } from "lucide-react"
import { CustomButton } from "@/components/ui/CustomButton"

export default function ForbiddenPage() {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F5F5F5] px-6">
            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.12),transparent_45%)]" />
            <div className="absolute -left-40 top-10 h-80 w-80 rounded-full bg-indigo-500/10 blur-[140px]" />
            <div className="absolute -right-40 bottom-10 h-80 w-80 rounded-full bg-violet-500/10 blur-[140px]" />
            <div className="relative w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-10 shadow-xl">

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10">
                    <ShieldX className="h-10 w-10 text-red-500" />
                </div>

                <div className="mt-6 flex justify-center">
                    <span className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-1 text-sm font-medium text-red-400">
                        Erro 403
                    </span>
                </div>

                <h1 className="mt-6 text-center text-4xl font-bold text-gray-900">
                    Acesso Restrito
                </h1>

                <p className="mx-auto mt-4 max-w-md text-center text-gray-600">
                    Você está autenticado, porém seu perfil não possui permissão para acessar
                    esta funcionalidade.
                </p>

                <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <h2 className="font-semibold text-gray-900">
                        O que aconteceu?
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                        O sistema identificou que seu cargo não possui autorização para
                        visualizar esta página. Caso acredite que isso seja um erro,
                        entre em contato com o administrador.
                    </p>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/dashboard"
                        className="flex-1 rounded-xl bg-indigo-600 px-5 py-3 text-center font-medium text-white transition hover:bg-indigo-700"
                    >
                        Ir para Dashboard
                    </Link>

                    <CustomButton
                        onClick={() => history.back()}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        <ArrowLeft size={18} />
                        Voltar
                    </CustomButton>
                </div>

                <div className="mt-10 border-t border-gray-200 pt-6 text-center">
                    <p className="text-xs text-gray-500">
                        ApprovalFlow • Controle de Acesso Baseado em Permissões
                    </p>
                </div>
            </div>
        </main>
    )
}