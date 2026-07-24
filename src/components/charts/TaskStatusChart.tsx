'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Loader2 } from 'lucide-react'
import { CustomLegend, CustomTooltip } from './'
import { Task } from '@/interfaces'
import { useEffect, useState, useCallback } from 'react'

interface ChartDataItem {
  name: string
  value: number
  fill: string
}

interface Props {
  isLoading: boolean
}

const STATUS_COLORS = {
  pendente: { start: '#f59e0b', end: '#d97706' },
  aprovada: { start: '#22c55e', end: '#16a34a' },
  rejeitada: { start: '#ef4444', end: '#dc2626' },
  concluida: { start: '#6366f1', end: '#4f46e5' },
} as const

const STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendentes',
  aprovada: 'Aprovadas',
  rejeitada: 'Rejeitadas',
  concluida: 'Concluídas',
}

export function TaskStatusChart({ isLoading }: Props) {
  // Estados do componente
  const [chartData, setChartData] = useState<ChartDataItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Contar tarefas por status
  const countTasksByStatus = useCallback((tasksList: Task[]): Record<string, number> => {
    return tasksList.reduce((acc, task) => {
      const status = task.status
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [])

  // Processar dados para o gráfico
  const processChartData = useCallback((statusCounts: Record<string, number>): ChartDataItem[] => {
    return (Object.entries(statusCounts) as Array<[keyof typeof STATUS_COLORS, number]>)
      .map(([status, count]) => ({
        name: STATUS_LABELS[status] || status,
        value: count,
        fill: `url(#${status}Gradient)`,
      }))
      .filter(item => item.value > 0) // Mostrar apenas status com tarefas
      .sort((a, b) => b.value - a.value) // Ordenar por quantidade (decrescente)
  }, [])

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/tasks")

        if (!res.ok) {
          throw new Error("Não foi possível carregar as tarefas.")
        }

        const data = await res.json()

        if (!data.success) {
          throw new Error("Dados inválidos recebidos do servidor.")
        }

        const tasksData: Task[] = data.data

        const statusCounts = countTasksByStatus(tasksData)
        const chartDataProcessed = processChartData(statusCounts)

        setChartData(chartDataProcessed)

      } catch (error: unknown) {
        console.error("Erro ao carregar tarefas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [countTasksByStatus, processChartData])

  // Calcular total de tarefas
  const total = chartData.reduce((acc, item) => acc + item.value, 0)

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center gap-1 h-70 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando...
      </div>
    )
  }

  if (chartData.length === 0 || total === 0) {
    return (
      <div className="h-70 flex items-center justify-center text-sm text-muted-foreground">
        Nenhuma tarefa encontrada
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="h-70 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {Object.entries(STATUS_COLORS).map(([status, colors]) => (
                <linearGradient
                  key={`${status}Gradient`}
                  id={`${status}Gradient`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0%" stopColor={colors.start} />
                  <stop offset="100%" stopColor={colors.end} />
                </linearGradient>
              ))}

              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
              </filter>
            </defs>

            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
              filter="url(#shadow)"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip total={total} />} />
            <Legend content={<CustomLegend total={total} />} />
          </PieChart>
        </ResponsiveContainer>

        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ marginBottom: '40px' }}
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground">{total}</div>
            <div className="text-sm text-muted-foreground">
              {total === 1 ? 'Tarefa' : 'Tarefas'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}