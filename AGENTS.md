# HikeSafe Project Instructions

## Scope
- These instructions apply to the repository unless a deeper `AGENTS.md` overrides them.
- Preserve unrelated working-tree changes and keep edits limited to the requested scope.

## Project context
- HikeSafe is a Next.js App Router application using TypeScript, PostgreSQL, Drizzle ORM, and LINE Login/Messaging API.
- The product records explicit hiking-trip check-ins and reminders; it is not navigation, background tracking, rescue dispatch, or emergency response.
- Preserve safety semantics: never infer a rescue need from a missing update, and never bypass LINE token verification or viewer authorization.

## Implementation rules
- Use Node 24.x and npm; keep `package-lock.json` consistent with dependency changes.
- Keep secrets in local environment files only. Never commit `.env.local`, credentials, tokens, or private database URLs.
- Treat existing Drizzle migration files as immutable; add a new migration for schema changes.
- Match the existing TypeScript and feature-module style. Avoid unrelated refactors or speculative abstractions.
- Preserve idempotency, retry, cancellation, retention, and authorization behavior when changing trip or alert flows.

## Verification
- Run `npm test` for logic or API changes.
- Run `npm run build` for application, route, or configuration changes.
- Run `npm run routes:verify` when changing route catalog data or import logic.
- Run `npm run db:migrate` only with an explicitly configured PostgreSQL database.
- Report any verification command that could not run and why.
