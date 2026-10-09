# CredFolio

**A single link to showcase your certificates, badges, and professional credentials.**

CredFolio is a web application designed to help students, job seekers, and professionals organize their achievements in one place and share them through a single profile link. It makes it easier for recruiters and others to browse credentials and follow available verification links.

**Live Demo:** https://credfolio-five.vercel.app  
**Repository:** https://github.com/SamayMasram/CredFolio

---

## Features

- **Personal credential profile** — Present certificates and badges in one place.
- **Credential details** — Organize information such as certificate title, issuing organization, dates, and verification links.
- **Shareable profile** — Share one link on a resume, LinkedIn profile, or email signature.
- **QR code support** — Generate a QR code for convenient access to a profile.
- **Credential management** — Manage credential information from a user-facing dashboard.
- **Responsive interface** — Designed to make credential pages accessible across screen sizes.
- **Firebase integration** — Uses Firebase services as part of the application's documented architecture.

> Feature availability may depend on the current deployment and implementation status.

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 14 | React framework and application routing |
| React 18 | User interface |
| TypeScript | Type-safe development |
| Tailwind CSS | Styling and responsive layouts |
| Firebase Authentication | User authentication |
| Cloud Firestore | Credential and profile data |
| Firebase Cloud Storage | File storage architecture for certificate assets |
| Firebase Admin SDK | Server-side Firebase operations |
| `qrcode` | QR code generation |
| Vercel | Live deployment |

## Getting Started

### Prerequisites

- Node.js and npm
- A Firebase project configured for the services used by the application

### 1. Clone the repository

```bash
git clone https://github.com/SamayMasram/CredFolio.git
cd CredFolio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root and add the Firebase configuration required by the application.

```env
# Add the environment variables required by your Firebase setup.
# Use the exact variable names referenced in the project source code.
```

Do not commit secrets, private keys, or production credentials to Git.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Create a production build

```bash
npm run build
npm run start
```

## How It Works

1. A user creates and maintains a profile.
2. The user adds credential information and supporting links or assets where supported.
3. CredFolio presents the credentials on a profile designed for sharing.
4. The profile link—and its QR code, when available—can be shared with recruiters, employers, or professional contacts.
5. Viewers can browse the listed credentials and follow available verification links.

## Project Structure

```text
CredFolio/
├── app/              # Application routes and pages
├── components/       # Reusable UI components
├── lib/              # Shared utilities and service logic
├── public/            # Static assets
├── types/             # TypeScript types
├── Architecture.md   # System architecture documentation
├── Design.md         # Design documentation
├── Prd.md             # Product requirements
└── package.json       # Dependencies and scripts
```

## Deployment

The project has a live deployment:

**https://credfolio-five.vercel.app**

For your own deployment, configure the required environment variables and Firebase services in your hosting provider before building the application.

## Future Improvements

Potential improvements include:

- Credential imports from external learning platforms
- More profile customization options
- Profile analytics
- Downloadable credential summaries
- Additional credential verification workflows

## Contributing

Contributions and suggestions are welcome. Fork the repository, create a feature branch, and open a pull request with a clear description of your changes.

## Author

**Samay Masram**

- GitHub: [@SamayMasram](https://github.com/SamayMasram)
- Project: [CredFolio](https://github.com/SamayMasram/CredFolio)

---

If you find the project useful, consider giving the repository a star.
