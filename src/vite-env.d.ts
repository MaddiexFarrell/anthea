/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base API URL, including the /api suffix (e.g. https://api.govector.ai/api).
   *  Unset in local dev — the app falls back to /api, which Vite proxies. */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
