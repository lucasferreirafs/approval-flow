'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/contexts/toast-context'
import { ArrowLeft, Check, X, Edit, Calendar, User, Building2, Clock, RotateCw } from 'lucide-react'
import { useSession } from '@/contexts/session-context';
import { CustomBadge, CustomButton, CustomCard, CustomCardContent, CustomModal, CustomTextarea } from '@/components/ui';
import { Task, TaskAction, TaskHistory, TaskStatus } from '@/interfaces'
import { formatLocalDate } from '@/utils/date'

interface StatusConfig {
   label: string
   variant: 'default' | 'success' | 'error' | 'warning' | 'info'
}

interface UserData {
   id: string
   name: string
   email: string
}

interface DepartmentData {
   id: string
   name: string
   color?: string
}

const statusConfig: Record<TaskStatus, StatusConfig> = {
   pendente: { label: 'Pendente', variant: 'warning' },
   aprovada: { label: 'Aprovada', variant: 'success' },
   rejeitada: { label: 'Rejeitada', variant: 'error' },
   concluida: { label: 'Concluída', variant: 'info' },
}

const actionLabels: Record<TaskAction, string> = {
   criada: 'Tarefa criada',
   aprovada: 'Tarefa aprovada',
   rejeitada: 'Tarefa rejeitada',
   editada: 'Tarefa editada',
   reenviada: 'Tarefa reenviada para aprovação',
}

