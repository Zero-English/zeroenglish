# Zero English — Master Design System & Architectural Specification (`DESIGNS.md`)

> **The Definitive Design Skill & UI/UX System Standard**  
> Synthesized from Emil Kowalski’s fluid design foundations, Apple Human Interface Guidelines (WWDC Fluid Interfaces), and the 13 canonical reference artifacts.  
> This document is the authoritative design contract for all interfaces across the Zero English ecosystem.

---

## 1. Executive Philosophy: The Fluid & Restrained Aesthetic

The design standard documented here represents the apex of modern mobile and desktop software craft. Often characterized as the **Emil Kowalski / Apple Fluid / Linear** style, it rejects generic digital boilerplate in favor of physical directness, visual calm, mathematical rhythm, and tactile delight.

### Core Tenets

1. **Restraint Over Clutter**: Color is an intentional instrument, not wallpaper. Surfaces are monochromatic, bone-white, obsidian, and soft warm zinc. Color is reserved exclusively for real-time status indicators, data-viz polarity, and moments of earned celebration.
2. **Surface Depth & Inset Geometry**: Flat design is dead; skeumorphism is dead. The modern paradigm is **material elevation through insets**: elevated outer cards housing sunken, soft-toned modules (`#f1f1ef`), which in turn house crisp interactive buttons and pills.
3. **Continuous Radii Rhythm (Squircle Hierarchy)**: Nested elements must follow mathematical radius decay so interior curves never pinch or mismatch outer curves:
   $$\text{Radius}_{\text{inner}} \approx \text{Radius}_{\text{outer}} - \text{Padding}$$
4. **Micro-Pills as First-Class Information Units**: Information is grouped into compact, rounded capsules: status chips, segmented filter bars, inline data highlights inside prose, and keyboard shortcuts.
5. **Instantaneous Tactility & Spring Physics**: An interface must feel mechanical and physical. Buttons respond on *pointer-down* (`active:scale-[0.97]`), animations use critically damped springs without lag or stiff linear curves, and progress tracks feature live liquid shimmers.

---

## 2. In-Depth Teardown: Analysis of the 13 Reference Designs

Below is an exhaustive, pixel-level analysis of the 13 reference artifacts uploaded by the user, identifying their visual mechanics, token values, layout primitives, and micro-interactions.

---

### Reference 1: Profile & Creator Card (`Lena Hartmann`)
*A refined personal branding card balancing rich ambient gradients with rigorous structural utility.*

```
┌─────────────────────────────────────────────────────────────────┐
│ [ Soft Iridescent Mesh Banner (Peach → Lilac → Sky) ]           │
│                                              [● Available] Pill │
│   (Avatar)                                                      │
│    Ring-4                                                       │
│                                                                 │
│ Lena Hartmann [✓ Blue]                                          │
│ Brand and motion designer · 📍 Lisbon                           │
│                                                                 │
│ "I shape identities that move: logos with a heartbeat..."       │
│                                                                 │
│ [Motion] [Branding] [3D] [+3]                                   │
│                                                                 │
│ ┌───────────────────┬───────────────────┬─────────────────────┐ │
│ │ 12,480 Followers  │ 86 Projects       │ 4.9 Rating          │ │
│ └───────────────────┴───────────────────┴─────────────────────┘ │
│                                                                 │
│ [  + Follow (Dark Pill)  ]   [ (Chat) ]   [ (Bookmark) ]        │
└─────────────────────────────────────────────────────────────────┘
```

- **Container Anatomy**: Outer shell with continuous curvature (`rounded-[32px]`), pure white card (`#ffffff`) resting on a warm off-white canvas (`#f7f7f8`). Elevated by a diffused double shadow: `shadow-[0_2px_12px_rgba(0,0,0,0.03),0_24px_48px_-12px_rgba(0,0,0,0.06)]` with hairline ring `ring-1 ring-black/5`.
- **Mesh Gradient Banner**: High-bleed top cover transitioning diagonally from soft apricot (`#ffd8be`) through ethereal lavender (`#dfd7f8`) to soft sky blue (`#cce3f9`).
- **Floating Status Pill**: Pinned in the top-right of the banner: `rounded-full bg-white/80 backdrop-blur-md px-3 py-1 text-[12px] font-medium text-zinc-800 shadow-xs` with a glowing emerald green dot (`#10b981`).
- **Avatar Inset**: Circular photo (`size-16` / 64px) with a heavy `ring-4 ring-white` overlapping the boundary between the gradient banner and the white card body. Bottom-right status badge with emerald fill and white ring.
- **Typography & Identity**:
  - Name: `text-[20px] font-bold tracking-tight text-[#1c1c1e]`, accompanied by a verified blue checkmark (`#0071e3`).
  - Meta: Location and title in `text-[13px] text-zinc-500 font-normal`.
  - Bio: `text-[14px] leading-relaxed text-[#2c2c2e]` with generous optical breathability.
