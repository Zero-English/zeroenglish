# Zero English — Application Audit

> **Audit type:** Read-only, end-to-end repository audit
> **Repository:** `C:\code\zeroenglish`
> **Branch audited:** `optimization/speed` (working tree clean at audit time)
> **Audit date:** 2026-11-05
> **Scope:** Every route, page, layout, API handler, service, data model, store, hook, sync mechanism, template engine, admin workflow, and configuration file in the application.
> **Write policy:** This file is the only artifact created by the audit. No existing source, configuration, dependency, or asset file was modified.

---

## Table of Contents

1. [Project Overview & Tech Stack](#1-project-overview--tech-stack)
2. [Architecture & Folder Structure](#2-architecture--folder-structure)
3. [Complete Route & Page Inventory](#3-complete-route--page-inventory)
4. [A-to-Z Feature Breakdown](#4-a-to-z-feature-breakdown)
5. [Backend, APIs & Data Layer](#5-backend-apis--data-layer)
6. [UI/UX, State & Performance Mechanics](#6-uiux-state--performance-mechanics)
7. [Audit Observations](#7-audit-observations)

---

## 1. Project Overview & Tech Stack

### 1.1 What the application is

Zero English is a bilingual (English ↔ Bangla) English-learning platform aimed at Bangla-speaking learners. It combines:

- A CEFR-leveled vocabulary database (A1–C2, with C2 still being populated).
- Learned/bookmarked/still-learning progress tracking with offline-first synchronization.
- Multiple quiz modes: quick practice, level/class-based practice, daily personalized practice, mistake-bank practice, grammar practice, scheduled competitive exams, and topic-based play.
- A structured grammar curriculum (sections → categories → rules) with lesson content, progress, bookmarks, and quizzes.
- Reading content: long-form "Written" articles and a "News/Blog" section.
- Profiles, public profiles, leaderboards, skills profiles, activity tracking, and result-detail pages.
- Contributor workflows for words, quiz questions, grammar rules, and writings.
- A full admin back office for users, vocabulary, quizzes, exams, grammar, writings, blogs, media, popups, email, and visual templates.
- A server-rendered visual template engine with an in-browser Fabric.js canvas editor, QR generation, and on-the-fly PNG rendering.

### 1.2 Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | **Next.js 16.4.3** (App Router) | `output: "standalone"`; webpack build (`next build --webpack`) |
| UI runtime | **React 19.3.0** | Server Components + client islands |
| Language | TypeScript 5 | Strict project configuration |
| Styling | Tailwind CSS 4 + `tw-animate-css` + typography plugin | CSS-first Tailwind v4 configuration |
| Component system | shadcn-style primitives, Radix UI, Mantine 9, `class-variance-authority` | Multiple primitive libraries coexist |
| Icons | `lucide-react` | |
| Animation | `motion`, `lenis` | |
| State | Zustand 5 | Persisted stores, some identity-scoped |
| Offline storage | Dexie 4 (IndexedDB) + localStorage | Guest/user-scoped sync |
| ORM | Prisma **7.10** | `prisma-client` generator; output to `generated/prisma` |
| Database | PostgreSQL | Direct `pg` Pool (`max: 10`) with `@prisma/adapter-pg` |
| Auth | NextAuth 4.24 | Google OAuth only; JWT sessions; Prisma adapter |
| Validation | Zod 4 | Central schema file plus inline parsing |
| Email | Nodemailer 7 | SMTP config stored in DB, templates/logs in DB |
| Media | ImageKit Node SDK | Upload/delete/metadata |
| Rich text | BlockNote (`@blocknote/core`, `/react`, `/mantine`) | Blog and written editors |
| Visual templates | Next.js `ImageResponse` (Satori), Fabric 7, `qrcode` | Canvas editor + server rendering |
| Charts | Recharts 3 | Admin dashboard/profile analytics |
| API docs | Swagger JSDoc + Swagger UI React | `/docs`, `/api/docs` |
| PWA | Serwist 9.5 (`@serwist/next`) | Service worker at `src/app/sw.ts` |
| Logging | Winston + daily rotate file | Server-side logger |
| Toasts | Sonner | |

### 1.3 Repository shape

- Single Next.js application. No monorepo packages/apps structure in the active tree.
- `src/app` contains 225 files: **57 pages**, **7 layouts**, **102 API route handlers**.
- `src/components` contains **153 files**.
- `src/services` contains **26 files**.
- `src/lib` contains **65 files**.
- `prisma/migrations` contains **30 migration directories**.
- There is no root `src/app/layout.tsx`. Four route-group layouts each render the document shell through `HtmlShell`.

### 1.4 Scripts and runtime

`package.json` scripts:

| Script | Command | Meaning |
|---|---|---|
| `dev` | `next dev --webpack` | Development server with webpack |
| `build` | `prisma generate && next build --webpack` | Generates Prisma client and builds |
| `start` | `next start` | Production server |
| `lint` | `eslint` | Lint only |
| `postinstall` | `prisma generate` | Client generation after install |

There are no test scripts, no test configuration, and no CI workflow files in the active workspace. Test files exist only inside `.worktree-upgrade/node_modules` (third-party packages), not in application source.

### 1.5 Environment variables referenced by the code

| Variable | Used for |
|---|---|
| `DATABASE_URL` | Runtime PostgreSQL connection |
| `DATABASE_URL_DEVELOPMENT`, `DATABASE_URL_PRODUCTION` | Environment-specific URLs referenced in configuration/utilities |
| `AUTH_SECRET`, `NEXTAUTH_SECRET` | NextAuth JWT signing/encryption |
| `AUTH_URL`, `NEXTAUTH_URL` | NextAuth base URL |
| `GOOGLE_ID`, `GOOGLE_SECRET` | Google OAuth credentials |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (`https://zeroenglish.org` fallback) |
| `NEXT_PUBLIC_APP_URL` | Alternate app URL |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit server operations |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SMTP_FROM_NAME`, `SMTP_REPLY_TO` | Email transport |
| `RATE_LIMIT_MAX` | Per-IP requests per minute (default 300) |
| `NODE_ENV`, `NEXT_RUNTIME` | Runtime branches |

`.env.example` documents only a subset: auth, database, Google OAuth, and ImageKit. It omits SMTP, rate limiting, and public app/site URL variables. The ImageKit public key and URL endpoint are referenced in the example but not all are read via `process.env` in server code.

### 1.6 Deployment and PWA

- `next.config.ts` sets `output: "standalone"`, security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`), and permanent `/writing` → `/written` redirects.
- Serwist is enabled in production only. It precaches `/offline` and generates `public/sw.js`.
- Service worker strategies:
  - `NetworkFirst` for `/vocabulary*` and `/quiz` pages (4 s network timeout, 128 entries, 60-day expiry).
  - `StaleWhileRevalidate` for static assets/fonts/media (256 entries, 30 days).
  - Document navigation to vocabulary/quiz falls back to `/offline`.
  - `skipWaiting`, `clientsClaim`, navigation preload, reload-on-online.
- `Dockerfile` and `docker-compose.yaml` exist for container deployment.
- `README.md` is stale: it describes a Vite + `apps/`/`packages/` monorepo, not the current Next.js application.

---

## 2. Architecture & Folder Structure

### 2.1 High-level request flow

```
Browser
  │
  ├─ Next.js App Router page (RSC by default)
  │     ├─ (frontend) route group → HtmlShell + Header/Sidebar/Footer
  │     ├─ (admin) route group    → admin shell + sidebar
  │     ├─ (docs) route group     → docs layout
  │     └─ (offline) route group  → offline fallback layout
  │
  ├─ src/proxy.ts (Next.js 16 proxy/middleware)
  │     ├─ in-memory fixed-window rate limit for /api/v1
  │     ├─ CORS allowlist for known origins
  │     ├─ /admin authentication + admin-role gate
  │     └─ /quiz/question/[id] existence rewrite to /__not-found__
  │
  ├─ API route handler (src/app/api/v1/**/route.ts)
  │     ├─ auth guard (requireAuth / requireAdmin / requireContributorOrAdmin)
  │     ├─ Zod validation
  │     ├─ service call (src/services/**)
  │     └─ JSON envelope { data, message, success }
  │
  └─ Service → Prisma → PostgreSQL
```

### 2.2 Route groups

| Group | Layout | Purpose |
|---|---|---|
| `(frontend)` | `src/app/(frontend)/layout.tsx` | Public learning experience: home, vocabulary, quizzes, grammar, written, news, profile, search, static pages |
| `(admin)` | `src/app/(admin)/layout.tsx` | Admin authentication gate and admin shell |
| `(docs)` | `src/app/(docs)/layout.tsx` | Swagger/API documentation UI |
| `(offline)` | `src/app/(offline)/layout.tsx` | Offline fallback page |

Each route-group layout wraps its children in `HtmlShell`. `HtmlShell` is responsible for `<html>`, `<body>`, theme/provider setup, and global metadata. This is why no root layout exists.

### 2.3 Folder map

```
src/
├─ app/
│  ├─ (frontend)/                 Public pages and feature routes
│  │  ├─ vocabulary/              Level hub, level listing, pagination
│  │  ├─ quiz/                    All quiz modes + results
│  │  ├─ grammar/                 Section/category/rule curriculum
│  │  ├─ written/                 Long-form reading hub + article
│  │  ├─ news/                    Blog listing + article
│  │  ├─ profile/                 Own profile, public profile, result details
│  │  ├─ search/                  Vocabulary search
│  │  └─ about, contact, contribute, privacy, login
│  ├─ (admin)/admin/              Back-office pages
│  ├─ (docs)/docs/                Swagger UI
│  ├─ (offline)/offline/          PWA fallback
│  ├─ api/
│  │  ├─ auth/[...nextauth]/      NextAuth handler
│  │  ├─ docs/                    OpenAPI JSON
│  │  └─ v1/                      102 domain API handlers
│  ├─ manifest.ts, robots.ts, sitemap.ts
│  ├─ global-not-found.tsx
│  ├─ sw.ts                       Serwist service worker source
│  ├─ startup.ts, instrumentation.ts
│  └─ html-shell.tsx
├─ components/                    153 UI/feature components
├─ services/                      26 domain services
├─ lib/                           Auth, data, sync, stores, template engine
├─ hooks/                         Client hooks (quiz results, profile tabs, etc.)
├─ utils/                         Prisma client, validation, logger, ImageKit, bulk import
└─ types/                         Shared API and exam types
```

### 2.4 Authentication architecture

- **Provider:** Google OAuth only. No credentials/email-password login route exists even though the `User` model has a nullable `password` field.
- **Session:** JWT strategy, Prisma adapter for account/user persistence.
- **Roles:** `user`, `admin`, `contributor`.
- **Guards:**
  - `src/proxy.ts` gates `/admin` (redirects unauthenticated users to `/login?callbackUrl=...`; non-admins to `/profile`).
  - `src/app/(admin)/layout.tsx` performs a second server-side session/role check.
  - API handlers use `src/lib/api-auth.ts`: `requireAuth` (401), `requireAdmin` (401/403), `requireContributorOrAdmin` (401/403).
  - Some handlers call `getServerSession(authOptions)` directly instead of the shared guard.
- **Role freshness:** the JWT callback re-reads `role`, `name`, and `image` from the database when a token is processed.
- **Guest binding:** `src/lib/bind-intent.ts` and `src/lib/guest-bind.ts` implement a "Continue with Google" flow that arms a short-lived `pending_bind` cookie. On OAuth callback, existing Google accounts are rejected so only new accounts can absorb guest local data.
- **Sign-out:** `POST /api/v1/auth/logout` clears NextAuth cookies via `auth.service.ts`.

### 2.5 Data-access architecture

Three distinct data paths exist:

1. **Server components → Prisma directly or server services**
   - Home, vocabulary pages, grammar pages, written/news pages, leaderboard, public profiles, result details.
   - Used for SEO, ISR, and initial payloads.

2. **Client components → REST API → services → Prisma**
   - Quiz generation/submission, admin CRUD, profile edits, bookmarks/learned, media uploads, templates.

3. **Client-first local state → IndexedDB/localStorage → sync API**
   - Vocabulary progress, activity, quiz history, guest data, offline browsing.
   - `src/lib/idb.ts` defines Dexie schema and scoped tables.
   - `src/lib/sync.ts` performs bidirectional reconciliation with tombstones.

### 2.6 API conventions

Successful JSON responses generally use:

```json
{ "data": ..., "message": "...", "success": true }
```

Errors generally use the same envelope with `success: false` and an HTTP 400/401/403/404/409/429/500 status. A few endpoints return alternate shapes:

- `/api/v1/templates` returns `{ templates: [...] }`.
- Template render endpoints return PNG binary responses.
- `/api/v1/contributor/[id]/certificate` returns PNG binary.
- Some email endpoints return `{ success, message }` without `data`.
- Quiz pool/quick endpoints may return arrays inside `data`.

This inconsistency is documented in Section 7.

### 2.7 Middleware details

`src/proxy.ts`:

- Matcher: `/api/v1/:path*`, `/admin/:path*`, `/quiz/question/:path*`.
- Rate limit: fixed window of 60 seconds, default 300 requests per IP. Uses `x-forwarded-for` first value, then `x-real-ip`, then `"unknown"`. In-memory `Map` capped at 100,000 stale-bucket cleanup.
- CORS: applies `Access-Control-Allow-Origin` only when the request `Origin` exactly matches a host in `src/lib/site-domains.ts` (localhost:3000, localhost:7273, Vercel preview, two custom domains, and `zeroenglish.org`). Credentials allowed.
- Admin gate: `getToken` + role check.
- Quiz question gate: for `/quiz/question/[id]`, validates numeric ID and queries `QuizQuestion` with `isPending: false`; missing/invalid IDs rewrite to `/__not-found__` so the global not-found page returns a real 404 instead of a streamed 200.
- Database failures during the existence check fail open (do not 404 real questions).

### 2.8 Startup and instrumentation

- `src/app/startup.ts` and `src/app/instrumentation.ts` initialize runtime concerns.
- `src/utils/prisma.ts` creates a `pg` Pool (`max: 10`), wraps it with `PrismaPg`, adds a retry wrapper for transient connection errors, and runs `connectionCheck()` on import.
- `dotenv/config` is imported by the auth configuration for non-Next runtimes.

---

## 3. Complete Route & Page Inventory

### 3.1 Page routes (57)

Legend: **Rendering** = ISR/dynamic/static behavior observed in the page file. **Access** = public or gated.

#### Frontend (33)

| # | Route | Rendering | Access | Purpose |
|---|---|---|---|---|
| 1 | `/` | ISR `revalidate = 3600` | Public | Marketing/learning home: hero, level grid, feature highlights, stats |
| 2 | `/vocabulary` | ISR `revalidate = 86400` | Public | Vocabulary hub, level cards, aggregate counts |
| 3 | `/vocabulary/[level]` | ISR `revalidate = 86400` | Public | Level word listing with pagination/filter/sort |
| 4 | `/vocabulary/[level]/[pageNum]` | ISR `revalidate = 86400` | Public | Paginated level listing |
| 5 | `/search` | Client page | Public | Search across vocabulary with filters |
| 6 | `/quiz` | Client shell | Public | Quiz hub (quick, vocabulary, class, daily, mistakes, exam, grammar links) |
| 7 | `/quiz/quick` | Client shell | Public | Quick random quiz |
| 8 | `/quiz/vocabulary` | Client shell | Public | Level/type-based vocabulary practice |
| 9 | `/quiz/class` | Server wrapper + client | Public | Class-filtered quiz |
| 10 | `/quiz/grammar` | Server wrapper + client | Public | Grammar quiz by section/category |
| 11 | `/quiz/daily` | Client shell | Auth required in client | Personalized daily practice |
| 12 | `/quiz/mistakes` | Client shell | Auth required in client | Mistake-bank practice |
| 13 | `/quiz/exam` | Client shell | Public listing; auth to take | Scheduled exam lobby and runner |
| 14 | `/quiz/results` | Client shell | Auth | Combined exam/vocabulary result history |
| 15 | `/quiz/question/[id]` | `force-dynamic` | Public | Single question detail/permalink |
| 16 | `/grammar` | Server page | Public | Grammar curriculum hub |
| 17 | `/grammar/[section]` | Server page | Public | Section overview and categories |
| 18 | `/grammar/[section]/[category]` | Server page | Public | Category lesson list |
| 19 | `/grammar/[section]/[category]/[rule]` | Server page | Public | Rule lesson, examples, progress/bookmark |
| 20 | `/written` | ISR `revalidate = 1800` | Public | Written reading hub |
| 21 | `/written/[slug]` | ISR `revalidate = 1800` | Public | Written article reader |
| 22 | `/news` | ISR `revalidate = 3600` | Public | Blog/news listing |
| 23 | `/news/[slug]` | ISR `revalidate = 3600` | Public | Blog/news article |
| 24 | `/leaderboard` | ISR `revalidate = 300` | Public | Ranked learners |
| 25 | `/profile` | Client page | Auth (client-gated) | Own profile dashboard |
| 26 | `/profile/[id]` | `force-dynamic` | Public | Public user profile |
| 27 | `/profile/quiz-results/[id]` | `force-dynamic` | Auth/ownership | Practice quiz result detail |
| 28 | `/profile/vocabulary-exam-results/[id]` | `force-dynamic` | Auth/ownership | Combined exam/daily result detail |
| 29 | `/contribute` | `force-dynamic` | Auth | Contributor landing and submission entry points |
| 30 | `/about` | Static | Public | About page |
| 31 | `/contact` | Static | Public | Contact page |
| 32 | `/privacy` | Static | Public | Privacy policy |
| 33 | `/login` | Static/client | Public | Google sign-in and guest-bind entry |

#### Admin (22)

| # | Route | Rendering | Access | Purpose |
|---|---|---|---|---|
| 1 | `/admin` | Client page | Admin | Dashboard metrics and shortcuts |
| 2 | `/admin/users` | Client page | Admin | User list, filters, role/status management |
| 3 | `/admin/users/[id]` | `force-dynamic` | Admin | User detail/edit |
| 4 | `/admin/vocabulary` | Client page | Admin | Word CRUD, bulk import, approval |
| 5 | `/admin/quizzes` | Client page | Admin | Quiz question CRUD, bulk import, approval |
| 6 | `/admin/quizzes/types` | Client page | Admin | Quiz type management |
| 7 | `/admin/exams` | Client page | Admin | Exam list/scheduling |
| 8 | `/admin/exams/[id]` | `force-dynamic` | Admin | Exam detail, questions, publishing |
| 9 | `/admin/grammar` | Client page | Admin | Grammar curriculum workspace |
| 10 | `/admin/grammar/section/[id]` | Client page | Admin | Section editor |
| 11 | `/admin/grammar/category/[id]` | Client page | Admin | Category editor |
| 12 | `/admin/grammar/rule/[id]` | Client page | Admin | Rule editor |
| 13 | `/admin/written` | Client page | Admin | Written content list |
| 14 | `/admin/written/[id]` | Client page + nested layout | Admin | BlockNote written editor |
| 15 | `/admin/blog` | Client page | Admin | Blog list |
| 16 | `/admin/blog/[id]` | Client page + nested layout | Admin | BlockNote blog editor |
| 17 | `/admin/media` | Client page | Admin | ImageKit media library/folders |
| 18 | `/admin/popup` | Client page | Admin | Popup campaigns, scheduling, targeting |
| 19 | `/admin/emails` | Client page | Admin | SMTP config, templates, logs, broadcast |
| 20 | `/admin/templates` | Client page | Admin | Visual template list |
| 21 | `/admin/templates/new` | Client page | Admin | Canvas template creator |
| 22 | `/admin/templates/[id]/edit` | Client page | Admin | Canvas template editor |

#### Docs and offline (2)

| # | Route | Rendering | Access | Purpose |
|---|---|---|---|---|
| 1 | `/docs` | Client Swagger UI | Public (robots-disallowed) | API documentation |
| 2 | `/offline` | Static | Public | PWA offline fallback |

### 3.2 Layouts (7)

| Layout | Scope |
|---|---|
| `src/app/(frontend)/layout.tsx` | Frontend document shell, header/sidebar/footer, metadata template |
| `src/app/(admin)/layout.tsx` | Admin auth gate + document shell |
| `src/app/(admin)/admin/layout.tsx` | Admin shell/sidebar wrapper |
| `src/app/(admin)/admin/blog/[id]/layout.tsx` | Blog editor layout |
| `src/app/(admin)/admin/written/[id]/layout.tsx` | Written editor layout |
| `src/app/(docs)/layout.tsx` | Docs document shell |
| `src/app/(offline)/layout.tsx` | Offline document shell |

### 3.3 API route inventory (102)

Legend: **Public** = no session required; **Auth** = any signed-in user; **Contrib** = contributor or admin; **Admin** = admin only. Methods are exported HTTP verbs.

#### System, docs, auth (7)

| Route | Methods | Access | Notes |
|---|---|---|---|
| `/api/auth/[...nextauth]` | NextAuth handler | Public | Google OAuth callbacks |
| `/api/docs` | GET | Public | OpenAPI JSON |
| `/api/v1/health` | GET | Public | Health check |
| `/api/v1/ping` | GET | Public | Lightweight ping |
| `/api/v1/auth/bind/begin` | POST | Public | Arms guest-bind cookie |
| `/api/v1/auth/logout` | POST | Public | Clears auth cookies |
| `/api/v1/quiz-meta` | GET | Public | Quiz metadata/options |

#### Words and vocabulary progress (17)

| Route | Methods | Access | Notes |
|---|---|---|---|
| `/api/v1/words` | GET, PATCH, POST | Admin / Admin / Contrib | Admin list, bulk update, contributor create |
| `/api/v1/words/all` | GET | Public | Full public dataset for IndexedDB cache |
| `/api/v1/words/browse` | GET | Public | Paginated/filterable public browse |
| `/api/v1/words/by-ids` | GET, POST | Public | Fetch public words by ID list |
| `/api/v1/words/version` | GET | Public | Vocabulary dataset version |
| `/api/v1/words/stats` | GET | Public | Aggregate stats |
| `/api/v1/words/learned` | GET, POST | Auth | List/add learned words |
| `/api/v1/words/bookmarks` | GET, POST | Auth | List/add bookmarks |
| `/api/v1/words/still-learning` | GET, POST | Auth | List/add still-learning words |
| `/api/v1/words/daily-activity` | GET | Auth | Daily activity buckets |
| `/api/v1/words/learned-activity` | GET | Auth | Learned activity buckets |
| `/api/v1/words/mine` | GET | Contrib | Contributor's own words |
| `/api/v1/words/mine/[id]` | PUT, DELETE | Contrib | Edit/delete own word |
| `/api/v1/words/[id]` | PUT, DELETE | Admin | Admin edit/delete |
| `/api/v1/words/[id]/learned` | POST, DELETE | Auth | Mark/unmark learned |
| `/api/v1/words/[id]/bookmark` | POST, DELETE | Auth | Add/remove bookmark |
| `/api/v1/words/[id]/still-learning` | DELETE | Auth | Remove still-learning status |

#### Quiz practice and results (16)

| Route | Methods | Access | Notes |
|---|---|---|---|
| `/api/v1/quiz` | GET, PATCH, POST | Admin/Admin/Contrib | Question CRUD |
| `/api/v1/quiz/generate` | POST | Public | Generates practice questions; includes answers for instant feedback |
| `/api/v1/quiz/pool` | GET | Public | Public question pool |
| `/api/v1/quiz/quick` | GET | Public | Random quick quiz |
| `/api/v1/quiz/by-class` | GET | Public | Class-filtered questions |
| `/api/v1/quiz/by-type` | GET | Public | Type-filtered questions |
| `/api/v1/quiz/mistakes` | GET | Auth | Mistake-bank questions |
| `/api/v1/quiz/daily` | GET, POST | Auth | Daily practice status/generation and submission |
| `/api/v1/quiz/results` | GET, POST | Auth | Practice/combined result list/create |
| `/api/v1/quiz/results/[id]` | GET | Auth | Result detail |
| `/api/v1/quiz/mine` | GET | Contrib | Contributor's questions |
| `/api/v1/quiz/mine/[id]` | PUT, DELETE | Contrib | Edit/delete own question |
| `/api/v1/quiz/[id]` | GET, PUT, DELETE | Admin | Admin question detail/edit/delete |
| `/api/v1/quiz/[id]/poster` | GET | Public | Rendered quiz poster image |
| `/api/v1/vocabulary-exam-result` | GET, POST | Auth | Vocabulary exam result list/create |
| `/api/v1/vocabulary-exam-result/[id]` | GET | Auth | Vocabulary exam result detail |

#### Scheduled exams (6)

| Route | Methods | Access | Notes |
|---|---|---|---|
| `/api/v1/quiz-exam` | GET, POST | Admin | List/create exams |
| `/api/v1/quiz-exam/[id]` | GET, PUT, DELETE | Admin | Exam detail/edit/delete |
| `/api/v1/quiz-exam/[id]/publish` | PATCH | Admin | Publish/withhold results |
| `/api/v1/quiz-exam/[id]/take` | GET | Public during window | Returns exam questions with shuffled options, no answers |
| `/api/v1/quiz-exam/[id]/submit` | POST | Auth | Server-graded submission |
| `/api/v1/quiz-exam/scheduled` | GET | Public | Upcoming/open scheduled exams |

#### Quiz types and grammar quizzes (8)

| Route | Methods | Access | Notes |
|---|---|---|---|
| `/api/v1/quiz-type` | GET, POST | Contrib / Admin | Quiz type list/create |
| `/api/v1/quiz-type/[id]` | GET, PUT | Admin | Type detail/edit |
| `/api/v1/grammar-rule` | GET, POST | Admin / Contrib | Legacy grammar rule list/create |
| `/api/v1/grammar-rule/[id]` | GET, PUT, DELETE | Admin (all) | Legacy rule detail/edit/delete |
| `/api/v1/grammar-rule/mine` | GET | Contrib | Contributor's legacy rules |
| `/api/v1/grammar-rule/mine/[id]` | PUT | Contrib | Edit own legacy rule |
| `/api/v1/grammar-rule/options` | GET | Contrib | Form options |
| `/api/v1/grammar-rule/status` | PATCH | Admin | Approve/reject legacy rule |

#### Grammar curriculum (public + admin) (15)

| Route | Methods | Access | Notes |
|---|---|---|---|
| `/api/v1/grammar/sections` | GET | Public | List sections |
| `/api/v1/grammar/sections/[slug]` | GET | Public | Section detail |
| `/api/v1/grammar/categories/[slug]` | GET | Public | Category detail |
| `/api/v1/grammar/rules/[slug]` | GET | Public | Rule detail |
| `/api/v1/grammar/rules/[slug]/progress` | POST | Auth | Mark visited/completed |
| `/api/v1/grammar/rules/[slug]/bookmark` | POST | Auth | Toggle bookmark |
| `/api/v1/grammar/user/rules` | GET, POST | Auth | User progress/bookmark state |
| `/api/v1/grammar/contributor/rules` | GET, POST | Contrib | Contributor rule submissions |
| `/api/v1/grammar/admin/sections` | GET, POST | Admin | Section CRUD |
| `/api/v1/grammar/admin/sections/[id]` | GET, PATCH, DELETE | Admin | Section detail/edit/delete |
| `/api/v1/grammar/admin/categories` | GET, POST | Admin | Category CRUD |
| `/api/v1/grammar/admin/categories/[id]` | GET, PATCH, DELETE | Admin | Category detail/edit/delete |
| `/api/v1/grammar/admin/rules` | GET, POST | Admin | Rule CRUD |
| `/api/v1/grammar/admin/rules/[id]` | GET, PATCH, DELETE | Admin | Rule detail/edit/delete |
| `/api/v1/grammar/admin/rules/bulk` | PATCH | Admin | Bulk publish/status/order updates |

#### Written content (7)

| Route | Methods | Access | Notes |
|---|---|---|---|
| `/api/v1/written` | GET, POST | Public/Contrib | Published list; contributor submission |
| `/api/v1/written/[id]` | GET, PATCH, DELETE | Public/Contrib | Detail; edit/delete own |
| `/api/v1/written/[id]/status` | PATCH | Admin | Approve/reject |
| `/api/v1/written/bulk-status` | PATCH | Admin | Bulk moderation |
| `/api/v1/written/my-submissions` | GET | Contrib | Own submissions |
| `/api/v1/written/types` | GET, POST | Public/Admin | Types list/create |
| `/api/v1/written/types/[id]` | DELETE | Admin | Delete type |

#### Blog/news (3)

| Route | Methods | Access | Notes |
|---|---|---|---|
| `/api/v1/blog` | GET, POST | Admin | Admin list/create (public blog reads use server services) |
| `/api/v1/blog/[id]` | GET, PUT, DELETE | Admin | Admin detail/edit/delete |
| `/api/v1/blog/[id]/publish` | PATCH | Admin | Publish/unpublish |

#### Profile and users (7)

| Route | Methods | Access | Notes |
|---|---|---|---|
| `/api/v1/profile` | GET, PUT | Auth | Own profile read/update |
| `/api/v1/profile/avatar` | POST | Auth | Avatar upload |
| `/api/v1/profile/skills` | GET | Auth or public `userId` | Skills profile |
| `/api/v1/user` | GET, DELETE | Admin | User list / bulk delete |
| `/api/v1/user/[id]` | GET, PUT, DELETE | Admin | User detail/update/delete (self-delete blocked by handler) |
| `/api/v1/user/activity` | POST | Auth | Record activity |
| `/api/v1/contributor/[id]/certificate` | GET | Public | Rendered contributor certificate PNG |

#### Media (3)

| Route | Methods | Access | Notes |
|---|---|---|---|
| `/api/v1/media` | GET, POST | Admin | List/upload media |
| `/api/v1/media/[id]` | PATCH, DELETE | Admin | Update metadata/delete |
| `/api/v1/media/folders` | GET, POST, DELETE | Admin | Derived folder list/create/delete |

#### Popups (3)

| Route | Methods | Access | Notes |
|---|---|---|---|
| `/api/v1/popup` | GET, POST | Admin | List/create |
| `/api/v1/popup/[id]` | GET, PUT, DELETE | Admin | Detail/edit/delete |
| `/api/v1/popup/active` | GET | Public | Active popup for audience/page path |

#### Email (7)

| Route | Methods | Access | Notes |
|---|---|---|---|
| `/api/v1/email/config` | GET, PUT | Admin | SMTP config read (password masked)/update |
| `/api/v1/email/templates` | GET, POST | Admin | Template list/create |
| `/api/v1/email/templates/[key]` | GET, PUT, POST, DELETE | Admin | Template detail/update/test/delete |
| `/api/v1/email/logs` | GET | Admin | Delivery logs |
| `/api/v1/email/test` | POST | Admin | Send test email |
| `/api/v1/email/broadcast` | POST | Admin | Broadcast to users |
| `/api/v1/email/trigger-leaderboard` | POST | Admin | Leaderboard email trigger |

#### Visual templates (3)

| Route | Methods | Access | Notes |
|---|---|---|---|
| `/api/v1/templates` | GET, POST | Public/Admin | List templates; admin create |
| `/api/v1/templates/[id]` | GET, PUT, DELETE | Public/Admin | Detail; admin edit/delete |
| `/api/v1/templates/render` | GET, POST | Public | Render saved or arbitrary template to PNG |

### 3.4 Generated and metadata routes

| Route | Type | Notes |
|---|---|---|
| `/sitemap.xml` | `sitemap.ts` | Home, hubs, live vocabulary levels/pages, published blogs, approved/published writings |
| `/robots.txt` | `robots.ts` | Allows all; disallows `/admin`, `/docs`, `/api`, `/offline`; declares sitemap |
| `/manifest.webmanifest` | `manifest.ts` | PWA metadata and icons |
| `/__not-found__` | Internal rewrite target | Used by proxy to force a real 404 status |
| `/sw.js` | Generated by Serwist | Production service worker |

---

## 4. A-to-Z Feature Breakdown

### 4.1 Authentication and guest onboarding

**Flow**

1. `/login` presents Google sign-in. Optional "Continue with Google" from a guest session first calls `POST /api/v1/auth/bind/begin`, setting an HTTP-only `pending_bind` cookie.
2. NextAuth Google OAuth callback runs. The `signIn` callback checks the bind intent:
   - If armed, it verifies the Google email/provider account does **not** already exist. Existing accounts are rejected.
   - If the account is new, it is created via the Prisma adapter with a generated `user_name`.
3. Guest local data (vocabulary progress, activity, quiz history, scoped stores) is migrated/bound to the new user identity.
4. JWT/session callbacks attach numeric DB user ID and role.
5. Logout clears NextAuth cookies through `auth.service.ts`.

**Observed behavior**

- Only Google OAuth is configured.
- New users default to `isPending: true` on `User`; role defaults to `user`.
- The bind-intent flow uses `AsyncLocalStorage` to isolate concurrent OAuth attempts.
- `login-required.ts` reads a legacy `auth-state` localStorage key to decide whether to prompt login for protected actions.

### 4.2 Vocabulary learning

**Browse and discovery**

- `/vocabulary` shows level cards with aggregate counts and "live" thresholds.
- `/vocabulary/[level]` and `/[pageNum]` list words with pagination, search, category filters, and sort (`default`, `az`, `za`).
- Level pages are ISR with 24-hour revalidation.
- `/search` provides client-side search with result grouping and navigation.
- Word detail is presented in the vocabulary listing components (modal/expanded card patterns) rather than a dedicated `/vocabulary/[word]` route.

**Word data shape**

Each `Word` includes English word, Bangla meanings, synonyms, antonyms, English/Bangla definitions, English/Bangla examples, CEFR level, category, word types, and pending/approved state.

**Progress actions**

- Learned: `POST/DELETE /api/v1/words/[id]/learned`
- Bookmarked: `POST/DELETE /api/v1/words/[id]/bookmark`
- Still learning: `POST/DELETE /api/v1/words/[id]/still-learning`
- Bulk lists: `/api/v1/words/learned`, `/bookmarks`, `/still-learning`
- Activity charts: `/api/v1/words/daily-activity`, `/learned-activity`

**Local-first behavior**

- Actions optimistically update Zustand stores and Dexie.
- `UserWord.learningStatus` is the server source of truth (`LEARNED` / `STILL_LEARNING`).
- `VocabMeta.version` and `/api/v1/words/version` support cache invalidation.
- The `/api/v1/words/all` endpoint exists specifically to hydrate the client IndexedDB dataset.

**Level gating**

- `isLevelLive(total)` decides whether a level is linked and included in the sitemap.
- C2 is intentionally not advertised yet: `site-config.ts` states C2 is still being written, is `noindex`, and is not linked from the level grid.

### 4.3 Quiz system

The application has several distinct quiz runtimes that share question data but differ in generation, scoring, timing, and persistence.

#### Quick quiz (`/quiz/quick`)

- Client fetches random questions from `GET /api/v1/quiz/quick`.
- Immediate feedback in the browser.
- Results stored through the practice-result flow.

#### Vocabulary practice (`/quiz/vocabulary`)

- Level/type/class filters.
- `POST /api/v1/quiz/generate` builds a practice set.
- The response includes correct answers so the client can show instant feedback.
- Client computes score and posts to `/api/v1/quiz/results` (or vocabulary exam result endpoints).
- Practice results are client-trusted; the API only enforces internal consistency.

#### Class practice (`/quiz/class`)

- Server wrapper reads class/search params; client fetches class-filtered questions.
- Same practice scoring model as vocabulary practice.

#### Daily practice (`/quiz/daily`)

- Authenticated, once per local day.
- Nominally **5 vocabulary + 5 grammar questions**, **20 seconds per question**.
- `GET /api/v1/quiz/daily` returns status, streak, reset seconds, and generated questions.
- Generation prioritizes the user's still-learning/mistake history and falls back to public pools.
- `POST /api/v1/quiz/daily` enforces one attempt per day, saves a `CombinedExamResult`, updates the daily streak, and upserts correctly answered words as `LEARNED`.
- Submission hardcodes `questionCount: 10` even if the generated set is smaller.

#### Mistake-bank practice (`/quiz/mistakes`)

- Authenticated.
- `GET /api/v1/quiz/mistakes` returns questions the user previously answered incorrectly.
- Practice results feed back into the mistake bank and learned-word state.

#### Scheduled exams (`/quiz/exam`)

- Public lobby lists scheduled exams via `GET /api/v1/quiz-exam/scheduled`.
- `GET /api/v1/quiz-exam/[id]/take` is available during the scheduled window and returns questions with **shuffled options** and **no answer field**.
- `POST /api/v1/quiz-exam/[id]/submit`:
  - Requires authentication.
  - Grades server-side.
  - Enforces a competitive attempt cap (`MAX_COMPETITIVE_ATTEMPTS = 2`).
  - Applies a submission grace period (`SUBMIT_GRACE_MS = 60_000`).
  - Records first vs. reattempt status and late submissions.
  - Reveals answers only after results are published / exam closes.
- Admin controls publishing through `PATCH /api/v1/quiz-exam/[id]/publish`.

#### Grammar practice (`/quiz/grammar`)

- Questions come from grammar quiz types/sections.
- Client runtime mirrors the practice quiz experience.

#### Results and posters

- `/quiz/results` lists combined exam results.
- `/profile/quiz-results/[id]` shows practice result detail.
- `/profile/vocabulary-exam-results/[id]` shows combined/daily result detail.
- `GET /api/v1/quiz/[id]/poster` renders a shareable quiz poster through the template engine.
- `GET /api/v1/contributor/[id]/certificate` renders a contributor certificate.

### 4.4 Grammar curriculum

**Content hierarchy:** `GrammarSection` → `GrammarCategory` → `GrammarRule`.

- Sections have bilingual titles/descriptions, icon, badge, order, publish state, and an optional JSON learning guide.
- Categories add educational guide fields: headlines, overviews, sentence roles, key types, identification hacks, common traps, accent color.
- Rules include bilingual titles/short descriptions, difficulty (`BEGINNER`/`INTERMEDIATE`/`ADVANCED`), estimated minutes, lesson introduction/summary, formula/pattern, key rules, examples, comparisons, common mistakes, prerequisites, related rules, status, and publish state.
- Public API: sections, categories, rules.
- Authenticated progress:
  - `UserGrammarProgress` tracks visited/completed per user+rule.
  - `UserGrammarBookmark` tracks bookmarks.
  - `POST /api/v1/grammar/rules/[slug]/progress`
  - `POST /api/v1/grammar/rules/[slug]/bookmark`
  - `GET/POST /api/v1/grammar/user/rules`
- Contributor submissions use `/api/v1/grammar/contributor/rules`.
- Admin CRUD is split across `/api/v1/grammar/admin/{sections,categories,rules}`.

**Legacy grammar model**

A second, older grammar system exists in parallel:

- `GrammarRules` (capital R) linked to `QuizType` via `grammarCategoryId`.
- APIs `/api/v1/grammar-rule`, `/grammar-rule/mine`, `/grammar-rule/options`, `/grammar-rule/status`.

This legacy model is not connected to `GrammarSection`/`GrammarCategory`/`GrammarRule`. Both systems are live in the schema and API surface.

### 4.5 Written content

**Public experience**

- `/written` lists approved + published writings.
- `/written/[slug]` renders the article with bilingual/level variants:
  - English easy/medium/hard
  - Bangla easy/medium/hard
- ISR 30 minutes.
- Reader supports language and difficulty selection plus a local "learned" marker.

**Authoring and moderation**

- Contributors submit writings via `POST /api/v1/written`.
- `WrittenStatus`: `PENDING`, `APPROVED`, `REJECTED`; separate `published` boolean.
- Admin moderation: `PATCH /api/v1/written/[id]/status`, `PATCH /api/v1/written/bulk-status`.
- Admin editor at `/admin/written/[id]` uses BlockNote with bilingual content fields.
- Types are managed through `/api/v1/written/types` and `/written/types/[id]`.

**Learned marker**

- Stored in global localStorage key `zeroenglish_learned_writings`, shared across users on the same browser.

### 4.6 News/blog

- `/news` lists published blogs with pagination and SEO metadata.
- `/news/[slug]` renders a blog article with bilingual content and featured media.
- `Blog` includes bilingual titles/descriptions, meta title/description, slug, keywords, English/Bangla content, optional featured media, and `published`.
- Admin listing/editor at `/admin/blog` and `/admin/blog/[id]`.
- Admin API: `POST/PUT/DELETE /api/v1/blog`, `PATCH /api/v1/blog/[id]/publish`.
- Content is rendered with `react-markdown`, `remark-gfm`, and `rehype-sanitize`.
- ISR 1 hour.

### 4.7 Profiles, leaderboard, and analytics

**Own profile (`/profile`)**

- Client dashboard with tabs for overview, vocabulary progress, grammar progress, quiz history, and skills.
- Profile editing: name, username, institution, bio, class, gender, location, social links.
- Avatar upload through `/api/v1/profile/avatar` (ImageKit).
- Activity recording through `POST /api/v1/user/activity`.
- Skills profile through `/api/v1/profile/skills`.

**Public profile (`/profile/[id]`)**

- Dynamic server page.
- Shows public user information, stats, and achievements.
- Does not expose private account fields.

**Leaderboard (`/leaderboard`)**

- ISR 5 minutes.
- Ranks users by learning activity/results.
- Used by the leaderboard email trigger and poster template.

**Result detail pages**

- Practice result detail (`/profile/quiz-results/[id]`) and combined result detail (`/profile/vocabulary-exam-results/[id]`) are dynamic and gated by ownership/session checks in the page/API layer.

### 4.8 Contribution workflows

- `/contribute` is the contributor landing page (server session read, dynamic).
- Contributor capabilities:
  - Submit words: `POST /api/v1/words` (forced `isPending: true`).
  - Submit quiz questions: `POST /api/v1/quiz` (forced `isPending: true`).
  - Submit grammar rules: `/api/v1/grammar/contributor/rules` or legacy `/api/v1/grammar-rule`.
  - Submit writings: `POST /api/v1/written`.
- Contributors can list/edit their own pending content through `/mine` routes.
- Admin approval flips `isPending`, `status`, or `published` flags.
- Public queries filter pending/unapproved content.

### 4.9 Admin back office

**Shell**

- `(admin)/layout.tsx` performs session + role check; `admin/shell.tsx`, `sidebar.tsx`, and nested layouts provide the admin chrome.
- `src/components/Sidebar.tsx` also renders an "Admin Panel" link for every user; access is still blocked by proxy/layout.

**Dashboard (`/admin`)**

- Aggregated counts and shortcuts for vocabulary, quizzes, exams, grammar, content, users, media, email, and templates.

**Users**

- List with search/filter/role display; detail page for editing role, profile fields, and status.
- API supports admin list, detail, update, delete; users can delete their own account through `DELETE /api/v1/user`.

**Vocabulary**

- Full CRUD, bulk JSON import (`.json`, max 5 MB, max 10,000 rows), bulk approval/pending updates, status filters.
- Page fetches the dataset and paginates/filters client-side.

**Quizzes**

- Question CRUD, bulk import, bulk status/difficulty/type updates.
- Quiz type management (`/admin/quizzes/types`).
- Page fetches the full question set and filters/paginates client-side.

**Exams**

- Create/edit exams, attach questions, set mode, levels, question count, time per question, schedule window, and publish results.
- Exam detail shows linked questions and attempt/result information.

**Grammar**

- Section/category/rule workspaces with structured educational fields.
- Bulk rule operations.
- Legacy grammar rule management remains available through APIs, with limited UI exposure.

**Written and blog**

- BlockNote editors with bilingual fields, metadata, media selection, preview, and moderation.

**Media**

- ImageKit-backed library with upload, metadata editing (alt, caption, tags), delete, and derived folders.
- Folder operations are logical path-based, not a separate folder table.

**Popups**

- Campaign CRUD with active flag, link, landscape/portrait media, scheduling, audience, page rules, include paths, and animation.
- Public `GET /api/v1/popup/active` resolves the popup for the current audience/path.

**Email**

- SMTP configuration (password masked on read; verified before save).
- Template CRUD with variables and active/auto-trigger flags.
- Test send, broadcast, logs, and leaderboard trigger.
- SMTP credentials stored in `EmailConfig` in the database.

**Templates**

- List/create/edit visual templates.
- Canvas editor with drag/drop, property panel, field panel, media modal, preview, context menu, Fabric adapter, fonts, and QR codes.
- Server rendering via `ImageResponse` to PNG.

### 4.10 Visual template engine

**Definition model**

A template has width, height, background color/image, and an array of elements. Element types include text, dynamic text, image, shape, QR, and grouping/layout helpers. Dynamic fields are resolved from domain data.

**Registry and resolvers**

- `src/lib/template-engine/types.ts` defines the schema.
- `registry.ts` registers template types and fields.
- `resolver/` contains resolvers for quiz posters, contributor certificates, vocabulary posters, leaderboards, achievements, course certificates, event posters, social posts, and announcements.
- `fonts.ts` downloads Google Fonts (Inter, Hind Siliguri, requested families) and caches font buffers in memory.
- QR codes are precomputed in `prepareTemplateElements`.

**Rendering**

- `renderer/index.tsx` uses Next.js `ImageResponse` (Satori).
- Dimensions are clamped to 200–2400 px.
- PNG responses set `Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800`.
- `GET /api/v1/templates/render` renders a saved/default template with resolved data.
- `POST /api/v1/templates/render` renders an arbitrary unsaved template payload (used by the editor preview).

**Editor**

- `/admin/templates/new` and `/admin/templates/[id]/edit`.
- `canvas-editor.tsx`, `property-panel.tsx`, `field-panel.tsx`, `media-modal.tsx`, `preview-modal.tsx`, `canvas-context-menu.tsx`, `fabric-adapter.ts`.
- Supports live preview, media selection, field binding, layering, and save/update.

### 4.11 Offline and synchronization

**IndexedDB (`ZeroEnglishDB`)**

Tables:

| Table | Key | Purpose |
|---|---|---|
| `words` | `id` | Cached vocabulary dataset |
| `progress` | `[scope+wordId+type]` | Learned/bookmarked/still-learning rows with `synced` and `deleted` tombstones |
| `activity` | `[scope+date]` | Daily activity counts |
| `quizHistory` | `[scope+id]` | Local quiz history linked to server result IDs |
| `metadata` | `key` | Sync metadata/version |

**Scopes**

- Guest: `guest` / `anon`.
- Authenticated: `google:<userNamespace>`.
- Legacy `google|...` scopes are migrated to `google:...`.

**Migration history**

- v1: words, progress, metadata.
- v2: activity table + localStorage activity migration.
- v3: quiz history table + legacy history migration.
- Additional migrations move scoped localStorage into IndexedDB and clean legacy keys.

**Sync (`src/lib/sync.ts`)**

- Reads local dirty rows and pushes add/remove operations to server endpoints.
- Pulls server learned/bookmarks/still-learning state and merges.
- Deletions use tombstones so a removed item is not resurrected by a pull.
- Identity switching isolates data through scopes.
- Guest data is transferred to a newly bound account.

**Service worker**

- Offline fallback for vocabulary/quiz document navigations.
- Network-first page caching and stale-while-revalidate asset caching.
- Disabled in development to avoid stale local assets.

### 4.12 Search, SEO, and content discovery

- `/search` client search over vocabulary.
- `sitemap.ts` includes static hubs, live levels and their pagination, published blogs, and approved/published writings.
- `robots.ts` disallows admin/docs/API/offline and declares the sitemap.
- Canonical metadata and Open Graph assets are centralized in `site-config.ts`.
- Page titles use the `%s | Zero English` template from the frontend layout.
- Blog/written content is server-rendered for crawlers.
- `llms.txt` is present in `public/`.
- The site explicitly avoids claiming Oxford affiliation; it attributes the headword source.

### 4.13 Misc

- `GET /api/v1/health` and `/api/v1/ping` provide liveness checks.
- `/docs` renders Swagger UI from `/api/docs`.
- `global-not-found.tsx` provides a branded 404.
- `/offline` provides a usable offline page.
- Email templates/logs support operational messaging.
- Popup campaigns support scheduled announcements.

---

## 5. Backend, APIs & Data Layer

### 5.1 Service layer inventory (26 files)

| Service | Responsibility |
|---|---|
| `word.service.ts` | Word CRUD, bulk import/update, public shapes, learned/bookmarked/still-learning mutations, activity buckets, versioning, stats |
| `user.service.ts` | User CRUD, profile updates, skills profile, activity, leaderboard queries |
| `quiz.service.ts` | Quiz question CRUD, bulk import/update, public/admin serialization, paging |
| `quiz-exam.service.ts` | Exam scheduling, question linking, publishing, admin payloads |
| `quiz-result.service.ts` | Combined result creation, idempotency, attempt status, detail queries |
| `daily-practice.service.ts` | Daily generation, streak calculation, submission, learned-word upserts |
| `mistake-bank.service.ts` | Mistake aggregation and question selection |
| `quiz-generation.service.ts` | Practice question composition |
| `quiz-type.service.ts` | Quiz type CRUD |
| `vocabulary-exam-result.service.ts` | Vocabulary/combined result list/detail |
| `grammar.service.ts` | Sections/categories/rules, progress/bookmarks, fallbacks |
| `grammar-rule.service.ts` | Legacy grammar rule CRUD/moderation |
| `written.service.ts` | Written content CRUD, moderation, public listing |
| `blog.service.ts` | Blog CRUD, publishing, public listing |
| `media.service.ts` | ImageKit upload/list/update/delete |
| `media-folder.service.ts` | Derived folder listing/creation/deletion |
| `popup.service.ts` | Popup CRUD and active resolution |
| `template.service.ts` | Template CRUD and default lookup |
| `email.service.ts` | SMTP config, templates, logs, sending, broadcasts |
| `auth.service.ts` | Logout/cookie clearing |
| `avatar.service.ts` | Avatar upload handling |
| `health.service.ts` | Health checks |
| `ping.service.ts` | Ping |
| `quiz-meta` / related helpers | Metadata/options |
| `template-render` integration | Renderer/resolver usage |

### 5.2 Prisma schema

**Generator and datasource**

- `provider = "prisma-client"`, output `../generated/prisma`.
- PostgreSQL datasource; URL supplied at runtime via `DATABASE_URL`.

**Models (28)**

| Domain | Models |
|---|---|
| Vocabulary | `Word`, `UserWord`, `UserBookmark`, `VocabMeta` |
| Quiz practice | `QuizQuestion`, `QuizType`, `CombinedExamResult`, `QuizExam`, `QuizExamQuestion` |
| Grammar | `GrammarSection`, `GrammarCategory`, `GrammarRule`, `UserGrammarProgress`, `UserGrammarBookmark`, `GrammarRules` (legacy) |
| Content | `Written`, `WrittenType`, `Blog` |
| Media | `Media` |
| Popups | `Popup` |
| Templates | `VisualTemplate` |
| Email | `EmailConfig`, `EmailTemplate`, `EmailLog` |
| Identity | `User`, `Account`, `Session`, `VerificationToken` |

**Enums (13)**

`Roles`, `Levels`, `LearningStatus`, `QuizMode`, `QuizResultStatus`, `DifficultyLevels`, `Class`, `Gender`, `grammarRuleStatus`, `WrittenStatus`, `GrammarDifficulty`, `TemplateType`, `EmailStatus`.

**Key relationships and constraints**

- `Word.word` is unique; indexed by level and category.
- `UserWord` and `UserBookmark` use composite primary keys `[userId, wordId]`.
- `GrammarRule` self-relations: prerequisites, prerequisitesFor, relatedRules, relatedRulesFor.
- `GrammarSection` → `GrammarCategory` → `GrammarRule` cascade on delete.
- `QuizExamQuestion` composite PK `[quizExamId, questionId]`.
- `CombinedExamResult` links users, quiz type, optional exam, correct/incorrect words, and correct/incorrect questions.
- `QuizQuestion.answer` is stored server-side.
- `Media` is referenced by blogs, popups (landscape/portrait), and template backgrounds with `SetNull` on delete.
- `EmailConfig` and `VocabMeta` use fixed `id = 1` singleton rows.
- `User.email` is unique; `Account` enforces `[provider, providerAccountId]` uniqueness.
- `VisualTemplate` is indexed by `[type, isActive]`.

**Indexes**

Notable indexes: `Word(level)`, `Word(category)`, `UserWord(userId)`, `UserBookmark(userId, bookmarkedAt)`, `GrammarRule(categoryId, difficulty, order, status+isPublished)`, `UserGrammarProgress(userId, isCompleted)`, `UserGrammarBookmark(userId, bookmarkedAt)`, `Blog(published, createdAt)`, `Media(createdAt)`, `Popup(active, scheduleEnabled)`, `EmailLog(recipientEmail)`, `EmailLog(status, sentAt)`, `EmailLog(templateKey)`, `VisualTemplate(type, isActive)`.

### 5.3 Validation

- Central Zod schemas in `src/utils/validation/zod.ts`.
- Schemas cover words, bulk word imports, quiz questions, bulk quiz imports/updates, exam creation/submission, daily practice, combined exam results, grammar rules, written content, blog, templates, media, popups, email, and profile updates.
- Bulk imports enforce `.json`, max 5 MB, max 10,000 rows (`src/utils/bulk-import.ts`).
- Some admin/template/email endpoints validate manually rather than through Zod.

### 5.4 API behavior details

**Words**

- `GET /api/v1/words` is **admin-only** and supports `page`/`limit` or `bulk=true`.
- Public reads use `/words/all`, `/words/browse`, `/words/by-ids`, `/words/version`, `/words/stats`.
- Contributor-created words are forced to `isPending: true`.
- Admin bulk PATCH can toggle pending state.

**Quiz questions**

- `GET /api/v1/quiz` admin-only; supports paging or full set.
- `POST` contributor/admin; contributors forced to pending.
- Bulk import/update supported.
- Public practice pools are exposed through `/quiz/generate`, `/quiz/pool`, `/quiz/quick`, `/quiz/by-class`, `/quiz/by-type`.

**Exams**

- Admin CRUD.
- Scheduled public listing returns only exams with `scheduleEnabled`, closing time in the future.
- Take endpoint validates the time window, filters pending questions, shuffles options, and omits answers.
- Submit endpoint requires auth, grades, enforces attempts/grace, and records status.

**Results**

- Practice results are client-computed. `/api/v1/quiz/results` validates internal consistency (score matches counts within 5 percentage points, total ≤ 200, time per word ≤ 600) but does not re-grade answers.
- Combined/vocabulary result creation uses a global `clientId` lookup for idempotency.
- `clientId` has no database unique constraint.

**Grammar**

- Public queries filter published/approved content.
- Progress/bookmark endpoints require auth.
- Admin routes use `requireAdmin`.
- Contributor routes use `requireContributorOrAdmin`.

**Written/blog**

- Public listing filters `published` and, for writings, `status = APPROVED`.
- Contributor edits are restricted to ownership.
- Admin status changes and bulk moderation.
- `GET /api/v1/blog` and `GET /api/v1/blog/[id]` are admin-only; public news pages read blogs through `blog.service.ts` directly, not through the API.

**Media**

- Upload/list/metadata/delete require admin.
- ImageKit deletion failures are surfaced.
- Folders are derived from file paths.

**Email**

- Config read masks the password (`••••••••`), returns `hasPassword`.
- Saving verifies SMTP connectivity before persisting.
- Password is stored in the database (no encryption at rest in the model).
- Logs record recipient, template key, subject, status, error, metadata, and timestamp.

**Templates**

- `GET /api/v1/templates` is public and can return all templates, including inactive ones unless `isActive` is supplied.
- `POST/PUT/DELETE` require admin.
- `GET/POST /api/v1/templates/render` are public and generate PNGs.
- Rendering loads remote Google Fonts and may load arbitrary background image URLs from the template payload.

### 5.5 External integrations

| Integration | Usage |
|---|---|
| Google OAuth | Sign-in |
| ImageKit | Media upload/delete, avatar, blog featured images, popup media, template backgrounds |
| SMTP (Nodemailer) | Config, templates, test, broadcast, logs, leaderboard trigger |
| Google Fonts | Server-side template font downloads |
| Next.js ImageResponse | PNG rendering |
| QR Code | Template QR elements |
| Swagger | API docs |

### 5.6 Migrations

- 30 migration directories, including:
  - Combined exam/exam relation.
  - Word authoring and pending state.
  - Legacy grammar rules.
  - Written model.
  - Email/templates/media/popup/visual templates.
- `prisma/migrations/migration_lock.toml` present.
- No seed script is configured in `package.json`.

### 5.7 Error handling and logging

- Services generally return `{ success, message, data }` rather than throwing to routes.
- Routes map service failures to 400/500.
- `logger` (Winston) logs validation failures, database failures, email operations, and template rendering errors.
- Some catch blocks swallow errors and return generic messages.
- Template renderer logs to `console.error`.
- There is no centralized error boundary beyond Next.js defaults and `global-not-found.tsx`.

---

## 6. UI/UX, State & Performance Mechanics

### 6.1 Layout and navigation

- Frontend shell: header, collapsible sidebar, footer, theme provider, language provider, toaster, top loader.
- Sidebar state persisted in localStorage (`sidebar-provider.tsx`).
- Language provider persists English/Bangla preference in localStorage.
- Header shows a dismissible banner using localStorage (`BANNER_STORAGE_KEY`).
- Admin shell has its own sidebar and content area.
- Responsive behavior uses Tailwind breakpoints; sidebar collapses to mobile patterns.
- Theme support via `next-themes` (light/dark/system).

### 6.2 State layers

| Layer | Technology | Scope | Examples |
|---|---|---|---|
| Server state | RSC props / Prisma | Request | Vocabulary pages, grammar pages, blog/written, leaderboard |
| Global client state | Zustand | App session | Auth store, word store, quiz store, level store, profile store |
| Persisted client state | Zustand persist + localStorage | Identity-scoped | Words, daily goals, quiz activity/history, profile tabs |
| Offline database | Dexie/IndexedDB | Identity-scoped | Progress, activity, quiz history, cached words |
| Ephemeral UI state | React state/context | Component | Quiz runtime, modals, editors |
| URL state | Search params | Route | Pagination, level filters, quiz configuration |

### 6.3 Identity scoping

- `createScopedLocalStorage` stores an entire identity's persisted stores under `zero_english:<scope>` (`guest` or numeric user ID).
- Switching identities does not leak other users' scoped Zustand data.
- IndexedDB rows carry an explicit `scope`.
- Exceptions: grammar progress and written "learned" state use global localStorage keys.

### 6.4 Quiz runtime mechanics

- Practice runtimes are client-driven: question index, selected answer, timer, score, and immediate feedback live in React/Zustand.
- Scheduled exams are server-driven: questions fetched without answers, answers graded on submit.
- Daily practice enforces one attempt per day and a 20-second-per-question blitz.
- Mistake-bank and class quizzes reuse the practice runtime.
- Results are written locally first, then synced to the server; `clientId` provides idempotency.
- Exam attempts are serialized per exam with a row lock (`SELECT ... FOR UPDATE`) to prevent concurrent first-attempt races.

### 6.5 Caching and rendering

| Surface | Strategy |
|---|---|
| Home | ISR 1 hour |
| Vocabulary hub/levels | ISR 24 hours |
| Written | ISR 30 minutes |
| News | ISR 1 hour |
| Leaderboard | ISR 5 minutes |
| Profile/result pages | Dynamic |
| Admin detail pages | Dynamic where marked |
| API GETs | Mostly dynamic; some rely on Next fetch/cache behavior |
| Static assets | Service worker stale-while-revalidate |
| Vocabulary/quiz pages | Service worker network-first with offline fallback |

### 6.6 Bundle and runtime characteristics

Heavy client dependencies include:

- Fabric (canvas editor).
- BlockNote + Mantine (editors).
- Recharts (charts).
- Swagger UI (docs).
- Framer Motion (`motion`) and Lenis.
- QR code generation.

These are mostly isolated to admin/docs routes, but shared layout providers and client components can pull some into the main bundle. No bundle-analyzer script is configured.

### 6.7 SEO and metadata

- Centralized site title/description/OG image in `site-config.ts`.
- Per-page metadata for major routes.
- JSON-LD/structured data exists on content pages (About/contact references in site config comments).
- Sitemap excludes non-live levels and pending content.
- Robots disallows admin/docs/API/offline.
- `llms.txt` present.
- Written/news articles are server-rendered and indexable.
- Profile and quiz result pages are not explicitly disallowed in robots; they are dynamic and may be crawlable if linked.

### 6.8 Accessibility and UX observations

- shadcn/Radix primitives generally provide keyboard/focus behavior.
- Quiz timers and answer states need `aria-live`/focus management; some custom quiz UIs use div-based controls.
- Canvas editor is mouse/touch-centric; no clear keyboard alternative for element manipulation.
- Language toggle is persistent but not synced to the user profile.
- Loading states exist via `loading.tsx` boundaries and skeletons in major pages.
- Error/empty states exist for most lists and quizzes.

---

## 7. Audit Observations

This section documents what exists, what is incomplete, and what appears risky. **No fixes were applied.** Severity is an audit judgment based on impact and likelihood.

### 7.1 Confirmed incomplete or stubbed features

| ID | Observation | Evidence | Impact |
|---|---|---|---|
| I-01 | **C2 level is intentionally incomplete** | `site-config.ts` comments; `isLevelLive` gating; level grid/sitemap exclusion | Users cannot browse C2; marketing copy correctly says A1–C1 |
| I-02 | **Legacy grammar system remains live alongside the new one** | Prisma `GrammarRules` vs. `GrammarRule`; `/grammar-rule/*` APIs | Duplicate concepts, unclear source of truth, maintenance burden |
| I-03 | **`ProfileCard()` exported component returns `null`** | `src/components/profile-card.tsx` line ~252 | Dead/stub export; confusing API |
| I-04 | **No tests, test runner, or CI workflow** | `package.json` scripts; no test config in active workspace | Regressions are not automatically caught |
| I-05 | **No seed script** | `package.json`; `prisma/` | Fresh environments need manual data setup |
| I-06 | **README describes a different repository layout** | `README.md` references Vite/apps/packages | Onboarding/deployment documentation is misleading |
| I-07 | **`.env.example` omits runtime variables** | SMTP, `RATE_LIMIT_MAX`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL` | Deployments can silently use defaults/empty credentials |
| I-08 | **`Dockerfile` copies `./data`** | Dockerfile lines ~42 and ~66 | Build fails if `data/` is absent (none present at audit time) |
| I-09 | **Public grammar rule API/pages coexist with admin-only legacy routes** | `/api/v1/grammar-rule/[id]` requires admin for GET | Inconsistent access model between two grammar systems |

### 7.2 Bugs and data-integrity risks

| ID | Observation | Evidence | Impact |
|---|---|---|---|
| B-01 | **Practice results are client-computed and only consistency-checked** | `/api/v1/quiz/results` comment + checks; `/quiz/generate` returns answers | Users can forge scores within consistency bounds; leaderboard/result integrity is weak |
| B-02 | **`clientId` idempotency is global, not user-scoped** | `quiz-result.service.ts` `findFirst({ where: { clientId } })`; `daily-practice.service.ts` same | A reused/guessed client ID returns another user's stored result (data leak + wrong idempotency) |
| B-03 | **`clientId` has no DB unique constraint** | Prisma `CombinedExamResult.clientId String?`; code handles `P2002` that cannot occur | Concurrent requests can create duplicate results |
| B-04 | **Daily practice hardcodes `questionCount: 10`** | `daily-practice.service.ts` line ~573; generation may return fewer | Stored result metadata can disagree with actual questions |
| B-05 | **Daily practice "already completed" check examines only the last 10 results** | `submitDailyPracticeResult` query `take: 10` | Edge-case duplicate daily attempts after many results |
| B-06 | **Grammar progress is global localStorage** | `src/lib/grammar-progress.ts` key `zero_grammar_progress_v1` | Different users on the same browser share grammar progress |
| B-07 | **Written "learned" state is global localStorage** | `zeroenglish_learned_writings` in reader/card | Different users share learned writings |
| B-08 | **`Sidebar` shows "Admin Panel" to every user** | `src/components/Sidebar.tsx` link to `/admin` without role check | Non-admins see a dead-end link (proxy redirects) |
| B-09 | **ProfileCard dead export** | See I-03 | No runtime effect, but misleading |
| B-10 | **`QuizQuestion` and `Word` pending flags must be filtered everywhere** | Public queries use `isPending: false`; any missed query leaks unreviewed content | Contributor content can leak if a new query forgets the filter |
| B-11 | **Template `GET /api/v1/templates` exposes inactive templates** | Route only filters when `isActive` query is present | Admin/draft templates may be publicly enumerable |
| B-12 | **Template renderer accepts arbitrary background URLs** | `adapter.tsx` `<img src={template.backgroundMediaUrl}>`; POST render is public | Potential SSRF/resource abuse via server-side image fetch |
| B-13 | **No DB-level unique guard for quiz attempt races** | Exam uses row lock, but `clientId` path does not | Duplicate idempotent writes under concurrency |

### 7.3 Security and privacy risks

| ID | Observation | Evidence | Impact |
|---|---|---|---|
| S-01 | **Global `clientId` lookup can return another user's result** | B-02 | Privacy leak if client IDs are reused or guessable |
| S-02 | **Scheduled exam questions are publicly retrievable during the window** | `GET /api/v1/quiz-exam/[id]/take` has no auth | Non-users can read exam content; answers remain hidden and grading is server-side |
| S-03 | **Rate limiting is per-process and IP-header-based** | `proxy.ts` in-memory Map; trusts `x-forwarded-for` first value | Bypassable via spoofed headers; ineffective across replicas |
| S-04 | **CORS allowlist includes development and preview hosts in production code** | `site-domains.ts` | Preview/localhost origins are trusted if reachable |
| S-05 | **SMTP password stored in plaintext in DB** | `EmailConfig.smtpPass`; `email.service.ts` | Database compromise exposes mail credentials |
| S-06 | **Public arbitrary template rendering** | `POST /api/v1/templates/render` unauthenticated | CPU/memory abuse, SSRF via image URL, font-fetch amplification |
| S-07 | **No CSRF tokens on custom cookie-authenticated POST/PUT/DELETE APIs** | API routes rely on NextAuth cookies; SameSite defaults | Cross-site request risk depends on cookie SameSite policy and CORS |
| S-08 | **Profile skills endpoint accepts arbitrary `userId`** | `/api/v1/profile/skills?userId=` returns any user's skills | Public exposure of aggregated profile data (may be intentional) |
| S-09 | **Result detail pages rely on page-level auth/ownership checks** | Dynamic pages; APIs separately guarded | Any missed check exposes another user's result |
| S-10 | **Password field exists but no password auth** | `User.password String?`; Google-only provider | Unused sensitive field increases schema ambiguity |

### 7.4 Performance and scaling concerns

| ID | Observation | Evidence | Impact |
|---|---|---|---|
| P-01 | **Admin vocabulary page fetches the entire dataset** | `/api/v1/words?bulk=true`; client filtering/pagination | Slow admin load and memory growth as vocabulary grows |
| P-02 | **Admin quiz page fetches all questions** | `/api/v1/quiz` without paging; client filtering | Same scaling issue |
| P-03 | **`/api/v1/words/all` returns the complete public dataset** | `getAllPublicWords()` | Large payload on first load; IndexedDB hydration cost |
| P-04 | **Full sitemap queries up to 500 blogs and 1,000 writings per request** | `sitemap.ts` | Slow sitemap generation at scale |
| P-05 | **JWT callback re-queries the user on token processing** | `auth.ts` `jwt` callback | Extra DB round-trip per authenticated request path |
| P-06 | **In-memory rate-limit Map cleanup only at 100k entries** | `proxy.ts` | Memory growth under many unique IPs |
| P-07 | **Template rendering downloads fonts and fetches images per cold cache** | `fonts.ts`, `adapter.tsx` | High latency/CPU for uncached renders; public endpoint amplifies |
| P-08 | **Heavy dependencies in shared/client graph** | Fabric, BlockNote, Recharts, Swagger UI | Potential bundle bloat outside admin/docs |
| P-09 | **ISR 24h vocabulary pages may serve stale counts/content** | `revalidate = 86400` | Updates take up to a day unless revalidated |
| P-10 | **No pagination on some admin/API list endpoints** | Various `GET` handlers | Large responses and slow client rendering |

### 7.5 SEO, content, and metadata

| ID | Observation | Evidence | Impact |
|---|---|---|---|
| SEO-01 | **C2 excluded from sitemap and links** | `sitemap.ts`, `isLevelLive`, site config | Intentional; avoids indexing incomplete content |
| SEO-02 | **Profile/result pages are not disallowed in robots** | `robots.ts` only blocks admin/docs/api/offline | Potentially indexable private-looking pages if linked |
| SEO-03 | **README and site narrative can drift** | README stale; site-config comments acknowledge past claims | Documentation/SEO consistency risk |
| SEO-04 | **`llms.txt` present but not referenced from robots/sitemap** | `public/llms.txt` | Discoverability depends on direct access |
| SEO-05 | **Sitemap `lastModified` omitted for static routes** | `sitemap.ts` comment | Honest but less informative for crawlers |

### 7.6 Code quality and maintainability

| ID | Observation | Evidence | Impact |
|---|---|---|---|
| Q-01 | **Duplicate grammar domain models** | See I-02 | Schema/API confusion |
| Q-02 | **Two auth-guard styles** | `api-auth.ts` helpers vs. inline `getServerSession` in email, exam, quiz-type, blog, and template routes | Inconsistent error shapes (401 vs. 403, `{error}` vs. `{success}`) |
| Q-03 | **Inconsistent API response envelopes** | `{data,message,success}`, `{templates}`, `{error}`, raw text/PNG | Client handling complexity |
| Q-04 | **Mixed file naming conventions** | `PascalCase` components, kebab-case files, `Sidebar.tsx`/`Header/` | Discoverability friction |
| Q-05 | **Some routes validate manually** | Email/template endpoints | Validation gaps and inconsistent messages |
| Q-06 | **Dead/stub exports** | `ProfileCard()` | Confusion |
| Q-07 | **No client error boundaries** | No `error.tsx` files exist; only `loading.tsx` and `not-found.tsx` | Runtime errors fall back to Next.js defaults instead of branded recovery UI |
| Q-08 | **No test coverage** | See I-04 | Regression risk |
| Q-09 | **Stale README and env docs** | See I-06/I-07 | Operational risk |

### 7.7 Deployment and operations

| ID | Observation | Evidence | Impact |
|---|---|---|---|
| D-01 | **Docker build expects `./data`** | `Dockerfile` COPY lines | Build failure in clean checkouts |
| D-02 | **Standalone output + Serwist** | `next.config.ts` | Requires correct static/public copying in container |
| D-03 | **In-memory rate limiter not suitable for multi-replica** | `proxy.ts` comment | Horizontal scaling weakens abuse protection |
| D-04 | **SMTP config stored in DB and verified on save** | Email service/routes | Operational coupling; bad credentials block save |
| D-05 | **No migrations/seed step in Docker entrypoint documented** | Dockerfile/compose | Deployment requires external migration process |
| D-06 | **Environment-specific DB URLs referenced but runtime uses `DATABASE_URL`** | `utils/prisma.ts`; env grep | Misconfiguration risk |
| D-07 | **No health check wiring visible in compose** | `docker-compose.yaml` | Orchestrators may not detect unhealthy app |

### 7.8 UX and product observations

| ID | Observation | Evidence | Impact |
|---|---|---|---|
| UX-01 | **Admin link visible to all users** | Sidebar | Dead-end for non-admins |
| UX-02 | **Cross-user grammar/written progress on shared devices** | Global localStorage keys | Confusing/incorrect progress |
| UX-03 | **Daily practice question count can mismatch stored metadata** | Hardcoded 10 | Results may show 10 when fewer were answered |
| UX-04 | **Practice quiz answers are available client-side** | `/quiz/generate` response | Cheating is trivial in practice modes |
| UX-05 | **Exam lobby is public; taking requires auth** | Exam pages/routes | Clear funnel, but public question exposure |
| UX-06 | **Canvas editor is pointer-centric** | Fabric adapter | Limited keyboard accessibility |
| UX-07 | **Language preference is local-only** | `language-provider.tsx` | Not synced across devices |
| UX-08 | **Offline scope limited to vocabulary/quiz documents** | `sw.ts` matchers | Other routes fail offline despite PWA install |

### 7.9 Positive controls worth preserving

These are confirmed strengths, not defects:

- Pending contributor content is consistently filtered from public word/quiz feeds.
- Exam answers are withheld from the take payload and grading is server-side.
- Exam submissions are serialized per exam with a row lock and attempt/grace rules.
- Guest binding rejects existing accounts, preventing account takeover via guest-data merge.
- CORS is allowlisted rather than wildcard.
- Identity-scoped Zustand persistence prevents cross-user client-state leakage for most stores.
- Dexie tombstones prevent deleted progress from being resurrected during sync.
- Admin access is enforced twice (proxy and layout) and separately in APIs.
- Sitemap excludes non-live levels and unapproved content.
- Security headers and permanent redirects are configured.
- PWA offline fallback is scoped to the highest-value learning routes.

---

## Audit Verification

At the end of the audit:

- `APPLICATION_AUDIT.md` is the only new file created.
- No existing tracked file was modified, deleted, renamed, or reformatted.
- No dependency, lockfile, configuration, or generated artifact was changed.
- Verification method: `git status --short` plus a direct existence check of this file.

```
$ git status --short
?? APPLICATION_AUDIT.md
```

If this file is removed, the working tree returns to its pre-audit state.

---

*End of audit.*
