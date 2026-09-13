# WorldPosta Ecosystem — app-by-app reference

| | |
|---|---|
| **Date** | 2026-09-13 |
| **Source** | `C:\Users\Atef\Desktop\my-projects\WorldPosta-Eco-System` |
| **Purpose** | Ground the marketing-site rebuild in what actually exists. Atef: "base of code, ~95% production, ~99% UI/UX." |
| **Method** | Read each app's `CLAUDE.md`/README, manifests, route tables and type models. Not a line-by-line source read. |

---

## 1. The eight repos at a glance

| App | What it is | Stack | Maturity |
|---|---|---|---|
| **user-types-of-worldposta-unified-sign-in** | The customer portal hub — SSO login **plus** every admin surface | React 19 + RRD 7 + Vite + Tailwind | 88 pages, 99 routes |
| **cloudedge** | CloudEdge console — cloud resource management | **Angular 21**, standalone, zoneless, signals, D3, hash routing | 54 routes, mock data only |
| **posta** | Webmail client (Exchange EWS / IMAP+SMTP / MS Graph) | FastAPI + Postgres 16 + Redis 7 + React | Phase 0, hexagonal |
| **clouddrive** | WorldPosta Drive — multi-tenant file storage/sharing | **Go 1.25** + React 18 SPA | Production, on `cd` |
| **objstore** ("IO") | S3-compatible object storage control plane over Ceph RGW | **Go 1.25** + React 19 + Vite + Tailwind v4 | Production, spec-first |
| **knowledge** | Knowledge base — docs, blog, editorial workflow | Node/Express + MySQL/Prisma + Meilisearch + React 18 | Deployed to test server |
| **WP_Posta** | Native **iOS** mail client over ActiveSync/WBXML | SwiftUI + GRDB, Clean Architecture as SPM packages | iOS 26, tests are placeholders |
| **link** | Teams/Slack-style collaboration suite | **Design mockups only** (M01–M15 PNGs) | Not built |

---

## 2. The SSO app is the centre of gravity

Despite the name, `user-types-of-worldposta-unified-sign-in` is not a login page — it is the
whole customer/admin portal. 88 pages across:

- **Auth** — login, signup, email verification
- **Per-role dashboards** — customer, admin, reseller
- **Email Admin Suite** (= the "Posta admin panel"): mailboxes, distribution lists, shared
  contacts, rules, orgs & domains, account statistics, SMTP logs, PST logs, bulk module,
  running tasks, mailbox plans, migrations, background tasks, IP lists, sister companies
- **Posta Gate** — AI email security gateway (anti-phishing/malware/BEC)
- **CloudEdge** — dashboard, firewall groups/policies/services, distributed & gateway
  firewall, IDS/IPS (a portal-side view alongside the standalone Angular console)
- **Billing** — invoices, subscriptions, packages, CloudEdge configurations, OS images, wallet
- **Admin** — user & staff management, system settings, tickets, packages, reports
- **Reseller** — customers, program
- **Customer** — team management (add/edit team users)
- **Settings** — account, security, notifications, profile
- **Marketing pages** — Kubernetes, Networking, Storage, Monitoring, Backup, Posta pricing

**Roles (`types.ts`):** `customer | admin | reseller | super_admin`.
CloudEdge's own mock auth uses a different set: `customer | admin | reseller | micro`.

**App launcher** (`lib/appLauncher.ts`) is the canonical ecosystem map, role-filtered:
WorldPosta.com · CloudEdge · Email Admin Suite · Posta Gate, plus Billing, Invoices,
Support, Action Logs for customers.

---

## 3. Production endpoints referenced in the code

| Service | URL |
|---|---|
| Identity / OIDC | `identity.worldposta.com` |
| Webmail | `posta.worldposta.com` |
| CloudEdge console | `console.worldposta.com` |
| Object storage (IO) | `io.worldposta.com` |
| Marketing site | `worldposta.com` |

---

## 4. Shared platform architecture

The Go services bind a common set of org-wide standards ("skills") rather than reinventing:

- `worldposta-identity-integration` — all auth/authz through IAM. Posta and objstore both
  use **OIDC bearer**; objstore falls back to an httpOnly `io_session` cookie so the SPA
  never holds the token.
- `worldposta-tenancy` — every query/endpoint/cache key tenant-scoped. CloudDrive **forces
  RLS on all 63 tenant tables**.
- `worldposta-billing-integration` — quotas/plans/usage via **Lago**, never local counters.
- `worldposta-observability` — logs/metrics/traces via **Watchful**.
- `worldposta-shared-libraries`, `worldposta-ui-standards`, `@worldposta/design-tokens`.
- Priority order when rules conflict: **Security > Performance > Architecture > Reliability**.

Architecturally the apps differ on purpose and the docs say so plainly:

- **posta** — hexagonal: `libs/domain`, `libs/application`, `libs/infra_{ews,imap,graph,jmap,ical,ai,search,identity,persistence}`.
- **clouddrive** — explicitly **not** hexagonal; a feature-handler monolith (`internal/api`,
  220+ files). Only `internal/permission` is a clean port.
- **objstore** — per-feature packages (`repository.go` / `service.go` / `http.go`) that
  **never import each other**; `main.go` is the composition root and holds all cross-package
  adapters. Spec-first: `api/openapi.yaml` generates both Go and TS clients, CI fails on diff.
- **WP_Posta** — Clean Architecture enforced by SPM package boundaries; `Composition.swift`
  is the only module wiring concretes to protocols.

---

## 5. Design system — and one inconsistency

The portal and console share a palette:

