"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useToast } from "@/contexts/toast-context"
import { Workflow, Sun, Moon, Eye, EyeOff } from "lucide-react"
import {
   CustomCard,
   CustomCardContent,
   CustomCardDescription,
   CustomCardFooter,
   CustomCardHeader,
   CustomCardTitle
} from "@/components/ui/CustomCard"
import { CustomInput } from "@/components/ui/CustomInput"
import { CustomButton } from "@/components/ui/CustomButton"
import { CustomSelect } from "@/components/ui/custom-select"
import { registerSchema } from "@/schemas/authentication.schema"


interface DepartmentOptions {
   id: string
   value: string
   label: string
}

interface Options {
   id: string
   name: string
   description: string
   color: string
}

export function RegisterPage() {
   const router = useRouter()
   const { theme, setTheme } = useTheme()
   const { addToast } = useToast()
   const [loading, setLoading] = useState<boolean>(false)
   const [showPassword, setShowPassword] = useState<boolean>(false)
   const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
   const [departmentOptions, setDepartmentOptions] = useState<DepartmentOptions[]>([])

   // Data
   const [name, setName] = useState<string>("")
   const [email, setEmail] = useState<string>("")
   const [password, setPassword] = useState<string>("")
   const [confirmPassword, setConfirmPassword] = useState<string>("")
   const [department, setDepartment] = useState<string>("")

   useEffect(() => {
      const fetchDepartments = async () => {
         try {
            const res = await fetch('/api/department')
            const json = await res.json()

            if (!json.success) {
               throw new Error('Erro de requisição')
            }

            const { data } = json

            const options = data.map((opt: Options) => ({
               id: opt.id,
               value: opt.name,
               label: opt.description ?? opt.name,
               color: opt.color,
            }))

            setDepartmentOptions(options)

         } catch (error: unknown) {

            if (error instanceof Error) {
               console.log('Ops... Algo deu errado no servidor!')
            }
         }
      }

      fetchDepartments()
   }, [])

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      const result = registerSchema.safeParse({ 
         name, 
         email, 
         password,
         confirmPassword, 
         department 
      })

      if (!result.success) {
         addToast({
            title: 'Erro de validação',
            message: result.error.issues[0].message,
            type: 'error',
         })
         return
      }

      const selectedDepartment = departmentOptions.find((opt) => opt.value === department)

      if (!selectedDepartment) {
         addToast({ title: 'Erro', message: 'Departamento inválido', type: 'error' })
         return
      }

      const { confirmPassword: _, ...rest } = result.data

      setLoading(true)

      try {
         const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...rest, department: selectedDepartment.id }),
         })

         const json = await res.json()

         if (!res.ok || !json.success) {
            addToast({ title: 'Erro', message: json.message ?? 'Erro inesperado', type: 'error' })
            return
         }

         router.push("/login")

      } catch (error: unknown) {

         addToast({
            title: 'Erro',
            message: error instanceof Error ? error.message : 'Erro inesperado',
            type: 'error',
         })
         
      } finally {
         setLoading(false)
      }
   }

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
                     onChange={(e) => setName(e.target.value)}
                  />

                  <CustomInput
                     label="E-mail"
                     type="text"
                     placeholder="seu@email.com"
                     onChange={(e) => setEmail(e.target.value)}
                  />

                  <div className="relative">
                     <CustomInput
                        label="Senha"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        onChange={(e) => setPassword(e.target.value)}

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
                        onChange={(e) => setConfirmPassword(e.target.value)}

                     />
                     <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-8.5 text-muted-foreground hover:text-foreground transition-colors"
                     >
                        {showConfirmPassword ? (
                           <EyeOff className="h-4 w-4" />
                        ) : (
                           <Eye className="h-4 w-4" />
                        )}
                     </button>
                  </div>

                  <div>
                     <label className="text-sm font-medium text-foreground">Departamento</label>
                     <CustomSelect
                        placeholder="Selecione o departamento"
                        showDot
                        options={departmentOptions}
                        value={department}
                        onChange={(value) => setDepartment(value as string)}
                     />
                  </div>

               </CustomCardContent>

               <CustomCardFooter className="flex-col gap-4">
                  <CustomButton type="submit" fullWidth loading={loading}>
                     Cadastrar
                  </CustomButton>

                  <p className="text-sm text-muted-foreground text-center">
                     Já tem uma conta?{" "}
                     <Link
                        href="/login"
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
