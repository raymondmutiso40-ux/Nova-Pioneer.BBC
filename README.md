# Nova Pioneer Girls Basketball Portfolio

A player tracking and coaching system for the Nova Pioneer Girls Basketball program — built with Next.js 14, PostgreSQL (Prisma), and NextAuth.

## What's included

- **Players** — name, grade, position, status (add/search/view)
- **Sessions (Training Plan)** — add a session with date, day, focus area, time, court, coach
- **Attendance** — pick a session, mark each player Present/Absent, save
- **Assessments** — star-rated (1–5) skill assessments per player/session, skill list driven by the 9-week Term 3 curriculum
- **Progress** — per-player skill trend chart across the term
- **Two dashboards / roles:**
  - **Coach** — full access to everything above, plus Settings
  - **Moderator** — read-only. Sees every player's performance and can download any player's PDF report. No editing rights anywhere.
- PDF report export (per player) available to both roles

## Tech stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- PostgreSQL via Prisma ORM
- NextAuth (credentials login, role stored on the session/JWT)
- Recharts for trend charts
- @react-pdf/renderer for downloadable player reports

## Local setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
npm run db:push         # creates tables from prisma/schema.prisma
npm run seed             # loads demo players, sessions, and assessments
npm run dev
```

Visit `http://localhost:3000`.

> **Windows note:** `npm run dev`, `npm run seed`, and `npm run db:push` are configured to force IPv4 DNS resolution (`--dns-result-order=ipv4first`). Without this, some Windows setups stall trying IPv6 first when connecting to Render's Postgres and fail with a `P1001: Can't reach database server` error even though the database is reachable. If you ever run a raw `npx prisma ...` command directly instead of through `npm run`, prefix it the same way: `$env:NODE_OPTIONS="--dns-result-order=ipv4first"` in PowerShell first.

### Demo logins (created by the seed script)

| Role      | Email                       | Password        |
|-----------|------------------------------|------------------|
| Coach     | coach@novapioneer.ke         | Coach@2026       |
| Moderator | moderator@novapioneer.ke     | Moderator@2026   |

**Change these passwords (or create new users directly in the database) before putting this in front of real users** — there's no self-serve signup by design; accounts are provisioned directly.

## Deploying — GitHub + Render

1. **Push this project to a GitHub repo.**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

2. **Create the database on Render**
   - Render Dashboard → New → PostgreSQL → name it (e.g. `nova-pioneer-db`) → Create.
   - Copy the **Internal Database URL** once it's provisioned.

3. **Create the web service on Render**
   - Render Dashboard → New → Web Service → connect your GitHub repo.
   - Build command: `npm install && npx prisma db push && npm run build`
   - Start command: `npm start`
   - Add environment variables:
     - `DATABASE_URL` → the Internal Database URL from step 2
     - `NEXTAUTH_SECRET` → any random string (`openssl rand -base64 32`)
     - `NEXTAUTH_URL` → your Render service URL, e.g. `https://nova-pioneer.onrender.com`
   - Deploy.

   A `render.yaml` blueprint is included — you can also use **New → Blueprint** in Render and point it at this repo to provision both the database and the web service in one step.

4. **Seed the production database** (one-time, after first deploy)
   - Render Dashboard → your web service → Shell tab → run:
     ```bash
     npm run seed
     ```
   - Or run it locally by temporarily pointing `DATABASE_URL` in your local `.env` at the Render database's **External** connection string.

## Project structure

```
prisma/schema.prisma       # Player, TrainingSession, Attendance, Assessment, User models
prisma/seed.ts             # Demo data + the 9-week curriculum
src/lib/curriculum.ts      # Term 3 curriculum (week → theme → skills), shared by seed + assessment form
src/lib/auth.ts            # NextAuth config (credentials + role)
src/middleware.ts          # Route protection: /coach/* requires COACH, /moderator/* requires a logged-in user
src/app/coach/*             # Coach dashboard (full access)
src/app/moderator/*         # Moderator dashboard (read-only, all players)
src/app/api/*                # REST endpoints backing every page
```

## Notes

- The 9-week curriculum (Passing & Catching → Game Coaching & Application) is defined once in `src/lib/curriculum.ts` and drives both the seed data and the skill list shown on the "New Assessment" form — editing that file updates both.
- `prisma generate` needs to reach `binaries.prisma.sh` to download its query engine on first install. This works normally on Render, GitHub Actions, and any machine with regular internet access.
- To add more Coach or Moderator accounts, insert rows directly into the `User` table (password must be a bcrypt hash) — there's no in-app user management screen in this version.
