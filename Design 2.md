# W+ Library — Design System Analysis

> **Source:** Figma file `60RgjevWzbKhCCjoc5kcmk` (W+ library) · Analyzed 2026-06-23  
> **Scope:** 182 styles (42 fills · 121 text · 19 effects) via Figma Styles API  
> **Purpose:** เอกสารอ้างอิงหลักสำหรับ payment&creditTerm ซึ่งเป็นส่วนหนึ่งของเว็บหลัก W+

---

## 1. Brand Identity

**W+** (WorkPlus / Exzy platform) ใช้ visual language แนว **Professional-Clean** — ระบบสีที่มีโครงสร้างชัดเจน ออกแบบมาสำหรับ B2B internal tool ที่ต้องการความน่าเชื่อถือและอ่านง่าย

### Design Philosophy

- **Semantic color system** — ทุกสีมีชื่อบอก role ชัดเจน (`text/title`, `button/primary`) ไม่ใช้ค่า hex ตรงๆ ใน component
- **Component-first** — มี component library ครบ: Button, Field, Modal, Sidemenu, Dashboard Card, Tag, Step form
- **Typography scale ครบ** — 11 ขนาด × 9 น้ำหนัก = 99 text styles + special field/header styles
- **Light mode เป็น default** — dashboard ใช้ white/light grey background, sidebar ใช้สี navy เข้ม

---

## 2. Color System

### 2.1 Core Brand Palette (EXZY CI)

| Role | Hex | ชื่อใน Figma | การใช้งานหลัก |
|------|-----|-------------|---------------|
| **Navy (Anchor)** | `#004081` | — | Sidebar bg, heading, button primary bg, icon active |
| **Navy Dark** | `#002D5C` | — | Hover state ของ navy element |
| **Teal (Signal)** | `#66C5C5` | — | Accent, focus ring, active indicator, CTA highlight |
| **Teal Dark** | `#4AADAD` | — | Hover state ของ teal element |

> Navy คือ "anchor" — ให้ความรู้สึก enterprise, trustworthy  
> Teal คือ "signal" — ดึงความสนใจ, interactive state

### 2.2 Semantic Fill Tokens (จาก Figma Styles API)

ระบบสีของ W+ ใช้ semantic naming แบ่งเป็น 8 กลุ่ม:

#### Background (`bg/`)
| Token | การใช้งาน | ค่าที่ใช้ใน project |
|-------|-----------|-------------------|
| `bg/white` | Card, modal, form background | `#FFFFFF` |
| `bg/grey` | Page background, section separator | `#F2F6F8` |
| `bg/table header` | Table header row background | `#F2F6F8` |

#### Button (`button/`)
| Token | การใช้งาน |
|-------|-----------|
| `button/primary` | Primary CTA — navy/teal gradient |
| `button/secondary` | Secondary — outline หรือ wash |
| `button/hover` | Hover state ของ button |
| `button/white` | White/ghost button บน dark bg |
| `button/disable` | Disabled state |
| `button/error` | Destructive action |
| `button/warning` | Warning action |
| `button/metropolis` | Special branded button variant |

#### Field (`field/`)
| Token | การใช้งาน |
|-------|-----------|
| `field/default` | Input resting state background |
| `field/disable` | Disabled input background |
| `field/read-only` | Read-only input (slightly different from disable) |
| `field/overlay` | Dropdown/overlay panel background |
| `field/remark` | Remark/note field background |

#### Icon (`icon/`)
| Token | การใช้งาน |
|-------|-----------|
| `icon/default` | Default icon color |
| `icon/active` | Active/selected icon (navy) |
| `icon/selected` | Currently selected item icon |
| `icon/completed` | Completed step icon (teal/green) |
| `icon/attention` | Warning icon |
| `icon/error` | Error icon |
| `icon/disable` | Disabled icon |
| `icon/white` | Icon บน dark background |

#### Sidebar (`sidemenu/`)
| Token | การใช้งาน |
|-------|-----------|
| `sidemenu/default` | Sidebar item resting state |
| `sidemenu/hover` | Sidebar item hover state |

#### Stroke/Border (`stroke/`)
| Token | การใช้งาน | ค่าที่ใช้ใน project |
|-------|-----------|-------------------|
| `stroke/normal` | Default border | `#D0D6DF` |
| `stroke/active` | Active/focused border | `#004081` (navy) |
| `stroke/error` | Error border | `#F3554F` |