- **Tag Capsules**: Wrap of horizontal tags (`rounded-full bg-zinc-100/80 px-3.5 py-1 text-[12px] font-medium text-zinc-700`).
- **3-Cell Stat Inset**: Inset container `rounded-2xl bg-[#f5f5f7] p-2 grid grid-cols-3 gap-2 text-center`. Stat figures are bold tabular numerals (`text-[18px] font-bold text-[#1c1c1e]`) over muted labels (`text-[11px] text-zinc-400 font-medium`).
- **Action Toolbar**: Primary action is a wide pill button (`rounded-full bg-[#1c1c1e] text-white py-3 px-6 text-[14px] font-medium active:scale-97`), flanked by circular secondary action discs (`size-12 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center`).

---

### Reference 2: Home Energy Metric & Chart Widget
*A masterclass in dense data visualization using pattern-differentiated bars and segmented controls.*

```
┌─────────────────────────────────────────────────────────────────┐
│ Home energy                       [ Week | Month | Year ] Track │
│                                                                 │
│ 187.8 kWh   [+12.4% ↗]                                          │
│ used this week                                                  │
│                                                                 │
│ [● Solar]   [● Battery]   [● Grid]                              │
│                                                                 │
│ 40 ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
│    ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐  █ Grid             │
│ 20 ├───┤  ├───┤  ├───┤  ├───┤  ├───┤  ├───┤  █ Battery          │
│    └───┘  └───┘  └───┘  └───┘  └───┘  └───┘  █ Solar (Solid)    │
│ 0  ──────────────────────────────────────────────────────────── │
│      M      T      W      T      F      S      S (Active)       │
└─────────────────────────────────────────────────────────────────┘
```

- **Segmented Control Filter**: Sunken pill track `rounded-full bg-zinc-100 p-1 flex gap-1`. Active segment is an elevated white capsule (`rounded-full bg-white px-3.5 py-1 text-[12px] font-semibold text-zinc-900 shadow-xs`). Inactive segments are transparent with `text-zinc-400 font-medium hover:text-zinc-700`.
- **Large Metric Hero**: `187.8` rendered in heavy bold typography (`text-[40px] font-bold tracking-tighter text-[#1c1c1e] tabular-nums`), paired with inline unit `kWh` in medium gray (`text-[18px] font-normal text-zinc-400`).
- **Delta Indicator Capsule**: Soft mint pill `rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[12px] font-semibold` with upward diagonal arrow (`+12.4% ↗`).
- **Legend Chips**: Pills with colored dot indicators: Solar (`#f59e0b`), Battery (`#10b981`), Grid (`#6366f1`).
- **Pattern-Fills in Data Visualization**:
  - Historical days (`M` through `S`): Rendered with a diagonal crosshatch/striped pattern fill (`repeating-linear-gradient(45deg, ...)`) in soft translucent tints, visually indicating past/unselected state.
  - Active / Current day (`Sunday`): Rendered in vibrant, solid, saturated colors with rounded corner caps on every stacked block segment.
  - Gridlines: Delicate horizontal dashed rules (`stroke-dasharray: 4 4`, opacity 8%) at intervals of 10, 20, 30, 40.

---

### Reference 3: Focus Sessions Heatmap & Insights Card
*Monochromatic activity mapping inspired by GitHub contribution graphs, elevated into consumer software.*

