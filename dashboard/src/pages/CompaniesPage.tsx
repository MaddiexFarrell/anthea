import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {Building2, ChevronRight, Plus} from 'lucide-react'
import {type Company, api} from '../lib/api'
import {AddCompanyDialog} from '../components/AddCompanyDialog'
import {StatusBadge} from '../components/StatusBadge'
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

export function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[] | null>(null)
  const [error, setError] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api
      .companies()
      .then(setCompanies)
      .catch(() => setError(true))
  }, [])

  return (
    <div>
      <PageHeader
        title="Companies"
        subtitle="Your client startups and where each one stands."
        actions={
          <Button icon={Plus} onClick={() => setShowAdd(true)}>
            Add company
          </Button>
        }
      />

      {showAdd && (
        <AddCompanyDialog
          onClose={() => setShowAdd(false)}
          onSaved={(company) => {
            setCompanies((prev) => (prev ? [...prev, company] : [company]))
            setShowAdd(false)
          }}
        />
      )}

      {error && (
        <Card>
          <p className="p-5 text-sm text-muted">
            Couldn't load companies. Make sure the Django server is running.
          </p>
        </Card>
      )}

      {!error && companies === null && <SkeletonList rows={4} />}

      {!error && companies?.length === 0 && (
        <EmptyState
          icon={Building2}
          title="No companies yet"
          description="Add your first client startup to start sharing candidates with them."
          action={
            <Button icon={Plus} onClick={() => setShowAdd(true)}>
              Add company
            </Button>
          }
        />
      )}

      {!error && companies && companies.length > 0 && (
        <Table>
          <THead>
            <Th>Company</Th>
            <Th className="hidden sm:table-cell">Contact</Th>
            <Th className="hidden sm:table-cell">Openings</Th>
            <Th>Status</Th>
            <Th className="w-10" />
          </THead>
          <TBody>
            {companies.map((c) => (
              <Tr key={c.id} onClick={() => navigate(`/companies/${c.id}`)}>
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={c.name} size="sm" square src={c.logo_image_url} />
                    <span className="truncate font-medium text-ink">{c.name}</span>
                  </div>
                </Td>
                <Td className="hidden text-muted sm:table-cell">
                  {c.point_of_contact || '—'}
                </Td>
                <Td className="hidden text-muted sm:table-cell">
                  {c.openings != null ? `${c.hires_count} of ${c.openings}` : '—'}
                </Td>
                <Td>
                  <StatusBadge status={c.status} label={c.status_display} />
                </Td>
                <Td className="text-right">
                  <ChevronRight className="inline h-4 w-4 text-muted" />
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  )
}
