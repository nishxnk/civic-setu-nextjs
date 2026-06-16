# Design Document
## Civic Setu — UI/UX Specifications & Design System

**Version:** 1.0
**Date:** 2026-06-16
**Framework:** Tailwind CSS 4 + Custom Design Tokens
**Target:** WCAG 2.1 AA | 22 Indian languages | PWA

---

## 1. Design Philosophy

### 1.1 Core Principles

| Principle | Meaning |
|---|---|
| **Saral (Simple)** | Every screen passable by a first-time internet user. No jargon. |
| **Vishwas (Trust)** | Government branding, transparency in process, no dark patterns. |
| **Sugam (Accessible)** | Screen reader ready, keyboard navigable, works on ₹5K smartphones. |
| **Sashakt (Empowering)** | Citizen is informed at every step — tracking number, timeline, resolution proof. |

### 1.2 Brand Identity

- **Name:** Civic Setu (सेतु = bridge)
- **Tagline:** "Bridging Citizens & Governance"
- **Tone:** Professional, reassuring, transparent, action-oriented
- **Color Philosophy:**
  - Primary: **Saffron/Orange** — energy, action, Indian governance identity
  - Secondary: **Deep Blue** — trust, stability, technology
  - Accent: **Green** — resolution, completion, progress

---

## 2. Design Tokens

### 2.1 Color Palette

```css
:root {
  /* ── Brand Colors ── */
  --color-brand-50:  #FFF7ED;   /* Lightest orange tint */
  --color-brand-100: #FFEDD5;
  --color-brand-200: #FED7AA;
  --color-brand-300: #FDBA74;
  --color-brand-400: #FB923C;
  --color-brand-500: #F97316;   /* Primary brand orange */
  --color-brand-600: #EA580C;
  --color-brand-700: #C2410C;
  --color-brand-800: #9A3412;
  --color-brand-900: #7C2D12;   /* Darkest orange */

  /* ── Secondary (Blue) ── */
  --color-blue-50:  #EFF6FF;
  --color-blue-100: #DBEAFE;
  --color-blue-200: #BFDBFE;
  --color-blue-300: #93C5FD;
  --color-blue-400: #60A5FA;
  --color-blue-500: #3B82F6;    /* Primary blue */
  --color-blue-600: #2563EB;
  --color-blue-700: #1D4ED8;
  --color-blue-800: #1E40AF;
  --color-blue-900: #1E3A8A;

  /* ── Neutrals ── */
  --color-gray-50:  #FAFAFA;    /* Page background */
  --color-gray-100: #F4F4F5;    /* Card background */
  --color-gray-200: #E4E4E7;    /* Borders */
  --color-gray-300: #D4D4D8;    /* Disabled */
  --color-gray-400: #A1A1AA;    /* Placeholder text */
  --color-gray-500: #71717A;    /* Secondary text */
  --color-gray-600: #52525B;    /* Body text */
  --color-gray-700: #3F3F46;    /* Sub-headings */
  --color-gray-800: #27272A;    /* Headings */
  --color-gray-900: #18181B;    /* Primary text */

  /* ── Semantic ── */
  --color-success:  #16A34A;    /* Resolved, approved */
  --color-warning:  #F59E0B;    /* SLA warning, pending */
  --color-error:    #DC2626;    /* Rejected, SLA breached */
  --color-info:     #0EA5E9;    /* In-progress, acknowledged */

  /* ── Status Badge Colors ── */
  --status-pending:       #F59E0B;   /* Amber */
  --status-acknowledged:  #0EA5E9;   /* Sky */
  --status-assigned:      #8B5CF6;   /* Violet */
  --status-in-progress:   #3B82F6;   /* Blue */
  --status-resolved:      #16A34A;   /* Green */
  --status-rejected:      #DC2626;   /* Red */
  --status-reopened:      #EC4899;   /* Pink */

  /* ── Priority Colors ── */
  --priority-critical: #DC2626;      /* Red */
  --priority-high:     #F97316;      /* Orange */
  --priority-medium:   #F59E0B;      /* Amber */
  --priority-low:      #6B7280;      /* Gray */
}
```

### 2.2 Typography