#### Tag (`tag/`)
| Token | การใช้งาน |
|-------|-----------|
| `tag/success` | Success/approved tag |

#### Text (`text/`)
| Token | การใช้งาน | ค่าที่ใช้ใน project |
|-------|-----------|-------------------|
| `text/title` | Primary heading text | `#001122` |
| `text/subtitle` | Secondary heading | `#001122` (slightly lighter) |
| `text/describe` | Body description text | `#505050` |
| `text/filled` | Filled form value | `#001122` |
| `text/placeholder` | Input placeholder | `#929EB4` |
| `text/read-only` | Read-only field text | `#586782` |
| `text/remark` | Remark/helper text | `#586782` |
| `text/disable` | Disabled text | `#929EB4` |
| `text/linked` | Link text (teal) | `#66C5C5` or `#004081` |
| `text/active` | Active/selected text (navy) | `#004081` |
| `text/error` | Error message text | `#F3554F` |
| `text/white` | Text บน dark background | `#FFFFFF` |

### 2.3 Semantic Colors (Status)

| Role | Hex | การใช้งาน |
|------|-----|-----------|
| **Success** | `#82C566` | Approved, completed, active |
| **Warning** | `#FFCC00` | Pending, caution |
| **Danger** | `#F3554F` | Error, rejected, destructive |
| **Info** | `#004081` | Information (ใช้ navy) |

### 2.4 Neutral Scale

| Token | Hex | การใช้งาน |
|-------|-----|-----------|
| `color-ink` | `#001122` | Heading, primary text |
| `color-body` | `#505050` | Body text |
| `color-secondary` | `#586782` | Secondary text, label |
| `color-muted` | `#929EB4` | Placeholder, timestamp, hint |
| `color-border` | `#D0D6DF` | Default border |
| `color-surface-2` | `#F2F6F8` | Card header bg, section bg |
| `color-bg` | `#F8F9FA` | Page background |

---

## 3. Typography

### 3.1 Font Stack

```
Primary:  'Poppins', 'Noto Sans Thai', system-ui, sans-serif
Mono:     'JetBrains Mono', 'Noto Sans Thai', monospace
```

> **หมายเหตุสำคัญ:** Poppins ต้องมาก่อน Noto Sans Thai เสมอ  
> Poppins ไม่มี Thai glyph → browser จะ cascade ไป Noto Sans Thai โดยอัตโนมัติสำหรับอักษรไทย  
> ผลลัพธ์คือ mixed EN/TH ได้ typeface ที่ถูกต้องทั้งคู่

### 3.2 Type Scale (จาก Figma — 11 ขนาด × 9 น้ำหนัก)

| Size token | ขนาดโดยประมาณ | การใช้งานใน W+ |
|------------|--------------|----------------|
| `Text-xs` | ~11–12px | Label, badge, timestamp, uppercase caption |
| `Text-sm` | ~13px | Helper text, table cell secondary |
| `Text-base` | ~14px | Body text หลัก, form value |
| `Text-lg` | ~16px | Body ขนาดใหญ่ |
| `Text-xl` | ~18px | Sub-heading, card section title |
| `Text-2xl` | ~20–22px | Page section heading |
| `Text-3xl` | ~24px | Component heading |
| `Text-4xl` | ~28–30px | Page title |
| `Text-5xl` | ~36px | Large heading |
| `Text-6xl` | ~48px | Display heading |
| `Text-7xl` / `Text-8xl` / `Text-9xl` | 60px+ | Hero/landing display |

### 3.3 Font Weights (9 ระดับ)

```
Thin        → 100
Extra Light → 200
Light       → 300
Regular     → 400
Medium      → 500
Semi Bold   → 600
Bold        → 700
Extra Bold  → 800
Black       → 900
```

### 3.4 Special Text Styles

| Style | การใช้งาน |
|-------|-----------|
| `field/header` | Form section header (ใน field group) |
| `field/body` | Form field value text |
| `field/note` | Form field remark/note |
| `header/menu` | Navigation/sidebar menu item text |

### 3.5 Type Scale ที่ใช้จริงใน payment&creditTerm

