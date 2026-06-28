import {useEffect, useState} from 'react'
import {Plus, Tag as TagIcon, Trash2} from 'lucide-react'
import {type Tag, api} from '../lib/api'
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  SkeletonList,
  inputClass,
  useToast,
} from '../components/ui'

export function TagsPage() {
  const [tags, setTags] = useState<Tag[] | null>(null)
  const [error, setError] = useState(false)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  // Per-row edited names, keyed by tag id.
  const [edits, setEdits] = useState<Record<number, string>>({})
  const [savingId, setSavingId] = useState<number | null>(null)
  const [removing, setRemoving] = useState<Tag | null>(null)
  const [removeBusy, setRemoveBusy] = useState(false)
  const notify = useToast()

  useEffect(() => {
    api.tags().then(setTags).catch(() => setError(true))
  }, [])

  async function addTag() {
    const name = newName.trim()
    if (!name) return
    setAdding(true)
    try {
      const created = await api.createTag({name})
      setTags((prev) =>
        prev ? [...prev, created].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)) : [created],
      )
      setNewName('')
    } catch {
      notify('Could not add that tag. It may already exist.', 'error')
    } finally {
      setAdding(false)
    }
  }

  async function saveTag(tag: Tag) {
    const name = (edits[tag.id] ?? tag.name).trim()
    if (!name || name === tag.name) return
    setSavingId(tag.id)
    try {
      const updated = await api.updateTag(tag.id, {name})
      setTags((prev) => (prev ? prev.map((t) => (t.id === tag.id ? updated : t)) : prev))
      setEdits((prev) => {
        const next = {...prev}
        delete next[tag.id]
        return next
      })
      notify('Tag renamed.')
    } catch {
      notify('Could not rename that tag. The name may be taken.', 'error')
    } finally {
      setSavingId(null)
    }
  }

  async function confirmRemove() {
    if (!removing) return
    setRemoveBusy(true)
    const target = removing
    const snapshot = tags
    setTags((prev) => (prev ? prev.filter((t) => t.id !== target.id) : prev))
    try {
      await api.deleteTag(target.id)
      notify('Tag deleted.')
    } catch {
      setTags(snapshot)
      notify('Could not delete that tag. Please try again.', 'error')
    } finally {
      setRemoveBusy(false)
      setRemoving(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Manage tags"
        subtitle="Focus-area tags you can attach to candidates. Add, rename, or remove them here."
      />

      <Card className="mb-4">
        <div className="flex gap-2 p-4">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTag()
              }
            }}
            className={inputClass}
            placeholder="New focus area, e.g. Influencer marketing"
          />
          <Button icon={Plus} onClick={addTag} loading={adding} disabled={!newName.trim()}>
            Add
          </Button>
        </div>
      </Card>

      {error && (
        <Card>
          <p className="p-5 text-sm text-muted">Couldn't load tags.</p>
        </Card>
      )}

      {!error && tags === null && <SkeletonList rows={4} />}

      {!error && tags?.length === 0 && (
        <EmptyState
          icon={TagIcon}
          title="No tags yet"
          description="Add your first focus area above."
        />
      )}

      {!error && tags && tags.length > 0 && (
        <Card>
          <ul>
            {tags.map((tag) => {
              const value = edits[tag.id] ?? tag.name
              const dirty = value.trim() !== tag.name && value.trim() !== ''
              return (
                <li
                  key={tag.id}
                  className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0"
                >
                  <input
                    value={value}
                    onChange={(e) =>
                      setEdits((prev) => ({...prev, [tag.id]: e.target.value}))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        saveTag(tag)
                      }
                    }}
                    className={inputClass}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => saveTag(tag)}
                    loading={savingId === tag.id}
                    disabled={!dirty}
                  >
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => setRemoving(tag)}
                    aria-label={`Delete ${tag.name}`}
                    title="Delete tag"
                    className="!px-2"
                  />
                </li>
              )
            })}
          </ul>
        </Card>
      )}

      {removing && (
        <ConfirmDialog
          title="Delete tag?"
          body={`Delete “${removing.name}”? It will be removed from any candidates that use it.`}
          confirmLabel="Delete"
          danger
          busy={removeBusy}
          onConfirm={confirmRemove}
          onCancel={() => setRemoving(null)}
        />
      )}
    </div>
  )
}
