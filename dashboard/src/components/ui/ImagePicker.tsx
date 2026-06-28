import {useRef, useState} from 'react'
import {Upload} from 'lucide-react'
import {Avatar} from './Avatar'
import {Button} from './Button'

// A small avatar + upload control used in the candidate/company forms. Shows the
// existing image (or initials), lets you pick a new one with a live preview, and
// reports the chosen File up via onChange. Choosing nothing leaves the current
// image unchanged.
export function ImagePicker({
  name,
  src,
  square = false,
  onChange,
}: {
  name: string
  src?: string | null
  square?: boolean
  onChange: (file: File | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  function handleFile(file: File | null) {
    onChange(file)
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  function clear() {
    handleFile(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const shown = preview ?? src ?? undefined

  return (
    <div className="flex items-center gap-4">
      <Avatar name={name || '?'} size="lg" square={square} src={shown} />
      <div className="flex flex-col items-start gap-1.5">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={Upload}
            onClick={() => inputRef.current?.click()}
          >
            {shown ? 'Change' : 'Upload'}
          </Button>
          {preview && (
            <Button type="button" variant="ghost" size="sm" onClick={clear}>
              Clear
            </Button>
          )}
        </div>
        <p className="text-xs text-muted">PNG or JPG.</p>
      </div>
    </div>
  )
}