```
Font Family:
  - Primary: Inter (English) — clean, modern, highly readable
  - Hindi/Marathi: Noto Sans Devanagari
  - Tamil: Noto Sans Tamil
  - Telugu: Noto Sans Telugu
  - Kannada: Noto Sans Kannada
  - Malayalam: Noto Sans Malayalam
  - Bengali: Noto Sans Bengali
  - Gujarati: Noto Sans Gujarati
  - Odia: Noto Sans Oriya
  - Punjabi: Noto Sans Gurmukhi
  - Urdu: Noto Nastaliq Urdu
  - Monospace: JetBrains Mono (tracking numbers)

Font Scale (1.25 ratio):
  xs:     0.75rem  (12px)  — Captions, badges
  sm:     0.875rem (14px)  — Small body, table cells
  base:   1rem     (16px)  — Body text
  lg:     1.125rem (18px)  — Large body, card titles
  xl:     1.25rem  (20px)  — Section titles
  2xl:    1.5rem   (24px)  — Card headings
  3xl:    1.875rem (30px)  — Page headings
  4xl:    2.25rem  (36px)  — Hero title
  5xl:    3rem     (48px)  — Landing page hero

Font Weights:
  normal:   400  — Body
  medium:   500  — Emphasis, labels
  semibold: 600  — Card titles, navigation
  bold:     700  — Headings, hero
  extrabold:800  — Hero emphasis

Line Heights:
  tight:    1.25  — Headings
  snug:     1.375 — Sub-headings
  normal:   1.5   — Body text
  relaxed:  1.625 — Long-form content
```

### 2.3 Spacing Scale

```
Space Unit: 0.25rem (4px)

  0:    0
  px:   1px
  0.5:  0.125rem  (2px)
  1:    0.25rem   (4px)
  1.5:  0.375rem  (6px)
  2:    0.5rem    (8px)
  2.5:  0.625rem  (10px)
  3:    0.75rem   (12px)
  3.5:  0.875rem  (14px)
  4:    1rem      (16px)
  5:    1.25rem   (20px)
  6:    1.5rem    (24px)
  7:    1.75rem   (28px)
  8:    2rem      (32px)
  9:    2.25rem   (36px)
  10:   2.5rem    (40px)
  11:   2.75rem   (44px)
  12:   3rem      (48px)
  14:   3.5rem    (56px)
  16:   4rem      (64px)
  20:   5rem      (80px)
  24:   6rem      (96px)

Page Padding:
  Mobile:   px-4 (16px)
  Tablet:   px-6 (24px)
  Desktop:  px-8 (32px)
  Wide:     max-w-7xl mx-auto (1280px)
```

### 2.4 Border Radius

```
  none:    0
  sm:      0.125rem  (2px)   — Input borders
  DEFAULT: 0.25rem   (4px)   — Buttons, tags
  md:      0.375rem  (6px)   — Cards
  lg:      0.5rem    (8px)   — Modals
  xl:      0.75rem   (12px)  — Large cards
  2xl:     1rem      (16px)  — Panels
  full:    9999px            — Avatars, pills
```

### 2.5 Shadows

```
Elevation Scale:
  none:     none
  sm:       0 1px 2px 0 rgb(0 0 0 / 0.05)
  DEFAULT:  0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
  md:       0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
  lg:       0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
  xl:       0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
  2xl:      0 25px 50px -12px rgb(0 0 0 / 0.25)

Applied to:
  Cards:    shadow-sm → shadow-md on hover
  Modals:   shadow-xl
  Header:   shadow-sm (sticky)
  Dropdown: shadow-lg
```

---

## 3. Component Library

### 3.1 Primitive Components (`src/components/ui/`)

