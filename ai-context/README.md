# ai-context — Deep documentation

This folder holds **architecture and reference** material for humans and AI agents. **`CLAUDE.md`** (repo root) remains the **primary Cursor workspace rule** for execution modes, pipeline, and non-negotiable project rules.

---

## Single source of truth (do not duplicate)

| Topic | Own it here | Do not repeat elsewhere except a one-line pointer |
|---|---|---|
| **Pinned dependency versions** (Kotlin, Spring Boot, Gradle, Next, Jest, Playwright, …) | [`current-state.md`](current-state.md) § *Dependency Versions* | `CLAUDE.md`, `architecture.md` — use major product names only, or “see current-state.md” |
| **What is implemented vs missing**, E2E/Jest inventory, repo hygiene (CI folder, docker/), prioritised backlog | [`current-state.md`](current-state.md) | `CLAUDE.md` — link only |
| **Per-module** domain rules, use cases, REST ↔ UI notes | [`module-rules.md`](module-rules.md) | Do not copy long module tables into `CLAUDE.md` |
| **Naming**, test file layout, HTTP codes, formatting, a11y, SWR mock pattern | [`conventions.md`](conventions.md) | `CLAUDE.md` — link for test patterns |
| **Directory trees**, stack overview, auth flow, API route map, DB schemas | [`architecture.md`](architecture.md) | Keep high-level bullets in `CLAUDE.md` only |
| **Windows + PowerShell**, `npm install` vs `npm ci`, Gradle command cheat sheet | [`AGENTS.md`](../AGENTS.md) (repo root) | `CLAUDE.md` — link for commands |
| **Execution modes, STEP pipeline, hexagonal rules, monetary rules, UI primitives list** | [`CLAUDE.md`](../CLAUDE.md) | Do not duplicate the full STEP table in other files |

If two files say the same thing, **delete the duplicate** and leave a pointer in the file that owns the narrower scope.

---

## Documentation maintenance (mandatory for agents and developers)

When you change the codebase, **update documentation in the same change** (same PR / same commit series) whenever any of the following would otherwise become wrong or misleading:

| Change type | Update |
|---|---|
| New or removed **backend module**, schema, or public REST contract | `architecture.md` (tree / API map if affected), `module-rules.md`, `current-state.md` |
| New or removed **frontend feature** (route, `features/*`, major UX) | `architecture.md`, `module-rules.md`, `current-state.md`; adjust **STEP 9** table in `CLAUDE.md` if integration order/status changes |
| **Pinned versions** (`package.json`, `libs.versions.toml`, Gradle wrapper) | `current-state.md` § *Dependency Versions* only |
| **Naming / test style** | `conventions.md` |
| **Shell / CI install policy** | `AGENTS.md`; mirror only if `CLAUDE.md` has a single summary line |
| **New known limitation or intentional cap** | `current-state.md` § *Known limitations* or *Things to do* |

If you are unsure which file to touch, update **`current-state.md`** for factual “what exists now” and **`CLAUDE.md`** only for rules or pipeline changes.

---

## File list

| File | Scope |
|---|---|
| `README.md` | This map + maintenance rule |
| `architecture.md` | Stack overview, trees, flows, API ↔ frontend mapping, DB layout |
| `conventions.md` | Naming, layers, tests, errors, HTTP, formatting, accessibility |
| `module-rules.md` | Per bounded context: rules + integration notes |
| `current-state.md` | Live-ish product/tech state, versions, gaps, backlog |
