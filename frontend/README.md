# Finance Tracker — Frontend

Next.js 15 + TypeScript frontend for the Finance Tracker backend.

## Stack

- **Next.js 15** — App Router, Server Components
- **TypeScript** — strict mode
- **SWR** — data fetching and caching
- **CSS Modules** — scoped styling, no external UI library
- **Jest + Testing Library** — unit and integration tests
- **Playwright** — E2E tests

## Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/              # Login, password reset
│   ├── dashboard/          # Portfolio overview
│   ├── accounts/           # Account management
│   ├── transactions/       # Transaction history
│   └── analytics/          # Performance analytics
├── features/               # Feature modules
│   ├── auth/               # API, hooks, tests
│   ├── accounts/           # API, hooks, tests
│   ├── transactions/       # API, hooks, tests
│   └── analytics/          # API, hooks, tests
├── shared/                 # Shared components and types
│   ├── components/         # UI primitives
│   └── types/              # Shared TypeScript types
└── lib/                    # HTTP client, formatters
```

## Setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL to your backend
npm run dev
```

## Commands

```bash
npm run dev          # Dev server at localhost:3000
npm run build        # Production build
npm run test         # Unit + integration tests
npm run test:e2e     # Playwright E2E tests
npm run lint         # ESLint
```

## Accessibility

- WCAG AA compliant
- Semantic HTML throughout
- ARIA roles, labels, and live regions
- Full keyboard navigation
- Focus management on route changes

## Environment Variables

| Variable            | Default               | Description          |
|---------------------|-----------------------|----------------------|
| NEXT_PUBLIC_API_URL | http://localhost:8080 | Backend API base URL |
