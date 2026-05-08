# Finance Tracker – AI Development Guide

## Repository Shape

This is a monorepo with:
- `backend/` → Kotlin + Spring Boot modular monolith
- `frontend/` → Next.js frontend

---

# Core Architecture Rules

## Backend

Backend modules are isolated bounded contexts.

Current modules:
- auth
- user-profile
- institution
- asset
- account
- transaction
- fees
- price
- fx
- inflation
- analytics

### Dependency Rules

Allowed:
- modules → shared
- app → all modules

Avoid:
- circular module dependencies
- direct feature-to-feature persistence access
- business logic inside `app`

### Shared Module

`shared/` must remain:
- framework-free
- reusable
- infrastructure-agnostic

Do not:
- add Spring Boot dependencies
- add persistence concerns
- place feature-specific logic here

---

# Frontend Rules

Frontend uses:
- Next.js App Router
- feature-oriented structure
- SWR
- TypeScript

## Structure

- `src/app` → routing and page orchestration
- `src/features` → business features
- `src/shared` → reusable primitives
- `src/lib` → infrastructure/utilities

## UI Rules

Prefer:
- feature-local components
- CSS modules
- colocated feature logic

Avoid:
- giant shared component libraries too early
- cross-feature imports without abstraction

---

# API & Data Rules

- Backend is the source of truth.
- Avoid duplicating domain logic in frontend.
- Prefer typed API contracts.
- Keep DTOs explicit and stable.

---

# Testing Expectations

Frontend:
- Jest
- React Testing Library
- Playwright

Backend:
- JUnit Jupiter

New features should include tests.

---

# AI Agent Guidelines

Before modifying code:
1. Identify the owning module.
2. Respect dependency boundaries.
3. Avoid introducing hidden coupling.
4. Prefer extending existing patterns over inventing new ones.
5. Keep changes local to the bounded context.

When adding features:
- update migrations if persistence changes
- keep frontend/backend naming aligned
- avoid leaking infrastructure concerns into domain logic

---

# Important Constraints

Do not:
- turn `shared` into a dumping ground
- bypass analytics aggregation boundaries
- duplicate currency conversion logic outside `fx`
- place pricing logic outside `price`
- place transaction logic outside `transaction`

---

# Documentation

Additional repository intelligence lives in:

- `/ai-context/architecture.md`
- `/ai-context/conventions.md`
- `/ai-context/module-rules.md`
- `/ai-context/current-state.md`