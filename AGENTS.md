# AGENTS.md — Context for AI assistants and automation

This repository targets **Windows** with **PowerShell** as the default shell for the whole project. Prefer PowerShell-safe invocations (e.g. `.\gradlew.bat`, not a bare executable name when the current directory must be trusted).

---

## Where to read first

| Document | Role |
|----------|------|
| [`CLAUDE.md`](CLAUDE.md) | Execution modes, STEP pipeline, hexagonal rules, monetary rules, checklist |
| [`ai-context/README.md`](ai-context/README.md) | **Which doc owns which topic**; **mandatory doc updates with code** |
| [`ai-context/current-state.md`](ai-context/current-state.md) | Pinned versions, built vs missing, backlog |
| [`ai-context/architecture.md`](ai-context/architecture.md) | Trees, flows, API mapping |
| [`ai-context/conventions.md`](ai-context/conventions.md) | Naming, tests, errors, formatting |
| [`ai-context/module-rules.md`](ai-context/module-rules.md) | Per-module rules + integration notes |

---

## Quick start (local dev, PowerShell)

```powershell
# Backend — from backend/ (PostgreSQL reachable; Spring profiles per application*.yml)
Set-Location backend
.\gradlew.bat :app:bootRun

# Frontend — from frontend/
Set-Location ..\frontend
npm install
npm run dev
```

**Seed credentials:** [`ai-context/current-state.md`](ai-context/current-state.md) § *Dev Seed Credentials*.

---

## Documentation maintenance

When your change alters **versions**, **features**, **APIs**, or **documented limitations**, update the **owning file** in the same PR — see [`ai-context/README.md`](ai-context/README.md).

---

## Frontend — npm policy

- **Package manager:** **npm only** — do not use Yarn or pnpm.
- **Local development (human or agent on a dev machine):** use **`npm install`** in `frontend/` for day-to-day work. After adding or changing dependencies, ensure **`package-lock.json`** is updated and committed (no loose ranges in `package.json`; see `CLAUDE.md`).
- **CI/CD pipelines (GitHub Actions, bots, reproducible agents):** use **`npm ci` only** — never `npm install` in CI. Installs must be a strict replay of the committed lockfile.

The `npm run reinstall` script is for **local recovery** (wipes `node_modules` and lockfile, then `npm install`); it is not a substitute for `npm ci` in CI.

---

## Backend — Gradle (PowerShell)

Run from **`backend/`**:

```powershell
.\gradlew.bat build                              # unit + IT by default (needs Docker for Testcontainers)
.\gradlew.bat build -PskipIT=true                # unit tests only
.\gradlew.bat integrationTest -PskipIT=false   # integration tests only (needs Docker)
.\gradlew.bat testAggregateReport               # tests + Kover report (needs Docker)
.\gradlew.bat clean build                        # typical CI-style full check
```

On Unix shells, use `./gradlew` with the same tasks and properties.

---

## Language

All code, comments, logs, error messages, identifiers, and test names must be in **English** (see `CLAUDE.md`).
