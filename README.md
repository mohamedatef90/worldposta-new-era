# WorldPosta New Era

A marketing website for the WorldPosta product ecosystem, built as an Angular single-page app. It explains each product, routes visitors to the one that fits, and links to sign-in and registration on the WorldPosta admin site (site header).

**Preview deployment:** https://worldposta-new-era.vercel.app (served with `noindex`, see `vercel.json` and `Memory_Bank/Deployment-Vercel.md`).

## Pages

Each page is a lazy-loaded route in `src/app/app.routes.ts`:

| Route | Page |
| --- | --- |
| `/` | Home |
| `/posta` | Posta (business email) |
| `/cloudedge` | CloudEdge (cloud infrastructure) |
| `/drive` | Posta Drive |
| `/link` | Posta Link |
| `/cloudspace` | CloudSpace |
| `/posta-gate-security` | Posta Gate |
| `/posta-portal` | Posta Portal |
| `/wpsys` | WPSYS |
| `/cloud-based-soc-solutions` | WPSYS Cloud SOC |
| `/it-software-automation-tools` | IT Automation |
| `/seamless-migration` | Seamless Migration |
| `/sap` | SAP cloud operations |
| `/sap-basis-operations` | SAP Basis operations |
| `/case-studies`, `/case-studies/:slug` | Case studies list and detail |
| `/our-story` | Our Story |
| `/contact` | Contact |

Unknown paths redirect to `/`. Shared pieces (site header and footer, "On this page" jump navigation, ecosystem tabs, product visuals) live in `src/app/shared/`, and a theme service supports light and dark themes. `src/app/shared/ecosystem-tabs/demos/` holds in-page product demo screens (for example CloudEdge VMs, firewall and storage, webmail and mailboxes, Posta Drive, and Link chat).

## Tech stack

- Angular 22 (standalone components, signals), TypeScript
- Tailwind CSS 4, Angular CDK, Font Awesome and Lucide icons
- Vitest through Angular's unit-test builder
- pnpm (`packageManager: pnpm@10.30.3`)

## Getting started

Prerequisites: Node.js and pnpm.

```bash
pnpm install
pnpm start        # ng serve, http://localhost:4200/
pnpm build        # production build into dist/worldposta-new-era/browser
pnpm test         # ng test (Vitest)
pnpm watch        # development build in watch mode
```

No environment variables are used (there is no `.env.example`).

## Deployment

Deployed on Vercel. `vercel.json` runs `pnpm build`, serves `dist/worldposta-new-era/browser`, rewrites non-`/api/` paths to `index.html`, sets `X-Robots-Tag: noindex, nofollow`, and sets long-lived cache headers for built JS and CSS. `Memory_Bank/Deployment-Vercel.md` records the setup.

## Project structure

```
src/app/pages/      One folder per route
src/app/shared/     Header, footer, navigation, theme and scroll services, shared visuals
src/styles.css      Global styles (Tailwind)
public/worldposta-assets/   Logos, product imagery, and static assets
design-system/      Design tokens, CSS, and a showcase page
Memory_Bank/        Ecosystem overview, deployment notes, SEO/AI-readiness plan
PRODUCT.md          Audience, purpose, and page inventory
AGENTS.md, CLAUDE.md   Coding guidelines for AI assistants and contributors
```
