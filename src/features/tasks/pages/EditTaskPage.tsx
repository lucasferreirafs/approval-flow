'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/contexts/toast-context'
import { ArrowLeft, RotateCw, Send } from 'lucide-react'
import {
   CustomButton,
   CustomCard,
   CustomCardContent,
   CustomInput,
   CustomSelect,
   CustomTextarea
} from '@/components/ui'
import { DepartmentOptions, Task } from '@/interfaces'
import { FormTaskUpdate, formTaskUpdate } from '@/schemas'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export function EditTaskPage() {
   const [loading, setLoading] = useState<boolean>(true)
   const [task, setTasks] = useState<Task | null>(null)
   const [departmentsOption, setDepartmentsOption] = useState<DepartmentOptions[]>([])
   const {
      register,
      reset,
      handleSubmit,
      control,
      formState: { errors },
   } = useForm<FormTaskUpdate>({
      resolver: zodResolver(formTaskUpdate),
   })
   const params = useParams()
   const route = useRouter()
   const { addToast } = useToast()
   const taskId = params.id

   useEffect(() => {
      const fetchAllData = async () => {
         setLoading(true)
         try {
            const [taskRes, departmentRes] = await Promise.all([
               fetch(`/api/tasks/${taskId}`),
               fetch(`/api/departments`)
            ])

            if (!taskRes.ok || !departmentRes.ok) {
               throw new Error("Não foi possível carregar as informações.")
            }

            const [taskJson, departmentJson] = await Promise.all([
               taskRes.json(),
               departmentRes.json()
            ])

            if (!taskJson.success || !departmentJson.success) {
               throw new Error("Dados inválidos recebidos do servidor.")
            }

            const departmentData = departmentJson.data
            const options: DepartmentOptions[] = departmentData.map(
               (dept: { id: string, name: string, color?: string }) => ({
                  id: dept.id,
                  value: dept.id,
                  label: dept.name,
                  color: dept.color,
               })
            )
            setDepartmentsOption(options)

            const taskData = Array.isArray(taskJson.data) ? taskJson.data[0] : taskJson.data
            setTasks(taskData)

            reset({
               title: taskData.title,
               description: taskData.description,
               department: taskData.department_id,
               desiredDate: taskData.desired_date.split('T')[0],
            })

         } catch (error: unknown) {
            const message = error instanceof Error
               ? error.message
               : "Erro ao carregar tarefa"

            addToast({
               title: "Ops! Ocorreu um erro.",
               message,
               type: "error",
            })

         } finally {
            setLoading(false)
         }
      }

      if (taskId) {
         fetchAllData()
      }
   }, [taskId, addToast, reset])

   const onSubmit = async (data: FormTaskUpdate) => {
      setLoading(true)
      try {
         if (!data.department) {
            throw new Error("Selecione um departamento válido")
         }

         const res = await fetch("/api/tasks/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               ...data,
               department_id: data.department,
               taskId: task?.id
            }),
         })

         const responseJson = await res.json()

         if (!res.ok) {
            throw new Error(
               responseJson.message ||
               "Erro ao atualizar tarefa. Tente novamente."
            )
         }

         addToast({
            title: "Secesso!",
            message: "Tarefa reenviada para aprovação.",
            type: "success"
         })
         route.push("/tasks")

      } catch (error: unknown) {
         console.error("Erro ao atualizar tarefa:", error)

         const message = error instanceof Error
            ? error.message
            : "Erro ao carregar tarefa"

         addToast({
            title: "Ops! Ocorreu um erro.",
            message,
            type: "error"
         })

      } finally {
         setLoading(false)
      }
   } 

   if(loading) {
      return (
         <div className="py-12 flex items-center justify-center text-gray-500">
            <RotateCw className="h-4 w-4 animate-spin mr-2" />
            Carregando...
         </div>
      )
   }

   if (!task) {
      return (
         <div className="text-center py-12">
            <p className="text-muted-foreground">Tarefa não encontrada</p>
            <Link href={`/tasks/${taskId}`}>
               <CustomButton variant="outline" className="mt-4">
                  Voltar para tarefa
               </CustomButton>
            </Link>
         </div>
      )
   }

   return (
      <div className="max-w-2xl mx-auto space-y-6">
         {/* Header */}
         <div className="flex items-center gap-4">
            <Link href={`/tasks/${"id task"}`}>
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
         {task.rejection_reason && (
            <CustomCard className="border-destructive/50 bg-destructive/5">
               <CustomCardContent className="p-4">
                  <h3 className="font-medium text-destructive mb-1">Motivo da Rejeição</h3>
                  <p className="text-sm text-foreground">{task.rejection_reason}</p>
               </CustomCardContent>
            </CustomCard>
         )}

         {/* Formulário */}
         <CustomCard>
            <CustomCardContent className="p-6">
               <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                  <div className='space-y-1'>
                     <CustomInput
                        {...register("title", { required: true })}
                        label="Título"
                        placeholder="Ex: Solicitação de novo equipamento"
                     />
                     {errors.title && <p className="text-xs text-red-500 mt-2">{errors.title.message}</p>}
                  </div>

                  <div>
                     <CustomTextarea
                        {...register("description", { required: true })}
                        label="Descrição"
                        placeholder="Descreva detalhadamente sua solicitação..."
                        className="min-h-30"
                     />
                     {errors.description && <p className="text-xs text-red-500 mt-2">{errors.description.message}</p>}
                  </div>

                  <div className='space-y-1'>
                     <Controller
                        name="department"
                        control={control}
                        render={({ field }) => (
                           <CustomSelect
                              {...field}
                              options={departmentsOption}
                              placeholder="Selecione o departamento"
                              showDot
                           />
                        )}
                     />
                     {errors.department && <p className="text-xs text-red-500 mt-2">{errors.department.message}</p>}
                  </div>

                  <div className='space-y-1'>
                     <CustomInput
                        {...register("desiredDate", { required: true })}
                        label="Data desejada"
                        type="date"
                     />
                     {errors.desiredDate && <p className="text-xs text-red-500 mt-2">{errors.desiredDate.message}</p>}
                  </div>

                  <div className="flex gap-3 pt-4">
                     <Link href={`/tasks/${taskId}`} className="flex-1">
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
