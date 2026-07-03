"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/contexts/toast-context"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import {
  CustomButton,
  CustomCard,
  CustomCardContent,
  CustomInput,
  CustomSelect,
  CustomTextarea
} from "@/components/ui"

interface Department {
  id: string
  name: string
  description: string
  color: string
}

interface DepartmentOption {
  id: string
  value: string
  label: string
  color: string
}

export function NewTaskPage() {
  const { addToast } = useToast()
  const route = useRouter()
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<DepartmentOption[]>([])

  // data



  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <CustomButton variant="ghost" className="h-9 w-9 p-0">
            <ArrowLeft className="h-5 w-5" />
          </CustomButton>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Nova Tarefa</h1>
          <p className="text-muted-foreground mt-1">
            Preencha os dados para criar uma nova solicitação
          </p>
        </div>
      </div>

      {/* Formulário */}
      <CustomCard>
        <CustomCardContent className="p-6">
          <form className="space-y-5">
            <div className="space-y-1">
              <CustomInput
                label="Título"
                placeholder="Ex: Solicitação de novo equipamento"
              />
            </div>

            <div className="space-y-1">
              <CustomTextarea
                label="Descrição"
                placeholder="Descreva detalhadamente sua solicitação..."
                className="min-h-30"
              />
            </div>

            <div className="space-y-1">
              <CustomSelect
                options={departments}
                showDot
                placeholder="Selecione o departamento"
              />
            </div>

            <div className="space-y-1">
              <CustomInput label="Data desejada" type="date" />
            </div>

            <div className="flex gap-3 pt-4">
              <Link href="/dashboard" className="flex-1">
                <CustomButton type="button" variant="outline" fullWidth>
                  Cancelar
                </CustomButton>
              </Link>
              <CustomButton type="submit" fullWidth loading={loading} className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                Enviar para aprovação
              </CustomButton>
            </div>
          </form>
        </CustomCardContent>
      </CustomCard>
    </div>
  )
}
