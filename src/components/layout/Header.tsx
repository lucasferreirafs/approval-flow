'use client'

import { useState, useRef, useEffect, useCallback, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { CustomAvatar } from '../ui/CustomAvatar'
import { useSession } from '@/contexts/session-context'
import { useToast } from '@/contexts/toast-context'
import { Menu, Sun, Moon, Bell, ChevronDown, User, LogOut, Loader2, BellOff } from 'lucide-react'

interface HeaderProps {
   onMenuClick: () => void
}

interface Notification {
   id: string
   title: string
   message: string
   read: boolean
   created_at: string
   type: 'info' | 'success' | 'warning' | 'error'
}

const NOTIFICATION_TYPE_STYLES: Record<Notification['type'], string> = {
   info: 'bg-blue-500',
   success: 'bg-success',
   warning: 'bg-warning',
   error: 'bg-destructive',
}

function formatRelativeTime(dateString: string): string {
   const date = new Date(dateString)
   const now = new Date()
   const diffMs = now.getTime() - date.getTime()
   const diffMinutes = Math.floor(diffMs / 60000)
   const diffHours = Math.floor(diffMinutes / 60)
   const diffDays = Math.floor(diffHours / 24)

   if (diffMinutes < 1) return 'agora'
   if (diffMinutes < 60) return `há ${diffMinutes} min`
   if (diffHours < 24) return `há ${diffHours}h`
   if (diffDays < 7) return `há ${diffDays}d`
   return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function useIsMounted(): boolean {
   return useSyncExternalStore(
      () => () => {},
      () => true,
      () => false
   )
}

export function Header({ onMenuClick }: HeaderProps) {
   const router = useRouter()
   const { user } = useSession()
   const { theme, setTheme } = useTheme()
   const { addToast } = useToast()

   const mounted = useIsMounted()

   const [showUserMenu, setShowUserMenu] = useState(false)
   const [showNotifications, setShowNotifications] = useState(false)
   const [notifications, setNotifications] = useState<Notification[]>([])
   const [loadingNotifications, setLoadingNotifications] = useState<boolean>(true)

   const userMenuRef = useRef<HTMLDivElement>(null)
   const notificationRef = useRef<HTMLDivElement>(null)

   const unreadCount = notifications.filter(n => !n.read).length

   useEffect(() => {
      const fetchNotifications = async () => {
         try {
            const res = await fetch(`/api/notifications/${user.id}`)
            const json = await res.json()

            if (!json.success) {
               throw new Error(json.message || "Não foi possível carregar as notificações.")
            }

            setNotifications(json.data)

         } catch (error: unknown) {
            console.error("Erro ao buscar notificações:", error)
            const message = error instanceof Error ? error.message : "Erro desconhecido."
            addToast({
               title: "Ops! Ocorreu um erro.",
               message,
               type: "error"
            })
         } finally {
            setLoadingNotifications(false)
         }
      }

      if (user.id) {
         fetchNotifications()
      }
   }, [user.id, addToast])

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

   const markAsRead = useCallback(async (notificationId: string) => {
      setNotifications(prev =>
         prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )

      try {
         const res = await fetch(`/api/notifications/${notificationId}/read`, {
            method: "PATCH",
         })

         if (!res.ok) throw new Error("Erro ao marcar notificação como lida.")

      } catch (error: unknown) {
         console.error("Erro ao marcar como lida:", error)
         setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: false } : n)
         )
      }
   }, [])

   const markAllAsRead = useCallback(async () => {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
      if (unreadIds.length === 0) return

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))

      try {
         const res = await fetch(`/api/notifications/read-all`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id })
         })

         if (!res.ok) throw new Error("Erro ao marcar notificações como lidas.")

         addToast({
            title: "Notificações atualizadas",
            message: "Todas as notificações foram marcadas como lidas.",
            type: "success"
         })

      } catch (error: unknown) {
         console.error("Erro ao marcar todas como lidas:", error)
         addToast({
            title: "Erro",
            message: "Não foi possível atualizar as notificações.",
            type: "error"
         })
      }
   }, [notifications, user.id, addToast])

   const handleLogout = useCallback(async () => {
      try {
         const res = await fetch("/api/logout", { method: "POST" })

         if (res.status === 200) {
            addToast({
               title: "Sessão encerrada.",
               message: "Sessão encerrada com sucesso. Nos vemos logo!",
               type: "success"
            })
            router.push("/login")
         } else {
            throw new Error("Erro ao realizar logout.")
         }

      } catch (error: unknown) {
         if (error instanceof Error) {
            addToast({
               title: "Algo deu errado.",
               message: "Não foi possível encerrar a sessão. Por favor, tente novamente.",
               type: "error"
            })
         }
      }
   }, [router, addToast])

   return (
      <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60">
         <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
               onClick={onMenuClick}
               className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            >
               <Menu className="h-5 w-5 text-foreground" />
            </button>

            <div className="flex-1 md:ml-0" />

            <div className="flex items-center gap-2">
               <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                  aria-label="Alternar tema"
               >
                  {!mounted ? (
                     <div className="h-5 w-5" />
                  ) : theme === 'dark' ? (
                     <Sun className="h-5 w-5 text-foreground" />
                  ) : (
                     <Moon className="h-5 w-5 text-foreground" />
                  )}
               </button>

               {/* Notificações */}
               <div className="relative" ref={notificationRef}>
                  <button
                     onClick={() => setShowNotifications(!showNotifications)}
                     className="relative p-2 rounded-lg hover:bg-accent transition-colors"
                     aria-label="Notificações"
                  >
                     <Bell className="h-5 w-5 text-foreground" />
                     {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground">
                           {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                     )}
                  </button>

                  {showNotifications && (
                     <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                           <div>
                              <h3 className="font-semibold text-foreground">Notificações</h3>
                              {unreadCount > 0 && (
                                 <p className="text-xs text-muted-foreground mt-0.5">
                                    {unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'}
                                 </p>
                              )}
                           </div>
                           {unreadCount > 0 && (
                              <button
                                 onClick={markAllAsRead}
                                 className="text-xs font-medium text-primary hover:underline"
                              >
                                 Marcar todas como lidas
                              </button>
                           )}
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                           {loadingNotifications ? (
                              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                                 <Loader2 className="h-4 w-4 animate-spin" />
                                 Carregando...
                              </div>
                           ) : notifications.length === 0 ? (
                              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                                 <BellOff className="h-8 w-8 text-muted-foreground opacity-40" />
                                 <p className="text-sm text-muted-foreground">
                                    Nenhuma notificação por aqui
                                 </p>
                              </div>
                           ) : (
                              notifications.map((notification) => (
                                 <button
                                    key={notification.id}
                                    onClick={() => !notification.read && markAsRead(notification.id)}
                                    className={`
                                       w-full text-left p-4 border-b border-border last:border-0
                                       hover:bg-accent transition-colors cursor-pointer flex gap-3
                                       ${!notification.read ? 'bg-primary/5' : ''}
                                    `}
                                 >
                                    <div className="flex flex-col items-center pt-1 shrink-0">
                                       <span className={`w-2 h-2 rounded-full ${NOTIFICATION_TYPE_STYLES[notification.type]}`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                       <div className="flex items-start justify-between gap-2">
                                          <p className={`text-sm truncate ${!notification.read ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
                                             {notification.title}
                                          </p>
                                          {!notification.read && (
                                             <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                                          )}
                                       </div>
                                       <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                          {notification.message}
                                       </p>
                                       <p className="text-xs text-muted-foreground/70 mt-1.5">
                                          {formatRelativeTime(notification.created_at)}
                                       </p>
                                    </div>
                                 </button>
                              ))
                           )}
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