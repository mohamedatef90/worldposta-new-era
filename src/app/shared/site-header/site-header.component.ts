import { MainNavLinksComponent } from '../main-nav-links/main-nav-links.component';
import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import { Component, effect, inject, input, signal, viewChild, type ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowRight, faBars, faMagnifyingGlass, faMoon, faSun, faXmark } from '@fortawesome/free-solid-svg-icons';
import { ThemeService } from '@/shared/services/theme.service';

/**
 * Chrome shared by every page. The primary tabs live here, in one nav
 * component, for both the desktop bar and the mobile drawer.
 */
@Component({
  imports: [MainNavLinksComponent, FaIconComponent, NgOptimizedImage, RouterLink],
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

  /**
   * Some pages' heroes should never show through the bar at all (e.g. a photo
   * hero where a transparent header would sit awkwardly over a face). Those
   * pages pass `[solid]="true"` to keep the bar's scrolled surface on from
   * the start, instead of waiting for `scrolled`.
   */
  readonly solid = input(false);

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

  protected skipToContent(event: Event): void {
    event.preventDefault();
    const main = this.document.querySelector('main');
    if (!main) return;
    main.setAttribute('tabindex', '-1');
    main.focus({ preventScroll: true });
    main.scrollIntoView({ block: 'start' });
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

