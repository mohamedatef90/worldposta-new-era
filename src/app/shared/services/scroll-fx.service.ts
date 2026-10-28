import { DOCUMENT, Service, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/** How far (px) of page scroll a `.parallax-drift` layer takes to reach its full offset. */
const DRIFT_DISTANCE = 640;

interface Drift {
  readonly el: HTMLElement;
  readonly amount: number;
}

interface Frame {
  readonly frame: HTMLElement;
  readonly img: HTMLElement;
  readonly amount: number;
}

/**
 * Scroll effects for every page, started once by the root component:
 *
 * - Reveal: each top-level `<section>` in `<main>` (after the hero) fades up
 *   the first time it enters the viewport.
 * - Parallax: `.parallax-drift` layers lag by `--parallax` px over the first
 *   640px of scroll; a `.parallax-window` frame's image glides by
 *   ±`--parallax-window` % as the frame crosses the viewport.
 *
 * JS rather than CSS scroll timelines so it works in every browser. One passive
 * scroll listener, batched to a frame, writing only `translate`. Everything is
 * skipped under reduced motion, and nothing is hidden until this has run.
 */
@Service()
export class ScrollFxService {
  readonly #document = inject(DOCUMENT);
  readonly #window = this.#document.defaultView;
  readonly #reduceMotion = this.#window?.matchMedia('(prefers-reduced-motion: reduce)');

  #drifts: Drift[] = [];
  #frames: Frame[] = [];
  #revealObserver?: IntersectionObserver;
  #frameRequested = false;

  constructor() {
    const win = this.#window;
    if (!win) return;
    inject(Router)
      .events.pipe(filter((event) => event instanceof NavigationEnd))
      // The routed page renders after NavigationEnd; scan once it is in the DOM.
      .subscribe(() => win.requestAnimationFrame(() => win.setTimeout(() => this.#scan())));
    win.addEventListener('scroll', () => this.#requestUpdate(), { passive: true });
    win.addEventListener('resize', () => this.#scan(), { passive: true });
    this.#reduceMotion?.addEventListener('change', () => this.#scan());
  }

  #scan(): void {
    const win = this.#window!;
    const reduced = this.#reduceMotion?.matches ?? true;
    this.#setupReveal(reduced);

    // Clear what a previous page or setting left behind.
    for (const { el } of this.#drifts) el.style.translate = '';
    for (const { img } of this.#frames) img.style.translate = '';
    this.#drifts = [];
    this.#frames = [];
    if (reduced) return;

    const root = win.getComputedStyle(this.#document.documentElement);
    const k = parseFloat(root.getPropertyValue('--parallax-k')) || 1;
    // An explicit 0 (e.g. `--parallax: 0px` to switch a layer off) must win over the fallback.
    const readVar = (el: Element, name: string, fallback: number) => {
      const value = parseFloat(win.getComputedStyle(el).getPropertyValue(name));
      return Number.isNaN(value) ? fallback : value;
    };

    this.#drifts = [...this.#document.querySelectorAll<HTMLElement>('.parallax-drift')].map((el) => ({
      el,
      amount: readVar(el, '--parallax', 80) * k,
    }));
    this.#frames = [...this.#document.querySelectorAll<HTMLElement>('.parallax-window')]
      .map((frame) => ({ frame, img: frame.querySelector<HTMLElement>(':scope > img')!, amount: readVar(frame, '--parallax-window', 8) * k }))
      .filter((f) => f.img);
    this.#update();
  }

  #setupReveal(reduced: boolean): void {
    this.#revealObserver?.disconnect();
    const sections = [...this.#document.querySelectorAll<HTMLElement>('main section')]
      .filter((section) => !section.parentElement?.closest('section'))
      .slice(1); // the hero is already in view
    if (reduced || !('IntersectionObserver' in this.#window!)) {
      for (const section of sections) section.classList.remove('fx-reveal');
      return;
    }
    this.#revealObserver = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('fx-in');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    );
    for (const section of sections) {
      if (section.classList.contains('fx-in')) continue;
      section.classList.add('fx-reveal');
      this.#revealObserver.observe(section);
    }
  }

  #requestUpdate(): void {
    if (this.#frameRequested || (!this.#drifts.length && !this.#frames.length)) return;
    this.#frameRequested = true;
    this.#window!.requestAnimationFrame(() => {
      this.#frameRequested = false;
      this.#update();
    });
  }

  #update(): void {
    const win = this.#window!;
    const progress = Math.min(Math.max(win.scrollY / DRIFT_DISTANCE, 0), 1);
    for (const { el, amount } of this.#drifts) el.style.translate = `0 ${(progress * amount).toFixed(1)}px`;

    const viewport = win.innerHeight;
    for (const { frame, img, amount } of this.#frames) {
      const rect = frame.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > viewport) continue;
      // 0 as the frame enters at the bottom, 1 as it leaves at the top.
      const p = (viewport - rect.top) / (viewport + rect.height);
      img.style.translate = `0 ${((p * 2 - 1) * amount).toFixed(2)}%`;
    }
  }
}
