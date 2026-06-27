'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ClipboardList,
  CheckSquare,
  Building2,
  Users,
  Settings,
  X,
  Workflow,
} from 'lucide-react'
import { useSession } from '@/contexts/session-context'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles?: ('colaborador' | 'aprovador' | 'admin')[]
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Minhas Tarefas', icon: ClipboardList },
  { href: '/approvals', label: 'Tarefas para Aprovação', icon: CheckSquare, roles: ['aprovador', 'admin'] },
  { href: '/admin/departments', label: 'Departamentos', icon: Building2, roles: ['admin'] },
  { href: '/admin/users', label: 'Usuários', icon: Users, roles: ['admin'] },
  { href: '/settings', label: 'Configurações', icon: Settings },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useSession()

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  )

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Workflow className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-sidebar-foreground">
                ApprovalFlow
              </span>
            </Link>
            <button
              onClick={onClose}
              className="md:hidden p-1 rounded-lg hover:bg-sidebar-accent transition-colors"
            >
              <X className="h-5 w-5 text-sidebar-foreground" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                const Icon = item.icon

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  )
}
