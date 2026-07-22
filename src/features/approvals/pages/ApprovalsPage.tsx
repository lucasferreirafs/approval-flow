"use client";

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Check, X, Filter, Eye, RotateCw } from "lucide-react"
import { CustomButton, CustomCard, CustomCardContent, CustomModal, CustomSelect, CustomTextarea } from "@/components/ui"
import { DepartmentData, DepartmentOptions, Task, UserData } from "@/interfaces"
import { mapDepartmentOptions } from "@/lib/api"
import { enrichTasks } from "@/lib/api/tasks"
import { useToast } from "@/contexts/toast-context"

interface EnrichedTask extends Task {
  createdByUser?: UserData
  departmentData?: DepartmentData
}

export function ApprovalsPage() {
  // Estados da página
  const [loading, setLoading] = useState<boolean>(false)
  const [isRefresh, setIsRefresh] = useState<boolean>(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState<string>("")
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("")

  // Dados
  const [tasks, setTasks] = useState<EnrichedTask[]>([])
  const [departmentOptions, setDepartmentOptions] = useState<DepartmentOptions[]>([])

  const { addToast } = useToast()

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

        const options = mapDepartmentOptions(departmentsData)

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
        if (isRefresh) setIsRefresh(false)
      }
    }

    fetchAllData()

  }, [addToast, isRefresh])

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

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Tarefas para Aprovação</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie as tarefas que aguardam sua aprovação
            </p>
          </div>
          <CustomButton
            variant="outline"
            className="cursor-pointer"
            onClick={() => setIsRefresh(true)}
            disabled={loading}
          >
            {loading ?
              <RotateCw className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />
            }
          </CustomButton>
        </div>

        {/* Filtro */}
        <CustomCard>
          <CustomCardContent className="p-4">
            <div className="flex items-center gap-2">
              <CustomSelect
                options={[
                  { id: '', value: '', label: 'Todos os departamentos', color: undefined },
                  ...departmentOptions
                ]}
                placeholder="Filtrar por departamento"
                value={selectedDepartmentId}
                onChange={handleDepartmentFilterChange}
                showDot
                className="w-70"
              />
              <Filter className="h-4 w-4 text-muted-foreground" />
            </div>
          </CustomCardContent>
        </CustomCard>

        {/* Lista */}
        {filteredTasks.length === 0 ? (
          <CustomCard>
            <CustomCardContent className="p-12 text-center">
              <Check className="h-12 w-12 mx-auto mb-4 text-success opacity-50" />
              <p className="text-muted-foreground">
                {selectedDepartmentId
                  ? "Nenhuma tarefa pendente neste departamento"
                  : "Nenhuma tarefa pendente de aprovação"}
              </p>
            </CustomCardContent>
          </CustomCard>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <CustomCard key={task.id} className="hover:border-primary/30 transition-colors">
                <CustomCardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-foreground truncate">{task.title}</h3>
                        <div
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-sm 
                          font-medium text-foreground transition-colors"
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
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {task.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>Solicitante: {task.createdByUser?.name || task.created_by}</span>
                        <span>
                          Data: {new Date(task.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/tasks/${task.id}`}>
                        <CustomButton variant="outline" className="h-9 px-3">
                          <Eye className="h-4 w-4" />
                        </CustomButton>
                      </Link>
                      <CustomButton
                        className="h-9 px-3"
                        onClick={() => handleApprove(task.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Aprovar
                      </CustomButton>
                      <CustomButton
                        variant="destructive"
                        className="h-9 px-3"
                        onClick={() => openRejectModal(task.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Rejeitar
                      </CustomButton>
                    </div>
                  </div>
                </CustomCardContent>
              </CustomCard>
            ))}
          </div>
        )}
      </div>

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
            <CustomButton variant="destructive" onClick={handleReject}>
              Confirmar Rejeição
            </CustomButton>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">Informe o motivo da rejeição.</p>
          <CustomTextarea
            label="Motivo da rejeição"
            placeholder="Descreva o motivo..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
      </CustomModal>
    </div>
  )
}