```
Button
├── Variants: primary | secondary | outline | ghost | danger
├── Sizes: sm | md | lg | icon
├── States: default | hover | active | disabled | loading
├── Icon support: leftIcon | rightIcon | iconOnly
└── Full width: block (mobile default)

Input
├── Types: text | email | password | number | phone | textarea
├── Variants: default | filled
├── States: default | focus | error | disabled | readonly
├── Addons: leftIcon | rightIcon | prefix | suffix
└── Validation: error message below

Select / Dropdown
├── Variants: native | custom (searchable)
├── Multi-select support
└── Grouped options

Modal
├── Sizes: sm | md | lg | xl | fullscreen
├── Sections: header | body | footer
├── Animation: fade + scale
└── Close: X button | backdrop click | Escape key

Card
├── Variants: default | interactive (hover) | stat
├── Sections: header | media | body | footer | actions
└── Padding: sm | md | lg

Badge / Tag
├── Variants: solid | outline | subtle
├── Colors: brand | success | warning | error | info | neutral
├── Sizes: sm | md
└── Removable (tag mode)

Table
├── Variants: simple | striped | bordered
├── Features: sortable headers, selectable rows, pagination
├── Responsive: horizontal scroll on mobile
└── Empty state slot

Tabs
├── Variants: underline | pills | cards
├── Responsive: horizontal scroll on mobile
└── Badge count on tab

Avatar
├── Sizes: xs | sm | md | lg | xl
├── Variants: image | initials | icon
└── Status indicator (online/offline)

Skeleton / Loading
├── Variants: text | circular | rectangular
├── Animation: pulse | shimmer
└── Composite: card skeleton, table skeleton

Toast / Notification
├── Types: success | error | warning | info
├── Positions: top-right | top-center | bottom-right
├── Duration: default 5s, persistent option
└── Actions: dismiss, action button

Progress Bar
├── Variants: determinate | indeterminate
├── Colors: brand | success | warning
├── Sizes: sm | md | lg
└── Label: percentage or custom text

Tooltip
├── Positions: top | bottom | left | right
├── Trigger: hover | click
└── Content: text | HTML (rich)

Breadcrumb
├── Separator: / | > | •
├── Collapsed: ... for deep paths
└── Last item: non-clickable

Pagination
├── Variants: simple (prev/next) | numbered | compact
├── Page size selector
└── Total count display

File Upload / Dropzone
├── States: default | drag-over | uploading | complete | error
├── Preview: image thumbnail
├── Multiple: file list with remove
└── Validation: file type, size indicator

Map Picker
├── Provider: Mapbox / Leaflet
├── Mode: view | pick (click to set pin)
├── Search: address geocoding input
└── Radius: circle overlay for search
```

### 3.2 Composite Components

```
ComplaintCard
  — thumbnail, title, status badge, tracking#, date, category icon

StatusTimeline
  — vertical stepper: each status change as a node
  — shows: icon, status label, timestamp, user, notes

StatsCard
  — icon, value (large number), label, trend indicator (% change)

ChartCard
  — card wrapper with title + chart (recharts/chart.js) + optional filter

DepartmentSelector
  — tree or grouped dropdown of departments/zones

AssignWorkerModal
  — modal with worker list, load indicator, search, assign button

SLATimer
  — circular countdown / linear progress bar
  — color changes: green → yellow → red as deadline approaches

SearchBar
  — input with icon, autocomplete dropdown, recent searches

LanguageSwitcher
  — dropdown with language name in native script + English
  — flag icons optional

FeedbackWidget
  — 5 stars (smileys for low-literacy mode)
  — optional comment box
```

---

## 4. Page Layouts

### 4.1 Public Layout

```
┌──────────────────────────────────────────────┐
│                HEADER (Sticky)                │
│  ┌──────┐                          ┌────────┐│
│  │ Logo │    Nav Links    Language │ Login  ││
│  └──────┘                          └────────┘│
├──────────────────────────────────────────────┤
│                                              │
│              PAGE CONTENT                     │
│           (max-w-7xl mx-auto)                │
│                                              │
├──────────────────────────────────────────────┤
│                FOOTER                         │
│  Col 1    Col 2    Col 3    Col 4            │
│  About    Links    Contact   Social          │
│  Copyright │ Terms │ Privacy                 │
└──────────────────────────────────────────────┘
```

### 4.2 Authenticated Layout (Citizen/Admin/Worker)

```
┌──────────────────────────────────────────────────────────┐
│                     HEADER (Sticky)                       │
│  ┌──────┐  ┌──────────────┐  ┌──────┐  ┌─────┐  ┌──────┐│
│  │ Logo │  │ Search Bar   │  │🔔    │  │Avatar│  │      ││
│  │      │  │ (universal)  │  │Notifs│  │  ▼   │  │      ││
│  └──────┘  └──────────────┘  └──────┘  └─────┘  └──────┘│
├──────────┬───────────────────────────────────────────────┤
│          │                                                │
│ SIDEBAR  │             MAIN CONTENT AREA                  │
│          │                                                │
│ ──────── │  ┌──────────────────────────────────────┐     │
│Dashboard │  │  Page Header (title + breadcrumb +    │     │
│          │  │              action buttons)           │     │
│Complaints│  └──────────────────────────────────────┘     │
│          │                                                │
│Users*    │  ┌──────────────────────────────────────┐     │
│          │  │                                      │     │
│Depts*    │  │        Page-specific content         │     │
│          │  │                                      │     │
│Analytics*│  │                                      │     │
│          │  │                                      │     │
│Settings* │  │                                      │     │
│          │  └──────────────────────────────────────┘     │
│          │                                                │
│ Collapse │                                                │
│ ◄───►    │                                                │
└──────────┴────────────────────────────────────────────────┘

* Admin only items — shown/hidden based on role

Sidebar on Mobile:
  - Hidden by default
  - Hamburger menu in header → slide-in drawer (left)
  - Overlay backdrop
  - Swipe to close
```

