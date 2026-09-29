# Central Calendar

Central Calendar production source code and deployment documentation.

## Stack

- Node.js 24
- pnpm 10
- TypeScript
- React / Vite
- Express 5
- PostgreSQL
- Drizzle ORM

## Install

pnpm install

## Build

pnpm build

## Start

node --enable-source-maps artifacts/api-server/dist/index.mjs

## Environment

See .env.example. Do not commit production secrets.

## Database

Restore the supplied production PostgreSQL dump into the target PostgreSQL database and configure DATABASE_URL.

## External services

No third-party API integrations are required.

## Scheduled jobs

No external cron jobs are required.
