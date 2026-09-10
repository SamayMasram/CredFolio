# PRD.md — Product Requirement Details

**Project (working title):** CertLink
**One-liner:** A single shareable link where anyone can showcase their certificates, badges, and credentials — built to sit alongside (or replace) the "Certifications" section of a resume.

---

## 1. Problem Statement

Job seekers and lifelong learners collect certificates and badges from many disconnected platforms (Coursera, Udemy, LinkedIn Learning, Google, AWS, Credly, HackerRank, university LMSs, etc.). There is no easy way to:

- Display all of them together, in one visual, credible place
- Share them via a single link on a resume, LinkedIn, or email signature
- Let a recruiter verify a credential quickly without downloading PDFs

CertLink solves this by giving each user a public profile page (`certlink.app/username`) listing their verified certificates/badges, which can be linked from a resume as `certlink.app/username`.

## 2. Goals & Objectives

- Let a user create an account and build a public credential page in under 5 minutes
- Make the page look credible, clean, and resume-appropriate (not a "social profile")
- Support both manual entry and (later) auto-import from common providers
- Give one clean, permanent, brandable URL per user
- Make it easy for recruiters/viewers to trust and verify what they see

## 3. Target Users

| User | Need |
|---|---|
| Students / new grads | Show course certificates (Coursera, Udemy) they can't fit on a 1-page resume |
| Working professionals | Show ongoing upskilling (AWS, PMP, Scrum, etc.) |
| Freelancers | Build public credibility page to share with clients |
| Recruiters / hiring managers (viewers only, no login) | Quickly scan and verify a candidate's credentials |

## 4. Core Features — MVP

1. **Auth** — sign up / log in (email+password, optionally Google OAuth)
2. **Profile setup** — name, headline, avatar, short bio, chosen username → link (`certlink.app/username`)
3. **Add certificate/badge (manual)**
   - Title, issuing organization, issue date, expiry date (optional)
   - Credential URL / verification link (optional)
   - Certificate image or PDF upload, or badge image
   - Category/tag (e.g. "Cloud", "Data", "Design")
4. **Reorder / feature** certain certificates (drag to reorder, pin "featured")
5. **Public profile page**
   - Clean grid/list of certificates and badges
   - Click-through to verification link
   - Downloadable/printable summary (optional MVP+)
6. **Single link sharing**
   - Copy link button
   - QR code generation for the link (nice for printed resumes/business cards)
7. **Privacy control** — public / unlisted / private (link-only) profile
8. **Basic dashboard** — list of added certificates, edit/delete

## 5. Future Features (Post-MVP)

- Auto-import via provider integrations (Credly API, LinkedIn export parsing, Coursera)
- Custom domain / subdomain support (e.g. `certs.yourname.com`)
- Themes / color customization of public page
- Verified badge (CertLink verifies issuer domain or checks credential URL is live)
- Analytics: link views, click-throughs, top viewed certs (for the owner only)
- Resume-embeddable widget/badge (small "View my Certificates" badge for LinkedIn/email signature)
- PDF export of the certificate page (styled like a "credentials sheet")
- Team/Org accounts (bootcamps, universities issuing to many users)
- SEO-optimized public pages (indexable, good for personal branding)

## 6. User Stories

- As a user, I want to sign up and pick a username so I get my personal link immediately.
- As a user, I want to add a certificate with an image and a verification link so viewers can trust it.
- As a user, I want to reorder my certificates so my most relevant ones show first.
- As a user, I want to make my profile private/unlisted until I'm ready to share it.
- As a recruiter, I want to open a link and see certificates clearly, without needing an account.
- As a user, I want a QR code for my link so I can put it on a printed resume.

## 7. Success Metrics

- Time to first published profile (target: < 5 min from signup)
- % of signed-up users who publish at least 1 certificate
- % of profiles that are shared (link copied / QR generated)
- Public page load time (< 1.5s)
- Weekly active viewers per public profile (proxy for "resume traffic")

## 8. Non-Functional Requirements

- Public profile pages must load fast and work well on mobile (recruiters often view on phone)
- Uploaded files (images/PDFs) must be safely stored and served via CDN
- Data privacy: users control visibility of their own page; no personal data shown beyond what user chooses
- Accessible (WCAG AA) public pages
- Should degrade gracefully with no JS for public profile (SEO + fast preview)

## 9. Out of Scope (for now)

- Full resume builder (this is a credentials showcase, not a resume editor)
- Payment/certification issuing (CertLink displays credentials, doesn't issue them)
- Social network features (comments, likes, follows)

## 10. Open Assumptions (flag if wrong)

- Working name "CertLink" — placeholder, can be renamed
- MVP targets individual users only, not organizations
- Manual entry is fine for MVP; integrations come later
