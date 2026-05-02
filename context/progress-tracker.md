# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

Feature 03 — Authentication

## Current Goal

Complete (pending OAuth credentials from user).

## Completed

- Feature 01: Design System — shadcn/ui 4.5.0 installed, components (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea) added, lucide-react 1.14.0 installed, lib/utils.ts cn() helper created, globals.css dark-only theme (project tokens + shadcn dark vars in :root, no .dark switching).
- Feature 02: Editor Chrome — EditorNavbar (fixed top bar, sidebar toggle with PanelLeftOpen/PanelLeftClose, dark bg + bottom border) and ProjectSidebar (fixed overlay, slides in from left, isOpen/onClose props, Tabs for My Projects + Shared with empty states, New Project button) created in components/editor/.
- Feature 03: Authentication — NextAuth v5 (beta) + @auth/prisma-adapter, DB-backed sessions, GitHub + Google providers wired. Prisma 7.8.0 schema (User/Account/Session/VerificationToken) migrated to Supabase Postgres via @prisma/adapter-pg. lib/prisma.ts singleton, lib/auth.ts NextAuth config exporting handlers/auth/signIn/signOut, app/api/auth/[...nextauth]/route.ts handler. proxy.ts at root protects /project/*, /canvas/*, /editor/* — redirects unauth'd to /sign-in?callbackUrl=. /sign-in and /sign-up pages built with components/auth/AuthShell (two-panel large screens, form-only small) + AuthForm (Google + GitHub OAuth buttons, email form stub for future magic link). Root / redirects authed→/editor, unauthed→/sign-in. Email/magic-link provider deferred (no SMTP yet — form will fail silently until provider added). npm run build passes.

## In Progress

## Next Up

- User: create GitHub OAuth app + Google OAuth client; set AUTH_GITHUB_ID/SECRET, AUTH_GOOGLE_ID/SECRET in .env.
- Add SMTP/Email provider when ready (Resend/Nodemailer) — then wire `Email` provider in lib/auth.ts.
- Build /editor route (currently 404 after sign-in).

## Open Questions

- SMTP provider for magic links (Resend? Postmark? raw SMTP?) — deferred per user.

## Architecture Decisions

- shadcn/ui over Tailwind v4 (CSS-based token config via @theme inline in globals.css, no tailwind.config.js).
- Dark-only theme: all shadcn :root variables set to dark values directly — no .dark class switching.
- Do not modify generated components/ui/* files after shadcn installation.
- Next.js 16 uses proxy.ts (not middleware.ts) — same API, renamed to reflect its purpose.
- Auth: NextAuth.js v5 (beta) self-hosted, DB session strategy (PrismaAdapter), no Clerk/Auth0.
- Proxy uses `auth(...)` higher-order export from `@/lib/auth` to attach req.auth; protected path list maintained in proxy.ts.

## Session Notes

- Using Next.js 16.2.4 with React 19 and Tailwind CSS v4.
- Using Bun.
- shadcn version 4.5.0 was used; it auto-detected Tailwind v4.
- lucide-react ^1.11.0 installed as a direct dependency.
- Custom authentication implemented with NextAuth v5 (no 3rd-party services like Clerk/Auth0).
- Prisma 7.8.0 — generated client goes to app/generated/prisma/; import `PrismaClient` from `@/app/generated/prisma/client`. Constructor requires `{ adapter }`. @prisma/adapter-pg used for Postgres/Supabase connections.
- prisma.config.ts holds the datasource URL (Prisma 7 removed `url` from schema); loads .env via `dotenv/config`.
- Generated Prisma client uses ESM (`moduleFormat = "esm"`); `previewFeatures` removed in 7.8 (queryCompiler/driverAdapters are stable).
- AUTH_SECRET generated locally (32-byte base64) and set in .env. AUTH_URL set to `http://localhost:3000`.
- OAuth credentials are placeholders — user must fill in.
