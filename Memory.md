# Memory.md — Project Memory Log

Purpose: a living record of decisions, current state, and open questions, so that anyone (or any AI assistant) picking up this project later has continuity without re-reading the whole conversation history. Update this file after any meaningful decision or milestone.

---

## How to Use This File

- Add a new dated entry under **Decision Log** whenever a real decision is made (tech choice, scope change, naming, design change).
- Keep **Current Status** up to date — it should always reflect "what's true right now," not history.
- Move resolved items out of **Open Questions** and into the Decision Log.
- Don't delete old entries — this is a log, not a summary. Old entries give context for *why* something is the way it is.

---

## Current Status

- **Stage:** Phase 1 MVP Complete ✅ (Auth, Dashboard CRUD, Public Showcase, QR Sharing, Chartreuse Theme)
- **Product name:** "CredFolio"
- **Stack decided:** Next.js + TypeScript + Tailwind CSS + Firebase (Auth / Cloud Firestore / Cloud Storage / Firebase Admin SDK)
- **Repo:** local project root (`e:\CertiLink`)
- **Live environments:** Local Dev Server running at `http://localhost:3000`

## Decision Log

### 2026-09-05 — Phase 1 MVP Completion
- Implemented full Firebase Authentication integration (Signup with real-time username availability check, Login with email/password, and Google OAuth).
- Built owner Dashboard (`/dashboard`) with Certificate CRUD, reordering, visibility controls (`public`, `unlisted`, `private`), and QR Code modal generation.
- Created Public Profile showcase (`/[username]`) and interactive Demo route (`/demo`).
- Applied Chartreuse `#7FFF00` theme across all pages and components.

### 2026-09-05 — Firebase Backend Adoption
- Switched backend and database provider from Supabase to **Firebase**.
- Stack updated to use Firebase Authentication, Cloud Firestore for document storage, Firebase Storage for assets (certificate files & avatars), and `firebase-admin` SDK for Next.js SSR/Server Actions.
- Updated `Architecture.md` to define Firestore collections (`profiles`, `usernames`, `certificates`) and security rules.

### 2026-09-05 — Initial project scoping
- Defined product as a single-link public showcase for certificates/badges, meant to be linked from a resume.
- Chose to scope MVP to individual users only (no org/team accounts in MVP).
- Chose to defer provider integrations (Credly, LinkedIn) to Phase 4 — MVP uses manual entry only.
- Created initial doc set: `Prd.md`, `Architecture.md`, `Rules.md`, `Phases.md`, `Design.md`, `Memory.md`.

---

## Open Questions

- [ ] Final product name and domain?
- [ ] Should public profile URLs be `certlink.app/username` or `certlink.app/u/username` (namespace collision risk with marketing pages like `/pricing`, `/about`)?
- [ ] Do we need multi-language support from day one, or English-only for MVP?
- [ ] Any existing brand guidelines/colors to follow, or is `Design.md`'s starting palette fully open?

## Template for New Entries

```
### YYYY-MM-DD — <short title>
- What changed / was decided
- Why
- Any doc files updated as a result (Prd.md / Architecture.md / Rules.md / Phases.md / Design.md)
```
