# Central Calendar

## Overview

**Central Calendar** is a regional coordination intelligence platform for Central Asia and the Caucasus. The tagline is "Plan the region." — a strategic event coordination hub for government ministries, corporations, and institutional stakeholders.

Public site features: homepage with admin-editable banner, country pages, calendar, online events page, articles section, public event submission (queued for editorial review), and a hidden admin panel.

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/central-calendar)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Session auth**: express-session (admin panel)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Architecture

### Frontend (artifacts/central-calendar)
- React + Vite app
- Public pages: `/` (Home), `/uzbekistan`, `/kazakhstan`, `/kyrgyzstan`, `/turkmenistan`, `/caucasus`, `/cross-border`, `/calendar`, `/online`, `/articles`, `/articles/:slug`, `/submit-event`, `/event/:slug`, `/about`
- `/caspian-region` redirects to `/caucasus` for backward compatibility
- Admin panel: `/control-room-7f92x/*` (hidden from nav, protected by session auth) — events dashboard, new event, pending submissions, archive, articles CRUD, site settings
- Inline SVG `Logo` component (`src/components/Logo.tsx`) using `currentColor` with `tone` prop ("light" | "dark" | "auto"); horizontal viewBox is 0 0 560 100 to fit "CENTRAL CALENDAR" without clipping
- Theme system: `ThemeProvider` + `ThemeToggle` (light / dark / system, localStorage key `cc-theme`); pre-paint inline bootstrap script in `index.html` resolves theme before first render (no FOUC)
- Tag rendering helper `splitTagName()` in `src/lib/utils.ts` splits compound names on `&`, `,`, `/`, ` and `, ` и ` for UI-only `#hashtag` display — DB tag relations are unchanged
- Image performance: hero + cover images use explicit `width`/`height`, `loading="eager"` + `fetchPriority="high"` for first/above-the-fold, `loading="lazy"` for below-the-fold to reduce CLS and LCP
- Mobile drawer: keyboard-accessible (Esc to close, `aria-expanded`, `aria-controls`, `role="dialog"`)

### Backend (artifacts/api-server)
- Express 5 API at `/api`
- Session-based admin auth with brute force protection (5 attempts per 10 min)
- Public routes: `/events` (with `format` filter), `/countries`, `/tags`, `/search`, `/articles`, `/articles/:slug`, `/site-settings`, `/submit-event` (rate-limited)
- Admin routes: `/admin/events` (incl. publish/archive/reject), `/admin/articles` CRUD, `/admin/site-settings`
- In production also serves the built SPA (`artifacts/central-calendar/dist/public`). Cache policy: HTML never cached (`no-cache, no-store`), hashed `/assets/*` and other long-lived static files cached `public, max-age=31536000, immutable`

### Database Schema (lib/db/src/schema/)
- `countries` — 6 records (Uzbekistan, Kazakhstan, Kyrgyzstan, Turkmenistan, Caucasus, Cross-border)
- `tags` — 12 atomic tags
- `events` — status enum: draft / published / archived / pending_review / rejected; columns include `event_format` (offline/online/hybrid) and `contact_email` (internal)
- `articles` — id, slug, title, content, cover_image, country_id, author, status, published_at
- `event_tags`, `article_tags` — many-to-many pivots
- `site_settings` — single row holding `homepage_banner_url`
- `admin_logs` — audit log for admin actions

## Admin Panel Security
- Route: `/control-room-7f92x` (not linked from any navigation)
- Admin credentials set via environment variables: `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- Session-based auth with httpOnly cookies
- Brute force protection: max 5 login attempts per 10 minutes
- All admin API routes protected with `requireAdmin` middleware
- Admin actions logged to `admin_logs` table

## Environment Variables
- `SESSION_SECRET` — session signing secret (set)
- `ADMIN_EMAIL` — admin login email (default: admin@centralcalendar.org)
- `ADMIN_PASSWORD` — admin login password (default: CentralCalendar2024!)
- `DATABASE_URL` — PostgreSQL connection string (provisioned)

## Seed Data
- 10 demo events seeded across all countries and sectors
- All seeded events have status=published and realistic content

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
