import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import { Component, computed, effect, inject, signal, viewChild, type ElementRef } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowRight,
  faBars,
  faCalendarDays,
  faChevronDown,
  faChevronRight,
  faCloud,
  faCoins,
  faEnvelope,
  faFolderOpen,
  faGauge,
  faGlobe,
  faLock,
  faMagnifyingGlass,
  faMessage,
  faMoon,
  faNoteSticky,
  faShieldHalved,
  faSun,
  faUsers,
  faVideo,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { ThemeService } from '@/shared/services/theme.service';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { EcosystemTabsComponent } from './ecosystem-tabs/ecosystem-tabs.component';
import { PerformanceTrustComponent } from './performance-trust/performance-trust.component';

interface ProofPoint {
  readonly icon: IconDefinition;
  readonly title: string;
  readonly description: string;
}

interface EcosystemTile {
  readonly icon: IconDefinition;
  readonly label: string;
  readonly href: string;
  readonly colorClass: string;
}

@Component({
  imports: [FaIconComponent, NgOptimizedImage, EcosystemTabsComponent, PerformanceTrustComponent],
  // Escape closes the drawer from anywhere, including from inside it. Declared
  // on `host` rather than @HostListener, per the project conventions.
  host: { '(document:keydown.escape)': 'closeMenu()' },
  selector: 'app-home',
  styleUrl: './home.component.css',
  templateUrl: './home.component.html',
})
export class Home {
  protected readonly theme = inject(ThemeService);
  private readonly document = inject(DOCUMENT);

  /**
   * Below 1024px the primary nav, "Sign in" and "Start free" are all hidden, so
   * this drawer is the only way to reach them on a phone.
   */
  protected readonly menuOpen = signal(false);

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

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected readonly icons = {
    arrowRight: faArrowRight,
    bars: faBars,
    xmark: faXmark,
    chevronDown: faChevronDown,
    chevronRight: faChevronRight,
    cloud: faCloud,
    globe: faGlobe,
    lock: faLock,
    moon: faMoon,
    search: faMagnifyingGlass,
    sun: faSun,
  };

  /**
   * Hero console screenshot for the active theme. Screenshots ship as a
   * light/dark pair (see AGENT.md) — a single-theme shot is a slab of the
   * wrong brightness on the opposite background.
   */
  protected readonly heroConsoleImage = computed(() =>
    this.theme.isDark()
      ? '/worldposta-assets/hero/cloudedge/console-dashboard-dark.png'
      : '/worldposta-assets/hero/cloudedge/console-dashboard.png',
  );

  protected readonly proofPoints: readonly ProofPoint[] = [
    {
      icon: faGauge,
      title: 'High Performance',
      description: 'Built for enterprise workloads.',
    },
    {
      icon: faShieldHalved,
      title: 'Enterprise Security',
      description: 'Your data. Your control. Always protected.',
    },
    {
      icon: faCoins,
      title: 'Up to 50% Lower Cost',
      description: 'More power. Less cost.',
    },
  ];

  protected readonly ecosystemTiles: readonly EcosystemTile[] = [
    { icon: faEnvelope, label: 'Business Email', href: '#email', colorClass: 'tile--green' },
    { icon: faMessage, label: 'Team Chat', href: '#chat', colorClass: 'tile--purple' },
    { icon: faVideo, label: 'Conferencing', href: '#conferencing', colorClass: 'tile--teal' },
    { icon: faCalendarDays, label: 'Calendar', href: '#calendar', colorClass: 'tile--pink' },
    { icon: faFolderOpen, label: 'Files & Storage', href: '#storage', colorClass: 'tile--amber' },
    { icon: faNoteSticky, label: 'Notes', href: '#notes', colorClass: 'tile--sky' },
    { icon: faGauge, label: 'Dashboard', href: '#dashboard', colorClass: 'tile--indigo' },
    { icon: faUsers, label: 'Team Management', href: '#teams', colorClass: 'tile--rose' },
  ];
}
