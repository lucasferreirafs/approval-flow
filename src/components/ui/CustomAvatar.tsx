import Image from 'next/image'
import { cn } from '@/lib/utils'

interface CustomAvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

export function CustomAvatar({ src, alt, name, size = 'md', className }: CustomAvatarProps) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full bg-primary/10 text-primary font-medium overflow-hidden',
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || name || 'Avatar'}
          fill
          className="object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
