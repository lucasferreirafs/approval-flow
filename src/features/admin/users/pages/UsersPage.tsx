"use client";

import { useCallback, useEffect, useState } from "react"
import { useToast } from "@/contexts/toast-context"
import { Trash2, Search, RotateCw, ChevronRight, ChevronLeft } from "lucide-react"
import { CustomCard, CustomCardContent, CustomSelect, ConfirmModal } from "@/components/ui"
import { DepartmentData, PaginationState, RoleOption, User, UserWithDept } from "@/interfaces"
import { enrichUsersWithDepartment } from "@/lib/api"

const ROLE_OPTIONS: RoleOption[] = [
   { value: 'colaborador', label: 'Colaborador' },
   { value: 'aprovador', label: 'Aprovador' },
   { value: 'admin', label: 'Admin' },
]

const ITEMS_PER_PAGE = 6

export function UsersPage() {
   // Estados da página
   const [loading, setLoading] = useState<boolean>(false)
   const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false)
   const [selectedUserIdToDelete, setSelectedUserIdToDelete] = useState<string | null>(null)
   const [searchQuery, setSearchQuery] = useState<string>("")

   // Dados
   const [users, setUsers] = useState<UserWithDept[]>([])
   const [departments, setDepartments] = useState<DepartmentData[]>([])

   // Paginação
   const [pagination, setPagination] = useState<PaginationState>({
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: ITEMS_PER_PAGE,
   })

   const { addToast } = useToast()

   // Obtem usuários para a página atual
   const paginatedUsers = users.slice(
      (pagination.currentPage - 1) * ITEMS_PER_PAGE,
      pagination.currentPage * ITEMS_PER_PAGE
   )

   const filteredUsers = paginatedUsers.filter(
      (user) =>
         user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         user.email.toLowerCase().includes(searchQuery.toLowerCase()),
   )

   useEffect(() => {
      const fetchAllData = async () => {
         setLoading(true)
         try {
            const [resUsers, resDepartments] = await Promise.all([
               fetch("/api/users"),
               fetch("/api/departments")
            ])

            if (!resUsers.ok || !resDepartments.ok) {
               throw new Error("Não foi possível carregar os dados.")
            }

            const [jsonUsers, jsonDepartments] = await Promise.all([
               resUsers.json(),
               resDepartments.json()
            ])

            if (!jsonUsers.success || !jsonDepartments.success) {
               throw new Error("Falha ao buscar informações. Tente novamente mais tarde.")
            }

            const usersData: User[] = jsonUsers.data
            const departmentsData: DepartmentData[] = jsonDepartments.data

            const enrichedUsers = enrichUsersWithDepartment(usersData, departmentsData)

            setUsers(enrichedUsers)
            setDepartments(departmentsData)

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
   }, [addToast])

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

         if (!res.ok) throw new Error("Erro ao excluir usuário")

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
      <>
         <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <div>
                  <h1 className="text-2xl font-semibold text-foreground">Gerenciar Usuários</h1>
                  <p className="text-muted-foreground mt-1">
                     Adicione, edite ou remova usuários do sistema
                  </p>
               </div>
            </div>

            {/* Busca */}
            <CustomCard>
               <CustomCardContent className="p-4">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <input
                        type="text"
                        placeholder="Buscar por nome ou e-mail..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                     />
                  </div>
               </CustomCardContent>
            </CustomCard>

            {/* Tabela */}
            <CustomCard>
               <CustomCardContent className="p-0">
                  <div className="overflow-x-auto">
                     <table className="w-full">
                        <thead>
                           <tr className="border-b border-border">
                              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                                 Nome
                              </th>
                              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                                 E-mail
                              </th>
                              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                                 Papel
                              </th>
                              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                                 Departamento
                              </th>
                              <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">
                                 Ações
                              </th>
                           </tr>
                        </thead>
                        <tbody>
                           {filteredUsers.length === 0 ? (
                              <tr>
                                 <td colSpan={5} className="py-12 text-center text-muted-foreground">
                                    Nenhum usuário encontrado
                                 </td>
                              </tr>
                           ) : filteredUsers.map((user) => (
                              <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                 <td className="py-4 px-6">
                                    <p className="font-medium text-foreground">{user.name}</p>
                                 </td>
                                 <td className="py-4 px-6 text-foreground">{user.email}</td>
                                 <td className="py-4 px-6">
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
                                 <td className="py-4 px-6">
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
                                 <td className="py-4 px-6">
                                    <div className="flex justify-end">
                                       <button
                                          onClick={() => openDeleteModal(user.id)}
                                          className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                                          title="Excluir usuário"
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
               </CustomCardContent>
            </CustomCard>
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


         {/* Modal de confirmação de exclusão */}
         <ConfirmModal
            isOpen={deleteModalOpen}
            onClose={closeDeleteModal}
            onConfirm={handleDeleteUser}
            title="Excluir Usuário"
            message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
            confirmText="Excluir"
            variant="destructive"
         />
      </>
   )
}