```
┌─────────────────────────────────────────────────────────────────┐
│ Focus sessions                           [ Last 20 weeks ] Pill │
│                                                                 │
│ 344 sessions   [+47% ↗]                                         │
│                                                                 │
│ Jul      Aug         Sep         Oct         Nov                │
│ Mon ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ▣ (Hover Ring)      │
│     ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■                   │
│ Wed ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■                   │
│     ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■                   │
│ Fri ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■                   │
│                                       Less ▫ ▫ ▫ ▫ ▫ More       │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ∿ Total sessions                               344          │ │
│ │   Last 20 weeks                                             │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ 🔥 Longest streak                              18 days      │ │
│ │   Nov 7 to Nov 24                                           │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ ⚡ Current streak                              18 days      │ │
│ │   Since Nov 7                                               │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

- **Monochromatic 5-Level Heatmap Matrix**:
  - Cell geometry: Squares with subtle corner rounding (`size-3.5 rounded-[3.5px]`).
  - Intensity ramp (grayscale): Level 0 (`#f4f4f5` / `zinc-100`), Level 1 (`#d4d4d8` / `zinc-300`), Level 2 (`#a1a1aa` / `zinc-400`), Level 3 (`#52525b` / `zinc-600`), Level 4 (`#18181b` / `zinc-900`).
  - Active Cell State: Emphasized with an outer outline ring (`ring-2 ring-zinc-900 dark:ring-white`) without altering layout geometry.
- **Stacked Inset Insight Rows**:
  - Inset module: `rounded-[20px] bg-[#f6f6f8] p-3.5 flex items-center justify-between`.
  - Icon chips: Subtle outline glyphs (`size-4 text-zinc-500`).
  - Metrics: Bold tabular lining numerals (`text-base font-semibold text-zinc-900 tabular-nums`).

---

### Reference 4: Natural Language Highlights ("Your Month in Words")
*Transforming cold statistics into conversational human prose with embedded interactive data capsules.*

```
┌─────────────────────────────────────────────────────────────────┐
│ Your month in words                         [ November ] Pill   │
│                                                                 │
│ This month you wrote [📄 12,480 words] , [↗ 18% more] than     │
│ in October. You finished [9 drafts] and kept a                  │
│ [🔥 14 day streak] going.                                       │
│                                                                 │
│    ╭───╮          ╭───╮          ╭───╮          ╭───╮           │
│    │ ☼ │✓         │ 🔥│✓         │ 🪶│✓         │ ☾ │ (57% Arc) │
│    ╰───╯          ╰───╯          ╰───╯          ╰───╯           │
│  Early riser   Streak keeper   Wordsmith      Night owl         │
│    Earned         Earned         Earned          57%            │
│                                                                 │
│ [                     View full recap →                       ] │
└─────────────────────────────────────────────────────────────────┘
```

- **Prose-Embedded Data Pills**:
  - The sentence text is rendered in `text-[16px] leading-[2.2] text-zinc-600`.
  - Embedded data points are wrapped in capsule chips: `inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 font-semibold text-zinc-900 text-[13px] shadow-2xs align-middle`.
  - Inline icons (document `📄`, delta arrow `↗`, fire `🔥`) are scaled to `size-3.5` and color-matched.
- **Circular Milestone Achievement Badges**:
  - Badge container: Circular gray disc (`size-14 rounded-full bg-zinc-100 flex items-center justify-center`).
  - Completed status: Solid black circular checkmark badge overlapping the bottom-right quadrant (`size-4 rounded-full bg-black text-white`).
  - In-progress status: Outer circular SVG arc indicator tracking partial percentage (`57%`), with stroke color in `#1c1c1e` and track in `#e4e4e7`.
- **Full-Width Pill Button**: Wide capsule footer button `rounded-full bg-zinc-100 hover:bg-zinc-200/80 text-zinc-900 font-semibold py-3.5 px-4 text-center text-[14px]`.

---

### Reference 5: Atmospheric Grain & Gradient Visual Card ("Light, bent")
*Demonstrating tactile sensory depth through analog noise textures and floating frosted chrome.*

- **Surface Treatment**: Continuous rounded rectangle (`rounded-[32px] overflow-hidden`) featuring an ultra-smooth deep atmospheric gradient (violet twilight at top, incandescent orange/amber in the middle, deep void black at base).
- **Film Grain Noise**: A uniform, microscopic stippled noise/grain texture applied over the gradient via SVG turbulence or CSS noise pattern, eliminating sterile digital banding and introducing tactile warmth.
- **Floating Controls**:
  - Top-left: Frosted pill `"New"` (`rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-white`).
  - Bottom-left: Frosted pill `"Prism flow Hover"` (`rounded-full bg-white/90 backdrop-blur-md px-4 py-2 text-[12px] font-semibold text-zinc-900 shadow-sm`).
  - Bottom-right: Circular floating action button (`size-12 rounded-full bg-white text-zinc-900 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform`).

---

