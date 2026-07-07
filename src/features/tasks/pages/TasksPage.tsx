"use client"

import Link from "next/link"
import { Plus, Eye, Edit, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { CustomBadge, CustomButton, CustomCard, CustomCardContent, CustomSelect } from "@/components/ui"

interface DataTask {
    id: string
    title: string
    description: string
    department_id: string
    department: string
    created_at: string
    status: "pendente" | "aprovada" | "rejeitada" | "concluida"
    approver_id?: string
}

const statusConfig: Record<
    string,
    { label: string; variant: "default" | "success" | "error" | "warning" | "info" }
> = {
    pendente: { label: "Pendente", variant: "warning" },
    aprovada: { label: "Aprovada", variant: "success" },
    rejeitada: { label: "Rejeitada", variant: "error" },
    concluida: { label: "Concluída", variant: "info" },
}

const statusOptions = [
    { value: "todos", label: "Todos" },
    { value: "pendente", label: "Pendente", color: "var(--warning)" },
    { value: "aprovada", label: "Aprovada", color: "var(--success)" },
    { value: "rejeitada", label: "Rejeitada", color: "var(--destructive)" },
    { value: "concluida", label: "Concluída", color: "var(--primary)" },
]

export function TasksPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("todos")
    const [dataTasks, setDataTasks] = useState<DataTask[]>([])

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const [tasksRes, departmentsRes] = await Promise.all([
                fetch("/api/tasks"),
                fetch("/api/departments"),
            ])
            const [tasksData, departmentsData] = await Promise.all([
                tasksRes.json(),
                departmentsRes.json(),
            ])

            if (!tasksData.success || !departmentsData.success) {
                throw new Error('Falha ao carregar dados da API')
            }

            if(tasksData.data.length === 0) {
                setDataTasks([])
                return
            }
            
            setDataTasks(
                tasksData.data.map((task: DataTask) => {
                    const department = departmentsData.data.find((dept: { id: string; name: string }) => dept.id === task.department_id)
                    return {
                        ...task,
                        department: department ? department.name : 'Desconhecido'
                    }
                })
            )

        } catch (error: unknown) {
                console.error("Erro interno. Tente novamente.\n[Erro]: ", error)
            }
        }
        fetchTasks()
    }, [])

    const filteredTasks = dataTasks.filter((task) => {
        const matchesSearch =
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "todos" || task.status === statusFilter
        return matchesSearch && matchesStatus
    })

    return (    
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">Minhas Tarefas</h1>
                    <p className="text-muted-foreground mt-1">Gerencie todas as suas tarefas</p>
                </div>
                <Link href="/tasks/new">
                    <CustomButton>
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Tarefa
                    </CustomButton>
                </Link>
            </div>

            {/* Filtros */}
            <CustomCard>
                <CustomCardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar tarefas..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <CustomSelect
                            className="w-45"
                            options={statusOptions}
                            showDot
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e as string)}
                        />
                    </div>
                </CustomCardContent>
            </CustomCard>

            {/* Lista de tarefas */}
            <div className="space-y-3">
                {filteredTasks.length === 0 ? (
                    <CustomCard>
                        <CustomCardContent className="p-12 text-center">
                            <p className="text-muted-foreground">Nenhuma tarefa encontrada</p>
                        </CustomCardContent>
                    </CustomCard>
                ) : (
                    filteredTasks.map((task) => (
                        <CustomCard key={task.id} className="hover:border-primary/30 transition-colors">
                            <CustomCardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-medium text-foreground truncate">{task.title}</h3>
                                            <CustomBadge variant={statusConfig[task.status].variant}>
                                                {statusConfig[task.status].label}
                                            </CustomBadge>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                            {task.description}
                                        </p>
                                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                            <span>Departamento: {task.department}</span>
                                            <span>
                                                Criado em: {new Date(task.created_at).toLocaleDateString("pt-BR")}
                                            </span>
                                            {task.approver_id && <span>Aprovador: {task.approver_id}</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/tasks/${task.id}`}>
                                            <CustomButton variant="outline" className="h-9 px-3">
                                                <Eye className="h-4 w-4" />
                                                <span className="sr-only">Ver detalhes</span>
                                            </CustomButton>
                                        </Link>
                                        {task.status === "rejeitada" && (
                                            <Link href={`/tasks/${task.id}/edit`}>
                                                <CustomButton variant="outline" className="h-9 px-3">
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">Editar</span>
                                                </CustomButton>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </CustomCardContent>
                        </CustomCard>
                    ))
                )}
            </div>
        </div>
    );
}
