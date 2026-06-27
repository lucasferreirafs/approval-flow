'use client'

import { JwtPayload } from '@/lib/auth'
import {
    createContext,
    useContext,
    type ReactNode,
} from 'react'

interface SessionContextData {
    user: JwtPayload
}

const SessionContext = createContext<SessionContextData | null>(null)

interface SessionProviderProps {
    user: JwtPayload
    children: ReactNode
}

export function SessionProvider({ user, children }: SessionProviderProps) {
    return (
        <SessionContext.Provider value={{ user }} >
            {children}
        </SessionContext.Provider>
    )
}

export function useSession() {
    const context = useContext(SessionContext)

    if (!context) {
        throw new Error('useSession deve ser utilizado dentro de um SessionProvider.')
    }

    return context
}