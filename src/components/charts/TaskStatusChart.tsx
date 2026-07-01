'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Loader2 } from 'lucide-react'
import { CustomLegend, CustomTooltip } from '.'

interface Props {
  status: {
    pendente: number
    aprovada: number
    rejeitada: number
    concluida: number
  }
  isLoading: boolean
}

const COLORS = {
  pendentes: { start: '#f59e0b', end: '#d97706' },
  aprovadas: { start: '#22c55e', end: '#16a34a' },
  rejeitadas: { start: '#ef4444', end: '#dc2626' },
  concluidas: { start: '#6366f1', end: '#4f46e5' },
}

export function TaskStatusChart({ status, isLoading }: Props) {
  const total = Object.values(status).reduce((acc, val) => acc + val, 0)

  const chartData = [
    { name: 'Pendentes', value: status.pendente, color: COLORS.pendentes.start, fill: `url(#pendentesGradient)` },
    { name: 'Aprovadas', value: status.aprovada, color: COLORS.aprovadas.start, fill: `url(#aprovadasGradient)` },
    { name: 'Rejeitadas', value: status.rejeitada, color: COLORS.rejeitadas.start, fill: `url(#rejeitadasGradient)` },
    { name: 'Concluídas', value: status.concluida, color: COLORS.concluidas.start, fill: `url(#concluidasGradient)` },
  ]

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex items-center justify-center gap-1 h-70 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando...
        </div>
      ) : Object.keys(status).length === 0 ? (
        <div className="h-70 flex items-center justify-center text-sm text-muted-foreground">
          Nenhuma tarefa encontrada
        </div>
      ) : (
        <div className="h-70 relative">
          <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <linearGradient id="pendentesGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={COLORS.pendentes.start} />
                    <stop offset="100%" stopColor={COLORS.pendentes.end} />
                  </linearGradient>
                  <linearGradient id="aprovadasGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={COLORS.aprovadas.start} />
                    <stop offset="100%" stopColor={COLORS.aprovadas.end} />
                  </linearGradient>
                  <linearGradient id="rejeitadasGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={COLORS.rejeitadas.start} />
                    <stop offset="100%" stopColor={COLORS.rejeitadas.end} />
                  </linearGradient>
                  <linearGradient id="concluidasGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={COLORS.concluidas.start} />
                    <stop offset="100%" stopColor={COLORS.concluidas.end} />
                  </linearGradient>
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


          {/* Centro do donut com total */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginBottom: '40px' }}>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground">{total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
