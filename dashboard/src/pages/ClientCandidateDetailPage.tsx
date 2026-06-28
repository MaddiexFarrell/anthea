import {useEffect, useState} from 'react'
import {Link, useParams} from 'react-router-dom'
import {ArrowLeft, ExternalLink} from 'lucide-react'
import {type Assignment, api} from '../lib/api'
import {AssignmentStatusTag} from '../components/AssignmentStatusTag'
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  CardSection,
  InfoField,
  Skeleton,
  useToast,
} from '../components/ui'

export function ClientCandidateDetailPage() {
  const {id} = useParams<{id: string}>()
  const assignmentId = Number(id)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const notify = useToast()

  const [busy, setBusy] = useState(false)
  const [passing, setPassing] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    if (!assignmentId) return
    setLoading(true)
    api
      .assignment(assignmentId)
      .then(setAssignment)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [assignmentId])

  async function accept() {
    if (!assignment) return
    setBusy(true)
    try {
      setAssignment(await api.updateAssignment(assignment.id, {status: 'accepted'}))
      notify('Accepted — we’ll coordinate next steps.')
    } catch {
      notify('Something went wrong. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  async function submitPass() {
    if (!assignment) return
    setBusy(true)
    try {
      setAssignment(
        await api.updateAssignment(assignment.id, {
          status: 'passed',
          pass_feedback: feedback.trim(),
        }),
      )
      setPassing(false)
      notify('Passed. Thanks for the feedback.')
    } catch {
      notify('Something went wrong. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const c = assignment?.candidate_detail
  const links = c
    ? [
        {label: 'Resume', url: c.resume_url},
        {label: 'LinkedIn', url: c.linkedin_url},
        {label: 'Portfolio', url: c.portfolio_url},
      ].filter((l) => l.url)
    : []

  return (
    <div>
      <Link
        to="/portal/to-review"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-forest"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      {error && (
        <Card>
          <p className="p-5 text-sm text-muted">Couldn't load this candidate.</p>
        </Card>
      )}

      {!error && loading && (
        <>
          <div className="mb-8 flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-7 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
          <div className="grid gap-x-6 gap-y-3 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardSection className="space-y-3">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </CardSection>
              </Card>
            </div>
            <Card>
              <CardSection className="space-y-3">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </CardSection>
            </Card>
          </div>
        </>
      )}

      {!error && !loading && assignment && c && (
        <>
          <header className="mb-8 flex items-center gap-4">
            <Avatar name={c.name} size="lg" src={c.photo_url} zoomable />
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-4xl text-forest">{c.name}</h1>
              {c.title && <p className="mt-1 text-lg text-muted">{c.title}</p>}
            </div>
            <AssignmentStatusTag
              status={assignment.status}
              label={assignment.status_display}
            />
          </header>

          <div className="grid items-start gap-x-6 gap-y-3 lg:grid-cols-3">
            <div className="flex flex-col gap-3 lg:col-span-2">
              <Card>
                <CardHeader title="Profile" />
                <CardSection className="p-6">
                  <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <InfoField label="Role wanted">{c.role_wanted || '—'}</InfoField>
                    <InfoField label="Stage">
                      {c.experience_display || '—'}
                    </InfoField>
                    <InfoField label="University">{c.university || '—'}</InfoField>
                    <InfoField label="Email">
                      {c.email ? (
                        <a
                          href={`mailto:${c.email}`}
                          className="text-forest underline underline-offset-2"
                        >
                          {c.email}
                        </a>
                      ) : (
                        '—'
                      )}
                    </InfoField>
                  </dl>
                  {c.focus_areas.length > 0 && (
                    <div className="mt-5 border-t border-border pt-4">
                      <p className="eyebrow mb-2">Focus areas</p>
                      <div className="flex flex-wrap gap-2">
                        {c.focus_areas.map((t) => (
                          <span
                            key={t.id}
                            className="rounded-md border border-border bg-cream px-2 py-0.5 text-xs font-medium text-muted"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardSection>
              </Card>

              {c.experiences.length > 0 && (
                <Card>
                  <CardHeader title="Experience" />
                  <CardSection className="p-6">
                    <ul className="flex flex-col gap-4">
                      {c.experiences.map((exp, i) => (
                        <li key={exp.id ?? i}>
                          <div className="flex flex-wrap items-baseline gap-x-2">
                            <span className="text-sm font-medium text-ink">
                              {exp.title}
                            </span>
                            {exp.url && (
                              <a
                                href={exp.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-forest underline underline-offset-2"
                              >
                                View
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          {exp.description && (
                            <p className="mt-0.5 text-sm text-muted">
                              {exp.description}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </CardSection>
                </Card>
              )}

              <Card>
                <CardHeader title="About" />
                <CardSection className="p-6">
                  {c.about ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                      {c.about}
                    </p>
                  ) : (
                    <p className="text-sm text-muted">No summary provided yet.</p>
                  )}
                </CardSection>
              </Card>
            </div>

            <div className="flex flex-col gap-3">
              {assignment.status === 'shared' && (
                <Card>
                  <CardHeader title="Your decision" />
                  <CardSection className="p-6">
                    {!passing ? (
                      <div className="flex flex-col gap-2">
                        <Button onClick={accept} loading={busy} className="w-full">
                          Accept
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setPassing(true)}
                          disabled={busy}
                          className="w-full"
                        >
                          Pass
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <label className="flex flex-col gap-1.5">
                          <span className="text-xs font-medium text-ink">
                            Why are you passing? (helps Anthea send better candidates)
                          </span>
                          <textarea
                            autoFocus
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={4}
                            className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-forest focus:ring-2 focus:ring-forest/20"
                            placeholder="Optional, but appreciated…"
                          />
                        </label>
                        <div className="mt-3 flex flex-col gap-2">
                          <Button onClick={submitPass} loading={busy} className="w-full">
                            Submit pass
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => setPassing(false)}
                            disabled={busy}
                            className="w-full"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardSection>
                </Card>
              )}

              <Card>
                <CardHeader title="Links" />
                <CardSection className="p-6">
                  {links.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {links.map((l) => (
                        <a
                          key={l.label}
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-between gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-forest transition-colors hover:bg-hover"
                        >
                          {l.label}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted">No links shared yet.</p>
                  )}
                </CardSection>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
