# Architecture.md — System Architecture

## 1. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (React) + TypeScript | SSR/SSG for fast, SEO-friendly public profile pages |
| Styling | Tailwind CSS | Fast, consistent, easy theming later |
| Backend | Next.js API routes / Server Actions + Firebase Admin SDK | Unified deployment, server-side data validation |
| Database | Cloud Firestore | Flexible NoSQL document database, real-time listeners, simple collection structure |
| Auth | Firebase Authentication (Email/Password + Google OAuth) | Fast, secure, client & admin SDK support |
| File storage | Firebase Cloud Storage | Upload and serve certificate images/PDFs and avatars |
| Hosting | Vercel (or Firebase App Hosting) | Continuous deployment and serverless edge delivery |
| QR code | `qrcode` npm package | Client-side/server-side QR generation, lightweight |
| Email | Firebase Auth default / Resend | Account verification, password reset |

> Architecture confirmed to use Firebase (Auth, Firestore, Cloud Storage).

## 2. High-Level Architecture

```
                        ┌─────────────────────┐
                        │      Browser         │
                        │ (Owner dashboard /    │
                        │  Public profile page) │
                        └──────────┬───────────┘
                                   │ HTTPS
                                   ▼
                        ┌─────────────────────┐
                        │   Next.js App        │
                        │ - SSR public pages    │
                        │ - Dashboard (CSR)     │
                        │ - API routes/Actions  │
                        └──────────┬───────────┘
                   ┌───────────────┼───────────────────┐
                   ▼               ▼                    ▼
          ┌───────────────┐ ┌─────────────┐   ┌──────────────────┐
          │ Firebase Auth │ │ Cloud       │   │ Firebase Storage │
          │ (sessions,    │ │ Firestore   │   │ (cert images,    │
          │  OAuth)       │ │ (profiles,  │   │  avatars, PDFs)  │
          │               │ │ certs)      │   │                  │
          └───────────────┘ └─────────────┘   └──────────────────┘
```

## 3. Data Flow

1. **Sign up** → Firebase Auth creates user (`uid`) → app writes `profiles/{uid}` document and reserves `usernames/{username}` document.
2. **Add certificate** → user fills form + uploads file to Firebase Cloud Storage → app writes `certificates/{certificate_id}` document with download URL & metadata.
3. **Public page request** → `certlink.app/[username]` → server looks up `usernames/{username}` to resolve `uid` → fetches `profiles/{uid}` and `certificates` where `visibility != private` → renders SSR page.
4. **Share** → app generates QR code client-side from the profile URL; "copy link" copies the canonical URL.

## 4. Firestore Data Model

### `profiles/{uid}`
Document ID: `uid` (matches Firebase Auth UID)
- `uid`: string
- `username`: string (lowercase, unique)
- `full_name`: string
- `headline`: string
- `bio`: string
- `avatar_url`: string | null
- `visibility`: `"public"` | `"unlisted"` | `"private"` (default: `"public"`)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### `usernames/{username}`
Document ID: `username` (lowercase slug)
- `uid`: string (pointer to `profiles/{uid}`)
- `created_at`: Timestamp

### `certificates/{certificate_id}`
Document ID: Auto-generated string
- `id`: string
- `profile_id`: string (FK → profiles/{uid})
- `title`: string
- `issuer`: string
- `issue_date`: string (ISO date `YYYY-MM-DD`)
- `expiry_date`: string | null
- `credential_url`: string | null
- `file_url`: string | null
- `type`: `"certificate"` | `"badge"`
- `category`: string | null
- `is_featured`: boolean
- `sort_order`: number
- `created_at`: Timestamp
- `updated_at`: Timestamp

### `profile_views/{view_id}` (Phase 3, analytics)
Document ID: Auto-generated string
- `profile_id`: string
- `viewed_at`: Timestamp
- `referrer`: string | null

## 5. API / Server Actions (initial)

```
POST   /api/auth/session             (Sync Firebase Auth session token to cookie)
GET    /api/profile/me
PATCH  /api/profile/me
GET    /api/profile/:username        (public, respects visibility)

GET    /api/certificates             (owner's list)
POST   /api/certificates
PATCH  /api/certificates/:id
DELETE /api/certificates/:id
PATCH  /api/certificates/reorder
```

## 6. Auth & Security Rules

- **Firestore Security Rules**:
  - `profiles/{uid}`: readable by anyone if `visibility == 'public'` or `'unlisted'`; writable only by owner (`request.auth.uid == uid`).
  - `usernames/{username}`: readable by anyone; writable by owner during username creation.
  - `certificates/{id}`: readable by anyone if parent profile visibility is `'public'` or `'unlisted'`; writable only by owner (`request.auth.uid == resource.data.profile_id`).
- **Firebase Storage Rules**:
  - Read: public for published certificates/avatars.
  - Write: authenticated user writing to `users/{uid}/*` path.
- File uploads validated client and server side: file type (jpg/png/pdf), max size (e.g. 5MB).

## 7. Deployment

- **Frontend + API**: Vercel (or Firebase App Hosting), auto-deploy from `main` branch.
- **Database/Auth/Storage**: Firebase Project (staging + production instances).
- **Environments**: `local` (Firebase Emulators) → `staging` → `production`.
- **Domain**: `credfolio.app` for the product.

## 8. Scaling Considerations (later, not MVP-blocking)

- Cache public profile pages using ISR (Incremental Static Regeneration) or CDN caching with Firebase / Vercel.
- Use Cloud Functions or background tasks for heavy image processing if necessary.

