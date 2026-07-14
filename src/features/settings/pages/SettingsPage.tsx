"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { useToast } from "@/contexts/toast-context"
import { Sun, Moon, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"
import { CustomButton, CustomCard, CustomCardContent, CustomInput, CustomSwitch, CustomTabs } from "@/components/ui"

export function SettingsPage() {
   const { theme, setTheme } = useTheme()
   const { addToast } = useToast()
   const [loading, setLoading] = useState(false)

   const [notifications, setNotifications] = useState({
      email: true,
      push: false,
      taskCreated: true,
      taskApproved: true,
      taskRejected: true,
   });

   const [passwordData, setPasswordData] = useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
   });

   const handleSaveNotifications = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      addToast({
         title: "Preferências salvas",
         message: "Suas preferências de notificação foram atualizadas.",
         type: "success",
      });
      setLoading(false);
   };

   const handleChangePassword = async () => {
      if (
         !passwordData.currentPassword ||
         !passwordData.newPassword ||
         !passwordData.confirmPassword
      ) {
         addToast({
            title: "Erro",
            message: "Preencha todos os campos.",
            type: "error",
         });
         return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
         addToast({
            title: "Erro",
            message: "As senhas não coincidem.",
            type: "error",
         });
         return;
      }

      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      addToast({
         title: "Senha alterada",
         message: "Sua senha foi atualizada com sucesso.",
         type: "success",
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setLoading(false);
   };

   const themeOptions = [
      { id: "light", label: "Claro", icon: Sun },
      { id: "dark", label: "Escuro", icon: Moon },
      { id: "system", label: "Sistema", icon: Monitor },
   ];

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
                        checked={notifications.email}
                        onCheckedChange={(checked) =>
                           setNotifications({ ...notifications, email: checked })
                        }
                     />
                     <CustomSwitch
                        label="Notificações push (navegador)"
                        checked={notifications.push}
                        onCheckedChange={(checked) =>
                           setNotifications({ ...notifications, push: checked })
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
                        checked={notifications.taskCreated}
                        onCheckedChange={(checked) =>
                           setNotifications({ ...notifications, taskCreated: checked })
                        }
                     />
                     <CustomSwitch
                        label="Quando uma tarefa for aprovada"
                        checked={notifications.taskApproved}
                        onCheckedChange={(checked) =>
                           setNotifications({ ...notifications, taskApproved: checked })
                        }
                     />
                     <CustomSwitch
                        label="Quando uma tarefa for rejeitada"
                        checked={notifications.taskRejected}
                        onCheckedChange={(checked) =>
                           setNotifications({ ...notifications, taskRejected: checked })
                        }
                     />
                  </div>
               </div>

               <div className="flex justify-end pt-4">
                  <CustomButton onClick={handleSaveNotifications} loading={loading}>
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
            <div className="space-y-6 max-w-md">
               <CustomInput
                  label="Senha atual"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                     setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
               />
               <CustomInput
                  label="Nova senha"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
               />
               <CustomInput
                  label="Confirmar nova senha"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                     setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
               />

               <div className="flex justify-end gap-3 pt-4">
                  <CustomButton
                     variant="outline"
                     onClick={() =>
                        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
                     }
                  >
                     Cancelar
                  </CustomButton>
                  <CustomButton onClick={handleChangePassword} loading={loading}>
                     Alterar senha
                  </CustomButton>
               </div>
            </div>
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
                        const Icon = option.icon;
                        const isActive = theme === option.id;
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
                        );
                     })}
                  </div>
               </div>
            </div>
         ),
      },
   ];

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
   );
}
