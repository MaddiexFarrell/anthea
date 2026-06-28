import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'

// The dashboard runs on :5173 and talks to the Django API on :8000.
// We proxy /api and /accounts to Django so, from the browser's point of view,
// everything is same-origin (localhost:5173). That makes Django's session
// cookie + Google OAuth login work without any CORS/CSRF cross-site setup.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Bind to 127.0.0.1 (not just localhost/IPv6) so the dashboard shares the
    // exact hostname Django uses — cookies are scoped by host, so this lets the
    // login session set on 127.0.0.1:8000 reach the dashboard on 127.0.0.1:5173.
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': {target: 'http://127.0.0.1:8000', changeOrigin: true},
      '/accounts': {target: 'http://127.0.0.1:8000', changeOrigin: true},
      '/admin': {target: 'http://127.0.0.1:8000', changeOrigin: true},
      // Uploaded candidate photos / company logos served by Django.
      '/media': {target: 'http://127.0.0.1:8000', changeOrigin: true},
    },
  },
})
