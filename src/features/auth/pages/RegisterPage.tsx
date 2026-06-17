"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useToast } from "@/contexts/toast-context";
import { Workflow, Sun, Moon, Eye, EyeOff } from "lucide-react";
import { CustomCard, CustomCardContent, CustomCardDescription, CustomCardFooter, CustomCardHeader, CustomCardTitle } from "@/components/ui/CustomCard";
import { CustomInput } from "@/components/ui/CustomInput";
import { CustomButton } from "@/components/ui/CustomButton";
import { CustomSelect } from "@/components/ui/custom-select";

export function RegisterPage() {
   const router = useRouter();
   const { theme, setTheme } = useTheme();
   const { addToast } = useToast();
   const [loading, setLoading] = useState(false);
   const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();


      setLoading(true);
      
      addToast({
         title: "Cadastro realizado com sucesso!",
         message: "Você já pode fazer login",
         type: "success",
      });
   };

   const departmentOptions = [
      { value: "TI", label: "Tecnologia da Informação" },
      { value: "Financeiro", label: "Departamento Financeiro" },
      { value: "RH", label: "Recursos Humanos" },
      { value: "Marketing", label: "Marketing e Comunicação" },
   ]

   return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
         {/* Theme toggle */}
         <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Alternar tema"
         >
            {theme === "dark" ? (
               <Sun className="h-5 w-5 text-foreground" />
            ) : (
               <Moon className="h-5 w-5 text-foreground" />
            )}
         </button>

         <CustomCard className="w-full max-w-md">
            <CustomCardHeader className="text-center space-y-4">
               <div className="flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                     <Workflow className="h-7 w-7 text-primary-foreground" />
                  </div>
               </div>
               <div>
                  <CustomCardTitle className="text-2xl">Criar conta</CustomCardTitle>
                  <CustomCardDescription className="mt-2">
                     Preencha os dados abaixo para se cadastrar
                  </CustomCardDescription>
               </div>
            </CustomCardHeader>

            <form onSubmit={handleSubmit}>
               <CustomCardContent className="space-y-4">
                  <CustomInput
                     label="Nome completo"
                     type="text"
                     placeholder="Seu nome completo"
                  />

                  <CustomInput
                     label="E-mail"
                     type="text"
                     placeholder="seu@email.com"
                  />

                  <div className="relative">
                     <CustomInput
                        label="Senha"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                     />
                     <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-8.5 text-muted-foreground hover:text-foreground transition-colors"
                     >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                     </button>
                  </div>

                  <div className="relative">
                     <CustomInput
                        label="Confirmar senha"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repita a senha"
                     />
                     <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-8.5 text-muted-foreground hover:text-foreground transition-colors"
                     >
                        {false ? (
                           <EyeOff className="h-4 w-4" />
                        ) : (
                           <Eye className="h-4 w-4" />
                        )}
                     </button>
                  </div>

                  <CustomSelect
                     options={departmentOptions}
                  />
               </CustomCardContent>

               <CustomCardFooter className="flex-col gap-4">
                  <CustomButton type="submit" fullWidth loading={loading}>
                     Cadastrar
                  </CustomButton>

                  <p className="text-sm text-muted-foreground text-center">
                     Já tem uma conta?{" "}
                     <Link
                        href="/auth/login"
                        className="text-primary hover:text-primary/80 font-medium transition-colors"
                     >
                        Faça login
                     </Link>
                  </p>
               </CustomCardFooter>
            </form>
         </CustomCard>
      </div>
   );
}