### Reference 6: Command Palette & Category Launcher ("Jump back in")
*The benchmark for keyboard-driven navigation, soft pastel tiles, and quick shortcuts.*

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔍  Search for "stoneware"                              [ ⌘ K ] │
├─────────────────────────────────────────────────────────────────┤
│ [All] (Active)  [Products]   [Shops]   [Watchlist]   [Keywords] │
│                                                                 │
│ Jump back in                                                    │
│ ┌─────────────────────────────┬───────────────────────────────┐ │
│ │ [C] Products                │ [M] Shops                     │ │
│ │ Ceramic pour over ...       │ Moonspirit Studio             │ │
│ │ 1,210 sales                 │ 48 products                   │ │
│ │ (Soft Sage Background)      │ (Soft Lavender Background)    │ │
│ ├─────────────────────────────┼───────────────────────────────┤ │
│ │ [L] Products                │ [P] Open ↵                    │ │
│ │ Linen tote bag              │ Paper and Pine                │ │
│ │ 970 sales                   │ 31 products                   │ │
│ │ (Soft Sand Background)      │ (Soft Eucalyptus Background)  │ │
│ └─────────────────────────────┴───────────────────────────────┘ │
│                                                                 │
│ Shortcuts                                                       │
│ [ ∿ Product analytics ]         [ ⊞ Shop analyser ]             │
│ [ 🧭 Keyword research ]          [ 📈 Trends ]                   │
│                                                                 │
│ Type to search, Tab for example    ↑ ↓ to move, ↵ to open       │
└─────────────────────────────────────────────────────────────────┘
```

- **Search Header**: Minimalist input field with inset shortcut badge `[ ⌘ K ]` (`rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400`).
- **Pastel Category Tiles (2x2 Grid)**:
  - Tiles use muted, desaturated, soft pastel tints:
    - Sage Green: `#ebf3ed`
    - Soft Lavender: `#f1edf7`
    - Warm Sand: `#f7f2ed`
    - Eucalyptus: `#e7eee9`
  - Each tile features a pure white rounded squircle badge (`size-8 rounded-[10px] bg-white text-zinc-800 font-bold shadow-2xs`), category label (`text-[10px] uppercase font-semibold text-zinc-400`), title (`text-[13px] font-semibold text-zinc-800`), and tabular counter (`text-[11px] text-zinc-500`).
- **Shortcut Pills**: 2x2 grid of rounded rectangular button chips (`rounded-2xl bg-zinc-100/70 p-3 hover:bg-zinc-200/60 transition-colors`).

---

### Reference 7: Floating Island Navigation Dock
*The quintessential modern floating tab bar, prioritizing thumb ergonomics and layout physics.*

- **Island Container**: A floating capsule hovering above content: `rounded-full bg-white/90 backdrop-blur-xl px-2 py-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] border border-black/[0.05]`.
- **Active Tab Capsule**: The active tab expands with text label: `rounded-full bg-zinc-100/80 px-4 py-2 flex items-center gap-2 text-zinc-900 font-semibold text-[14px]`.
- **Inactive Tabs**: Clean icon-only hit targets (`size-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors`).
- **Notification Badge**: Circular red indicator overlapping the history icon: `size-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white`.

---

### Reference 8: Integration Hub ("All your tools, one hub")
*Interactive connection canvas showing fluid vector bezier splines linking external services.*

- **Center Hub Badge**: Squircle icon container encircled by a delicate iridescent rainbow/spectral border (subtle pastel spectrum transition: `#ec4899` → `#8b5cf6` → `#06b6d4` → `#10b981`).
- **Smooth Bezier Splines**: Fluid cubic bezier paths linking the hub to 6 app icons, with micro-particles scattered along the trajectory to signify data in motion.
- **Action Semantics**: Tap to link, tap again to let go.

---

