import {Button} from './Button'

// Controlled confirm modal — a themed replacement for window.confirm().
export function ConfirmDialog({
  title,
  body,
  confirmLabel = 'Confirm',
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: {
  title: string
  body?: string
  confirmLabel?: string
  danger?: boolean
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-forest-deep/30 px-6"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-xl text-forest">{title}</h2>
        {body && <p className="mt-2 text-sm text-muted">{body}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" size="md" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            size="md"
            onClick={onConfirm}
            loading={busy}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
