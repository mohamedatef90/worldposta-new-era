/**
 * Handles clicks on same-page `href="#id"` anchors.
 *
 * Angular apps serve `<base href="/">`, and per the URL spec a fragment-only
 * `href` resolves against that base, not the current document — so on any
 * route other than `/`, a plain `<a href="#pricing">` silently navigates back
 * to `/` instead of scrolling. Call this from a `(click)` host listener on
 * each routed page to scroll to the target instead and keep the current path.
 */
export function scrollToFragmentOnClick(event: MouseEvent, document: Document): void {
  const anchor = (event.target as HTMLElement).closest?.('a');
  if (!anchor) return;

  const href = anchor.getAttribute('href');
  if (!href || !href.startsWith('#') || href.length < 2) return;

  const target = document.getElementById(href.slice(1));
  if (!target) return;

  event.preventDefault();
  // No explicit `behavior` here: `block: 'start'` with the default 'auto'
  // already picks up smooth easing from the global `html { scroll-behavior:
  // smooth }` rule, matching every other in-page anchor jump on the site.
  target.scrollIntoView({ block: 'start' });

  // A bare `#fragment` given to replaceState resolves against `<base href>`
  // the same way an anchor's href does — reassert the current path/query so
  // the URL doesn't jump to the app root.
  const location = document.defaultView?.location;
  if (location) {
    document.defaultView?.history.replaceState(null, '', location.pathname + location.search + href);
  }
}
