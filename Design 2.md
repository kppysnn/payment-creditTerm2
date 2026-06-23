# WorkX — Design Guidelines

> **File:** `Exzy_WorkX.fig` · Exported 2026-06-19  
> ไฟล์นี้สรุปจากการวิเคราะห์ Figma file ของ WorkX — HR & Work Management Platform

---

## 1. Brand Identity

**WorkX** เป็น HR / Workforce Management Platform ที่มี visual identity แนว **Professional-Modern** — ใช้สีเข้มที่ดูน่าเชื่อถือ ผสมกับ accent สีสดใสสไตล์ SaaS รุ่นใหม่ โทนรวมคือ "Enterprise ที่ไม่น่าเบื่อ"

### Design Philosophy
- **Clarity first** — Layout จัดข้อมูลเป็นลำดับชัดเจน ใช้ white space อย่างตั้งใจ
- **Data-forward** — UI เน้นนำเสนอข้อมูล HR/Workforce ได้รวดเร็ว
- **Accessible dark/light** — รองรับทั้ง Dark Mode (Dashboard) และ Light Mode (Forms/Landing)

---

## 2. Color System

### Primary Palette

| Role | Token | Hex | การใช้งาน |
|------|-------|-----|-----------|
| **Brand Primary** | `color-primary` | `#5B4EFF` | CTA button, active state, accent highlight |
| **Brand Dark** | `color-primary-dark` | `#3D31E0` | Hover state ของ primary button |
| **Surface Dark** | `color-surface-dark` | `#0F0E1A` | Dark sidebar, nav background |
| **Surface Mid** | `color-surface-mid` | `#1A1830` | Card background ใน dark mode |
| **Surface Light** | `color-surface-light` | `#F5F5F7` | Page background ใน light mode |
| **White** | `color-white` | `#FFFFFF` | Card background, modal, light form |

### Secondary / Semantic Colors

| Role | Token | Hex | การใช้งาน |
|------|-------|-----|-----------|
| **Success** | `color-success` | `#22C55E` | Badge "Active", status indicator |
| **Warning** | `color-warning` | `#F59E0B` | Pending status, caution alert |
| **Danger** | `color-danger` | `#EF4444` | Error, rejected, destructive action |
| **Info** | `color-info` | `#3B82F6` | Info badge, notification |
| **Neutral 100** | `color-neutral-100` | `#F3F4F6` | Table row alternate, subtle bg |
| **Neutral 400** | `color-neutral-400` | `#9CA3AF` | Placeholder text, disabled |
| **Neutral 700** | `color-neutral-700` | `#374151` | Body text ใน light mode |
| **Neutral 900** | `color-neutral-900` | `#111827` | Heading text ใน light mode |

### Gradient

```css
/* Brand gradient — ใช้กับ hero section / landing page */
background: linear-gradient(135deg, #5B4EFF 0%, #8B5CF6 50%, #A78BFA 100%);

/* Dark surface gradient — sidebar/nav */
background: linear-gradient(180deg, #0F0E1A 0%, #1A1830 100%);
```

---

## 3. Typography

### Font Stack

| Role | Font Family | Weight | Size range |
|------|-------------|--------|------------|
| **Display / Hero** | `Inter` | 700–800 | 40–64px |
| **Heading** | `Inter` | 600–700 | 20–32px |
| **Body** | `Inter` | 400–500 | 14–16px |
| **Caption / Label** | `Inter` | 400 | 11–13px |
| **UI Mono (data)** | `JetBrains Mono` หรือ `system mono` | 400–500 | 12–14px |

> WorkX ใช้ **Inter** เป็น primary typeface เดียว เปลี่ยน weight และ size เพื่อสร้าง hierarchy — เหมาะกับ B2B SaaS ที่ต้องอ่านง่ายในหน้าจอ data-dense

### Type Scale

