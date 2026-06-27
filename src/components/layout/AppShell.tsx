"use client"

import React, { useState } from "react"
import { Sidebar } from "./SideBar";
import { Header } from "./Header";
interface AppShellProps {
    children: React.ReactNode
}


export function AppShell({ children }: AppShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-background">
            <Sidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)}
            />

            <div className="md:pl-64">
                <Header 
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    )
}