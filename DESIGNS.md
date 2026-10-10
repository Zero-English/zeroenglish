# Zero English — System Design & Architecture Analysis (`DESIGNS.md`)

> **Comprehensive Design & UI/UX Analysis for Zero English Web Application**  
> Focus Areas: **Home Page & Dashboard Component**, **/quiz Experience & Engine**, and **/vocabulary Hub & Word Learning System**.

---

## 1. Executive Summary & Design Philosophy

Zero English is a modern, bilingual (English & Bengali) web platform engineered for learners mastering English vocabulary, grammar, and competitive exams (SSC, HSC, IELTS, TOEFL, BCS).

### Core Design Tenets
1. **Bilingual Fluidity**: First-class English and Bengali (বাংলা) support across all surfaces using dynamic localization (`useT`, `useLanguage`), contextual font pairings, and culturally intuitive phrasing.
2. **Glassmorphic Tactility & Depth**: Multi-layer elevation system utilizing `backdrop-blur-xl`, subtle translucent borders (`border-black/[0.06]` / `dark:border-white/[0.08]`), dynamic gradients, and radial progress rings.
3. **Frictionless Micro-Interactions**: Double-tap word mastery, fluid spring physics (`motion/react`), stagger entrance choreographies, and haptic-like active states (`active:scale-95`).
4. **Distraction-Free Focus Modes**: Context-aware UI chrome suppression during exams and quizzes (`useQuizChrome`) that hides floating docks and headers to maximize learner immersion.
5. **Offline-First & Edge Performance**: Hybrid architecture pairing Next.js ISR (Incremental Static Regeneration at Edge) with client-side IndexedDB (`Dexie`) and real-time backend synchronization.

---

## 2. Design System & Visual Foundation

### 2.1 Color Palette & Semantic Tokens (OKLCH)

The platform utilizes a modern OKLCH color model with calibrated chroma and lightness:

```
┌─────────────────┬──────────────────────────────────┬───────────────────────────────┐
│ Token           │ Light Mode (iOS True Tone OKLCH) │ Dark Mode (OKLCH)             │
├─────────────────┼──────────────────────────────────┼───────────────────────────────┤
│ --background    │ oklch(0.986 0.005 85) [Warm Paper│ oklch(0.153 0.006 107.1)      │
│ --foreground    │ oklch(0.153 0.006 107.1)         │ oklch(0.988 0.003 106.5)      │
│ --card          │ oklch(0.998 0.002 85) [75% + Blur│ oklch(0.228 0.013 107.4)      │
│ --primary       │ oklch(0.68 0.22 45) [Orange]     │ oklch(0.68 0.22 45) [Orange]  │
│ --accent        │ oklch(0.96 0.006 85)             │ oklch(0.286 0.016 107.4)      │
│ --muted         │ oklch(0.96 0.006 85)             │ oklch(0.286 0.016 107.4)      │
│ --border        │ oklch(0.925 0.008 85)            │ oklch(1 0 0 / 10%)            │
│ --radius        │ 0.45rem (Base) / 1rem (Cards)    │ 0.45rem (Base) / 1rem (Cards) │
└─────────────────┴──────────────────────────────────┴───────────────────────────────┘
```

### 2.2 CEFR Level Color Architecture

Every CEFR level has a designated semantic color scheme mapped across cards, badges, progress bars, and glows:

| Level | CEFR Classification | Light Background | Dark Background | Border | Primary Gradient | Text Tint |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **A1** | Beginner (শিক্ষানবিস) | `bg-emerald-50` | `dark:bg-emerald-950/40` | `border-emerald-200` | `from-emerald-500 to-teal-500` | `text-emerald-700` |
| **A2** | Elementary (প্রাথমিক) | `bg-sky-50` | `dark:bg-sky-950/40` | `border-sky-200` | `from-sky-500 to-blue-500` | `text-sky-700` |
| **B1** | Intermediate (মাঝারি) | `bg-amber-50` | `dark:bg-amber-950/40` | `border-amber-200` | `from-amber-500 to-orange-500` | `text-amber-700` |
| **B2** | Upper Intermediate (উচ্চ-মাঝারি) | `bg-rose-50` | `dark:bg-rose-950/40` | `border-rose-200` | `from-rose-500 to-pink-500` | `text-rose-700` |
| **C1** | Advanced (উন্নত) | `bg-violet-50` | `dark:bg-violet-950/40` | `border-violet-200` | `from-violet-500 to-purple-500` | `text-violet-700` |
| **C2** | Mastery (পারদর্শী) | `bg-fuchsia-50` | `dark:bg-fuchsia-950/40` | `border-fuchsia-200` | `from-fuchsia-500 to-pink-500` | `text-fuchsia-700` |

