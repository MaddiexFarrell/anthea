import {useEffect, useState} from 'react'

type Size = 'sm' | 'md' | 'lg'

const SIZES: Record<Size, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Initials monogram, or the uploaded image when `src` is provided. `square`
// reads as a company, the default circle as a person. When `zoomable` is set and
// there's an image, clicking it opens the full photo in a lightbox.
export function Avatar({
  name,
  size = 'md',
  square = false,
  src,
  zoomable = false,
}: {
  name: string
  size?: Size
  square?: boolean
  src?: string | null
  zoomable?: boolean
}) {
  const [open, setOpen] = useState(false)
  const shape = square ? 'rounded-lg' : 'rounded-full'

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  if (src) {
    const img = (
      <img
        src={src}
        alt={name}
        className={`h-full w-full border border-border object-cover ${shape}`}
      />
    )

    if (!zoomable) {
      return <span className={`block shrink-0 ${SIZES[size]}`}>{img}</span>
    }

    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`View ${name}'s photo`}
          title="View photo"
          className={`block shrink-0 cursor-zoom-in transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 ${SIZES[size]} ${shape}`}
        >
          {img}
        </button>
        {open && (
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-forest-deep/70 p-6 backdrop-blur-sm"
          >
            <img
              src={src}
              alt={name}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[80vh] max-w-[90vw] rounded-2xl border border-border object-contain shadow-card"
            />
          </div>
        )}
      </>
    )
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center border border-border bg-cream font-medium text-muted ${SIZES[size]} ${shape}`}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}
