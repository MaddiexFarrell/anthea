import type {ReactNode} from 'react'

export function Card({
  children,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'section'
}) {
  return (
    <Tag
      className={`overflow-hidden rounded-xl border border-border bg-surface shadow-card ${className}`}
    >
      {children}
    </Tag>
  )
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3.5">
      <div className="min-w-0">
        <h2 className="truncate font-medium text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 truncate text-xs text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function CardSection({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`p-5 ${className}`}>{children}</div>
}
