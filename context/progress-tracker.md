# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

Feature 01 — Design System

## Current Goal

Install shadcn/ui, add UI primitives, create cn() utility, wire dark theme.

## Completed

- Feature 01: Design System — shadcn/ui 4.5.0 installed, components (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea) added, lucide-react 1.14.0 installed, lib/utils.ts cn() helper created, globals.css dark-only theme (project tokens + shadcn dark vars in :root, no .dark switching).

## In Progress

## Next Up

## Open Questions

- None yet.

## Architecture Decisions

- shadcn/ui over Tailwind v4 (CSS-based token config via @theme inline in globals.css, no tailwind.config.js).
- Dark-only theme: all shadcn :root variables set to dark values directly — no .dark class switching.
- Do not modify generated components/ui/* files after shadcn installation.
- Next.js 16 uses proxy.ts (not middleware.ts) — same API, renamed to reflect its purpose.

## Session Notes

- Using Next.js 16.2.4 with React 19 and Tailwind CSS v4.
- Using Bun
- shadcn version 4.5.0 was used; it auto-detected Tailwind v4.
- lucide-react ^1.11.0 installed as a direct dependency.
- Custom authentication to be implemented without 3rd party services.
- @liveblocks/node installed alongside existing @liveblocks/client, @liveblocks/react, @liveblocks/react-flow, @liveblocks/react-ui. Liveblocks client uses lazy init (getLiveblocks()) to avoid key validation errors at build time.
- @vercel/blob ^2.3.3 installed. BLOB_READ_WRITE_TOKEN set in .env.local.
- @trigger.dev/sdk ^4.4.4 installed. trigger.config.ts reads project ref from TRIGGER_PROJECT_REF env var. TRIGGER_SECRET_KEY must be set in .env.local for triggering tasks from server code. Run `npx trigger.dev@latest dev` for local development; deploy with `npx trigger.dev@latest deploy`.
- Prisma 7.8.0 — generated client goes to app/generated/prisma/; import PrismaClient from @/app/generated/prisma/client (no index.ts in v7). Constructor always requires { adapter } argument. @prisma/adapter-pg used for all connections.
- prisma.config.ts uses schema: "prisma/" (multi-file schema) and reads DATABASE_URL from .env via dotenv.