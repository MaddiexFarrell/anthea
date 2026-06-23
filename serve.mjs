// Production server for the prerendered (vite-react-ssg) build.
//
// Serves the static files the way a correct static host does (exact file, then
// <path>/index.html, then <path>.html, then SPA fallback) AND handles the
// /api/intake POST so the contact form can write to Notion in production.
//
// Use as the Render start command: `npm start`.
import {createReadStream} from 'node:fs'
import {stat} from 'node:fs/promises'
import {createServer} from 'node:http'
import {extname, join, normalize} from 'node:path'
import {handleIntakeRequest} from './api/intake.mjs'

const DIST = join(process.cwd(), 'dist')
const PORT = Number(process.env.PORT || 4173)
const HOST = '0.0.0.0'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
}

async function resolveFile(urlPath) {
  const safe = normalize(join(DIST, urlPath))
  if (!safe.startsWith(DIST)) return null

  const candidates = [safe]
  if (!extname(urlPath)) {
    candidates.push(join(safe, 'index.html'), `${safe}.html`)
  }
  for (const candidate of candidates) {
    try {
      const s = await stat(candidate)
      if (s.isFile()) return candidate
    } catch {
      // try next candidate
    }
  }
  return null
}

const server = createServer(async (req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0])

  // API route: the contact-form intake handler.
  if (urlPath === '/api/intake') {
    await handleIntakeRequest(req, res)
    return
  }

  let file = await resolveFile(urlPath)
  // SPA fallback: serve the prerendered home shell for unknown paths.
  if (!file) file = join(DIST, 'index.html')

  const ext = extname(file)
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
  if (urlPath.startsWith('/assets/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  } else if (ext === '.html') {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate')
  }
  createReadStream(file).pipe(res)
})

server.listen(PORT, HOST, () => {
  console.log(`Anthea server listening on http://${HOST}:${PORT} (dist: ${DIST})`)
})