### 2.3 Motion, Easing & Choreography

- **Stagger Transitions**: Custom `<StaggerContainer>` and `<StaggerItem>` wrappers that cascade entrance cards smoothly with a 50–100ms offset.
- **Spring Physics**: Navigation docks and active tabs utilize spring animations:
  $$\text{stiffness: 420},\ \text{damping: 32},\ \text{mass: 0.9}$$
- **SVG Circular Progress**: Dynamic stroke-dashoffset interpolation with ease-out timing curves for visual celebration upon completion.

### 2.4 The "One Frame Grid" Pattern & Minimalist Typography Standard

To create a clean, cohesive, and modern tactile surface across catalogs, Zero English utilizes the **One Frame Grid Pattern** instead of fragmented floating cards:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        "One Frame Grid" Anatomy                        │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ 🔲 Header (text-lg font-semibold) + Subtitle (text-xs text-zinc-500)│ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────┬─────────────────────────────────┐ │
│ │ Cell 1: [Icon] Title + Subtitle  │ Cell 2: [Icon] Title + Subtitle │ │
│ │ • Border: Top-Left (None)        │ • Border: Left Divider          │ │
│ ├──────────────────────────────────┼─────────────────────────────────┤ │
│ │ Cell 3: [Icon] Title + Subtitle  │ Cell 4: [Icon] Title + Subtitle │ │
│ │ • Border: Top Divider            │ • Border: Top & Left Dividers   │ │
│ └──────────────────────────────────┴─────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

#### A. Architecture & Tailwind Implementation
- **Outer Shell**: Single unified container with glassmorphic backdrop:
  ```tsx
  <div className="rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-900/60 overflow-hidden">
  ```
- **Inner 2-Column Responsive Stagger Grid**:
  ```tsx
  <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2">
  ```
- **Internal Cell Divider Rules**: Subtly separates internal cells without double borders on the perimeter across both 1-column mobile and 2-column desktop layouts:
  ```tsx
  className="border-t border-black/[0.06] dark:border-white/[0.08] first:border-t-0 sm:border-l sm:[&:nth-child(odd)]:border-l-0 sm:[&:nth-child(-n+2)]:border-t-0"
  ```
  - *Mobile (`< sm`, 1 column)*: Stacked cards are separated by a single clean `border-t`, suppressing the first card with `first:border-t-0` and having no left/right side borders.
  - *Desktop (`>= sm`, 2 columns)*: The left column (`odd`) suppresses left border with `sm:[&:nth-child(odd)]:border-l-0`, the right column receives `sm:border-l`, and the top row (first 2 items) suppresses top border with `sm:[&:nth-child(-n+2)]:border-t-0`.
- **Micro-Interaction State**:
  ```tsx
  className="hover:bg-black/[0.02] active:bg-black/[0.02] dark:hover:bg-white/[0.04] dark:active:bg-white/[0.04] transition-colors"
  ```

#### B. Minimalist Typography Guidelines
- **Strict Prohibition of Bloated Text**: Avoid oversized headings (`text-3xl`, `text-4xl`, `text-5xl`) in standard section headers and option cards.
- **Section Headers**: `text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100`
- **Subtitles & Descriptions**: `text-xs sm:text-sm text-zinc-500 dark:text-zinc-400`
- **Action / Option Labels**: `text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100`
- **Icon Chips**: Standardized to `h-9 w-9` or `h-10 w-10` with `rounded-[10px]` and subtle ring borders. Feature mode chips scale up to `h-12 w-12 rounded-[14px]` with inner gradient highlights.

#### C. Applied Locations
- **`/quiz`**: Primary Quiz Mode catalog (6 modes).
- **`/quiz/vocabulary`**: 2x2 Vocabulary Mode selector (English to Bengali, Bengali to English, Synonyms, Antonyms).
- **`/quiz/grammar`**: Grammar Topics catalog (Tenses, Prepositions, Voice Change, Articles, Narration, etc.).
- **Dashboard Hub**: Quick Action exploration tiles.