| Token | Light | Dark |
|---|---|---|
| Primary (green) | `#679a41` | `#8cc866` / emerald-500 |
| Primary hover | `#537d34` | `#7ab856` |
| Secondary / text (navy) | `#293c51` | gray-200 |
| Background | `#f7f8fa` / `#fcfcfc` | `#1a202c` / slate-900 |
| Surface | `#ffffff` | slate-800 |

Icons are **Font Awesome** across the portal and console (`fas fa-server`).
Design docs: `SSO+TOOLS-DESIGN_SYSTEM.md` (1251 lines), `DESIGN_SYSTEM.json`,
CloudEdge's `CE-DESIGN-SYSTEM.md`, CloudDrive's `memory-bank/DESIGN_SYSTEM.md`.

**Inconsistency worth knowing:** the Knowledge Base uses a different brand green,
**`#1D9E75`**, not `#679a41`. If the marketing site is meant to be the visual anchor for the
ecosystem, that divergence is a decision to make rather than a detail to copy blindly.

Stated design philosophy (`DESIGN_SYSTEM.json`): Clarity, Consistency, Efficiency,
Scalability, Accessibility — the last explicitly commits to semantic HTML, ARIA, contrast
and keyboard navigation, which matches `CLAUDE.md`'s "must pass all AXE checks."

---

## 6. What this means for the marketing site

The One Platform tabs claim 18 services. Mapped against reality:

| Marketing tab | Real backing | Note |
|---|---|---|
| Cloud Infrastructure, Virtual Machines, Storage, Networking, Security, Backup & DR, Automation | CloudEdge console | Real, 54 routes |
| **Kubernetes** | ✗ no console route | Marketing page only in the portal |
| **Cost Management** | ✗ no console route | Closest real things: Reservations, Marketplace, Billing |
| Business Email | Email Admin Suite | Real and deep |
| **Team Chat, Conferencing, Calendar** | `link` — **mockups only** | Not built |
| Drive & Files | CloudDrive | Real (Go + React, in production) |
| **Notes** | ✗ not found | |
| Dashboard | Portal dashboards | Real |
| IAM & Access Management | Identity Platform + orgs/profiles | Real |
| Team Management | Customer team management pages | Real |

**Not represented in the marketing tabs, though they exist and ship:**
**Posta Gate** (AI email security), **IO / object storage** (S3-compatible), and the
**Knowledge Base**.

Two consequences:

1. When the remaining tab mockups arrive, the console's real route tree is the best source
   for column names, statuses and resource types — it will read as credible because it is.
2. There is a marketing-vs-reality gap in both directions. Worth a deliberate decision:
   advertise roadmap items as roadmap, and consider surfacing the shipped products that are
   currently missing.

---

## 7. Caveats on this document

- CloudEdge and the portal run on **mock data** — no HTTP client wired. Their UI is
  production-grade; their data is not. Treat route trees as UI truth, not API contracts.
- `posta` (webmail) is at **Phase 0** per its own `CLAUDE.md`, despite a live
  `posta.worldposta.com` — the production mail service predates this rebuild.
- Read at the level of docs, manifests, routes and types. Individual component internals
  were not reviewed.

---

## 8. Screenshotting ecosystem screens (verified 2026-09-13)

Two apps run **standalone with no backend, DB or real auth** — verified: CloudEdge has no
`HttpClient` anywhere in `src/`, and the portal's `context.tsx`/`data.ts` make no API calls.
Everything is mock data. Both were installed and driven with Playwright successfully.

| App | Command | Port | Auth |
|---|---|---|---|
| Portal (unified-sign-in) | `npm run dev` | 3000 | `customer@worldposta.com` / `password` |
| CloudEdge console | `npx ng serve --port 3001` | 3001 | none — mock auth, hardcoded `admin` |

Portal mock passwords are **derived from the role**, not stored: `customer` → `password`,
`admin` → `password_admin`, `super_admin` → `password_super_admin`, `reseller` →
`password_reseller` (see `login` in `context.tsx`). Mock users are in `data.ts`.

### Three gotchas, each of which cost a retry

1. **Both apps use hash routing.** `http://localhost:3000/login` silently serves the landing
   page; the real URL is `http://localhost:3000/#/login`. Same for the console:
   `#/app/cloud-edge/resources/virtual-machines`.
2. **CloudEdge has a splash-screen gate** (`app.component.ts`) that swallows the first
   navigation and redirects to the dashboard. Wait ~6s after load, *then* set the hash.
3. **Angular CLI's first run can be slow and silent.** `ng serve` printed nothing for a
   while; a second attempt then failed with "Port 3001 is already in use" — the first server
   was building all along. Wait on the port, don't assume failure from silence.

### The other apps

| App | Screenshot feasibility |
|---|---|
| **clouddrive** | `web/` proxies to a **real Drive origin** with `DRIVE_SESSION_COOKIE` in `web/.env.local` — currently **empty**, so it needs a session cookie from Atef. `node_modules` already present. |
| **knowledge** | Frontend proxies `/api` → `localhost:3002`. Needs the Express backend + MySQL + Meilisearch. |
| **objstore** | Frontend proxies `/api` → backend. Needs the Go service + Postgres + Redis + Ceph RGW. |
| **posta** | Has a **prebuilt `frontend/apps/web/dist/`** — serve it statically to screenshot the shell without any backend (API calls will fail, UI renders). |
| **WP_Posta** | iOS/SwiftUI — needs Xcode on macOS. **Not possible on this machine.** |
| **link** | Already PNG mockups (M01–M15). Nothing to run. |
