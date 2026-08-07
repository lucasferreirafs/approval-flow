"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { useToast } from "@/contexts/toast-context"
import { Sun, Moon, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"
import { CustomButton, CustomCard, CustomCardContent, CustomInput, CustomSwitch, CustomTabs } from "@/components/ui"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { changePassword, type ChangePassword, type NotificationPreferences } from "@/schemas"

type ApiResponse<T> = {
   success: boolean
   data?: T
   message?: string
}

export function SettingsPage() {
   const { theme, setTheme } = useTheme()
   const { addToast } = useToast()
   const [notifications, setNotifications] = useState<NotificationPreferences | null>(null)
   const [isLoadingNotifications, setIsLoadingNotifications] = useState(true)
   const [isSavingNotifications, setIsSavingNotifications] = useState(false)

   const {
      register,
      reset,
      handleSubmit,
      formState: { errors, isSubmitting },
   } = useForm<ChangePassword>({
      resolver: zodResolver(changePassword),
      defaultValues: {
         currentPassword: "",
         newPassword: "",
         confirmPassword: "",
      },
   })

   useEffect(() => {
      let isMounted = true

      const fetchNotificationPreferences = async () => {
         setIsLoadingNotifications(true)

         try {
            const response = await fetch("/api/notifications", {
               cache: "no-store",
            })
            const result = await response.json() as ApiResponse<NotificationPreferences>

            if (!response.ok || !result.success || !result.data) {
               throw new Error(result.message || "Não foi possível carregar as preferências de notificação.")
            }

            if (isMounted) {
               setNotifications(result.data)
            }
         } catch (error: unknown) {
            if (!isMounted) return

            addToast({
               title: "Não foi possível carregar as preferências",
               message: error instanceof Error ? error.message : "Erro inesperado.",
               type: "error",
            })
         } finally {
            if (isMounted) {
               setIsLoadingNotifications(false)
            }
         }
      }

      fetchNotificationPreferences()

      return () => {
         isMounted = false
      }
   }, [addToast])

   const handleSaveNotifications = async () => {
      if (!notifications) return

      setIsSavingNotifications(true)

      try {
         const response = await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(notifications),
         })
         const result = await response.json() as ApiResponse<NotificationPreferences>

         if (!response.ok || !result.success || !result.data) {
            throw new Error(result.message || "Não foi possível atualizar as preferências de notificação.")
         }

         setNotifications(result.data)
         addToast({
            title: "Preferências salvas",
            message: "Suas preferências de notificação foram atualizadas.",
            type: "success",
         })
      } catch (error: unknown) {
         addToast({
            title: "Não foi possível salvar as preferências",
            message: error instanceof Error ? error.message : "Erro inesperado.",
            type: "error",
         })
      } finally {
         setIsSavingNotifications(false)
      }
   }

   const handleChangePassword = async (data: ChangePassword) => {
      try {
         const response = await fetch("/api/users/password", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
         })
         const result = await response.json() as ApiResponse<undefined>

         if (!response.ok || !result.success) {
            throw new Error(result.message || "Não foi possível atualizar a senha.")
         }

         reset()
         addToast({
            title: "Senha alterada",
            message: "Sua senha foi atualizada com sucesso.",
            type: "success",
         })
      } catch (error: unknown) {
         addToast({
            title: "Não foi possível alterar a senha",
            message: error instanceof Error ? error.message : "Erro inesperado.",
            type: "error",
         })
      }
   }

   const themeOptions = [
      { id: "light", label: "Claro", icon: Sun },
      { id: "dark", label: "Escuro", icon: Moon },
      { id: "system", label: "Sistema", icon: Monitor },
   ]

   const tabs = [
      {
         id: "notifications",
         label: "Notificações",
         content: (
            <div className="space-y-6">
               <div>
                  <h3 className="text-base font-semibold text-foreground mb-4">
                     Canais de Notificação
                  </h3>
                  <div className="space-y-4">
                     <CustomSwitch
                        label="Notificações por e-mail"
                        checked={notifications?.email_notifications ?? false}
                        disabled={isLoadingNotifications}
                        onCheckedChange={(checked) =>
                           setNotifications((current) => current
                              ? { ...current, email_notifications: checked }
                              : current
                           )
                        }
                     />
                     <CustomSwitch
                        label="Notificações push (navegador)"
                        checked={notifications?.push_notifications ?? false}
                        disabled={isLoadingNotifications}
                        onCheckedChange={(checked) =>
                           setNotifications((current) => current
                              ? { ...current, push_notifications: checked }
                              : current
                           )
                        }
                     />
                  </div>
               </div>

               <div className="pt-6 border-t border-border">
                  <h3 className="text-base font-semibold text-foreground mb-4">
                     Tipos de Notificação
                  </h3>
                  <div className="space-y-4">
                     <CustomSwitch
                        label="Quando uma tarefa for criada"
                        checked={notifications?.notify_task_created ?? false}
                        disabled={isLoadingNotifications}
                        onCheckedChange={(checked) =>
                           setNotifications((current) => current
                              ? { ...current, notify_task_created: checked }
                              : current
                           )
                        }
                     />
                     <CustomSwitch
                        label="Quando uma tarefa for aprovada"
                        checked={notifications?.notify_task_approved ?? false}
                        disabled={isLoadingNotifications}
                        onCheckedChange={(checked) =>
                           setNotifications((current) => current
                              ? { ...current, notify_task_approved: checked }
                              : current
                           )
                        }
                     />
                     <CustomSwitch
                        label="Quando uma tarefa for rejeitada"
                        checked={notifications?.notify_task_rejected ?? false}
                        disabled={isLoadingNotifications}
                        onCheckedChange={(checked) =>
                           setNotifications((current) => current
                              ? { ...current, notify_task_rejected: checked }
                              : current
                           )
                        }
                     />
                  </div>
               </div>

               <div className="flex justify-end pt-4">
                  <CustomButton
                     onClick={handleSaveNotifications}
                     loading={isSavingNotifications}
                     disabled={!notifications || isLoadingNotifications}
                  >
                     Salvar preferências
                  </CustomButton>
               </div>
            </div>
         ),
      },
      {
         id: "password",
         label: "Alterar Senha",
         content: (
            <form className="space-y-6 max-w-md" onSubmit={handleSubmit(handleChangePassword)}>
               <CustomInput
                  label="Senha atual"
                  type="password"
                  autoComplete="current-password"
                  error={errors.currentPassword?.message}
                  {...register("currentPassword")}
               />
               <CustomInput
                  label="Nova senha"
                  type="password"
                  autoComplete="new-password"
                  error={errors.newPassword?.message}
                  {...register("newPassword")}
               />
               <CustomInput
                  label="Confirmar nova senha"
                  type="password"
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
               />

               <div className="flex justify-end gap-3 pt-4">
                  <CustomButton variant="outline" type="button" onClick={() => reset()}>
                     Cancelar
                  </CustomButton>
                  <CustomButton type="submit" loading={isSubmitting}>
                     Alterar senha
                  </CustomButton>
               </div>
            </form>
         ),
      },
      {
         id: "theme",
         label: "Tema",
         content: (
            <div className="space-y-6">
               <div>
                  <h3 className="text-base font-semibold text-foreground mb-4">Aparência</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                     Escolha como o ApprovalFlow deve aparecer no seu dispositivo.
                  </p>

                  <div className="grid gap-4 sm:grid-cols-3">
                     {themeOptions.map((option) => {
                        const Icon = option.icon
                        const isActive = theme === option.id

                        return (
                           <button
                              key={option.id}
                              onClick={() => setTheme(option.id)}
                              className={cn(
                                 "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                                 isActive
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50",
                              )}
                           >
                              <div
                                 className={cn(
                                    "p-3 rounded-lg",
                                    isActive
                                       ? "bg-primary text-primary-foreground"
                                       : "bg-muted text-muted-foreground",
                                 )}
                              >
                                 <Icon className="h-6 w-6" />
                              </div>
                              <span
                                 className={cn(
                                    "text-sm font-medium",
                                    isActive ? "text-primary" : "text-foreground",
                                 )}
                              >
                                 {option.label}
                              </span>
                           </button>
                        )
                     })}
                  </div>
               </div>
            </div>
         ),
      },
   ]

   return (
      <div className="max-w-3xl mx-auto">
         <div className="mb-6">
            <h1 className="text-2xl font-semibold text-foreground">Configurações</h1>
            <p className="text-muted-foreground mt-1">
               Gerencie suas configurações e preferências do sistema
            </p>
         </div>

         <CustomCard>
            <CustomCardContent className="p-6">
               <CustomTabs tabs={tabs} />
            </CustomCardContent>
         </CustomCard>
      </div>
   )
}
