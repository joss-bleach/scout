---
version: alpha
name: tottenham-hotspur
description: Navy-first, lilywhite-clean design system for the Spurs product. Built token-first for StyleX.
colors:
  primary: "#132257"
  secondary: "#3DB7E4"
  surface: "#FFFFFF"
  background: "#F5F7FB"
  inverse: "#0A1530"
  ink: "#000A3C"
  accentHover: "#1E93C0"
  accentTint: "#E8F6FC"
  border: "#D2DAE8"
  borderSubtle: "#E9EDF5"
  textPrimary: "#131A2E"
  textSecondary: "#525E78"
  textMuted: "#8A95AD"
  onDark: "#FFFFFF"
  live: "#E4002B"
  success: "#1E9E63"
  warning: "#E8A317"
  pitch: "#1F7A3D"
typography:
  displayXl:
    fontFamily: Archivo
    fontSize: 56px
    fontWeight: 800
    lineHeight: 1.0
    letterSpacing: "-0.02em"
  displayLg:
    fontFamily: Archivo
    fontSize: 40px
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  h1:
    fontFamily: Archivo
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.18
    letterSpacing: "-0.02em"
  h2:
    fontFamily: Archivo
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  h3:
    fontFamily: Archivo
    fontSize: 19px
    fontWeight: 600
    lineHeight: 1.37
  body:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  bodySm:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
  caption:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.33
  overline:
    fontFamily: Outfit
    fontSize: 11px
    fontWeight: 700
    lineHeight: 1.27
    letterSpacing: "0.08em"
  score:
    fontFamily: Outfit
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: "0.02em"
rounded:
  sm: 6px
  md: 10px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  s1: 4px
  s2: 8px
  s3: 12px
  s4: 16px
  s5: 20px
  s6: 24px
  s8: 32px
  s10: 40px
  s12: 48px
  s16: 64px
components:
  button-primary:
    backgroundColor: "{colors.secondary}"
    textColor: "#04263A"
    rounded: "{rounded.md}"
    padding: 0 24px
    height: 44px
    fontWeight: 700
  button-primary-hover:
    backgroundColor: "{colors.accentHover}"
    textColor: "{colors.onDark}"
  button-onDark:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    height: 44px
  button-secondary:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    border: "1.5px solid {colors.border}"
    rounded: "{rounded.md}"
    height: 44px
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.accentHover}"
    rounded: "{rounded.md}"
  card:
    backgroundColor: "{colors.surface}"
    border: "1px solid {colors.borderSubtle}"
    rounded: "{rounded.lg}"
    padding: "{spacing.s5}"
    shadow: 0 1px 2px rgba(10,21,48,0.08)
  fixture-card:
    backgroundColor: "{colors.inverse}"
    textColor: "{colors.onDark}"
    rounded: "{rounded.lg}"
    padding: "{spacing.s5}"
    shadow: 0 4px 12px rgba(10,21,48,0.10)
  pill-live:
    backgroundColor: "{colors.live}"
    textColor: "{colors.onDark}"
    rounded: "{rounded.full}"
  pill-tag:
    backgroundColor: "{colors.accentTint}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
  input:
    backgroundColor: "{colors.surface}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.sm}"
    height: 44px
    textColor: "{colors.textPrimary}"
---

# Tottenham Hotspur — DESIGN.md

A Spurs-flavoured design system for coding and design agents. Brand spine: navy
(`#132257`), lilywhite (`#FFFFFF`), a bright sky digital accent (`#3DB7E4`), and a darker
navy for chrome. The voice is confident and modern — *Audere Est Facere*, "To Dare Is To Do."

## Overview

Spurs leans dark. Default app chrome (headers, nav, hero blocks) sits on deep navy;
content panels are lilywhite. The system is built token-first for **StyleX**: every value
in the frontmatter maps to a `stylex.defineVars` entry, and components consume vars
through `stylex.create`. See the StyleX integration section for the wiring.