### 2.5 Semantic Iconography System

Every card across all quiz surfaces has a dedicated, meaningful icon matching the conceptual domain of the topic or exam:

| Domain / Card | Concept / Card Meaning | Assigned Icon | Visual Metaphor |
| :--- | :--- | :--- | :--- |
| **Scheduled Exam** | Fixed timed event & countdown | `CalendarClock` | Scheduled calendar test window |
| **Quick Quiz** | High-speed 20s blitz | `Zap` | Lightning fast test speed |
| **English to Bangla** | Bilingual vocabulary translation | `Languages` | Multilingual translation bridge |
| **Bangla to English** | Reverse word translation | `ArrowRightLeft` | Bidirectional translation switch |
| **Synonyms** | Words with identical meaning | `Equal` | Equivalence sign ($$=$$) |
| **Antonyms** | Words with opposite polarity | `Contrast` | High-contrast opposing polarities |
| **Mixed / Blitz** | Random mixture of categories | `Shuffle` | Randomized deck shuffle |
| **Tenses** | Past, present, and future time | `Clock` | Chronological time progression |
| **Articles** | Grammatical determiners (a, an, the) | `PenLine` | Editorial pencil writing marker |
| **Voice Change** | Active to passive voice transition | `Volume2` | Audio / vocal inflection |
| **Narration** | Direct & indirect speech quotes | `Quote` | Speech quote marks |
| **Prepositions** | Spatial / directional placement | `Compass` | Spatial direction & navigation |
| **Parts of Speech** | Sentence component classification | `LayoutGrid` | Categorized modular building blocks |
| **Verb Conjugation** | Right form of verbs | `CheckSquare` | Verified correct grammatical form |
| **Subject-Verb Agreement**| Grammatical balance & alignment | `Scale` | Balanced weights & symmetry |
| **Modal Auxiliaries** | Can, could, may, might, must | `Key` | Unlocking capability & permission |
| **Conditionals** | If / then conditional branching | `GitFork` | Logical condition branching |
| **Sentence Transformation**| Syntactic structure conversion | `RefreshCw` | Structural reformation cycle |
| **Spelling** | Orthographic accuracy | `SpellCheck` | Spellcheck dictionary verification |
| **Idioms & Phrases** | Figurative expressions | `MessageSquareQuote`| Expressive conversational speech |
| **Academic: Pre-Primary** | Early childhood fundamentals | `Baby` | Early learning stage |
| **Academic: Primary (1–5)**| Primary school foundation | `Backpack` / `Pencil` / `BookOpen` / `School` | Elementary learning tools |
| **Academic: Middle (6–8)** | Peer group & library study | `UsersRound` / `Library` / `BookMarked` | Structured reading & study |
| **Academic: SSC** | Secondary Certificate Award | `Award` | Secondary school certificate milestone |
| **Academic: HSC** | Higher Secondary Graduation | `GraduationCap` | College / Higher secondary graduation |
| **Standardized: IELTS** | Global English proficiency test | `Globe2` | Worldwide international standard |
| **Standardized: TOEFL** | Academic listening & speaking | `Headphones` | Audio & listening comprehension |
| **Higher Ed: University** | Higher education academy | `Landmark` | Classical university institution |
| **Higher Ed: Masters** | Postgraduate master thesis | `Scroll` | Academic diploma scroll |
| **Certification: Diploma** | Technical credential badge | `FileBadge2` | Verified professional diploma badge |
| **Civil Service: BCS** | Government service commission | `ShieldCheck` | Official state civil service insignia |
| **Professional: JOB** | Career employment exams | `Briefcase` | Workplace & professional recruitment |
| **Past Results** | Historical scores & analytics | `BarChart3` | Performance analytics graph |

---