```
Page title:       20px / weight 700 / color #001122
Card header:      14px / weight 700 / color #001122 / letter-spacing -0.01em
Section label:    11px / weight 700 / color #586782 / letter-spacing 0.06em / UPPERCASE
Body:             14px / weight 400 / color #505050 / line-height 1.65
Timestamp/muted:  11–12px / weight 400 / color #929EB4
```

---

## 4. Spacing System

Base unit = **4px** — spacing ทุกค่าเป็น multiple ของ 4

| Token | Value | การใช้งานใน W+ |
|-------|-------|----------------|
| `space-1` | 4px | Icon gap, micro spacing |
| `space-2` | 8px | Button icon gap, badge padding |
| `space-3` | 12px | Table cell padding, tag padding |
| `space-4` | 16px | Form field gap, sidebar item padding |
| `space-5` | 20px | Card inner padding |
| `space-6` | 24px | Card gap, section gap |
| `space-8` | 32px | Page section padding |
| `space-10` | 40px | Large section gap |
| `space-12` | 48px | Page hero padding |
| `space-16` | 64px | Page break |

---

## 5. Border Radius

W+ ใช้ radius scale ที่ใหญ่กว่า WorkX — เน้น "modern rounded" ที่ชัดเจน

| Token | Value | การใช้งาน |
|-------|-------|-----------|
| `radius-sm` | 6px | Input, alert, small panel, dropdown item |
| `radius-md` | 14px | Card, modal, container, filter bar |
| `radius-lg` | 22px | Stat card (large), feature block |
| `radius-pill` | 9999px | Button, badge/tag, version chip |

> **กฎ:** ไม่ใช้ 4px อีกต่อไป — minimum คือ 6px (radius-sm)  
> Button ทุกปุ่มใช้ pill (9999px) เสมอ  
> Card-level container ใช้ 14px เสมอ

---

## 6. Shadow / Elevation

W+ ใช้ **navy-tinted shadow เท่านั้น** — ไม่ใช้ `rgba(0,0,0,x)` เด็ดขาด

| Token | Value | การใช้งาน |
|-------|-------|-----------|
| `shadow-sm` | `0 1px 2px rgba(0,64,129,0.04)` | Card resting, subtle panel |
| `shadow-md` | `0 4px 14px rgba(0,64,129,0.07)` | Card hover, dropdown |
| `shadow-lg` | `0 16px 34px rgba(0,64,129,0.10), 0 2px 6px rgba(0,64,129,0.06)` | Modal, elevated panel |

### Effect Tokens (จาก Figma)

**Box Shadow scale:**
```
shadow-2xs → shadow-xs → shadow-sm → shadow-md → shadow-lg → shadow-xl → shadow-2xl
shadow-inner      — inset shadow
shadow-none       — reset
Box Shadow/Focus ring    — focus state ring
Box Shadow/Destructive   — error/danger state
```

**Backdrop Blur scale:**
```
backdrop-blur-none → backdrop-blur-sm → backdrop-blur-md → backdrop-blur-lg
backdrop-blur-xl → backdrop-blur-2xl → backdrop-blur-3xl
```
> Backdrop blur ใช้กับ modal overlay, floating panel

---

## 7. Components (จาก Figma Layers)

จาก Figma page "Website" มี component หลักดังนี้:

### 7.1 Button
```
Shape:      pill (borderRadius 9999px) — signature ของ W+
Primary:    teal→navy gradient background / white text
Secondary:  light wash / navy border
Ghost:      transparent / navy text
Danger:     #F3554F bg / white text
Disable:    muted bg / muted text
Size MD:    height ~36–40px / padding 10–20px / font 14px / weight 600
```

### 7.2 Form Field (`field/`)
```
Border:         1px solid #D0D6DF (resting)
Border focus:   1.5px solid #004081 + teal glow
Border error:   1px solid #F3554F
Border radius:  6px (radius-sm)
Padding:        10–12px
Label:          11px / weight 700 / UPPERCASE / color #586782 / letter-spacing 0.06em
Placeholder:    color #929EB4
Background:     white (default) / #F2F6F8 (read-only)
```

