# Design.md — UI/UX Design Guidelines

## 1. Design Principles

1. **Resume-adjacent, not social-media-like.** This sits next to a resume — clean, professional, credible. Avoid anything that feels like a social feed (likes, avatars-everywhere, casual copy).
2. **Trust first.** Every certificate should visually communicate: what it is, who issued it, when, and how to verify it.
3. **Fast and legible on mobile.** Most recruiters will open the link on a phone from an email or LinkedIn.
4. **Minimal friction to publish.** Every dashboard screen should nudge the user toward "add a certificate" and "share your link."

## 2. Visual Identity (starting point — adjust to taste)

| Element | Choice |
|---|---|
| Primary color | Emerald green (`#059669` / `#047857`) — growth, verification, trust |
| Accent color | Warm amber/gold (`#F59E0B`-ish) — used sparingly for "featured" or verified badges |
| Neutral palette | Slate grays for text/background (`#0F172A` text, `#F8FAFC` background) |
| Typography | A clean geometric sans for headings (e.g. Inter, Sora), same or a readable sans for body (Inter) |
| Corner radius | Medium (8–12px) — modern but not playful |
| Shadows | Subtle, only on hover/cards — avoid heavy skeuomorphism |

## 3. Core Pages

### 3.1 Landing Page (marketing)
- Hero: one-line value prop + "Create your free page" CTA
- Example public profile preview (mock data)
- 3-step "how it works": Add certificates → Get your link → Share it
- Social proof / example use cases (student, professional, freelancer)

### 3.2 Sign Up / Log In
- Minimal form: email, password (+ Google OAuth button)
- Username selection immediately after signup (shows live preview of `certlink.app/username`)

### 3.3 Dashboard (owner, authenticated)
- Left/top nav: Profile, Certificates, Settings
- Certificates list: card/table view, drag handle to reorder, "Featured" star toggle, edit/delete
- "Add Certificate" — modal or dedicated page with form:
  - Title, Issuer, Issue date, Expiry date (optional), Credential URL (optional)
  - Upload image/PDF (drag-and-drop + file picker)
  - Category/tag select
- Prominent "Copy my link" + QR code button, always visible (e.g. sticky top bar)
- Visibility toggle (public/unlisted/private) clearly labeled with explanation of each

### 3.4 Public Profile Page (`/[username]`)
- Header: avatar, name, headline, short bio
- Primary CTA area: none needed — this page is the destination, not a funnel
- Featured certificates section (larger cards) if any are pinned
- Full certificate grid/list below, filterable by category
- Each certificate card shows: title, issuer + issuer logo/initial, date, "Verify" link (if provided), thumbnail of certificate/badge image
- Footer: subtle "Made with CertLink" (brand loop) + link to create your own

### 3.5 Empty States
- Dashboard with 0 certificates: friendly illustration + "Add your first certificate" CTA, maybe example categories to spark ideas
- Public page with 0 certificates: should not be shareable/public yet — nudge owner to add at least one before publishing

## 4. Certificate Card Anatomy

```
┌─────────────────────────────┐
│ [thumbnail image]           │
│                              │
│ AWS Certified Cloud          │  ← title
│ Practitioner                 │
│ Amazon Web Services          │  ← issuer
│ Issued Jan 2025               │  ← date
│ [Verify credential →]        │  ← link, if present
└─────────────────────────────┘
```

## 5. Responsive Behavior

- Certificate grid: 3–4 columns desktop → 2 columns tablet → 1 column mobile
- Dashboard nav collapses to a bottom bar or hamburger on mobile
- QR code and copy-link remain reachable within one tap/scroll on mobile

## 6. Accessibility

- Minimum contrast ratio 4.5:1 for body text
- All images (certificate thumbnails, avatars) require alt text (auto-suggest from title/issuer if user doesn't provide one)
- Full keyboard navigation for dashboard (add/edit/reorder/delete)
- Reorder functionality must have a non-drag fallback (e.g. up/down buttons) for accessibility

## 7. Tone of Voice (UI copy)

- Clear and encouraging, never gimmicky. Examples:
  - Good: "Add your first certificate to get started."
  - Avoid: "Let's gooo! 🎉 Time to flex your skills!"
- Error messages should be specific and actionable ("That file is too large — please upload under 5MB" not "Something went wrong").
