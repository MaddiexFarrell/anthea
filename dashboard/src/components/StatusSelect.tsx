import {useEffect, useLayoutEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'
import {Check, ChevronDown} from 'lucide-react'
import type {AssignmentStatus} from '../lib/api'
import {ASSIGNMENT_STATUSES, STATUS_DOT, STATUS_LABELS} from '../lib/assignmentStatus'

const MENU_WIDTH = 176 // matches w-44

// A small on-theme dropdown for changing an assignment's status. Unlike a
// native <select>, the menu options can be fully styled to match the palette.
// The menu renders in a portal with fixed positioning so it isn't clipped by
// ancestor containers that use overflow-hidden (e.g. cards).
export function StatusSelect({
  value,
  onChange,
}: {
  value: AssignmentStatus
  onChange: (status: AssignmentStatus) => void
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({top: 0, left: 0})

  useLayoutEffect(() => {
    if (!open) return
    function position() {
      const el = triggerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setCoords({top: rect.bottom + 6, left: rect.right - MENU_WIDTH})
    }
    position()
    window.addEventListener('scroll', position, true)
    window.addEventListener('resize', position)
    return () => {
      window.removeEventListener('scroll', position, true)
      window.removeEventListener('resize', position)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node
      if (
        !triggerRef.current?.contains(t) &&
        !menuRef.current?.contains(t)
      ) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-ink transition-colors hover:bg-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
      >
        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[value]}`} />
        {STATUS_LABELS[value]}
        <ChevronDown
          className={`h-3 w-3 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{top: coords.top, left: coords.left, width: MENU_WIDTH}}
            className="fixed z-50 overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-card"
          >
            {ASSIGNMENT_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  if (s !== value) onChange(s)
                  setOpen(false)
                }}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-ink transition-colors hover:bg-hover"
              >
                <span className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[s]}`} />
                  {STATUS_LABELS[s]}
                </span>
                {s === value && <Check className="h-3.5 w-3.5 text-forest" />}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  )
}
