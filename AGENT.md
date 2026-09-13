# WorldPosta New Era — Agent Guide

## Scope

Angular 22 standalone application for the WorldPosta rebuild. The design system phase has started — see "Design system" below.

## Commands

```bash
pnpm start
pnpm build
pnpm test
```

## Component convention

- Every application component uses three files: `*.component.ts`, `*.component.html`, and `*.component.css`.
- Keep markup in HTML, styles in CSS, and behavior/state in TypeScript.
- Do not use Angular inline `template` or `styles`.
- Use standalone components, signals for local state, strict TypeScript, native Angular control flow, and accessible semantic HTML.

## Design system

- `design-system/` holds the portable Universal Design System bundle (`unidesign-system.md`, `design-tokens.json`, `design-system.css`, showcase). Treat it as a versioned package — change tokens upstream and bump the version, don't patch it in place.
- Theme switching has exactly one mechanism: `data-theme="dark|light"` on `<html>`, owned by `ThemeService` (`src/app/shared/services/theme.service.ts`) and pre-applied by the no-flash script in `src/index.html`. Never add a `.dark` class or a second `data-theme` on a component host.
- `src/styles.css` bridges the design system to Tailwind: shadcn/Zard names (`--background`, `--primary`, …) point at design-system tokens, and `@theme inline` exposes them as utilities. §10 of the design-system guide is a Tailwind v3 config and does not apply — this project is Tailwind v4, CSS-first.
- `src/app/shared/core/css/worldposta.css` holds the WorldPosta marketing palette (`--wp-*`) for values the universal bundle doesn't cover. Add page colours there, in both themes, rather than hardcoding hex.
- Available utilities: `bg-background|card|muted|accent`, `text-foreground|muted-foreground|subtle`, `bg-brand|brand-light`, `text-brand-blue`, `border-border`, `text-display|h1|h2|h3|body|body-sm|label|caption`, `p-xs…p-4xl`, `rounded-sm…rounded-2xl`, `shadow-sm…shadow-2xl`, `font-heading|body`, `max-w-tablet|desktop|wide`, and the `tablet:`/`desktop:`/`wide:` variants.
- Every colour must be a token, in both themes. The only exception is third-party brand marks (`--wp-brand-*`), which stay fixed by design.
- Brand logos live in `public/worldposta-assets/brand-logos/` (`customers/`, `partners/`). They render in full brand colour on a fixed-colour `.logo-plate`, never on the themed surface — a brand mark must not change colour with the theme. Use the light plate by default and `.logo-plate--dark` (navy) for white-ink assets. **Missing: an Oracle mark** — it falls back to a wordmark until a file is supplied.
- Vertical rhythm: every major section uses `padding-block: var(--wp-section-pad)` and nothing else, so the gap between adjacent sections is always twice that (96/64/48px by breakpoint). Minor strips attached to the section above use `var(--space-lg)`. Do not add one-off section padding — change the token instead.

## UI stack

- Tailwind CSS v4 is configured through PostCSS and `src/styles.css`.
- Use Zard UI (`pnpm dlx zard-cli add <component>`) as the Angular shadcn-style component system. Do not install React `shadcn/ui` packages.
- Font Awesome is available through `@fortawesome/angular-fontawesome`; import `FaIconComponent` only in components that render an icon and import individual icons from `@fortawesome/free-solid-svg-icons`.
- Prefer native HTML, Angular CDK, or an existing Zard component before adding dependencies.

## Project structure

- `src/app/`: routes, app configuration, and feature components.
- `src/app/shared/components/`: Zard-generated or shared UI components.
- `src/app/shared/core/` and `src/app/shared/utils/`: Zard helpers; do not duplicate them.
- `src/styles.css`: Tailwind import and global Zard theme tokens.

## Working agreement

- Read the affected component and callers before editing.
- Make the smallest focused diff; do not refactor unrelated code.
- Run `pnpm build` after implementation and `pnpm test` when component logic changes.
- Never commit, push, deploy, or modify secrets without Atef's explicit approval.