### 4.3 Landing Page Layout

```
┌──────────────────────────────────────────────────────────┐
│ HERO SECTION (full viewport height)                       │
│                                                           │
│   ┌────────────────────────────────────────────────┐     │
│   │  विश्वास का सेतु — Bridging Citizens &          │     │
│   │                 Governance                      │     │
│   │                                                 │     │
│   │  Report civic issues. Track resolution.         │     │
│   │  Powered by AI. Driven by transparency.         │     │
│   │                                                 │     │
│   │  [File Complaint]  [Track Status]  [Learn More] │     │
│   └────────────────────────────────────────────────┘     │
│                                                           │
│   Background: Gradient overlay on cityscape / map image   │
├───────────────────────────────────────────────────────────┤
│ LIVE STATS BAR                                            │
│   ┌────────┐  ┌──────────┐  ┌────────────┐  ┌──────────┐│
│   │ 12,450 │  │  10,892  │  │  36 hours  │  │  4.3/5   ││
│   │Complain│  │ Resolved │  │ Avg Time   │  │  CSAT    ││
│   └────────┘  └──────────┘  └────────────┘  └──────────┘│
├───────────────────────────────────────────────────────────┤
│ HOW IT WORKS (3 steps)                                    │
│   ┌─────┐     ┌─────┐     ┌─────┐                        │
│   │ 📸  │ ──► │ 🔍  │ ──► │ ✅  │                        │
│   │ File│     │Track │     │ Get │                        │
│   └─────┘     └─────┘     └─────┘                        │
├───────────────────────────────────────────────────────────┤
│ FEATURES GRID                                             │
│   AI Detection │ Real-time Tracking │ Multi-Channel       │
│   Geo Mapping  │ SLA Guaranteed     │ Digital Governance  │
├───────────────────────────────────────────────────────────┤
│ TESTIMONIALS / CASE STUDIES                               │
├───────────────────────────────────────────────────────────┤
│ CTA SECTION                                               │
│   "Ready to transform civic governance?"                  │
│   [Get Started]  [Contact Sales]                          │
├───────────────────────────────────────────────────────────┤
│ FOOTER                                                    │
└───────────────────────────────────────────────────────────┘
```

---

## 5. Responsive Breakpoints

```
Breakpoint    Width         Design Behavior
─────────     ─────         ────────────────
  xs          < 640px       Mobile (default)
  sm          640px+        Large mobile
  md          768px+        Tablet portrait
  lg          1024px+       Tablet landscape / Small desktop
  xl          1280px+       Desktop
  2xl         1536px+       Wide desktop

Mobile-first adaptations:
  - Single column → multi-column grid
  - Stacked cards → side-by-side
  - Hidden sidebar → visible sidebar
  - Full-width buttons → auto-width
  - Simplified charts → full charts
  - Bottom sheet → modal
  - Swipe gestures → click
  - Touch targets ≥ 48px
```

---

## 6. Key Screen Wireframes

### 6.1 Complaint Form (3-Step Wizard)

```
┌─────────────────────────────────────────────┐
│  ◄ Back     File a Complaint    Step 1 of 3 │
├─────────────────────────────────────────────┤
│                                             │
│         Select Category                     │
│                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │ 🛣️ Road │ │ 💡     │ │ 💧     │      │
│  │         │ │Lighting │ │  Water  │      │
│  └─────────┘ └─────────┘ └─────────┘      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │ 🗑️      │ │ 🚦     │ │ 📋     │      │
│  │Sanitation│ │Traffic  │ │  Other  │      │
│  └─────────┘ └─────────┘ └─────────┘      │
│                                             │
│             [Select & Continue]             │
│                                             │
├─────────────────────────────────────────────┤
│  ● Step 1    ○ Step 2    ○ Step 3          │
└─────────────────────────────────────────────┘
```