### Reference 9: The Canonical Jordan Lee Profile & Workspace Menu
*The absolute benchmark for account switcher and multi-section mobile menus.*

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ (Avatar) Jordan Lee                       ▲ (Collapse)      │ │
│ │          @jordan · Available                                │ │
│ │                                                             │ │
│ │ ┌─────────────┬─────────────┬─────────────┬───────────────┐ │ │
│ │ │ ● Online    │ ● Focus     │ ● Away      │ ● Hidden      │ │ │
│ │ │ (White Pill)│             │             │               │ │ │
│ │ └─────────────┴─────────────┴─────────────┴───────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌───────────────┐     ┌───────────────┐     ┌───────────────┐   │
│ │ [User]        │     │ [Gear]        │     │ [Zap]     [?] │   │
│ │ Profile       │     │ Settings      │     │ Shortcuts     │   │
│ └───────────────┘     └───────────────┘     └───────────────┘   │
│                                                                 │
│ Workspaces                                                      │
│ [L] Lumen (Pro plan, 12 members)                         [✓]    │
│ [N] Northwind (Free plan, 3 members)                            │
│ [+] New workspace                                               │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Storage                                       6.4 of 10 GB  │ │
│ │ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │
│ │ ✨ Upgrade for 100 GB →                                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ↳ Log out                                                       │
└─────────────────────────────────────────────────────────────────┘
```

- **Color Architecture**:
  - Base container: Pure white `#ffffff` with `rounded-[28px] p-2.5 text-[#242423] ring-1 ring-black/5`.
  - Inset header module: Distinct `#f1f1ef` background (`rounded-[22px] p-3`).
  - Text: Warm charcoal `#242423` (never harsh pure `#000000`). Muted copy in `#242423]/55`.
  - Button fills: Subtle `#242423]/[0.04]` hoverable to `#242423]/[0.07]`.
- **Radiogroup Status Bar**: Sunken 4-column pill track `bg-[#242423]/[0.05] p-0.5 rounded-full`. Active status (`"Online"`) is an elevated white pill with soft shadow and green dot. Inactive options have colored dots (blue, amber, gray).
- **Workspace Rows**: Clean list items featuring monochrome squircle badges (`size-9 rounded-[12px] bg-[#242423] text-white text-[13px] font-bold`), organization title, member count, and circular black checkmark badge for the active tenant.
- **Storage Progress Inset**: Pill-ended progress bar (`h-2 rounded-full bg-[#242423]/10`) filled with deep black `bg-[#242423]` and animated liquid shimmer highlight.

---

### Reference 10: Deep Work Matrix Timer ("Keep the noise out")
*Concentration UI combining pixelated background density with circular focus dials.*

- **Pixel Heatmap Matrix**: Pixel field with radial density falloff; vibrant burnt orange and coral pixels clustering at bottom-center and transitioning into periwinkle blue and white toward the periphery.
- **Concentric Circular Timer**: Central dial floating over the matrix. Outer ring tracks elapsed minutes. Inner disc displays mode title (`"Deep work"`), giant countdown numerals (`"24:55"` in `text-[36px] font-bold text-[#1c1c1e]`), and blocked notification counter (`"11 held back"`).
- **Pinned Pill Chips**: Floating rounded tags anchored around the perimeter (`"dup in 5 min"`, `"🧾 Invoice #2041 paid"`).

---

### Reference 11: Progress Stepper Card ("Product roadmap")
*Linear milestone tracking with segmented progress bars and high-contrast numerical anchors.*

- **Segmented Horizontal Progress Track**: 5 horizontal bar segments separated by 4px gaps:
  - Completed segments: Solid black (`bg-[#1c1c1e]`).
  - Active segment: Partial fill.
  - Future segments: Soft gray (`bg-zinc-200`).
- **Hero Step Number & Title**: Giant step numeral `"03"` in extra-large pale gray (`text-[48px] font-bold text-zinc-300`), placed directly inline with the title `"Private beta"` (`text-[22px] font-bold text-[#1c1c1e]`).
- **Checklist Architecture**: Checklist items with green checkmarks in circular containers (`size-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center`).
- **Pagination Controls**: Bottom navigation with circular back `<` (`bg-zinc-100`) and next `>` (`bg-[#1c1c1e] text-white`) buttons.

---

### Reference 12: Chromatic Gauge & Dot-Matrix Display ("Body age")
*Vibrant warm chromatic sunset gradient paired with LED dot-matrix numerals and frosted glass rotary dials.*

- **Chromatic Canvas**: Sunset mesh gradient blending soft seafoam green, lavender, amber gold, and warm coral rose.
- **Dot-Matrix / LED Typography**: Metric value (`"25"`) rendered using a dotted 5x7 matrix grid font in pure white, providing an authentic retro-mechanical feel.
- **Glassmorphic Rotary Dial**:
  - Inset slider card: `rounded-[24px] bg-white/20 backdrop-blur-xl border border-white/30 p-4 shadow-lg`.
  - Dial ruler with fine vertical tick marks, white center needle with luminous glowing tip, and frosted circular `-` and `+` adjustment discs.

---

### Reference 13: Mobile Operating System Health Dashboard ("Alex Morgan")
*Complete mobile viewport composition demonstrating top-level hierarchy, dynamic island, and stacked card modules.*

