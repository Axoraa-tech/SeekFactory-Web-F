# Media delivery architecture (fast in mainland China, ₹0 extra)

How SeekFactory gets seek videos and products on screen quickly for buyers and suppliers in mainland
China, on the current Azure setup (App Service B1 + PostgreSQL B1ms + Blob Storage in Hong Kong), with
no CDN and no payment card.

## 1. Constraints

| Constraint | Consequence |
|---|---|
| Visitors in mainland China, servers in Azure Hong Kong | Every request crosses the border: ~150–300 ms per round trip, often only ~1–2 Mbps, China Unicom/Mobile routes worse than Telecom |
| No CDN (Azure Front Door and Tencent EdgeOne need a card; mainland CDNs need an ICP licence) | Bytes and round trips must be cut at the source |
| One shared CPU core (B1) for web + API | Heavy work (video encoding, photo resizing) must run at low priority and be spread out |
| Budget ₹4,000/month | Only configuration and code changes |

## 2. Where the time went (measured 25 Nov 2026)

First video on the home page, before this work. Every step waited for the one before it:

```
HTML (76 KB) ─► JavaScript (480 KB) ─► video player hls.js (113 KB) ─► master playlist ─► quality playlist ─► first piece (430 KB, 4 s)
0.6 s           +1.2 s                 after the page started          +0.4 s             +0.3 s              +0.5 s
```

- ~3.2 s from India; on a 1 Mbps China link the 430 KB first piece alone is ~3.5 s.
- The "next" seek downloaded up to 30 s of video at the same time, halving the bandwidth of the one on screen.
- Products: the whole catalogue (645 products) was 1.4 MB (356 KB compressed); ~60% was full descriptions that cards never show. The factory list was 0.5 MB; 75% was certificates and long descriptions.
- ~70 photos per home page went API → redirect → storage (one extra round trip each from China).

## 3. Design

### 3.1 Video: a light start, then adapt

```
                    ┌────────────── HLS v2 (per seek, made once, in Blob storage) ──────────────┐
 upload ─► compress │ index.m3u8                                                                  │
 (faststart MP4)    │  ├─ v2_0  240p  ~0.35 Mbps  2 s pieces (~90 KB)  ◄─ every player starts here │
                    │  ├─ v2_1  360p  ~0.8 Mbps                                                   │
                    │  └─ v2_2  720p  ~1.9 Mbps   (HD sources only, never upscaled)               │
                    └─────────────────────────────────────────────────────────────────────────────┘
```

- **2-second pieces with aligned keyframes**: the first frame needs ~90 KB, not 430 KB. The player moves up a quality as soon as the measured speed allows.
- Made by the API in the background (`HlsPublisher`), 3 videos per run, at `nice 19` so visitors' requests come first. Older seeks are repackaged automatically and keep streaming their v1 copy until the v2 copy is ready.
- Fallback chain: v2 stream → v1 stream → plain MP4. A broken stream never stops a video from playing.

### 3.2 Video: start everything at once

```
HTML ─┬─► JavaScript ─► page starts ─► player attaches (files already here)
      ├─► first seek: index.m3u8, v2_0.m3u8, v2_0_000.ts   (preload, high priority)
      └─► hls.js (starts as soon as the page script runs)
```

- The server names the first seek's opening files in the page (`<link rel="preload" as="fetch">`). They download **while the JavaScript is arriving**. Verified: a preloaded piece reached the player in 1 ms with no second download.
- **One seek buffers at a time.** The seek on screen keeps 30 s ahead; the next one keeps only its first 4 s; the others read their playlist only; far-away ones release their memory.
- Pause/resume and loops never download again (back buffer kept, pieces cached for a year).

### 3.3 Products and photos

| Before | After |
|---|---|
| Catalogue 1.4 MB with full descriptions | 240-character previews (the product page loads the full text) |
| Factory list 0.5 MB with certificates | Certificates removed, 400-character descriptions (the factory page loads both) |
| Photo → API → redirect → storage | Photo straight from storage (`media/variants/<id>-w<width>.<ext>`), switched on by `NEXT_PUBLIC_DIRECT_THUMBS` |
| Small photo copies made on first view (slow) | Made at upload, plus a one-time job for existing photos (paced so the API stays responsive) |
| Every seek poster downloaded up front | Only posters near the screen |

### 3.4 Caching

| What | Where | Lifetime |
|---|---|---|
| Video pieces, photo copies | Browser (from Blob) | 1 year, immutable |
| Playlists | Browser | 1 hour |
| Catalogue, factories, categories | Website server memory + browser ETag | 1 min fresh, 10 min stale-while-refresh; repeat visits get a 304 |
| JavaScript | Browser | 1 year (versioned file names) |

## 4. Switches (each can be turned off without code)

| Setting | Where | Effect |
|---|---|---|
| `APP_MEDIA_HLS_ENABLED` | Azure → seekfactory-api | Makes/serves streaming copies |
| `NEXT_PUBLIC_HLS_ENABLED` | GitHub variable (web build) | Website plays the streams (off = MP4) |
| `NEXT_PUBLIC_MEDIA_BASE_URL` | GitHub variable | Media straight from Blob |
| `NEXT_PUBLIC_DIRECT_THUMBS` | GitHub variable | Photo copies straight from Blob |
| `APP_MEDIA_WARM_VARIANTS` | Azure → seekfactory-api | One-time photo-copy job (remove after) |

## 5. Expected effect (1 Mbps China link)

| | Before | After |
|---|---|---|
| First video piece | ~430 KB, starts after the JavaScript | ~90 KB, downloads alongside the JavaScript |
| First frame | ~8–10 s | ~3–4 s (most of the rest is the page's own JavaScript) |
| Next seek | competes with the current one | first 4 s ready, no competition |
| Catalogue + factories, first visit | ~470 KB compressed | ~150 KB compressed (estimated) |
| Photos | +1 round trip each | direct |

These are estimates from the byte counts; the real check is the client's own test (private window) and a chinaz.com speed test after rollout.

## 6. What is left and why

- **JavaScript (~480 KB compressed)** is now the largest item on the first visit. Cutting it means splitting the home page into smaller pieces; worth doing next, but it is a larger refactor.
- **DNS**: `seekfactory.com` uses Hostinger's parking DNS; first lookups from China took 0.4–2.1 s. Moving DNS to a faster free provider is possible but touches email records, so it needs care.
- **A CDN inside mainland China** needs an ICP licence (a Chinese company). Until then, Hong Kong is the closest the files can be.
