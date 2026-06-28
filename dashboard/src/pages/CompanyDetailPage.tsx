import {useEffect, useMemo, useState} from 'react'
import {Link, useParams} from 'react-router-dom'
import {ArrowLeft, ExternalLink, Pencil, Plus, UserPlus} from 'lucide-react'
import {
  type Assignment,
  type Candidate,
  type Company,
  type CompanyMember,
  api,
} from '../lib/api'
import {StatusBadge} from '../components/StatusBadge'
import {AssignmentStatusTag} from '../components/AssignmentStatusTag'
import {InviteClientDialog} from '../components/InviteClientDialog'
import {AddCompanyDialog} from '../components/AddCompanyDialog'
import {
  Avatar,
  Button,
  Card,
  CardHeader,
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

export function CompanyDetailPage() {
  const {id} = useParams<{id: string}>()
  const companyId = Number(id)
  const [company, setCompany] = useState<Company | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const notify = useToast()

  const [candidateId, setCandidateId] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [removing, setRemoving] = useState<Assignment | null>(null)
  const [removeBusy, setRemoveBusy] = useState(false)

  function addMember(member: CompanyMember) {
    setCompany((prev) =>
      prev
        ? {
            ...prev,
            members: prev.members.some((m) => m.id === member.id)
              ? prev.members
              : [...prev.members, member],
          }
        : prev,
    )
    setShowInvite(false)
    notify('Invite sent.')
  }

  useEffect(() => {
    if (!companyId) return
    setLoading(true)
    Promise.all([
      api.company(companyId),
      api.assignmentsForCompany(companyId),
      api.candidates(),
    ])
      .then(([co, a, ca]) => {
        setCompany(co)
        setAssignments(a)
        setCandidates(ca)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [companyId])

  const availableCandidates = useMemo(() => {
    const taken = new Set(assignments.map((a) => a.candidate))
    return candidates.filter((c) => !taken.has(c.id))
  }, [assignments, candidates])

  // Candidates a client has passed on drop off this company's list (but the
  // assignment record, feedback, and Assign pipeline are kept).
  const activeAssignments = useMemo(
    () => assignments.filter((a) => a.status !== 'passed'),
    [assignments],
  )

  async function handleAssign() {
    if (!candidateId) return
    setAssigning(true)
    try {
      const created = await api.createAssignment({
        candidate: Number(candidateId),
        company: companyId,
      })
      setAssignments((prev) => [...prev, created])
      setCandidateId('')
      setShowShare(false)
      notify(`Shared ${created.candidate_name}.`)
    } catch {
      notify('Could not share that candidate. Please try again.', 'error')
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
      notify(`Removed ${target.candidate_name}.`)
    } catch {
      setAssignments(snapshot)
      notify('Could not remove. Please try again.', 'error')
    } finally {
      setRemoveBusy(false)
      setRemoving(null)
    }
  }

  const links = company
    ? [
        {label: 'Scheduling', url: company.scheduling_link},
        {label: 'Intake', url: company.intake_link},
      ].filter((l) => l.url)
    : []

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/companies"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-forest"
      >
        <ArrowLeft className="h-4 w-4" />
        Companies
      </Link>

      {error && (
        <Card>
          <p className="p-5 text-sm text-muted">Couldn't load this company.</p>
        </Card>
      )}

      {!error && loading && (
        <Card>
          <CardSection>
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          </CardSection>
        </Card>
      )}

      {!error && !loading && company && (
        <>
          <header className="mb-8 flex items-center gap-4">
            <Avatar name={company.name} size="lg" square src={company.logo_image_url} />
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-4xl text-forest">{company.name}</h1>
            </div>
            <StatusBadge status={company.status} label={company.status_display} />
            <Button
              variant="secondary"
              icon={Pencil}
              onClick={() => setShowEdit(true)}
              aria-label="Edit company"
              title="Edit company"
              className="!px-2.5"
            />
          </header>

          <Card className="mb-4">
            <CardSection className="p-6">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoField label="Point of contact">
                  {company.point_of_contact || '—'}
                </InfoField>
                <InfoField label="Contact email">
                  {company.contact_email ? (
                    <a
                      href={`mailto:${company.contact_email}`}
                      className="text-forest underline underline-offset-2"
                    >
                      {company.contact_email}
                    </a>
                  ) : (
                    '—'
                  )}
                </InfoField>
                <InfoField label="Roles">{company.roles || '—'}</InfoField>
                <InfoField label="Openings">
                  {company.openings != null
                    ? `${company.hires_count} of ${company.openings} hired`
                    : '—'}
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
            </CardSection>
          </Card>

          <Card className="mb-4">
            <CardHeader
              title="Client access"
              subtitle="People who can sign in and review candidates."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  icon={UserPlus}
                  onClick={() => setShowInvite(true)}
                >
                  Invite client
                </Button>
              }
            />
            {company.members.length === 0 ? (
              <CardSection>
                <p className="text-sm text-muted">
                  No client users yet. Invite someone so they can sign in and review
                  candidates.
                </p>
              </CardSection>
            ) : (
              <ul>
                {company.members.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center gap-3 border-b border-border px-5 py-3 last:border-0"
                  >
                    <Avatar name={m.email || m.username} size="sm" />
                    <span className="truncate text-sm text-ink">
                      {m.email || m.username}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {showEdit && (
            <AddCompanyDialog
              company={company}
              onClose={() => setShowEdit(false)}
              onSaved={(updated) => {
                setCompany(updated)
                setShowEdit(false)
                notify('Company updated.')
              }}
            />
          )}

          {showInvite && (
            <InviteClientDialog
              companyId={company.id}
              companyName={company.name}
              onClose={() => setShowInvite(false)}
              onInvited={addMember}
            />
          )}

          {showShare && (
            <Dialog
              title="Share a candidate"
              subtitle={`Pick a candidate to share with ${company.name}.`}
              onClose={() => setShowShare(false)}
              footer={
                <>
                  <Button variant="ghost" onClick={() => setShowShare(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAssign}
                    loading={assigning}
                    disabled={!candidateId}
                  >
                    Share
                  </Button>
                </>
              }
            >
              <FormField label="Candidate">
                <select
                  value={candidateId}
                  onChange={(e) => setCandidateId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select a candidate…</option>
                  {availableCandidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.title ? ` — ${c.title}` : ''}
                    </option>
                  ))}
                </select>
              </FormField>
            </Dialog>
          )}

          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl text-forest">Candidates</h2>
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => setShowShare(true)}
              disabled={availableCandidates.length === 0}
              title={
                availableCandidates.length === 0
                  ? 'Every candidate is already shared'
                  : 'Share a candidate'
              }
            >
              Add
            </Button>
          </div>

          {activeAssignments.length === 0 ? (
            <EmptyState
              title="No candidates shared yet"
              description="Use the Add button to share a candidate with this company."
            />
          ) : (
            <Card>
              <ul>
                {activeAssignments.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-0"
                  >
                    <Avatar
                      name={a.candidate_name}
                      size="sm"
                      src={a.candidate_detail.photo_url}
                    />
                    <Link
                      to={`/candidates/${a.candidate}`}
                      className="min-w-0 flex-1 truncate font-medium text-forest hover:underline"
                    >
                      {a.candidate_name}
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
        </>
      )}

      {removing && (
        <ConfirmDialog
          title="Remove candidate?"
          body={`Remove ${removing.candidate_name} from ${company?.name ?? 'this company'}? They’ll no longer see this candidate.`}
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
