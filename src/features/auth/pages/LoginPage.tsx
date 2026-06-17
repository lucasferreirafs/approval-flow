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

export function LoginPage() {
   const router = useRouter()
   const { theme, setTheme } = useTheme()
   const { addToast } = useToast()
   const [loading, setLoading] = useState(false)
   const [showPassword, setShowPassword] = useState(false)

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      setLoading(true);

      addToast({
         title: "Login realizado com sucesso!",
         message: "Bem-vindo ao ApprovalFlow",
         type: "success",
      });

   };

   return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
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
                  <CustomCardTitle className="text-2xl">ApprovalFlow</CustomCardTitle>
                  <CustomCardDescription className="mt-2">
                     Entre com suas credenciais para acessar o sistema
                  </CustomCardDescription>
               </div>
            </CustomCardHeader>

            <form onSubmit={handleSubmit}>
               <CustomCardContent className="space-y-4">
                  <CustomInput
                     label="E-mail"
                     type="email"
                     placeholder="seu@email.com"
                  />

                  <div className="relative">
                     <CustomInput
                        label="Senha"
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                     />
                     <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-8.5 text-muted-foreground hover:text-foreground transition-colors"
                     >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                     </button>
                  </div>

                  <div className="flex items-center justify-between">
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input
                           type="checkbox"
                           className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-muted-foreground">Lembrar-me</span>
                     </label>
                     <Link
                        href="#"
                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                     >
                        Esqueceu a senha?
                     </Link>
                  </div>
               </CustomCardContent>

               <CustomCardFooter className="flex-col gap-4">
                  <CustomButton type="submit" fullWidth loading={loading}>
                     Entrar
                  </CustomButton>

                  <p className="text-sm text-muted-foreground text-center">
                     Ainda não tem conta?{" "}
                     <Link
                        href="/auth/register"
                        className="text-primary hover:text-primary/80 font-medium transition-colors"
                     >
                        Cadastre-se
                     </Link>
                  </p>
               </CustomCardFooter>
            </form>
         </CustomCard>

         {/* Demo info */}
         <p className="mt-6 text-xs text-muted-foreground text-center max-w-sm">
            Use qualquer e-mail para entrar. O sistema é uma demonstração e os dados são mock.
         </p>
      </div>
   );
}