```
Display:   64px / line-height 1.1 / weight 800
H1:        40px / line-height 1.2 / weight 700
H2:        32px / line-height 1.3 / weight 700
H3:        24px / line-height 1.4 / weight 600
H4:        20px / line-height 1.4 / weight 600
Body LG:   18px / line-height 1.6 / weight 400
Body:      16px / line-height 1.6 / weight 400
Body SM:   14px / line-height 1.5 / weight 400
Caption:   12px / line-height 1.4 / weight 400
Label:     11px / line-height 1.3 / weight 500 / letter-spacing 0.5px
```

---

## 4. Spacing System

ใช้ base unit = **4px** (0.25rem) — spacing ทุกค่าเป็น multiple ของ 4

| Token | Value | การใช้งาน |
|-------|-------|-----------|
| `space-1` | 4px | Icon gap, inline element |
| `space-2` | 8px | Input padding inline, badge padding |
| `space-3` | 12px | Button padding inline |
| `space-4` | 16px | Card padding, form field gap |
| `space-5` | 20px | Section inner padding |
| `space-6` | 24px | Card gap, grid gap |
| `space-8` | 32px | Section vertical padding |
| `space-10` | 40px | Large section gap |
| `space-12` | 48px | Hero section padding |
| `space-16` | 64px | Page section break |

---

## 5. Border Radius

```
radius-sm:   4px   — Input, Tag, small badge
radius-md:   8px   — Button, Card, Dropdown
radius-lg:   12px  — Modal, Sheet, large Card
radius-xl:   16px  — Feature card, Hero card
radius-2xl:  24px  — Landing section card
radius-full: 9999px — Avatar, Pill badge, Toggle
```

---

## 6. Shadow / Elevation

```css
/* Subtle — Card resting state */
shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);

/* Default — Card hover, Dropdown */
shadow-md: 0 4px 12px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.06);

/* Elevated — Modal, Popover */
shadow-lg: 0 10px 32px rgba(0,0,0,0.16), 0 4px 8px rgba(0,0,0,0.08);

/* Brand glow — Primary button, active element */
shadow-brand: 0 0 20px rgba(91,78,255,0.35);
```

---

## 7. Components

### 7.1 Button

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| **Primary** | `#5B4EFF` | White | — |
| **Secondary** | Transparent | `#5B4EFF` | 1.5px `#5B4EFF` |
| **Ghost** | Transparent | `#374151` | — |
| **Danger** | `#EF4444` | White | — |
| **Disabled** | `#E5E7EB` | `#9CA3AF` | — |

```
Button sizes:
  SM:  height 32px / padding 8–12px / font 13px
  MD:  height 40px / padding 12–16px / font 14px
  LG:  height 48px / padding 16–24px / font 16px
  XL:  height 56px / padding 20–32px / font 18px
```

### 7.2 Input / Form Field

```
Height:         40px (MD), 48px (LG)
Border:         1px solid #D1D5DB (resting)
Border focus:   1.5px solid #5B4EFF + shadow-brand subtle
Border radius:  8px
Padding:        12px 16px
Label:          12px / weight 500 / color #374151
Placeholder:    color #9CA3AF
```

### 7.3 Badge / Status Chip

```
Padding:        2px 8px
Border radius:  9999px (pill)
Font size:      11–12px / weight 500

Active / Success:   bg #DCFCE7 / text #16A34A
Pending / Warning:  bg #FEF3C7 / text #B45309
Inactive / Error:   bg #FEE2E2 / text #DC2626
Info / Default:     bg #DBEAFE / text #1D4ED8
```

### 7.4 Card

```
Background:     #FFFFFF (light) / #1A1830 (dark)
Border:         1px solid #F3F4F6 (light) / 1px solid rgba(255,255,255,0.06) (dark)
Border radius:  12px
Padding:        24px
Shadow:         shadow-sm (resting), shadow-md (hover)
```

### 7.5 Navigation / Sidebar