Principles:

- **Navy is the canvas, not the ink.** Dark chrome, light content. Avoid grey-on-grey.
- **Sky is interaction, not decoration.** The bright `secondary` reads as "you can touch
  this" — links, focus rings, active tabs, primary CTAs. Use it sparingly.
- **One accent at a time.** A view has a single dominant accent moment; don't stack sky +
  live-red + success-green in one card.
- **Scorelines deserve their own treatment.** Numerics use a tabular numeric style so
  digits never jitter. This is the system's signature.
- **Quiet surfaces, loud moments.** Cards, lists, and forms stay disciplined so the hero
  and match moment carry the weight.

## Colors

`primary` navy is the brand anchor and the default for headlines and chrome. `secondary`
sky is reserved for interaction. `inverse` and `ink` are the deep navies for headers,
hero blocks, and overlays. Neutrals are cool and navy-biased.

Contrast: navy on white is ~13:1 (excellent), and white on navy/inverse passes AA at all
sizes. Sky on white is only ~2.2:1, so **sky is never text on white** — use it for fills,
accents, and focus rings, and use `accentHover` or `primary` when a blue needs to be text.

Status colours: `live` (red) for in-progress matches and urgent state, `success` for
wins and confirmations, `warning` for pending, `pitch` as an optional match-context green.

## Typography

Three roles. Spurs' wordmark is a custom face, so for product we pair a confident
grotesque for display with a clean geometric body face, plus a tabular numeric treatment
for data.

- **Display — Archivo.** Hero, page titles, section and card headings. Letter-spacing
  tightens to `-0.02em` at large sizes.
- **Body — Outfit.** All UI, paragraphs, labels, captions.
- **Numeric — Outfit, weight 700.** Scores, minutes, stats.

Overlines are `overline`: 11px, weight 700, uppercase, `+0.08em` tracking — use for
eyebrows above titles.

Numeric note: Outfit is geometric, so its figures sit at near-uniform width and read
cleanly in scorelines. It does **not** ship a dedicated `tnum` OpenType feature, so a
`font-variant-numeric: tabular-nums` declaration is a harmless no-op there. If you need
pixel-perfect alignment in live stats tables, pin a true tabular face (e.g. Roboto Mono
or IBM Plex Mono) on the numeric role only.

## Layout

The system is built on a 4px spacing grid (`spacing.s1`). Reference spacing by token,
never raw px. Touch targets are at least 44×44px. Content max-width for reading columns
is ~1040px.

Breakpoints (min-width): `sm` 480px (large phone), `md` 768px (tablet), `lg` 1024px
(laptop), `xl` 1280px (desktop). Design mobile-first; the match centre and feed are
single-column on phones and graduate to two columns at `md`.

## Elevation & Depth

Shadows are navy-tinted, never neutral grey, and used sparingly:

- `e1` — `0 1px 2px rgba(10,21,48,0.08)` — resting cards.
- `e2` — `0 4px 12px rgba(10,21,48,0.10)` — hover lift, fixture cards.
- `e3` — `0 12px 32px rgba(10,21,48,0.16)` — sheets, dialogs.
- Focus ring — `0 0 0 3px rgba(61,183,228,0.45)` — every interactive element on
  `:focus-visible`.

Depth on dark surfaces comes from translucent white borders (`rgba(255,255,255,0.10)`)
rather than shadow.

## Shapes

Moderately geometric, badge-adjacent. `rounded.sm` (6px) for inputs and chips, `rounded.md`
(10px) for buttons and small cards, `rounded.lg` (16px) for cards and sheets, `rounded.xl`
(24px) for hero and feature blocks, `rounded.full` for pills, badges, and avatars. Crests
and team marks are circular.

## Components

- **Button.** Height 44px, radius `rounded.md`, weight 700. Variants: `primary` (sky fill),
  `onDark` (white fill, navy text — for use on navy surfaces), `secondary` (outline),
  `ghost` (text only). Focus shows the sky ring; active nudges down 1px.