- **Top Chrome**: iPhone frame with Dynamic Island, circular avatar, time-aware greeting (`"Good morning"`), and circular notification bell button (`size-10 rounded-full bg-zinc-100`).
- **Health Score Hero**: Elevated card (`rounded-[24px] bg-zinc-100/70 p-4`) with metric `"88/100"`, delta capsule `"+4"`, and mini 7-day bar chart with pill-capped bars.
- **Activity Row Modules**: Stacked clean cards (`rounded-[22px] bg-white border border-zinc-100 p-4 flex items-center justify-between`) displaying icon, metric title, and bold tabular values (`"Sleep: 7h 40m"`, `"Steps: 8,214"`).

---

## 3. Systematic Design Token Specifications

To guarantee exact visual parity with these reference artifacts, all components must strictly adhere to the following design token matrix.

### 3.1 Color Palette & Surface Contrast

| Token Role | Light Mode Value | Dark Mode Value | Usage Context |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#f8f8f6` (Warm Paper) | `#0c0c0e` (Deep OLED) | The page/screen viewport behind floating cards |
| **Surface Card** | `#ffffff` (Pure White) | `#1c1c1e` (Apple Dark) | Primary floating cards, drawers, dialogs |
| **Inset Module** | `#f1f1ef` (Refined Bone) | `#252528` (Dark Inset) | Sunk headers, nested utility blocks, status containers |
| **Interactive Fill (Subtle)** | `rgba(36, 36, 35, 0.04)` | `rgba(255, 255, 255, 0.05)` | Action cards, list item default states, secondary buttons |
| **Interactive Fill (Hover)** | `rgba(36, 36, 35, 0.07)` | `rgba(255, 255, 255, 0.08)` | Hover/pressed feedback states |
| **Primary Text** | `#242423` or `#1c1c1e` | `#f4f4f5` | Headings, primary titles, heavy numbers |
| **Secondary Text** | `rgba(36, 36, 35, 0.55)` | `rgba(244, 244, 245, 0.60)` | Subtitles, taglines, units, meta timestamps |
| **Tertiary / Caption Text** | `rgba(36, 36, 35, 0.35)` | `rgba(244, 244, 245, 0.40)` | Section uppercase trackers, empty states |
| **Hairline Border** | `rgba(36, 36, 35, 0.06)` | `rgba(255, 255, 255, 0.08)` | Dividing lines, outer card rings |
| **Pill Background (Active)** | `#ffffff` (`shadow-xs`) | `#323236` | Selected segmented control segment |

### 3.2 Accent & Polarity Colors (Semantic Only)

Never apply loud solid saturated fills across structural cards. Saturated color is strictly reserved for small dots, deltas, and progress bars:
- **Emerald (Success / Online / Mastered)**: `#10b981` (Light tint: `bg-emerald-500/10 text-emerald-700`)
- **Sky / Blue (Focus / Verified / Informational)**: `#0284c7` / `#0071e3` (Light tint: `bg-sky-500/10 text-sky-700`)
- **Amber / Orange (Brand / Streak / Away / Solar)**: `#f59e0b` / `#f97316` (Light tint: `bg-amber-500/10 text-amber-700`)
- **Rose / Red (Alert / Notifications / Negative)**: `#f43f5e` (Badge fill: `bg-rose-500 text-white`)
- **Violet / Purple (Grid / Advanced / Deep Work)**: `#8b5cf6` (Light tint: `bg-violet-500/10 text-violet-700`)

### 3.3 Continuous Corner Radius Hierarchy (Squircles)

```
┌────────────────────────────────────────────────────────┐  Outer Card: rounded-[28px] - rounded-[32px]
│  ┌──────────────────────────────────────────────────┐  │  
│  │                                                  │  │  Inset Header: rounded-[20px] - rounded-[22px]
│  └──────────────────────────────────────────────────┘  │  
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  
│  │              │  │              │  │              │  │  Action Chips: rounded-[16px] - rounded-[18px]
│  └──────────────┘  └──────────────┘  └──────────────┘  │  
│  [ (Squircle: rounded-[12px]) Title     [ Pill ] > ]   │  List Row: rounded-[14px] - rounded-[16px]
└────────────────────────────────────────────────────────┘  Badges & Controls: rounded-full
```