## 3. Deep Analysis: Home Page & Dashboard Component

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Home / Dashboard Architecture                   │
│                                                                        │
│                      [ ISR Revalidated Page: / ]                       │
│                                   │                                    │
│                         <HomeOrDashboard />                            │
│                                   │                                    │
│             ┌─────────────────────┴─────────────────────┐              │
│      (Guest / Unauthenticated)                 (Authenticated)         │
│             ▼                                           ▼              │
│       <HomeContent />                             <Dashboard />        │
│    • Hero Banner & Value Prop               • Time-Aware Greeting      │
│    • CEFR Level Explorer Matrix             • Circular Progress Gauge  │
│    • Feature Showcase Grid                  • 4-Metric Grid (Streak)   │
│    • Quiz Mode Previews                     • "Continue Learning" Box  │
│    • Community Leaderboard & Blog           • Quick Action Hub Tiles   │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Authenticated Dashboard (`<Dashboard />`)

#### A. Header & Greeting Card (Left Rail)
- **Time-Aware Salutation**: Dynamically generates morning/afternoon/evening/night greetings in Bengali & English with localized calendar date strings (e.g., *"শুভ সন্ধ্যা, Tahmid"* / *"Good evening, Tahmid"*).
- **Circular Progress Hero Gauge**:
  - Central 56px SVG circle displaying overall platform mastery percentage ($$\text{Words Learned} / \text{Total Platform Words}$$).
  - Dual-gradient stroke animation (`#f97316` to `#e11d48`).
- **4-Metric Grid Matrix**:
  1. *Words Learned*: Total vocabulary items marked as known across all levels.
  2. *Today's Words*: Real-time count of words completed in current 24-hour cycle.
  3. *Day Streak (Flame)*: Continuous daily learning streak tracking.
  4. *Daily Goal (Target)*: Percentage attainment of the user's daily quota (e.g., 20 words/day).

#### B. Main Action Column (Right Rail)
- **Quiz Challenge Hero Banner**: High-priority CTA directing users into immediate test sessions (`/quiz`).
- **Smart "Continue Learning" Resume Card**:
  - Detects the user's last visited CEFR level and page from `lastLearnedStore`.
  - Displays a color-coded CEFR badge (e.g., `B1 Intermediate`) alongside a progress bar showing that level's completion rate.
  - Direct 1-click resume button navigating immediately to the exact remembered pagination segment.
- **Explore Action Tiles (2x2 Grid)**:
  - *Vocabulary*: Level browsing and word bank management.
  - *Quiz*: Practice tests and scheduled exam portal.
  - *Progress*: Detailed activity charts, analytics, and word history.
  - *Search*: Instant dictionary lookup with instant fuzzy matching.
- **Community & Content Integration**:
  - Sticky Leaderboard preview highlighting top learners by score and streak.
  - Latest news and vocabulary insights articles with image previews.

---

## 4. Deep Analysis: `/quiz` Engine & Experience

The Quiz ecosystem is architected around an extensible, multi-modal assessment engine supporting both self-paced practice and synchronized competitive exams.

### 4.1 Quiz Navigation & Taxonomy (`<QuizMenu />`)

The `/quiz` route presents an intuitive, high-energy catalog featuring 6 primary game modes:

```
┌──────────────────────────────────────────────────────────────────────┐
│                            Quiz Modes                                │
├────────────────────────────┬─────────────────────────────────────────┤
│ 1. Scheduled Exam          │ Fixed-window timed tests with live      │
│    (/quiz/exam)            │ countdown ticker & real-time rankings   │
├────────────────────────────┼─────────────────────────────────────────┤
│ 2. Quick Quiz              │ High-speed blitz: 20 mixed questions,   │
│    (/quiz/quick)           │ 20 seconds per question                 │
├────────────────────────────┼─────────────────────────────────────────┤
│ 3. Vocabulary Practice     │ Level-filtered word meaning & synonym   │
│    (/quiz/vocabulary)      │ drills (A1 through C2)                  │
├────────────────────────────┼─────────────────────────────────────────┤
│ 4. Grammar Topic Quizzes   │ Specialized category quizzes (Tenses,   │
│    (/quiz/grammar)         │ Prepositions, Voice Change, Articles)   │
├────────────────────────────┼─────────────────────────────────────────┤
│ 5. Class Based Quizzes     │ Curated academic packs (SSC, HSC,       │
│    (/quiz/class)           │ BCS, IELTS, University Admission)       │
├────────────────────────────┼─────────────────────────────────────────┤
│ 6. Past Exam Results       │ Detailed historical analytics, wrong    │
│    (/quiz/results)         │ answer reviews, and word re-testing     │
└────────────────────────────┴─────────────────────────────────────────┘
```

