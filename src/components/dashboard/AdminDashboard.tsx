'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useToast } from '@/contexts/toast-context'
import { Users, ClipboardList, TrendingUp, Trash2, Building2, RotateCw, ChevronRight, ChevronLeft } from 'lucide-react'
import { CustomBadge, CustomButton, CustomCard, CustomCardContent, CustomSelect } from '../ui'
import { ConfirmModal } from '../ui/CustomModal'
import { TaskStatusChart } from '../charts'
import { DepartmentData, PaginationState, RoleOption, StatCards, Task, User, UserWithDept } from '@/interfaces'
import { enrichUsersWithDepartment } from '@/lib/api'

const ROLE_OPTIONS: RoleOption[] = [
   { value: 'colaborador', label: 'Colaborador' },
   { value: 'aprovador', label: 'Aprovador' },
   { value: 'admin', label: 'Admin' },
]

const ITEMS_PER_PAGE = 5

export function AdminDashboard() {
   // Estados do dashboard
   const [loading, setLoading] = useState<boolean>(true)
   const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false)
   const [selectedUserIdToDelete, setSelectedUserIdToDelete] = useState<string | null>(null)

   // Dados
   const [statCards, setStatCards] = useState<StatCards[]>([])
   const [users, setUsers] = useState<UserWithDept[]>([])
   const [departments, setDepartments] = useState<DepartmentData[]>([])

   // Paginação
   const [pagination, setPagination] = useState<PaginationState>({
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: ITEMS_PER_PAGE,
   })

   const { addToast } = useToast()

   // Calcular estatísticas
   const calculateStatCards = useCallback((usersList: User[], tasksList: Task[]): StatCards[] => {
      const totalTasks = tasksList.length
      const approvedTasks = tasksList.filter(t => t.status === 'aprovada').length
      const approvalRate = totalTasks > 0 ? ((approvedTasks / totalTasks) * 100).toFixed(1) : '0'

      return [
         {
            title: 'Total de Usuários',
            value: usersList.length,
            icon: Users,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
         },
         {
            title: 'Total de Tarefas',
            value: totalTasks,
            icon: ClipboardList,
            color: 'text-success',
            bgColor: 'bg-success/10',
         },
         {
            title: 'Taxa de Aprovação',
            value: `${approvalRate}%`,
            icon: TrendingUp,
            color: 'text-warning',
            bgColor: 'bg-warning/10',
         },
      ]
   }, [])

   useEffect(() => {
      const fetchAllData = async () => {
         setLoading(true)
         try {
            const [resUsers, resTasks, resDepartments] = await Promise.all([
               fetch("/api/users"),
               fetch("/api/tasks"),
               fetch("/api/departments")
            ])

            if (!resUsers.ok || !resTasks.ok || !resDepartments.ok) {
               throw new Error("Não foi possível carregar os dados.")
            }

            const [jsonUsers, jsonTasks, jsonDepartments] = await Promise.all([
               resUsers.json(),
               resTasks.json(),
               resDepartments.json()
            ])

            if (!jsonUsers.success || !jsonTasks.success || !jsonDepartments.success) {
               throw new Error("Falha ao buscar informações. Tente novamente mais tarde.")
            }

            const usersData: User[] = jsonUsers.data
            const tasksData: Task[] = jsonTasks.data
            const departmentsData: DepartmentData[] = jsonDepartments.data

            const enrichedUsers = enrichUsersWithDepartment(usersData, departmentsData)
            const stats = calculateStatCards(usersData, tasksData)

            setUsers(enrichedUsers)
            setDepartments(departmentsData)
            setStatCards(stats)

            const totalPages = Math.ceil(enrichedUsers.length / ITEMS_PER_PAGE)
            setPagination(prev => ({
               ...prev,
               totalPages: totalPages > 0 ? totalPages : 1,
               currentPage: 1,
            }))

         } catch (error: unknown) {
            console.error("Erro ao carregar dados:", error)
            const message = error instanceof Error
               ? error.message
               : "Erro inesperado. Tente novamente mais tarde."

            addToast({
               title: "Ops! Ocorreu um erro",
               message,
               type: "error"
            })
         } finally {
            setLoading(false)
         }
      }

      fetchAllData()

   }, [calculateStatCards, addToast])

   // Atualizar papel do usuário
   const handleRoleChange = useCallback(async (userId: string, newRole: string) => {
      try {
         const res = await fetch(`/api/users/${userId}/update`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: newRole })
         })

         if (!res.ok) throw new Error("Erro ao atualizar papel")

         const data = await res.json()

         if (!data.success) throw new Error(data.message || "Erro ao atualizar")

         setUsers(prevUsers =>
            prevUsers.map(u => u.id === userId ? { ...u, role: newRole } : u)
         )

         addToast({
            title: "Sucesso!",
            message: "Papel do usuário atualizado.",
            type: "success"
         })

      } catch (error: unknown) {
         console.error("Erro ao atualizar papel:", error)
         const message = error instanceof Error ? error.message : "Erro ao atualizar papel"

         addToast({
            title: "Erro",
            message,
            type: "error"
         })
      }
   }, [addToast])

   // Atualizar departamento do usuário
   const handleDepartmentChange = useCallback(async (userId: string, newDepartmentId: string) => {
      try {
         const res = await fetch(`/api/users/${userId}/update`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ department_id: newDepartmentId })
         })

         if (!res.ok) throw new Error("Erro ao atualizar departamento")

         const data = await res.json()

         if (!data.success) throw new Error(data.message || "Erro ao atualizar")

         const newDeptName = departments.find(d => d.id === newDepartmentId)?.name
         setUsers(prevUsers =>
            prevUsers.map(u => u.id === userId
               ? { ...u, department_id: newDepartmentId, department_name: newDeptName }
               : u
            )
         )

         addToast({
            title: "Sucesso!",
            message: "Departamento do usuário atualizado.",
            type: "success"
         })

      } catch (error: unknown) {
         console.error("Erro ao atualizar departamento:", error)
         const message = error instanceof Error ? error.message : "Erro ao atualizar departamento"

         addToast({
            title: "Erro",
            message,
            type: "error"
         })
      }
   }, [departments, addToast])

   const openDeleteModal = useCallback((userId: string) => {
      setSelectedUserIdToDelete(userId)
      setDeleteModalOpen(true)
   }, [])

   const closeDeleteModal = useCallback(() => {
      setDeleteModalOpen(false)
      setSelectedUserIdToDelete(null)
   }, [])

   const handleDeleteUser = useCallback(async () => {
      if (!selectedUserIdToDelete) return

      try {
         const res = await fetch(`/api/users/${selectedUserIdToDelete}`, {
            method: "DELETE"
         })

         const data = await res.json()

         if (!data.success) throw new Error(data.message || "Erro ao excluir")

         const newUsers = users.filter(u => u.id !== selectedUserIdToDelete)
         setUsers(newUsers)

         const newTotalPages = Math.ceil(newUsers.length / ITEMS_PER_PAGE)
         setPagination(prev => ({
            ...prev,
            totalPages: newTotalPages > 0 ? newTotalPages : 1,
            currentPage: prev.currentPage > newTotalPages ? newTotalPages : prev.currentPage,
         }))

         closeDeleteModal()

         addToast({
            title: "Sucesso!",
            message: "Usuário excluído com sucesso.",
            type: "success"
         })

      } catch (error: unknown) {
         console.error("Erro ao excluir usuário:", error)
         const message = error instanceof Error ? error.message : "Erro ao excluir usuário"

         addToast({
            title: "Erro",
            message,
            type: "error"
         })
      }
   }, [selectedUserIdToDelete, users, addToast, closeDeleteModal])

   // Obtem usuários para a página atual
   const paginatedUsers = users.slice(
      (pagination.currentPage - 1) * ITEMS_PER_PAGE,
      pagination.currentPage * ITEMS_PER_PAGE
   )

   // Gera números de páginas
   const getPageNumbers = useCallback(() => {
      const pages: (number | string)[] = []
      const maxVisible = 5
      const halfVisible = Math.floor(maxVisible / 2)

      let startPage = Math.max(1, pagination.currentPage - halfVisible)
      const endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1)

      if (endPage - startPage + 1 < maxVisible) {
         startPage = Math.max(1, endPage - maxVisible + 1)
      }

      if (startPage > 1) {
         pages.push(1)
         if (startPage > 2) pages.push('...')
      }

      for (let i = startPage; i <= endPage; i++) {
         pages.push(i)
      }

      if (endPage < pagination.totalPages) {
         if (endPage < pagination.totalPages - 1) pages.push('...')
         pages.push(pagination.totalPages)
      }

      return pages
   }, [pagination.currentPage, pagination.totalPages])

   // Muda página
   const handlePageChange = useCallback((page: number) => {
      if (page >= 1 && page <= pagination.totalPages) {
         setPagination(prev => ({ ...prev, currentPage: page }))
      }
   }, [pagination.totalPages])

   if (loading) {
      return (
         <CustomCard className="py-12 flex items-center justify-center text-gray-500">
            <RotateCw className="h-4 w-4 animate-spin mr-2" />
            Carregando...
         </CustomCard>
      )
   }

   return (
      <div className="space-y-6">
         {/* Cards de estatísticas */}
         <div className="grid gap-4 sm:grid-cols-3">
            {statCards.map((stat) => {
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

         {/* Gráfico de tarefas */}
         <CustomCard>
            <CustomCardContent className="p-6">
               <h3 className="text-lg font-semibold text-foreground mb-2">Tarefas por Status</h3>
               <p className="text-sm text-muted-foreground mb-4">Distribuição das tarefas por status atual</p>
               <TaskStatusChart isLoading={loading} />
            </CustomCardContent>
         </CustomCard>

         {/* Tabela de usuários */}
         <CustomCard>
            <CustomCardContent className="p-6">
               <div className="flex items-center justify-between mb-6">
                  <div>
                     <h3 className="text-lg font-semibold text-foreground">Gerenciar Usuários</h3>
                     <p className="text-sm text-muted-foreground mt-1">
                        Exibindo {paginatedUsers.length} de {users.length} usuários
                     </p>
                  </div>
                  <Link href="/admin/users">
                     <CustomButton variant="outline" className="text-sm">
                        Ver todos
                     </CustomButton>
                  </Link>
               </div>

               {users.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                     <p>Nenhum usuário cadastrado</p>
                  </div>
               ) : (
                  <>
                     <div className='overflow-x-auto'>
                        <table className="w-full">
                           <thead>
                              <tr className="border-b border-border">
                                 <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                                    Nome
                                 </th>
                                 <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                                    E-mail
                                 </th>
                                 <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                                    Papel
                                 </th>
                                 <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                                    Departamento
                                 </th>
                                 <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                                    Ações
                                 </th>
                              </tr>
                           </thead>
                           <tbody>
                              {paginatedUsers.map((user) => (
                                 <tr
                                    key={user.id}
                                    className="border-b border-border hover:bg-muted/50 transition-colors"
                                 >
                                    <td className="py-4 px-4 font-medium text-foreground">
                                       {user.name}
                                    </td>
                                    <td className="py-4 px-4 text-muted-foreground">
                                       {user.email}
                                    </td>
                                    <td className="py-4 px-4">
                                       <CustomSelect
                                          options={ROLE_OPTIONS.map(r => ({
                                             id: r.value,
                                             value: r.value,
                                             label: r.label,
                                          }))}
                                          value={user.role}
                                          onChange={(value) => {
                                             const newValue = Array.isArray(value) ? value[0] : value
                                             handleRoleChange(user.id, newValue)
                                          }}
                                          className="w-40"
                                       />
                                    </td>
                                    <td className="py-4 px-4">
                                       <CustomSelect
                                          options={departments.map(d => ({
                                             id: d.id,
                                             value: d.id,
                                             label: d.name,
                                             color: d.color,
                                          }))}
                                          value={user.department_id}
                                          onChange={(value) => {
                                             const newValue = Array.isArray(value) ? value[0] : value
                                             handleDepartmentChange(user.id, newValue)
                                          }}
                                          className="w-70"
                                          showDot
                                       />
                                    </td>
                                    <td className="py-4 px-4">
                                       <div className="flex justify-end">
                                          <button
                                             className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                                             title="Excluir usuário"
                                             onClick={() => openDeleteModal(user.id)}
                                          >
                                             <Trash2 className="h-4 w-4" />
                                          </button>
                                       </div>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                     {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                           <div className="text-sm text-muted-foreground">
                              Página <span className="font-semibold text-foreground">{pagination.currentPage}</span> de{' '}
                              <span className="font-semibold text-foreground">{pagination.totalPages}</span>
                           </div>

                           <div className="flex items-center gap-1">
                              <button
                                 onClick={() => handlePageChange(pagination.currentPage - 1)}
                                 disabled={pagination.currentPage === 1}
                                 className="p-2 rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                                 title="Página anterior"
                              >
                                 <ChevronLeft className="h-4 w-4" />
                              </button>

                              {getPageNumbers().map((page, index) => (
                                 <div key={index}>
                                    {page === '...' ? (
                                       <span className="px-2 text-muted-foreground">•••</span>
                                    ) : (
                                       <button
                                          onClick={() => handlePageChange(page as number)}
                                          className={`
                                          w-8 h-8 p-1 rounded-md transition-colors font-medium text-sm
                                          ${pagination.currentPage === page
                                                ? 'bg-primary text-primary-foreground'
                                                : 'border border-border hover:bg-muted'
                                             }
                                       `}
                                       >
                                          {page}
                                       </button>
                                    )}
                                 </div>
                              ))}

                              <button
                                 onClick={() => handlePageChange(pagination.currentPage + 1)}
                                 disabled={pagination.currentPage === pagination.totalPages}
                                 className="p-2 rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                                 title="Próxima página"
                              >
                                 <ChevronRight className="h-4 w-4" />
                              </button>
                           </div>
                        </div>
                     )}
                  </>
               )}
            </CustomCardContent>
         </CustomCard>

         {/* Seção de departamentos */}
         <CustomCard>
            <CustomCardContent className="p-6">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Gerenciar Departamentos</h3>
                  <Link href="/admin/departments">
                     <CustomButton variant="outline" className="text-sm">
                        <Building2 className="h-4 w-4 mr-2" />
                        Ver todos
                     </CustomButton>
                  </Link>
               </div>

               {departments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                     <p>Nenhum departamento cadastrado</p>
                  </div>
               ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                     {departments.map((dept) => (
                        <div
                           key={dept.id}
                           className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                        >
                           <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                 <h4 className="font-medium text-foreground">{dept.name}</h4>
                                 <p className="text-sm text-muted-foreground mt-1">
                                    {dept.description || 'Sem descrição'}
                                 </p>
                              </div>
                              {dept.color && (
                                 <div className="p-2 rounded-lg bg-primary/6">
                                    <Building2
                                       className="h-6 w-6 text-primary"
                                       style={{ color: dept.color }}
                                    />
                                 </div>
                              )}
                           </div>
                           <div className="mt-3 flex items-center gap-2">
                              <CustomBadge variant="default">
                                 {dept.userCount} {dept.userCount === 1 ? 'usuário' : 'usuários'}
                              </CustomBadge>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </CustomCardContent>
         </CustomCard>

         {/* Modal de confirmação de exclusão */}
         <ConfirmModal
            isOpen={deleteModalOpen}
            onClose={closeDeleteModal}
            onConfirm={handleDeleteUser}
            title="Excluir Usuário"
            message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
            confirmText="Excluir"
            cancelText="Cancelar"
            variant="destructive"
         />
      </div>
   )
}