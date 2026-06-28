import {useEffect, useState} from 'react'
import {api} from '../lib/api'
import {Card, CardSection, PageHeader, Skeleton, useToast} from '../components/ui'

export function ClientSettingsPage() {
  const [optIn, setOptIn] = useState<boolean | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [saving, setSaving] = useState(false)
  const notify = useToast()

  useEffect(() => {
    api
      .me()
      .then((u) => setOptIn(u.email_on_new_candidate))
      .catch(() => setLoadError(true))
  }, [])

  async function toggle() {
    if (optIn === null) return
    const next = !optIn
    setOptIn(next)
    setSaving(true)
    try {
      const updated = await api.updatePreferences({email_on_new_candidate: next})
      setOptIn(updated.email_on_new_candidate)
      notify(next ? 'Email updates turned on.' : 'Email updates turned off.')
    } catch {
      setOptIn(!next)
      notify('Couldn’t save your preference. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Choose how you hear from Anthea." />

      <Card>
        <CardSection>
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-ink">
                Email me about new candidates
              </p>
              <p className="mt-1 text-sm text-muted">
                Get an email whenever Anthea shares a new candidate to review. You'll
                always see them in your portal regardless.
              </p>
              {loadError && (
                <p className="mt-2 text-sm text-red-700">
                  Couldn't load your preferences.
                </p>
              )}
            </div>
            {optIn === null && !loadError ? (
              <Skeleton className="mt-1 h-6 w-11 rounded-full" />
            ) : (
              <button
                type="button"
                role="switch"
                aria-checked={optIn === true}
                disabled={optIn === null || saving}
                onClick={toggle}
                className={`relative mt-1 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
                  optIn ? 'bg-forest' : 'bg-border-strong'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-paper transition-transform ${
                    optIn ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            )}
          </div>
        </CardSection>
      </Card>
    </div>
  )
}
