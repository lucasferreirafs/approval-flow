"use client";

import { useEffect, useState, useCallback } from "react"
import { useToast } from "@/contexts/toast-context"
import { Plus, Edit, Trash2, Building2, RotateCw } from "lucide-react"
import { CustomBadge, CustomButton, CustomCard, CustomCardContent, CustomInput, CustomModal, CustomTextarea, ConfirmModal, ColorPicker } from "@/components/ui"
import { DepartmentData } from "@/interfaces"

interface FormDataDepartment {
   name: string
   description: string
   color: string
}

const INITIAL_FORM_DATA: FormDataDepartment = {
   name: "",
   description: "",
   color: ""
}

export function DepartmentsPage() {
   // Estados da página
   const [loading, setLoading] = useState<boolean>(true)
   const [saving, setSaving] = useState<boolean>(false)
   const [openModal, setOpenModal] = useState<boolean>(false)
   const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false)

   // Estados de edição/exclusão
   const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null)
   const [deletingDepartmentId, setDeletingDepartmentId] = useState<string | null>(null)

   // Dados
   const [departments, setDepartments] = useState<DepartmentData[]>([])
   const [formData, setFormData] = useState<FormDataDepartment>(INITIAL_FORM_DATA)
   const [formErrors, setFormErrors] = useState<Record<string, string>>({})

   const { addToast } = useToast()

   const isEditing = editingDepartmentId !== null



   useEffect(() => {
      const fetchDepartments = async () => {
         try {
            const res = await fetch("/api/departments")
            if (!res.ok) throw new Error("Não foi possível carregar os dados.")

            const json = await res.json()
            if (!json.success) throw new Error("Falha ao buscar informações. Tente novamente mais tarde.")

            setDepartments(json.data)

         } catch (error: unknown) {
            console.error("Erro ao buscar departamentos:", error)
            const message = error instanceof Error
               ? error.message
               : "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde."
            addToast({
               title: "Ops! Algo deu errado",
               message,
               type: "error"
            })
         } finally {
            setLoading(false)
         }
      }

      fetchDepartments()

   }, [addToast])

   const openCreateModal = useCallback(() => {
      setFormData(INITIAL_FORM_DATA)
      setFormErrors({})
      setEditingDepartmentId(null)
      setOpenModal(true)
   }, [])

   const openEditModal = useCallback((dept: DepartmentData) => {
      setFormData({
         name: dept.name,
         description: dept.description || "",
         color: dept.color || ""
      })
      setFormErrors({})
      setEditingDepartmentId(dept.id)
      setOpenModal(true)
   }, [])

   const closeModal = useCallback(() => {
      setOpenModal(false)
      setFormData(INITIAL_FORM_DATA)
      setFormErrors({})
      setEditingDepartmentId(null)
   }, [])

   const handleSave = useCallback(async () => {
      setFormErrors({})

      if (!formData.name.trim()) {
         setFormErrors({ name: "O nome do departamento é obrigatório." })
         return
      }

      const isValidColor = /^#[0-9A-Fa-f]{6}$/.test(formData.color)
      if (!isValidColor) {
         setFormErrors({ color: "Cor inválida. Use o formato #RRGGBB." })
         return
      }

      setSaving(true)
      try {
         const url = isEditing
            ? `/api/departments/${editingDepartmentId}`
            : "/api/departments"

         const method = isEditing ? "PUT" : "POST"

         const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               name: formData.name,
               description: formData.description || null,
               color: formData.color
            })
         })

         const json = await res.json()

         if (res.status === 422) {
            setFormErrors(json.errors?.name?.[0] ? { name: json.errors.name[0] } : {})
            return
         }

         if (!res.ok) {
            throw new Error(json.message || "Erro ao salvar departamento.")
         }

         if (isEditing) {
            setDepartments(prev =>
               prev.map(d => d.id === editingDepartmentId ? json.data : d)
            )
         } else {
            setDepartments(prev => [...prev, json.data])
         }

         addToast({
            title: isEditing ? "Departamento atualizado" : "Departamento adicionado",
            message: json.message,
            type: "success",
         })

         closeModal()

      } catch (error: unknown) {
         console.error("Erro ao salvar departamento:", error)
         const message = error instanceof Error
            ? error.message
            : "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde."
         addToast({
            title: "Ops! Ocorreu um erro.",
            message,
            type: "error"
         })
      } finally {
         setSaving(false)
      }
   }, [formData, isEditing, editingDepartmentId, addToast, closeModal])

   const openDeleteModal = useCallback((departmentId: string) => {
      setDeletingDepartmentId(departmentId)
      setDeleteModalOpen(true)
   }, [])

   const closeDeleteModal = useCallback(() => {
      setDeleteModalOpen(false)
      setDeletingDepartmentId(null)
   }, [])

   const handleDelete = useCallback(async () => {
      if (!deletingDepartmentId) return

      try {
         const res = await fetch(`/api/departments/${deletingDepartmentId}`, {
            method: "DELETE"
         })

         const json = await res.json()

         if (!res.ok) {
            throw new Error(json.message || "Erro ao excluir departamento.")
         }

         setDepartments(prev => prev.filter(d => d.id !== deletingDepartmentId))

         addToast({
            title: "Departamento excluído",
            message: json.message,
            type: "success",
         })

         closeDeleteModal()

      } catch (error: unknown) {
         console.error("Erro ao excluir departamento:", error)
         const message = error instanceof Error
            ? error.message
            : "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde."
         addToast({
            title: "Ops! Ocorreu um erro.",
            message,
            type: "error"
         })
      }
   }, [deletingDepartmentId, addToast, closeDeleteModal])

   if (loading) {
      return (
         <div className="py-12 flex items-center justify-center text-gray-500">
            <RotateCw className="h-4 w-4 animate-spin mr-2" />
            Carregando...
         </div>
      )
   }

   return (
      <>
         <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <div>
                  <h1 className="text-2xl font-semibold text-foreground">Gerenciar Departamentos</h1>
                  <p className="text-muted-foreground mt-1">
                     Adicione, edite ou remova departamentos do sistema
                  </p>
               </div>
               <CustomButton onClick={openCreateModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Departamento
               </CustomButton>
            </div>

            {/* Lista de departamentos */}
            {departments.length === 0 ? (
               <CustomCard>
                  <CustomCardContent className="p-12 text-center">
                     <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                     <p className="text-muted-foreground">Nenhum departamento cadastrado</p>
                     <CustomButton onClick={openCreateModal} className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar um departamento
                     </CustomButton>
                  </CustomCardContent>
               </CustomCard>
            ) : (
               <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {departments.map((dept) => (
                     <CustomCard key={dept.id} className="hover:border-primary/30 transition-colors">
                        <CustomCardContent className="p-6">
                           <div className="flex items-start justify-between mb-4">
                              <div className="p-2 rounded-lg bg-primary/6">
                                 <Building2
                                    className="h-6 w-6 text-primary"
                                    style={dept.color ? { color: dept.color } : undefined}
                                 />
                              </div>

                              <div className="flex gap-1">
                                 <button
                                    onClick={() => openEditModal(dept)}
                                    className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                    title="Editar"
                                 >
                                    <Edit className="h-4 w-4" />
                                 </button>
                                 <button
                                    onClick={() => openDeleteModal(dept.id)}
                                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                    title="Excluir"
                                 >
                                    <Trash2 className="h-4 w-4" />
                                 </button>
                              </div>
                           </div>

                           <h3 className="text-lg font-semibold text-foreground mb-2">{dept.name}</h3>
                           <p className="text-sm text-muted-foreground mb-4">
                              {dept.description || "Sem descrição"}
                           </p>

                           <div className="flex items-center gap-2">
                              <CustomBadge variant="default">
                                 {dept.userCount} {dept.userCount === 1 ? 'usuário' : 'usuários'}
                              </CustomBadge>
                           </div>
                        </CustomCardContent>
                     </CustomCard>
                  ))}
               </div>
            )}
         </div>

         {/* Modal de edição/criação */}
         <CustomModal
            isOpen={openModal}
            onClose={closeModal}
            title={isEditing ? "Editar Departamento" : "Novo Departamento"}
            footer={
               <>
                  <CustomButton
                     variant="outline"
                     onClick={closeModal}
                     disabled={saving}
                  >
                     Cancelar
                  </CustomButton>
                  <CustomButton onClick={handleSave} loading={saving}>
                     {isEditing ? "Salvar alterações" : "Adicionar"}
                  </CustomButton>
               </>
            }
         >
            <div className="space-y-4">
               <div className="space-y-1">
                  <CustomInput
                     label="Nome do departamento"
                     placeholder="Ex: Recursos Humanos"
                     value={formData.name}
                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {formErrors.name && (
                     <p className="text-xs text-red-500">{formErrors.name}</p>
                  )}
               </div>
               <CustomTextarea
                  label="Descrição"
                  placeholder="Descreva as responsabilidades do departamento..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
               />

               <div className="space-y-1">
                  <ColorPicker
                     value={formData.color}
                     onChange={(color) => setFormData({ ...formData, color })}
                  />
                  {formErrors.color && (
                     <p className="text-xs text-red-500">{formErrors.color}</p>
                  )}
               </div>
            </div>
         </CustomModal>

         {/* Modal de confirmação de exclusão */}
         <ConfirmModal
            isOpen={deleteModalOpen}
            onClose={closeDeleteModal}
            onConfirm={handleDelete}
            title="Excluir Departamento"
            message="Tem certeza que deseja excluir este departamento? Esta ação não pode ser desfeita e pode afetar usuários e tarefas associados."
            confirmText="Excluir"
            variant="destructive"
         />
      </>
   )
}