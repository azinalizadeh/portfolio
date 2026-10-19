# Design system: MASTER

The single source of truth for how the portfolio looks and moves. Page-specific deviations go in `design-system/pages/<page>.md` and override this file for that page only.

The live, rendered version of these tokens is at `/dev/tokens` (development only). Contrast ratios there are measured from the real CSS.

## Direction

Minimal editorial, dark only, one accent color. Serif headlines, a quiet sans body, mono for metadata. Restraint over decoration: the coral accent is used for the primary action, links, active states and focus, and almost nothing else.

## Where tokens live

| File                       | What                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `app/globals.css`          | Primitives (`@theme`), semantic tokens (`:root`), Tailwind mapping (`@theme inline`) |
| `app/layout.tsx`           | Fonts via `next/font/google`, exposed as `--font-newsreader/inter/jetbrains-mono`    |
| `components/ui/button.tsx` | shadcn Button, restyled to the tokens                                                |

Tailwind's default color palette is **removed** (`--color-*: initial`). Only the colors below exist, so `bg-red-500` or `text-gray-400` simply don't compile into anything.

## Color

### Primitives

Coral (`coral-50` … `coral-950`, with `coral-300 = #FFADAD`) and zinc (`zinc-50` … `zinc-950`, Tailwind's zinc values). Components should not use primitives directly; use the semantic tokens.

### Semantic tokens

| Token                | Value        | Tailwind class             | Use                                         |
| -------------------- | ------------ | -------------------------- | ------------------------------------------- |
| `--background`       | `#0C0C0E`    | `bg-background`            | Page                                        |
| `--card`             | `#161618`    | `bg-card`                  | Cards, table headers                        |
| `--surface-raised`   | `#1F1F23`    | `bg-surface-raised`        | Hover surfaces, secondary buttons, popovers |
| `--border`           | `#27272A`    | `border` (default)         | Dividers, card outlines (decorative)        |
| `--border-strong`    | `#3F3F46`    | `border-border-strong`     | Outline buttons, emphasized dividers        |
| `--input`            | `#71717A`    | `border-input`             | Form field outlines (needs 3:1)             |
| `--foreground`       | `#F4F4F5`    | `text-foreground`          | Body text, headings                         |
| `--muted-foreground` | `#A1A1AA`    | `text-muted-foreground`    | Secondary text, captions                    |
| `--accent`           | `#FFADAD`    | `bg-accent`, `text-accent` | Primary action, links, active state         |
| `--accent-hover`     | `#FFC7C7`    | `bg-accent-hover`          | Hover on accent surfaces                    |
| `--on-accent`        | `#0C0C0E`    | `text-on-accent`           | Text on accent / destructive fills          |
| `--accent-soft`      | coral at 14% | `bg-accent-soft`           | Selected chips, highlights, text selection  |
| `--destructive`      | `#F87171`    | `text-destructive`         | Errors                                      |
| `--success`          | `#4ADE80`    | `text-success`             | Success messages                            |
| `--ring`             | = accent     | (global `:focus-visible`)  | Focus ring                                  |

**Naming note:** in shadcn, `accent` normally means a subtle hover surface. Here `accent` is the **coral brand color**. When copying a shadcn component that uses `hover:bg-accent` for a quiet hover, change it to `hover:bg-surface-raised`. shadcn's `primary` is aliased to the accent, so `bg-primary` also gives coral.

### Contrast (measured on `/dev/tokens`)

| Pair                                                 | Ratio   | Needs |
| ---------------------------------------------------- | ------- | ----- |
| foreground / background                              | 17.78:1 | 4.5   |
| muted-foreground / surface-raised (worst muted case) | 6.41:1  | 4.5   |
| accent / background                                  | 11.01:1 | 4.5   |
| accent / accent-soft                                 | 8.59:1  | 4.5   |
| on-accent / accent                                   | 11.01:1 | 4.5   |
| on-accent / destructive                              | 7.07:1  | 4.5   |
| destructive / card                                   | 6.53:1  | 4.5   |
| success / card                                       | 10.37:1 | 4.5   |
| ring / card                                          | 10.18:1 | 3     |
| input / card                                         | 3.74:1  | 3     |

**Rules**

- `zinc-500` (`#71717A`) is 4.04:1 on the background: **never use it for text.** It is allowed for non-text boundaries such as `--input`.
- `--border` and `--border-strong` are below 3:1 and are decorative only. Anything a user must see to operate a control (a field's outline, a checkbox edge) uses `--input` or stronger.
- Color never carries meaning alone: errors pair `text-destructive` with an icon or text, selected chips show a check mark.

## Typography

| Level   | Font           | Size / line height            | Class                     |
| ------- | -------------- | ----------------------------- | ------------------------- |
| Display | Newsreader     | 56/1.05 (40 on phones, fluid) | `font-serif text-display` |
| h1      | Newsreader     | 40/1.1 (32 on phones, fluid)  | `h1` element or `text-h1` |
| h2      | Newsreader     | 28/1.2                        | `h2` element or `text-h2` |
| h3      | Newsreader     | 20/1.3                        | `h3` element or `text-h3` |
| Body    | Inter          | 16/1.7                        | default on `body`         |
| Small   | Inter          | 14/1.5                        | `text-sm`                 |
| Mono    | JetBrains Mono | 12/1.5                        | `font-mono text-xs`       |

- `h1`–`h3` get the serif and their size automatically from the base layer, with `text-balance`.
- Headings use regular weight (400); hierarchy comes from size and the serif, not boldness. UI labels and buttons use Inter 500.
- Mono is for tags, dates, tech chips and code. Uppercase mono gets `tracking-wider`.
- Long-form text max width: `max-w-2xl` (about 65–75 characters).
- Fonts are self-hosted by `next/font` with `display: swap` and metric-matched fallbacks, so there is no layout shift.

## Spacing

Tailwind's 4px base. Allowed steps: `1` (4), `2` (8), `3` (12), `4` (16), `6` (24), `8` (32), `12` (48), `16` (64), `24` (96).

- Page gutter: `px-4` on phones, `md:px-8` from 768px.
- Content width: `max-w-6xl`.
- Section rhythm: `gap-12` between sections; `gap-24` between major home-page bands.

## Radius

| Token          | Value | Use                       |
| -------------- | ----- | ------------------------- |
| `rounded-sm`   | 6px   | Tags, extra-small buttons |
| `rounded-md`   | 8px   | Buttons, inputs           |
| `rounded-lg`   | 12px  | Cards                     |
| `rounded-xl`   | 14px  | Large cards, media        |
| `rounded-full` | —     | Pills, chips, navbar      |

## Elevation

Flat. Depth comes from surface steps (`background` → `card` → `surface-raised`) and borders, not shadows. The floating navbar is the only element allowed a soft shadow (defined in subtask 4).

## Focus and keyboard

- One global rule: `:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px }`. Components must **not** add `outline-none` or their own ring.
- Every interactive element is reachable by Tab, in visual order. Icon-only buttons need `aria-label`; decorative icons next to text are hidden from screen readers (lucide sets `aria-hidden` by default).
- Pointer targets are at least 24×24px (WCAG 2.2 AA); primary touch actions aim for 44px (`size="lg"` is 44px tall).

## Buttons

| Variant       | Look                                            | Use                                 |
| ------------- | ----------------------------------------------- | ----------------------------------- |
| `default`     | Coral fill, dark text                           | The one primary action per view     |
| `outline`     | `border-strong` outline, hover `surface-raised` | Secondary actions (Resume, Repo)    |
| `secondary`   | `surface-raised` fill                           | Tertiary actions                    |
| `ghost`       | Text only, hover `surface-raised`               | Toolbar and nav actions             |
| `link`        | Coral text, underline on hover                  | Inline actions                      |
| `destructive` | Red fill, dark text                             | Reserved; not expected on this site |

All buttons lift 1px on hover (150ms) and drop back on press.

## Motion

| Where                                | What                                                                                                                                     |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `SegmentedTabs`, single-select chips | GSAP Flip shared element, `power3.inOut`, 450ms; content out 120ms, in 300ms, 30ms stagger                                               |
| `FilterChips` (multi-select)         | Ink: clip-path circle from click point, `power2.out` 500ms; label roll 350ms; check `back.out`; deselect fade 150ms; chips never reorder |
| Global hover                         | 1px lift, 150ms                                                                                                                          |
| Section reveal                       | 8px fade-up, 300–400ms, on scroll into view                                                                                              |

- Animate only `transform` and `opacity` (and `clip-path` for the chip ink).
- Every GSAP tween uses `overwrite: true` so a new click cancels the old animation and sets the final state explicitly.
- `prefers-reduced-motion: reduce` turns all motion off: the CSS base rule kills CSS transitions and animations, and GSAP code checks the same media query and jumps to the end state.

## Anti-patterns

- Raw hex values or primitive ramps in components; use semantic tokens.
- Grey text below 4.5:1, including `zinc-500` or `muted-foreground` on `accent-soft` mixed backgrounds that haven't been measured.
- Removing focus outlines, or `outline-none` without a replacement.
- Emoji as icons; use `lucide-react` only, one stroke width.
- More than one coral-filled button in a view.
- Shadows for depth, gradients, glassmorphism.
- Animating width, height, top or left; motion with no cause.
- Horizontal scroll at 375px.

## Pre-delivery checklist (per page)

- [ ] Only semantic tokens used; `/dev/tokens` contrast table all green
- [ ] Keyboard: Tab order matches visual order, focus ring always visible and never hidden behind the sticky navbar
- [ ] Icon-only controls have accessible names
- [ ] Checked at 375, 768, 1024, 1440px with no horizontal scroll
- [ ] Reduced motion: page fully usable, no animation
- [ ] Images have width/height or aspect ratio (no layout shift)
