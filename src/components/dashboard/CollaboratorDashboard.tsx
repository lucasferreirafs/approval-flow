'use client'

import { TaskStatusChart } from '../charts/TaskStatusChart'
import Link from 'next/link'
import { Edit, Eye, Loader2, Plus } from 'lucide-react'
import { CustomButton, CustomCardContent, CustomCard, CustomBadge } from '../ui'

interface Props {
  data: Array<{
    id: string
    title: string
    department_name: string
    created_at: string
    status: 'pendente' | 'aprovada' | 'rejeitada' | 'concluida'
  }>
  loading: boolean
}
interface StatusConfig {
  [key: string]: {
    label: "Pendente" | "Aprovada" | "Rejeitada" | "Concluída"
    variant: 'success' | 'warning' | 'error' | 'info'
  }
}

const STATUSCONFIG: StatusConfig = {
  pendente: { label: 'Pendente', variant: 'warning' },
  aprovada: { label: 'Aprovada', variant: 'success' },
  rejeitada: { label: 'Rejeitada', variant: 'error' },
  concluida: { label: 'Concluída', variant: 'info' },
}

export function CollaboratorDashboard({ data, loading }: Props) {

  const statusCounts = data.reduce(
    (acc, task) => {
      acc[task.status]++;
      return acc;
    }, {
      pendente: 0,
      aprovada: 0,
      rejeitada: 0,
      concluida: 0,
    }
  )

  return (
    <div className="space-y-6">

      {/* Gráfico placeholder */}
      <CustomCard>
        <CustomCardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Tarefas por Status</h3>
          <p className="text-sm text-muted-foreground mb-4">Distribuição das suas tarefas por status atual</p>
          <TaskStatusChart status={statusCounts} isLoading={loading} />
        </CustomCardContent>
      </CustomCard>


      <CustomCard>
        <CustomCardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Últimas Tarefas</h3>
            <Link href="/tasks">
              <CustomButton variant="outline" className="text-sm">
                Ver todas
              </CustomButton>
            </Link>
          </div>

          <div className="space-y-3">

            {loading ? (
              <div className="flex items-center justify-center gap-1 h-70 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando...
              </div>
            ) : data.length === 0 ? (
              <div className="h-70 flex items-center justify-center text-sm text-muted-foreground">
                Nenhuma tarefa encontrada
              </div>
            ) : data.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{task.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {task.department_name} • {task.created_at}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <CustomBadge variant={STATUSCONFIG[task.status].variant}>
                    {STATUSCONFIG[task.status].label}
                  </CustomBadge>
                  <div className="flex gap-1">
                    <Link href={`/tasks/${task.id}`}>
                      <button className="p-2 rounded-lg hover:bg-accent transition-colors" title="Ver detalhes">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </Link>
                    {task.status === 'rejeitada' && (
                      <Link href={`/tasks/${task.id}/edit`}>
                        <button className="p-2 rounded-lg hover:bg-accent transition-colors" title="Editar">
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CustomCardContent>
      </CustomCard>

      {/* Botão flutuante de nova tarefa */}
      <Link href="/tasks/new" className="fixed bottom-6 right-6">
        <CustomButton className="h-14 w-14 rounded-full shadow-lg p-0">
          <Plus className="h-6 w-6" />
          <span className="sr-only">Nova Tarefa</span>
        </CustomButton>
      </Link>
    </div>
  )
}
