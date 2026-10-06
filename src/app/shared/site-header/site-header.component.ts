import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import { Component, effect, inject, signal, viewChild, type ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowRight, faBars, faMagnifyingGlass, faMoon, faSun, faXmark } from '@fortawesome/free-solid-svg-icons';
import { ThemeService } from '@/shared/services/theme.service';

/**
 * Chrome shared by every page: brand, theme toggle, search, sign-in/CTA and the
 * mobile drawer with its focus management. Each page's own primary-nav links
 * differ (same-page anchors into that page's own sections), so they are
 * projected in rather than baked in here — see `[nav-links]` / `[mobile-nav-links]`.
 */
@Component({
  imports: [FaIconComponent, NgOptimizedImage, RouterLink],
  // Escape closes the drawer from anywhere, including from inside it. Declared
  // on `host` rather than @HostListener, per the project conventions.
  host: {
    '(document:keydown.escape)': 'closeMenu()',
    '(window:scroll)': 'onScroll()',
  },
  selector: 'app-site-header',
  styleUrl: './site-header.component.css',
  templateUrl: './site-header.component.html',
})
export class SiteHeaderComponent {
  protected readonly theme = inject(ThemeService);
  private readonly document = inject(DOCUMENT);

  /**
   * Below 1024px the primary nav, "Sign in" and "Start free" are all hidden, so
   * this drawer is the only way to reach them on a phone.
   */
  protected readonly menuOpen = signal(false);

  /**
   * The bar is fixed and transparent over the hero, so it only takes a surface
   * once the page has scrolled — otherwise it would cut a band across the hero.
   */
  protected readonly scrolled = signal(false);

  private readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  private readonly menuPanel = viewChild<ElementRef<HTMLElement>>('menuPanel');

  constructor() {
    // Locking the body stops the page scrolling behind the open drawer; the
    // class lives in the global stylesheet since component styles cannot
    // reach <body>.
    effect(() => {
      this.document.body.classList.toggle('nav-open', this.menuOpen());
    });

    // Move focus into the drawer when it opens and hand it back to the button
    // when it closes, so keyboard and screen-reader users are not stranded.
    effect(() => {
      const open = this.menuOpen();
      queueMicrotask(() => {
        if (open) {
          this.menuPanel()?.nativeElement.querySelector('a')?.focus();
        } else if (this.document.activeElement === this.document.body) {
          this.menuButton()?.nativeElement.focus();
        }
      });
    });
  }

  protected onScroll(): void {
    this.scrolled.set(this.document.defaultView!.scrollY > 8);
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  /** Public: pages close the drawer themselves when a projected nav link is clicked. */
  closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected readonly icons = {
    arrowRight: faArrowRight,
    bars: faBars,
    xmark: faXmark,
    search: faMagnifyingGlass,
    moon: faMoon,
    sun: faSun,
  };
}
