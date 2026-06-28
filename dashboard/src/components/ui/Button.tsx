import type {ButtonHTMLAttributes, ReactNode} from 'react'
import {Loader2} from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-forest text-paper hover:bg-forest-hover',
  secondary: 'border border-border text-forest bg-surface hover:bg-hover',
  ghost: 'text-muted hover:bg-hover hover:text-ink',
  danger: 'border border-border text-muted hover:border-red-300 hover:text-red-700 hover:bg-red-50',
}

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: {
  variant?: Variant
  size?: Size
  icon?: React.ComponentType<{className?: string}>
  loading?: boolean
  children?: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex shrink-0 items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {loading ? (
        <Loader2 className={`${iconSize} animate-spin`} aria-hidden="true" />
      ) : (
        Icon && <Icon className={iconSize} aria-hidden="true" />
      )}
      {children}
    </button>
  )
}
