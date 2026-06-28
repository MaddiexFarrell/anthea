import {type FormEvent, useState} from 'react'
import {type CompanyMember, api} from '../lib/api'
import {Button, Dialog, FormField, inputClass} from './ui'

export function InviteClientDialog({
  companyId,
  companyName,
  onClose,
  onInvited,
}: {
  companyId: number
  companyName: string
  onClose: () => void
  onInvited: (member: CompanyMember) => void
}) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const result = await api.inviteClient(companyId, {
        email: email.trim(),
        name: name.trim() || undefined,
      })
      onInvited(result.member)
    } catch {
      setError('Could not send the invite. Check the email and try again.')
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      title="Invite client"
      subtitle={`They'll get an email to sign in with Google and see ${companyName}'s candidates.`}
      onClose={onClose}
    >
      <form id="invite-client" className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <FormField label="Email">
          <input
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="contact@startup.com"
          />
        </FormField>

        <FormField label="Name (optional)">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="Jane Doe"
          />
        </FormField>

        {error && <p className="text-sm text-red-700">{error}</p>}
      </form>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="invite-client"
          loading={submitting}
          disabled={!email.trim()}
        >
          Send invite
        </Button>
      </div>
    </Dialog>
  )
}
