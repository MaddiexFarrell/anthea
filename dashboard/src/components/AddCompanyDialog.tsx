import {type FormEvent, useState} from 'react'
import {type Company, type CompanyStatus, api} from '../lib/api'
import {Button, Dialog, FormField, ImagePicker, inputClass} from './ui'

const STATUS_OPTIONS: {value: CompanyStatus; label: string}[] = [
  {value: 'needs_candidates', label: 'Needs candidates'},
  {value: 'reviewing', label: 'Reviewing'},
  {value: 'paused', label: 'Paused'},
  {value: 'placed', label: 'Placed'},
]

// Used for both adding a new company and editing an existing one. Pass a
// `company` to edit; omit it to create.
export function AddCompanyDialog({
  company,
  onClose,
  onSaved,
}: {
  company?: Company
  onClose: () => void
  onSaved: (company: Company) => void
}) {
  const editing = !!company
  const [name, setName] = useState(company?.name ?? '')
  const [pointOfContact, setPointOfContact] = useState(company?.point_of_contact ?? '')
  const [contactEmail, setContactEmail] = useState(company?.contact_email ?? '')
  const [status, setStatus] = useState<CompanyStatus>(
    company?.status ?? 'needs_candidates',
  )
  const [openings, setOpenings] = useState(
    company?.openings != null ? String(company.openings) : '',
  )
  const [logo, setLogo] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    setError(null)
    const data = {
      name: name.trim(),
      point_of_contact: pointOfContact.trim(),
      contact_email: contactEmail.trim(),
      status,
      ...(openings.trim() ? {openings: Number(openings.trim())} : {}),
      ...(logo ? {logo} : {}),
    }
    try {
      const saved = editing
        ? await api.updateCompany(company.id, data)
        : await api.createCompany(data)
      onSaved(saved)
    } catch {
      setError('Could not save the company. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      title={editing ? 'Edit company' : 'Add company'}
      subtitle={editing ? 'Update this company’s details.' : 'A new client startup.'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="company-form"
            loading={submitting}
            disabled={!name.trim()}
          >
            {editing ? 'Save changes' : 'Add company'}
          </Button>
        </>
      }
    >
      <form id="company-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <FormField label="Logo">
          <ImagePicker name={name} src={company?.logo_image_url} square onChange={setLogo} />
        </FormField>

        <FormField label="Company name">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="Acme AI"
          />
        </FormField>

        <FormField label="Point of contact">
          <input
            value={pointOfContact}
            onChange={(e) => setPointOfContact(e.target.value)}
            className={inputClass}
            placeholder="Jane Smith"
          />
        </FormField>

        <FormField label="Contact email">
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className={inputClass}
            placeholder="jane@acme.ai"
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Openings" hint="How many hires they want to make.">
            <input
              type="number"
              min="0"
              value={openings}
              onChange={(e) => setOpenings(e.target.value)}
              className={inputClass}
              placeholder="e.g. 3"
            />
          </FormField>

          <FormField label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CompanyStatus)}
              className={inputClass}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}
      </form>
    </Dialog>
  )
}
