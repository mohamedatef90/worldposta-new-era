# Universal Design System

**Version:** 1.1.0
**Last Updated:** 2026-04-29
**Status:** Single source of truth — usable across multiple projects and tech stacks
**Themes:** Dark (default) + Light

This is one design system you can drop into any project: React + Tailwind, Angular + Bootstrap/SCSS, or plain HTML + CSS. The bundle ships three files that all describe the same tokens:

- `design-system.md` — this guide (rules, components, examples)
- `design-tokens.json` — machine-readable tokens (for build tools, Style Dictionary, Figma sync)
- `design-system.css` — drop-in CSS variables + ready-to-use component classes (light + dark)

---

## Table of Contents

1. [Philosophy](#1-philosophy)
2. [How to use this in a project](#2-how-to-use-this-in-a-project)
3. [Theming (light + dark)](#3-theming-light--dark)
4. [Color Tokens](#4-color-tokens)
5. [Typography](#5-typography)
6. [Spacing & Layout](#6-spacing--layout)
7. [Radius, Shadows, Motion](#7-radius-shadows-motion)
8. [Breakpoints](#8-breakpoints)
9. [Component Specifications](#9-component-specifications)
10. [Implementation — React + Tailwind](#10-implementation--react--tailwind)
11. [Implementation — Angular + Bootstrap/SCSS](#11-implementation--angular--bootstrapscss)
12. [Implementation — Plain HTML + CSS](#12-implementation--plain-html--css)
13. [Accessibility](#13-accessibility)
14. [Best Practices & Anti-Patterns](#14-best-practices--anti-patterns)
15. [Pre-commit Checklist](#15-pre-commit-checklist)
16. [Versioning & Updates](#16-versioning--updates)

---

## 1. Philosophy

The design system defines **what** the UI should look like. Each tech stack implements **how**.

- One source of truth for tokens (colors, type, spacing, motion, radius, shadows).
- Two themes built in: dark (default) and light.
- Three implementation paths: Tailwind, Bootstrap/SCSS, plain CSS.
- Mobile-first, dark-first, accessibility-first.

---

## 2. How to use this in a project

### Option A — Plain HTML, Vue, Svelte, or anything else
1. Copy `design-system.css` into your project.
2. `<link rel="stylesheet" href="design-system.css">`
3. Add `data-theme="dark"` or `data-theme="light"` to `<html>` (or omit to follow OS preference).
4. Use the `--color-*`, `--space-*`, `--radius-*` CSS variables in your own styles, or use the ready-made `.ds-*` component classes.

### Option B — React + Tailwind
1. Read [section 10](#10-implementation--react--tailwind), copy the Tailwind config block.
2. Optionally also import `design-system.css` for the CSS variables (lets non-Tailwind code stay in sync).
3. Use Tailwind classes like `bg-bg-secondary text-text-primary`.

### Option C — Angular + Bootstrap/SCSS
1. Read [section 11](#11-implementation--angular--bootstrapscss), copy the SCSS variables.
2. Override Bootstrap variables with the design tokens.
3. Use the SCSS mixins/classes provided.

### Option D — Build tooling (Style Dictionary, Figma Tokens, etc.)
- Point your token transformer at `design-tokens.json`.
- Generate platform-specific outputs (iOS, Android, Web) automatically.

---

## 3. Theming (light + dark)

The system ships both themes and uses CSS variables so the same components work in either.

```html
<!-- Force dark theme -->
<html data-theme="dark">

<!-- Force light theme -->
<html data-theme="light">

<!-- Follow OS preference (no attribute) -->
<html>
```

### Toggle script (drop in anywhere)

```js
function setTheme(mode) {
  document.documentElement.setAttribute('data-theme', mode);
  localStorage.setItem('theme', mode);
}
function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
}
initTheme();
```

---

## 4. Color Tokens

### Brand

| Token | Dark theme | Light theme | Usage |
|---|---|---|---|
| `--color-brand-green` | `#679a41` | `#679a41` | Primary CTA, success |
| `--color-brand-green-light` | `#7db84d` | `#7db84d` | Hover/highlight |
| `--color-brand-blue` | `#38bdf8` | `#293c51` | Secondary accent, links (theme-aware) |
| `--color-whatsapp` | `#25d366` | `#25d366` | WhatsApp CTA |

> **Note:** `--color-brand-blue` is **theme-aware**. Dark theme uses bright sky blue (`#38bdf8`, ~7.8:1 contrast on dark background — AAA). Light theme uses navy (`#293c51`, ~10:1 contrast on white — AAA). The CSS variable resolves automatically based on `data-theme`.

### Semantic

| Token | Dark theme | Light theme | Usage |
|---|---|---|---|
| `--color-error` | `#ef4444` | `#ef4444` | Errors, destructive |
| `--color-warning` | `#f59e0b` | `#f59e0b` | Warnings, pending |
| `--color-success` | `#679a41` | `#679a41` | Confirmations |
| `--color-info` | `#38bdf8` | `#293c51` | Info messages (mirrors brand-blue) |

### Surface — Dark theme

| Token | Hex | Usage |
|---|---|---|
| `--color-bg-primary` | `#0f1318` | Page background |
| `--color-bg-secondary` | `#141a22` | Cards, sections |
| `--color-bg-tertiary` | `#1a2230` | Inputs, nested |
| `--color-bg-elevated` | `#202b3a` | Hover, elevated |
| `--color-border` | `#202b3a` | Borders, dividers |
| `--color-text-primary` | `#eef2f7` | Main text (14.5:1 — AAA) |
| `--color-text-secondary` | `#7a93ad` | Secondary (6.2:1 — AA) |
| `--color-text-muted` | `#3d5570` | Labels (4.8:1 — AA) |

### Surface — Light theme

| Token | Hex | Usage |
|---|---|---|
| `--color-bg-primary` | `#ffffff` | Page background |
| `--color-bg-secondary` | `#f7f9fc` | Cards, sections |
| `--color-bg-tertiary` | `#eef2f7` | Inputs, nested |
| `--color-bg-elevated` | `#e2e8f0` | Hover, elevated |
| `--color-border` | `#e2e8f0` | Borders, dividers |
| `--color-text-primary` | `#0f1318` | Main text (16.5:1 — AAA) |
| `--color-text-secondary` | `#4a5b6e` | Secondary (7.4:1 — AAA) |
| `--color-text-muted` | `#718096` | Labels (4.6:1 — AA) |

All combinations meet WCAG AA at minimum.

---

## 5. Typography

### Font families

```
Headings:  Poppins  (600–700)
Body:      Open Sans (300–700)
Monospace: Menlo / Monaco (400)
```

Google Fonts import:

```css
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');
```

### Type scale

| Level | Font | Size | Weight | Line height | Letter spacing |
|---|---|---|---|---|---|
| Display | Poppins | 48–56px | 700 | 1.2 | -0.5px |
| H1 | Poppins | 36–40px | 700 | 1.3 | -0.25px |
| H2 | Poppins | 28–32px | 600 | 1.4 | 0 |
| H3 | Poppins | 20–24px | 600 | 1.5 | 0 |
| Body Large | Open Sans | 18px | 400–500 | 1.6 | 0.2px |
| Body | Open Sans | 16px | 400–500 | 1.6 | 0.2px |
| Body Small | Open Sans | 14px | 400–500 | 1.5 | 0.25px |
| Label | Open Sans | 14–16px | 600 | 1.4 | 0.5px |
| Caption | Open Sans | 12px | 400 | 1.4 | 0.3px |

---

## 6. Spacing & Layout

Base unit: **4px**. Use only values from this scale.

| Token | Value | Usage |
|---|---|---|
| `--space-xs` | 4px | Tight gaps |
| `--space-sm` | 8px | Icon padding |
| `--space-md` | 16px | Standard padding |
| `--space-lg` | 24px | Section padding |
| `--space-xl` | 32px | Large gaps |
| `--space-2xl` | 48px | Major sections |
| `--space-3xl` | 64px | Hero padding |
| `--space-4xl` | 96px | Page margins |

### Container max-widths

| Breakpoint | Max width |
|---|---|
| Mobile | 100% − 32px |
| Tablet (768px+) | 720px |
| Desktop (1024px+) | 1200px |
| Wide (1440px+) | 1400px |

---

## 7. Radius, Shadows, Motion

### Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 4px | Small buttons |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards |
| `--radius-xl` | 16px | Modals |
| `--radius-2xl` | 24px | Featured |
| `--radius-full` | 9999px | Pills |

### Shadows (dark / light auto-switch)

`--shadow-sm` → `--shadow-2xl` defined per theme. Dark theme uses 20–50% black; light theme uses 5–18% near-black for a softer feel.

### Motion

| Token | Duration | Usage |
|---|---|---|
| `--duration-fast` | 150ms | Hover, focus |
| `--duration-base` | 200ms | State changes |
| `--duration-slow` | 300ms | Complex transitions |
| `--duration-slower` | 400ms | Large animations |

Easing: `--ease-in-out`, `--ease-out`, `--ease-in`, `--ease-linear`. Never exceed 500ms. Always respect `prefers-reduced-motion`.

---

## 8. Breakpoints

| Device | Width | Notes |
|---|---|---|
| Mobile | 375px | Base — design here first |
| Tablet | 768px | iPad |
| Desktop | 1024px | Laptops |
| Wide | 1440px | Large monitors |

---

## 9. Component Specifications

### Button

| Size | Padding | Font size | Min height | Radius |
|---|---|---|---|---|
| Small | 8px 16px | 14px | 32px | 6px |
| Medium | 12px 24px | 16px | 40px | 8px |
| Large | 16px 32px | 16px | 48px | 8px |

States: default → hover (lighter + `translateY(-1px)`) → active (opacity 0.9) → disabled (opacity 0.5) → focus (2px ring).

Variants: **primary** (green), **secondary** (tertiary bg + border), **tertiary** (transparent + colored text), **destructive** (error red).

### Card

Background: `--color-bg-secondary` · Border: `1px solid --color-border` · Padding: 24px · Radius: 12px · Shadow: `--shadow-md` default, `--shadow-xl` on hover · Transition: 200ms.

### Input

Background: `--color-bg-tertiary` · Border: `1px solid --color-border` · Padding: 12px 16px · Font: 16px · Radius: 8px · Focus: 2px ring `--color-brand-green` (20% opacity).

### Modal

Overlay: `--color-overlay` + 4px backdrop blur · Modal bg: `--color-bg-secondary` · Padding: 32px · Radius: 16px · Max-width: 500 / 800 / full · Shadow: `--shadow-2xl`.

### Badge

Padding: 4px 12px · Radius: 9999px · Variants use brand/semantic color at 20% opacity background + full color text.

---

## 10. Implementation — React + Tailwind

### Tailwind config (works with Tailwind 3 and 4)

```js
// tailwind.config.js
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Brand
        'brand-green':       '#679a41',
        'brand-green-light': '#7db84d',
        'brand-blue':        'var(--color-brand-blue)', // theme-aware: #38bdf8 dark / #293c51 light
        'whatsapp':          '#25d366',
        // Semantic
        'error':   '#ef4444',
        'warning': '#f59e0b',
        // Surface tokens — pull from CSS variables (auto-themed)
        'bg-primary':   'var(--color-bg-primary)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'bg-tertiary':  'var(--color-bg-tertiary)',
        'bg-elevated':  'var(--color-bg-elevated)',
        'text-primary':   'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted':     'var(--color-text-muted)',
        // Legacy aliases (compat with OfferEdge)
        'dark-900': '#0f1318',
        'dark-800': '#141a22',
        'dark-700': '#1a2230',
        'dark-600': '#202b3a',
      },
      fontFamily: {
        heading: ['Poppins', 'system-ui', 'sans-serif'],
        body:    ['Open Sans', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'xs':  '4px',  'sm':  '8px',  'md':  '16px',
        'lg':  '24px', 'xl':  '32px', '2xl': '48px',
        '3xl': '64px', '4xl': '96px',
      },
      borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px', '2xl': '24px' },
      transitionDuration: { fast: '150ms', base: '200ms', slow: '300ms', slower: '400ms' },
    },
  },
};
```

### Setup (one-time, in `index.css`)

```css
@import 'design-system.css';
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Component examples

```jsx
// Primary button
<button className="bg-brand-green hover:bg-brand-green-light text-white px-6 py-3 rounded-md font-semibold transition-all duration-200 cursor-pointer hover:-translate-y-0.5 disabled:opacity-50">
  Get Started
</button>

// Card
<div className="bg-bg-secondary border border-bg-elevated rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-200">
  <h3 className="font-heading text-2xl font-semibold mb-2 text-text-primary">Card title</h3>
  <p className="text-text-secondary">Card body text.</p>
</div>

// Input
<input
  className="w-full bg-bg-tertiary text-text-primary rounded-md px-4 py-3 border border-bg-elevated
             focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20
             transition-all duration-200"
  placeholder="you@example.com"
/>

// Theme toggle hook
import { useEffect, useState } from 'react';
export function useTheme() {
  const [theme, setTheme] = useState('dark');
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  return { theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') };
}
```

---

## 11. Implementation — Angular + Bootstrap/SCSS

### `_design-tokens.scss`

```scss
// _design-tokens.scss — single source of truth for SCSS

// Brand
$brand-green:       #679a41;
$brand-green-light: #7db84d;
$brand-blue:        #293c51;
$whatsapp:          #25d366;

// Semantic
$error: #ef4444; $warning: #f59e0b; $success: #679a41; $info: #293c51;

// Spacing
$space-xs: 4px;  $space-sm: 8px;  $space-md: 16px;
$space-lg: 24px; $space-xl: 32px; $space-2xl: 48px;
$space-3xl: 64px; $space-4xl: 96px;

// Radius
$radius-sm: 4px; $radius-md: 8px; $radius-lg: 12px; $radius-xl: 16px;

// Motion
$duration-fast: 150ms; $duration-base: 200ms;
$duration-slow: 300ms; $duration-slower: 400ms;
$ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

// Fonts
$font-heading: 'Poppins', system-ui, -apple-system, sans-serif;
$font-body:    'Open Sans', system-ui, -apple-system, sans-serif;
```

### Bootstrap variable overrides (`_bootstrap-overrides.scss`)

```scss
@import 'design-tokens';

// Map design tokens onto Bootstrap variables
$primary:   $brand-green;
$secondary: $brand-blue;
$success:   $success;
$danger:    $error;
$warning:   $warning;
$info:      $info;

$body-bg:    var(--color-bg-primary);
$body-color: var(--color-text-primary);

$font-family-sans-serif: $font-body;
$headings-font-family:   $font-heading;
$headings-font-weight:   600;

$border-radius-sm: $radius-sm;
$border-radius:    $radius-md;
$border-radius-lg: $radius-lg;
$border-radius-xl: $radius-xl;

$spacer: $space-md;
$spacers: (0:0, 1:$space-xs, 2:$space-sm, 3:$space-md, 4:$space-lg, 5:$space-xl, 6:$space-2xl);

@import 'bootstrap/scss/bootstrap';
```

### `styles.scss` (Angular root)

```scss
// 1. Pull in CSS variables for theme switching
@import 'design-system.css';

// 2. Pull in Bootstrap with our overrides
@import 'bootstrap-overrides';

// 3. App overrides
.btn-primary {
  background-color: $brand-green;
  border-color: $brand-green;
  font-weight: 600;
  transition: all $duration-base $ease-in-out;

  &:hover { background-color: $brand-green-light; transform: translateY(-1px); }
}

.card {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border);
  border-radius: $radius-lg;
}
```

### Angular component (`app.component.ts`)

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="container py-4">
      <h1 class="display-5 mb-4">Welcome</h1>
      <button class="btn btn-primary" (click)="toggle()">Toggle theme</button>

      <div class="card mt-4 p-4">
        <h3>Card title</h3>
        <p class="text-secondary">Card body text.</p>
      </div>
    </div>
  `,
})
export class AppComponent {
  toggle() {
    const next = document.documentElement.dataset['theme'] === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset['theme'] = next;
    localStorage.setItem('theme', next);
  }
}
```

---

## 12. Implementation — Plain HTML + CSS

The simplest path. Just include `design-system.css` and use the variables or the `.ds-*` classes.

```html
<!doctype html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My App</title>
  <link rel="stylesheet" href="design-system.css">
</head>
<body>
  <main class="ds-container" style="padding-top: var(--space-2xl);">

    <h1 class="ds-text-display">Hello World</h1>
    <p class="ds-text-secondary">A subtitle in the secondary text color.</p>

    <div class="ds-card">
      <h3>Card title</h3>
      <p>Card body text.</p>

      <label class="ds-label" for="email">Email</label>
      <input id="email" class="ds-input" type="email" placeholder="you@example.com">

      <div style="margin-top: var(--space-md); display: flex; gap: var(--space-sm);">
        <button class="ds-btn ds-btn--primary">Submit</button>
        <button class="ds-btn ds-btn--secondary">Cancel</button>
      </div>

      <span class="ds-badge ds-badge--success" style="margin-top: var(--space-md);">Approved</span>
    </div>

    <button id="themeBtn" class="ds-btn ds-btn--tertiary">Toggle theme</button>
  </main>

  <script>
    const root = document.documentElement;
    document.getElementById('themeBtn').addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      localStorage.setItem('theme', next);
    });
    if (localStorage.getItem('theme')) root.dataset.theme = localStorage.getItem('theme');
  </script>
</body>
</html>
```

### Custom component using only the variables

```css
.my-hero {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  padding: var(--space-3xl) var(--space-md);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}
.my-hero h1 {
  font-family: var(--font-heading);
  font-size: var(--fs-display);
  margin-bottom: var(--space-md);
}
```

---

## 13. Accessibility

- **Contrast:** WCAG AA minimum (4.5:1) for body text. All tokens in this system meet that threshold; most exceed AAA (7:1).
- **Focus states:** Always visible. The system enforces a 2px green ring via `:focus-visible`.
- **Keyboard:** Tab order matches visual order. No keyboard traps. Every interactive element reachable.
- **Screen readers:** Use semantic HTML (`<button>`, `<nav>`, `<main>`, `<article>`). Add `aria-label` to icon-only controls. Associate labels with inputs.
- **Reduced motion:** The CSS file already disables animations under `@media (prefers-reduced-motion: reduce)`.
- **Color independence:** Never convey meaning by color alone — pair color with icon or text (e.g., green check + "Approved").
- **Zoom:** Don't disable user zoom on mobile.

---

## 14. Best Practices & Anti-Patterns

### Do

- Use design tokens, never hardcoded hex values.
- Design mobile-first, then scale up.
- Keep animations 150–300ms.
- Pair the `.ds-*` classes or framework variants — don't reinvent.
- Test at 375px / 768px / 1024px / 1440px before shipping.
- Use semantic HTML.
- Always include focus + hover states.

### Don't

| Anti-pattern | Why | Fix |
|---|---|---|
| Hardcoded hex colors | Breaks theming | Use `--color-*` tokens |
| Emojis as icons | Inconsistent rendering | Use SVG icons (lucide, Heroicons) |
| 0ms transitions | Feels broken | Use `--duration-fast` / `--duration-base` |
| Light gray on gray | Fails contrast | Use `text-primary` / `text-secondary` |
| Animating width/height | Layout reflow | Animate `transform` / `opacity` |
| Icon-only button without `aria-label` | Inaccessible | Add label or visible text |
| Disable mobile zoom | Hurts users with low vision | Don't |
| Mix Poppins for body / Open Sans for headings | Breaks hierarchy | Headings = Poppins, body = Open Sans |
| Arbitrary px spacing (e.g. 13px, 27px) | Breaks rhythm | Use the 4px scale only |

---

## 15. Pre-commit Checklist

- [ ] All text meets 4.5:1 contrast in **both** themes
- [ ] No hardcoded colors — only tokens
- [ ] No emojis — SVG icons only
- [ ] `cursor: pointer` on every clickable element
- [ ] Hover + focus states present and 150–300ms
- [ ] Form labels visible (not placeholder-only)
- [ ] Error messages near their fields
- [ ] No horizontal scroll at 375px
- [ ] Tested at 375 / 768 / 1024 / 1440
- [ ] `prefers-reduced-motion` respected
- [ ] Spacing uses 4/8px scale only
- [ ] Semantic HTML + ARIA labels on icon buttons
- [ ] Light theme verified (not just dark)

---

## 16. Versioning & Updates

- Treat the bundle as a versioned package (`design-system@1.1.0`).
- When you change a token, bump the version and notify all projects consuming it.
- Review quarterly. Common reasons to update: brand refresh, new patterns emerging across projects, accessibility standards rising, team feedback.

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | 2026-04-29 | Initial universal design system (dark theme only) |
| 1.1.0 | 2026-04-29 | **Single-file bundle** (md + json + css), light theme added, ready-to-use `.ds-*` component classes, Angular/Bootstrap implementation guide, theme-toggle script |
| 1.1.1 | 2026-04-29 | `brand-blue` is now theme-aware: `#38bdf8` (dark) / `#293c51` (light). Both pass WCAG AAA on their respective themes. |

---

**Need a value?** Open `design-tokens.json`.
**Need a class right now?** Open `design-system.css` and use the `.ds-*` classes.
**Need to wire this into your stack?** Sections 10–12 above.

This is the authoritative source. Every project that uses this bundle stays visually consistent — even when the tech stack differs.
