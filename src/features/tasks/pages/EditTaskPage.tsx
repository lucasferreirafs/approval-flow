'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/contexts/toast-context'
import { ArrowLeft, Send } from 'lucide-react'

export function EditTaskPage() {
   const params = useParams()
   const router = useRouter()
   const { addToast } = useToast()
   const [loading, setLoading] = useState(false)

   // Busca a tarefa pelo id e retorna os dados da tarefas

   const departmentOptions = departments.map((d) => ({
      value: d.name,
      label: d.name,
   }))

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) return

      setLoading(true)

      await new Promise((resolve) => setTimeout(resolve, 1500))

      addToast({
         title: 'Tarefa reenviada para aprovação',
         message: 'Suas alterações foram salvas.',
         type: 'success',
      })

      router.push('/dashboard')
   }

   if (!task) {
      return (
         <div className="text-center py-12">
            <p className="text-muted-foreground">Tarefa não encontrada</p>
         </div>
      )
   }

   return (
      <div className="max-w-2xl mx-auto space-y-6">
         {/* Header */}
         <div className="flex items-center gap-4">
            <Link href={`/tasks/${task.id}`}>
               <CustomButton variant="ghost" className="h-9 w-9 p-0">
                  <ArrowLeft className="h-5 w-5" />
               </CustomButton>
            </Link>
            <div>
               <h1 className="text-2xl font-semibold text-foreground">Editar Tarefa</h1>
               <p className="text-muted-foreground mt-1">Corrija os dados e reenvie para aprovação</p>
            </div>
         </div>

         {/* Motivo da rejeição */}
         {task.rejectionReason && (
            <CustomCard className="border-destructive/50 bg-destructive/5">
               <CustomCardContent className="p-4">
                  <h3 className="font-medium text-destructive mb-1">Motivo da Rejeição</h3>
                  <p className="text-sm text-foreground">{task.rejectionReason}</p>
               </CustomCardContent>
            </CustomCard>
         )}

         {/* Formulário */}
         <CustomCard>
            <CustomCardContent className="p-6">
               <form onSubmit={handleSubmit} className="space-y-6">
                  <CustomInput
                     label="Título"
                     placeholder="Ex: Solicitação de novo equipamento"
                     value={formData.title}
                     onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                     error={errors.title}
                  />

                  <CustomTextarea
                     label="Descrição"
                     placeholder="Descreva detalhadamente sua solicitação..."
                     value={formData.description}
                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                     error={errors.description}
                     className="min-h-[120px]"
                  />

                  <CustomSelect
                     label="Departamento responsável"
                     options={departmentOptions}
                     value={formData.department}
                     onChange={(value) => setFormData({ ...formData, department: value })}
                     error={errors.department}
                  />

                  <CustomInput
                     label="Data desejada"
                     type="date"
                     value={formData.desiredDate}
                     onChange={(e) => setFormData({ ...formData, desiredDate: e.target.value })}
                     error={errors.desiredDate}
                  />

                  <div className="flex gap-3 pt-4">
                     <Link href={`/tasks/${task.id}`} className="flex-1">
                        <CustomButton type="button" variant="outline" fullWidth>
                           Cancelar
                        </CustomButton>
                     </Link>
                     <CustomButton type="submit" fullWidth loading={loading} className="flex-1">
                        <Send className="h-4 w-4 mr-2" />
                        Reenviar para aprovação
                     </CustomButton>
                  </div>
               </form>
            </CustomCardContent>
         </CustomCard>
      </div> 
   )
}
