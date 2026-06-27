'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
    Menu,
    Sun,
    Moon,
    Bell,
    User,
    LogOut,
    ChevronDown,
} from 'lucide-react'
import { CustomAvatar } from '../ui/CustomAvatar';
import { useSession } from '@/contexts/session-context';
import { useToast } from '@/contexts/toast-context';

interface HeaderProps {
    onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
    const router = useRouter()
    const { user } = useSession()
    const { theme, setTheme } = useTheme()
    const { addToast } = useToast()
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const userMenuRef = useRef<HTMLDivElement>(null)
    const notificationRef = useRef<HTMLDivElement>(null)

    const unreadCount = 22 // QTD Notificação

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false)
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/logout", { method: "POST" })

            if(res.status === 200){
                addToast({
                    title: "Sessão encerrada.",
                    message: "Sessão encerrada com sucesso. Nos vemos logo!",
                    type: "success"
                })
                router.push("/login")
            } else {
                throw new Error("Erro ao realizar logout.")
            }

        } catch(error: unknown) {
            if(error instanceof Error) {
                addToast({
                    title: "Algo deu errado. Por favor, tente novamente.",
                    message: "Não foi possível encerrar a sessão. Por favor, tente novamente.",
                    type: "error"
                })
            }
        }
    }

    return (
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60">
            <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Menu button (mobile) */}
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
                >
                    <Menu className="h-5 w-5 text-foreground" />
                </button>

                {/* Spacer */}
                <div className="flex-1 md:ml-0" />

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Theme toggle */}
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-2 rounded-lg hover:bg-accent transition-colors"
                        aria-label="Alternar tema"
                    >
                        {theme === 'dark' ? (
                            <Sun className="h-5 w-5 text-foreground" />
                        ) : (
                            <Moon className="h-5 w-5 text-foreground" />
                        )}
                    </button>

                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 rounded-lg hover:bg-accent transition-colors"
                            aria-label="Notificações"
                        >
                            <Bell className="h-5 w-5 text-foreground" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Dropdown de notificações */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-4 border-b border-border">
                                    <h3 className="font-semibold text-foreground">Notificações</h3>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    <div className="p-4 border-b border-border last:border-0 hover:bg-accent transition-colors cursor-pointer">
                                        <p className="text-sm font-medium text-foreground">
                                            Titulo da notificação
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Mensagem da notificação
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User menu */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-colors"
                        >
                            <CustomAvatar name={user.name} size="sm" />
                            <span className="hidden sm:block text-sm font-medium text-foreground max-w-30 truncate">
                                {user.name.split(" ")[0]}
                            </span>
                            <ChevronDown className="hidden sm:block h-4 w-4 text-muted-foreground" />
                        </button>

                        {/* Dropdown do usuário */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-3 border-b border-border">
                                    <p className="font-medium text-foreground truncate">{user.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                                <div className="p-2">
                                    <Link
                                        href="/profile"
                                        onClick={() => setShowUserMenu(false)}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground rounded-lg hover:bg-accent transition-colors"
                                    >
                                        <User className="h-4 w-4" />
                                        Perfil
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sair
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
