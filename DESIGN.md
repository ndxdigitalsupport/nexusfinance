---
name: NexusFinance
description: All-in-One FinTech Ecosystem for Southeast Asian lending operations
colors:
  primary: "#00BDAA"
  primary-md: "#1AB7A0"
  primary-dk: "#009688"
  navy: "#011B2A"
  navy-dk: "#000F18"
  bg-dark: "#0A0F1A"
  bg-light: "#F8FAFC"
  text-dark: "#F1F5F9"
  text-light: "#0F172A"
  card-dark: "#0F1623"
  card-light: "#FFFFFF"
  muted-dark: "#94A3B8"
  muted-light: "#64748B"
  sub-dark: "#64748B"
  sub-light: "#94A3B8"
  positive: "#10B981"
  negative: "#E11D48"
typography:
  display:
    fontFamily: "'Space Grotesk', sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  body:
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.7
  title:
    fontFamily: "'Space Grotesk', sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2.2rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  label:
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    letterSpacing: "0.15em"
    textTransform: "uppercase"
  mono:
    fontFamily: "'Space Grotesk', sans-serif"
    fontSize: "12px"
    fontWeight: 700
  khmer:
    fontFamily: "'Noto Sans Khmer', 'Kantumruy Pro', sans-serif"
rounded:
  sm: "12px"
  md: "20px"
  lg: "32px"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  xxl: "28px"
  section-y: "100px"
components:
  button-primary:
    backgroundColor: "#00BDAA"
    textColor: "#011B2A"
    rounded: "9999px"
    padding: "12px 24px"
    typography: "label"
  button-primary-hover:
    backgroundColor: "#1AB7A0"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "#F1F5F9"
    rounded: "9999px"
    padding: "12px 24px"
  button-secondary-hover:
    borderColor: "#00BDAA"
  nav-island:
    backgroundColor: "rgba(10,15,26,0.75)"
    rounded: "9999px"
    padding: "8px 20px 8px 8px"
  nav-island-light:
    backgroundColor: "rgba(248,250,252,0.8)"
  cta-input:
    backgroundColor: "rgba(255,255,255,0.03)"
    textColor: "#F1F5F9"
    rounded: "9999px"
    padding: "12px 12px 12px 40px"
  card-service:
    backgroundColor: "#0F1623"
    rounded: "32px"
    padding: "28px"
  card-pillar:
    backgroundColor: "#0F1623"
    rounded: "32px"
    padding: "32px"
  card-dashboard:
    backgroundColor: "linear-gradient(160deg, #0D1A26, #050D14)"
    rounded: "32px"
    padding: "28px"
---

# Design System: NexusFinance

## 1. Overview

**Creative North Star: "The Glass Ledger"**

A financial system viewed through polished, precision-cut glass — where every surface carries the weight of a balance sheet and the clarity of a dashboard monitor. The Glass Ledger treats data as the primary visual material: numbers are large and confident, cards sit with deliberate thickness, and the teal accent cuts through dark backgrounds like a signal light on a trading floor.

The system merges the trust signals of traditional banking (clean lines, restrained color, generous whitespace) with the energy of modern fintech (animated micro-interactions, glowing ambient accents, floating glass navigation). Dark mode is the default posture — the interface recedes so the data leads. Light mode inverts cleanly without losing identity.

**Key Characteristics:**
- Dark-first with a warm-cool balance (navy + teal, not pure black + cyan)
- Cards have physical presence via gradient borders and inner highlights
- Motion serves state changes and narrative progression, never decoration
- Typography is geometric and technical (Space Grotesk) paired with a humanist sans (Plus Jakarta Sans) — precision without coldness
- Bilingual English/Khmer with typographic accommodations for Khmer script
- Rejects: side-stripe borders, gradient text, glassmorphism as default, identical card grids, tiny uppercase eyebrows on every section

## 2. Colors

The palette centers on a single neon-teal accent against dark navy backgrounds. The strategy is **Committed**: the teal carries 10–30% of most surfaces — enough to define the brand without overwhelming the content.

### Primary

- **Neon Teal** (`#00BDAA`): Primary accent. Used for buttons, active nav states, badges, chart bars, and the hero title gradient. The color of action and attention — it draws the eye exactly once per section.
- **Neon Teal Medium** (`#1AB7A0`): Hover and intermediate states. Slightly softer for interaction feedback.
- **Neon Teal Dark** (`#009688`): Gradient terminus, subdued accents, and secondary roles. Deepens the teal family for visual weight distribution.

### Neutral

