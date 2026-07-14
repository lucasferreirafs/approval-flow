'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface CustomTabsProps {
  tabs: Tab[]
  defaultTab?: string
  className?: string
}

export function CustomTabs({ tabs, defaultTab, className }: CustomTabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id)

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content

  return (
    <div className={cn('w-full', className)}>
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors relative',
              activeTab === tab.id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>
      <div className="py-4">{activeContent}</div>
    </div>
  )
}
