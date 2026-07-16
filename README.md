# H-SETS — Marketing Website

The public-facing marketing website for **H-SETS**, a Nigerian digital ecosystem
platform (corporate services, AI solutions, and the H-SETS Academy). This is **Phase 1**
of the platform described in `docs/H-SETS Enterprise PRD_v2.md` — the conversion
front-end. Page content is realistic mock data; the **contact, consultation, newsletter,
and resource forms are fully wired** to Next.js API routes that persist submissions to
PostgreSQL and send email notifications.

## Tech stack

- **Next.js 16** (App Router) + **TypeScript** (strict)
- **Tailwind CSS v4** (CSS-based tokens in `src/app/globals.css`)
- **shadcn/ui-style** components (hand-built on Radix primitives) in `src/components/ui`
- **Motion** (Framer Motion) for scroll reveals, page transitions and micro-interactions
- **react-hook-form + zod** for form validation, **sonner** for toasts
- **Node.js API routes** + **PostgreSQL** (`pg`) + **nodemailer** for form handling

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in DATABASE_URL (and SMTP_* if sending mail)
npm run dev                  # http://localhost:3000
npm run build                # production build
```

### Database

Form submissions are stored in a single `leads` table (see `schema.sql`). The app
**creates the table automatically** on first submit, so you only need a database and a
connection string:

```bash
sudo -u postgres psql -c "CREATE ROLE hsets LOGIN PASSWORD 'your-password';"
sudo -u postgres psql -c "CREATE DATABASE hsets OWNER hsets;"
# then set DATABASE_URL=postgres://hsets:your-password@127.0.0.1:5432/hsets in .env.local
```

For a hosted database (Neon, Supabase, RDS) set `DATABASE_SSL=true`.

### Email

If `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` are set, new submissions send an internal
notification (to `MAIL_TO`) plus a confirmation to the user. **If they are unset the app
runs in log-only mode** — emails are printed to the server console — so forms work with
no SMTP setup.

## Structure

```
src/
  app/                 # routes (home, services, academy, insights, etc.) + sitemap/robots
  components/
    ui/                # base primitives (button, card, dialog, accordion, …)
    common/            # Reveal, Section, PageHero, CtaStrip, FAQ, AnimatedCounter
    layout/            # Header (mega-menu), Footer
    sections/          # homepage + page sections (hero, testimonials, job board, …)
    cards/             # reusable card components
    forms/             # contact, consultation, newsletter, resource-gate (live submit)
  app/api/             # POST route handlers: contact, consultation, newsletter, resource
  data/                # typed mock content (services, programmes, insights, …)
  lib/                 # db (pg), email (nodemailer), schemas (zod), api-handler, seo, utils
```

## Design system

Brand tokens live in `:root` in `src/app/globals.css` — a deep navy/indigo base with an
electric cyan→violet gradient accent. Retune the whole site by editing those values.
All animations respect `prefers-reduced-motion`.

## Backend

Each form POSTs JSON to its API route (`src/app/api/*/route.ts`). A shared handler
(`src/lib/api-handler.ts`) validates the body with the same zod schema the client uses
(`src/lib/schemas.ts`), returning `422` with field errors on invalid input. Valid
submissions are inserted into the `leads` table (`src/lib/db.ts`) and trigger email
notifications (`src/lib/email.ts`).

The remaining page content still comes from the typed mock layer in `src/data/*`, ready
to swap for a CMS/Supabase later.

Out of scope for Phase 1: auth, payments, LMS/portals, certificates, CRM, live AI
features, admin dashboard. See the PRD for the full roadmap.
