# Anthea

Marketing site for **Anthea** — a recruiting partner that helps fast-growing
startups hire screened growth and marketing talent.

Built with Vite + React 19 + React Router + Tailwind CSS v4, prerendered to
static HTML with `vite-react-ssg`. Adapted from the Arceus landing repo, with a
light, editorial design system and a deep forest-green brand.

## Routes

- `/` — home, sells to startups (`src/pages/home.tsx`)
- `/candidates` — for talent looking for roles (`src/pages/candidates.tsx`)
- `/contact` — "Hiring, or ready to be hired?" intake form (`src/pages/contact.tsx`)

## Develop

```bash
npm install
npm run dev        # http://localhost:5190
```

The contact form POSTs to `/api/intake`, handled in dev by a Vite middleware
plugin and in production by `serve.mjs`. Without Notion credentials it runs in
**dry-run** mode: valid submissions are logged to the server console and
accepted, so the full flow works locally with no setup.

## Notion integration

Submissions are written to one of two Notion databases depending on whether the
visitor selects "I'm hiring" or "I'm looking for a role".

1. Create a Notion internal integration: https://www.notion.so/my-integrations
2. Create two databases. Property names must match exactly.

   Startups (the "I'm hiring" form):
   - `Name` — Title
   - `Organization` — Text (the company name)
   - `Email` — Email
   - `Roles hiring` — Text
   - `Role type` — Text
   - `Message` — Text
   - `Source` — Text (first-touch UTM attribution)

   Candidates (the "I'm looking for a role" form):
   - `Name` — Title
   - `Email` — Email
   - `University` — Text
   - `LinkedIn` — Text
   - `Role wanted` — Text
   - `Experience` — Text
   - `Message` — Text
   - `Source` — Text (first-touch UTM attribution)
3. Share both databases with the integration.
4. Copy `.env.example` to `.env` and set `NOTION_TOKEN`,
   `NOTION_STARTUPS_DB_ID`, and `NOTION_CANDIDATES_DB_ID`.

See `api/intake.mjs` for the handler and `.env.example` for all variables.

## Build

```bash
npm run build      # prerenders every route to ./dist
npm start          # serve the production build + /api/intake (node serve.mjs)
```

## Deploy

`render.yaml` declares a Render Node web service (not a static site) so the
`/api/intake` route can write to Notion at request time. Set `NOTION_TOKEN`,
`NOTION_STARTUPS_DB_ID`, and `NOTION_CANDIDATES_DB_ID` in the Render dashboard,
then attach the `antheatalent.com` custom domain after the first deploy.

## Assets

- `public/hero.jpg` — hero photograph
- `public/favicon/favicon.png` — the "A" mark (favicon)
- `public/anthea-wordmark.jpg` — supplied wordmark (dark-on-black; not used in
  the light chrome, where the brand renders as serif text via `Wordmark`)