- **Card.** `surface` background, radius `rounded.lg`, padding `spacing.s5`, subtle border,
  `e1` shadow lifting to `e2` with a 2px rise on hover.
- **Fixture card (signature).** Deep-navy (`inverse`) surface with two crests flanking a
  tabular score. Pre-match shows kickoff time in place of the score; live shows a pulsing
  `live` dot plus the minute. This is the most-Spurs surface in the app — get it right.
- **Pill / badge.** Radius `rounded.full`, overline type. `live` filled red for in-play,
  `accentTint` + navy text for neutral tags, success tint for results.
- **Input.** Height 44px, radius `rounded.sm`, `border`, `surface` background. Focus sets
  the border to `secondary` plus the sky ring. Placeholder uses `textMuted`.

## Do's and Don'ts

- Do put dark chrome around light content; navy headers, lilywhite panels.
- Do reserve sky for things people can interact with.
- Do give scorelines and stats the numeric treatment for stable digit width.
- Do ship a visible `:focus-visible` ring on every control and keep hit targets ≥44px.
- Do respect `prefers-reduced-motion` — disable the live-dot pulse and hover transitions.
- Don't use sky as text on a white background; it fails contrast.
- Don't stack multiple accent colours (sky, live, success) in a single card.
- Don't use neutral-grey shadows; tint elevation with navy.
- Don't let body copy drift to another font — Outfit only; Archivo is display-only.

## StyleX integration

The frontmatter tokens map 1:1 to `stylex.defineVars`. Define once in a `*.stylex.ts`
file and consume everywhere.

```ts
import * as stylex from '@stylexjs/stylex';

export const color = stylex.defineVars({
  primary: '#132257',
  secondary: '#3DB7E4',
  surface: '#FFFFFF',
  background: '#F5F7FB',
  inverse: '#0A1530',
  ink: '#000A3C',
  accentHover: '#1E93C0',
  accentTint: '#E8F6FC',
  border: '#D2DAE8',
  borderSubtle: '#E9EDF5',
  textPrimary: '#131A2E',
  textSecondary: '#525E78',
  textMuted: '#8A95AD',
  onDark: '#FFFFFF',
  live: '#E4002B',
  success: '#1E9E63',
  warning: '#E8A317',
  pitch: '#1F7A3D',
});

export const font = stylex.defineVars({
  display: '"Archivo", system-ui, sans-serif',
  body: '"Outfit", system-ui, sans-serif',
});

export const space = stylex.defineVars({
  s1: '4px', s2: '8px', s3: '12px', s4: '16px', s5: '20px',
  s6: '24px', s8: '32px', s10: '40px', s12: '48px', s16: '64px',
});

export const rounded = stylex.defineVars({
  sm: '6px', md: '10px', lg: '16px', xl: '24px', full: '9999px',
});

export const shadow = stylex.defineVars({
  e1: '0 1px 2px rgba(10,21,48,0.08)',
  e2: '0 4px 12px rgba(10,21,48,0.10)',
  e3: '0 12px 32px rgba(10,21,48,0.16)',
  focus: '0 0 0 3px rgba(61,183,228,0.45)',
});
```

Because the brand is already dark, a dark theme mostly inverts surfaces while keeping
navy — apply with `stylex.createTheme(color, { ... })` on a wrapper.

```tsx
const styles = stylex.create({
  buttonPrimary: {
    fontFamily: font.body,
    fontWeight: 700,
    color: '#04263A',
    backgroundColor: { default: color.secondary, ':hover': color.accentHover },
    minHeight: 44,
    paddingInline: space.s6,
    borderRadius: rounded.md,
    border: 'none',
    cursor: 'pointer',
    boxShadow: { ':focus-visible': shadow.focus },
    outline: 'none',
  },
});
```
