import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowRight,
  faCalendarDays,
  faChevronRight,
  faCloud,
  faCoins,
  faEnvelope,
  faFolderOpen,
  faGauge,
  faLock,
  faMessage,
  faNoteSticky,
  faShieldHalved,
  faUsers,
  faVideo,
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
  readonly icon: IconDefinition;
  readonly label: string;
  readonly href: string;
  readonly colorClass: string;
}

@Component({
  imports: [PageJumpNavComponent, 
    FaIconComponent,
    NgOptimizedImage,
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
    { icon: faEnvelope, label: 'Posta Mail', href: '/posta', colorClass: 'tile--green' },
    { icon: faMessage, label: 'Posta Link: Chat', href: '/link', colorClass: 'tile--purple' },
    { icon: faVideo, label: 'Posta Link: Meetings', href: '/link', colorClass: 'tile--teal' },
    { icon: faCalendarDays, label: 'Posta Calendar', href: '/cloudspace', colorClass: 'tile--pink' },
    { icon: faFolderOpen, label: 'Posta Drive', href: '/drive', colorClass: 'tile--amber' },
    { icon: faNoteSticky, label: 'Posta Note', href: '/cloudspace', colorClass: 'tile--sky' },
    { icon: faGauge, label: 'Dashboard', href: '/cloudspace', colorClass: 'tile--indigo' },
    { icon: faUsers, label: 'Team Management', href: '/link', colorClass: 'tile--rose' },
  ];
}
