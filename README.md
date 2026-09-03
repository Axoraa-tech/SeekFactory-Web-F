# 🏭 SeekFactory Web Frontend (FEW)

> **Next.js 15 (App Router) • React 19 • TypeScript (Strict) • Tailwind CSS**  
> An India–China B2B manufacturing marketplace: video-first reels discovery connecting global buyers with verified manufacturers through a LinkedIn-style professional workspace.

---

## 🧭 Table of Contents

1. [Vite Developer Quickstart: Transitioning to Next.js](#-vite-developer-quickstart-transitioning-to-nextjs)
2. [What is the Root File & Execution Flow?](#-what-is-the-root-file--execution-flow)
3. [Project Directory Architecture](#-project-directory-architecture)
4. [How Data Flows (Clean Architecture & API Seam)](#-how-data-flows-clean-architecture--api-seam)
5. [Getting Started & Running Locally](#-getting-started--running-locally)
6. [Design System & UI Components](#-design-system--ui-components)
7. [Developer Recipes: How Do I...?](#-developer-recipes-how-do-i)
8. [Production & Deployment Notes](#-production--deployment-notes)

---

## ⚡ Vite Developer Quickstart: Transitioning to Next.js

If you have built React apps using **Vite**, here is the exact mental map to help you feel right at home with Next.js 15:

### 1. Conceptual Comparison

| Concept | Vite (SPA) | Next.js 15 (App Router) |
|---|---|---|
| **Root HTML & Entry** | index.html + src/main.tsx | src/app/layout.tsx (renders <html> and <body>) |
| **Routing** | eact-router-dom (<Route path="/explore" />) | **File-system routing**: folder name = URL path (src/app/(buyer)/explore/page.tsx → /explore) |
| **Where Code Runs** | 100% in the user's browser | **Server Components by default** (runs on server, ships zero JS to browser) + "use client" for interactive widgets |
| **Data Fetching** | useEffect(() => { fetch(...) }, []) + loading state | sync function Page() { const data = await api.get(); return ... } directly in the component! |
| **Environment Variables** | import.meta.env.VITE_API_URL | process.env.NEXT_PUBLIC_API_URL (public) or process.env.SECRET_KEY (server only) |
| **Links / Navigation** | <Link to="/explore"> from eact-router-dom | <Link href="/explore"> from 
ext/link |
| **URL Parameters** | useParams(), useSearchParams() | In Server Components: passed directly as props: { params, searchParams }. In Client: useParams() from 
ext/navigation |

### 2. Server Components vs. Client Components

- **Server Components (Default)**: Next.js renders them on the server into HTML. They never execute in the browser, can fetch data directly with sync/await, and reduce bundle size.
- **Client Components ("use client")**: Add "use client" at the very top of any file that uses:
  - React hooks: useState, useEffect, useRef
  - Browser events: onClick, onChange, onSubmit
  - Browser APIs: window, localStorage, video playback controls

---

## 🚀 What is the Root File & Execution Flow?

In this codebase, request execution follows a layered pipeline:

`
Browser Request (e.g. "/")
       │
       ▼
1. [src/app/layout.tsx]               <-- GLOBAL ROOT FILE
   • Injects HTML structure, Plus Jakarta Sans font, Tailwind tokens & metadata
       │
       ▼
2. [src/app/(buyer)/layout.tsx]        <-- SHELL LAYOUT
   • Loads current user, categories, notifications, and sidebar widgets on the server
   • Renders <AppShell> (TopNav, LeftSidebar, RightAside, MobileNav)
       │
       ▼
3. [src/app/(buyer)/page.tsx]          <-- PAGE ENTRY (Home)
   • Server Component that parses ?tab= (For You / Following)
   • Calls loadFeed() and renders FeedTabs + ReelsFeed
`

### What do the parentheses like (buyer) and (auth) mean?
In Next.js App Router, parentheses indicate a **Route Group**:
- (buyer) and (auth) do **not** add segments to the URL path.
- src/app/(buyer)/explore/page.tsx is accessible at /explore (NOT /(buyer)/explore).
- Route groups allow different layouts:
  - Pages inside (buyer) inherit the LinkedIn-style 3-column AppShell.
  - Pages inside (auth) (like /login, /join, /legal) have a focused, clean layout without sidebars.

---

## 📁 Project Directory Architecture

The codebase adheres to an industry-standard **Clean / Feature-Sliced** architecture:

`	ext
SeekFactory-Web-F/
├── public/                     # Static assets (official brand logos, demo reels)
│   ├── brand/                  # Official SeekFactory logos
│   └── videos/                 # Local demo video files for the reels player
│
├── messages/                   # i18n localization dictionaries (EN, ZH)
│   ├── en.json
│   └── zh.json
│
├── src/
│   ├── app/                    # Next.js App Router (Routes & Layouts)
│   │   ├── layout.tsx          # 🌐 GLOBAL ROOT LAYOUT (HTML, Fonts, Metadata)
│   │   ├── robots.ts           # SEO robots configuration
│   │   │
│   │   ├── (auth)/             # Authentication & Legal route group (Clean layout)
│   │   │   ├── layout.tsx      # Auth shell layout
│   │   │   ├── join/page.tsx   # /join (Buyer / Manufacturer registration)
│   │   │   ├── login/page.tsx  # /login (Sign-in flow)
│   │   │   └── legal/          # Privacy, Terms, Cookies, Accessibility
│   │   │
│   │   ├── (buyer)/            # Buyer Portal (Wrapped in LinkedIn-style 3-column shell)
│   │   │   ├── layout.tsx      # Shell data loader & <AppShell> wrapper
│   │   │   ├── page.tsx        # / (Video Reels Home Feed)
│   │   │   ├── explore/        # /explore (Taxonomy category explorer & search)
│   │   │   ├── manufacturers/  # /manufacturers/[slug] (Factory profile)
│   │   │   ├── products/       # /products/[slug] (Product detail page)
│   │   │   ├── messages/       # /messages (Buyer-supplier chat)
│   │   │   ├── notifications/  # /notifications (Activity alerts)
│   │   │   ├── profile/        # /profile (User profile & preferences)
│   │   │   └── rfq/new/        # /rfq/new (Post Request for Quotation)
│   │   │
│   │   └── factory/            # /factory (Manufacturer onboarding landing)
│   │
│   ├── components/             # Reusable UI Components
│   │   ├── ui/                 # 🧱 Atomic Primitives (Button, Card, Avatar, Badge...)
│   │   │   └── index.ts        # Clean barrel exports
│   │   ├── layout/             # 📐 Global App Shell (TopNav, LeftSidebar, SearchBar...)
│   │   │   └── index.ts        # Clean barrel exports
│   │   ├── reels/              # 🎬 Video Player & Feed (ReelCard, Scrubber, Comments)
│   │   │   └── index.ts        # Clean barrel exports
│   │   └── widgets/            # 📊 Right-column widgets (Trending, Categories, Suppliers)
│   │       └── index.ts        # Clean barrel exports
│   │
│   ├── entities/               # 🏷️ Domain Models & TypeScript Interfaces
│   │   ├── user.ts             # BuyerProfile, SupplierProfile
│   │   ├── reel.ts             # Reel, ReelVariant
│   │   ├── product.ts          # Product, ProductSpec
│   │   ├── manufacturer.ts     # Manufacturer, VerificationStatus
│   │   ├── category.ts         # Category, CategoryIconKey
│   │   ├── comment.ts          # ReelComment, ReelCommentReply
│   │   ├── message.ts          # Conversation, ChatMessage
│   │   ├── notification.ts     # AppNotification
│   │   └── rfq.ts              # RfqDraft, RfqSubmission
│   │
│   ├── features/               # ⚙️ Feature-Level Business Logic & State
│   │   ├── auth/               # Session cookie management, AuthCard, RoleToggle
│   │   ├── feed/               # Feed loading & tab filtering
│   │   ├── explore/            # Category navigation & filters
│   │   ├── rfq/                # RFQ form validation & draft handling
│   │   └── shell/              # Data prefetching for the global shell
│   │
│   ├── shared/                 # 🛠️ Cross-Cutting Core Utilities
│   │   ├── api/                # API Client contracts & getApi() interface
│   │   ├── config/             # Brand identity, design tokens & feature flags
│   │   ├── lib/                # cn() (Tailwind class merger), formatters (currency, numbers)
│   │   └── mocks/              # Mock database, machinery taxonomy & fixture data
│   │
│   └── styles/
│       └── globals.css         # CSS Variables, Design Tokens & Tailwind Directives
│
├── next.config.ts              # Next.js compiler & asset optimization settings
├── tailwind.config.ts          # Tailwind theme extensions (brand colors, radius)
└── tsconfig.json               # Strict TypeScript configuration & path aliases (@/*)
`

---

## 🔌 How Data Flows (Clean Architecture & API Seam)

To keep UI components decoupled from the backend implementation, this application follows the **Repository / API Contract Pattern**:

`
[Page or Component]
       │
       ▼ calls
[getApi()] from @/shared/api
       │
       ├─► TODAY:   mockApi (In-memory mock database with simulated latency)
       │
       └─► LATER:   httpApi (Connects to REST / GraphQL backend via fetch)
`

### The Iron Rule:
> **UI components never import fixtures or mock files directly.**  
> Always query through getApi():

`	sx
import { getApi } from "@/shared/api";

export default async function ExplorePage() {
  const api = getApi();
  const categories = await api.categories.listRoots();
  
  return <CategoryGrid categories={categories} />;
}
`

When connecting a real production backend, you only implement src/shared/api/http-api.ts and return it from getApi(). **Zero page components need to be modified.**

---

## 💻 Getting Started & Running Locally

### Prerequisites
- Node.js 18.18+ or 20+
- npm 9+

### 1. Install Dependencies
`ash
npm install
`

### 2. Configure Environment (Optional)
Copy the example environment file:
`ash
cp .env.example .env.local
`
*(Leave NEXT_PUBLIC_API_URL empty while developing with mock data).*

### 3. Start Development Server
`ash
npm run dev
`
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Available Scripts

| Command | Description |
|---|---|
| 
pm run dev | Starts local Next.js development server with Turbopack |
| 
pm run build | Compiles an optimized production build |
| 
pm run start | Runs the compiled production server |
| 
pm run lint | Runs ESLint and TypeScript checks across the codebase |

---

## 🎨 Design System & UI Components

The application is styled with Tailwind CSS, themed specifically for SeekFactory's professional B2B branding.

### Brand Tokens

| Token Name | Tailwind Class | Hex Code | Purpose |
|---|---|---|---|
| **Brand Blue** | g-brand-blue, 	ext-brand-blue | #1A73E8 | Primary CTAs, active links, verified badges |
| **Brand Blue Dark**| hover:bg-brand-blue-dark | #1557B0 | Button hover states |
| **Brand Orange** | g-brand-orange, 	ext-brand-orange | #F26B21 | Accent actions, RFQs, highlight badges |
| **Canvas** | g-canvas | #F3F4F6 | Page background |
| **Surface** | g-surface | #FFFFFF | Card & sidebar surface background |
| **Line** | order-line | #E5E7EB | Subtle divider and card borders |

### Reusable UI Primitives
Import UI primitives directly using clean barrel exports:
`	sx
import { Button, Card, Badge, Avatar, VerifiedBadge } from "@/components/ui";

export function ExampleCard() {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <Avatar src="/avatar.jpg" alt="Supplier" size={40} />
        <VerifiedBadge />
      </div>
      <Button variant="primary" size="md" className="mt-4">
        Contact Factory
      </Button>
    </Card>
  );
}
`

---

## 🛠️ Developer Recipes: How Do I...?

### 1. How do I create a new page with the 3-column shell?
Add a folder under src/app/(buyer)/:
`	sx
// src/app/(buyer)/analytics/page.tsx
export default async function AnalyticsPage() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <h1 className="text-xl font-bold text-ink">Analytics</h1>
    </div>
  );
}
`
*It will automatically inherit the TopNav, LeftSidebar, and RightAside widgets!*

### 2. How do I create an isolated page (like a full-screen landing or checkout)?
Add a folder under src/app/(auth)/ or create a new route group without the buyer layout.

### 3. How do I add interactive state to a component?
Add "use client" at the top:
`	sx
"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>Clicks: {count}</button>;
}
`

### 4. How do I add a new entity or API method?
1. Define the type in src/entities/your-model.ts and re-export it in src/entities/index.ts.
2. Add the method signature to ApiClient in src/shared/api/contracts.ts.
3. Implement the mock handler in src/shared/mocks/mock-api.ts.
4. Call it anywhere using getApi().yourModel.yourMethod().

---

## 🌏 China & Global Infrastructure Constraints

Because SeekFactory connects **Indian/Global buyers** with **Chinese manufacturers**, third-party dependencies are strictly selected to ensure accessibility in both regions:

| Service / Dependency | ❌ Avoid Defaulting To | ✅ Production Preference |
|---|---|---|
| **Fonts** | Google Fonts CDN runtime requests | 
ext/font (self-hosted locally at build time) |
| **Authentication** | Google OAuth only | Email + Mobile SMS OTP (WeChat for China suppliers) |
| **Video Delivery** | Cloudflare Stream / Mux (blocked in parts of China) | Aliyun OSS + VOD (HLS) |
| **Maps & Location** | Google Maps SDK | Amap (AutoNavi) / Tencent Maps |
| **Image Hosting** | Cloudinary / Firebase Storage | Aliyun OSS or AWS S3 China |

---

## 🤝 Contribution & Quality Guidelines

- Keep TypeScript in **strict mode** with zero ny types.
- Always run 
pm run lint before committing changes.
- Maintain mobile responsiveness (md:, lg: breakpoints) for every view.
- When in doubt, refer to AGENTS.md for architectural guidelines.
