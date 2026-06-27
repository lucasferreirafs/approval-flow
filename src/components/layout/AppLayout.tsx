import { SessionProvider } from "@/contexts/session-context";
import { getCurrentUser } from "@/lib/get-current-user";
import { AppShell } from "./AppShell";

interface AppLayoutProps {
    children: React.ReactNode
}

export async function AppLayout({ children }: AppLayoutProps) {
    const user = await getCurrentUser()

    if(!user) {
        return null
    }

    return (
        <SessionProvider user={user}>
            <AppShell>
                {children}
            </AppShell>
        </SessionProvider>
    )
}