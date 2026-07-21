"use client";

import { useState } from "react";
import {
   CustomCard,
   CustomCardContent,
   CustomButton,
   CustomInput,
   CustomSelect,
   CustomSwitch,
   CustomAvatar,
} from "@/components/ui"
import { useToast } from "@/contexts/toast-context"
import { User, Shield, Settings, Camera } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useSession } from "@/contexts/session-context";

const menuItems = [
   { id: "profile", label: "Meu Perfil", icon: User },
   { id: "security", label: "Segurança", icon: Shield },
   { id: "preferences", label: "Preferências", icon: Settings },
];

export function ProfilePage() {
   const { user } = useSession();
   const { addToast } = useToast();
   const [activeSection, setActiveSection] = useState("profile");
   const [loading, setLoading] = useState(false);

   const [profileData, setProfileData] = useState({
      name: user.name || "",
      email: user.email || "",
      department: user?.department || departments[0].name,
      cargo: user?.cargo || "",
      isApprover: user?.isApprover || false,
      departmentsToApprove: user?.departmentsToApprove || [],
   });

   const [securityData, setSecurityData] = useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
   });

   const departmentOptions = departments.map((d) => ({
      value: d.name,
      label: d.name,
   }));

   const handleSaveProfile = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      addToast({
         title: "Perfil atualizado",
         message: "Suas informações foram salvas.",
         type: "success",
      });
      setLoading(false);
   };

   const handleChangePassword = async () => {
      if (
         !securityData.currentPassword ||
         !securityData.newPassword ||
         !securityData.confirmPassword
      ) {
         addToast({
            title: "Erro",
            message: "Preencha todos os campos.",
            type: "error",
         });
         return;
      }

      if (securityData.newPassword !== securityData.confirmPassword) {
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
      setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setLoading(false);
   };

   const handleAvatarUpload = () => {
      addToast({
         title: "Upload simulado",
         message: "Em produção, o avatar seria atualizado.",
         type: "info",
      });
   };

   const toggleDepartmentApproval = (dept: string) => {
      setProfileData((prev) => ({
         ...prev,
         departmentsToApprove: prev.departmentsToApprove.includes(dept)
            ? prev.departmentsToApprove.filter((d) => d !== dept)
            : [...prev.departmentsToApprove, dept],
      }));
   };

   return (
      <div className="max-w-5xl mx-auto">
         <div className="mb-6">
            <h1 className="text-2xl font-semibold text-foreground">Meu Perfil</h1>
            <p className="text-muted-foreground mt-1">
               Gerencie suas informações pessoais e preferências
            </p>
         </div>

         <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="md:w-64 shrink-0">
               <CustomCard>
                  <CustomCardContent className="p-4">
                     {/* Avatar */}
                     <div className="flex flex-col items-center pb-4 border-b border-border mb-4">
                        <div className="relative">
                           <CustomAvatar name={profileData.name} size="xl" />
                           <button
                              onClick={handleAvatarUpload}
                              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                              title="Alterar avatar"
                           >
                              <Camera className="h-4 w-4" />
                           </button>
                        </div>
                        <h3 className="mt-3 font-medium text-foreground">{profileData.name}</h3>
                        <p className="text-sm text-muted-foreground">{profileData.email}</p>
                     </div>

                     {/* Menu */}
                     <nav className="space-y-1">
                        {menuItems.map((item) => {
                           const Icon = item.icon;
                           return (
                              <button
                                 key={item.id}
                                 onClick={() => setActiveSection(item.id)}
                                 className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                    activeSection === item.id
                                       ? "bg-primary text-primary-foreground"
                                       : "text-foreground hover:bg-accent",
                                 )}
                              >
                                 <Icon className="h-4 w-4" />
                                 {item.label}
                              </button>
                           );
                        })}
                     </nav>
                  </CustomCardContent>
               </CustomCard>
            </div>

            {/* Conteúdo */}
            <div className="flex-1">
               {/* Seção de Perfil */}
               {activeSection === "profile" && (
                  <CustomCard>
                     <CustomCardContent className="p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-6">
                           Informações Pessoais
                        </h2>
                        <div className="space-y-6">
                           <div className="grid gap-6 sm:grid-cols-2">
                              <CustomInput
                                 label="Nome completo"
                                 value={profileData.name}
                                 onChange={(e) =>
                                    setProfileData({ ...profileData, name: e.target.value })
                                 }
                              />
                              <CustomInput
                                 label="E-mail"
                                 value={profileData.email}
                                 disabled
                                 className="bg-muted/50"
                              />
                           </div>

                           <div className="grid gap-6 sm:grid-cols-2">
                              <CustomSelect
                                 label="Departamento"
                                 options={departmentOptions}
                                 value={profileData.department}
                                 onChange={(value) =>
                                    setProfileData({ ...profileData, department: value })
                                 }
                              />
                              <CustomInput
                                 label="Cargo"
                                 value={profileData.cargo}
                                 onChange={(e) =>
                                    setProfileData({ ...profileData, cargo: e.target.value })
                                 }
                              />
                           </div>

                           {/* Seção de aprovador - visível apenas para aprovadores */}
                           {(user.role === "aprovador" || user.role === "admin") && (
                              <div className="pt-6 border-t border-border">
                                 <h3 className="text-base font-semibold text-foreground mb-4">
                                    Informações de Aprovação
                                 </h3>

                                 <CustomSwitch
                                    label="Atuar como aprovador"
                                    checked={profileData.isApprover}
                                    onCheckedChange={(checked) =>
                                       setProfileData({ ...profileData, isApprover: checked })
                                    }
                                    className="mb-4"
                                 />

                                 {profileData.isApprover && (
                                    <div className="mt-4">
                                       <label className="text-sm font-medium text-foreground mb-3 block">
                                          Departamentos que aprovo
                                       </label>
                                       <div className="flex flex-wrap gap-2">
                                          {departments.map((dept) => (
                                             <button
                                                key={dept.id}
                                                onClick={() => toggleDepartmentApproval(dept.name)}
                                                className={cn(
                                                   "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                                                   profileData.departmentsToApprove.includes(dept.name)
                                                      ? "bg-primary text-primary-foreground border-primary"
                                                      : "bg-transparent text-foreground border-border hover:border-primary",
                                                )}
                                             >
                                                {dept.name}
                                             </button>
                                          ))}
                                       </div>
                                    </div>
                                 )}
                              </div>
                           )}

                           <div className="flex justify-end gap-3 pt-4">
                              <CustomButton variant="outline">Cancelar</CustomButton>
                              <CustomButton onClick={handleSaveProfile} loading={loading}>
                                 Salvar alterações
                              </CustomButton>
                           </div>
                        </div>
                     </CustomCardContent>
                  </CustomCard>
               )}

               {/* Seção de Segurança */}
               {activeSection === "security" && (
                  <CustomCard>
                     <CustomCardContent className="p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-6">Alterar Senha</h2>
                        <div className="space-y-6 max-w-md">
                           <CustomInput
                              label="Senha atual"
                              type="password"
                              value={securityData.currentPassword}
                              onChange={(e) =>
                                 setSecurityData({ ...securityData, currentPassword: e.target.value })
                              }
                           />
                           <CustomInput
                              label="Nova senha"
                              type="password"
                              value={securityData.newPassword}
                              onChange={(e) =>
                                 setSecurityData({ ...securityData, newPassword: e.target.value })
                              }
                           />
                           <CustomInput
                              label="Confirmar nova senha"
                              type="password"
                              value={securityData.confirmPassword}
                              onChange={(e) =>
                                 setSecurityData({ ...securityData, confirmPassword: e.target.value })
                              }
                           />

                           <div className="flex justify-end gap-3 pt-4">
                              <CustomButton
                                 variant="outline"
                                 onClick={() =>
                                    setSecurityData({
                                       currentPassword: "",
                                       newPassword: "",
                                       confirmPassword: "",
                                    })
                                 }
                              >
                                 Cancelar
                              </CustomButton>
                              <CustomButton onClick={handleChangePassword} loading={loading}>
                                 Alterar senha
                              </CustomButton>
                           </div>
                        </div>
                     </CustomCardContent>
                  </CustomCard>
               )}

               {/* Seção de Preferências */}
               {activeSection === "preferences" && (
                  <CustomCard>
                     <CustomCardContent className="p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-6">Preferências</h2>
                        <p className="text-muted-foreground mb-4">
                           Para alterar o tema e outras configurações do sistema, acesse a página de{" "}
                           <Link href="/settings" className="text-primary hover:underline">
                              Configurações
                           </Link>
                           .
                        </p>
                     </CustomCardContent>
                  </CustomCard>
               )}
            </div>
         </div>
      </div>
   )
}
