import { Component, DOCUMENT, DestroyRef, ElementRef, afterNextRender, computed, inject, input, signal } from '@angular/core';

export interface JumpLink {
  readonly href: string;
  readonly label: string;
}

/** How far (px) the page must move in one direction before the bar tucks or returns. */
const SCROLL_SLACK = 6;

/**
 * "On this page" navigation shared by every long page. Desktop shows the links
 * as a floating pill row; phones get a compact bar flush under the header that
 * names the current section and opens the full list on tap.
 *
 * - Scroll-spy: the section whose top has passed the anchor line is current,
 *   marked `aria-current="location"` in both layouts.
 * - Phones: the bar tucks under the header while scrolling down and returns on
 *   the first scroll up (CSS only applies the tuck under 768px).
 * - The list closes on a link, Escape (focus back to the toggle) or a tap
 *   outside. Links stay plain anchors, so the app's fragment handler scrolls.
 */
@Component({
  selector: 'nav[appPageJumpNav]',
  host: {
    class: 'page-jump-nav',
    'aria-label': 'On this page',
    '[class.is-tucked]': 'tucked()',
    '[class.is-open]': 'open()',
    '(keydown.escape)': 'closeAndFocus()',
  },
  template: `
    <button
      #toggle
      type="button"
      class="page-jump-nav__toggle"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="listId"
      (click)="open.set(!open())"
    >
      <span class="page-jump-nav__kicker">On this page</span>
      <span class="page-jump-nav__current">{{ currentLabel() }}</span>
      <svg class="page-jump-nav__chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" /></svg>
    </button>
    <div class="page-jump-nav__inner" [id]="listId">
      <span class="page-jump-nav__label">On this page</span>
      @for (link of links(); track link.href; let i = $index) {
        <a [href]="link.href" [attr.aria-current]="active() === i ? 'location' : null" (click)="open.set(false)">{{ link.label }}</a>
      }
    </div>
  `,
})
export class PageJumpNavComponent {
  readonly links = input.required<readonly JumpLink[]>();

  protected readonly open = signal(false);
  protected readonly active = signal(-1);
  protected readonly tucked = signal(false);
  protected readonly listId = `page-jump-list-${nextId++}`;
  protected readonly currentLabel = computed(() => this.links()[this.active()]?.label ?? 'Jump to a section');

  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly #document = inject(DOCUMENT);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const win = this.#document.defaultView;
      if (!win) return;
      let lastY = win.scrollY;
      let frame = 0;
      const update = () => {
        frame = 0;
        this.#spy(win);
        const y = win.scrollY;
        if (Math.abs(y - lastY) < SCROLL_SLACK) return;
        // Tuck only once the bar is pinned under the header, and never while its list is open.
        const pinned = this.#host.nativeElement.getBoundingClientRect().top <= this.#headerHeight(win) + 1;
        this.tucked.set(y > lastY && pinned && !this.open());
        lastY = y;
      };
      const onScroll = () => { frame ||= win.requestAnimationFrame(update); };
      const onPointer = (event: PointerEvent) => {
        if (this.open() && !this.#host.nativeElement.contains(event.target as Node)) this.open.set(false);
      };
      win.addEventListener('scroll', onScroll, { passive: true });
      win.addEventListener('resize', onScroll, { passive: true });
      this.#document.addEventListener('pointerdown', onPointer);
      update();
      destroyRef.onDestroy(() => {
        win.removeEventListener('scroll', onScroll);
        win.removeEventListener('resize', onScroll);
        this.#document.removeEventListener('pointerdown', onPointer);
        if (frame) win.cancelAnimationFrame(frame);
      });
    });
  }

  protected closeAndFocus(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.#host.nativeElement.querySelector<HTMLElement>('.page-jump-nav__toggle')?.focus();
  }

  /**
   * The current section is the last listed one whose top has passed a reading
   * line a third of the way down the area below the header and this nav.
   *
   * "Last passed", not "covers the line": pages list only some of their
   * sections — CloudEdge lists 5 of 10 — so asking which listed section covers
   * the line left nothing marked for every stretch in between, and skipped
   * listed sections outright whenever an unlisted one happened to straddle the
   * line. Carrying the last one forward keeps exactly one link marked from the
   * first section to the foot of the page. Above the first (the hero), nothing
   * is marked, which is correct.
   */
  #spy(win: Window): void {
    const top = parseFloat(win.getComputedStyle(this.#document.documentElement).scrollPaddingTop) || 0;
    const line = top + (win.innerHeight - top) / 3;
    // Of the sections already passed, the one furthest down the page wins.
    // Picking the last in *link* order instead assumes the nav lists sections
    // in the order the page lays them out, which it does not always do: on
    // /posta the nav lists Migration before Security while the page runs the
    // other way round, so Migration was skipped the moment Security passed.
    let current = -1;
    let lowestTop = -Infinity;
    this.links().forEach((link, i) => {
      const target = this.#document.getElementById(decodeURIComponent(link.href.split('#')[1] ?? ''));
      // The page-level block holding the target: its top-level section, not a nested one.
      const section = target?.closest('main > *') ?? target;
      if (!section) return;
      const top = section.getBoundingClientRect().top;
      if (top <= line && top > lowestTop) {
        lowestTop = top;
        current = i;
      }
    });
    this.active.set(current);
  }

  #headerHeight(win: Window): number {
    return parseFloat(win.getComputedStyle(this.#document.documentElement).getPropertyValue('--site-header-h')) || 0;
  }
}

let nextId = 0;