- **Navy** (`#011B2A`): Dark text on teal backgrounds, nav logo. The secondary brand anchor.
- **Deep Navy** (`#000F18`): Darkest surface, used for ambient backgrounds and outer bezels.
- **Dark Surface** (`#0A0F1A`): Default page background in dark mode. Not pure black — has a subtle blue cast.
- **Card Surface Dark** (`#0F1623`): Primary card and container background in dark mode. One step lighter than page bg.
- **Light Surface** (`#F8FAFC`): Page background in light mode.
- **Card Light** (`#FFFFFF`): Card background in light mode.
- **Body Text Dark** (`#F1F5F9`): Primary text in dark mode.
- **Body Text Light** (`#0F172A`): Primary text in light mode.

### Semantic

- **Muted Dark** (`#94A3B8`): Secondary text, metadata, subtitles in dark mode.
- **Muted Light** (`#64748B`): Secondary text in light mode.
- **Subdued Dark** (`#64748B`): Footnote text, functional highlights, placeholders in dark mode.
- **Subdued Light** (`#94A3B8`): Footnote text in light mode.
- **Positive** (`#10B981`): Growth indicators, green metric values.
- **Negative** (`#E11D48`): Outflows, red metric values, negative ledger amounts.

### Named Rules

**The One Voice Rule.** The Neon Teal accent occupies at most 30% of any given screen. Its rarity is the point — when teal appears, it signals something actionable or noteworthy. Too much teal dilutes the signal.

## 3. Typography

**Display Font:** Space Grotesk (sans-serif)
**Body Font:** Plus Jakarta Sans (sans-serif)
**Khmer Font:** Noto Sans Khmer (with Kantumruy Pro fallback)

**Character:** A pairing of two sans-serifs on a contrast axis of geometric vs. humanist. Space Grotesk is precise and technical — it owns numbers, headings, and money. Plus Jakarta Sans is warm and readable — it handles body copy, labels, and UX text. Together they communicate "built by engineers, for people."

### Hierarchy

- **Display** (700, `clamp(2rem, 5vw, 3.5rem)`, 1.08, -0.03em): Hero headlines only. Short, impactful, one thought per line. `text-wrap: balance`.
- **Title** (700, `clamp(1.5rem, 3vw, 2.2rem)`, 1.1, -0.02em): Section headings and card titles. Always Space Grotesk.
- **Body** (400, 13px–15px, 1.7): Long-form copy, service descriptions, feature explanations. Max line length 65–75ch.
- **Label** (600, 10px, 0.15em, uppercase): Section badges, eyebrow tags, stat labels. Pill-shaped container required.
- **Mono/Numeric** (700, 12px–18px): Dashboard metrics, amounts, chart values. Always Space Grotesk for numbers.

### Khmer Adjustments

- Khmer body text uses Noto Sans Khmer at 1.05× scale compensation to match Latin visual weight.
- Line-height minimum: 1.45 for headings, 1.7 for body.
- `letter-spacing: 0px` enforced to prevent ligature clipping.
- Font stack: `'Noto Sans Khmer', 'Kantumruy Pro', sans-serif`. Always.

## 4. Elevation

**Layered by default.** Every surface sits on a distinct plane, communicated through background tone shifts, not shadows. The layer order from back to front: page background → card surface → card with gradient border → nav overlay.

True box-shadows are reserved for:
- The floating nav island (`0 8px 40px rgba(0,0,0,0.3)`) — separates the navigation plane from content
- The dashboard card (`0 24px 80px rgba(0,0,0,0.3)`) — elevates the most important visual element in the hero
- Button hover (`0 12px 32px rgba(0,189,170,0.2)`) — interaction feedback lift

### Shadow Vocabulary

- **Nav elevation** (`0 8px 40px rgba(0,0,0,0.3)` / light: `0 8px 40px rgba(0,0,0,0.06)`): Fixed navigation plane. Significant shadow to distinguish from scrolling content.
- **Hero card** (`0 24px 80px rgba(0,0,0,0.3)`): The dashboard mockup in the hero. The deepest shadow in the system — this card is the visual centerpiece.
- **Hover lift** (`0 12px 32px rgba(0,189,170,0.2)`): Button hover state. Teal-tinted shadow ties the lift to the brand color.
- **Inner highlight** (`inset 0 1px 1px rgba(255,255,255,0.04)`): Card interiors. A microscopic top highlight that gives the card surface a subtle glass edge.

## 5. Components

### Buttons

**Shape:** Fully rounded pill (9999px radius).

