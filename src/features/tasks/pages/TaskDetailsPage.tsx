'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/contexts/toast-context'
import { ArrowLeft, Check, X, Edit, Calendar, User, Building2, Clock } from 'lucide-react'
import { useSession } from '@/contexts/session-context';
import { CustomBadge, CustomButton, CustomCard, CustomCardContent, CustomModal, CustomTextarea } from '@/components/ui';

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'error' | 'warning' | 'info' }> = {
   pendente: { label: 'Pendente', variant: 'warning' },
   aprovada: { label: 'Aprovada', variant: 'success' },
   rejeitada: { label: 'Rejeitada', variant: 'error' },
   concluida: { label: 'Concluída', variant: 'info' },
}

const actionLabels: Record<string, string> = {
   criada: 'Tarefa criada',
   aprovada: 'Tarefa aprovada',
   rejeitada: 'Tarefa rejeitada',
   editada: 'Tarefa editada',
   reenviada: 'Tarefa reenviada para aprovação',
}

export default function TaskDetailsPage() {
   const params = useParams()
   const router = useRouter()
   const { user } = useSession()
   const { addToast } = useToast()
   const [rejectModalOpen, setRejectModalOpen] = useState(false)
   const [rejectReason, setRejectReason] = useState('')
   const [tasks, setTasks] = useState([])

   const [localTask, setLocalTask] = useState(() =>
      tasks.find((t: { id: string }) => t.id === params.id) || tasks[0]
   )

   useEffect(() => {
      const fetchTasks = async () => {
         const res = await fetch("/api/tasks")

      }
      fetchTasks()
   }, [])

   if (!localTask) {
      return (
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

   const handleApprove = () => {
      setLocalTask((prev) => ({
         ...prev,
         status: 'aprovada',
         approvedAt: new Date().toISOString(),
         history: [
            ...prev.history,
            {
               id: String(prev.history.length + 1),
               action: 'aprovada',
               date: new Date().toISOString(),
               user: 'Você',
               comment: 'Tarefa aprovada',
            },
         ],
      }))
      addToast({
         title: 'Tarefa aprovada!',
         message: 'O solicitante será notificado.',
         type: 'success',
      })
   }

   const handleReject = () => {
      if (!rejectReason.trim()) {
         addToast({
            title: 'Erro',
            message: 'Informe o motivo da rejeição.',
            type: 'error',
         })
         return
      }

      setLocalTask((prev) => ({
         ...prev,
         status: 'rejeitada',
         rejectedAt: new Date().toISOString(),
         rejectionReason: rejectReason,
         history: [
            ...prev.history,
            {
               id: String(prev.history.length + 1),
               action: 'rejeitada',
               date: new Date().toISOString(),
               user: 'Você',
               comment: rejectReason,
            },
         ],
      }))
      setRejectModalOpen(false)
      setRejectReason('')
      addToast({
         title: 'Tarefa rejeitada',
         message: 'O solicitante será notificado.',
         type: 'info',
      })
   }

   const canApprove = (user.role === 'aprovador' || user.role === 'admin') && localTask.status === 'pendente'
   const canEdit = user.role === 'colaborador' && localTask.status === 'rejeitada'

   return (
      <>
         <div className="max-w-4xl mx-auto space-y-6">
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
                        <h1 className="text-2xl font-semibold text-foreground">{localTask.title}</h1>
                        <CustomBadge variant={statusConfig[localTask.status].variant}>
                           {statusConfig[localTask.status].label}
                        </CustomBadge>
                     </div>
                     <p className="text-muted-foreground mt-1">
                        Criado por {localTask.createdByName} em {new Date(localTask.createdAt).toLocaleDateString('pt-BR')}
                     </p>
                  </div>
               </div>

               {/* Ações */}
               <div className="flex gap-2">
                  {canApprove && (
                     <>
                        <CustomButton onClick={handleApprove}>
                           <Check className="h-4 w-4 mr-2" />
                           Aprovar
                        </CustomButton>
                        <CustomButton variant="destructive" onClick={() => setRejectModalOpen(true)}>
                           <X className="h-4 w-4 mr-2" />
                           Rejeitar
                        </CustomButton>
                     </>
                  )}
                  {canEdit && (
                     <Link href={`/tasks/${localTask.id}/edit`}>
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
                        <p className="text-foreground leading-relaxed">{localTask.description}</p>
                     </CustomCardContent>
                  </CustomCard>

                  {/* Motivo da rejeição */}
                  {localTask.status === 'rejeitada' && localTask.rejectionReason && (
                     <CustomCard className="border-destructive/50 bg-destructive/5">
                        <CustomCardContent className="p-6">
                           <h2 className="text-lg font-semibold text-destructive mb-2">Motivo da Rejeição</h2>
                           <p className="text-foreground">{localTask.rejectionReason}</p>
                        </CustomCardContent>
                     </CustomCard>
                  )}

                  {/* Timeline */}
                  <CustomCard>
                     <CustomCardContent className="p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Histórico</h2>
                        <div className="space-y-4">
                           {localTask.history.map((item, index) => (
                              <div key={item.id} className="flex gap-4">
                                 <div className="relative">
                                    <div className="w-3 h-3 rounded-full bg-primary mt-1.5" />
                                    {index < localTask.history.length - 1 && (
                                       <div className="absolute top-4 left-1.5 w-0.5 h-full -translate-x-1/2 bg-border" />
                                    )}
                                 </div>
                                 <div className="flex-1 pb-4">
                                    <p className="font-medium text-foreground">{actionLabels[item.action]}</p>
                                    <p className="text-sm text-muted-foreground">
                                       por {item.user} em {new Date(item.date).toLocaleDateString('pt-BR')} às{' '}
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
                              <p className="font-medium text-foreground">{localTask.department}</p>
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <Calendar className="h-5 w-5 text-muted-foreground" />
                           <div>
                              <p className="text-sm text-muted-foreground">Data Desejada</p>
                              <p className="font-medium text-foreground">
                                 {new Date(localTask.desiredDate).toLocaleDateString('pt-BR')}
                              </p>
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <User className="h-5 w-5 text-muted-foreground" />
                           <div>
                              <p className="text-sm text-muted-foreground">Criado por</p>
                              <p className="font-medium text-foreground">{localTask.createdByName}</p>
                           </div>
                        </div>

                        {localTask.approverName && (
                           <div className="flex items-center gap-3">
                              <User className="h-5 w-5 text-muted-foreground" />
                              <div>
                                 <p className="text-sm text-muted-foreground">Aprovador</p>
                                 <p className="font-medium text-foreground">{localTask.approverName}</p>
                              </div>
                           </div>
                        )}

                        <div className="flex items-center gap-3">
                           <Clock className="h-5 w-5 text-muted-foreground" />
                           <div>
                              <p className="text-sm text-muted-foreground">Criado em</p>
                              <p className="font-medium text-foreground">
                                 {new Date(localTask.createdAt).toLocaleDateString('pt-BR')}
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
                  <CustomButton variant="destructive" onClick={handleReject}>
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
