# Central Calendar

## Overview

**Central Calendar** is a regional coordination intelligence platform for Central Asia and the Caspian region. The tagline is "PLAN THE REGION." — a strategic event coordination hub for government ministries, corporations, and institutional stakeholders.

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
- React + Vite app at route `/`
- Pages: Homepage, Country pages (/uzbekistan, /kazakhstan, /kyrgyzstan, /turkmenistan, /caspian-region, /cross-border), Calendar (/calendar), Event detail (/event/:slug), About (/about)
- Admin panel: `/control-room-7f92x/*` (hidden from nav, protected by session auth)

### Backend (artifacts/api-server)
- Express 5 API at `/api`
- Session-based admin auth with brute force protection (5 attempts per 10 min)
- Routes: /events, /countries, /tags, /search, /admin/*

### Database Schema (lib/db/src/schema/)
- `countries` — 6 records (Uzbekistan, Kazakhstan, Kyrgyzstan, Turkmenistan, Caspian Region, Cross-border)
- `tags` — 8 records (Investment, Energy, Economy & Finance, Technology, Sustainability, Marketing & Media, Retail, Heavy Industry)
- `events` — main events table with status (published/draft/archived), featured flag
- `event_tags` — many-to-many pivot
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