export function TaskDetailsPage() {
   const [approveLoading, setApproveLoading] = useState<boolean>(false)
   const [rejectLoading, setRejectLoading] = useState<boolean>(false)
   const [loading, setLoading] = useState<boolean>(true)
   const [rejectModalOpen, setRejectModalOpen] = useState(false)
   const [rejectReason, setRejectReason] = useState('')
   const [task, setTask] = useState<Task | null>(null)
   const [taskHistory, setTaskHistory] = useState<TaskHistory[]>([])
   const [createdByUser, setCreatedByUser] = useState<UserData | null>(null)
   const [approverUser, setApproverUser] = useState<UserData | null>(null)
   const [department, setDepartment] = useState<DepartmentData | null>(null)
   const { user } = useSession()
   const { addToast } = useToast()

   const params = useParams()
   const taskId = params.id

   const fetchUserData = async (userId: string): Promise<UserData | null> => {
      try {
         const res = await fetch(`/api/users/${userId}`)
         if (!res.ok) return null
         const data = await res.json()
         return data.success ? data.data : null
      } catch {
         return null
      }
   }

   const fetchDepartmentData = async (departmentId: string): Promise<DepartmentData | null> => {
      try {
         const res = await fetch(`/api/departments/${departmentId}`)
         if (!res.ok) return null
         const data = await res.json()
         return data.success ? data.data : null
      } catch {
         return null
      }
   }

   useEffect(() => {
      const fetchAllData = async () => {
         setLoading(true)
         try {
            const [taskRes, historyRes] = await Promise.all([
               fetch(`/api/tasks/${taskId}`),
               fetch(`/api/tasks/history/${taskId}`),
            ])

            const [taskJson, historyJson] = await Promise.all([
               taskRes.json(),
               historyRes.json()
            ])

            if (!taskJson.success || !historyJson.success) {
               throw new Error("Não foi possível encontrar as informações da tarefa selecionada.")
            }

            const taskData = taskJson.data
            setTask(taskData)
            setTaskHistory(historyJson.data)

            // Buscar dados do usuário que criou (criado_por)
            if (taskData.created_by) {
               const userData = await fetchUserData(taskData.created_by)
               setCreatedByUser(userData)
            }

            // Buscar dados do aprovador
            if (taskData.approver_id) {
               const approverData = await fetchUserData(taskData.approver_id)
               setApproverUser(approverData)
            }

            // Buscar dados do departamento
            if (taskData.department_id) {
               const departmentData = await fetchDepartmentData(taskData.department_id)
               setDepartment(departmentData)
            }

         } catch (error: unknown) {
            console.error("Ocorreu um erro: ", error)
            if (error instanceof Error) {
               addToast({
                  title: "Ops! Ocorreu um erro.",
                  message: error.message,
                  type: "error",
               })
            }

         } finally {
            setLoading(false)
         }
      }

      if (taskId) {
         fetchAllData()
      }

   }, [taskId, addToast])

   const handleApprove = async () => {
      setApproveLoading(true)
      try {
         const res = await fetch("/api/tasks/approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               taskId: taskId,
               action: "aprovada",
               comment: null
            })
         })

         if (!res.ok) {
            throw new Error("Por favor, tente novamente. Se o problema persistir, contate o suporte.")
         }

         setTask(prev => prev ? { ...prev, status: TaskStatus.APROVADA, approver_id: user.id } : null)

         addToast({
            title: 'Tarefa aprovada com sucesso!',
            message: 'Avisamos ao solicitante que está tudo pronto.',
            type: 'success',
         })

      } catch (error: unknown) {
         console.error("Erro na aprovação:", error)

         if (error instanceof Error) {
            addToast({
               title: 'Falha na aprovação',
               message: error.message,
               type: 'error',
            })
         }
      } finally {
         setApproveLoading(false)
      }
   }

   const handleReject = async () => {
      setRejectLoading(true)
      if (!rejectReason.trim()) {
         addToast({
            title: 'Erro',
            message: 'Informe o motivo da rejeição.',
            type: 'error',
         })
         setRejectLoading(false)
         return
      }

      try {
         const res = await fetch("/api/tasks/reject", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               taskId: taskId,
               action: "rejeitada",
               comment: rejectReason
            })
         })

         if (!res.ok) {
            throw new Error("Por favor, tente novamente. Se o problema persistir, contate o suporte.")
         }

         setTask(prev => prev ? {
            ...prev,
            status: TaskStatus.REJEITADA,
            rejection_reason: rejectReason,
            rejected_at: new Date().toISOString()
         } : null)

         addToast({
            title: 'Tarefa rejeitada',
            message: 'Avisamos ao solicitante.',
            type: 'success',
         })

         setRejectModalOpen(false)
         setRejectReason('')

      } catch (error: unknown) {
         console.error("Erro ao rejeitar:", error)

         if (error instanceof Error) {
            addToast({
               title: 'Falha ao rejeitar tarefa',
               message: error.message,
               type: 'error',
            })
         }

      } finally {
         setRejectLoading(false)
      }
   }

   if (!task) {
      return loading ? (
         <div className="py-12 flex items-center justify-center text-gray-500">
            <RotateCw className="h-4 w-4 animate-spin mr-2" />
            Carregando...
         </div>
      ) : (
         <div className="text-center py-12">
            <p className="text-muted-foreground">Tarefa não encontrada</p>
            <Link href="/tasks">
               <CustomButton variant="outline" className="mt-4">
                  Voltar para tarefas
               </CustomButton>
            </Link>
         </div>
      )
   }

   const canApprove = (user.role === 'aprovador' || user.role === 'admin') && task.status === 'pendente'
   const canEdit = user.role === 'colaborador' && task.status === 'rejeitada'
   return (
      <>
         <div className='max-w-4xl mx-auto space-y-6'>
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
               <div className="flex items-start gap-4">
                  <Link href="/tasks">
                     <CustomButton variant="ghost" className="h-9 w-9 p-0 mt-1">
                        <ArrowLeft className="h-5 w-5" />
                     </CustomButton>
                  </Link>
                  <div>
                     <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold text-foreground">{task.title}</h1>
                        <CustomBadge variant={statusConfig[task.status].variant}>
                           {statusConfig[task.status].label}
                        </CustomBadge>
                     </div>
                     <p className="text-muted-foreground mt-1">
                        Criado por {createdByUser?.name || 'Carregando...'} em {new Date(task.created_at).toLocaleDateString('pt-BR')}
                     </p>
                  </div>
               </div>

               {/* Ações */}
               <div className="flex gap-2">
                  {canApprove && (
                     <>
                        <CustomButton onClick={handleApprove} disabled={approveLoading}>
                           {approveLoading ?
                              <RotateCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />
                           }
                           Aprovar
                        </CustomButton>
                        <CustomButton variant="destructive" onClick={() => setRejectModalOpen(true)}>
                           <X className="h-4 w-4 mr-2" />
                           Rejeitar
                        </CustomButton>
                     </>
                  )}
                  {canEdit && (
                     <Link href={`/tasks/${taskId}/edit`}>
                        <CustomButton>
                           <Edit className="h-4 w-4 mr-2" />
                           Editar e reenviar
                        </CustomButton>
                     </Link>
                  )}
               </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
               {/* Detalhes principais */}
               <div className="lg:col-span-2 space-y-6">
                  <CustomCard>
                     <CustomCardContent className="p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Descrição</h2>
                        <p className="text-gray-700 leading-relaxed">{task.description}</p>
                     </CustomCardContent>
                  </CustomCard>

                  {/* Motivo da rejeição */}
                  {task.status === 'rejeitada' && task.rejection_reason && (
                     <CustomCard className="border-destructive/50 bg-destructive/5">
                        <CustomCardContent className="p-6">
                           <h2 className="text-lg font-semibold text-destructive mb-2">Motivo da Rejeição</h2>
                           <p className="text-foreground">{task.rejection_reason}</p>
                        </CustomCardContent>
                     </CustomCard>
                  )}

                  {/* Timeline */}
                  <CustomCard>
                     <CustomCardContent className="p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Histórico</h2>
                        <div className="space-y-4">
                           {taskHistory.map((item, index) => (
                              <div key={item.id} className="flex gap-4">
                                 <div className="relative">
                                    <div className="w-3 h-3 rounded-full bg-primary mt-1.5" />
                                    {index < taskHistory.length - 1 && (
                                       <div className="absolute top-4 left-1.5 w-0.5 h-full -translate-x-1/2 bg-border" />
                                    )}
                                 </div>
                                 <div className="flex-1 pb-4">
                                    <p className="font-medium text-foreground">{actionLabels[item.action]}</p>
                                    <p className="text-sm text-muted-foreground">
                                       por {item.user_name} em {new Date(item.date).toLocaleDateString('pt-BR')} às{' '}
                                       {new Date(item.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    {item.comment && (
                                       <p className="text-sm text-muted-foreground mt-1 italic">{item.comment}</p>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </CustomCardContent>
                  </CustomCard>
               </div>

               {/* Sidebar com informações */}
               <div className="space-y-6">
                  <CustomCard>
                     <CustomCardContent className="p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-foreground">Informações</h2>

                        <div className="flex items-center gap-3">
                           <Building2 className="h-5 w-5 text-muted-foreground" />
                           <div>
                              <p className="text-sm text-muted-foreground">Departamento</p>
                              <p className="font-medium text-foreground">
                                 {department?.name || 'Carregando...'}
                              </p>
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <Calendar className="h-5 w-5 text-muted-foreground" />
                           <div>
                              <p className="text-sm text-muted-foreground">Data Desejada</p>
                              <p className="font-medium text-foreground">
                                 {formatLocalDate(task.desired_date)}
                              </p>
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <User className="h-5 w-5 text-muted-foreground" />
                           <div>
                              <p className="text-sm text-muted-foreground">Criado por</p>
                              <p className="font-medium text-foreground">
                                 {createdByUser?.name || 'Carregando...'}
                              </p>
                           </div>
                        </div>

                        {task.approver_id && (
                           <div className="flex items-center gap-3">
                              <User className="h-5 w-5 text-muted-foreground" />
                              <div>
                                 <p className="text-sm text-muted-foreground">Aprovador</p>
                                 <p className="font-medium text-foreground">
                                    {approverUser?.name || 'Carregando...'}
                                 </p>
                              </div>
                           </div>
                        )}

                        <div className="flex items-center gap-3">
                           <Clock className="h-5 w-5 text-muted-foreground" />
                           <div>
                              <p className="text-sm text-muted-foreground">Criado em</p>
                              <p className="font-medium text-foreground">
                                 {new Date(task.created_at).toLocaleDateString('pt-BR')}
                              </p>
                           </div>
                        </div>
                     </CustomCardContent>
                  </CustomCard>
               </div>
            </div>
         </div>

         {/* Modal de rejeição */}
         <CustomModal
            isOpen={rejectModalOpen}
            onClose={() => {
               setRejectModalOpen(false)
               setRejectReason('')
            }}
            title="Rejeitar Tarefa"
            footer={
               <>
                  <CustomButton variant="outline" onClick={() => setRejectModalOpen(false)}>
                     Cancelar
                  </CustomButton>
                  <CustomButton variant="destructive" onClick={handleReject} disabled={rejectLoading}>
                     {rejectLoading ?
                        <RotateCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />
                     }
                     Confirmar Rejeição
                  </CustomButton>
               </>
            }
         >
            <div className="space-y-4">
               <p className="text-muted-foreground">
                  Informe o motivo da rejeição. Esta informação será enviada ao solicitante.
               </p>
               <CustomTextarea
                  label="Motivo da rejeição"
                  placeholder="Descreva o motivo..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
               />
            </div>
         </CustomModal>
      </>
   )
}