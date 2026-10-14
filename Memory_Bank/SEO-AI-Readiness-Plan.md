# WorldPosta — SEO, AI Readiness & AI Discovery Plan

| | |
|---|---|
| **Date** | 2026-09-12 |
| **Project** | `worldposta-new-era` (Angular 22, standalone, Tailwind v4) |
| **Status** | Plan — not yet implemented. Four decisions open (§6). |
| **Audit basis** | Verified against the running app and the repo, not assumed. Method in §7. |

---

## 1. Executive summary

The site is **client-side rendered and ships an empty HTML shell**. A crawler that
does not execute JavaScript sees no content at all.

This is the dominant finding. It matters far more for AI than for search:

- **Google** renders JavaScript, but on a delayed, budgeted second pass.
- **AI crawlers generally do not execute JavaScript.** GPTBot, ClaudeBot,
  PerplexityBot and CCBot fetch raw HTML. To them the site is currently blank.

Everything else in this report — structured data, `llms.txt`, metadata, copy —
is downstream of that. None of it has any effect until the served HTML contains
content. **Phase 1 is therefore a hard prerequisite, not a priority call.**

Secondary finding: several crawl-infrastructure files exist but are **in the
wrong directory**, left over from the previous Astro site, so they are inert.

---

## 2. Current state — verified findings

### 2.1 No server rendering (CRITICAL)

- `angular.json` declares only a `browser` entry point. No `server`, no
  `outputMode`, no `prerender`.
- `@angular/ssr` is **not installed**.
- The built `dist/worldposta-new-era/browser/index.html` contains
  `<app-root></app-root>` and no page content.
- Grepping the served response for every visible headline on the home page
  returned **0 matches**.

**Consequence:** zero content for non-JS crawlers; delayed and unreliable
indexing for those that do render.

### 2.2 robots.txt is unreachable and stale

- Located at `public/worldposta-assets/robots.txt`, so it serves at
  `/worldposta-assets/robots.txt`. Crawlers only read `/robots.txt`.
  **Effectively there is no robots.txt.**
- Its contents are inherited from the previous **Astro** build: it references
  Astro frontmatter and that stack's `noindex` conventions, and points to
  `https://staging.worldposta.com/sitemap-index.xml`, which does not exist in
  this project.

### 2.3 manifest.json and sw.js are misplaced and stale

- Both sit under `public/worldposta-assets/` instead of the site root.
- `manifest.json` references `/icon-192.png` and `/icon-512.png`; the files are
  actually at `/worldposta-assets/icon-*.png`. The references are broken.
- `sw.js` is the old Astro service worker — it caches `/_astro/*` paths that do
  not exist in an Angular build. Harmless where it currently sits (its scope is
  limited to that subdirectory), but **actively harmful if moved to root
  without a rewrite**.

### 2.4 Missing outright

| Item | State |
|---|---|
| `sitemap.xml` | Absent anywhere in the repo |
| `llms.txt` / `llms-full.txt` | Absent |
| JSON-LD structured data | None |
| Canonical tags | None |
| Open Graph / Twitter cards | None |
| `<meta name="description">` | None |
| `<title>` in `src/index.html` | Still the CLI placeholder **"WorldpostaNewEra"** |

The real title is set client-side by the router (`app.routes.ts` sets
"WorldPosta | Scalable Cloud Infrastructure"). That is invisible to any crawler
that does not run JavaScript.

### 2.5 Interactive content is not in the DOM

In the One Platform section (`ecosystem-tabs`), only the **active** tab's panel
is rendered. 17 of 18 tabs' content is absent from the DOM at any moment — so it
will be absent from prerendered HTML too.

This generalises: any future accordion, carousel, or "load more" hides content
from crawlers the same way. It needs a deliberate answer in Phase 5.

### 2.6 Performance observations

- 3 × `NG02952` warnings (declared vs intrinsic aspect ratio) on `WP-Logo.avif`
  and `cloudedge/dashboard.avif` — a layout-shift (CLS) risk.
- Google Fonts is loaded via a render-blocking `<link>` in `index.html`
  (Poppins + Open Sans). Preconnects are already in place.