### 7.3 Card
```
Background:     #FFFFFF
Border:         1px solid #D0D6DF
Border radius:  14px (radius-md)
Header bg:      #F2F6F8
Header text:    14px / weight 700 / color #001122
Header border:  1px solid #D0D6DF (bottom)
Padding:        20px
Hover:          translateY(-2px) + shadow-md + teal border rgba(102,197,197,0.5)
```

### 7.4 Dashboard Card (Stat Card)
```
Border radius:  14–22px
Icon container: borderRadius 10px / navy/teal bg
Metric value:   Text-2xl / weight 700 / color #001122
Label:          Text-xs / color #929EB4
Hover:          teal border accent
```

### 7.5 Navigation / Sidebar (`sidemenu/`)
```
Background:     #004081 (navy) — dark anchor color
Width:          240px (expanded)
Item:           text/white (inactive), teal accent (active)
Active item:    teal left border + navy-tinted bg
Hover:          sidemenu/hover token
Font:           header/menu style — 14px / weight 500
Icon:           icon/white (inactive), icon/active (active)
```

### 7.6 Topbar
```
Background:     white (#FFFFFF)
Height:         ~56–64px
Top accent:     inset 3px teal (#66C5C5) — signature stripe
Shadow:         0 1px 2px rgba(0,64,129,0.04)
```

### 7.7 Tag / Badge
```
Border radius:  pill (9999px)
Padding:        2px 10px
Font:           11px / weight 700 / UPPERCASE / letter-spacing 0.03em
Border:         1px solid (matching semantic color)
```

Status colors:
```
Draft:      bg #F7FAFC / text #4A5568 / border #CBD5E0
Pending:    bg #FFFBEB / text #92400E / border #FCD34D
Approved:   bg #F0FDF4 / text #14532D / border #86EFAC
Rejected:   bg #FEF2F2 / text #7F1D1D / border #FCA5A5
Revised:    bg #EFF6FF / text #1E40AF / border #93C5FD
Cancelled:  bg #F9FAFB / text #6B7280 / border #D1D5DB
```

### 7.8 Modal / Dialog
```
Overlay:        rgba(0,0,0,0.4) backdrop-blur
Background:     #FFFFFF
Border:         1px solid #D0D6DF
Border radius:  16px (larger than card)
Shadow:         shadow-lg (navy-tinted)
Title:          16px / weight 700 / color #001122
Close button:   borderRadius 6px / color #586782
```

### 7.9 Step Form (`Step_form` component)
```
Stepper indicator:  pill shape / navy active / muted inactive
Progress bar:       teal fill / #D0D6DF track
Card wrapper:       borderRadius 14px
Section divider:    1px solid #D0D6DF
```

### 7.10 Dropdown / Option (`option_dropdown`)
```
Border:         1px solid #D0D6DF
Border radius:  6px
Shadow:         0 4px 12px rgba(0,64,129,0.07)
Item hover:     bg #F2F6F8
Selected:       navy text + teal indicator
```

### 7.11 Status Timeline
```
Connector:      1px solid #D0D6DF (vertical line)
Version badge:  pill (9999px)
Comment bubble: borderRadius 6px / bg #F2F6F8
Timestamp:      color #929EB4
```

---

## 8. Layout & Grid

### Page Layout (W+ App)

```
┌──────────────────────────────────────────────────────┐
│  Sidebar (240px, navy #004081)  │  Content (fluid)   │
│                                 │                    │
│  [Logo area]                    │  ┌─ Topbar ──────┐ │
│  [Nav items — white text]       │  │  teal accent  │ │
│  [Active: teal indicator]       │  └───────────────┘ │
│                                 │                    │
│                                 │  ┌─ Page Content ┐ │
│                                 │  │  padding: 24px │ │
│                                 │  │  bg: #F8F9FA   │ │
│                                 │  └───────────────┘ │
└──────────────────────────────────────────────────────┘
```

### Content Grid
```
Columns:    12-column grid
Gap:        24px (desktop)
Container:  max-width ~1280px / padding 0 24px
```

### KPI / Stat Cards Row
```
Desktop:    4 columns
Tablet:     2 columns
Mobile:     1 column
```

---

## 9. Iconography