### 4.2 Scheduled Exam Live Countdown Engine

- Automatically polls `/api/v1/quiz-exam/scheduled` to identify current and upcoming events.
- **State Switcher**:
  - *Upcoming*: Displays formatted countdown timer (e.g., `2d 14h 32m`) with an info pill.
  - *Live / Active*: Flashes an animated amber indicator (`Hourglass`) with immediate entry CTA.
  - *Closed / Concluded*: Directs users to the leaderboard and answer key review.

### 4.3 Interactive Quiz Play Engine (`<QuickQuizClient>`, `<QuizPracticeClient>`)

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Active Quiz Interface                         │
│                                                                      │
│  [Top Bar]  ◄ Exit Quiz      [ Question 07 / 20 ]       ⏱ 00:14     │
│  [Progress Bar: ██████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░] 35%       │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Question:                                                     │  │
│  │  What is the antonym of the word "BENEVOLENT"?                 │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  [ Option A: Kind-hearted       ]   [ Option B: Malicious (Correct) ]│
│  [ Option C: Generous           ]   [ Option D: Sympathetic         ]│
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ 💡 Instant Explanation: "Benevolent means well-meaning and     │  │
│  │    kind, so malicious is its direct opposite."                 │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

#### Key Play Features:
- **Distraction-Free Fullscreen**: Invokes `useQuizChrome(true)` to hide the global header, sidebar, and floating dock.
- **Micro-Timer Dial**: Radial countdown animation per question; plays soft pulse effect when time drops below 5 seconds.
- **Immediate Feedback Loop**: Options highlight instantly with green (`emerald`) for correct choices and red (`rose`) for misses, alongside contextual Bengali/English explanation notes.
- **Post-Quiz Performance Review**:
  - Circular Score Breakdown (% accuracy, total score, time per question).
  - Question-by-Question breakdown highlighting missed questions.
  - 1-Click "Bookmark Missed Words" to save difficult vocabulary directly into personal review decks.
  - Auto-sync with user activity graph (`/api/v1/quiz/results`).

---

## 5. Deep Analysis: `/vocabulary` Hub & Word Exploration System

The Vocabulary system is the foundational learning core of Zero English, hosting 5,000+ words organized by CEFR levels and Oxford lexical sets.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Vocabulary Exploration Flow                        │
│                                                                         │
│                       /vocabulary (Level Hub)                           │
│     • Level Cards (A1–C2) with completion percentages                   │
│     • Category Facets (Oxford 3000 / Oxford 5000 / Daily English)       │
│                                  │                                      │
│                                  ▼                                      │
│                   /vocabulary/[level] (Level View)                      │
│     • Level Hero with aggregate statistics                              │
│     • Sticky Server Filter Bar (Search, Part of Speech, Sorting)        │
│     • Word Grid / List View with Responsive Pagination                  │
│     • Rich Word Cards with Pronunciation, Synonyms & Antonyms           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.1 Level Hub & Facet Selector (`<VocabularyClient />`)

- **CEFR Card Matrix**: Interactive cards for each level (A1 to C2) displaying:
  - Color-themed badge and gradient border.
  - Total word count in that level.
  - Circular animated progress ring tracking the user's mastered words.
  - Quick action to dive directly into that level's word stream.
- **Categorical Facets**: Filter words by curated sets including Oxford 3000, Oxford 5000, Academic Word List (AWL), and topic-based clusters (Business, Technology, Daily Routine).

### 5.2 Word Card Anatomy (`<WordCard />`)

