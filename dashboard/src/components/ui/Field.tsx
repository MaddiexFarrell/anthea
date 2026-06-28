import type {ReactNode} from 'react'

// Shared input styling for text inputs, selects, and textareas.
export const inputClass =
  'w-full rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-forest focus:ring-2 focus:ring-forest/20'

// Label + control wrapper used inside forms.
export function FormField({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  )
}

// Read-only label + value, used on detail pages (description lists).
export function InfoField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div>
      <dt className="eyebrow mb-1">{label}</dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  )
}
