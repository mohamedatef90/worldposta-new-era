import { DOCUMENT, NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowRight,
  faChevronRight,
  faCloud,
  faCoins,
  faGauge,
  faLock,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { ThemeService } from '@/shared/services/theme.service';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { EcosystemTabsComponent } from '@/shared/ecosystem-tabs/ecosystem-tabs.component';
import { GetStartedComponent } from './get-started/get-started.component';
import { SecuritySectionComponent } from './security-section/security-section.component';
import { WhyWorldpostaComponent } from './why-worldposta/why-worldposta.component';
import { SiteFooterComponent } from '@/shared/site-footer/site-footer.component';
import { SiteHeaderComponent } from '@/shared/site-header/site-header.component';
import { PerformanceTrustComponent } from './performance-trust/performance-trust.component';
import { scrollToFragmentOnClick } from '@/shared/utils';

import { PageJumpNavComponent } from '@/shared/page-jump-nav/page-jump-nav.component';
interface ProofPoint {
  readonly icon: IconDefinition;
  readonly title: string;
  readonly description: string;
}

interface EcosystemTile {
  readonly label: string;
  /** Omitted when the product has no page yet, so the tile stays visible but not a link. */
  readonly href?: string;
  readonly colorClass: string;
  /** Official Posta Workspace mark. Tiles without one keep a Font Awesome glyph. */
  readonly logo?: string;
  readonly logoWidth?: number;
  readonly logoHeight?: number;
  readonly icon?: IconDefinition;
}

@Component({
  imports: [PageJumpNavComponent, 
    FaIconComponent,
    NgOptimizedImage,
    NgTemplateOutlet,
    SiteHeaderComponent,
    EcosystemTabsComponent,
    PerformanceTrustComponent,
    SecuritySectionComponent,
    WhyWorldpostaComponent,
    GetStartedComponent,
    SiteFooterComponent,
  ],
  // Plain `href="#id"` anchors resolve against `<base href="/">`, not the
  // current route, so a bare click would navigate away instead of scrolling.
  host: {
    '(click)': 'onInPageAnchorClick($event)',
  },
  selector: 'app-home',
  styleUrl: './home.component.css',
  templateUrl: './home.component.html',
})
export class Home {
  protected readonly theme = inject(ThemeService);
  private readonly document = inject(DOCUMENT);

  protected onInPageAnchorClick(event: MouseEvent): void {
    scrollToFragmentOnClick(event, this.document);
  }

  protected readonly icons = {
    arrowRight: faArrowRight,
    chevronRight: faChevronRight,
    cloud: faCloud,
    lock: faLock,
  };

  /**
   * Hero console screenshot for the active theme. Screenshots ship as a
   * light/dark pair (see AGENT.md) — a single-theme shot is a slab of the
   * wrong brightness on the opposite background.
   */
  protected readonly heroConsoleImage = computed(() =>
    this.theme.isDark()
      ? '/worldposta-assets/hero/cloudedge/console-dashboard-dark.avif'
      : '/worldposta-assets/hero/cloudedge/console-dashboard.avif',
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
      title: 'Lower Cost',
      description: 'More power. Less cost.',
    },
  ];

  protected readonly ecosystemTiles: readonly EcosystemTile[] = [
    { logo: '/worldposta-assets/product-logos/posta-admin.png', logoWidth: 439, logoHeight: 421, label: 'Posta Admin', href: '/posta-portal', colorClass: 'tile--indigo' },
    { logo: '/worldposta-assets/product-logos/posta-mail.png', logoWidth: 440, logoHeight: 336, label: 'Posta Mail', href: '/posta', colorClass: 'tile--green' },
    { logo: '/worldposta-assets/product-logos/posta-link.png', logoWidth: 439, logoHeight: 419, label: 'Posta Link', href: '/link', colorClass: 'tile--purple' },
    { logo: '/worldposta-assets/product-logos/posta-drive.png', logoWidth: 440, logoHeight: 318, label: 'Posta Drive', href: '/drive', colorClass: 'tile--amber' },
    { logo: '/worldposta-assets/product-logos/posta-office.png', logoWidth: 420, logoHeight: 421, label: 'Posta Office', colorClass: 'tile--teal' },
    { logo: '/worldposta-assets/product-logos/posta-calendar.png', logoWidth: 416, logoHeight: 421, label: 'Posta Calendar', colorClass: 'tile--pink' },
    { logo: '/worldposta-assets/product-logos/posta-note.png', logoWidth: 440, logoHeight: 414, label: 'Posta Note', colorClass: 'tile--sky' },
  ];
}