- **Viewport Sheets & Modals**: `rounded-[32px]`
- **Primary Section Cards**: `rounded-[26px]` sm: `rounded-[28px]`
- **Inset Modules & Top Headers**: `rounded-[18px]` sm: `rounded-[22px]`
- **Action Tiles & Utility Cards**: `rounded-[16px]` sm: `rounded-[18px]`
- **List Rows**: `rounded-[14px]` sm: `rounded-[16px]`
- **Icons & Monogram Squircle Badges**: `rounded-[10px]` sm: `rounded-[12px]`
- **Pills, Segmented Tracks & Controls**: `rounded-full`

---

## 4. Reusable Component Pattern Recipes

### 4.1 The Inset Header & Segmented Pill Control

```tsx
<div className="rounded-[22px] border border-black/[0.06] bg-white p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_-12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-[#1c1c1e] sm:rounded-[26px] sm:p-3.5">
  {/* Sunken Inset Header */}
  <div className="rounded-[18px] bg-[#f1f1ef] p-2.5 dark:bg-[#252528] sm:rounded-[20px] sm:p-3.5">
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div>
        <h2 className="text-[14px] font-semibold leading-5 text-[#242423] dark:text-[#f3f3f2] sm:text-[16px]">
          {title}
        </h2>
        <p className="text-[11px] text-[#242423]/60 dark:text-zinc-400 sm:text-[12px]">
          {subtitle}
        </p>
      </div>

      {/* Sunken Segmented Control Track */}
      <div
        role="radiogroup"
        className="grid w-full grid-cols-4 rounded-full bg-[#242423]/[0.05] p-0.5 dark:bg-white/[0.07] sm:flex sm:w-auto"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "relative flex h-7 cursor-pointer items-center justify-center rounded-full text-[11px] font-medium outline-none transition-colors sm:h-8 sm:px-3 sm:text-[12px]",
              active === tab.id
                ? "text-[#242423] dark:text-[#f3f3f2]"
                : "text-[#242423]/55 hover:text-[#242423] dark:text-zinc-400 dark:hover:text-zinc-200"
            )}
          >
            {active === tab.id && (
              <span className="absolute inset-0 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:bg-[#323236]" />
            )}
            <span className="relative">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
</div>
```

---

### 4.2 The 3-Column Utility Action Grid

```tsx
<div className="grid grid-cols-3 gap-1.5 sm:gap-2">
  {actions.map((action) => (
    <Link
      key={action.title}
      href={action.href}
      className="group relative flex h-[64px] cursor-pointer flex-col justify-between rounded-[16px] bg-[#242423]/[0.04] p-2 text-left outline-none transition-all duration-150 hover:bg-[#242423]/[0.07] active:scale-[0.97] dark:bg-white/[0.05] dark:hover:bg-white/[0.08] sm:h-[74px] sm:rounded-[18px] sm:p-2.5"
    >
      <div className="flex items-start justify-between">
        <span className="size-3.5 text-[#242423]/70 transition-colors group-hover:text-[#242423] dark:text-zinc-400 dark:group-hover:text-zinc-100 sm:size-4">
          <action.icon className="size-full" />
        </span>
        <ArrowUpRight className="size-3 text-[#242423]/40 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-zinc-500 sm:size-3.5" />
      </div>
      <span className="truncate text-[11px] font-semibold text-[#242423] dark:text-[#f3f3f2] sm:text-[12px]">
        {action.title}
      </span>
    </Link>
  ))}
</div>
```

---

### 4.3 The Streamlined Typographic List Row (No Heavy Block Noise)

```tsx
<Link
  href={item.href}
  className="group relative flex min-h-[56px] w-full cursor-pointer items-center justify-between rounded-[14px] px-3 py-2 text-left outline-none transition-all duration-150 hover:bg-[#242423]/[0.04] focus-visible:ring-2 focus-visible:ring-[#242423]/30 active:scale-[0.99] dark:hover:bg-white/[0.05] sm:min-h-[60px] sm:rounded-[16px] sm:px-3.5 sm:py-2.5"
>
  {/* Left: Typographic Identifier & Tagline */}
  <div className="min-w-0 flex-1 pr-3">
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center justify-center rounded-[8px] bg-[#242423]/[0.06] px-2 py-0.5 font-mono text-[12px] font-bold tracking-tight text-[#242423] dark:bg-white/[0.08] dark:text-[#f3f3f2] sm:text-[13px]">
        {item.code}
      </span>
      <span className="truncate text-[13.5px] font-semibold text-[#242423] dark:text-[#f3f3f2] sm:text-[14.5px]">
        {item.title}
      </span>
    </div>
    <p className="mt-0.5 truncate text-[11.5px] leading-4 text-[#242423]/55 dark:text-zinc-400 sm:text-[12.5px]">
      {item.description}
    </p>
  </div>

  {/* Right: Tabular Counter Pill & Chevron Circle */}
  <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
    <span className="rounded-full bg-[#242423]/[0.05] px-2 py-0.5 text-[10.5px] font-medium tabular-nums text-[#242423]/70 dark:bg-white/[0.08] dark:text-zinc-300 sm:px-2.5 sm:py-1 sm:text-[11px]">
      {item.count.toLocaleString()} words
    </span>
    <span className="grid size-7 place-items-center rounded-full text-[#242423]/40 transition-all duration-150 group-hover:bg-[#242423]/[0.06] group-hover:text-[#242423] group-hover:translate-x-0.5 dark:text-zinc-500 dark:group-hover:bg-white/[0.08] dark:group-hover:text-zinc-100 sm:size-8">
      <ChevronRight className="size-4" />
    </span>
  </div>
</Link>
```

