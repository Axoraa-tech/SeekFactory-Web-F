# SeekFactory FEW — Frontend Architecture & Security Audit

**Scope:** `Seekfactory_FEW` web only (Next.js 15 App Router). Mobile out of scope.  
**Date:** 2026-09-07  
**Overall score:** **6 / 10** (strong demo structure; not enterprise; not production-hardened)

---

## Verdict

This is **not enterprise-level architecture**. It is a **well-structured prototype / mid-level demo frontend**: Feature-Sliced–inspired folders, a typed `getApi()` seam, TypeScript strict, and lean dependencies — with **mock auth**, **no automated test suite historically**, **dead reel variants** (cleaned in follow-up work), and several **large one-off screens**.

| Area | Score /10 | Notes |
|------|-----------|-------|
| Folder / layer discipline | **7.5** | Clear `app` / `components` / `features` / `entities` / `shared` (+ `hooks`) |
| Component reuse | **5.5** | UI primitives reused; reels/profile/chat were monolithic |
| Coding standards | **7** | TS strict, ESLint Next, intentional `"use client"`, `getApi()` rule |
| Security (frontend) | **3.5** | Acceptable for mock demo; unsafe for real accounts |
| Performance readiness | **5.5** | Lean deps; risk on video feed + heavy client islands |
| Future maintainability | **6** | Routes/shell easy to find; reels/auth need care when backend lands |
| **Overall** | **6** | Good foundation for the current milestone |

---

## Architecture

**Pattern:** Feature-Sliced Design–inspired + Next.js App Router  
**Not:** full FSD, Clean Architecture, micro-frontends, or enterprise monorepo packages

```text
src/
  app/           # routes only (thin) — (auth) | (buyer) | (profile) | factory
  components/    # presentational UI — ui/, layout/, reels/, widgets/, …
  features/      # feature UI + orchestration — auth, feed, explore, rfq, shell
  entities/      # pure domain types only
  hooks/         # shared React hooks (e.g. useSeekAutoplay)
  shared/
    api/         # ApiClient contracts + getApi() + http-api stub
    config/      # brand, featureFlags
    lib/         # cn(), format, messages helper
    mocks/       # fixtures + mock-api (demo only)
  styles/        # design tokens
```

### Where to change what

| Change | Folder |
|--------|--------|
| URL / page | `src/app/...` |
| Button / card look | `src/components/ui` |
| Top nav / shell | `src/components/layout` |
| Login / session (mock) | `src/features/auth` |
| Feed data shape | `src/shared/api/contracts` + mock/http |
| Domain type | `src/entities` |
| Shared hooks | `src/hooks` |
| Server mutations (later) | `src/features/*/actions.ts` when backend exists |

### What is not enterprise (by design for this milestone)

- No real auth (HttpOnly Secure cookies / JWT), RBAC, CSRF strategy, CSP suite
- No shared packages with mobile, no design-system package publish
- No Redux/Zustand (local state + URL params — appropriate for now)
- No plugins folder (not needed)

---

## Component inventory & reuse

### Well reused (`src/components/ui/`)

`Button`, `Card`, `Avatar`, `Badge`, `IconButton`, `BrandLogo`, `VerifiedBadge`, `CategoryIcon`, `PageHeader`, `LoadingScreen`, `BackToTop`, `ProductActionBar`

### Layout shell (`src/components/layout/`)

`AppShell`, `TopNav`, `LeftSidebar`, `RightAside`, `MobileNav`, dropdowns, `SearchBar`, `SidebarFooter`

### Domain / feature UI

| Area | Components |
|------|------------|
| Reels | `ReelsFeed`, `ReelCard`, player chrome, feed tabs, engagement rail, comments (+ split pieces), **5 wired variants** |
| Widgets | Verified manufacturers (rail), trending products, recent messages, explore-by-category |
| Profile | Dashboard orchestrator + hero / tabs / panels |
| Messages | Chat orchestrator + thread list + conversation pane |
| Explore | Category nav, verified manufacturers (explore layout) |

### Historical debt (addressed or in backlog)

1. Unused reel variants (cyber / fullbleed / live / social / youtube) — removed
2. God components — split into presentational pieces under the same folders
3. Duplicate “Verified Manufacturers” — unified data-driven component with `layout` variants

---

## Security findings (frontend-only)

### High (blockers before real users / production)

| Finding | Location | Risk |
|---------|----------|------|
| Client-writable `sf-session` cookie (no HttpOnly / Secure / signature) | `src/features/auth/session-cookie.ts` | Forgeable identity/role |
| Mock OTP `123456`; password length-only | Auth UI / AGENTS | Auth bypass by design |
| No real HTTP Authorization / CSRF | `http-api.ts` stub | Must design with backend |
| Route protection only via `requireUser` per page | features/auth | Easy to miss a route (middleware skeleton added for headers + future gates) |

### Medium

| Finding | Notes |
|---------|-------|
| Open redirect partially guarded | `postAuthPath` allows `/…` only, not `//` — keep + test |
| Prefs in `localStorage` / prompt dismiss in `sessionStorage` | Low risk today |
| Image remotePatterns | Unsplash only — tighten for Aliyun CDN later |
| Security headers | Baseline set in `middleware.ts`; expand CSP at deploy |

### Positive

- No `dangerouslySetInnerHTML` / `eval` in `src`
- UI must not import mocks directly (ESLint boundary)
- Lean dependency surface
- China-safe provider constraints documented in AGENTS.md

**Do not ship real accounts on the mock session model.**

---

## Performance notes

| Risk | Mitigation direction |
|------|----------------------|
| Multiple reel videos | `useSeekAutoplay` single-active via `sf-seek-play`; pause-all on comments |
| Heavy chat / profile / comments | Dynamic import on pages / lazy comments modal |
| Long feeds | Virtualize when real API returns long lists |
| Client JS | Keep Server Components default; `"use client"` only for interactivity |

---

## Standards followed

- TypeScript `strict`
- ESLint `next/core-web-vitals` + `next/typescript`
- Path alias `@/*`
- Design tokens via CSS variables + Tailwind `brand-*` / `ink-*`
- Data access only through `getApi()`

**Good standard for a product demo.** Not yet a full production standard (tests, CI gates, real auth, i18n runtime).

---

## Recommended order of future work

1. Real backend session (HttpOnly Secure cookie) behind `getApi()` / flags — replace client cookie
2. Keep deleting duplication in reel chrome shared pieces
3. Feed virtualization + Aliyun VOD when video goes live
4. Expand Vitest/Playwright coverage beyond smoke/auth helpers
5. Full i18n (`next-intl` or equivalent) when EN+ZH UI is required — `messages/*.json` is lightly wired today
