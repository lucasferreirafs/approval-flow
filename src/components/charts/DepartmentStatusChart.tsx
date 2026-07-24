'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Loader2 } from 'lucide-react'
import { CustomLegend, CustomTooltip } from './'
import { Task, DepartmentData } from '@/interfaces'
import { useEffect, useState, useCallback } from 'react'

interface ChartDataItem {
   name: string
   value: number
   color: string
   fill: string
}

interface TasksByDepartment {
   [departmentId: string]: number
}

interface Props {
   isLoading: boolean
}

export function TasksByDepartmentChart({ isLoading }: Props) {
   // ✅ Estados
   const [chartData, setChartData] = useState<ChartDataItem[]>([])
   const [loading, setLoading] = useState<boolean>(true)

   // ✅ Paleta de cores dinâmica (usa cores dos departamentos)
   const generateGradientId = useCallback((departmentId: string): string => {
      return `gradient-${departmentId}`
   }, [])

   // ✅ Contar tarefas por departamento
   const countTasksByDepartment = useCallback((tasksList: Task[]): TasksByDepartment => {
      return tasksList.reduce((acc, task) => {
         const deptId = task.department_id
         acc[deptId] = (acc[deptId] || 0) + 1
         return acc
      }, {} as TasksByDepartment)
   }, [])

   // ✅ Processar dados para o gráfico
   const processChartData = useCallback((
      taskCounts: TasksByDepartment,
      deptList: DepartmentData[]
   ): ChartDataItem[] => {
      return deptList
         .filter(dept => taskCounts[dept.id]) // Mostrar apenas departamentos com tarefas
         .map(dept => ({
            name: dept.name,
            value: taskCounts[dept.id],
            color: dept.color || '#6366f1',
            fill: `url(#${generateGradientId(dept.id)})`,
         }))
         .sort((a, b) => b.value - a.value) // Ordenar por quantidade (decrescente)
   }, [generateGradientId])

   // ✅ Buscar dados
   useEffect(() => {
      const fetchAllData = async () => {
         setLoading(true)
         try {
            const [resTasks, resDepartments] = await Promise.all([
               fetch("/api/tasks"),
               fetch("/api/departments")
            ])

            if (!resTasks.ok || !resDepartments.ok) {
               throw new Error("Não foi possível carregar os dados.")
            }

            const [tasksJson, departmentsJson] = await Promise.all([
               resTasks.json(),
               resDepartments.json()
            ])

            if (!tasksJson.success || !departmentsJson.success) {
               throw new Error("Dados inválidos recebidos do servidor.")
            }

            const tasksData: Task[] = tasksJson.data
            const departmentsData: DepartmentData[] = departmentsJson.data

            // ✅ Contar tarefas por departamento
            const taskCounts = countTasksByDepartment(tasksData)

            // ✅ Processar dados para o gráfico
            const data = processChartData(taskCounts, departmentsData)
            
            setChartData(data)

         } catch (error: unknown) {
            console.error("Erro ao carregar dados:", error)
         } finally {
            setLoading(false)
         }
      }

      fetchAllData()
   }, [countTasksByDepartment, processChartData])

   // ✅ Calcular total de tarefas
   const total = chartData.reduce((acc, item) => acc + item.value, 0)

   // ✅ Estados de carregamento e vazio
   if (loading || isLoading) {
      return (
         <div className="flex items-center justify-center gap-1 h-70 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando...
         </div>
      )
   }

   if (chartData.length === 0) {
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
                     {/* ✅ Gerar gradientes dinamicamente */}
                     {chartData.map(item => {
                        const baseColor = item.color
                        const darkerColor = darkenColor(baseColor, 20)

                        return (
                           <linearGradient
                              key={`grad-${item.name}`}
                              id={item.fill.replace('url(#', '').replace(')', '')}
                              x1="0"
                              y1="0"
                              x2="1"
                              y2="1"
                           >
                              <stop offset="0%" stopColor={baseColor} />
                              <stop offset="100%" stopColor={darkerColor} />
                           </linearGradient>
                        )
                     })}
                     {/* ✅ Sombra */}
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

            {/* ✅ Centro do donut com total */}
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

// ✅ Função auxiliar para escurecer cores
function darkenColor(color: string, percent: number): string {
   try {
      const num = parseInt(color.replace('#', ''), 16)
      const amt = Math.round(2.55 * percent)
      const R = Math.max(0, (num >> 16) - amt)
      const G = Math.max(0, (num >> 8 & 0x00FF) - amt)
      const B = Math.max(0, (num & 0x0000FF) - amt)

      return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
   } catch {
      return '#6366f1' // fallback
   }
}