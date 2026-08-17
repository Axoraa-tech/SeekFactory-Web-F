# SeekFactory FEW

LinkedIn-style, video-first buyer web app for SeekFactory. Frontend only — mock data, no paid infra.

## Run

```bash
cd Seekfactory_FEW
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What this milestone includes

- Home Reels feed (For You / Following) matching the client mock
- App shell: TopNav, left nav + categories, right widgets, mobile bottom nav
- Explore, Messages, Notifications, Profile, Post RFQ
- Manufacturer and product detail pages (SEO metadata ready)
- Typed `ApiClient` + mock repositories so a real REST backend can swap in without rewriting UI

## Architecture

UI talks only to `getApi()` in `src/shared/api`. Today that returns `mockApi`. Later, implement `createHttpApi` in `src/shared/api/http-api.ts` and return it from `getApi()`.

Do not import fixtures from components.

## Low-cost / China-aware infra

This FE ships with **$0 runtime cost** (mocks + Next.js). When you go live:

| Concern | Do not default to | Prefer |
|---|---|---|
| Fonts | Google Fonts CDN at runtime | `next/font` (already self-hosted after build) or local `.woff2` in China CI |
| Video | Cloudflare Stream / Mux as the only path | Aliyun OSS + VOD (HLS). `ReelCard` is poster-first and can take an HLS URL later |
| Images | Cloudinary | Same OSS bucket + `next/image` loader |
| Auth | Google-only | Phone/email for all; Google optional for India buyers; WeChat for China suppliers |
| Maps / analytics | Google Maps, GA | Amap / Tencent Maps; self-hosted or China-legal analytics |
| Hosting | Vercel-only for China suppliers | Aliyun (or dual region). This app is a standard Node Next.js build |

## Still mocked

Realtime chat, WebRTC calls, uploads, payments, AI captions/translate, supplier dashboard, admin.

## Scripts

- `npm run dev` — local demo
- `npm run build` — production build
- `npm run start` — serve the build
- `npm run lint` — ESLint
