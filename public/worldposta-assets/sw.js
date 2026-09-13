/**
 * WorldPosta service worker — offline shell + stale-while-revalidate assets.
 *
 * Charter Phase 7.1 P3 PWA layer (v0.13.1-pwa). Minimal by design:
 *   - Cache shell on install: /, manifest, icons, favicon, telemetry payload-free dependencies.
 *   - HTML: network-first (so deploys propagate within 1 page-view) with cache fallback offline.
 *   - /_astro/* (hashed bundles): cache-first (content-addressed = safe to cache forever).
 *   - /api/* + /admin/* + /knowledge/api/* + telemetry: ALWAYS network, NEVER touched.
 *   - On activate, old caches are deleted.
 *
 * Bump CACHE_VERSION whenever the shell list or strategy changes — old SWs unregister cleanly.
 */
const CACHE_VERSION = "wpw-v1";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const SHELL_URLS = [
  "/",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/icon-512.png",
];

const BYPASS_PATH_PREFIXES = [
  "/api/",
  "/admin/",
  "/knowledge/api/",
  "/storage/",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle GET (POST/PUT/DELETE pass through to network unmodified).
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Same-origin only — never cache cross-origin requests (CDNs, identity, etc.).
  if (url.origin !== self.location.origin) return;

  // Bypass API + admin + KB-backend + storage — those must always hit network.
  if (BYPASS_PATH_PREFIXES.some((p) => url.pathname.startsWith(p))) return;

  // Hashed bundle assets (Astro emits to /_astro/) — cache-first, safe.
  if (url.pathname.startsWith("/_astro/")) {
    event.respondWith(cacheFirst(req, RUNTIME_CACHE));
    return;
  }

  // /knowledge/* is the embedded KB SPA — cache the shell + hashed assets, but
  // pass /knowledge/api/ through (handled by BYPASS above).
  if (url.pathname.startsWith("/knowledge/")) {
    event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
    return;
  }

  // HTML (Accept: text/html or path ends with /): network-first with cache fallback.
  const accept = req.headers.get("accept") || "";
  if (accept.includes("text/html") || url.pathname === "/" || url.pathname.endsWith("/")) {
    event.respondWith(networkFirst(req, SHELL_CACHE));
    return;
  }

  // Everything else (images, fonts, etc.): stale-while-revalidate.
  event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (e) {
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (e) {
    const cached = await cache.match(req);
    if (cached) return cached;
    // Offline fallback: try cached root, last resort plain offline doc.
    const root = await cache.match("/");
    if (root) return root;
    return new Response(
      "<!doctype html><title>Offline</title><h1>You are offline</h1><p>This page isn't cached. Reconnect and reload.</p>",
      { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req).then((res) => {
    if (res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => cached);
  return cached || fetchPromise;
}