- `.avif` and `.webp` variants exist in `public/worldposta-assets/` but several
  components still reference the `.png` (e.g. `hero/posta/suite-light-1680.avif`,
  `hero/cloudedge/dashboard.avif`).
- `NgOptimizedImage` is used consistently — good; keep it.
- Bundle budgets are configured (500 kB warn / 1 MB error, initial).

---

## 3. Why this is an AI problem specifically

Three distinct things get conflated under "AI readiness". They need different work:

1. **AI crawlability** — can the bot fetch and parse the content at all?
   Solved by Phase 1 (server rendering) + Phase 3 (robots/sitemap).
2. **AI comprehension** — does the model understand what WorldPosta *is*, which
   products exist, what they cost, where they run? Solved by Phase 4 (structured
   data) and by writing definitional, extractable copy.
3. **AI citation** — when someone asks an assistant for a recommendation, does
   WorldPosta come up? Follows from 1 and 2, plus off-site authority
   (third-party mentions, reviews, docs) that this codebase cannot control.

A site can be perfectly accessible to Googlebot and still be invisible to
assistants, which is roughly the position today.

---

## 4. The plan

### Phase 1 — Render on the server *(blocker; do first)*

- Run `ng add @angular/ssr`.
- Set `outputMode: "static"` to **prerender** all marketing routes at build time.
  Verified available: the installed `@angular/build` v22 application builder
  supports `outputMode: "static" | "server"` plus `prerender`, `ssr` and
  `server` options.
- Static prerendering (SSG) is the right default for a marketing site — no
  runtime server to operate, fastest possible response, ideal for AI crawlers.
  Switch to `"server"` only if per-request personalization becomes a requirement.
- Audit for browser-only globals (`localStorage`, `window`, `document`) that
  will now execute server-side. Known case: the no-flash theme script in
  `index.html` is already guarded with try/catch; `ThemeService` needs checking.

**Acceptance:** `curl -s https://<host>/ | grep "Scalable Cloud"` returns a match.
That single check is the gate for the whole programme.

### Phase 2 — Metadata layer

- Replace the placeholder `<title>` and add a default `<meta name="description">`
  in `src/index.html`.
- Add an `SeoService` that sets title, description, canonical, Open Graph and
  Twitter tags per route, driven from route `data` so each page declares its own.
- `og:image` per page — the `showcase_*.png` assets are candidates.
- Keep `<html lang="en">` accurate; add `hreflang` when other locales land.

### Phase 3 — Crawl plumbing

- Move `robots.txt` to `public/robots.txt` and **rewrite it** for this stack
  (drop the Astro references, point `Sitemap:` at the real production URL).
- Generate `sitemap.xml` at build time from the route table, so it cannot drift
  from the app.
- Either fix `manifest.json` + `sw.js` (move to `public/`, correct the icon
  paths, rewrite the service worker's cache rules for Angular's hashed output)
  **or delete them** until a PWA is actually wanted. Do not move the SW as-is.

### Phase 4 — Structured data (JSON-LD)

Highest-leverage work for AI comprehension. Emit as
`<script type="application/ld+json">` in the prerendered HTML:

- `Organization` — legal name, logo, `sameAs` social profiles, contact points.
- `WebSite` — with `SearchAction` if site search exists.
- `SoftwareApplication` / `Product` — one per product line (CloudEdge, Posta,
  CloudSpace), with `Offer` for pricing.
- `BreadcrumbList` on every nested page.
- `FAQPage` wherever real Q&A copy exists.

This is what gives an assistant unambiguous facts instead of inferences.

### Phase 5 — AI discovery

- Publish **`llms.txt`** (a concise map of the site for LLMs) and optionally
  **`llms-full.txt`** (expanded content) at the site root.
