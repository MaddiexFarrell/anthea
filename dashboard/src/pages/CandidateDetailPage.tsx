import {useEffect, useMemo, useState} from 'react'
import {Link, useParams} from 'react-router-dom'
import {ArrowLeft, ExternalLink, Lock, Pencil, Plus} from 'lucide-react'
import {type Assignment, type Candidate, type Company, api} from '../lib/api'
import {CandidateFormDialog} from '../components/CandidateFormDialog'
import {AssignmentStatusTag} from '../components/AssignmentStatusTag'
import {
  Avatar,
  Button,
  Card,
  CardSection,
  ConfirmDialog,
  Dialog,
  EmptyState,
  FormField,
  InfoField,
  Skeleton,
  inputClass,
  useToast,
} from '../components/ui'

export function CandidateDetailPage() {
  const {id} = useParams<{id: string}>()
  const candidateId = Number(id)
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const notify = useToast()

  const [companyId, setCompanyId] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [editing, setEditing] = useState(false)
  const [removing, setRemoving] = useState<Assignment | null>(null)
  const [removeBusy, setRemoveBusy] = useState(false)

  useEffect(() => {
    if (!candidateId) return
    setLoading(true)
    Promise.all([
      api.candidate(candidateId),
      api.assignmentsForCandidate(candidateId),
      api.companies(),
    ])
      .then(([c, a, co]) => {
        setCandidate(c)
        setAssignments(a)
        setCompanies(co)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [candidateId])

  const availableCompanies = useMemo(() => {
    const taken = new Set(assignments.map((a) => a.company))
    return companies.filter((c) => !taken.has(c.id))
  }, [assignments, companies])

  async function handleAssign() {
    if (!companyId) return
    setAssigning(true)
    try {
      const created = await api.createAssignment({
        candidate: candidateId,
        company: Number(companyId),
      })
      setAssignments((prev) => [...prev, created])
      setCompanyId('')
      setShowShare(false)
      notify(`Shared with ${created.company_name}.`)
    } catch {
      notify('Could not share with that company. Please try again.', 'error')
    } finally {
      setAssigning(false)
    }
  }

  async function confirmRemove() {
    if (!removing) return
    setRemoveBusy(true)
    const snapshot = assignments
    const target = removing
    setAssignments((prev) => prev.filter((a) => a.id !== target.id))
    try {
      await api.deleteAssignment(target.id)
      notify(`Removed from ${target.company_name}.`)
    } catch {
      setAssignments(snapshot)
      notify('Could not remove. Please try again.', 'error')
    } finally {
      setRemoveBusy(false)
      setRemoving(null)
    }
  }

  const links = candidate
    ? [
        {label: 'Resume', url: candidate.resume_url},
        {label: 'LinkedIn', url: candidate.linkedin_url},
        {label: 'Portfolio', url: candidate.portfolio_url},
      ].filter((l) => l.url)
    : []

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/candidates"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-forest"
      >
        <ArrowLeft className="h-4 w-4" />
        Candidates
      </Link>

      {error && (
        <Card>
          <p className="p-5 text-sm text-muted">Couldn't load this candidate.</p>
        </Card>
      )}

      {!error && loading && (
        <Card>
          <CardSection>
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          </CardSection>
        </Card>
      )}

      {!error && !loading && candidate && (
        <>
          <header className="mb-8 flex items-center gap-4">
            <Avatar name={candidate.name} size="lg" src={candidate.photo_url} />
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-4xl text-forest">{candidate.name}</h1>
              {candidate.title && (
                <p className="mt-1 text-lg text-muted">{candidate.title}</p>
              )}
            </div>
            <Button
              variant="secondary"
              icon={Pencil}
              onClick={() => setEditing(true)}
              aria-label="Edit candidate"
              title="Edit candidate"
              className="!px-2.5"
            />
          </header>

          {editing && (
            <CandidateFormDialog
              candidate={candidate}
              onClose={() => setEditing(false)}
              onSaved={(updated) => {
                setCandidate(updated)
                setEditing(false)
                notify('Candidate updated.')
              }}
            />
          )}

          <Card className="mb-4">
            <CardSection className="p-6">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoField label="Current / recent role">
                  {candidate.title || '—'}
                </InfoField>
                <InfoField label="Role wanted">{candidate.role_wanted || '—'}</InfoField>
                <InfoField label="University">{candidate.university || '—'}</InfoField>
                <InfoField label="Experience">
                  {candidate.experience_display || '—'}
                </InfoField>
                <InfoField label="Email">
                  {candidate.email ? (
                    <a
                      href={`mailto:${candidate.email}`}
                      className="text-forest underline underline-offset-2"
                    >
                      {candidate.email}
                    </a>
                  ) : (
                    '—'
                  )}
                </InfoField>
                <InfoField label="Links">
                  {links.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {links.map((l) => (
                        <a
                          key={l.label}
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-forest underline underline-offset-2"
                        >
                          {l.label}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    '—'
                  )}
                </InfoField>
              </dl>

              {candidate.focus_areas.length > 0 && (
                <div className="mt-6 border-t border-border pt-4">
                  <p className="eyebrow mb-2">Focus areas</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.focus_areas.map((t) => (
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

              {candidate.experiences.length > 0 && (
                <div className="mt-6 border-t border-border pt-4">
                  <p className="eyebrow mb-2">Experience</p>
                  <ul className="flex flex-col gap-3">
                    {candidate.experiences.map((exp, i) => (
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
                          <p className="text-sm text-muted">{exp.description}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {candidate.about && (
                <div className="mt-6 border-t border-border pt-4">
                  <p className="eyebrow mb-2">About</p>
                  <p className="whitespace-pre-wrap text-sm text-ink">
                    {candidate.about}
                  </p>
                </div>
              )}
            </CardSection>

            {candidate.intake_notes && (
              <div className="border-t border-border bg-cream px-6 py-4">
                <p className="eyebrow mb-2 flex items-center gap-1.5">
                  <Lock className="h-3 w-3" />
                  Internal notes
                </p>
                <p className="whitespace-pre-wrap text-sm text-ink">
                  {candidate.intake_notes}
                </p>
              </div>
            )}
          </Card>

          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl text-forest">Shared with</h2>
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => setShowShare(true)}
              disabled={availableCompanies.length === 0}
              title={
                availableCompanies.length === 0
                  ? 'Shared with every company'
                  : 'Share with a company'
              }
            >
              Add
            </Button>
          </div>

          {assignments.length === 0 ? (
            <EmptyState
              title="Not shared yet"
              description="Use the Add button to share this candidate with a company."
            />
          ) : (
            <Card>
              <ul>
                {assignments.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-0"
                  >
                    <Link
                      to={`/companies/${a.company}`}
                      className="min-w-0 flex-1 truncate text-sm font-medium text-forest hover:underline"
                    >
                      {a.company_name}
                    </Link>
                    <AssignmentStatusTag status={a.status} label={a.status_display} />
                    <Button variant="ghost" size="sm" onClick={() => setRemoving(a)}>
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {showShare && (
            <Dialog
              title="Share with a company"
              subtitle={`Pick a company to share ${candidate.name} with.`}
              onClose={() => setShowShare(false)}
              footer={
                <>
                  <Button variant="ghost" onClick={() => setShowShare(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAssign}
                    loading={assigning}
                    disabled={!companyId}
                  >
                    Share
                  </Button>
                </>
              }
            >
              <FormField label="Company">
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select a company…</option>
                  {availableCompanies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </Dialog>
          )}
        </>
      )}

      {removing && (
        <ConfirmDialog
          title="Remove candidate?"
          body={`Remove ${candidate?.name ?? 'this candidate'} from ${removing.company_name}? They’ll no longer see this candidate.`}
          confirmLabel="Remove"
          danger
          busy={removeBusy}
          onConfirm={confirmRemove}
          onCancel={() => setRemoving(null)}
        />
      )}
    </div>
  )
}