---

### 4.4 Shimmering Liquid Progress Bar

```tsx
<div className="rounded-[16px] bg-[#242423]/[0.03] p-2.5 dark:bg-white/[0.04] sm:rounded-[18px] sm:p-3">
  <div className="flex items-center justify-between text-[11px] sm:text-[12px]">
    <span className="font-semibold text-[#242423] dark:text-[#f3f3f2]">
      {label}
    </span>
    <span className="tabular-nums text-[#242423]/60 dark:text-zinc-400">
      {current} of {target} {unit}
    </span>
  </div>

  <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-[#242423]/10 dark:bg-white/10">
    <div
      className="relative h-full overflow-hidden rounded-full bg-orange-500 transition-all duration-500"
      style={{ width: `${pct}%` }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/50 to-transparent"
        style={{ transform: "translateX(600%)" }}
      />
    </div>
  </div>
</div>
```

---

## 5. Responsive Small Screen Engineering (320px–375px)

Many interfaces look acceptable on a 1440px desktop but disintegrate on mobile viewports. To uphold this design standard, all components must pass these strict responsiveness constraints:

1. **Equal Distribution Grids**: Segmented filter controls must use `grid w-full grid-cols-4` on mobile rather than `flex`, ensuring every pill receives an exact 25% width without squishing or clipping text.
2. **Elimination of Text Duplication**: Never repeat metadata across the same list item (e.g., displaying `B1` inside an artificial box and `B1` in the title, or `1,200 words` in the subtitle and `1,200` in the right badge). Redundancy is the primary cause of mobile truncation.
3. **Safe Container Padding**: Mobile viewport outer gutters must use `px-2.5 py-3 sm:px-6 sm:py-8`. This preserves 300px of usable layout width even on 320px displays (iPhone SE 1st gen).
4. **Touch Target Accessibility**: Minimum interactive hit target is 44px (using touch margins / padding), even when visual pills are styled to `h-7` or `h-8`.

---

## 6. Verification Checklist for Future Feature Implementations

Before shipping any new interface or component in Zero English, verify against this 10-point audit:

- [ ] **Canvas Contrast**: Does the outer card float on a distinct warm background (`#f8f8f6` / `#0c0c0e`) rather than bleeding invisibly into a pure white body?
- [ ] **Inset Architecture**: Does the component employ a sunken header or module (`#f1f1ef`) inside the card shell?
- [ ] **No Solid Crayon Blocks**: Are list items free from heavy, solid-colored rainbow boxes?
- [ ] **Tabular Numerals**: Are all numbers, streaks, percentages, and counters styled with `tabular-nums`?
- [ ] **Radii Mathematical Hierarchy**: Do inner child radii decrease relative to outer parent radii?
- [ ] **Spring Haptic Press**: Do clickable items have `active:scale-[0.97]` or `active:scale-[0.985]` press feedback?
- [ ] **Hairline Ring Boundaries**: Are card borders styled with `border-black/[0.06]` / `ring-1 ring-black/5` rather than harsh solid borders?
- [ ] **Color Discipline**: Is color restricted to semantic indicators (status dots, trend arrows, progress fills)?
- [ ] **Mobile Narrow Check**: Does the interface render flawlessly down to 320px without horizontal scroll or text truncation?
- [ ] **Dark Mode Symmetry**: Are dark mode styles explicitly defined using Apple secondary/tertiary dark grouped background tokens (`#1c1c1e`, `#252528`, `#323236`)?
