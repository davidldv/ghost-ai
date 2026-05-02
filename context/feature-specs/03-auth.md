# Authentication Spec

## Overview
Implement custom, self-hosted authentication (excluding third-party auth services like Clerk or Auth0) supporting Email (Magic Links), Google, and GitHub.

## Sign-in and sign-up pages:
- **large screens**: simple two-panel layout
- **left**: compact logo, tagline, short text-only feature list
- **right**: centered Clerk form
- **small screens**: form only
- no gradients
- no oversized hero sections
- no feature cards
- no scroll-heavy layouts
- Keep the layout minimal and professional.

## Stack
- **Auth Library**: NextAuth.js (Auth.js).
- **Database**: PostgreSQL via Prisma.
- **Session Strategy**: HTTP-only cookies (database-backed or JWT).

## Database Schema (Prisma)
Update prisma/schema.prisma to include:
- **User**: id, name, email, emailVerified, image.
- **Account**: provider, providerAccountId, access_token, etc.
- **Session**: sessionToken, userId, expires.
- **VerificationToken**: identifier, token, expires (for Email magic links).

## Providers
1. **GitHub OAuth**: Configure using GitHub Developer Settings (Client ID & Secret).
2. **Google OAuth**: Configure via Google Cloud Console (Client ID & Secret).
3. **Email (Magic Link)**: Use a lightweight SMTP mailer (e.g., Nodemailer) to send stateless magic links.

## Security & Route Protection
- Use Next.js Middleware (proxy.ts) to protect private routes (e.g., /project/*, /canvas/*).
- Ensure API routes validate the custom session before mutating the database.

## UI Components
- Update /:
- authenticated users redirect to /editor
- unauthenticated users redirect to /sign-in
- Buttons for 'Continue with Google' and 'Continue with GitHub'.
- Form for 'Sign in with Email'.
- Follow the dark theme UI context standards.

## Check When Done
- proxy.ts exists at the root
- all routes are protected except public auth paths
- auth pages use CSS variables with no hardcoded colors
- npm run build passes
