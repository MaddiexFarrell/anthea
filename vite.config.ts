import {writeFileSync} from 'node:fs'
import {join} from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import {defineConfig, type PluginOption, type PreviewServer, type ViteDevServer} from 'vite'
// Loads vite-react-ssg's `ssgOptions` augmentation onto Vite's UserConfig.
import type {ViteReactSSGOptions} from 'vite-react-ssg'
// @ts-expect-error — plain .mjs handler shared with the production server.
import {handleIntakeRequest} from './api/intake.mjs'

// Anthea marketing site, prerendered to static HTML by vite-react-ssg.
//
// The contact form POSTs to /api/intake. In dev, the middleware plugin below
// handles that route (writing to Notion, or logging a dry-run if no token is
// set); in production the same handler runs inside serve.mjs.

const SITE = 'https://antheatalent.com'

const STATIC_ROUTES = [
  {loc: '/', changefreq: 'weekly', priority: '1.0', image: '/hero.jpg'},
  {loc: '/candidates', changefreq: 'monthly', priority: '0.8', image: '/hero.jpg'},
  {loc: '/contact', changefreq: 'monthly', priority: '0.7'},
]

function buildSitemap(): string {
  const urlBlock = (e: {
    loc: string
    changefreq: string
    priority: string
    image?: string
  }) =>
    [
      '  <url>',
      `    <loc>${SITE}${e.loc}</loc>`,
      `    <changefreq>${e.changefreq}</changefreq>`,
      `    <priority>${e.priority}</priority>`,
      e.image
        ? `    <image:image>\n      <image:loc>${SITE}${e.image}</image:loc>\n    </image:image>`
        : '',
      '  </url>',
    ]
      .filter(Boolean)
      .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
${STATIC_ROUTES.map(urlBlock).join('\n')}
</urlset>
`
}

/* Mounts the /api/intake handler on the Vite dev + preview servers so the
   contact form works locally without a separate backend. */
function intakeApiPlugin(): PluginOption {
  const mount = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use('/api/intake', (req, res) => {
      void handleIntakeRequest(req, res)
    })
  }
  return {
    name: 'anthea-intake-api',
    configureServer: mount,
    configurePreviewServer: mount,
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), intakeApiPlugin()],
  ssgOptions: {
    dirStyle: 'nested',
    onFinished: (dir: string) => {
      writeFileSync(join(dir, 'sitemap.xml'), buildSitemap())
    },
  } satisfies ViteReactSSGOptions,
  server: {
    port: Number(process.env.VITE_PORT || 5190),
    host: '0.0.0.0',
  },
  preview: {
    port: Number(process.env.PORT || 4173),
    host: '0.0.0.0',
    allowedHosts: ['.onrender.com', '.antheatalent.com'],
  },
})
