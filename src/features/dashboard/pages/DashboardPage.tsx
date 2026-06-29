'use client'

import { CollaboratorDashboard } from '@/components/dashboard';
// import { ApproverDashboard } from '@/components/dashboard/approver-dashboard'
// import { AdminDashboard } from '@/components/dashboard/admin-dashboard'
import { useSession } from '@/contexts/session-context';

export default function DashboardPage() {
    const { user } = useSession()

    return (
        <div className="space-y-6">
            {/* Header da página */}
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

            {/* Dashboard específico por perfil */}
            {user.role === 'colaborador' && <CollaboratorDashboard />}
            {/* {user.role === 'aprovador' && <ApproverDashboard />} */}
            {/* {user.role === 'admin' && <AdminDashboard />} */}
        </div>
    )
}
