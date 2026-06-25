# Anthea Website — What To Do Next

This is the finished Anthea marketing site your developer built
(Vite + React + Tailwind). It has three pages — **Home**, **Candidates**,
and **Contact** — and a contact form that can save submissions to **Notion**.

It already works on your computer and has been saved into version control (git),
including your developer's latest design changes. Follow the steps below.

You do **not** need the command line for backing up or publishing — you have
**GitHub Desktop** installed, which does it with buttons.

---

## Step 1 — Back it up to GitHub

1. Open the **GitHub Desktop** app (in your Applications folder).
2. Sign in with your GitHub account (free signup at https://github.com).
3. Go to **File → Add Local Repository**.
4. Choose this folder: `Desktop/anthea`, then click **Add Repository**
   (it's already a git repo, so it'll be recognized immediately).
5. Click **Publish repository** at the top.
   - Name it `anthea` (or `anthea-site`).
   - Keep **"Keep this code private"** checked.
   - Click **Publish Repository**.

Your site is now backed up online. From now on, any change shows up in GitHub
Desktop — click **Commit**, then **Push**, to save it.

---

## Step 2 — Publish it live on Render

This site uses **Render** (not Vercel) because the contact form needs a small
server. The project already includes a `render.yaml` blueprint, so Render sets
itself up almost automatically.

1. Go to https://render.com and sign up with **GitHub**.
2. Click **New → Blueprint**.
3. Select your `anthea` repository. Render reads `render.yaml` and proposes a
   web service named **anthea-landing**.
4. Click **Apply / Create**. It will build and deploy (takes a few minutes).
5. You'll get a live URL like `anthea-landing.onrender.com`.

> The form works immediately in **"dry-run" mode** — submissions are accepted
> but only logged, not saved anywhere — until you finish Step 3.

### Add your custom domain (antheatalent.com)

In Render: open the service → **Settings → Custom Domains** → add
`antheatalent.com`, then update your domain's DNS records as Render instructs.

---

## Step 3 — Connect the contact form to Notion (optional, do anytime)

This makes form submissions land in your Notion workspace.

1. Create a Notion integration: https://www.notion.so/my-integrations
   (copy the secret token it gives you).
2. Create **two** Notion databases — one for "I'm hiring" (startups) and one for
   "I'm looking for a role" (candidates). Column names must match exactly.

   The **startups** database needs:
   - `Name` (Title), `Organization` (Text — the company name), `Email` (Email),
     `Roles hiring` (Text), `Role type` (Text), `Message` (Text), `Source` (Text)

   The **candidates** database needs:
   - `Name` (Title), `Email` (Email), `University` (Text), `LinkedIn` (Text),
     `Role wanted` (Text), `Experience` (Text), `Message` (Text), `Source` (Text)
3. Share both databases with your integration (•••  → **Connections**).
4. In **Render → your service → Environment**, add these three values:
   - `NOTION_TOKEN` — the secret from step 1
   - `NOTION_STARTUPS_DB_ID` — the hiring database's ID
   - `NOTION_CANDIDATES_DB_ID` — the candidate database's ID
5. Save — Render redeploys and the form starts writing to Notion.

> A database's ID is the 32-character code in its URL.
> Full details are in `.env.example` and `README.md`.

---

## Step 4 — Edit and preview on your computer (optional)

1. Open the **Terminal** app and run (copy/paste, Enter after each):

   ```
   cd "$HOME/Desktop/anthea"
   npm install
   npm run dev
   ```

2. Open the link it prints — `http://localhost:5190`.
3. Press `Ctrl + C` in Terminal to stop.

You only need `npm install` the first time.

---

## Quick reference

| I want to…            | Do this                                                       |
| --------------------- | ------------------------------------------------------------ |
| Save a change online  | GitHub Desktop → **Commit** → **Push**                       |
| See it live           | Happens automatically after you Push (Render redeploys)      |
| Preview locally       | Terminal → `cd "$HOME/Desktop/anthea"` → `npm run dev`       |
| Where pages live      | `src/pages/` (home, candidates, contact)                     |
| Where images live     | `public/`                                                    |
| Secret keys           | Set in the Render dashboard — never in the code              |

---

## A note on your older folder

You also have an earlier, simpler draft at `Desktop/Anthea Site`. **This new
`Desktop/anthea` folder is the real, finished site** — use this one. Once you've
confirmed everything here is good, you can delete the old `Anthea Site` folder.

If you get stuck on any step, just ask here for help.
