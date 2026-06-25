// =============================================================================
// Intake handler — receives the contact-form submission and writes it to the
// right Notion database (startups vs. candidates).
//
// Shared by:
//   - the Vite dev server (via a middleware plugin in vite.config.ts), so the
//     form works end-to-end during `npm run dev`
//   - the production static server (serve.mjs), so it works once deployed
//
// Configuration (environment variables):
//   NOTION_TOKEN            Notion internal integration secret (required for live writes)
//   NOTION_STARTUPS_DB_ID   Database id for "I'm hiring" submissions
//   NOTION_CANDIDATES_DB_ID Database id for "I'm looking for a role" submissions
//   NOTION_VERSION          Optional, defaults to 2022-06-28
//
// Expected Notion database properties:
//
//   STARTUPS database ("I'm hiring"):
//     Name          — Title
//     Organization  — Text (rich_text)   (the company name)
//     Email         — Email
//     Roles hiring  — Text (rich_text)
//     Role type     — Text (rich_text)   (Intern / Full-time)
//     Message       — Text (rich_text)
//     Source        — Text (rich_text)   (first-touch UTM attribution)
//
//   CANDIDATES database ("I'm looking for a role"):
//     Name          — Title
//     Email         — Email
//     University    — Text (rich_text)
//     LinkedIn      — Text (rich_text)
//     Role wanted   — Text (rich_text)
//     Experience    — Text (rich_text)
//     Message       — Text (rich_text)
//     Source        — Text (rich_text)   (first-touch UTM attribution)
//
// Property names must match EXACTLY (including spaces and capitalization), or
// Notion rejects the write.
//
// DRY-RUN: if NOTION_TOKEN is unset, valid submissions are logged to the console
// and accepted (HTTP 201). This lets the form work locally without secrets; set
// the token + database ids to start writing real rows.
// =============================================================================

const NOTION_API = 'https://api.notion.com/v1/pages'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ATTRIBUTION_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'rep',
]

function sendJson(res, status, body) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  })
  res.end(payload)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    let tooLarge = false
    req.on('data', (chunk) => {
      raw += chunk
      // Guard against absurdly large bodies.
      if (raw.length > 100_000) {
        tooLarge = true
        req.destroy()
      }
    })
    req.on('end', () => {
      if (tooLarge) return reject(new Error('Body too large'))
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

function richText(content) {
  return {rich_text: [{type: 'text', text: {content: content.slice(0, 1900)}}]}
}

function buildProperties(intent, data, source) {
  const props = {
    Name: {title: [{type: 'text', text: {content: data.name.slice(0, 200)}}]},
    Email: {email: data.email},
    Message: richText(data.message),
  }

  if (intent === 'hiring') {
    if (data.organization) props.Organization = richText(data.organization)
    if (data.rolesHiring) props['Roles hiring'] = richText(data.rolesHiring)
    if (data.roleType) props['Role type'] = richText(data.roleType)
  } else {
    if (data.university) props.University = richText(data.university)
    if (data.linkedin) props.LinkedIn = richText(data.linkedin)
    if (data.roleWanted) props['Role wanted'] = richText(data.roleWanted)
    if (data.experience) props.Experience = richText(data.experience)
  }

  if (source) props.Source = richText(source)
  return props
}

async function writeToNotion(databaseId, properties) {
  const res = await fetch(NOTION_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': process.env.NOTION_VERSION || '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({parent: {database_id: databaseId}, properties}),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Notion responded ${res.status}: ${detail}`)
  }
}

// Posts a formatted alert to a Slack Incoming Webhook so submissions are seen in
// real time. No-ops when SLACK_WEBHOOK_URL is unset, so dev without the secret
// still works. Callers should invoke this fire-and-forget: a failed alert must
// never break or slow down the user's submission.
async function notifyLead(intent, data, source) {
  const url = process.env.SLACK_WEBHOOK_URL
  if (!url) return

  const heading =
    intent === 'hiring' ? ':office: New startup inquiry' : ':wave: New candidate'
  const lines = Object.entries(data)
    .filter(([, value]) => value)
    .map(([key, value]) => `*${key}:* ${value}`)
  if (source) lines.push(`*source:* ${source}`)

  const res = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({text: `${heading}\n${lines.join('\n')}`}),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Slack responded ${res.status}: ${detail}`)
  }
}

/**
 * Handles a POST /api/intake request. Returns true if it handled the request
 * (so callers can stop), false if the method/path was not a match.
 */
export async function handleIntakeRequest(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, {error: 'Method not allowed'})
    return
  }

  let data
  try {
    data = await readBody(req)
  } catch {
    sendJson(res, 400, {error: 'Invalid request body'})
    return
  }

  const str = (key) => (typeof data[key] === 'string' ? data[key].trim() : '')

  const name = str('name')
  const email = str('email')
  const intent = data.intent === 'hiring' || data.intent === 'candidate' ? data.intent : ''
  const message = str('message')

  // Fields that differ by intent. We only validate the ones each form sends.
  const clean = {name, email, message}
  const errors = {}

  if (!name) errors.name = ['This field is required.']
  if (!EMAIL_PATTERN.test(email)) errors.email = ['Enter a valid email address.']
  if (!message) errors.message = ['This field is required.']

  if (intent === 'hiring') {
    clean.organization = str('organization')
    clean.rolesHiring = str('rolesHiring')
    clean.roleType = str('roleType')
    if (!clean.organization) errors.organization = ['This field is required.']
    if (!clean.rolesHiring) errors.rolesHiring = ['This field is required.']
    if (!clean.roleType) errors.roleType = ['This field is required.']
  } else if (intent === 'candidate') {
    clean.university = str('university')
    clean.linkedin = str('linkedin')
    clean.roleWanted = str('roleWanted')
    clean.experience = str('experience')
    if (!clean.roleWanted) errors.roleWanted = ['This field is required.']
    if (!clean.experience) errors.experience = ['This field is required.']
  } else {
    errors.intent = ['Let us know what you\u2019re looking for.']
  }

  if (Object.keys(errors).length > 0) {
    sendJson(res, 400, errors)
    return
  }

  const source = ATTRIBUTION_KEYS.filter((k) => data[k])
    .map((k) => `${k}=${String(data[k]).slice(0, 200)}`)
    .join(' ')

  const databaseId =
    intent === 'hiring'
      ? process.env.NOTION_STARTUPS_DB_ID
      : process.env.NOTION_CANDIDATES_DB_ID

  // Dry-run when not configured: accept and log so the form works without secrets.
  if (!process.env.NOTION_TOKEN || !databaseId) {
    console.log(
      `[intake:dry-run] intent=${intent}`,
      JSON.stringify({...clean, source: source || undefined})
    )
    sendJson(res, 201, {ok: true, dryRun: true})
    // Fire-and-forget: lets you test Slack alerts locally without Notion secrets.
    notifyLead(intent, clean, source).catch((err) =>
      console.error('[intake] Slack notification failed:', err)
    )
    return
  }

  try {
    await writeToNotion(databaseId, buildProperties(intent, clean, source))
    sendJson(res, 201, {ok: true})
    // Fire-and-forget: a failed alert must not fail the submission.
    notifyLead(intent, clean, source).catch((err) =>
      console.error('[intake] Slack notification failed:', err)
    )
  } catch (error) {
    console.error('[intake] Notion write failed:', error)
    sendJson(res, 502, {error: 'Could not record submission. Please try again.'})
  }
}
