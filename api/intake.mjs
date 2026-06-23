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
// Expected Notion database properties (create both databases with these):
//   Name          — Title
//   Email         — Email
//   Organization  — Text (rich_text)
//   Message       — Text (rich_text)
//   Source        — Text (rich_text)   (first-touch UTM attribution)
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

function buildProperties(data, source) {
  const props = {
    Name: {title: [{type: 'text', text: {content: data.name.slice(0, 200)}}]},
    Email: {email: data.email},
    Message: richText(data.message),
  }
  if (data.organization) props.Organization = richText(data.organization)
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

  const name = typeof data.name === 'string' ? data.name.trim() : ''
  const email = typeof data.email === 'string' ? data.email.trim() : ''
  const intent = data.intent === 'hiring' || data.intent === 'candidate' ? data.intent : ''
  const message = typeof data.message === 'string' ? data.message.trim() : ''
  const organization =
    typeof data.organization === 'string' ? data.organization.trim() : ''

  const errors = {}
  if (!name) errors.name = ['Please enter your name.']
  if (!EMAIL_PATTERN.test(email)) errors.email = ['Enter a valid email address.']
  if (!intent) errors.intent = ['Let us know what you\u2019re looking for.']
  if (!message) errors.message = ['A short message helps us help you.']
  if (Object.keys(errors).length > 0) {
    sendJson(res, 400, errors)
    return
  }

  const source = ATTRIBUTION_KEYS.filter((k) => data[k])
    .map((k) => `${k}=${String(data[k]).slice(0, 200)}`)
    .join(' ')

  const clean = {name, email, organization, message}
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
    return
  }

  try {
    await writeToNotion(databaseId, buildProperties(clean, source))
    sendJson(res, 201, {ok: true})
  } catch (error) {
    console.error('[intake] Notion write failed:', error)
    sendJson(res, 502, {error: 'Could not record submission. Please try again.'})
  }
}
