# Zero English — UI Rebuild Brief & Stitch Prompt Pack

A complete, screen-by-screen design brief for rebuilding the Zero English interface in **Google Stitch**.

Every screen below has a copy-paste prompt. The prompts are written to be pasted **one at a time** into Stitch, after the master prompt and the shared shell prompts have established the visual language.

> **Do not invent features.** Zero English is a bilingual (Bangla-first) English-learning app: vocabulary, grammar, quizzes, exams, writing practice, news, leaderboard, profiles, contributions, and an admin back office. There is no chat, social feed, payments, AI tutor, video lessons, classroom management, or subscription tier. See [§14 Out of scope](#14-out-of-scope).

---

## Table of contents

1. [How to use this brief in Stitch](#1-how-to-use-this-brief-in-stitch)
2. [Product snapshot](#2-product-snapshot)
3. [Art direction](#3-art-direction)
4. [Design system](#4-design-system)
5. [Master Stitch prompt](#5-master-stitch-prompt-copy-paste-first)
6. [Global shell prompts](#6-global-shell-prompts)
7. [Navigation map](#7-navigation-map)
8. [Public & learner screens](#8-public--learner-screen-prompts)
9. [Admin screens](#9-admin-screen-prompts)
10. [Core user flows](#10-core-user-flows)
11. [State matrix](#11-state-matrix)
12. [Responsive rules](#12-responsive-rules)
13. [Accessibility & bilingual rules](#13-accessibility--bilingual-rules)
14. [Content voice & microcopy](#14-content-voice--microcopy)
15. [Out of scope](#15-out-of-scope)
16. [Screen checklist](#16-screen-checklist)
17. [Stitch consistency pass](#17-stitch-consistency-pass)

---

## 1. How to use this brief in Stitch

### Workflow

1. Create a new Stitch project named **Zero English — UI Rebuild**.
2. Paste the **[Master Stitch prompt](#5-master-stitch-prompt-copy-paste-first)** as the project style description.
3. Generate the **global shell** screens first: header, mobile nav, sidebar, footer. Lock these as the shared pattern.
4. Generate learner screens in the order listed. Reuse the shell rather than regenerating navigation each time.
5. Generate admin screens last, using the admin shell prompt as their base.
6. After all screens exist, run the **[consistency pass](#17-stitch-consistency-pass)** and fix deviations.

### Rules for every prompt

- **Bangla is the default language.** English is a toggle. Every prompt must show bilingual labels.
- **Use realistic content**, never `Lorem ipsum`. Use real-looking English words with Bangla meanings, real grammar topic names, real exam titles.
- **Describe states, not just the happy path.** Each prompt names the empty/loading/error variant where it matters.
- **No new navigation.** The routes in this document are the complete product. Do not invent extra tabs.
- **Desktop and mobile are separate frames.** Generate desktop at 1440×900 and mobile at 390×844.

### Prompt format used below

```
PROMPT — <screen name>
Context: <what this screen is for>
Layout: <structure>
Content: <real labels and data>
Style: <only deltas from the master style>
States: <loading / empty / error / auth variants>
```

---

## 2. Product snapshot

| Item | Detail |
|---|---|
| Product | **Zero English** — a free, bilingual English-learning platform for Bangla speakers |
| Primary promise | Learn English vocabulary, grammar, and writing with Bangla explanations, then prove it with quizzes and exams |
| Primary audience | Bangladeshi students (SSC/HSC/BCS/admission prep), ages ~14–30, comfortable in Bangla, improving in English |
| Secondary audience | Self-learners, teachers, and contributors who submit content |
| Languages | **Bangla (default)** and **English**, toggled globally; all learner-facing labels are bilingual |
| Auth | Google OAuth only, plus a fully usable **guest mode** with local progress |
| Data model | Local-first (IndexedDB) for progress, synced to the server when signed in |
| Tone | Encouraging, exam-focused, slightly playful, never corporate |
| Brand mark | “Zero English” wordmark + simple logo; orange as the identity color |

### Core learner concepts

- **CEFR levels** A1, A2, B1, B2, C1 are live. **C2 is not advertised** and must not appear in navigation or the level grid.
- A word has: English word, Bangla meaning(s), English definition, Bangla definition, English example, Bangla example, synonyms, antonyms, CEFR level, category, word type.
- Word actions: **Learned**, **Bookmarked**, **Still learning**.
- Learner stats: daily goal, today’s learned count, streak, XP/rank, quiz accuracy, grammar mastery.
- Quiz modes: quick, vocabulary practice, class practice, grammar practice, daily practice, mistake bank, scheduled exams.
- **Daily practice** = 10 questions (5 vocabulary + 5 grammar), 20 seconds each, once per day, streak-building.
- **Exams** are scheduled, timed, max 2 competitive attempts, answers revealed after results publish.
- **Writing notebook** has 3 difficulty tiers (Easy / Medium / Hard) × 2 languages (English / Bangla), plus a local “studied” marker.
- **Grammar** is a 3-level hierarchy: Section → Category → Rule, with progress and bookmarks.

### Admin concepts

- Approve or reject contributor submissions for words, quiz questions, grammar rules, and writings.
- Bulk JSON import for words and quiz questions.
- Schedule exams, attach questions, publish results.
- Manage media (ImageKit), popup campaigns, SMTP email templates/logs/broadcast.
- Build visual templates on a canvas (quiz posters, certificates, leaderboard posters).

---

## 3. Art direction

### Concept: “Bilingual study studio”

A warm, paper-like study space that feels like a well-loved notebook — not a corporate LMS and not a gamified kids’ app. The interface should feel **handmade but organized**: grid paper, sticky notes, ink annotations, tabs, and highlighter accents, held together by a strict, calm layout grid.

The redesign should **keep the personality but reduce the clutter**. Today the product mixes doodles, tape, sticky notes, gradients, and many accent colors at once. The rebuild keeps the motifs as *signature moments* (hero, empty states, celebration screens) and uses a cleaner card system everywhere else.

### Five design principles

1. **Bangla-first, never Bangla-only.** Bangla leads; English sits directly beneath in a smaller, calmer tone.
2. **One accent per surface.** Orange is the brand action color. Emerald = success/learned. Amber = streak/reward. Rose = mistakes/errors. Sky = informational. Violet = exams/leaderboard. Never more than two accents on one card.
3. **Paper, not glass.** Prefer warm ivory surfaces, thin ink borders, and soft offset shadows over heavy blur/glassmorphism.
4. **Progress is always visible.** Any learning screen should answer “how much have I done?” without opening a menu.
5. **Celebrate, then move on.** Results and streaks get a big, warm moment; the next action is always one tap away.

### Signature motifs (use sparingly)

- Faint **grid-paper** background on marketing/home surfaces.
- **Sticky note** cards for tips, daily goals, and encouragement.
- **Highlighter swipe** behind key numbers or words.
- **Tape / dog-ear** corner on notebook-style cards (writing hub, grammar rule).
- **Mono annotation** labels (`01`, `A1`, `20s`) in Geist Mono.
- **Hand-drawn underline** under section titles — one per screen maximum.

---

## 4. Design system

### 4.1 Color tokens

Use these exact values so the Stitch output maps cleanly back to the Tailwind theme.

#### Light theme

| Token | Value | Use |
|---|---|---|
| `background` | `oklch(0.986 0.005 85)` / approx `#FBF9F4` | Page canvas (warm ivory paper) |
| `foreground` | `oklch(0.19 0.01 60)` / approx `#2B2721` | Primary ink text |
| `card` | `#FFFFFF` at 72–90% opacity | Cards, sheets, panels |
| `muted` | `#F2EEE5` | Secondary surfaces, inactive tabs |
| `muted-foreground` | `#7A7368` | Helper text, metadata |
| `border` | `#E5DFD3` | Hairlines, card borders |
| `primary` | `oklch(0.68 0.22 45)` / approx `#F26419` | CTAs, active nav, brand |
| `primary-foreground` | `#FFFFFF` | Text on primary |
| `secondary` | `#F6E7D7` | Soft orange-tinted chips |
| `accent` | `#E8F3EC` | Soft emerald tint |
| `success` | `#0F9D6E` | Learned, correct, completed |
| `warning` | `#E0A100` | Streak, caution, pending |
| `destructive` | `#E5484D` | Errors, wrong answers, delete |
| `info` | `#2F80ED` | Informational badges |
| `exam` | `#7C5CFC` | Exam/leaderboard accents |

#### Dark theme

| Token | Value | Use |
|---|---|---|
| `background` | `#15130F` | Near-black warm paper |
| `foreground` | `#F3EFE6` | Primary text |
| `card` | `#1E1B16` at 85% | Panels |
| `muted` | `#26221B` | Secondary surfaces |
| `muted-foreground` | `#A39B8C` | Helper text |
| `border` | `#332E25` | Hairlines |
| `primary` | `#FF7A33` | Brighter orange for contrast |

#### Level / difficulty colors

| Level | Tint | Text |
|---|---|---|
| A1 Beginner | `#DCFCE7` | `#166534` |
| A2 Elementary | `#DBEAFE` | `#1E40AF` |
| B1 Intermediate | `#FEF3C7` | `#92400E` |
| B2 Upper Intermediate | `#FFE4E6` | `#9F1239` |
| C1 Advanced | `#EDE9FE` | `#5B21B6` |
| Mixed / All | `#F1F5F9` | `#334155` |

### 4.2 Typography

| Role | Font | Weight | Size / line-height |
|---|---|---|---|
| UI + body + headings | **Hind Siliguri** | 400 / 500 / 600 / 700 | 14–16 px body; 20–32 px headings |
| Mono annotations | **Geist Mono** | 400 / 500 | 10–12 px, uppercase, +0.08em tracking |
| Display (hero only) | Hind Siliguri 700 | 40–64 px | 1.05 line-height, tight tracking |
| Bangla body | Hind Siliguri 400 | — | **line-height 1.75 minimum** |
| Numerals | Tabular numerals for stats | — | Always align columns |

Rules:

- Never force uppercase on Bangla text.
- Bangla headings need **+10–15% more line-height** than Latin equivalents.
- Do not letterspace Bangla.
- Keep body measure at **60–72 characters** for English, **45–60** for Bangla.
- Mono labels are always Latin: `A1`, `20s`, `10 Qs`, `#04`, `STEP 2 / 3`.

### 4.3 Spacing, shape, elevation

| Token | Value |
|---|---|
| Base spacing unit | 4 px |
| Page gutters | 16 px mobile / 24 px tablet / 32 px desktop |
| Content max width | 1152 px (6xl) learner; 1280 px admin; 1440 px shell |
| Card radius | 16 px (`rounded-2xl`) |
| Small control radius | 10–12 px |
| Pill radius | 9999 px |
| Global radius token | 7.2 px (`0.45rem`) for shadcn primitives |
| Card border | 1 px `#E5DFD3` |
| Card shadow (light) | `0 1px 2px rgba(16,24,40,.04), 0 10px 30px -12px rgba(16,24,40,.10)` |
| Card shadow (dark) | `0 1px 2px rgba(0,0,0,.4)` |
| Section gap | 24 px mobile / 32–40 px desktop |

### 4.4 Surfaces & texture

- **Grid paper:** 24 px grid, 1 px lines at 4–6% opacity, only on home/hero/notebook surfaces.
- **Sticky note:** pale amber or mint block, slight rotation (−1.5° to +1.5°), soft shadow, no border.
- **Notebook card:** white card, dashed rule separators, two spiral eyelets or a tape strip at the top.
- **Ink border:** 1 px solid border with a 2 px offset “double line” on hover for interactive cards.
- **Highlighter:** a skewed 40%-opacity amber bar behind a number or key phrase.

### 4.5 Iconography

- Lucide-style line icons, 1.75–2 px stroke, 16/18/20/24 px.
- Icons sit inside a **36–40 px rounded square chip** with a tinted background.
- One icon per card header; do not decorate every line.
- Flags/language: use a `Languages` icon plus text `বাংলা / English`; do not rely on flag emoji.

### 4.6 Motion

| Interaction | Motion |
|---|---|
| Page section entrance | fade + 12 px rise, 300–400 ms, stagger 50 ms |
| Card hover | translateY(−2 px), border tint, 150 ms |
| Answer selection | 120 ms scale to 0.98, then color fill |
| Correct answer | emerald fill + check icon pop (200 ms) |
| Wrong answer | rose fill + short 2 px shake (180 ms) |
| Streak/result reveal | count-up number + confetti only on a personal best |
| Progress ring | stroke-dashoffset 700–900 ms ease-out |
| Reduced motion | all transforms removed; opacity-only fades |

### 4.7 Core components to reuse

1. **App header** — logo, mega-menu, search, language toggle, theme toggle, auth avatar.
2. **Page header block** — eyebrow pill, bilingual H1, one-line description, optional right-side actions.
3. **Stat card** — icon chip, mono label, large tabular number, bilingual sublabel.
4. **Progress ring / bar** — 56 px ring for mastery; 6 px bar for goals.
5. **Bilingual label pair** — Bangla 14 px / English 11 px muted, stacked.
6. **Level chip** — A1–C1 tinted pill.
7. **Word card** — word, Bangla meaning, level, status actions.
8. **Quiz card** — icon chip, bilingual title, 1-line description, meta row, arrow.
9. **Question card** — progress `03 / 10`, timer pill, question, 4 options, explanation panel.
10. **Result hero** — big score, ring, streak, primary next action, secondary review.
11. **Empty state** — icon, bilingual title, one-line guidance, single CTA.
12. **Data table (admin)** — sticky header, filters bar, row actions, pagination footer.
13. **Wizard stepper (admin/contribute)** — numbered steps, completed check, current highlight.
14. **Editor split view** — form left, live preview right; collapses to tabs on mobile.
15. **Toast / drawer / dialog** — bottom-right toast, right-side sheet, centered confirm dialog.

---

## 5. Master Stitch prompt (copy-paste first)

```
PROMPT — MASTER STYLE

Design a bilingual English-learning web app called "Zero English" for Bangla-speaking
students in Bangladesh. The product feels like a warm, organized study studio made of
paper, ink, sticky notes, and highlighter marks — not a corporate LMS and not a kids'
game.

VISUAL LANGUAGE
- Warm ivory paper background (#FBF9F4), deep warm-ink text (#2B2721).
- Orange (#F26419) is the single brand/action color. Emerald (#0F9D6E) means learned/
  correct/success. Amber (#E0A100) means streak/reward. Rose (#E5484D) means mistake/
  error. Sky (#2F80ED) is informational. Violet (#7C5CFC) is exams and leaderboard.
- White cards at 16px radius with a 1px warm border (#E5DFD3) and a soft offset shadow.
- Faint 24px grid-paper texture only on hero/marketing surfaces, never inside dense
  forms or tables.
- Signature motifs used sparingly: one sticky note, one tape strip, one hand-drawn
  underline, one mono annotation per screen. Do not fill every corner with doodles.
- Generous whitespace, strict alignment, clear hierarchy. Calm and confident.

TYPOGRAPHY
- Hind Siliguri for all UI, headings, and body. Weights 400/500/600/700.
- Geist Mono for small annotations only: A1, 20s, 10 Qs, #04, STEP 2 / 3.
- Bangla is the default language; English appears as a secondary line under Bangla
  labels in a smaller muted style. Never uppercase Bangla.
- Bangla body line-height at least 1.75. Tight tracking only on large Latin headings.
- Numbers in stats use tabular numerals.

LAYOUT
- Desktop content max width 1152px, centered, 32px gutters.
- Mobile 390px wide, 16px gutters, sticky bottom navigation.
- 12-column thinking on desktop; single column with stacked cards on mobile.
- Cards are 16px radius; buttons 10-12px radius; badges are pills.
- Page header pattern: small eyebrow pill, bilingual H1, one-line description,
  optional action buttons on the right.

COMPONENTS
- Header: logo left, horizontal mega-menu, search icon, language toggle, theme toggle,
  profile avatar or Sign in.
- Floating vertical navigation dock on desktop, drawer on mobile, plus a 4-item sticky
  bottom nav on mobile.
- Cards: icon chip 36-40px, bilingual title pair, muted description, meta row.
- Quiz question: progress counter, timer pill, question, four full-width answer options,
  then a colored explanation panel after answering.
- Results: large score, progress ring, streak, one primary next action and one secondary
  review action.
- Empty states: simple line icon, bilingual title, one sentence, single CTA.

MOTION
- Subtle 150-300ms fades and 12px rises. Hover lifts cards 2px. Correct answers fill
  emerald; wrong answers fill rose with a short shake. Respect reduced motion.

DO NOT
- No glassmorphism-heavy panels, no neon gradients, no 3D blobs, no stock photos of
  smiling students, no chatbot, no social feed, no pricing tables.
- Do not use more than two accent colors on a single card.
- Do not invent features or navigation items.

Output: a clean, high-fidelity, production-looking interface that a developer could
rebuild with Tailwind CSS and React.
```

---

## 6. Global shell prompts

### 6.1 Desktop header + mega menu

```
PROMPT — GLOBAL HEADER (DESKTOP)

Context: Persistent top navigation for the whole learner-facing app. 64-72px tall,
sticky, warm ivory translucent background with a hairline bottom border and backdrop blur.

Layout:
- Left: Zero English logo (small wordmark, orange accent), 24px from edge.
- Center: horizontal nav — শব্দভাণ্ডার (Vocabulary), গ্রামার (Grammar), লিখিত (Writing),
  কুইজ (Quiz), লিডারবোর্ড (Leaderboard), নিউজ (News), সম্পর্কে (About).
- Right: search icon button, language pill "বাংলা / EN", sun/moon theme toggle, and
  either an orange "সাইন ইন" button or a circular avatar with a chevron.

Mega menu (open on hover/focus, 720-880px wide, 3 columns):
- Vocabulary column: CEFR levels A1, A2, B1, B2, C1 as level chips with word counts;
  second group: All Words, Search, Leaderboard.
- Grammar column: Popular Topics (Parts of Speech, Tense, Sentence Structure);
  second group: Grammar Hub, My Grammar Progress, Quiz.
- Quiz column: Daily Practice (with flame badge), Quiz Hub, Leaderboard.
- Writing / News / About open smaller 1-2 column menus with 3-4 links each.
- Each menu link has a 20px line icon, Bangla label, and tiny English sublabel.
- Footer strip inside the menu for a featured item, e.g. "আজকের দৈনিক অনুশীলন — ১০ প্রশ্ন,
  ২০ সেকেন্ড" with a small orange arrow.

Style: white/ivory panel, 16px radius, 1px warm border, soft shadow, 8px top offset.
Active nav item gets a short orange underline, not a filled pill.

States:
- Guest: Sign in button visible.
- Signed in: avatar + name, dropdown with Profile, My Progress, Admin Panel (only for
  admins), Sign out.
- Scrolled: header compresses to 56px and shadow strengthens.
- Mobile: collapse to logo + search + language + hamburger.
```

### 6.2 Mobile header & menu

```
PROMPT — GLOBAL HEADER (MOBILE)

Context: 390px viewport. Sticky 56px header.

Layout: logo left; right side: language toggle (compact "বাং/EN"), theme icon, and a
menu button. No horizontal nav.

Menu: full-height right-side sheet, warm ivory, 24px padding.
- Top: profile row (avatar, name, email) or "সাইন ইন করুন" orange button.
- Accordion sections for Vocabulary (levels A1-C1), Grammar, Writing, Quiz, News, About.
- Each row 48px tall with icon, Bangla label, English sublabel, chevron.
- Bottom: language switch, theme switch, "অতিথি মোড" note, social links.

Style: one sticky note at the top with the daily streak; rest is clean list rows.
```

### 6.3 Floating sidebar dock + drawer

```
PROMPT — FLOATING SIDEBAR DOCK

Context: A slim vertical navigation dock fixed to the left edge of desktop screens,
below the header, visible on learner pages. It is a quick-jump tool, not the primary
menu.

Layout:
- 56px wide, floating 16px from the left edge, vertically centered.
- Rounded 20px ivory panel with 1px border and soft shadow.
- Icon buttons stacked with 8px gaps: Home, Vocabulary, Grammar, Search, Quiz,
  Leaderboard, News, Contribute (contributors only), Admin Panel (only if role=admin).
- Active item: orange icon + pale orange rounded background + 3px orange left marker.
- Hover: tooltip to the right with Bangla label + English sublabel.
- Bottom: avatar button that opens a profile drawer.

Profile drawer (right side, 320px): avatar, name, username, quick stats (streak, learned,
rank), links to Profile, Settings, Admin, Sign out. Guest version shows Sign in + guest
progress note.

Mobile: dock is hidden; a floating circular button bottom-right opens the same drawer.
```

### 6.4 Mobile bottom navigation

```
PROMPT — MOBILE BOTTOM NAV

Context: 390px viewport, fixed bottom bar, 64px + safe-area inset.

Four primary tabs: হোম (Home), শব্দভাণ্ডার (Vocabulary), গ্রামার (Grammar), কুইজ (Quiz).
Each tab: 22px icon above a 10px Bangla label. Active tab: orange icon and label with a
soft orange pill behind the icon. Inactive: warm gray.

The bar is ivory with a hairline top border and soft upward shadow. It must never cover
page content — pages reserve 88px bottom padding.

Do not add a fifth tab. Search, profile, news, leaderboard, and admin live in the header
sheet or the floating drawer.
```

### 6.5 Footer

```
PROMPT — GLOBAL FOOTER

Context: Bottom of learner pages. Calm, editorial, not a link farm.

Layout: 4 columns on desktop, stacked accordions on mobile.
- Brand column: logo, one-line mission in Bangla ("বাংলাভাষীদের জন্য সহজ, ধাপে ধাপে
  ইংরেজি শেখা — সম্পূর্ণ ফ্রি।"), social icons.
- Learn: Vocabulary, Grammar, Writing, Quiz, Daily Practice.
- Explore: News, Leaderboard, Contribute, About.
- Support: Contact, Privacy Policy, API Docs.
Bottom strip: © Zero English, "Made for Bangla-speaking learners", language toggle,
and a small "৫,০০০+ শব্দ • A1–C1" badge.

Style: ivory background, hairline top border, 40px vertical padding, no big CTA banner.
```

### 6.6 Global overlays

```
PROMPT — GLOBAL OVERLAYS

1. Toast: bottom-right desktop / top-center mobile. Ivory card, colored left edge
   (emerald success, rose error, amber info), icon, one-line bilingual message,
   dismiss X. Auto-dismiss 4s.

2. Login-required drawer: right-side 380px sheet. Lock icon in an orange chip,
   bilingual heading "এই সুবিধাটি ব্যবহার করতে সাইন ইন করুন", one line explaining that
   guest progress is saved locally, primary "Google দিয়ে চালিয়ে যান", secondary
   "অতিথি হিসেবে চালিয়ে যান", tiny privacy note. No password field.

3. Confirm dialog: centered 420px card, title, one-sentence consequence, cancel and
   destructive action. Destructive is rose, never orange.

4. Announcement popup: centered modal, optional landscape image on top, bilingual title,
   short body, one primary link, close X. Never auto-play sound; never stack two popups.

5. Command/search overlay (desktop): centered 640px panel, search field, grouped results
   (Words, Grammar, Writing), keyboard hint footer.
```

---

## 7. Navigation map

### Learner routes

| Route | Screen |
|---|---|
| `/` | Guest home **or** logged-in dashboard |
| `/login` | Sign in / guest entry |
| `/vocabulary` | Vocabulary hub with level cards |
| `/vocabulary/[level]` | Level word list (A1–C1) |
| `/vocabulary/[level]/[pageNum]` | Paginated level list |
| `/search` | Vocabulary search |
| `/quiz` | Quiz hub |
| `/quiz/quick` | Quick quiz |
| `/quiz/vocabulary` | Vocabulary practice setup + runtime |
| `/quiz/class` | Class practice |
| `/quiz/grammar` | Grammar practice |
| `/quiz/daily` | Daily practice |
| `/quiz/mistakes` | Mistake bank |
| `/quiz/exam` | Scheduled exam lobby / runtime / results |
| `/quiz/results` | Practice results hub |
| `/quiz/question` | Standalone question view (internal) |
| `/grammar` | Grammar hub |
| `/grammar/[section]` | Grammar section |
| `/grammar/[section]/[category]` | Category + rule list |
| `/grammar/[section]/[category]/[rule]` | Rule lesson |
| `/written` | Writing notebook hub |
| `/written/[slug]` | Writing reader |
| `/news` | News & blog hub |
| `/news/[slug]` | Article |
| `/leaderboard` | Weekly exam leaderboard |
| `/profile` | Own profile (tabs) |
| `/profile/[id]` | Public profile |
| `/profile/quiz-results/[id]` | Practice result detail |
| `/profile/vocabulary-exam-results/[id]` | Combined/daily result detail |
| `/contribute` | Contributor workspace |
| `/about` | About |
| `/contact` | Contact |
| `/privacy` | Privacy policy |

### Admin routes

| Route | Screen |
|---|---|
| `/admin` | Redirects to `/admin/users` |
| `/admin/users` | User list |
| `/admin/users/[id]` | User detail/edit |
| `/admin/vocabulary` | Vocabulary CRUD |
| `/admin/quizzes` | Quiz question CRUD |
| `/admin/quizzes/types` | Quiz type management |
| `/admin/exams` | Exam list |
| `/admin/exams/[id]` | Exam detail/edit |
| `/admin/grammar` | Grammar sections/categories/rules |
| `/admin/written` | Writing moderation list |
| `/admin/written/[id]` | Writing editor |
| `/admin/blog` | Blog list |
| `/admin/blog/[id]` | Blog editor |
| `/admin/media` | Media library |
| `/admin/popup` | Popup campaigns |
| `/admin/emails` | Email operations |
| `/admin/templates` | Template gallery |
| `/admin/templates/new` | New template |
| `/admin/templates/[id]/edit` | Canvas editor |

### System routes

| Route | Screen |
|---|---|
| `/offline` | Offline fallback |
| `/docs` | Swagger API docs |
| 404 | Branded not-found |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` | Generated, no UI |

---

## 8. Public & learner screen prompts

### 8.1 Guest home

```
PROMPT — GUEST HOME

Context: First impression for a visitor with no account. Must explain the product in
five seconds and make starting free/guest obvious.

Layout (desktop):
1. HERO (two columns, 58/42)
   Left: small eyebrow pill "সম্পূর্ণ ফ্রি • A1–C1"; H1 "বাংলায় বুঝে ইংরেজি শিখুন"
   with "ইংরেজি" highlighted by an orange highlighter swipe; one-line supporting copy
   "৫,০০০+ শব্দ, গ্রামার নিয়ম, লিখিত নোট এবং কুইজ — সব এক জায়গায়।"
   Two CTAs: primary "শেখা শুরু করুন" → vocabulary; secondary ghost "কুইজ দিন".
   Under CTAs: tiny trust row "Google ছাড়াও অতিথি হিসেবে চলুন • অগ্রগতি ফোনে সেভ হয়".
   Right: a tilted "study desk" collage — one large word card ("serendipity / আকস্মিক
   সৌভাগ্য", A2), one sticky note "আজ ১০টি শব্দ শিখুন", one mini progress ring 68%,
   one tape strip. Keep it editorial, not 3D.
   Background: faint grid paper + a soft warm radial glow, no heavy gradient.

2. LEVEL STRIP
   Eyebrow "স্তর অনুযায়ী শিখুন", H2 "আপনার CEFR লেভেল বেছে নিন".
   Five level cards in a row (A1 Beginner, A2 Elementary, B1 Intermediate, B2 Upper
   Intermediate, C1 Advanced). Each: level code in Geist Mono, Bangla level name,
   English name, word count, thin progress bar, arrow. A1 card is highlighted as the
   recommended start. C2 must not appear.

3. FEATURE BENTO (3 columns, 2 rows)
   - Large tile: "দৈনিক অনুশীলন" — 10 questions, 20 seconds, streak flame, mini mock
     question showing four options.
   - "শব্দভাণ্ডার" — stacked word chips with Bangla meanings.
   - "গ্রামার" — formula card "Subject + have/has + V3".
   - "লিখিত নোট" — notebook card with 3 tier chips Easy/Medium/Hard.
   - "লিডারবোর্ড" — podium mini graphic.
   - "নিউজ ও ব্লগ" — two article rows.

4. HOW IT WORKS
   Three numbered steps with mono labels 01/02/03: শব্দ শিখুন → অনুশীলন করুন →
   অগ্রগতি দেখুন. Each with one line and a small icon.

5. LATEST FROM THE NOTEBOOK
   Two-column: latest writing notes (3 cards) and latest news (2 rows).

6. CLOSING CTA
   Warm band with sticky-note texture: "আজ থেকেই শুরু করুন — কোনো টাকা লাগবে না।"
   Primary "বিনামূল্যে শুরু করুন", secondary "অতিথি হিসেবে দেখুন".

Style: warm paper, orange primary, generous whitespace, at most one rotations per group.
States: when no blog/writing content exists, hide those sections rather than showing
empty boxes.
```

### 8.2 Logged-in dashboard (`/`)

```
PROMPT — LEARNER DASHBOARD

Context: The signed-in home. A calm daily command center, not an analytics dashboard.

Layout:
1. GREETING HEADER
   "শুভ সকাল, রাফি 👋" (time-aware), subline "আজকের লক্ষ্য পূরণ করতে ৭টি শব্দ বাকি।"
   Right: date chip and streak pill "🔥 ১২ দিন".

2. TOP STAT ROW (4 cards)
   - আজ শেখা: 8 (goal 15) + thin progress bar.
   - স্ট্রিক: 12 দিন + flame.
   - মোট শেখা শব্দ: 486 / 5,000 + mini ring.
   - র‍্যাংক: #24 এই সপ্তাহে + small delta.
   Each card: mono label, big tabular number, bilingual sublabel, one accent only.

3. CONTINUE LEARNING (large card, 2/3 width)
   Headline "যেখান থেকে থেমেছিলেন", last level chip A2, last word card, progress bar
   "পৃষ্ঠা ৩ / ১২", primary "চালিয়ে যান". Right side: small "আজকের লক্ষ্য" sticky note
   with ring and "+৩ শব্দ" quick action.

4. DAILY PRACTICE CARD (1/3 width, amber accent)
   "দৈনিক অনুশীলন" + "১০ প্রশ্ন • ২০ সেকেন্ড", streak, big "শুরু করুন" button.
   If already done today: emerald check "আজ সম্পন্ন — ৮/১০" and "ফলাফল দেখুন".

5. QUICK ACTIONS
   Four compact tiles: শব্দ শিখুন, গ্রামার পড়ুন, কুইজ দিন, লিখিত নোট.

6. LEVEL PROGRESS
   Horizontal list of A1–C1 with learned/total and mini bars. Recommended next level
   has an orange "পরবর্তী" chip.

7. TWO-COLUMN BOTTOM
   Left: recent quiz results (3 rows: mode, score, date, chevron).
   Right: leaderboard top 5 with the user's row pinned at the bottom.

8. LATEST NEWS
   Two article cards.

States: new user with zero progress → replace stats with a single onboarding card
"প্রথম ১০টি শব্দ দিয়ে শুরু করুন" and hide the continue-learning card.
```

### 8.3 Vocabulary hub (`/vocabulary`)

```
PROMPT — VOCABULARY HUB

Context: Entry point for browsing the 5,000+ word dictionary by CEFR level.

Layout:
1. PAGE HEADER
   Eyebrow "শব্দভাণ্ডার", H1 "৫,০০০+ শব্দ, বাংলা অর্থসহ", one-line description.
   Right: search field (inline) and a "আমার অগ্রগতি" ghost button.

2. OVERVIEW STRIP (4 stats)
   Levels live (5), Words total (5,000), Learned (486), Daily goal (15).
   Use one wide ivory panel split by hairlines, not four separate cards.

3. LEVEL GRID
   Five large cards, 2 columns on tablet, 1 on mobile.
   Each card: level code in a colored square (A1 green, A2 blue, B1 amber, B2 rose,
   C1 violet), Bangla level name + English name, word count, learned count, thin
   progress bar, "শুরু করুন" text link.
   Highlight the recommended level with a small sticky-note tab "শুরু করার জন্য ভালো".
   Do not show C2.

4. HOW LEVELS WORK
   Small explainer row with 5 chips and a one-line CEFR description.

5. BOTTOM CTA
   "কোন শব্দ খুঁজছেন?" with a search button and "অনুশীলন করুন" quiz link.

States: guest progress is local — show a tiny "এই ডিভাইসে সেভ হয়েছে" note under stats.
```

### 8.4 Level word list (`/vocabulary/[level]`)

```
PROMPT — LEVEL WORD LIST

Context: Browse words for one CEFR level with search, filters, sort, and pagination.

Layout:
1. LEVEL HERO
   Breadcrumb: শব্দভাণ্ডার / A1. Large level badge, H1 "A1 — Beginner", description
   "দৈনন্দিন জীবনের ৫০০+ মৌলিক শব্দ", stats: total words,
   learned, remaining. Right: a circular progress ring (56px) and "আজকের লক্ষ্য" note.

2. FILTER BAR (sticky under header on scroll)
   Search input ("শব্দ বা বাংলা অর্থ খুঁজুন..."), Category select, Word type select,
   Sort select (Default / A–Z / Z–A), and a "ফিল্টার রিসেট" text button.
   On mobile: search full width; filters collapse into a "ফিল্টার" button that opens
   a bottom sheet with apply/reset.

3. RESULTS META ROW
   "১২৪টি শব্দ পাওয়া গেছে" left, "পৃষ্ঠা ২ / ৮" right, plus a segmented control
   "সব / শেখা হয়নি / শেখা হয়েছে" if useful.

4. WORD LIST (single column, 12 per page)
   Each row/card:
   - Left: word in 18px semibold, Bangla meaning directly below in muted 14px,
     then a tiny row: level chip, category, word type.
   - Middle: one short English example sentence, muted, max 2 lines (desktop only).
   - Right: three icon buttons — bookmark, "শিখেছি" check, "আরও শিখব" refresh.
     Learned state = emerald filled check + pale emerald card edge.
   - Clicking the row opens the word detail modal.
   Divider style: hairline, not heavy card borders.

5. WORD DETAIL MODAL
   Centered 720px, scrollable. Header: word + pronunciation-ish mono label + level chip,
   close X. Body sections: বাংলা অর্থ (large), English definition, বাংলা ব্যাখ্যা,
   Examples (EN + BN pair), Synonyms chips, Antonyms chips, Word type / Category meta.
   Footer sticky: bookmark, still learning, and primary "শিখেছি" toggle.

6. PAGINATION
   Prev / numbered pages / Next, centered, with "১২৪টির মধ্যে ২৫–৩৬" caption.

States: no results → empty state with query echo and "ফিল্টার রিসেট"; loading → 6
skeleton rows; offline → banner "অফলাইন ডেটা দেখাচ্ছে".
```

### 8.5 Search (`/search`)

```
PROMPT — VOCABULARY SEARCH

Context: Fast dictionary search with suggestions and grouped results.

Layout:
1. Centered header: H1 "শব্দ খুঁজুন", subline "ইংরেজি শব্দ বা বাংলা অর্থ লিখুন"।
2. Large search field (64px tall, 16px radius) with a search icon, clear button, and
   a keyboard hint "Enter".
3. Suggestion chips below: recent searches and "জনপ্রিয়: serendipity, resilient,
   contemplate". Each chip is a pill.
4. Result area:
   - Before typing: an editorial empty state with a dictionary illustration and
     "অনুসন্ধান শুরু করতে টাইপ করুন".
   - Typing: grouped results — "শব্দ" (word rows with Bangla meaning and level),
     "সমার্থক শব্দ" chips, "বাংলা অর্থ" matches. Highlight the matched substring with
     a pale amber marker.
   - No results: "কোনো শব্দ পাওয়া যায়নি" + suggested spelling + "সব শব্দ দেখুন".
5. Result row click → word detail modal (reuse screen 8.4 modal).

Style: search is the hero; no sidebar; max width 760px.
States: loading = a slim 2px orange top bar, not a spinner blocking the field.
```

### 8.6 Quiz hub (`/quiz`)

```
PROMPT — QUIZ HUB

Context: The lobby for every practice mode and exam. Must make the daily habit obvious.

Layout:
1. HEADER
   Eyebrow "কুইজ", H1 "আজ কী অনুশীলন করবেন?", subline about instant feedback.
   Right: small streak chip and "ফলাফল" ghost button.

2. DAILY PRACTICE HERO (full width, amber)
   Left: flame icon, "দৈনিক অনুশীলন", "১০ প্রশ্ন • ৫ ভোকাব + ৫ গ্রামার • প্রতি প্রশ্নে
   ২০ সেকেন্ড". Right: streak ring, "আজ শুরু করুন" primary, and a status line
   "আজ বাকি আছে" or "আজ সম্পন্ন ✓".
   Background: warm amber tint, one subtle dotted texture, one sticky note corner.

3. MODE GRID (3 columns)
   Cards: Quick Quiz (Zap), Vocabulary Practice (Languages), Grammar Practice
   (BookOpenCheck), Class Practice (GraduationCap), Mistake Bank (RefreshCw),
   Scheduled Exams (CalendarClock).
   Each card: icon chip with its own accent, bilingual title, one-line description,
   meta row ("১০ প্রশ্ন", "২০s", "মিশ্র লেভেল"), and an arrow. Hover lifts 2px.
   Daily and exams are not duplicated in this grid.

4. UPCOMING EXAMS (if any)
   Section header "আসন্ন পরীক্ষা" with "সব দেখুন". Three compact exam rows: mode badge
   (Practice / Weekly / Biweekly), title, schedule window, question count, countdown
   pill, "বিস্তারিত" button. Locked exams show a lock icon and "শুরু হয়েছে" state.

5. YOUR SNAPSHOT (right rail on desktop, stacked on mobile)
   Accuracy ring, quizzes taken, best score, mistake-bank count, and a "দুর্বল বিষয়"
   list of 3 tags.

6. RECENT RESULTS
   Last 3 results as rows: mode, score %, date, accuracy bar.

States: guest → daily/exam cards show a small "সাইন ইন প্রয়োজন" badge but remain
clickable to the login drawer. No exams → hide the section entirely.
```

### 8.7 Quick quiz (`/quiz/quick`)

```
PROMPT — QUICK QUIZ RUNTIME

Context: An instant, low-friction mixed quiz with immediate feedback.

Layout:
- Top bar: back chevron, "কুইক কুইজ", progress "০৩ / ১০", timer pill "১৪s", exit X.
- Thin progress bar under the top bar.
- Question card (max 680px):
  mono eyebrow "প্রশ্ন ০৩", question text 18-20px, optional hint line.
  Four full-width options, 56px tall, 12px radius, letter prefix A/B/C/D in a small
  square. Default: ivory, hairline border. Hover: orange border.
  After selection: correct = emerald tint/border + check; wrong = rose tint + X;
  the correct option is also revealed in emerald.
- Feedback panel slides in below: icon + "সঠিক!" or "ভুল হয়েছে", one-line explanation,
  and "পরবর্তী প্রশ্ন" primary button. Last question → "ফলাফল দেখুন".
- Right rail (desktop): score so far, streak, and a tiny encouragement sticky note.

States: loading skeleton question card; time-out → show "সময় শেষ" and reveal answer;
empty pool → bilingual empty state with "আরেকটি মোড চেষ্টা করুন".
```

### 8.8 Vocabulary practice setup (`/quiz/vocabulary`)

```
PROMPT — VOCABULARY PRACTICE SETUP (3 STEPS)

Context: Configure a custom vocabulary quiz, then play it.

Step 1 — QUIZ TYPE SELECT
Header: "শব্দভাণ্ডার অনুশীলন" + "আপনার পছন্দের ধরন বেছে নিন".
Back link "সব কুইজ".
Six large selectable cards in 2 columns, each with icon chip, bilingual title,
one-line description, badge (e.g. "সহজ", "জনপ্রিয়"), and word count:
English → Bangla, Bangla → English, Synonyms, Antonyms, Mixed, Level Challenge.
Selected card: orange border + pale orange background + check.

Step 2 — SETTINGS
Header repeats chosen type in a summary chip.
Sections:
- শব্দের উৎস: segmented cards — সব শব্দ / বাকি শব্দ / শেখা শব্দ / বুকমার্ক.
  Show available count for each; disabled state with reason when count = 0.
- লেভেলের পরিধি: multi-select chips A1–C1 + "সব লেভেল".
- প্রশ্নসংখ্যা: 10 / 20 / 30 segmented control.
- সময়: "প্রতি প্রশ্নে" 15s / 20s / 30s / সময়সীমা নেই.
- Optional toggle: "ভুল উত্তর সঙ্গে সঙ্গে দেখান".
Sticky bottom bar: summary "১০টি প্রশ্ন • ২০s • A1–B1" and primary "কুইজ শুরু করুন".

Step 3 — PLAY
Reuse the quick-quiz runtime layout with the practice-specific header:
type name, level scope, progress, timer, score.

Step 4 — RESULTS
See 8.11.

States: no learned words → disabled "শেখা শব্দ" source with an inline link to
vocabulary. Loading pool → skeleton. Error → retry card.
```

### 8.9 Practice runtime (shared)

```
PROMPT — PRACTICE QUESTION SCREEN

Context: The shared playing surface for vocabulary, class, grammar, and mistake-bank
practice.

Layout: identical to quick quiz, with these deltas:
- Header shows the mode name and filter summary instead of "কুইক কুইজ".
- Timer can be hidden when "সময়সীমা নেই" is selected; show a mono "∞" pill instead.
- Vocabulary questions show the word large, with the prompt "সঠিক বাংলা অর্থ কোনটি?"
- Grammar questions show a sentence with a highlighted blank and the prompt
  "সঠিক উত্তরটি বেছে নিন"।
- For synonym/antonym modes, show the target word in a highlighted inline chip.
- After answering, the explanation panel shows the correct answer, a short bilingual
  reason, and the source level/category.
- Keyboard: 1–4 selects an option, Enter advances.

Progress and score are always visible; never hide them behind a menu.
```

### 8.10 Class practice (`/quiz/class`)

```
PROMPT — CLASS PRACTICE

Context: Practice filtered by school class (৬ষ্ঠ–১২শ) or exam track.

Layout:
1. Header: "ক্লাস অনুশীলন", subline "আপনার ক্লাসের Syllabus অনুযায়ী প্রশ্ন"।
2. Class selector: a horizontal scroll row of numbered class chips (৬, ৭, ৮, ৯, ১০,
   ১১, ১২) plus "সব". Selected chip = orange fill.
3. Optional track selector: SSC, HSC, Admission, BCS as secondary chips.
4. Summary card: available questions, recommended set size, difficulty mix bar.
5. Primary "অনুশীলন শুরু করুন" + secondary "দুর্বল প্রশ্ন দেখুন".
6. Below: 3 sample question previews (blurred answers) to set expectations.

Play screen reuses 8.9. Results reuse 8.11.
States: class with no questions → empty state + "অন্য ক্লাস বেছে নিন"।
```

### 8.11 Practice results

```
PROMPT — PRACTICE RESULTS

Context: End-of-quiz celebration and review.

Layout (max 720px):
1. RESULT HERO
   Large circular ring with score % animated; center shows "৮/১০".
   Above: small mono "ফলাফল". Below: bilingual verdict — 90%+ "অসাধারণ!",
   70–89% "দারুণ হয়েছে", 50–69% "আরেকটু অনুশীলন", <50% "আবার চেষ্টা করুন".
   Streak or XP delta chip if applicable. A single confetti burst only on a personal best.
2. STAT ROW: সঠিক, ভুল, সময়, নির্ভুলতা — 4 compact stats.
3. ACTIONS: primary "আবার অনুশীলন করুন", secondary "ফলাফল দেখুন",
   ghost "কুইজ হাবে ফিরুন".
4. REVIEW LIST: each question as an expandable row — question text, your answer,
   correct answer, explanation. Wrong rows have a rose left edge; correct rows emerald.
   A filter segmented control: সব / ভুল / সঠিক.
5. "ভুলগুলো মিসটেক ব্যাংকে যোগ হয়েছে" note with a link.

States: unanswered/timeout rows labeled "সময় শেষ"; saving indicator in the footer.
```

### 8.12 Daily practice (`/quiz/daily`)

```
PROMPT — DAILY PRACTICE (4 PHASES)

PHASE 1 — INTRO (centered card, max 520px)
- Amber gradient icon tile with flame, title "দৈনিক অনুশীলন", subline
  "১০টি দ্রুত প্রশ্ন • ২০ সেকেন্ড • প্রতিদিন ১ বার"।
- 2×2 stat grid: 10 (৫ ভোকাব + ৫ গ্রামার), 20s (প্রতি প্রশ্ন), 12d (বর্তমান স্ট্রিক),
  1/Day (দৈনিক সীমাবদ্ধতা). Each stat has its own soft tinted icon chip.
- If guest: amber inline note "ব্যক্তিগত অনুশীলন ও স্ট্রিকের জন্য Google সাইন-ইন প্রয়োজন"।
- Primary full-width "অনুশীলন শুরু করুন" + tiny line "আপনার দুর্বল শব্দ ও ভুলের ওপর
  ভিত্তি করে সাজানো"।

PHASE 2 — PLAY
- Header: flame + "দৈনিক অনুশীলন", progress dots or bar 03/10, countdown ring 14s.
- Question type badge: "শব্দভাণ্ডার" (orange) or "গ্রামার" (violet).
- Same option/feedback pattern as 8.9. Timer turns amber at 5s, rose at 3s.
- Exit X opens a confirm dialog warning that today's attempt will be consumed.

PHASE 3 — RESULTS
- Big score, streak increment animation ("🔥 ১৩ দিন"), correct/wrong count.
- "আজকের স্ট্রিক সম্পন্ন" banner.
- Wrong-answer deck: list of missed questions with correct answers.
- Primary "ফলাফল দেখুন", secondary "হোমে ফিরুন".
- Note "সঠিক উত্তরগুলো আপনার শেখা শব্দে যোগ হয়েছে"।

PHASE 4 — ALREADY COMPLETED
- Calm emerald-tinted card: check icon, "আজকের অনুশীলন সম্পন্ন", today's score,
  streak, and a countdown "পরবর্তী অনুশীলন ০৮:৪২:১০ পরে"।
- Primary "ফলাফল দেখুন", secondary "শব্দ শিখুন"।

States: loading skeleton; error card with retry; guest → login drawer.
```

### 8.13 Mistake bank (`/quiz/mistakes`)

```
PROMPT — MISTAKE BANK

Context: Turn repeated errors into a focused review deck.

Layout:
1. Header: "ভুলের ব্যাংক", subline "আগে যেসব প্রশ্নে ভুল করেছেন, সেগুলো আবার অনুশীলন
   করুন"।
2. Summary card: total mistakes, vocabulary vs grammar split (two mini bars),
   "সবচেয়ে বেশি ভুল" topic chips (3).
3. Primary "ভুলগুলো অনুশীলন করুন" + secondary "সব মুছে ফেলুন" (ghost, destructive
   confirm).
4. Mistake list grouped by type:
   - Vocabulary rows: word, your wrong answer, correct answer, times missed badge.
   - Grammar rows: question snippet, correct answer, topic.
   Each row has a small "ঠিক আছে" action to retire it from the bank.
5. Empty state: a tidy desk illustration, "কোনো ভুল জমা নেই — চমৎকার!", CTA
   "কুইজ দিন"।

Play uses 8.9; correct answers can retire items from the bank.
```

### 8.14 Scheduled exams (`/quiz/exam`)

```
PROMPT — EXAM LOBBY

Context: List scheduled exams with clear open/locked/closed states.

Layout:
1. Header: "নির্ধারিত পরীক্ষা", subline about competitive attempts and published results.
   Right: small "কীভাবে কাজ করে?" link opening a sheet.
2. Three tabs: সব / চলমান / আসন্ন. Counts in pills.
3. Exam cards (stacked, full width):
   - Left: mode badge (Practice = violet outline, Weekly = amber, Biweekly = sky),
     title, one-line description, meta row: প্রশ্ন, সময়/প্রশ্ন, লেভেল, Attempts.
   - Middle: schedule block with start–end date/time and a countdown pill.
   - Right: state button — "শুরু করুন" (open), "আসছে" with clock (upcoming, disabled),
     "শেষ হয়েছে" (closed), "ফলাফল দেখুন" (results published).
   - A thin progress strip shows 1st attempt / 2nd attempt used.
4. Exam rules card at the bottom: 3 bullets — server-graded, max 2 competitive
   attempts, 60-second submission grace, answers after publish.
5. Empty state: calendar illustration, "এখন কোনো নির্ধারিত পরীক্ষা নেই", CTA
   "অনুশীলন কুইজ দিন"।

States: guest → "সাইন ইন করুন" replaces Start; signed-in but cap reached → "Attempt
সীমা শেষ" with results link.
```

### 8.15 Exam runtime

```
PROMPT — EXAM TAKING

Context: High-focus, timed exam. Calm and distraction-free.

Layout:
- Hide the marketing header, floating dock, footer, and bottom nav. Keep only a slim
  exam bar: exam title left, "প্রশ্ন ০৭ / ২০" center, timer right, exit X.
- No instant correctness feedback. Selected option gets a filled ink/orange border and
  a check dot; it can be changed until "পরবর্তী".
- Optional question navigator: a collapsible grid of 20 numbered squares — answered
  = orange, current = outlined, unanswered = muted. Desktop right rail; mobile bottom
  sheet via "প্রশ্ন তালিকা".
- Question card: type badge, question, 4 options, and a small "পরে দেখব" flag toggle.
- Bottom sticky bar: "আগের", "পরবর্তী", and on the last question "পরীক্ষা জমা দিন".
- Submit dialog: answered count, unanswered warning, and "জমা দিন" primary.

Timer: total exam time derived from question count × per-question seconds; turns rose
in the last 60 seconds. On expiry, auto-submit with a clear notice.

States: network loss → amber banner "সংযোগ নেই — উত্তর লোকালি রাখা হচ্ছে"; submit
failure → retry dialog, never lose answers.
```

### 8.16 Exam results

```
PROMPT — EXAM RESULTS

Context: Official score after submission; may hide answers until publish.

Layout:
1. Result hero: score %, ring, pass/needs-practice verdict, mode badge, exam title.
2. Meta row: correct/total, time taken, attempt #, submitted at.
3. If results not published yet: a locked panel — "ফলাফল এখনো প্রকাশিত হয়নি",
   "প্রকাশের সময় জানিয়ে দেওয়া হবে", and "উত্তরপত্র প্রকাশের পর দেখা যাবে"।
4. If published: answer review accordion with correct/incorrect filters.
5. Actions: "লিডারবোর্ড দেখুন", "আবার পরীক্ষা দিন" (if attempts remain), "শেয়ার করুন"
   (poster modal).
6. Late submission or reattempt badge shown as a small muted chip.

States: attempt cap reached → hide retry and explain the cap.
```

### 8.17 Results hub (`/quiz/results`)

```
PROMPT — RESULTS HUB

Context: All practice and exam history in one place.

Layout:
1. Header "ফলাফল ও অগ্রগতি" + subline; right: filter by type.
2. Summary strip: গড় স্কোর, সেরা স্কোর, মোট কুইজ, মোট পরীক্ষা.
3. Tabs: সব / অনুশীলন / পরীক্ষা / দৈনিক.
4. Result rows: icon badge by mode, title, date, score %, accuracy bar, chevron.
   Wrong-heavy results get a small rose "রিভিউ করুন" chip.
5. Pagination or "আরও দেখুন".
6. Empty state: chart illustration, "এখনো কোনো ফলাফল নেই", CTA "প্রথম কুইজ দিন"।

Click → 8.18 result detail.
```

### 8.18 Result detail

```
PROMPT — RESULT DETAIL

Context: Read-only breakdown of one past attempt.

Layout:
- Breadcrumb + back.
- Header card: mode, title, date/time, score ring, verdict.
- Stat grid: সঠিক, ভুল, সময়, নির্ভুলতা.
- Question review list (expandable), each with question, options, your answer,
  correct answer, explanation.
- Footer actions: "আবার অনুশীলন করুন", "শেয়ার"।
- Ownership: if the result belongs to another user, show a 403-style card
  "এই ফলাফলটি আপনার নয়" with a back button.
```

### 8.19 Grammar hub (`/grammar`)

```
PROMPT — GRAMMAR HUB

Context: Structured English grammar curriculum with visible mastery.

Layout:
1. HEADER
   Eyebrow "গ্রামার", H1 "নিয়ম বুঝে ইংরেজি শিখুন", one-line description.
2. MASTERY STRIP (wide panel, 3 metrics)
   Left: 56px progress ring + "সামগ্রিক ব্যাকরণ অগ্রগতি" + "১৮ / ৪২ নিয়ম সম্পন্ন".
   Middle: "৫টি মূল অধ্যায়". Right: "৩টি স্তর — Beginner → Advanced".
   A thin amber "highlighter" sits behind the completed count.
3. SEARCH & FILTER
   Search rules field; difficulty chips (Beginner / Intermediate / Advanced);
   status chips (সব / সম্পন্ন / বাকি)।
4. SECTION GRID (2 columns)
   Each section card: large icon in a tinted square, Bangla title + English title,
   one-line description, category count, rule count, progress bar, "পড়া শুরু করুন".
   One card is "Popular / Recommended" with a small sticky tab.
5. POPULAR TOPICS ROW
   Parts of Speech, Tense, Sentence Structure, Articles, Prepositions — compact chips
   with icons linking into sections.
6. CONTINUE LEARNING
   If progress exists: last visited rule card with "চালিয়ে যান".

States: no progress → show "শুরু করুন" instead of ring; empty search → inline empty.
```

### 8.20 Grammar section (`/grammar/[section]`)

```
PROMPT — GRAMMAR SECTION

Context: One curriculum module, showing its categories and progress.

Layout:
- Breadcrumb: গ্রামার / <section>.
- Section hero: icon tile, Bangla title, English subtitle, description, 3 stats
  (categories, rules, completed), progress ring.
- Optional learning guide: 3–5 short numbered “what you will learn” bullets in a
  tinted panel.
- Category list (accordion or cards): category title pair, rule count, completed count,
  progress bar, arrow. Expanded state reveals rule rows with status check.
- Sticky right rail on desktop: "এই অধ্যায়ে" mini TOC + bookmark status.
- Bottom: prev/next section navigation.
```

### 8.21 Grammar category / rule list

```
PROMPT — GRAMMAR CATEGORY

Context: Category overview with its rule list.

Layout:
- Header: breadcrumb, category icon, title pair, description (bilingual, Bangla first).
- Progress strip: completed / total, estimated minutes remaining.
- Optional “identification hacks” and “common traps” callouts in two tinted panels
  (emerald and rose), each with 2-3 bullets.
- Rule list: numbered rows. Each row: index in mono, title pair, difficulty chip,
  minutes, completed check, bookmark icon, prerequisite/related count, chevron.
  Completed rows get a pale emerald left edge and a check.
- Clicking opens a preview modal with rule summary, formula, one example, and
  "সম্পূর্ণ পড়ুন" primary.
- Sidebar (desktop): category list + overall progress.
```

### 8.22 Grammar rule lesson (`/grammar/[section]/[category]/[rule]`)

```
PROMPT — GRAMMAR RULE LESSON

Context: The core learning page. Long-form, readable, bilingual, with completion.

Layout (2 columns, 72/28):
MAIN
1. Breadcrumb + rule header: difficulty chip, estimated minutes, title pair,
   short description.
2. Action row: "সম্পন্ন" toggle (emerald when done), "বুকমার্ক", "শেয়ার"।
3. Previously-completed banner (if revisiting): pale emerald, "আগে এই নিয়মটি সম্পন্ন
   করেছেন"।
4. Lesson introduction: Bangla explanation, comfortable measure.
5. FORMULA CARD: large mono/semibold pattern, e.g. "Subject + have/has + past
   participle", on a tinted paper card with a copy button. Two sub-blocks:
   "কখন ব্যবহার করবেন" and "কীভাবে তৈরি করবেন".
6. KEY RULES: numbered list, each with a bold rule and one-line Bangla explanation.
7. CONTEXTUAL EXAMPLES: each example as a small “frame” card — English sentence,
   Bangla translation, optional badge ("Affirmative", "Question").
8. COMPARISON: two-column table English vs Bangla usage notes.
9. COMMON MISTAKES: rose-tinted cards with ✗ wrong sentence, ✓ correct sentence,
   one-line reason.
10. PREREQUISITES & RELATED RULES: link cards.
11. Footer: "সম্পন্ন হিসেবে চিহ্নিত করুন" primary, prev/next lesson.

SIDEBAR (sticky)
- Mini progress ring for the category.
- Rule timeline for the category with completed checks; current rule highlighted.
- "এই অধ্যায়ের অন্য নিয়ম" list.

States: locked prerequisite → amber note but content still readable; guest → local
progress note; reduced motion → no sidebar reveal animation.
```

### 8.23 Writing notebook hub (`/written`)

```
PROMPT — WRITING NOTEBOOK HUB

Context: A digital study notebook of paragraphs, essays, letters, applications, and
dialogues, each with Bengali translation and 3 difficulty tiers.

Layout:
1. NOTEBOOK COVER HEADER (the signature screen)
   A large notebook card with a thin multicolor top edge (blue → emerald → amber),
   subtle spiral eyelets along the top on desktop, and a centered layout:
   badge "Zero English • Digital Study Notebook", H1 "English Writing Notebook",
   Bangla subtitle, and three stat chips: "<n> Sections", "3 Tiers (Easy • Medium •
   Hard)", "Bilingual English & বাংলা"।
   Add one small tape strip at the top-left, slightly rotated.
2. FILTER BAR
   Search field, type tabs (All, Paragraph, Essay, Letter, Application, Dialogue,
   Report), and a "র‍্যান্ডম নোট" outline button with a shuffle icon.
   On mobile: horizontal scrolling type chips.
3. RESULT META: "মোট ৪৮টি নোট" + page indicator.
4. NOTE GRID (3 / 2 / 1 columns)
   Each card is a notebook sheet:
   - Top row: category badge, mono "NOTE #04", learned check (emerald bookmark).
   - Title pair: English title bold, Bangla title muted.
   - 2-line excerpt in Bangla.
   - Tier indicators: three small chips Easy / Medium / Hard, filled if available.
   - Footer: reading time, word count, "পড়ুন" arrow.
   - A folded dog-ear corner on the bottom-right.
5. EMPTY STATE: "কোনো লেখা পাওয়া যায়নি" + reset filters.
6. PAGINATION at the bottom.

States: learned notes get a small emerald corner ribbon; guest marker is local.
```

### 8.24 Writing reader (`/written/[slug]`)

```
PROMPT — WRITING READER

Context: Distraction-free bilingual reading with tier and language controls.

Layout:
- Thin sticky reading-progress bar at the very top (orange).
- Reading toolbar (sticky below header, wraps on mobile):
  Left: back, category chip, difficulty segmented control Easy / Medium / Hard
  (disabled tiers are muted with a tooltip). Center/right: language segmented control
  English / বাংলা / Both; font size A- A A+; paper style (Clean / Sepia / Midnight);
  font family (Sans / Serif); copy and share icon buttons.
- Article sheet (max 720px): notebook paper with a subtle left margin rule, title pair,
  meta row (date, reading time, word count), then the rich-text content.
- "Both" mode: English block, a dashed divider with "বাংলা অনুবাদ", then Bangla block.
- Vocabulary hints: highlighted words open a small popover with Bangla meaning.
- Footer of article: "পড়া হয়েছে" toggle (emerald), copy as text / markdown, share.
- Prev/next note navigation cards; keyboard arrows navigate.
- Self-study checklist card: 3 checkboxes — "বুঝেছি", "শব্দ নোট করেছি", "আবৃত্তি করেছি"।

States: tier unavailable → disabled control + explanation; no Bangla content → hide
language option; offline → cached content banner.
```

### 8.25 News hub (`/news`)

```
PROMPT — NEWS & BLOG HUB

Context: Editorial articles, tips, and product updates.

Layout:
- Centered header: small "Zero English" badge, H1 "News & Blog", one-line subline.
- Optional featured article: wide card with image left, category + date, title pair,
  excerpt, "পড়ুন".
- Grid of 3 columns: image (16:9, rounded 12px), category chip, title pair, 2-line
  excerpt, date + read time.
- Pagination with "৪৮টি লেখা" caption.
- Empty state: "এখনো কোনো লেখা প্রকাশিত হয়নি"।

Style: cleaner than the notebook — no grid paper here, just warm ivory and editorial
typography. Images are real photos/illustrations, not placeholders.
```

### 8.26 News article (`/news/[slug]`)

```
PROMPT — NEWS ARTICLE

Context: Long-form bilingual article.

Layout:
- Breadcrumb, category chip, H1 (Bangla first, English second), author/date/read time.
- Featured image full-width with caption.
- Body: 680px measure, prose styling, Bangla line-height 1.8, pull quotes, subheads.
- Language toggle: English / বাংলা / Both, same pattern as the writing reader.
- Share row (copy link, Facebook, native share).
- "আরও পড়ুন" — 3 related cards.
- Table of contents on desktop for long articles (sticky right rail).
```

### 8.27 Leaderboard (`/leaderboard`)

```
PROMPT — WEEKLY LEADERBOARD

Context: Weekly exam ranking by average score. Competitive but friendly.

Layout (2 columns, 2fr / 3fr):
LEFT RAIL (sticky)
- Card: eyebrow "পরীক্ষার র‍্যাংকিং", H1 "লিডারবোর্ড", one-line explanation.
- Top-score ring with "#1 · name" and "this week's top score".
- 2×2 stat grid: Learners, Your rank, Your score, Exams.
- "কীভাবে র‍্যাংকিং হয়" card with 3 bullets and a violet "কুইজ দিন" CTA.

MAIN COLUMN
- "শীর্ষ শিক্ষার্থীরা" header with date range.
- Podium card: 3 columns, 2nd–1st–3rd arrangement, avatar with medal ring, name,
  score %, small crown on #1. Base blocks in gold/silver/bronze tints.
- "অন্যান্য র‍্যাংকিং" list from #4: rank badge, avatar, name, username, score bar,
   score %. The current user's row is pinned and highlighted with a pale orange band
  and a "আপনি" chip.
- Empty state: "এই সপ্তাহে কেউ পরীক্ষা দেয়নি" + CTA.

Style: violet accent for the page, gold/silver/bronze only on the podium.
Mobile: stats card first, podium second, list third.
```

### 8.28 Login (`/login`)

```
PROMPT — SIGN IN

Context: Google-only auth plus guest continuation. Trustworthy and brief.

Layout (centered 440px card on grid paper):
- Logo.
- H1 "আপনার শেখার অগ্রগতি সেভ করুন", subline "Google দিয়ে সাইন ইন করলে শব্দ, কুইজ ও
  স্ট্রিক সব ডিভাইসে সিঙ্ক হবে।"
- Primary full-width "Google দিয়ে চালিয়ে যান" with the Google mark.
- Divider "অথবা".
- Secondary "অতিথি হিসেবে চালিয়ে যান" with a small note "অগ্রগতি শুধু এই ডিভাইসে
  থাকবে; পরে Google অ্যাকাউন্ট যোগ করতে পারবেন।"
- Tiny feature list with checks: "বিনামূল্যে", "কোনো পাসওয়ার্ড নেই", "যেকোনো সময়
  অ্যাকাউন্ট মুছুন"।
- Footer links: Privacy, Contact.
- Side illustration on desktop: a stack of word cards + a streak sticky note.

States: loading → button shows a spinner and "সাইন ইন হচ্ছে..."; access denied →
rose inline alert "এই অ্যাকাউন্টটি ব্যবহার করা যাচ্ছে না"; already signed in →
redirect notice.
```

### 8.29 Profile overview (`/profile`)

```
PROMPT — MY PROFILE (OVERVIEW)

Context: Personal learning dashboard with six sub-sections.

Layout:
1. PROFILE HEADER CARD
   Large avatar (96px) with edit badge, name, @username, institution/class chips,
   short bio, joined date, and an "Edit profile" outline button.
   Right: three compact stats — streak, total learned, rank.
   Background: warm card with one subtle highlighter swipe behind the name.
2. LEFT NAV (desktop, sticky 240px) / horizontal scroll tabs (mobile):
   ড্যাশবোর্ড, বুকমার্ক ডেক, শেখা বিষয়সমূহ, কুইজ ও পরীক্ষা, আমার অবদান, Settings.
   Each item has an icon and a count badge where relevant.
3. OVERVIEW CONTENT (bento)
   - Large tile: activity chart (learned + quiz) with range toggle 7d / 30d.
   - Daily goal ring with today's count and "লক্ষ্য পরিবর্তন" link.
   - Quiz accuracy tile with a 58px ring and "correct of total answers".
   - English skills profile: 4 horizontal bars — Vocabulary, Grammar, Reading,
     Writing, with CEFR estimate chips.
   - Recent activity list (5 rows): "শিখেছেন", "কুইজ", "নিয়ম সম্পন্ন" with time.
   - Contribution calendar heatmap (last 12 weeks).
4. Right rail: streak card, next milestone, "আজকের লক্ষ্য" sticky note.

States: guest → profile is gated by a sign-in card that still shows local progress;
new user → empty activity chart with a friendly prompt.
```

### 8.30 Profile bookmarks / learned

```
PROMPT — PROFILE DECKS

Context: Two saved-item decks with sub-tabs.

Layout:
- Header: "বুকমার্ক ডেক" or "শেখা বিষয়সমূহ", count, and a search field.
- Sub-tabs: শব্দ / গ্রামার (for bookmarks); শব্দ / গ্রামার / লিখিত (for learned),
  each with a count.
- Grid/list of items:
  - Word rows: word, Bangla meaning, level chip, learned state, quick remove.
  - Grammar rows: rule title pair, category, difficulty, completed check.
  - Writing rows: note title pair, tier chips, studied check.
- Bulk action: "নির্বাচিতগুলো সরান" appears only when items are selected.
- Empty state per tab with a relevant CTA ("শব্দভাণ্ডার দেখুন", "গ্রামার পড়ুন").
```

### 8.31 Profile quiz & exams

```
PROMPT — PROFILE QUIZ & EXAMS

Context: Practice and exam history plus mistake review.

Layout:
- Sub-tabs: Exams / Vocabulary / Still learning, each with count.
- Summary strip: attempts, average score, best score, accuracy.
- Exam history rows: exam title, mode badge, date, score %, attempt #, pass marker.
- Vocabulary practice rows: type, score, date, accuracy bar.
- Still-learning deck: word rows with "এখনো শিখিনি" state and a quick "শিখেছি" action.
- "ফলাফল বিস্তারিত" opens 8.18.
- Empty state per tab.
```

### 8.32 Profile contributions & settings

```
PROMPT — CONTRIBUTIONS + SETTINGS

CONTRIBUTIONS
- Header "আমার অবদান", subline about review before publishing.
- Stat row: মোট জমা, অনুমোদিত, অপেক্ষমাণ, প্রত্যাখ্যাত.
- Type tabs: শব্দ / প্রশ্ন / গ্রামার / লিখিত।
- Submission rows: title/preview, type, submitted date, status pill
  (Pending amber, Approved emerald, Rejected rose), reviewer note, edit action
  for pending items only.
- Empty state: "এখনো কিছু জমা দেননি" + "কন্ট্রিবিউট করুন" CTA.

SETTINGS
- Sections: Profile information (name, username, institution, class, gender, location,
  bio, social links), Account (email read-only, connected Google, delete account),
  Preferences (language, theme, daily goal), Notifications (email toggles).
- Save bar sticky at the bottom with "পরিবর্তন সেভ করুন" and "বাতিল".
- Delete account is in a separate rose "Danger zone" card with a confirm dialog.
```

### 8.33 Public profile (`/profile/[id]`)

```
PROMPT — PUBLIC PROFILE

Context: Shareable profile of another learner. No private fields.

Layout:
- Cover band with subtle grid texture and an avatar overlapping it.
- Name, @username, institution, bio, joined date.
- Stats: streak, learned words, grammar rules, rank, contributions.
- Achievements row: badges for streak milestones, quiz milestones, contributor level.
- Activity heatmap (public-safe).
- Recent public results cards.
- If viewing your own profile: "প্রোফাইল এডিট করুন" button instead of follow (there is
  no follow feature).
- Not found / private → friendly empty card with a link home.
```

### 8.34 Contribute (`/contribute`)

```
PROMPT — CONTRIBUTOR WORKSPACE

Context: Submit words, quiz questions, grammar rules, and writings for admin review.

Layout:
1. Header: "কন্ট্রিবিউট করুন", subline "আপনার জ্ঞান দিয়ে অন্যদের শিখতে সাহায্য করুন"।
   Right: contribution stats and a "আমার জমা" link.
2. TYPE SELECTOR (4 cards): শব্দ যোগ করুন, প্রশ্ন যোগ করুন, গ্রামার নিয়ম, লিখিত নোট.
   Each with icon, description, and count of your pending submissions.
3. WORKSPACE (split view: form 62% / live preview 38%)
   - Left: a stepper — 01 Basic info, 02 Content, 03 Review & submit.
   - Right: a live preview card showing exactly how the content will look to learners.
   - On mobile: form only, preview accessible via a "প্রিভিউ" sheet.
4. WORD FORM fields: English word, Bangla meaning(s), English definition, Bangla
   definition, English example, Bangla example, synonyms, antonyms, level, category,
   word type, source note.
5. QUESTION FORM: quiz type, difficulty, question text, 4 options, correct answer,
    explanation, level, source.
6. GRAMMAR FORM: section, category, slug, English/Bangla titles, short description,
   formula, key rules, examples, common mistakes, difficulty, minutes.
7. WRITING FORM: type, English/Bangla titles, summary, 3 difficulty tiers in both
   languages, keywords, featured media.
8. GUIDELINES card: 4 rules with check icons (accuracy, single correct answer,
   helpful explanation, correct difficulty).
9. SUBMIT BAR: "খসড়া হিসেবে রাখুন" + primary "পর্যালোচনার জন্য জমা দিন".
10. CONFIRMATION: centered success card — "জমা হয়েছে!", review timeline
    (জমা → পর্যালোচনা → প্রকাশ), and "আরেকটি যোগ করুন".

States: signed-out → the form is visible but submission opens the login drawer; draft
autosave indicator; validation errors inline under fields.
```

### 8.35 About (`/about`)

```
PROMPT — ABOUT

Context: Mission, product story, data sources, and credits.

Layout:
- Hero: eyebrow "আমাদের সম্পর্কে", large bilingual headline, one-paragraph mission.
- Story section: 2 columns — narrative text + a notebook collage (word cards, sticky
  notes, a map pin for Bangladesh).
- "কীভাবে কাজ করে" 3-step row.
- Feature grid: 6 cards (Vocabulary, Grammar, Writing, Quizzes, Progress, Free).
- Data sources panel: explicit attribution for headwords, no Oxford affiliation claim.
- Contributors section: avatar row + "কন্ট্রিবিউটর হোন" CTA.
- Roadmap / what's next: 4 items with status pills (Live, In progress, Planned).
- Closing CTA.
- No stock photos of classrooms; use product UI fragments and illustrations.
```

### 8.36 Contact (`/contact`)

```
PROMPT — CONTACT

Context: Support and feedback.

Layout:
- Header "যোগাযোগ করুন", subline.
- Two columns: form (name, email, subject, message, send) and contact cards
  (email, Facebook, response time).
- FAQ accordion below with 5 questions.
- Success state: inline emerald panel "বার্তা পাঠানো হয়েছে" with a reference number.
- Validation errors inline; no CAPTCHA visual unless required.
```

### 8.37 Privacy (`/privacy`)

```
PROMPT — PRIVACY POLICY

Context: Plain-language policy.

Layout:
- Narrow 720px column, prose typography, sticky table of contents on desktop.
- Section numbering 1–10 with clear H2s.
- Highlighted summary box at the top: "সংক্ষেপে: আমরা যা শিখি তা আপনার অগ্রগতির জন্য
  ব্যবহার করি; আমরা ডেটা বিক্রি করি না।"
- Last-updated chip.
- Contact block at the end.
```

### 8.38 System screens (404, offline, docs)

```
PROMPT — SYSTEM SCREENS

404:
- Full-page warm ivory, faint grid, centered content.
- Large mono "404" behind a small sticky note that says "এই পৃষ্ঠাটি খুঁজে পাওয়া যায়নি"।
- Bilingual H1, one line, primary "হোমে ফিরুন", secondary "শব্দ খুঁজুন"।
- Logo header only; no mega menu.

OFFLINE:
- Centered card with a cloud-off icon in an amber chip.
- H1 "আপনি এখন অফলাইনে আছেন", explanation that cached vocabulary and quizzes still work.
- Primary "আবার চেষ্টা করুন", secondary "ক্যাশে করা শব্দ দেখুন"।
- A small status list: শব্দ ✓, কুইজ ✓, নতুন কনটেন্ট ✗.

API DOCS (/docs):
- Developer-facing only. Clean white page, Swagger UI, a slim header with the Zero
  English logo and a "Back to app" link. No learner styling.
```

---

## 9. Admin screen prompts

### 9.1 Admin shell

```
PROMPT — ADMIN SHELL

Context: Internal back office. Dense, fast, keyboard-friendly. Visually related to the
learner app but clearly a tool.

Layout:
- Left sidebar 240px, fixed, dark warm charcoal (#1E1B16) in light mode for contrast,
  or ivory with a strong border. Logo top, role badge "Admin".
- Nav items with icons and labels:
  Dashboard (redirects to Users), Users, Vocabulary, Grammar, Written, Templates,
  Media, Blog, Quizzes, Exams, Emails, Popup.
  Active item: orange left bar + pale orange background. Count badges on moderation
  queues (pending items).
- Bottom: "Back to site" link, theme toggle, avatar + sign out.
- Top bar: breadcrumb, global search, "নতুন যোগ করুন" contextual button, notifications.
- Content area: max 1440px, 24px padding, ivory background.
- Mobile: sidebar becomes a slide-over; top bar keeps breadcrumb + menu button.

Style: 14px base type, 12px table text, 8-12px radii, tighter spacing than learner
screens. No doodles, no grid paper, no sticky notes except one optional empty-state note.
Do not reuse the learner mega-menu or bottom nav.
```

### 9.2 Admin users

```
PROMPT — ADMIN USERS

List:
- Header: "Users", count, "Export" ghost and "Add user" primary.
- Filter bar: search (name, username, email, ID), role select, status select
  (Pending, Active, Suspended), sort, reset.
- Table columns: user (avatar + name + @username), email, role pill, status pill,
  joined, last active, actions (view/edit, email, delete).
- Sticky header, zebra-free rows with hairline dividers, row hover tint.
- Bulk selection bar appears on select: change role, suspend, export.
- Pagination footer with page size.

Detail:
- Header: avatar, name, @username, role/status badges, "Impersonate" disabled/hidden,
  save button.
- Two columns: profile form (name, username, email, institution, class, gender,
  location, bio, socials) and account panel (role, status, joined, Google linked,
  contributions count, quiz count).
- Danger zone: delete user with typed confirmation.

States: empty search result, loading skeleton rows, error retry banner.
```

### 9.3 Admin vocabulary

```
PROMPT — ADMIN VOCABULARY

Layout:
- Header: "Vocabulary", total count, pending count badge.
- Actions: "Bulk import JSON", "Export", "Add word".
- Filter bar: search, level, category, word type, status (Pending/Approved/Rejected),
  added-by, reset. All filters inline on desktop; sheet on mobile.
- Table: word, Bangla meaning, level chip, category, type, status pill, added by,
  updated, actions (edit, delete).
- Bulk bar: approve, reject, change level/category, delete.
- Editor drawer/dialog (720px): all word fields in two columns, bilingual pairs
  side by side, status select, preview card toggle.
- Bulk import modal: drag-drop `.json`, file name, row count preview, validation
  errors list, "Import" primary. Show max 5 MB / 10,000 rows hint.
- Delete confirm dialog with the word name.

States: pending-first toggle; import progress bar; partial failure summary.
```

### 9.4 Admin quizzes

```
PROMPT — ADMIN QUIZ QUESTIONS

Layout:
- Header: "Quizzes", counts by status, "Manage types" link, "Bulk import",
  "Export", "Add question".
- Filters: search, quiz type, difficulty, status, added by, sort by ID.
- Table: ID (mono), question preview (2 lines), type, difficulty chip, correct answer,
  status, added by, actions.
- Row expand: shows all four options with the correct one marked emerald and the
  explanation.
- Bulk bar: approve, reject, change difficulty/type, delete.
- Editor dialog: type, difficulty, question, options A–D with radio for correct,
  explanation, level, source; live preview.
- Import modal same pattern as vocabulary.

States: empty type list → prompt to create a type first.
```

### 9.5 Admin quiz types

```
PROMPT — QUIZ TYPE MANAGEMENT

Layout:
- Header "Quiz types" with back link.
- Two-panel layout: list left (type name, slug, question count, status), editor right.
- Editor fields: name, slug, description, icon, order, active toggle, optional grammar
  category link.
- Reorder via drag handle.
- Delete blocked when questions are attached; show count and explanation.

States: unsaved-changes indicator; inline duplicate-slug error.
```

### 9.6 Admin exams

```
PROMPT — ADMIN EXAMS

List:
- Header "Exams", "Add exam".
- Filters: search, mode (Practice/Weekly/Biweekly), level, results visibility.
- Table: title, mode badge, levels, questions, time/question, schedule window,
  results (Published/Hidden), attempts, actions (view, edit, delete).
- Schedule cell shows date + time and an "Upcoming / Live / Ended" status dot.

Editor:
- Sections: Basics (title, description, mode, levels), Questions (searchable picker
  with selected list and reorder), Timing (question count, seconds per question),
  Schedule (start/end datetime), Publishing (results published toggle).
- Right summary rail: computed duration, question count, attempt cap (2), grace
  period (60s), state preview.
- Validate overlapping schedule and empty question set.

Detail:
- Header with state, "Publish results" action, edit.
- Stats: attempts, average score, completion rate.
- Question list with difficulty distribution.
- Attempts table: user, score, attempt #, submitted at, late flag.
```

### 9.7 Admin grammar

```
PROMPT — ADMIN GRAMMAR

Layout:
- Header "Grammar", counts, "Add rule" primary.
- Three tabs: Rules, Categories, Sections. Each with its own count.
- RULES TAB: filters (search, category, difficulty, status), table with title pair,
  category, difficulty, minutes, status, updated, actions. Bulk approve/reject/delete.
- CATEGORIES TAB: cards or table with title pair, section, rule count, order, publish.
- SECTIONS TAB: cards with icon, title pair, category count, rule count, order,
  publish, learning-guide badge.
- Editors as full-page workspaces (not tiny modals), because grammar has many fields:
  RULE: basics (titles, slug, category, difficulty, minutes), lesson (intro, summary,
  formula, key rules, examples, comparisons, common mistakes), relations
  (prerequisites, related rules), publishing.
  CATEGORY: titles, slug, section, description, educational guide fields
  (headlines, overview, sentence roles, key types, identification hacks, common traps),
  accent color, order.
  SECTION: titles, slug, description, icon, badge, order, learning guide JSON with
  a validate/format action.
- Two-column form with a sticky preview card that mirrors the learner rule card.

States: JSON validation errors; unsaved changes guard on navigation.
```

### 9.8 Admin written

```
PROMPT — ADMIN WRITTEN CONTENT

List:
- Header "Written", counts, "Add writing", "Manage types".
- Filters: search, type, status (Pending/Approved/Rejected), visibility
  (Published/Hidden), reset.
- Table: title pair, type, status pill, published toggle, tiers available (3 dots),
  updated, actions (view on site, edit, approve, reject, delete).
- Bulk bar: approve/reject/publish/unpublish/delete.
- Manage types modal: list with name, slug, count, order, delete; add form.

Editor:
- Full-page split: form left, live learner preview right (toggleable).
- Fields: type, English/Bangla titles, slug, summary, keywords, featured media picker,
  status, published, and six rich-text blocks — EN Easy/Medium/Hard, BN Easy/Medium/Hard
  — as tabs with a tier + language selector to avoid overwhelming the form.
- Word count and reading time per tier.
- Sticky footer: "Preview", "Save draft", "Approve & publish".

States: missing tier warning; unsaved changes dialog; preview loads the real reader.
```

### 9.9 Admin blog

```
PROMPT — ADMIN BLOG

List:
- Header "Blog", "Add blog".
- Search by title/description/slug; table with title pair, published toggle, author,
  updated, actions (view, edit, delete).
- Empty state with "Create first post".

Editor:
- Header: title pair, publish toggle, "View on site", save.
- Split view: content form (English tab / Bangla tab) and SEO panel.
- Fields: titles, descriptions, slug, meta title, meta description, keywords,
  featured media, English content, Bangla content.
- Rich-text editor for both languages; word count.
- SEO preview card: search result snippet + social card preview.
- Sticky save bar with draft/publish state.
```

### 9.10 Admin media

```
PROMPT — ADMIN MEDIA LIBRARY

Layout:
- Header "Media", storage usage note, "Upload" primary.
- Toolbar: search (name, alt, caption), folder chips (All, Blog, Vocabulary, Templates,
  Popups), view toggle grid/list, sort.
- Grid: 4–6 columns of square thumbnails, hover overlay with copy URL, create template,
  edit, delete. File name truncated below, dimensions and size in mono.
- Upload modal: dropzone, preview, alt text, caption, tags (comma separated),
  folder select, progress bar.
- Edit modal: thumbnail, alt, caption, tags, copy URL, save.
- Delete confirm with usage warning.

States: empty folder, upload error, copy-success toast.
```

### 9.11 Admin popups

```
PROMPT — ADMIN POPUPS

Layout:
- Header "Popups", "New campaign".
- Filter bar: search by name, status (Active/Scheduled/Expired/Draft), reset.
- Table/cards: name, media thumbnail, audience, pages, schedule, active toggle,
  actions (edit, delete).
- Editor drawer (wide 760px):
  - Basics: name, title (bilingual), body, CTA label + link, active toggle.
  - Media: landscape and portrait upload/preview.
  - Schedule: start/end datetime with timezone.
  - Audience: All / Guests / Signed-in / Contributors / Admins.
  - Pages: include paths (tags input), exclude paths.
  - Animation: fade / slide-up / zoom.
  - Right: a live popup preview on a mock browser frame, with a device toggle.
- Validation: end after start, at least one include path or "all pages".

States: scheduled preview "will show in 2 days"; conflict warning if two active
campaigns target the same path.
```

### 9.12 Admin emails

```
PROMPT — ADMIN EMAIL OPERATIONS

Layout:
- Header "Emails", environment badge (SMTP configured / not configured).
- Left tabs or sub-nav: SMTP Settings, Templates, Automated Triggers, Broadcast,
  Delivery Logs.
- SMTP: host, port, secure toggle, username, password (masked with reveal), from name,
  from email, "Verify & save" primary; status card with last verified time.
- Templates: table of name, subject, trigger, active, updated; editor with subject,
  HTML body, variable chips ({{userName}}, {{userEmail}}, {{streak}}), preview pane,
  "Send test" with email input.
- Triggers: cards for welcome, streak milestone, leaderboard, exam published;
  each with toggle, template select, delay.
- Broadcast: audience selector, template or custom subject/body, estimated recipients,
  schedule or send now, confirmation dialog.
- Logs: table of recipient, template, status (Sent/Failed/Pending), error, sent at;
  filters and retry action.

Style: utilitarian, monospace for credentials and logs, no decorative motifs.
```

### 9.13 Admin templates gallery

```
PROMPT — TEMPLATE GALLERY

Layout:
- Header "Templates", counts, "Create template" primary, "Import" secondary.
- Category tabs: All, Quiz Posters, Certificates, Leaderboards, Vocabulary,
  Announcements.
- Toolbar: search, grid/list toggle, sort.
- Grid: thumbnail cards 4:3 on a checkerboard transparency background, template name,
  dimensions in mono, category chip, updated date; hover overlay with Edit and Preview.
- Table view: name, category, dimensions, updated, actions.
- Preview modal: rendered PNG large, metadata, "Edit", "Render again".
- Empty state with "Create your first template".

States: render failure card with retry; missing font warning.
```

### 9.14 Admin template canvas editor

```
PROMPT — TEMPLATE CANVAS EDITOR

Context: A Canva-like visual editor for posters and certificates. Must feel precise,
not playful.

Layout:
- Top bar (56px): back, template name (inline editable), dimensions in mono,
  undo/redo, zoom control, preview, save.
- Left panel 240px: tabs Layers / Fields / Media / Text presets.
  - Layers: tree with visibility and lock toggles, drag reorder.
  - Fields: draggable dynamic tokens grouped by resolver (quiz, user, leaderboard,
    certificate), search.
  - Media: recent uploads + upload.
- Center: neutral canvas workspace (light gray checkerboard), artboard centered with
  a thin border and drop shadow; rulers, snap guides, selection handles; right-click
  context menu (duplicate, bring forward, lock, delete).
- Right panel 280px: property inspector — position/size, rotation, opacity, fill,
  stroke, radius, typography (family, size, weight, line height, align, color),
  image fit, QR content, dynamic field binding.
- Bottom status bar: zoom %, x/y, selected element type.
- Mobile/tablet: editor is desktop-only; show a "ডেস্কটপে সম্পাদনা করুন" notice.

States: unsaved changes dot; save success toast; render preview modal with loading
skeleton; invalid field binding warning.
```

---

## 10. Core user flows

Design these flows as connected frames in Stitch so the transitions are visible.

### Flow A — First visit → first word learned

1. Guest home → tap "শেখা শুরু করুন".
2. Vocabulary hub → select A1.
3. Level list → open a word.
4. Word modal → tap "শিখেছি".
5. Inline success toast + row turns emerald + daily goal increments.
6. Optional prompt: "আরও ৯টি শব্দ শিখে আজকের লক্ষ্য পূরণ করুন"।

### Flow B — Guest → Google account

1. Guest completes a quiz.
2. Login-required drawer appears with local-progress reassurance.
3. Google consent → returns to profile.
4. Progress-sync screen: "আপনার ২৪টি শব্দ ও ৩টি কুইজ সিঙ্ক হচ্ছে" with a progress bar.
5. Done → dashboard with merged progress.

### Flow C — Daily practice habit

1. Dashboard daily card → daily intro.
2. 10 questions at 20s with instant feedback.
3. Results with streak increment.
4. Wrong-answer deck → "ভুলগুলো অনুশীলন করুন".
5. Next day, the completed state shows a countdown.

### Flow D — Scheduled exam

1. Quiz hub → upcoming exam.
2. Lobby card → rules sheet → Start.
3. Full-screen exam → question navigator → submit dialog.
4. Result: score + "results pending" if not published.
5. Later: published results → answer review → share poster.

### Flow E — Contribute → approval

1. Contribute → choose "শব্দ যোগ করুন".
2. Stepper: basic info → content → review.
3. Submit → confirmation with review timeline.
4. Profile → My Contributions shows Pending.
5. Admin → Vocabulary → pending filter → approve.
6. User sees Approved status in My Contributions.

### Flow F — Admin publishing an exam

1. Admin exams → Add exam.
2. Fill basics, attach questions, set schedule.
3. Save → list shows Upcoming.
4. At start time → Live; admin monitors attempts.
5. End time → admin publishes results → learners see review.

### Flow G — Offline learning

1. User loses connection on a level page.
2. Amber offline banner appears; cached words remain usable.
3. Learned actions queue locally with a "সিঙ্ক হবে" chip.
4. Reconnect → sync toast "৩টি পরিবর্তন সিঙ্ক হয়েছে"।

---

## 11. State matrix

Design all of these for each data-driven screen.

| State | Visual treatment |
|---|---|
| **Initial loading** | Skeleton blocks matching final layout; no centered spinner for page content. |
| **Refreshing** | 2px orange progress bar at the top; content stays interactive. |
| **Empty (no data)** | Line icon in a muted circle, bilingual title, one sentence, single CTA. |
| **Empty (no results)** | Echo the query/filter, "ফিল্টার রিসেট" action, suggest alternatives. |
| **Error (recoverable)** | Rose-tinted inline card, what happened, "আবার চেষ্টা করুন". |
| **Error (fatal/404)** | Full-page branded state with home + search actions. |
| **Auth required** | Right-side login drawer; do not navigate away from the current context. |
| **Guest / local-only** | Small muted chip "এই ডিভাইসে সেভ হয়েছে" near progress controls. |
| **Offline** | Amber top banner + cached-data label; disable actions that need network. |
| **Syncing** | Small spinner next to the affected item; never block the whole page. |
| **Permission denied (admin)** | Centered lock card with "এই পাতায় আপনার অনুমতি নেই" and a back link. |
| **Rate limited** | Amber inline notice with a countdown ("আবার চেষ্টা করুন ০০:৩০ পরে"). |
| **Success** | Toast (transient) + persistent state change (color/check/count). |
| **Destructive confirm** | Centered dialog, consequence sentence, rose destructive button. |
| **Unsaved changes** | Dialog on navigation: "পরিবর্তন সেভ করা হয়নি" with Stay / Discard. |
| **Long content** | Sticky TOC / reading progress; never truncate lesson text. |
| **Timer warning** | Timer pill turns amber at 25% remaining, rose at 10%, with a soft pulse. |
| **Attempt cap reached** | Muted explanatory card; no disabled button without a reason. |

---

## 12. Responsive rules

| Breakpoint | Width | Behaviour |
|---|---|---|
| Mobile | < 640 px | 1 column; 16px gutters; bottom nav; filters in sheets; tables become cards. |
| Tablet | 640–1023 px | 2 columns; 24px gutters; dock hidden; header collapses to menu. |
| Desktop | ≥ 1024 px | Full header + floating dock; 2–3 column grids; sticky side rails. |
| Wide | ≥ 1440 px | Content capped at 1152/1280 px; extra space becomes margin, not wider text. |

Specific rules:

- **Tables** never scroll horizontally on mobile by default — convert each row to a
  stacked card with labeled fields.
- **Quiz runtime** stays single-column at every size, max 680px.
- **Reading pages** cap measure at 680–720px; never full-bleed body text.
- **Admin editor** split view collapses to tabs (Form / Preview) below 1024px.
- **Canvas editor** is desktop-only with an explicit notice below 1024px.
- **Sticky elements** must account for the 56px header and 88px mobile bottom nav.
- **Touch targets** minimum 44×44 px.
- **Long Bangla labels** must wrap, not truncate, in navigation and buttons.

---

## 13. Accessibility & bilingual rules

### Accessibility

- Contrast: body text ≥ 4.5:1; large text ≥ 3:1; never rely on color alone for
  correct/incorrect — pair with an icon and text.
- Focus: visible 2px orange ring with 2px offset on every interactive element.
- Keyboard: quiz options 1–4, Enter to advance, Esc to close dialogs; reading pages
  ArrowLeft/ArrowRight for prev/next.
- Semantics: one H1 per page; quiz options are a radiogroup; timers use
  `aria-live="polite"` and announce only at 10s and 5s, not every second.
- Motion: respect `prefers-reduced-motion`; disable confetti and transforms.
- Images: meaningful alt text; decorative motifs are `aria-hidden`.
- Forms: labels always visible; errors linked with `aria-describedby`; never
  placeholder-only labels.
- Modals: trap focus, restore focus on close, close on Esc and backdrop click.

### Bilingual

- Default language is **Bangla**; the toggle switches to English globally and persists.
- Every learner-facing string has a Bangla and English version. Admin screens may be
  English-only but should keep Bangla content fields.
- Stack bilingual labels where space allows:
  Bangla 14px/500, English 11px/400 muted directly below.
- In prose, Bangla first, English second, separated by a hairline or spacing.
- Bangla typography: line-height ≥ 1.75, no uppercase, no letter-spacing, avoid
  all-caps mono labels mixed into Bangla sentences.
- English UI labels inside Bangla sentences (e.g. “Google”, “CEFR”, “A1”) stay Latin.
- Numerals may remain Western Arabic (0–9); do not force Bangla numerals except in
  decorative editorial moments.
- Buttons should be wide enough for the longest Bangla label; never truncate with `…`
  unless a tooltip is provided.

---

## 14. Content voice & microcopy

- **Encouraging, specific, never scolding.** “আরেকটু অনুশীলন” not “আপনি ব্যর্থ”.
- Short sentences. One idea per line.
- Use “আপনি” consistently.
- Prefer concrete numbers: “১০টি প্রশ্ন”, “২০ সেকেন্ড”, “৫,০০০+ শব্দ”.
- Avoid English jargon where a Bangla word exists, but keep standard terms
  (quiz, streak, level, bookmark) because learners use them.
- Success messages name the outcome: “৩টি শব্দ শেখা হয়েছে”, not “সফল”.
- Error messages say what to do next.
- Empty states are invitations, not dead ends.

### Microcopy bank

| Situation | Bangla | English |
|---|---|---|
| Primary start | শেখা শুরু করুন | Start learning |
| Continue | চালিয়ে যান | Continue |
| Mark learned | শিখেছি | Learned |
| Still learning | আরও শিখব | Still learning |
| Bookmark | বুকমার্ক | Bookmark |
| Correct | সঠিক! | Correct! |
| Wrong | ভুল হয়েছে | Not quite |
| Time up | সময় শেষ | Time's up |
| Next | পরবর্তী | Next |
| See results | ফলাফল দেখুন | See results |
| Retry | আবার চেষ্টা করুন | Try again |
| No results | কিছু পাওয়া যায়নি | Nothing found |
| Saved locally | এই ডিভাইসে সেভ হয়েছে | Saved on this device |
| Sign in required | সাইন ইন প্রয়োজন | Sign in required |
| Pending review | পর্যালোচনায় আছে | Pending review |
| Approved | অনুমোদিত | Approved |
| Rejected | প্রত্যাখ্যাত | Rejected |

---

## 15. Out of scope

Do **not** design or imply any of these; they do not exist in the product:

- Chat, direct messages, comments, or a social feed.
- Following users, friends, likes, or reactions.
- Payments, subscriptions, premium plans, ads, or donations.
- AI tutor, AI chat, generated lessons, or voice conversation practice.
- Video lessons, live classes, or teacher classroom management.
- Email/password sign-up, phone OTP, or social logins other than Google.
- A C2 level page or C2 marketing.
- Native mobile apps (the product is a responsive PWA).
- Public API marketplace or developer portal beyond `/docs`.
- Multi-language beyond Bangla and English.
- Dark patterns, streak-loss threats, or push-notification permission prompts on load.

---

## 16. Screen checklist

Use this as the Stitch frame list and the build QA list.

### Public, learner & system (39)

- [ ] Guest home `/`
- [ ] Logged-in dashboard `/`
- [ ] Login `/login`
- [ ] Vocabulary hub `/vocabulary`
- [ ] Level list `/vocabulary/[level]`
- [ ] Paginated level list `/vocabulary/[level]/[pageNum]`
- [ ] Word detail modal
- [ ] Search `/search`
- [ ] Quiz hub `/quiz`
- [ ] Quick quiz `/quiz/quick`
- [ ] Vocabulary practice `/quiz/vocabulary` (select → settings → play → results)
- [ ] Class practice `/quiz/class`
- [ ] Grammar practice `/quiz/grammar`
- [ ] Daily practice `/quiz/daily` (intro → play → results → completed)
- [ ] Mistake bank `/quiz/mistakes`
- [ ] Exam lobby `/quiz/exam`
- [ ] Exam runtime
- [ ] Exam results
- [ ] Results hub `/quiz/results`
- [ ] Result detail `/profile/quiz-results/[id]`
- [ ] Combined result detail `/profile/vocabulary-exam-results/[id]`
- [ ] Grammar hub `/grammar`
- [ ] Grammar section `/grammar/[section]`
- [ ] Grammar category `/grammar/[section]/[category]`
- [ ] Grammar rule `/grammar/[section]/[category]/[rule]`
- [ ] Writing hub `/written`
- [ ] Writing reader `/written/[slug]`
- [ ] News hub `/news`
- [ ] News article `/news/[slug]`
- [ ] Leaderboard `/leaderboard`
- [ ] Profile `/profile` (6 tabs)
- [ ] Public profile `/profile/[id]`
- [ ] Contribute `/contribute` (4 types × 3 steps + confirmation)
- [ ] About `/about`
- [ ] Contact `/contact`
- [ ] Privacy `/privacy`
- [ ] 404
- [ ] Offline `/offline`
- [ ] API docs `/docs`

### Admin (19)

- [ ] Admin shell
- [ ] Admin dashboard (redirects to Users)
- [ ] Users list
- [ ] User detail
- [ ] Vocabulary admin
- [ ] Quiz questions admin
- [ ] Quiz types
- [ ] Exams list
- [ ] Exam detail/editor
- [ ] Grammar admin (rules / categories / sections)
- [ ] Written moderation
- [ ] Writing editor
- [ ] Blog list
- [ ] Blog editor
- [ ] Media library
- [ ] Popups
- [ ] Emails (5 sub-screens)
- [ ] Templates gallery
- [ ] Template canvas editor

### Shared frames (6)

- [ ] Desktop header + mega menu
- [ ] Mobile header + sheet
- [ ] Floating sidebar dock
- [ ] Mobile bottom nav
- [ ] Footer
- [ ] Overlays (toast, login drawer, confirm, popup, search)

---

## 17. Stitch consistency pass

After generating screens, run these checks and regenerate only the deviations.

### Visual consistency

- [ ] Only **one** brand orange (`#F26419`); no stray oranges.
- [ ] Card radius 16px everywhere; buttons 10–12px; badges pills.
- [ ] Card borders are warm `#E5DFD3`, never pure gray.
- [ ] Shadows are soft and offset, never neon or heavy.
- [ ] Grid paper appears only on home/hero/notebook surfaces.
- [ ] No more than two accent colors per card.
- [ ] Doodles: max one per screen, and never in admin.
- [ ] All page headers follow eyebrow → bilingual H1 → description → actions.

### Typography consistency

- [ ] Hind Siliguri everywhere except mono annotations.
- [ ] Bangla body line-height ≥ 1.75.
- [ ] No uppercase Bangla.
- [ ] Stats use tabular numerals and align in columns.
- [ ] English sublabels under Bangla are 11–12px muted.
- [ ] One H1 per page; headings step down by no more than one level.

### Content consistency

- [ ] Real words, real Bangla meanings, real grammar topics.
- [ ] Bangla is default; English toggle visible in the shell.
- [ ] No `Lorem ipsum`, no “Placeholder”, no “Coming soon” unless it is a real state.
- [ ] C2 never appears.
- [ ] Every empty state has a CTA.
- [ ] Every destructive action has a confirm dialog with a consequence sentence.

### Interaction consistency

- [ ] Correct = emerald + check; wrong = rose + X (never color alone).
- [ ] Timer pill always in the same top-right position.
- [ ] Primary action is always bottom-right or full-width bottom on mobile.
- [ ] Back navigation exists on every nested screen.
- [ ] Modals close on Esc and backdrop; focus is trapped.
- [ ] Loading uses skeletons, not full-page spinners.

### Bilingual QA

- [ ] Toggle the language mentally on every screen: does the layout survive longer
      Bangla strings?
- [ ] Buttons do not truncate Bangla.
- [ ] Navigation labels have both languages.
- [ ] Bangla prose is not set in mono or uppercase.

### Hand-off

- [ ] Desktop (1440) and mobile (390) frames exist for every learner screen.
- [ ] Admin frames exist at 1440 only.
- [ ] Components are named consistently (Card, Chip, Stat, EmptyState, QuestionCard,
      ResultHero, DataTable).
- [ ] Color and type tokens match §4 exactly.
- [ ] Export a screen inventory with route → frame name mapping.

---

### Final note

The rebuild succeeds if a first-time visitor understands three things within five
seconds: **this is for Bangla speakers**, **it is free**, and **I can start learning
right now**. Every screen should protect that clarity.
