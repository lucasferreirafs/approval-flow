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
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { DepartmentOptions } from "@/interfaces"
import { FormTaskSchema, formTaskSchema } from "@/schemas"

export function NewTaskPage() {
	const [departmentsOption, setDepartmentsOption] = useState<DepartmentOptions[]>([])
	const [loading, setLoading] = useState<boolean>(false)

	const hasFetched = useRef(false)
	const route = useRouter()
	const { addToast } = useToast()
	const { register, handleSubmit, formState: { errors }, control } = useForm<FormTaskSchema>({
		resolver: zodResolver(formTaskSchema),
	})

	const fetchDepartments = useCallback(async () => {
		try {
			const res = await fetch("/api/departments", { method: "GET" })
			const { data } = await res.json()

			if (res.status != 200) {
				throw new Error("Departamentos indisponíveis. Tente novamente mais tarde.")
			}

			const options = data.map(
				(opt: { id: string, name: string, color: string }) => ({
					id: opt.id,
					value: opt.name,
					label: opt.name,
					color: opt.color,
				})
			)

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

	const onSubmit = async (data: FormTaskSchema) => {
		setLoading(true)

		const id = departmentsOption.find((opt) => opt.value === data.department)?.id

		try {
			const res = await fetch("/api/tasks/new", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...data, department_id: id }),
			})

			if (res.status == 422) {
				addToast({
					title: "Ops! Ocorreu um erro.",
					message: "Dados inválidos. Verifique e tente novamente.",
					type: "warning",
				})
			}

			if (res.status != 201) {
				throw new Error(
					"Ocorreu um erro interno. Se o problema persistir, entre em contato com o suporte."
				)
			} else {
				addToast({
					title: "Tudo pronto!",
					message: "Sua nova tarefa já foi salva.",
					type: "success"
				})

				route.push("/tasks")
			}

		} catch (error: unknown) {
			console.error(error)
			if (error instanceof Error) {
				addToast({
					title: "Ops! Ocorreu um erro.",
					message: error.message,
					type: "error"
				})
			}
		} finally {
			setLoading(false)
		}
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
							{errors.title && <p className="text-xs text-red-500 mt-2">{errors.title.message}</p>}
						</div>

						<div className="space-y-1">
							<CustomTextarea
								{...register("description", { required: true })}
								label="Descrição"
								placeholder="Descreva detalhadamente sua solicitação..."
								className="min-h-30"
							/>
							{errors.description && <p className="text-xs text-red-500 mt-2">{errors.description.message}</p>}
						</div>

						<div className="space-y-1">
							<Controller
								name="department"
								control={control}
								render={({ field }) => (

									<CustomSelect
										{...register("department", { required: true })}
										options={departmentsOption}
										placeholder="Selecione o departamento"
										value={field.value}
										onChange={field.onChange}
										showDot
									/>
								)}
							/>
							{errors.department && <p className="text-xs text-red-500 mt-2">{errors.department.message}</p>}
						</div>

						<div className="space-y-1">
							<CustomInput
								{...register("desiredDate", { required: true })}
								label="Data desejada"
								type="date"
							/>
							{errors.desiredDate && <p className="text-xs text-red-500 mt-2">{errors.desiredDate.message}</p>}
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