- **Library:** Lucide Icons (stroke-based, 1.5px stroke weight)
- **Sizes:** 14px (button inline) / 16px (form) / 20px (nav) / 24px (feature)
- **Color:** ใช้ semantic icon tokens — icon/default, icon/active, icon/white
- **Style:** outline/stroke เท่านั้น ไม่ใช้ filled icon

---

## 10. Motion & Interaction

```
Transition default:   all 150ms ease
Button hover:         no scale — shadow deepens
Card hover:           translateY(-2px) + shadow-md + teal border (120ms)
Modal open:           scale(0.97→1) + opacity (200ms ease-out)
Sidebar:              width 250ms ease-in-out
Focus ring:           2px solid rgba(102,197,197,0.7) + offset 2px
```

---

## 11. ความสัมพันธ์กับ payment&creditTerm

payment&creditTerm เป็น **embedded module ของ W+** ดังนั้นต้องใช้ design system เดียวกันทุกประการ:

### สิ่งที่ทำแล้ว ✅
- สีทุกจุดเปลี่ยนเป็น EXZY CI palette (Navy + Teal)
- Black shadows ลบออกหมด → ใช้ navy-tinted แทน
- Button shape เป็น pill (9999px) ตลอด
- Card borderRadius 14px สม่ำเสมอ
- Topbar มี teal top accent stripe
- Form inputs borderRadius 6px
- Typography ใช้ Poppins + Noto Sans Thai

### สิ่งที่ควรทำต่อ ⚠️
- Stat card radius ควรเป็น 22px (radius-lg) ตาม spec แต่ปัจจุบันยังเป็น 14px
- Text colors ในบาง component อาจยังใช้ค่า hardcode — ควร map ให้ตรงกับ semantic tokens ข้างต้น
- Focus ring ควรเป็น teal (`rgba(102,197,197,0.7)`) ตลอด — ตั้งไว้ใน globals.css แล้ว แต่ยังต้องตรวจ JS inline styles
- Status badge ใช้ color scheme จาก section 7.7 ข้างต้น

---

## 12. CSS Custom Properties Reference

```css
/* globals.css — EXZY CI tokens */
:root {
  /* Brand */
  --color-navy:         #004081;
  --color-navy-dark:    #002D5C;
  --color-teal:         #66C5C5;
  --color-teal-dark:    #4AADAD;

  /* Gradient */
  --gradient-primary: linear-gradient(135deg, #66C5C5 0%, #004081 100%);

  /* Surfaces */
  --color-bg:           #F8F9FA;   /* page bg */
  --color-surface:      #FFFFFF;   /* card, input */
  --color-surface-2:    #F2F6F8;   /* card header, section bg, read-only */
  --color-border:       #D0D6DF;   /* default border / divider */

  /* Text */
  --color-ink:          #001122;   /* text/title — primary heading */
  --color-body:         #505050;   /* text/describe — body */
  --color-secondary:    #586782;   /* text/remark, text/read-only, labels */
  --color-muted:        #929EB4;   /* text/placeholder, timestamp */

  /* Semantic */
  --color-success:      #82C566;
  --color-warning:      #FFCC00;
  --color-danger:       #F3554F;
  --color-info:         #004081;

  /* Navy-tinted shadows ONLY */
  --shadow-sm:    0 1px 2px rgba(0,64,129,0.04);
  --shadow-md:    0 4px 14px rgba(0,64,129,0.07);
  --shadow-lg:    0 16px 34px rgba(0,64,129,0.10), 0 2px 6px rgba(0,64,129,0.06);

  /* Fonts */
  --font-sans: 'Poppins', 'Noto Sans Thai', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Noto Sans Thai', monospace;

  /* Radius */
  --radius-sm:    6px;    /* input, alert, dropdown */
  --radius-md:    14px;   /* card, modal, container */
  --radius-lg:    22px;   /* stat card, large feature */
  --radius-pill:  9999px; /* button, badge, chip */

  /* Spacing (4pt base) */
  --space-1: 4px; --space-2: 8px; --space-3: 12px;
  --space-4: 16px; --space-5: 20px; --space-6: 24px;
  --space-8: 32px; --space-10: 40px; --space-12: 48px; --space-16: 64px;
}
```

---

*W+ Library Design System Analysis · EXZY CI v2 · Analyzed 2026-06-23*  
*Source: Figma Styles API (182 styles) + globals.css + visual inspection*