- Add an explicit AI-crawler policy to `robots.txt` — named agents rather than
  relying on `User-agent: *`: `GPTBot`, `ClaudeBot`, `Claude-User`,
  `Claude-SearchBot`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`,
  `CCBot`, `Bytespider`, `meta-externalagent`. **Allow-or-block is a business
  decision — see §6.1.**
- **Expose hidden content**: ensure tab/accordion content reaches the HTML.
  Options, cheapest first: (a) render all tab panels and hide inactive ones with
  CSS rather than `@if`; (b) give each tab a real route/URL; (c) publish the
  same facts on dedicated product pages. Option (c) is the best long-term answer
  because it also creates indexable landing pages.
- Write for extraction: one clear `h1` per page, descriptive `h2`s, definitional
  opening sentences, comparison tables, stable anchor IDs, and specs/pricing as
  real text — never baked into images.

### Phase 6 — Performance / Core Web Vitals

- Fix the three `NG02952` aspect-ratio mismatches (CLS).
- Self-host the two font families, or preload them, to remove render-blocking.
- Serve the existing `.avif`/`.webp` variants instead of `.png`.
- Re-check bundle budgets once SSR/prerender lands.

### Phase 7 — Migration safety *(only if replacing the live site)*

If this rebuild replaces the existing worldposta.com, this becomes the
highest-risk workstream. A rebuild that silently drops URLs is the standard way
to lose rankings that already exist.

- Crawl the current production site; export every indexed URL.
- Build an old → new redirect map; **301**, never 302; never chain redirects.
- Preserve URL structure wherever a page already ranks.
- Keep titles, descriptions and content at parity or better on migrated pages.
- Submit the change in Search Console; monitor coverage and 404s weekly for the
  first two months.

### Phase 8 — Measurement

- Google Search Console + Bing Webmaster Tools.
- Parse server logs for AI bot user-agents — confirm GPTBot/ClaudeBot are
  actually fetching, and receiving 200s with real HTML.
- Periodically ask the major assistants the questions your customers would ask,
  and record whether WorldPosta appears.

---

## 5. Suggested order

| Order | Phase | Gate |
|---|---|---|
| 1 | Phase 1 — server rendering | Before launch. Blocks everything. |
| 2 | Phase 2 — metadata | Before launch |
| 3 | Phase 3 — robots + sitemap | Before launch |
| 4 | Phase 7 — migration map | Before launch, **if** replacing the live site |
| 5 | Phase 4 — structured data | Launch or shortly after |
| 6 | Phase 5 — AI discovery | After the tab/page structure settles |
| 7 | Phase 6 — performance | Ongoing |
| 8 | Phase 8 — measurement | From launch day |

Phase 5 should wait until the One Platform tabs are finished — how that content
is exposed depends on how many tabs exist and whether they become real pages.

---

## 6. Open decisions

### 6.1 AI crawler policy — allow or block?

For a B2B cloud vendor that wants to be *recommended* when a buyer asks an
assistant for options, the answer is normally **allow**, with `/api/` and
`/admin/` disallowed. But it is your content and a genuine business call, not a
technical default. **Recommendation: allow.**

### 6.2 Is this replacing the live worldposta.com, or launching new?

Determines whether Phase 7 exists at all. If it is a replacement, it moves to
pre-launch priority.

### 6.3 Static prerender (SSG) or a running server (SSR)?

**Recommendation: static**, unless per-request personalization is planned.

### 6.4 Multi-language?

The header has an "En" switcher. If more locales are coming, URL structure and
`hreflang` must be decided *before* launch — retrofitting them is expensive.

---

## 7. How the audit was performed

Reproducible checks, for re-running after Phase 1:

```bash
# 1. Does the served HTML contain real content? (0 = empty shell)
curl -s http://localhost:4200/ | grep -c "Scalable Cloud"

# 2. Is robots.txt reachable at the root?
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4200/robots.txt

# 3. What title/description ship in the built HTML?
grep -o '<title>[^<]*</title>' dist/worldposta-new-era/browser/index.html

# 4. Is SSR available / installed?
node -p "require('./node_modules/@angular/ssr/package.json').version"
```

Also inspected: `angular.json`, `src/index.html`, `src/app/app.routes.ts`,
`src/app/app.config.ts`, `package.json`, `public/**`, and the live DOM via
Playwright.

---

## 8. Related

- Section work in progress is tracked separately — see the One Platform /
  `ecosystem-tabs` notes. Phase 5 depends on it.
- Project conventions live in `AGENT.md` / `CLAUDE.md` at the repo root.