The `<WordCard />` is an information-dense, interactive learning unit:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ▌ "Ambiguous"   🔊 [Pronounce]   [adj.]   [Oxford 5000]     ★ ⭕       │
│ ─────────────────────────────────────────────────────────────────────── │
│   বাংলা অর্থ: অস্পষ্ট, দ্ব্যর্থবোধক                                    │
│   Definition: Open to more than one interpretation; not having one      │
│               obvious meaning. (স্পষ্ট নয় এমন বা একাধিক অর্থ হতে পারে) │
│ ─────────────────────────────────────────────────────────────────────── │
│   SYNONYMS:  [equivocal]  [vague]  [unclear]                            │
│   ANTONYMS:  [clear]  [unambiguous]  [precise]                          │
│ ─────────────────────────────────────────────────────────────────────── │
│   "The election results were ambiguous, leaving voters confused."       │
│   "নির্বাচনের ফলাফল অস্পষ্ট ছিল, যা ভোটারদের বিভ্রান্ত করে তুলেছিল।"     │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Detailed Feature Set:
1. **Left Gradient Accent**: Dynamic vertical border indicator that shifts from level-tint to solid vibrant emerald upon mastery.
2. **Text-to-Speech (TTS) Speech Synthesis**: Native Web Speech API integration (`useSpeak`) with accent preference and fallback mechanisms.
3. **Double-Click Gesture**: Double-clicking anywhere on the card toggles its "Learned" state with smooth border glow and badge animation.
4. **Rich Bilingual Content**:
   - English headword and phonetic part of speech.
   - High-contrast Bengali primary meaning.
   - Dual-language comprehensive definitions.
   - Distinctive Synonyms (`bg-emerald-500/10`) & Antonyms (`bg-rose-500/10`) badges.
   - Paired bilingual example sentences in italics.
5. **Quick Action Float Controls**:
   - Bookmark toggle (Amber star/ribbon) storing to local and cloud wordlists.
   - Learned toggle (Emerald checkmark) instantly updating daily goals and streaks.

### 5.3 Filter, Search & URL Synchronization (`<LevelFilterBar />`)

- **Instant Search**: Debounced client-side + server-accelerated querying.
- **Multi-Facet Dropdowns**:
  - Part of Speech: Noun, Verb, Adjective, Adverb, Idiom, Phrasal Verb.
  - Sorting: Alphabetical (A–Z, Z–A), Difficulty, Most Common, Recently Added.
  - Status Filter: All Words, Mastered, In Progress, Bookmarked.
- **SEO-Friendly URL Architecture**: Canonical `/vocabulary/[level]` URLs with query string hydration (`?q=...&category=...&sort=...`) ensuring shareability and search engine crawlability.

---

## 6. Deep Analysis: `/profile` Sidebar Navigation & Bento Grid Dashboard