```
Background:     #0F0E1A (dark)
Width:          240px (expanded) / 64px (collapsed)
Item height:    44px
Active item:    bg rgba(91,78,255,0.15) / text #5B4EFF / border-left 3px #5B4EFF
Inactive item:  text rgba(255,255,255,0.6)
Hover item:     bg rgba(255,255,255,0.06)
Icon size:      20px
Font:           14px / weight 500
```

### 7.6 Table

```
Header bg:      #F9FAFB
Header text:    12px / weight 600 / uppercase / letter-spacing 0.5px / color #6B7280
Row height:     52px
Cell padding:   12px 16px
Divider:        1px solid #F3F4F6
Row hover:      bg #F9FAFB
Checkbox:       border-radius 4px / active color #5B4EFF
```

### 7.7 Avatar

```
Sizes:          24px / 32px / 40px / 48px / 64px
Border radius:  full (circle)
Font fallback:  Initials centered, bg gradient from brand palette
Border:         2px solid white (in avatar group)
Stack overlap:  -8px margin-left
```

### 7.8 Modal / Dialog

```
Overlay:        rgba(0,0,0,0.5) backdrop-blur 4px
Modal bg:       #FFFFFF
Border radius:  16px
Max width:      480px (SM) / 640px (MD) / 800px (LG)
Padding:        32px
Header:         H3 + close button (top-right)
Footer:         flex / justify-end / gap 12px
```

---

## 8. Layout & Grid

### Page Layout (Dashboard)

```
┌─────────────────────────────────────────────────┐
│  Sidebar (240px)  │  Content Area (fluid)        │
│  [Dark navy]      │  [Light gray #F5F5F7]         │
│                   │                               │
│  Logo             │  ┌─ Topbar (64px height) ─┐  │
│  Nav items        │  │  Search | Notif | Avatar│  │
│                   │  └────────────────────────┘  │
│                   │                               │
│                   │  ┌─ Page Content ──────────┐  │
│                   │  │  padding: 32px           │  │
│                   │  │  max-width: 1280px       │  │
│                   │  └─────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Content Grid

```
Columns:    12-column grid
Gap:        24px (desktop) / 16px (tablet) / 0px (mobile full-bleed)
Container:  max-width 1280px / padding 0 32px
```

### KPI Cards Row

```
Desktop:    4 columns (3 col each)
Tablet:     2 columns
Mobile:     1 column

Card content:
  - Icon (40px, rounded-lg, brand bg)
  - Metric value (H2, weight 700)
  - Label (caption, neutral-400)
  - Change indicator (badge, +/- %)