- **Primary:** Neon Teal `#00BDAA` background, Navy `#011B2A` text. Uppercase, 700 weight, 13px. Teal-tinted shadow (`0 12px 32px rgba(0,189,170,0.2)`) on hover. Trailing arrow icon in a nested circular container (24×24, 50% radius) that shifts right on hover.
- **Hover/Focus:** Background shifts to `#1AB7A0`. Button lifts 2px (`translateY(-2px)`). Icon container scales to 1.05 and translates 3px right. Transition: 0.4s cubic-bezier(0.32, 0.72, 0, 1).
- **Secondary:** Transparent background, 1px hairline border (`rgba(255,255,255,0.1)` in dark, `rgba(0,0,0,0.1)` in light), body text color. Border shifts to Neon Teal on hover with a faint teal background tint.

### Cards / Containers

Double-bezel architecture: cards are wrapped in a 2px gradient border shell, then an inner container with softer inset shadow.

- **Service Cards:** 32px outer radius. Gradient border: `rgba(0,189,170,0.06)` to `rgba(255,255,255,0.02)`. Inner bg: `#0F1623`, radius = 30px (shell minus 2px). Padding: 28px. Hover: gradient intensifies (`0.12` teal), card lifts 2px.
- **Pillar Cards:** Same structure as service cards but padding 32px and gradient border lighter (`rgba(0,189,170,0.04)` to transparent). Hover lift: 3px.
- **Dashboard Card:** Same 2px shell radius 32px. Inner: `linear-gradient(160deg, #0D1A26, #050D14)`. Deepest shadow in the system. Contains live data simulation (chart bars, metrics, ledger items).

### Navigation

- **Shape:** Floating glass pill, detached from top edge by 16px, horizontally centered. Backdrop blur `blur(24px) saturate(1.4)`. Dark mode: `rgba(10,15,26,0.75)` background with white hairline border. Shrinks on scroll (padding reduces from 8px to 6px).
- **Logo:** Bold Space Grotesk, Neon Teal.
- **Links:** 12px, 500 weight, muted color. Active state: teal pill background with teal text.
- **Mobile:** Hamburger morphs to X (rotating bars). Full-screen overlay with staggered link reveals (0.1s / 0.18s / 0.26s delays).

### Inputs / Text Fields

- **Shape:** Fully rounded pill (9999px). 13px text, 12px vertical padding, 40px left padding to clear the icon.
- **Default:** `rgba(255,255,255,0.03)` background in dark, `rgba(0,0,0,0.03)` in light. Hairline border.
- **Focus:** Border shifts to Neon Teal. No glow — the color change alone signals focus.
- **States:** Leading icon (email envelope) at `left: 14px`, muted color.

### Section Badges

Pill-shaped eyebrow labels with teal border (`rgba(0,189,170,0.15)`) and teal text. 10px uppercase, 600 weight, 0.15em tracking. Used sparingly — not every section gets one.

## 6. Do's and Don'ts

### Do:

- **Do** use the double-bezel card architecture (gradient shell + inset inner) for every card and container — it gives the surface physical heft.
- **Do** use Neon Teal as the single accent voice. Apply it to buttons, active states, badges, and data highlights.
- **Do** lead with dark mode and offer light mode as a toggle (persisted in localStorage).
- **Do** place the nav as a floating glass pill detached from the top edge — never a full-width sticky bar.
- **Do** animate with `cubic-bezier(0.32, 0.72, 0, 1)` — the custom curve is part of the brand's motion signature.
- **Do** use scroll reveals with blur + translateY for section entrances, staggered by 0.1s increments.
- **Do** use Space Grotesk for all numbers and financial metrics — the geometric shapes build trust.
- **Do** respect Khmer typography with adjusted line-height (≥1.45 headings, ≥1.7 body) and zero letter-spacing.

### Don't:

- **Don't** use side-stripe borders (colored border-left/right > 1px) on cards or callouts — use full borders or background tints instead.
- **Don't** use gradient text (`background-clip: text` with gradient) — use a single solid color for emphasis.
- **Don't** use glassmorphism as a default card treatment — blur and transparency belong on the nav only.
- **Don't** build identical card grids with icon + heading + text repeated endlessly — vary card sizes and layouts (asymmetric bento).
- **Don't** put tiny uppercase tracked eyebrow badges above every section — use them sparingly and deliberately.
- **Don't** use numbered section markers (01 / 02 / 03) as default scaffolding — numbers earn their place when the section is an actual sequence.
- **Don't** use cards nested inside other cards — never deeper than one level.
- **Don't** use Inter, Roboto, or system fonts — the brand uses Plus Jakarta Sans and Space Grotesk.
- **Don't** let heading text overflow on narrow viewports — test `clamp()` at every breakpoint.
