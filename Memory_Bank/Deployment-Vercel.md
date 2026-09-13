# Deployment — Vercel setup

| | |
|---|---|
| **Date** | 2026-09-13 |
| **Status** | **Deployed.** Pushed to GitHub, Vercel project linked, auto-deploy on push to `main`. |
| **Live URL** | https://worldposta-new-era.vercel.app — public, but `noindex` (see §7) |
| **Repo** | https://github.com/mohamedatef90/worldposta-new-era (private) |
| **Vercel project** | `worldposta-new-era` in `matefm20-gmailcom's projects` (hobby) |

---

## 1. What is done

- `git init -b main`, first commit `9a93671` — 490 files.
- `.gitattributes` added **before** the first commit (LF in repo, native in
  working copies). Doing this later would have caused a repo-wide
  line-ending renormalisation diff.
- `.gitignore` extended: `.vercel`, `.claude/settings.local.json`, `.tifo/`,
  `.playwright-mcp/` — build output and machine-local agent state stay out.
- `vercel.json` added (see §3).
- Verified: no credentials anywhere in the tree before committing.
- `pnpm build` clean after the change.

## 2. Remaining steps

```bash
# 1. Create the remote and push (gh is already authenticated)
gh repo create worldposta-new-era --private --source=. --remote=origin --push

# 2. Connect it in Vercel
#    Dashboard → Add New → Project → import the GitHub repo.
#    vercel.json supplies build command and output directory, so the
#    dashboard fields can be left at their defaults.
```

Vercel settings, for reference — all already covered by `vercel.json`:

| Setting | Value |
|---|---|
| Build command | `pnpm build` |
| Output directory | `dist/worldposta-new-era/browser` |
| Install command | Vercel default (detects `pnpm-lock.yaml` + `packageManager`) |
| Node version | 22.x or newer (Angular 22 requires ^20.19 \|\| ^22.12 \|\| >=24) |

## 3. vercel.json — what and why

- **`rewrites`** — `/((?!api/).*)` → `/index.html`. The router has a `**`
  catch-all, so without this any deep link 404s on refresh. Vercel matches
  real files on disk *before* rewrites, so `/robots.txt` and
  `/worldposta-assets/*` still serve normally.
- **Cache headers, split deliberately in two:**
  - `*.js` / `*.css` → `immutable`, one year. Safe because Angular builds with
    `outputHashing: "all"`, so these filenames change whenever content does.
  - `/worldposta-assets/*` → one hour + `stale-while-revalidate`. These are
    copied from `public/` **unhashed**, so `immutable` would pin a stale logo
    for a year after replacing it.
  - `/index.html` → `must-revalidate`, so deploys take effect immediately.

## 4. Preview vs production — hold the line

**Do not point a public production domain at this until Phase 1 of the SEO plan
is done.** The current build is client-side rendered and serves an empty HTML
shell — see `SEO-AI-Readiness-Plan.md` §2.1. Publishing it means search engines
and AI crawlers index a blank page as their first impression of the site.

Preview deployments are fine and useful now: Vercel serves preview deployments
with an `X-Robots-Tag: noindex` header, so they stay out of search results.
Confirm the project's Deployment Protection settings in the dashboard if the
preview URL should also require auth to open.

## 5. What changes when SSR lands (SEO Phase 1)

Adding `@angular/ssr` changes the build output shape:

- `outputMode: "static"` (prerender/SSG) — still a static directory, but the
  path changes. **`outputDirectory` in `vercel.json` will need updating.**
- `outputMode: "server"` (SSR) — Vercel deploys the server bundle as a
  function. `outputDirectory` no longer applies in the same way.

Either way Vercel supports it natively; only `vercel.json` needs revisiting.
Re-run the audit commands in `SEO-AI-Readiness-Plan.md` §7 against the preview
URL afterwards to confirm real HTML is being served.

## 6. Open question — 33 MB of legacy assets

`public/worldposta-assets/legacy/` is **33 MB** and is referenced **nowhere** in
`src/`. It is inherited from the previous Astro site.

It is currently in the first commit, so it will live in git history permanently
once pushed. Options, cheapest first:

1. **Decide before pushing.** If those images are not needed, remove them and
   amend the initial commit — trivial now, a history rewrite later.
2. **Keep them** if they are source material for product/marketing pages not yet
   built. 33 MB is not fatal, just permanent.
3. **Archive them outside the repo** (cloud storage) and pull back only what
   each new page actually uses.

No action taken — this is a content decision, not a technical one.

---

## 7. Deployment log — 2026-09-13

Pushed to GitHub and linked the Vercel project to the repo, so every push to
`main` now deploys automatically. Build succeeded on the first attempt; Vercel
auto-detected the Angular framework preset.

### The one surprise

Linking the repo created a **production** deployment, not a preview — on the
public alias `worldposta-new-era.vercel.app`, returning HTTP 200 to anyone with
**no `X-Robots-Tag`**. Only the deployment-specific URL was protected and
`noindex`. That is exactly the exposure §4 warns about: the CSR empty shell,
titled "WorldpostaNewEra", open to be indexed as the site's first impression.

**Mitigated by serving `X-Robots-Tag: noindex, nofollow` on every route**
(commit `790f8ab`), rather than disallowing in `robots.txt`. The reason matters:
a crawler blocked by `robots.txt` never fetches the page, so it never sees a
noindex and can still index a bare URL from external links. Allowing the fetch
and returning the header is the reliable way to stay out of the index.

The URL stays openable by anyone with the link — convenient for review — while
staying out of search results and AI indexes.

### Verified live

| Check | Result |
|---|---|
| `GET /` | 200, `X-Robots-Tag: noindex, nofollow` |
| `/index.html` cache | `max-age=0, must-revalidate` |
| Hashed JS (`main-*.js`) | `max-age=31536000, immutable` |
| Unhashed public asset | `max-age=3600, stale-while-revalidate=86400` |
| Deep link `/some/deep/link` | 200 (SPA rewrite working, no 404) |
| Page content in raw HTML | **Still absent** — CSR, as expected until Phase 1 |

### Going live properly, later

1. Complete SEO Phase 1 (SSR/prerender) and update `outputDirectory` (§5).
2. Confirm `curl -s <url>/ | grep "Scalable Cloud"` matches.
3. Do Phases 2–3 (metadata, real `robots.txt`, sitemap).
4. **Only then** remove the `X-Robots-Tag` block from `vercel.json`.
5. Attach the real domain and submit to Search Console.