The Profile experience is structured as an **Asymmetric Split Workspace** pairing a **Sticky Vertical Sidebar Navigation Rail** on the left with a high-density **Modular Bento Grid Dashboard** on the right.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   <ProfileHeader />                                    │
│       [Learning Hub Badge • Action Pills: Vocab / Quiz / Leaderboard]                  │
├───────────────────────────────┬────────────────────────────────────────────────────────┤
│  LEFT VERTICAL SIDEBAR RAIL   │  RIGHT CONTENT WORKSPACE (Col 9 / Flex-1)              │
│  (lg:col-span-3 • Sticky)     │                                                        │
│                               │  • [Tab 1: Bento Dashboard]                            │
│  ┌─────────────────────────┐  │    - Bento Tile 1: User Identity & Mastery Meter       │
│  │ 📊 Dashboard            │  │    - Bento Tile 2: Habit Streak & Daily Goal Dial      │
│  ├─────────────────────────┤  │    - Bento Tile 3: Quiz Assessment & Accuracy Engine   │
│  │ 🔖 Bookmarked      [12] │  │    - Bento Tile 4: CEFR 6-Tier Progression Matrix      │
│  ├─────────────────────────┤  │    - Bento Tile 5: Activity Trend Curve & Analytics    │
│  │ 🏆 Learned Words   [85] │  │                                                        │
│  ├─────────────────────────┤  │  • [Tab 2: Bookmarked Decks]                           │
│  │ 🎓 Quiz & Exams     [6] │  │    - Paginated interactive word cards with TTS         │
│  ├─────────────────────────┤  │                                                        │
│  │ ✍️ Submits          [1] │  │  • [Tab 3: Learned Decks]                              │
│  ├─────────────────────────┤  │    - Mastered vocabulary review grid                   │
│  │ ⚙️ Account Settings     │  │                                                        │
│  └─────────────────────────┘  │  • [Tab 4: Quiz & Exam History]                        │
│                               │    - Practice Results, Scheduled Exams, Mistakes Deck  │
│  [Sidebar Mastery Widget]     │                                                        │
│  • Global Progress Mini Bar   │  • [Tab 5: Account Settings]                           │
└───────────────────────────────┴────────────────────────────────────────────────────────┘
```

### 6.1 Key Architecture & Ergonomics Breakdown

1. **Sticky Vertical Sidebar Rail (`<TabsList />` on `lg:col-span-3`)**:
   - **Desktop Layout**: Stays pinned (`sticky top-6`) alongside the content for effortless switching across decks and dashboard analytics without scrolling to top.
   - **Active State Feedback**: Active tab pill with glassmorphic depth (`bg-black/[0.06] dark:bg-white/[0.08]`), text contrast, and color-coded icon tokens.
   - **Real-Time Badge Counters**: Dynamic pill counters for Bookmarked words (`amber`), Learned words (`emerald`), and Quiz completions (`violet`).
   - **Mini Mastery Widget**: Bottom-docked global progress bar displaying overall platform mastery percentage.
   - **Mobile Responsiveness**: Automatically collapses to a horizontal scrolling pill dock on smaller viewports.

2. **Bento Grid Main Workspace (`lg:col-span-9`)**:
   - **Bento Tile 1 — Identity & Overall Mastery**: Status avatar ring, verified role pills, academic affiliations, bio/socials, and multi-stop radial meter.
   - **Bento Tile 2 — Habit Streak & Daily Goal**: Flame streak badge, animated SVG goal ring, and year-to-date contribution calendar.
   - **Bento Tile 3 — Quiz Assessment Engine**: Accuracy radial percentage dial and correct vs mistake counters.
   - **Bento Tile 4 — CEFR 6-Tier Progression Matrix**: 6-grid cards (A1 to C2) with live word counts.
   - **Bento Tile 5 — Longitudinal Learning Trends**: Full-width interactive activity chart with customizable range filters.

3. **Collection Decks & Workspaces**:
   - High-performance paginated word cards with Web Speech TTS audio, definition pairs, synonyms, antonyms, and double-click mastery toggles.
   - Dedicated quiz practice result cards and scheduled exam scorecards.

---

## 7. Global Navigation & Layout Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                             Global Layout                               │
│                                                                         │
│   [Header: Main Logo • Search Trigger • Language Toggle • Theme Toggle] │
│ ─────────────────────────────────────────────────────────────────────── │
│                                                                         │
│                           Main Content View                             │
│                     (Home, Quiz, Vocabulary, etc.)                      │
│                                                                         │
│ ─────────────────────────────────────────────────────────────────────── │
│   [Desktop: Floating Glass Dock (Bottom Center)]                        │
│   [Home] [Vocabulary] [Search] [Quiz] [Leaderboard] [News] [Profile]    │
│                                                                         │
│   [Mobile: Fixed Bottom Navigation Bar]                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.1 Desktop Floating Dock (`<Sidebar />`)
- **Positioning**: Floating at bottom center (`fixed bottom-5 inset-x-0 mx-auto w-max z-40`).
- **Glassmorphism**: Built with `bg-background/85 dark:bg-card/75 backdrop-blur-xl shadow-2xl` and rounded pill borders.
- **Active Indicator**: Smooth spring-animated highlight tracking the current active route.

### 6.2 Mobile Bottom Navigation (`<MobileBottomNav />`)
- **Touch-Optimized Ergonomics**: 5 core icons with haptic visual response and safe-area padding for modern notch/gesture smartphones.

---

## 7. Strategic Recommendations & Design Evolution

| Strategic Area | Current State | Proposed Enhancement |
| :--- | :--- | :--- |
| **Micro-Animations** | Basic CSS fade-ups & Framer motion springs | Add celebratory particle confetti upon hitting 100% daily word goals or winning a quiz. |
| **Audio Pronunciation** | Native browser `speechSynthesis` | Add slow-speed playback toggle (0.75x) for beginners and phonetic IPA transcription badges. |
| **Gamification** | Day streak counter & Leaderboard | Introduce Level Achievement Badges (e.g., "A1 Master", "Vocabulary Guru", "Grammar Knight"). |
| **Card Accessibility** | High contrast text & hover states | Introduce keyboard navigation shortcuts (e.g., `Space` to pronounce, `L` to mark learned, `B` to bookmark). |
| **Offline Resilience** | IndexedDB with local sync | Add full service-worker caching for quiz questions to enable 100% offline quiz practice on the go. |

---

*Document Generated: October 2026*  
*Status: Approved Architecture Reference*
