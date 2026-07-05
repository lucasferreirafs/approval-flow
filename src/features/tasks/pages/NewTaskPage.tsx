"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/contexts/toast-context"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import {
	CustomButton,
	CustomCard,
	CustomCardContent,
	CustomInput,
	CustomSelect,
	CustomTextarea
} from "@/components/ui"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { DepartmentOptions } from "@/interfaces"
import { NewTaskSchema, newTaskSchema } from "@/schemas"

export function NewTaskPage() {
	const [departmentsOption, setDepartmentsOption] = useState<DepartmentOptions[]>([])
	const [departmentSelect, setDepartmentSelect] = useState<string>("")
	const [loading, setLoading] = useState<boolean>(false)
	
	const hasFetched = useRef(false)
	// const route = useRouter()
	const { addToast } = useToast()
	const { register, handleSubmit, formState: { errors }} = useForm<NewTaskSchema>({
		resolver: zodResolver(newTaskSchema),
	})


	const fetchDepartments = useCallback(async () => {
		try {
			const res = await fetch("/api/departments")
			const { data } = await res.json()

			if (res.status != 200) {
				throw new Error("Departamentos indisponíveis. Tente novamente mais tarde.")
			}

			const options = data.map((opt: { id: string, name: string, color: string }) => ({
				id: opt.id,
				value: opt.name,
				label: opt.name,
				color: opt.color,
			}))

			setDepartmentsOption(options)

		} catch (error: unknown) {
			if (error instanceof Error) {
				addToast({
					title: "Serviço temporariamente indisponível.",
					message: error.message,
					type: "error",
				})
			}
		}
	}, [addToast])

	useEffect(() => {
		if (hasFetched.current) return
		hasFetched.current = true
		fetchDepartments()
	}, [fetchDepartments])

	const onSubmit = (data: NewTaskSchema) => {
		console.log(data)
	}

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Link href="/dashboard">
					<CustomButton variant="ghost" className="h-9 w-9 p-0">
						<ArrowLeft className="h-5 w-5" />
					</CustomButton>
				</Link>
				<div>
					<h1 className="text-2xl font-semibold text-foreground">Nova Tarefa</h1>
					<p className="text-muted-foreground mt-1">
						Preencha os dados para criar uma nova solicitação
					</p>
				</div>
			</div>

			{/* Formulário */}
			<CustomCard>
				<CustomCardContent className="p-6">
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
						<div className="space-y-1">
							<CustomInput
								{...register("title", { required: true })}
								label="Título"
								placeholder="Ex: Solicitação de novo equipamento"
							/>
						</div>

						<div className="space-y-1">
							<CustomTextarea
								{...register("description", { required: true })}
								label="Descrição"
								placeholder="Descreva detalhadamente sua solicitação..."
								className="min-h-30"
							/>
						</div>

						<div className="space-y-1">
							<CustomSelect
								{...register("department", { required: true })}
								options={departmentsOption}
								showDot
								placeholder="Selecione o departamento"
								value={departmentSelect}
								onChange={(value) => setDepartmentSelect(value as string)}
							/>
							{errors.department && <p>{errors.department.message}</p>}
						</div>

						<div className="space-y-1">
							<CustomInput
								{...register("desiredDate", { required: true })}
								label="Data desejada"
								type="date"
							/>
						</div>

						<div className="flex gap-3 pt-4">
							<Link href="/dashboard" className="flex-1">
								<CustomButton type="button" variant="outline" fullWidth>
									Cancelar
								</CustomButton>
							</Link>
							<CustomButton type="submit" fullWidth loading={loading} className="flex-1">
								<Send className="h-4 w-4 mr-2" />
								Enviar para aprovação
							</CustomButton>
						</div>
					</form>
				</CustomCardContent>
			</CustomCard>
		</div>
	)
}
