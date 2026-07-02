'use client'

import { CollaboratorDashboard } from '@/components/dashboard';
// import { ApproverDashboard } from '@/components/dashboard/approver-dashboard'
// import { AdminDashboard } from '@/components/dashboard/admin-dashboard'
import { CustomButton } from '@/components/ui/';
import { useSession } from '@/contexts/session-context';
import { RotateCw } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

interface DataCollaborator {
    id: string
    title: string
    department_id: string
    department_name: string
    created_at: string
    status: 'pendente' | 'aprovada' | 'rejeitada' | 'concluida'
}

export default function DashboardPage() {
    const { user } = useSession()
    const [loading, setLoading] = useState<boolean>(true);
    const [dataCollaborator, setDataCollaborator] = useState<DataCollaborator[]>([])

    const fetchData = useCallback(async () => {
        try {
            const [tasksRes, departmentsRes] = await Promise.all([
                fetch(`/api/tasks?id=${user.id}`),
                fetch('/api/departments'),
            ])

            const [tasksData, departmentsData] = await Promise.all([
                tasksRes.json(),
                departmentsRes.json(),
            ])

            if (!tasksData.success || !departmentsData.success) {
                throw new Error('Falha ao carregar dados da API')
            }

            if(tasksData.data.length === 0) {
                setDataCollaborator([])
                return
            }
            
            setDataCollaborator(
                tasksData.data.map((task: DataCollaborator) => {
                    const department = departmentsData.data.find((dept: { id: string; name: string }) => dept.id === task.department_id)
                    return {
                        id: task.id,
                        title: task.title,
                        department_name: department ? department.name : 'Desconecido',
                        created_at: new Date(task.created_at).toLocaleDateString('pt-BR'),
                        status: task.status as 'pendente' | 'aprovada' | 'rejeitada' | 'concluida',
                    }
                })
            )

        } catch (error: unknown) {
            console.log("Erro ao buscar dados da API: ", error)
        } finally {
            setLoading(false)
        }
    }, [user.id])

    useEffect(() => {
        const id = window.setTimeout(() => {
            fetchData()
        }, 0)
        return () => window.clearTimeout(id)
    }, [user.id, fetchData])

    const handleRefresh = () => {
        setLoading(true)
        fetchData()
    }

    return (
        <div className="space-y-6">
            {/* Header da página */}
            <div className="flex items-center justify-between">

                <div>
                    <h1 className="text-2xl font-semibold text-foreground">
                        Olá, {user.name.split(' ')[0] || 'Usuário'}!
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {user.role === 'colaborador' && 'Gerencie suas tarefas e acompanhe o status das aprovações.'}
                        {user.role === 'aprovador' && 'Você tem tarefas aguardando sua aprovação.'}
                        {user.role === 'admin' && 'Visão geral do sistema e gerenciamento de usuários.'}
                    </p>
                </div>


                <CustomButton
                    variant="outline"
                    className="cursor-pointer"
                    onClick={handleRefresh}
                    disabled={loading}
                >
                    {loading ?
                        <RotateCw className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />
                    }
                </CustomButton>
            </div>

            {/* Dashboard específico por perfil */}
            {user.role === 'colaborador' && <CollaboratorDashboard loading={loading} data={dataCollaborator} />}
            {/* {user.role === 'aprovador' && <ApproverDashboard />} */}
            {/* {user.role === 'admin' && <AdminDashboard />} */}
        </div>
    )
}