### 6.2 Admin Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  Dashboard          [Date Range ▼]  [Export]            │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ 12,450   │ │  3,218   │ │  5,012   │ │   892    │   │
│  │ Total    │ │ Pending  │ │InProgress│ │ Resolved │   │
│  │ ↑12%     │ │ ↓3%     │ │ →steady │ │ ↑18%    │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                         │
│  ┌──────────────────────────┐ ┌──────────────────────┐  │
│  │                          │ │                      │  │
│  │   Monthly Trend (Line)   │ │  Category Pie        │  │
│  │                          │ │                      │  │
│  │   /\    /\               │ │  Road     ████████   │  │
│  │  /  \  /  \    /\        │ │  Water    ████       │  │
│  │ /    \/    \  /  \       │ │  Lighting ███        │  │
│  │/              \/    \     │ │  Sanit.   ██         │  │
│  └──────────────────────────┘ └──────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Department Performance (Bar)         │  │
│  │  PWD     ████████████████████  85%               │  │
│  │  Water   ██████████████        72%               │  │
│  │  Elect.  ████████████          68%               │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Recent Complaints            [View All →]       │  │
│  │  CIV-2026-1234  Pothole on MG Road     Pending   │  │
│  │  CIV-2026-1233  Streetlight out        Assigned  │  │
│  │  CIV-2026-1232  Water leakage          In Prog   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 6.3 Complaint Detail Page

```
┌─────────────────────────────────────────────────────────┐
│  ◄ Back to Complaints        CIV-2026-1234              │
│                             [Share] [Print]              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Pothole on MG Road, Near Andheri Station         │   │
│  │                                                  │   │
│  │ ┌────────┐  ┌──────────┐  ┌────────┐           │   │
│  │ │  Road  │  │ In-Progress│  │  High  │           │   │
│  │ └────────┘  └──────────┘  └────────┘           │   │
│  │                                                  │   │
│  │ Reported: 15 Jun 2026  |  SLA Deadline: 17 Jun   │   │
│  │ Assigned To: Rajesh Kumar (PWD Worker)           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────┐ ┌────────────────────────┐   │
│  │                      │ │                        │   │
│  │   Location Map       │ │   Status Timeline      │   │
│  │   (Leaflet/Mapbox)   │ │                        │   │
│  │                      │ │ ● Complaint Filed      │   │
│  │      📍              │ │   15 Jun, 10:30 AM     │   │
│  │                      │ │   by citizen           │   │
│  │                      │ │                        │   │
│  │                      │ │ ● Acknowledged         │   │
│  │                      │ │   15 Jun, 11:15 AM     │   │
│  │                      │ │   by Admin             │   │
│  │                      │ │                        │   │
│  │                      │ │ ● Assigned to Worker   │   │
│  │                      │ │   15 Jun, 2:00 PM      │   │
│  │                      │ │                        │   │
│  │                      │ │ ◉ In Progress          │   │
│  │                      │ │   16 Jun, 9:30 AM      │   │
│  │                      │ │   Worker on site       │   │
│  │                      │ │                        │   │
│  │                      │ │ ○ Resolved (pending)   │   │
│  └──────────────────────┘ └────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Attachments                                       │  │
│  │ ┌────────┐ ┌────────┐                            │  │
│  │ │ Before │ │  AI    │                            │  │
│  │ │ Photo  │ │ Detect │                            │  │
│  │ └────────┘ └────────┘                            │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 6.4 Mobile: Worker Task Card

```
┌─────────────────────────┐
│ ⬅ Tasks        🔔  👤   │
├─────────────────────────┤
│   🔴 High Priority (2)  │
│                         │
│ ┌─────────────────────┐ │
│ │ 🛣️ Pothole Repair   │ │
│ │                     │ │
│ │ MG Road, Near       │ │
│ │ Andheri Station     │ │
│ │                     │ │
│ │ ⏰ SLA: 4h 32m left │ │
│ │ 🔴 Critical         │ │
│ │                     │ │
│ │ [Navigate] [Start]  │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ 💡 Streetlight Fix  │ │
│ │                     │ │
│ │ SV Road, Jogeshwari │ │
│ │                     │ │
│ │ ⏰ SLA: 12h 15m left│ │
│ │ 🟡 Medium           │ │
│ │                     │ │
│ │ [Navigate] [Start]  │ │
│ └─────────────────────┘ │
│                         │
│   🟢 Low Priority (1)   │
│                         │
│ ┌─────────────────────┐ │
│ │ 🗑️ Drain Cleaning   │ │
│ │                     │ │
│ │ Link Road, Andheri  │ │
│ │                     │ │
│ │ ⏰ SLA: 36h left    │ │
│ │ 🟢 Low              │ │
│ │                     │ │
│ │ [Navigate] [Start]  │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

