/** Keep same-page navigation on the current route despite Angular's root base URL. */
export function scrollToFragmentOnClick(event: MouseEvent, document: Document): void {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = (event.target as Element | null)?.closest?.('a');
  const href = anchor?.getAttribute('href');
  const location = document.defaultView?.location;
  if (!anchor || !href || !location || anchor.hasAttribute('download') || anchor.getAttribute('target') === '_blank') return;
  const url = new URL(href.startsWith('#') ? location.pathname + location.search + href : href, location.href);
  if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || url.hash.length < 2) return;
  let id: string;
  try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ block: 'start' });
  document.defaultView?.history.replaceState(null, '', location.pathname + location.search + url.hash);
}
