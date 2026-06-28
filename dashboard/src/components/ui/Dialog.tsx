import {type ReactNode, useEffect} from 'react'
import {X} from 'lucide-react'

export function Dialog({
  title,
  subtitle,
  onClose,
  children,
  footer,
  size = 'md',
}: {
  title: string
  subtitle?: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg'
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-forest-deep/40 px-6 py-10 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`max-h-full w-full overflow-y-auto rounded-2xl border border-border bg-surface shadow-card ${size === 'lg' ? 'max-w-lg' : 'max-w-md'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <h2 className="font-display text-2xl text-forest">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 shrink-0 rounded-lg p-1 text-muted transition-colors hover:bg-hover hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
