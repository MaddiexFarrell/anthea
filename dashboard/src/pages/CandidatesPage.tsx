import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {ChevronRight, ExternalLink, Plus, Users} from 'lucide-react'
import {type Candidate, api} from '../lib/api'
import {CandidateFormDialog} from '../components/CandidateFormDialog'
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  PageHeader,
  SkeletonList,
  TBody,
  Table,
  Td,
  Th,
  THead,
  Tr,
} from '../components/ui'

export function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[] | null>(null)
  const [error, setError] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api
      .candidates()
      .then(setCandidates)
      .catch(() => setError(true))
  }, [])

  return (
    <div>
      <PageHeader
        title="Candidates"
        subtitle="Everyone you can put forward to companies."
        actions={
          <Button icon={Plus} onClick={() => setShowAdd(true)}>
            Add candidate
          </Button>
        }
      />

      {showAdd && (
        <CandidateFormDialog
          onClose={() => setShowAdd(false)}
          onSaved={(candidate) => {
            setCandidates((prev) => (prev ? [...prev, candidate] : [candidate]))
            setShowAdd(false)
          }}
        />
      )}

      {error && (
        <Card>
          <p className="p-5 text-sm text-muted">
            Couldn't load candidates. Make sure the Django server is running.
          </p>
        </Card>
      )}

      {!error && candidates === null && <SkeletonList rows={4} />}

      {!error && candidates?.length === 0 && (
        <EmptyState
          icon={Users}
          title="No candidates yet"
          description="Add your first candidate so you can start sharing them with companies."
          action={
            <Button icon={Plus} onClick={() => setShowAdd(true)}>
              Add candidate
            </Button>
          }
        />
      )}

      {!error && candidates && candidates.length > 0 && (
        <Table>
          <THead>
            <Th>Name</Th>
            <Th className="hidden sm:table-cell">Role wanted</Th>
            <Th className="hidden md:table-cell">Stage</Th>
            <Th className="w-10" />
          </THead>
          <TBody>
            {candidates.map((c) => (
              <Tr key={c.id} onClick={() => navigate(`/candidates/${c.id}`)}>
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={c.name} size="sm" src={c.photo_url} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{c.name}</p>
                      {c.title && (
                        <p className="truncate text-xs text-muted">{c.title}</p>
                      )}
                      {c.focus_areas.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {c.focus_areas.slice(0, 3).map((t) => (
                            <span
                              key={t.id}
                              className="rounded border border-border bg-cream px-1.5 py-0.5 text-[10px] font-medium text-muted"
                            >
                              {t.name}
                            </span>
                          ))}
                          {c.focus_areas.length > 3 && (
                            <span className="text-[10px] text-muted">
                              +{c.focus_areas.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Td>
                <Td className="hidden text-muted sm:table-cell">
                  {c.role_wanted || '—'}
                </Td>
                <Td className="hidden md:table-cell">
                  {c.experience_display ? (
                    <span className="text-muted">{c.experience_display}</span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </Td>
                <Td className="text-right">
                  <div className="inline-flex items-center gap-2 text-muted">
                    {c.linkedin_url && <ExternalLink className="h-4 w-4" />}
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  )
}
