# EMS REH101 — Next.js rewrite

Full-stack Next.js rewrite of the Laravel EMS-REH101 app (public site + admin
CMS for the Emergency Medical Service unit of Roi Et Hospital). Data was
migrated off the Laravel app's MySQL database into Postgres (Neon, via the
Vercel Marketplace integration), connected via Prisma.

## Local development

1. Copy `.env.example` to `.env` and fill in `DATABASE_URL`, `AUTH_SECRET`,
   and `UPLOADS_DIR` (point it at the Laravel app's `storage/app/public`
   while both apps share one database during the transition). Fill in
   `BLOB_READ_WRITE_TOKEN` too if you want to test new uploads locally — see
   Deployment below for where that comes from.
2. `npm install`
3. `npx prisma generate`
4. `npm run dev` — [http://localhost:3000](http://localhost:3000)

Admin CMS is at `/admin/login`.

## Architecture notes

- **Auth**: NextAuth v5, Credentials provider, JWT sessions. Config is split
  across `src/auth.config.ts` (edge-safe, used by `src/proxy.ts` for route
  gating) and `src/auth.ts` (full config with Prisma/bcrypt, used by the
  route handler and server-side `auth()` calls) — the Credentials provider
  can't run on the Edge runtime. `trustHost: true` is required behind
  Vercel's proxy, or every request gets rejected as an `UntrustedHost`.
- **Permissions**: `src/lib/permissions.ts` ports the Laravel app's
  `config/permissions.php` module → allowed-roles map.
- **File uploads**: new uploads go to **Vercel Blob** (`src/lib/uploads-write.ts`),
  which stores the full `https://...` URL directly in the DB. Rows still
  carrying a pre-Blob relative path (seeded from the Laravel app's
  `storage/app/public`) are served through `/uploads/[...path]` via
  `UPLOADS_DIR` for local dev — `src/lib/upload.ts`'s `uploadUrl()` handles
  both shapes. Vercel's filesystem is ephemeral/read-only in production, so
  there's no local-disk option there.
- **Equipment due-date notifications**: `src/lib/equipment-notifications.ts`
  runs on a schedule via `/api/cron/sync-notifications` (see `vercel.json`),
  not on every admin page load like the original.

## Deployment (Vercel)

1. **Database**: Postgres via [Neon](https://neon.com), installed as a
   Vercel Marketplace integration (Storage tab → Create Database → Neon).
   This provisions the DB and injects `DATABASE_URL` into the project's
   environment variables automatically — Neon's pooled connection string
   handles Vercel's many short-lived serverless connections fine on its own.
   Data was migrated one-time from the original Laravel MySQL database.
2. **Blob storage**: Project → Storage → Create Database → Blob. Vercel
   injects `BLOB_READ_WRITE_TOKEN` automatically for deployments; run
   `vercel env pull` to get it into your local `.env` too.
3. **Cron**: `vercel.json` already declares the daily sync job (Hobby plan
   caps cron at once/day; bump the schedule if the project is on Pro).
   Optionally set `CRON_SECRET` — Vercel automatically sends it as
   `Authorization: Bearer <value>` on cron-triggered requests.
4. **AUTH_SECRET**: same value/generation as local dev, just set in Vercel's
   environment variables instead of `.env`.
5. **Migrating existing uploads**: the files currently on the Laravel app's
   `storage/app/public/*` aren't in Blob storage yet — that's a one-time
   migration (upload each file to Blob, update the corresponding DB row to
   the new URL) still to be done before fully cutting over.

Required environment variables: `DATABASE_URL`, `AUTH_SECRET`,
`BLOB_READ_WRITE_TOKEN`, `UPLOADS_DIR` (only needed while pre-Blob rows still
exist), `CRON_SECRET` (optional).
