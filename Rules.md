# Rules.md — Project & Development Rules

These rules apply to anyone (human or AI assistant) working on this codebase. If you're an AI coding assistant, treat this file as binding constraints, alongside `Memory.md` for current project state.

## 1. General Principles

- Ship the MVP defined in `Prd.md` before adding anything from "Future Features."
- Prefer boring, well-supported tech over novel tech, unless there's a clear reason.
- Every feature must map to a user story in `Prd.md`. If it doesn't, flag it before building.
- Public profile pages are the most important surface in the product — never regress their load speed, accessibility, or mobile layout.

## 2. Folder Structure (Next.js convention)

```
/app                  → routes (App Router)
  /(dashboard)         → authenticated owner dashboard routes
  /[username]          → public profile route
  /api                 → API route handlers
/components           → shared UI components
/lib                  → db client, auth helpers, utils
/types                → shared TypeScript types
/styles               → global styles/tailwind config
/public               → static assets
```

## 3. Naming Conventions

- Files: `kebab-case.tsx` for components, `camelCase.ts` for utils
- React components: `PascalCase`
- DB tables/columns: `snake_case`
- API routes: plural nouns (`/api/certificates`, not `/api/certificate`)
- Env vars: `SCREAMING_SNAKE_CASE`, always documented in `.env.example`

## 4. Git & Commit Rules

- Branch naming: `feature/<short-name>`, `fix/<short-name>`, `chore/<short-name>`
- Commit messages: Conventional Commits style — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- No direct commits to `main`; all changes via PR
- PR description must state: what changed, why, and which `Phases.md` item it belongs to

## 5. Code Style

- TypeScript strict mode on; no `any` unless justified with a comment
- Format with Prettier, lint with ESLint (run before every commit)
- Co-locate small component-specific styles/logic; keep shared logic in `/lib`
- Prefer server components / SSR for public profile pages (SEO + speed); use client components only where interactivity is required (drag-reorder, forms)

## 6. Security Rules

- Never trust client input — validate all API input server-side (e.g. with Zod)
- Enforce Row Level Security (RLS) in Postgres so a user can only mutate their own rows
- Sanitize any user-provided text before rendering (avoid XSS on public pages)
- File uploads: restrict type + size, store in private bucket with signed URLs unless explicitly public
- Never log secrets, tokens, or full file contents
- Rate-limit public profile view endpoint and auth endpoints

## 7. Privacy Rules

- Respect `visibility` setting strictly: `private` profiles must return 404 to non-owners, not just be hidden in UI
- Don't index `unlisted` profiles in sitemap/search
- Don't expose email addresses or auth identifiers on public pages

## 8. Testing Requirements

- Unit tests for: auth guards, visibility logic, certificate CRUD validation
- At least one end-to-end test for the core flow: sign up → add certificate → view public page
- No PR merges with failing tests or lint errors

## 9. Design/UX Rules

- Public profile page must be usable and readable with JS disabled where feasible (SSR content, not client-only rendering)
- Every interactive element must have a visible focus state (keyboard accessible)
- Mobile-first: design and test dashboard and public page at 375px width first

## 10. Rules for AI Assistants Working on This Project

- Before building a feature, check `Phases.md` to confirm it belongs to the current phase.
- After completing meaningful work, update `Memory.md` with what changed and why (see its template).
- Don't invent new database columns/tables without updating `Architecture.md` to match.
- If a request conflicts with a rule here, flag the conflict instead of silently overriding it.
- Ask before introducing a new major dependency (e.g. a new auth provider, a new DB).
