# Ever After — Save the Date

A vintage botanical save-the-date website with a simple open RSVP: guests reply "Can't wait to celebrate!" or "Celebrating from afar" with their name, email and party size, and the couple sees every reply (with headcounts and CSV export) in a private admin dashboard styled to match.

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

The default `DEMO_MODE=true` runs entirely in memory with sample replies. Visit `/` for the guest page and `/admin` for the demo dashboard. Never enable demo mode in production.

## Editing the wedding details

All names, dates, venue text and the "details" card content live in `lib/content.ts` — edit that one file and redeploy.

## Production setup

1. Create a Supabase project and run `supabase/migrations/0001_initial.sql`.
2. Copy the project URL, anon key, and service-role key into your host's environment variables.
3. Set `DEMO_MODE=false` and configure `ADMIN_EMAILS` (comma-separated admin sign-in addresses).
4. Configure Resend credentials (`RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_ALERT_EMAIL`) for reply confirmation emails, and set `NEXT_PUBLIC_SITE_URL`.

### Deploying to Netlify

Connect this repository in the Netlify UI — `netlify.toml` handles the build (the Next.js runtime is applied automatically). Add the environment variables from `.env.example` in Site settings → Environment variables. Demo mode does not persist replies on serverless hosts, so run with `DEMO_MODE=false` and Supabase configured.

### Deploying to Render

Deploy using `render.yaml` (standalone Node server).

Guests replying again with the same email update their existing reply. Admin sign-in uses Supabase magic links restricted to `ADMIN_EMAILS`.