```

### Responsive Breakpoints

```
Mobile:   < 640px
Tablet:   640px – 1024px
Desktop:  1024px – 1280px
Wide:     > 1280px
```

---

## 9. Iconography

- **Icon library:** Lucide Icons (stroke-based, consistent 1.5px stroke)
- **Sizes:** 16px (inline), 20px (button/nav), 24px (feature), 32px+ (empty state)
- **Color:** Inherits from text color หรือ semantic color
- **Style:** ไม่ fill — ใช้ outline/stroke เท่านั้น ให้ดู clean

---

## 10. Motion & Interaction

```
Transition default:   all 150ms ease
Button hover:         scale(1.01) + shadow deepen (100ms)
Card hover:           translateY(-2px) + shadow-md (200ms ease-out)
Modal open:           scale(0.96→1) + opacity(0→1) (200ms ease-out)
Sidebar collapse:     width transition 250ms ease-in-out
Page transition:      fade + slide-up 8px (200ms)
Skeleton loading:     pulse animation 1.5s infinite
```

---

## 11. Page Templates

### 11.1 Dashboard (Home)
- Topbar: breadcrumb, search, notification bell, user avatar
- KPI row: 4 metric cards
- Main area: Chart (left 60%) + Activity feed (right 40%)
- Data table: เต็ม width ด้านล่าง

### 11.2 List Page (Employee / Leave / etc.)
- Page header: Title + CTA button (right)
- Filter row: Search input + dropdown filters + export button
- Data table: sortable columns, row actions (3-dot menu)
- Pagination: bottom-right

### 11.3 Detail / Profile Page
- Top: Hero section — Avatar (large) + ชื่อ + role + status badge
- Tabs: Personal Info / Documents / Leave / Performance
- Form sections: Label + field แบบ 2-column grid

### 11.4 Form / Modal
- Section headers คั่น group
- Field label อยู่เหนือ input เสมอ (ไม่ใช้ floating label)
- Required field: asterisk (*) สีแดงต่อท้าย label
- Error message: text สีแดง 12px ใต้ field
- Action buttons: ด้านล่าง, Primary ขวา, Cancel ซ้าย

### 11.5 Landing / Marketing Page
- Hero: Full-width gradient bg + headline ขนาดใหญ่ + subtext + 2 CTA buttons
- Feature section: Icon + Title + Description แบบ 3-column grid
- Social proof: Logos bar + Testimonial cards
- Pricing: Card grid แบบ side-by-side
- CTA footer: Dark bg + headline + single CTA button

---

## 12. Dark Mode Tokens

| Token | Light | Dark |
|-------|-------|------|
| `bg-page` | `#F5F5F7` | `#0A0918` |
| `bg-card` | `#FFFFFF` | `#1A1830` |
| `bg-sidebar` | — | `#0F0E1A` |
| `text-primary` | `#111827` | `#F9FAFB` |
| `text-secondary` | `#374151` | `#D1D5DB` |
| `text-muted` | `#6B7280` | `#6B7280` |
| `border-default` | `#E5E7EB` | `rgba(255,255,255,0.08)` |
| `border-subtle` | `#F3F4F6` | `rgba(255,255,255,0.04)` |

---

## 13. Accessibility Checklist

- [ ] Color contrast ≥ 4.5:1 สำหรับ body text (WCAG AA)
- [ ] Focus ring: `outline: 2px solid #5B4EFF` + `outline-offset: 2px`
- [ ] Interactive elements มี minimum touch target 44×44px
- [ ] Form inputs มี associated `<label>` ทุกตัว
- [ ] Error messages เชื่อมกับ input ด้วย `aria-describedby`
- [ ] Icon-only buttons มี `aria-label`
- [ ] Status colors ไม่ใช้ color เป็น sole indicator (ต้องมี text/icon ด้วย)

---

## 14. CSS Custom Properties Reference

```css
:root {
  /* Brand */
  --color-primary:       #5B4EFF;
  --color-primary-dark:  #3D31E0;
  --color-primary-light: #8B5CF6;

  /* Surface */
  --color-bg-page:       #F5F5F7;
  --color-bg-card:       #FFFFFF;
  --color-bg-sidebar:    #0F0E1A;

  /* Text */
  --color-text-primary:   #111827;
  --color-text-secondary: #374151;
  --color-text-muted:     #6B7280;
  --color-text-disabled:  #9CA3AF;

  /* Border */
  --color-border:        #E5E7EB;
  --color-border-subtle: #F3F4F6;

  /* Semantic */
  --color-success:       #22C55E;
  --color-warning:       #F59E0B;
  --color-danger:        #EF4444;
  --color-info:          #3B82F6;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* Radius */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px;

  /* Shadow */
  --shadow-sm:    0 1px 3px rgba(0,0,0,0.08);
  --shadow-md:    0 4px 12px rgba(0,0,0,0.12);
  --shadow-lg:    0 10px 32px rgba(0,0,0,0.16);
  --shadow-brand: 0 0 20px rgba(91,78,255,0.35);

  /* Transition */
  --transition-fast:    150ms ease;
  --transition-default: 200ms ease-out;
  --transition-slow:    300ms ease-in-out;

  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

---

*Generated from `Exzy_WorkX.fig` visual analysis · WorkX Design System v1.0*
