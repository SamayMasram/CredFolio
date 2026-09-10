# Phases.md — Development Roadmap

## Phase 0 — Setup & Planning ✅
- [x] Define PRD, Architecture, Rules, Design, Memory docs
- [x] Set up repo, CI (lint/test on PR), environments (local/staging/prod)
- [x] Set up Firebase project (Auth, Firestore, Storage) + Next.js scaffold
- [x] Decide final product name & domain

## Phase 1 — MVP: Core Showcase ✅
Goal: a user can sign up, add certificates, and share one working public link.

- [x] Auth: sign up / log in / log out (email+password)
- [x] Username selection + profile creation (name, headline, bio, avatar)
- [x] Add certificate/badge (title, issuer, date, credential URL, image/PDF upload)
- [x] Edit/delete certificate
- [x] Manual reorder of certificates
- [x] Public profile page at `/[username]` (SSR, respects visibility)
- [x] Visibility toggle: public / unlisted / private
- [x] Copy-link button + QR code generation
- [x] Basic responsive styling (mobile + desktop)

**Exit criteria:** A real user can go from signup to a shareable link with at least one certificate, in under 5 minutes, on both desktop and mobile.

## Phase 2 — Polish & Trust Features
Goal: make the page look credible and pleasant enough to put on an actual resume.

- [ ] Featured/pinned certificates
- [ ] Categories/tags + filtering on public page
- [ ] Improved empty states, loading states, error states
- [ ] Basic profile themes (1–3 layout/color options)
- [ ] Accessibility pass (WCAG AA)
- [ ] SEO basics: meta tags, Open Graph image per profile (auto-generated)
- [ ] Google OAuth login

**Exit criteria:** Public pages look professional enough to confidently share with a recruiter; pass a basic accessibility and Lighthouse audit.

## Phase 3 — Growth Features
Goal: give users reasons to come back and share more widely.

- [ ] Profile view analytics (owner-only): total views, referrers
- [ ] "View my certificates" embeddable badge/widget for LinkedIn/email signature
- [ ] PDF export of the certificate page
- [ ] Verified badge (basic issuer/URL validation)
- [ ] Sitemap + indexing for public profiles (opt-in)

**Exit criteria:** Users have a reason to return to the dashboard beyond initial setup (they can see engagement).

## Phase 4 — Integrations & Scale
Goal: reduce manual entry friction and support power users/organizations.

- [ ] Credly API integration (auto-import badges)
- [ ] LinkedIn certifications import/parsing
- [ ] Custom domain / subdomain support
- [ ] Team/organization accounts (e.g. bootcamps issuing to cohorts)
- [ ] Performance/scale pass: caching, CDN, read replicas as needed

## Phase 5 — Monetization (if pursued)
- [ ] Free vs Pro tier definition (e.g. custom domain, themes, analytics = Pro)
- [ ] Billing integration (Stripe)
- [ ] Usage limits enforcement (e.g. max certificates on free tier)

---

### How to use this file
- Work top-to-bottom; don't start a later phase's items until the current phase's exit criteria are met, unless explicitly agreed otherwise.
- When a phase completes, log it in `Memory.md` with the date and any deviations from plan.
