import {ViteReactSSG} from 'vite-react-ssg'
import {routes} from './app.tsx'
import {captureAttribution} from './lib/attribution'
import './index.css'

/* Capture first-touch source attribution from the entry URL before client-side
   routing rewrites the query string. Guarded so it never runs during the SSG
   build (Node), where there is no window. */
if (typeof window !== 'undefined') {
  captureAttribution()
}

/* ViteReactSSG renders each route to static HTML at build time and hydrates it
   on the client — same SPA behavior for users, full HTML for crawlers. */
export const createRoot = ViteReactSSG({routes})
