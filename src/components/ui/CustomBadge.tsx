import { cn } from '@/lib/utils'

export type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'info'

interface CustomBadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-secondary text-secondary-foreground',
  success: 'bg-success/10 text-success border-success/20',
  error: 'bg-destructive/10 text-destructive border-destructive/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  info: 'bg-primary/10 text-primary border-primary/20',
}

export function CustomBadge({ children, variant = 'default', className }: CustomBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
