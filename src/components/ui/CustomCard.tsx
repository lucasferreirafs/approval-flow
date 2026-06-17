import * as React from 'react'
import { cn } from '@/lib/utils'

export type CustomCardProps = React.HTMLAttributes<HTMLDivElement>

export function CustomCard({ className, ...props }: CustomCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card text-card-foreground shadow-sm',
        className
      )}
      {...props}
    />
  )
}

export function CustomCardHeader({ className, ...props }: CustomCardProps) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
}

export function CustomCardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
}

export function CustomCardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

export function CustomCardContent({ className, ...props }: CustomCardProps) {
  return (
    <div className={cn('p-6 pt-0', className)} {...props} />
  )
}

export function CustomCardFooter({ className, ...props }: CustomCardProps) {
  return (
    <div
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
}
