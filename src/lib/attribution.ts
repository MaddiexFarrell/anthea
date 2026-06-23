/* =============================================================================
   Source attribution for inbound leads.

   Reps and ad platforms tag the links they share with standard UTM parameters
   (plus an optional `rep` identifier). We capture those on the visitor's first
   landing, persist them first-touch, and attach them to every intake form
   submission so each lead record carries the source that produced it.

   First-touch (not last-touch): once a visitor is attributed, we never overwrite
   it. The channel that *originally* sourced the lead gets the credit, even if
   they later return via a direct visit or a different link.

   Backend note: these keys ride along in the customer-acquisition POST body.
   The endpoint must accept (and store) them; unknown keys it ignores are
   harmless, but to actually attribute leads they need to be persisted there.
   ============================================================================= */

/* The standard Google/GA UTM set, recognized by every analytics tool, plus our
   own `rep` field for per-person attribution. To capture more later (e.g.
   `gclid`, `referrer`), just add the key here. */
const ATTRIBUTION_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'rep',
] as const

type AttributionKey = (typeof ATTRIBUTION_KEYS)[number]
export type Attribution = Partial<Record<AttributionKey, string>>

const STORAGE_KEY = 'anthea_attribution'

/* In-memory fallback for when localStorage is unavailable (private mode, storage
   disabled). Attribution still works for the life of the page that way. */
let memoryStore: Attribution | null = null

function readStored(): Attribution | null {
  if (memoryStore) return memoryStore
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Attribution) : null
  } catch {
    return memoryStore
  }
}

function writeStored(value: Attribution): void {
  memoryStore = value
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    /* localStorage unavailable — memoryStore already holds it for this page. */
  }
}

/* Pulls the attribution keys out of the current URL's query string. Returns only
   the keys that are actually present and non-empty. */
function readFromUrl(): Attribution {
  const params = new URLSearchParams(window.location.search)
  const found: Attribution = {}
  for (const key of ATTRIBUTION_KEYS) {
    const raw = params.get(key)?.trim()
    if (raw) found[key] = raw
  }
  return found
}

/* Captures first-touch attribution. Call once, as early as possible on initial
   page load (before any client-side navigation), so we read the real entry URL.
   No-op once a visitor has already been attributed. */
export function captureAttribution(): void {
  if (readStored()) return
  const fromUrl = readFromUrl()
  if (Object.keys(fromUrl).length === 0) return
  writeStored(fromUrl)
}

/* Returns the stored attribution to merge into a form payload. Empty object if
   the visitor arrived with no tags (e.g. direct/organic). */
export function getAttribution(): Attribution {
  return readStored() ?? {}
}