---

## 7. Accessibility Requirements (WCAG 2.1 AA)

### 7.1 Checklist

| Requirement | Implementation |
|---|---|
| **Color Contrast** | ≥ 4.5:1 for text, ≥ 3:1 for large text |
| **Non-color indicators** | Status icons + text (not just color badges) |
| **Keyboard navigation** | All interactive elements focusable, visible focus ring |
| **Skip to content** | "Skip to main content" link as first tabbable element |
| **Screen reader** | ARIA labels on all interactive elements, alt text on images |
| **Form labels** | Every input has visible + programmatic label |
| **Error messages** | Announced via aria-live, linked to field via aria-describedby |
| **Language** | `lang` attribute on HTML, `lang` switch per component for mixed content |
| **Text resize** | Supports 200% zoom without horizontal scrolling |
| **Motion** | Respects `prefers-reduced-motion` |
| **Touch targets** | ≥ 48×48px (WCAG 2.5.5) |
| **Heading hierarchy** | Single H1 per page, sequential heading levels |
| **Tables** | Caption, proper th/td, scope attributes |

### 7.2 Language & RTL Support

```css
/* Hindi, Marathi, etc. — LTR */
html[lang="hi"],
html[lang="mr"] { direction: ltr; }

/* Urdu — RTL */
html[lang="ur"] {
  direction: rtl;
  /* Mirror layout: sidebar on right, etc. */
}
```

---

## 8. Animation & Micro-interactions

```
Page Transitions:
  - Route change: subtle fade (150ms)
  - Modal open: scale(0.95) → scale(1) + fade (200ms)
  - Modal close: reverse (150ms)
  - Drawer: slide in from edge (250ms)

Micro-interactions:
  - Button hover: scale(1.02), shadow increase (150ms)
  - Button click: scale(0.98) (100ms)
  - Card hover: translateY(-2px), shadow-md (200ms)
  - Status change: pulse badge then settle (500ms)
  - Skeleton: shimmer animation (1.5s infinite)
  - Page load: staggered card fade-in (50ms stagger)
  - Toast enter: slide-in from right + fade (300ms)
  - Toast exit: slide-out right + fade (200ms)

Feedback:
  - File upload: progress bar fill + percentage
  - Form submit: button → spinner + "Submitting..."
  - Success: green checkmark animation + toast
  - Error: input shake + red border + error text
  - SLA warning: timer turns yellow, then red pulse
```

---

## 9. Iconography

```
Icon Library: Lucide React (preferred) or Font Awesome 6

Icon Sizes:
  sm:  16px  — inline with text, badges
  md:  20px  — buttons, form inputs
  lg:  24px  — card headers, navigation
  xl:  32px  — empty states, feature cards
  2xl: 48px  — hero sections

Key Icons by Category:
  Navigation:  ChevronLeft, ChevronRight, Home, Menu, X
  Actions:     Plus, Edit, Trash2, Share2, Download, Upload
  Status:      Clock, CheckCircle, XCircle, AlertTriangle, Loader
  Categories:  Construction, Lightbulb, Droplets, Trash2, TrafficCone
  Users:       User, Users, UserCheck, Shield, Key
  Communication: Mail, Phone, MessageCircle, Bell
  Maps:        MapPin, Navigation, Compass
  Files:       Image, Video, FileText, Paperclip
  General:     Search, Filter, Calendar, Settings, LogOut, Info
```

---

## 10. PWA & Mobile Specifications

```
manifest.json:
  name: "Civic Setu"
  short_name: "Setu"
  description: "Civic Grievance Resolution Platform"
  theme_color: "#F97316"       // brand-500
  background_color: "#FFFFFF"
  display: "standalone"
  orientation: "any"
  icons:
    - 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
  screenshots: (for install prompt)
    - Desktop dashboard
    - Mobile complaint form
    - Mobile tracking

Service Worker:
  - Cache static assets (CSS, JS, fonts, icons)
  - Cache API responses (stale-while-revalidate)
  - Offline fallback page
  - Background sync for worker updates
```
