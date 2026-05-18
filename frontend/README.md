# Finance Tracker - Frontend

Next.js 16 + TypeScript frontend for Finance Tracker.

For full-project setup, backend commands, architecture, and documentation links, start with the root [`../README.md`](../README.md).

## Stack

- **Next.js 16** - App Router
- **TypeScript** - strict mode
- **SWR** - data fetching and caching
- **CSS Modules** - scoped styling, no external UI library
- **Jest + Testing Library** - unit and integration tests
- **Playwright** - E2E tests

## Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/              # Login, registration, password reset
│   ├── dashboard/          # Portfolio overview
│   ├── institutions/       # Institution management
│   ├── accounts/           # Account management
│   ├── transactions/       # Transaction history
│   └── analytics/          # Performance analytics
├── features/               # Feature modules
│   ├── auth/               # API, hooks, tests
│   ├── user-profile/       # API, hooks, tests
│   ├── institutions/       # API, hooks, tests
│   ├── accounts/           # API, hooks, tests
│   ├── transactions/       # API, hooks, tests
│   └── analytics/          # API, hooks, tests
├── shared/                 # Shared components and types
│   ├── components/         # UI primitives
│   └── types/              # Shared TypeScript types
└── lib/                    # HTTP client, formatters
```

## Setup

All shells:

```sh
npm install
npm run dev
```

Create `frontend/.env.local` only when you need to override the backend URL:

```text
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Use `npm install` for local development. CI/CD should use `npm ci` only.

## Commands

All shells:

```sh
npm run dev            # Dev server
npm run build          # Production build
npm start              # Start built app
npm run lint           # ESLint
npm test               # Jest tests
npm run test:watch     # Jest watch mode
npm run test:coverage  # Jest coverage report
npm run test:e2e       # Playwright E2E tests with traces
npm run format         # Format files with Prettier
npm run clean          # Remove generated frontend outputs
npm run reinstall      # Local recovery: reset node_modules + lockfile, then npm install
```

## Accessibility

- WCAG AA compliant
- Semantic HTML throughout
- ARIA roles, labels, and live regions
- Full keyboard navigation
- Focus management on route changes

## Environment Variables

| Variable            | Default               | Description          |
| ------------------- | --------------------- | -------------------- |
| NEXT_PUBLIC_API_URL | http://localhost:8080 | Backend API base URL |

The frontend calls `/api/*`; Next.js rewrites those requests to `${NEXT_PUBLIC_API_URL}/api/*`.
