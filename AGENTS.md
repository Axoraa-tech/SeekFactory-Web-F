# SeekFactory FEW — Project Rules & Guide

This document is the **single source of truth** for humans and AI agents working on the SeekFactory web frontend. Follow it for architecture, design, China constraints, and contribution workflow.

**Repo:** [Axoraa-tech/SeekFactory-Web-F](https://github.com/Axoraa-tech/SeekFactory-Web-F) (branch `1/weBFE`)  
**Also:** [abhinavrbharadwaj7/SeekFactoryFEW](https://github.com/abhinavrbharadwaj7/SeekFactoryFEW)

---

## 1. Product in one sentence

SeekFactory is an **India–China B2B manufacturing marketplace**: video-first discovery connecting **Indian/global buyers** with **verified Chinese (and global) manufacturers**.

This package (`Seekfactory_FEW` / SeekFactory-Web-F) is the **web frontend only** (LinkedIn-style shell + Reels feed). Mobile apps and the real backend are separate tracks.

---

## 2. Tech stack (locked)

| Layer | Choice |
|---|---|
| Framework | **Next.js 15** App Router |
| Language | **TypeScript** (strict) |
| UI | **React 19** + **Tailwind CSS** |
| Icons | **lucide-react** |
| Fonts | `next/font` (Plus Jakarta Sans) — self-hosted after build |
| Data today | **Mock repositories** behind `getApi()` |
| State | Local React state + URL search params (no Redux/Zustand unless approved) |

Do **not** introduce Firebase, Google Maps SDK, Google Analytics, or Cloudflare Stream as defaults.

---

## 3. How to run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

Copy `.env.example` if needed. Leave `NEXT_PUBLIC_API_URL` empty while using mocks.

---

## 4. Folder architecture (must follow)

```text
src/
  app/
    (auth)/          # Join, Sign in, legal — NO buyer AppShell
    (buyer)/         # LinkedIn 3-column shell (TopNav + left + right)
    factory/         # Manufacturer landing after join
  components/
    ui/              # Dumb: Button, Card, Avatar, Badge, BrandLogo…
    layout/          # TopNav, LeftSidebar, RightAside, AppShell, SidebarFooter
    reels/           # ReelCard, FeedTabs, EngagementRail…
    widgets/         # Right-rail widgets only
  entities/          # Domain types only (no UI, no fetch)
  features/          # Feature logic: auth, feed, rfq, shell loaders
  shared/
    api/             # ApiClient contracts + getApi() + future http-api
    mocks/           # fixtures + mock-api + machinery-taxonomy
    config/          # brand, featureFlags
    lib/             # cn(), format helpers
  styles/globals.css # Design tokens (CSS variables)
messages/            # en.json, zh.json (i18n strings; EN UI first)
public/brand/        # Official logo assets
```

### Hard rules

1. **UI never imports mocks/fixtures directly.** Always go through `getApi()` from `@/shared/api`.
2. **Entities stay pure types.** No React, no `fetch`.
3. **Presentational UI** lives in `components/ui`. Feature-specific UI can live under `features/*/`.
4. **Route groups:** `(auth)` ≠ `(buyer)`. Do not wrap Join/Login in `AppShell`.
5. When backend exists: implement `createHttpApi` in `src/shared/api/http-api.ts` and switch `getApi()` — **do not rewrite pages**.

---

## 5. Design system (match the client mock)

### Brand

| Token | Value | Use |
|---|---|---|
| Primary blue | `#1A73E8` | Buttons, active nav, links (`--brand-blue`) |
| Blue dark | `#1557B0` | Hover |
| Blue soft | `#E8F1FD` | Active backgrounds |
| Accent orange | `#F26B21` | Premium CTAs (`--brand-orange`) |
| Canvas | `#F3F4F6` | Page background |
| Surface | `#FFFFFF` | Cards |
| Logo | `/brand/seekfactory-logo.png` | Header / auth (transparent BG) |
| Tagline | Green Factories Worldwide | |

Defined in `src/styles/globals.css` and `src/shared/config/brand.ts`. Prefer Tailwind `brand-*` / `ink-*` classes over hard-coded hex in components.

### Layout (LinkedIn reference)

- **Desktop:** TopNav + left sidebar + center feed + right widgets
- **Tablet:** hide right aside
- **Mobile:** bottom nav + full-width center
- Right sidebar ends with compact **SidebarFooter** (About / legal / copyright), LinkedIn-style

### Visual direction

- White/light gray surfaces, soft borders, rounded cards (~12px)
- Product/factory imagery is the focus — not decorative purple gradients
- Reels card: dark media plane, overlays, engagement rail, View Products / View Manufacturer CTAs

### Logo & favicon

- Full lockup: `public/brand/seekfactory-logo.png`
- App icons: `src/app/icon.png`, `favicon.ico`, `apple-icon.png` only — **never duplicate** the same files under `public/` (Next.js conflict)

---

## 6. Routes map

| Path | Audience | Notes |
|---|---|---|
| `/` | Buyer (guest OK) | Reels: For You / Following |
| `/explore` | Public | `?category=` root, `?sub=` child |
| `/manufacturers/[slug]` | Public | SEO-ready factory page |
| `/products/[slug]` | Public | SEO-ready product page |
| `/messages`, `/notifications`, `/profile`, `/rfq/new` | Auth required | Guests → `/join?next=…` |
| `/join`, `/login` | Auth | Buyer \| Manufacturer toggle |
| `/factory` | Manufacturer | Thin landing (not full dashboard yet) |
| `/legal/*` | Public | Terms, privacy, cookies, accessibility |

---

## 7. Auth rules (FE mock today)

- Session cookie: `sf-session` (role, email, name, company)
- Roles: **Buyer** (`Buyer`) and **Manufacturer** (`Supplier` in types)
- After join/login: Buyer → `/`, Manufacturer → `/factory`
- Buyer: email/password primary; phone OTP mock (`123456`); Google button is **stub**
- Manufacturer: factory name on join; WeChat button is **stub** (China — no Google-only path)
- Guests: TopNav shows **Sign in** / **Join now**, not avatar
- Real OAuth/SMS stays behind `featureFlags` in `src/shared/config/flags.ts`

---

## 8. Categories & taxonomy

- Source: client Excel Sheet2 → committed as `src/shared/mocks/machinery-taxonomy.ts`
- **20 parent** categories + **~187 subcategories**
- `Category.parentId === null` → root (sidebar, TopNav search, Explore chips)
- Children shown on Explore when a root is selected
- Regenerate (dev only): `python scripts/parse-taxonomy.py` (needs the Excel + openpyxl)
- Remap manufacturer/product `categoryId(s)` to taxonomy IDs — do not revive old fake IDs (`cat-cnc`, `cat-forging`, …)

---

## 9. China / Ind–China constraints (non-negotiable)

| Do not default to | Prefer |
|---|---|
| Google Fonts CDN at runtime | `next/font` / self-hosted WOFF2 |
| Google-only auth | Email/phone all; Google optional for buyers; WeChat for manufacturers |
| Google Maps / GA | Amap/Tencent Maps; China-legal analytics |
| Cloudflare Stream / Mux only | Aliyun OSS + VOD (HLS) when video goes live |
| Vercel-only for China suppliers | Aliyun or dual-region Node Next.js host |
| WhatsApp / Stripe-first | In-app chat later; TT / escrow / Alipay / WeChat Pay in later phases |

This product serves **India buyers + China suppliers**. Dual audience = dual-safe providers.

---

## 10. Coding conventions

### TypeScript / React

- Prefer **Server Components** by default; mark `"use client"` only for interactivity (player chrome, carousels, forms, toggles)
- Use path alias `@/` for `src/`
- Use `cn()` from `@/shared/lib/cn` for class merging
- Keep props typed; avoid `any`
- Format counts/prices with `@/shared/lib/format`

### API / data

```ts
import { getApi } from "@/shared/api";

const api = getApi();
const roots = await api.categories.listRoots();
```

- Extend contracts in `src/shared/api/contracts.ts` before adding mock methods
- Mock delay is fine; keep responses shape-identical to future REST

### Commits & PRs

- Small, focused PRs against `1/weBFE` (or team branch policy)
- Do not commit `node_modules`, `.next`, secrets, or `.env` (only `.env.example`)
- Commit messages: short, why-focused (e.g. `Add buyer join flow with mock session`)

### What not to build in this FE milestone

- Real WebRTC calls, realtime sockets, payment rails
- Full supplier dashboard / admin CMS
- AI captions / auto-translate as launch blockers
- Rewriting the Vite `b2b-catalog-prototype` into this app (prototype is visual reference only)

---

## 11. Feature checklist before merging UI

- [ ] Works for **guest** and **logged-in** buyer where applicable
- [ ] Manufacturer path does not dump suppliers into buyer Reels as if they were buyers
- [ ] No new Google-blocked CDN dependencies
- [ ] Uses `getApi()`, not fixtures
- [ ] Mobile layout usable (bottom nav / stack)
- [ ] Brand blue stays `#1A73E8` for primary actions (design mock), not the darker logo blue
- [ ] Lint / `tsc` clean

---

## 12. Key entry files

| File | Role |
|---|---|
| `src/app/(buyer)/layout.tsx` | Buyer AppShell data load |
| `src/app/(buyer)/page.tsx` | Reels home |
| `src/features/auth/auth-card.tsx` | Join / Sign in UI |
| `src/shared/api/index.ts` | `getApi()` seam |
| `src/shared/mocks/mock-api.ts` | Mock implementations |
| `src/shared/mocks/machinery-taxonomy.ts` | Category tree |
| `src/styles/globals.css` | Design tokens |

---

## 13. Out of scope vs next phases (SOW)

| Now (FE demo) | Later |
|---|---|
| Mock session + Reels + Explore + RFQ UI | Real REST + Aliyun VOD |
| Manufacturer `/factory` stub | Supplier dashboard, uploads, analytics |
| Stub Google / WeChat buttons | Real OAuth / WeChat Open Platform |
| Mock OTP `123456` | SMS via Aliyun/Tencent |
| Static widgets | Realtime chat, calls, payments, AI captions |

---

**When in doubt:** keep the LinkedIn × Reels UX, keep `getApi()` as the only data door, and keep China-safe providers. Update this file when durable project decisions change.
