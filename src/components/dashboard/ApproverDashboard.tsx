'use client'

import { useEffect, useState, useCallback } from 'react'
import {
   CustomCard,
   CustomCardContent,
   CustomButton,
   CustomModal,
   CustomTextarea,
   CustomSelect,
} from '@/components/ui'
import { useToast } from '@/contexts/toast-context'
import {
   Clock,
   CheckCircle,
   Check,
   X,
   Filter,
   CircleX,
   LucideIcon,
   RotateCw,
   Eye
} from 'lucide-react'
import { DepartmentOptions, Task } from '@/interfaces'
import { useSession } from '@/contexts/session-context'
import Link from 'next/link'

interface StatCards {
   title: string
   value: number
   icon: LucideIcon
   color: string
   bgColor: string
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

interface EnrichedTask extends Task {
   createdByUser?: UserData
   departmentData?: DepartmentData
}

export function ApproverDashboard({ isLoading }: { isLoading: boolean }) {
   // Estado do dashboard
   const [loading, setLoading] = useState<boolean>(false)
   const [rejectModalOpen, setRejectModalOpen] = useState(false)
   const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
   const [rejectReason, setRejectReason] = useState('')

   // Dados
   const [tasks, setTasks] = useState<EnrichedTask[]>([])
   const [departmentOptions, setDepartmentOptions] = useState<DepartmentOptions[]>([])
   const [statCards, setStatCards] = useState<StatCards[]>([])

   // Filtro de departamento
   const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('')

   const { addToast } = useToast()
   const { user } = useSession()

   // Buscar dados do usuário
   const fetchUserData = useCallback(async (userId: string): Promise<UserData | null> => {
      try {
         const res = await fetch(`/api/users/${userId}`)
         if (!res.ok) return null
         const data = await res.json()
         return data.success ? data.data : null
      } catch (error) {
         console.error(`Erro ao buscar usuário ${userId}:`, error)
         return null
      }
   }, [])

   // Buscar dados do departamento
   const fetchDepartmentData = useCallback(async (departmentId: string): Promise<DepartmentData | null> => {
      try {
         const res = await fetch(`/api/departments/${departmentId}`)
         if (!res.ok) return null
         const data = await res.json()
         return data.success ? data.data : null
      } catch (error) {
         console.error(`Erro ao buscar departamento ${departmentId}:`, error)
         return null
      }
   }, [])

   // Enriquecer uma tarefa com dados de usuário e departamento
   const enrichTaskWithData = useCallback(async (task: Task): Promise<EnrichedTask> => {
      const [createdByUser, departmentData] = await Promise.all([
         fetchUserData(task.created_by),
         fetchDepartmentData(task.department_id)
      ])

      return {
         ...task,
         createdByUser: createdByUser || undefined,
         departmentData: departmentData || undefined
      }
   }, [fetchUserData, fetchDepartmentData])

   // Enriquecer lista de tarefas
   const enrichTasks = useCallback(async (tasksList: Task[]): Promise<EnrichedTask[]> => {
      return Promise.all(tasksList.map(enrichTaskWithData))
   }, [enrichTaskWithData])

   // Calcular estatísticas
   const calculateStatCards = useCallback((
      pendingTasks: Task[],
      approvedTasks: Task[],
      rejectedTasks: Task[]
   ): StatCards[] => {
      return [
         {
            title: 'Aguardando Aprovação',
            value: pendingTasks.length,
            icon: Clock,
            color: 'text-warning',
            bgColor: 'bg-warning/10',
         },
         {
            title: 'Aprovadas por mim',
            value: approvedTasks.length,
            icon: CheckCircle,
            color: 'text-success',
            bgColor: 'bg-success/10',
         },
         {
            title: 'Rejeitadas por mim',
            value: rejectedTasks.length,
            icon: CircleX,
            color: 'text-destructive',
            bgColor: 'bg-destructive/10',
         },
      ]
   }, [])

   // ✅ Mapear opções de departamento
   const mapDepartmentOptions = useCallback((departments: DepartmentData[]): DepartmentOptions[] => {
      return departments.map(dept => ({
         id: dept.id,
         value: dept.id,
         label: dept.name,
         color: dept.color,
      }))
   }, [])

   // ✅ Carregar dados iniciais
   useEffect(() => {
      const fetchAllData = async () => {
         setLoading(true)
         try {
            const [resTasks, resDepartments] = await Promise.all([
               fetch("/api/tasks"),
               fetch("/api/departments"),
            ])

            if (!resTasks.ok || !resDepartments.ok) {
               throw new Error("Não foi possível carregar as informações.")
            }

            const [tasksJson, departmentsJson] = await Promise.all([
               resTasks.json(),
               resDepartments.json(),
            ])

            if (!tasksJson.success || !departmentsJson.success) {
               throw new Error("Não foi possível buscar as informações. Tente novamente mais tarde.")
            }

            const tasksData: Task[] = tasksJson.data
            const departmentsData: DepartmentData[] = departmentsJson.data

            const pendingTasks = tasksData.filter(t => t.status === "pendente")
            const enrichedTasks = await enrichTasks(pendingTasks)
            const tasksApprovedByMe = tasksData.filter(
               t => t.approver_id === user.id && t.status === "aprovada"
            )
            const tasksRejectedByMe = tasksData.filter(
               t => t.approver_id === user.id && t.status === "rejeitada"
            )

            const stats = calculateStatCards(pendingTasks, tasksApprovedByMe, tasksRejectedByMe)
            const options = mapDepartmentOptions(departmentsData)

            setStatCards(stats)
            setTasks(enrichedTasks)
            setDepartmentOptions(options)
            setSelectedDepartmentId('') // Reset filter

         } catch (error: unknown) {
            console.error("Erro ao carregar dados:", error)

            const message = error instanceof Error
               ? error.message
               : "Erro desconhecido, procure um administrador"

            addToast({
               title: "Ops! Ocorreu um erro.",
               message,
               type: "error",
            })
         } finally {
            setLoading(false)
         }
      }

      fetchAllData()

   }, [user.id, addToast, enrichTasks, calculateStatCards, mapDepartmentOptions, isLoading])

   // Filtrar tarefas por departamento selecionado
   const filteredTasks = selectedDepartmentId
      ? tasks.filter(t => t.department_id === selectedDepartmentId)
      : tasks

   // Filtro por departamento
   const handleDepartmentFilterChange = useCallback((value: string | string[]) => {
      const departmentId = Array.isArray(value) ? value[0] : value
      setSelectedDepartmentId(departmentId || "")
   }, [])

   // Aprovar tarefa
   const handleApprove = useCallback(async (taskId: string) => {
      try {
         const res = await fetch("/api/tasks/approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               taskId,
               action: "aprovada",
               comment: null
            })
         })

         if (!res.ok) throw new Error("Erro ao aprovar tarefa")

         setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId))

         addToast({
            title: "Sucesso!",
            message: "Tarefa aprovada com sucesso.",
            type: "success"
         })

      } catch (error: unknown) {
         console.error("Erro ao aprovar:", error)
         const message = error instanceof Error
            ? error.message
            : "Não foi possível aprovar a tarefa."

         addToast({
            title: "Ops! Ocorreu um erro.",
            message,
            type: "error",
         })
      }
   }, [addToast])

   // Fechar modal de rejeição
   const closeRejectModal = useCallback(() => {
      setRejectModalOpen(false)
      setRejectReason('')
      setSelectedTaskId(null)
   }, [])

   // Rejeitar tarefa
   const handleReject = useCallback(async () => {
      if (!selectedTaskId) return

      if (!rejectReason.trim()) {
         addToast({
            title: "Erro",
            message: "Informe o motivo da rejeição.",
            type: "error"
         })
         return
      }

      try {
         const res = await fetch("/api/tasks/reject", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               taskId: selectedTaskId,
               action: "rejeitada",
               comment: rejectReason
            })
         })

         if (!res.ok) throw new Error("Erro ao rejeitar tarefa")

         setTasks(prevTasks => prevTasks.filter(t => t.id !== selectedTaskId))

         closeRejectModal()

         addToast({
            title: "Tarefa rejeitada",
            message: "Avisamos ao solicitante.",
            type: "success"
         })
      } catch (error: unknown) {
         console.error("Erro ao rejeitar:", error)
         const message = error instanceof Error
            ? error.message
            : "Não foi possível rejeitar a tarefa."

         addToast({
            title: "Ops! Ocorreu um erro.",
            message,
            type: "error",
         })
      }
   }, [selectedTaskId, rejectReason, addToast])

   // Abrir modal de rejeição
   const openRejectModal = useCallback((taskId: string) => {
      setSelectedTaskId(taskId)
      setRejectModalOpen(true)
   }, [])

   if (loading) {
      return (
         <div className="py-12 flex items-center justify-center text-gray-500">
            <RotateCw className="h-4 w-4 animate-spin mr-2" />
            Carregando...
         </div>
      )
   }

   return (
      <div className="space-y-6">
         {/* Cards de estatísticas */}
         <div className="grid gap-4 sm:grid-cols-3">
            {statCards.map((stat: StatCards) => {
               const Icon = stat.icon
               return (
                  <CustomCard key={stat.title}>
                     <CustomCardContent className="p-6">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-sm text-muted-foreground">{stat.title}</p>
                              <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                           </div>
                           <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                              <Icon className={`h-6 w-6 ${stat.color}`} />
                           </div>
                        </div>
                     </CustomCardContent>
                  </CustomCard>
               )
            })}
         </div>

         {/* Tabela de tarefas pendentes */}
         <CustomCard>
            <CustomCardContent className="p-6">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-lg font-semibold text-foreground">
                     Tarefas Pendentes de Aprovação
                  </h3>

                  <div className="flex items-center gap-2">
                     <Filter className="h-4 w-4 text-muted-foreground" />
                     <CustomSelect
                        options={[
                           { id: '', value: '', label: 'Todos os departamentos', color: undefined },
                           ...departmentOptions
                        ]}
                        placeholder="Filtrar por departamento"
                        value={selectedDepartmentId}
                        onChange={handleDepartmentFilterChange}
                        showDot
                        className="w-48"
                     />
                  </div>
               </div>

               {filteredTasks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                     <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                     <p>
                        {selectedDepartmentId
                           ? "Nenhuma tarefa pendente neste departamento"
                           : "Nenhuma tarefa pendente de aprovação"}
                     </p>
                  </div>
               ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full">
                        <thead>
                           <tr className="border-b border-border">
                              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                                 Título
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                                 Solicitante
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                                 Departamento
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                                 Data
                              </th>
                              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                                 Ações
                              </th>
                           </tr>
                        </thead>
                        <tbody>
                           {filteredTasks.map((task) => (
                              <tr
                                 key={task.id}
                                 className="border-b border-border hover:bg-muted/50 transition-colors"
                              >
                                 <td className="py-4 px-4">
                                    <p className="font-medium text-foreground">{task.title}</p>
                                 </td>
                                 <td className="py-4 px-4 text-foreground">
                                    {task.createdByUser?.name || task.created_by}
                                 </td>

                                 {/* ✅ Badge com borda e background com 50% de opacidade */}
                                 <td className="py-4 px-4">
                                    <div
                                       className="
                                          inline-flex items-center gap-2 px-3 py-1 rounded-xl
                                          text-sm font-medium text-foreground transition-colors
                                          border border-gray-300
                                       "
                                    >

                                       {task.departmentData?.color && (
                                          <span
                                             className="w-2.5 h-2.5 rounded-full shrink-0"
                                             style={{ backgroundColor: task.departmentData.color }}
                                          />
                                       )}
                                       <span className="truncate">
                                          {task.departmentData?.name || task.department_id}
                                       </span>
                                    </div>
                                 </td>

                                 <td className="py-4 px-4 text-muted-foreground">
                                    {new Date(task.created_at).toLocaleDateString('pt-BR')}
                                 </td>
                                 <td className="py-4 px-4">
                                    <div className="flex justify-end gap-2">
                                       <Link href={`/tasks/${task.id}`}>
                                          <CustomButton variant="outline" className="h-9 px-3 cursor-pointer">
                                             <Eye className="h-4 w-4" />
                                          </CustomButton>
                                       </Link>
                                       <CustomButton
                                          variant="primary"
                                          className="h-8 px-3 text-xs"
                                          onClick={() => handleApprove(task.id)}
                                       >
                                          <Check className="h-4 w-4 mr-1" />
                                          Aprovar
                                       </CustomButton>
                                       <CustomButton
                                          variant="destructive"
                                          className="h-8 px-3 text-xs"
                                          onClick={() => openRejectModal(task.id)}
                                       >
                                          <X className="h-4 w-4 mr-1" />
                                          Rejeitar
                                       </CustomButton>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}
            </CustomCardContent>
         </CustomCard>

         {/* Modal de rejeição */}
         <CustomModal
            isOpen={rejectModalOpen}
            onClose={closeRejectModal}
            title="Rejeitar Tarefa"
            footer={
               <>
                  <CustomButton
                     variant="outline"
                     onClick={closeRejectModal}
                  >
                     Cancelar
                  </CustomButton>
                  <CustomButton
                     variant="destructive"
                     onClick={handleReject}
                  >
                     Confirmar Rejeição
                  </CustomButton>
               </>
            }
         >
            <div className="space-y-4">
               <p className="text-muted-foreground">
                  Por favor, informe o motivo da rejeição. Esta informação será enviada ao solicitante.
               </p>
               <CustomTextarea
                  label="Motivo da rejeição"
                  placeholder="Descreva o motivo da rejeição..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
               />
            </div>
         </CustomModal>
      </div>
   )
}