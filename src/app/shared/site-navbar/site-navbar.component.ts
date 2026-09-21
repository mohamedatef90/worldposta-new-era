import { NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowRight,
  faBolt,
  faChartLine,
  faChevronDown,
  faCloud,
  faEnvelope,
  faGlobe,
  faLayerGroup,
  faLock,
  faMicrochip,
  faMoon,
  faNetworkWired,
  faRocket,
  faServer,
  faShieldHalved,
  faSliders,
  faSun,
} from '@fortawesome/free-solid-svg-icons';
import { ThemeService } from '@/shared/services/theme.service';

interface NavLeaf {
  readonly icon: IconDefinition;
  readonly name: string;
  readonly description: string;
}

interface TextMenu {
  readonly id: string;
  readonly label: string;
  readonly kind: 'text';
}

interface FlatMenu {
  readonly id: string;
  readonly label: string;
  readonly kind: 'flat';
  readonly items: readonly NavLeaf[];
}

interface MenuTab {
  readonly id: string;
  readonly label: string;
  readonly items: readonly NavLeaf[];
}

interface TabsMenu {
  readonly id: string;
  readonly label: string;
  readonly kind: 'tabs';
  readonly tabs: readonly MenuTab[];
}

type NavMenu = TextMenu | FlatMenu | TabsMenu;

@Component({
  selector: 'app-site-navbar',
  imports: [FaIconComponent, NgOptimizedImage, NgTemplateOutlet],
  templateUrl: './site-navbar.component.html',
  styleUrl: './site-navbar.component.css',
  host: {
    '(document:keydown.escape)': 'closeAll()',
  },
})
export class SiteNavbarComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly openMenu = signal<string | null>(null);
  protected readonly mobileOpen = signal(false);
  protected readonly mobileSection = signal<string | null>(null);
  protected readonly languageOpen = signal(false);
  protected readonly activeTabs = signal<Record<string, string>>({ solutions: 'backup' });

  private readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  private readonly mobilePanel = viewChild<ElementRef<HTMLElement>>('mobilePanel');
  private closeTimer: ReturnType<typeof setTimeout> | undefined;
  private mobileWasOpen = false;

  protected readonly icons = {
    arrowRight: faArrowRight,
    chevronDown: faChevronDown,
    moon: faMoon,
    sun: faSun,
  };

  protected readonly menus: readonly NavMenu[] = [
    {
      id: 'cloudedge',
      label: 'CloudEdge',
      kind: 'flat',
      items: [
        { icon: faServer, name: 'CloudEdge', description: 'Scalable IaaS, VMs, and resource pools' },
        { icon: faCloud, name: 'Virtual Data Center', description: 'Run a full VDC, not just VMs' },
        { icon: faShieldHalved, name: 'Cloud Firewall', description: 'Stateful firewall with managed rules' },
        { icon: faMicrochip, name: 'NextGen Computing', description: 'H100 GPUs on AMD EPYC 9555' },
        { icon: faChartLine, name: 'Scalability & Performance', description: 'Auto-tuning across your workload' },
        { icon: faNetworkWired, name: 'Resource Pools', description: 'Dedicated CPU, RAM, and storage' },
        { icon: faLock, name: 'Ransomware Protection', description: 'Immutable backups, instant restore' },
        { icon: faShieldHalved, name: 'Comprehensive Security', description: 'Layered security across the stack' },
      ],
    },
    {
      id: 'posta',
      label: 'Posta',
      kind: 'flat',
      items: [
        { icon: faEnvelope, name: 'Posta', description: 'Enterprise email hosting' },
        { icon: faEnvelope, name: 'Posta Hybrid', description: 'Hybrid M365 + Posta deployments' },
      ],
    },
    { id: 'cloudspace', label: 'CloudSpace', kind: 'text' },
    { id: 'postagate', label: 'Posta Gate', kind: 'text' },
    {
      id: 'solutions',
      label: 'Solutions',
      kind: 'tabs',
      tabs: [
        {
          id: 'backup',
          label: 'Backup',
          items: [
            { icon: faCloud, name: 'Comprehensive Backup', description: 'Cloud-native backup for any workload' },
            { icon: faBolt, name: 'Mission-Critical Backup', description: 'RPO/RTO for production systems' },
            { icon: faServer, name: 'Veeam Cloud Connect', description: 'Veeam-certified offsite repository' },
          ],
        },
        {
          id: 'security',
          label: 'Security',
          items: [
            { icon: faShieldHalved, name: 'Advanced Security', description: 'Managed SOC, EDR, and SIEM' },
            { icon: faLock, name: 'Cloud SOC', description: '24/7 security operations center' },
            { icon: faLock, name: 'Ransomware Protection', description: 'Immutable backups + recovery drills' },
          ],
        },
        {
          id: 'migration',
          label: 'Migration',
          items: [
            { icon: faEnvelope, name: 'Email Migration', description: 'M365/Google/IMAP to Posta' },
            { icon: faRocket, name: 'Seamless Migration', description: 'Zero-downtime infrastructure move' },
          ],
        },
      ],
    },
    {
      id: 'service',
      label: 'Service Provider',
      kind: 'flat',
      items: [
        { icon: faGlobe, name: 'Overview', description: 'The operator model, in five minutes' },
        { icon: faLayerGroup, name: 'Core Value', description: 'One platform, not a pile of parts' },
        { icon: faChartLine, name: 'Competitive Analysis', description: 'Who else covers this stack (nobody)' },
        { icon: faSliders, name: 'Platform Spine', description: 'Identity, billing and the Atrium control panel' },
        { icon: faEnvelope, name: 'Posta Suite', description: 'White-label collaboration, sovereign and hybrid-ready' },
        { icon: faCloud, name: 'NextEdge Suite', description: 'Fully managed sovereign cloud infrastructure' },
        { icon: faRocket, name: 'Partner Program', description: 'Commercials, deployment options and next steps' },
      ],
    },
    { id: 'pricing', label: 'Pricing', kind: 'text' },
    { id: 'docs', label: 'Docs', kind: 'text' },
  ];

  constructor() {
    effect(() => {
      const open = this.mobileOpen();
      queueMicrotask(() => {
        if (open) {
          this.mobilePanel()?.nativeElement.focus();
        } else if (this.mobileWasOpen) {
          this.menuButton()?.nativeElement.focus();
        }
        this.mobileWasOpen = open;
      });
    });
  }

  protected showMenu(id: string): void {
    this.cancelClose();
    this.languageOpen.set(false);
    this.openMenu.set(id);
  }

  protected scheduleClose(): void {
    this.cancelClose();
    this.closeTimer = setTimeout(() => this.openMenu.set(null), 160);
  }

  protected cancelClose(): void {
    if (this.closeTimer) clearTimeout(this.closeTimer);
    this.closeTimer = undefined;
  }

  protected selectTab(menuId: string, tabId: string): void {
    this.activeTabs.update((tabs) => ({ ...tabs, [menuId]: tabId }));
  }

  protected isActiveTab(menuId: string, tabId: string): boolean {
    return this.activeTabs()[menuId] === tabId;
  }

  protected activeItems(menu: TabsMenu): readonly NavLeaf[] {
    return menu.tabs.find((tab) => this.isActiveTab(menu.id, tab.id))?.items ?? menu.tabs[0]?.items ?? [];
  }

  protected mobileItems(menu: FlatMenu | TabsMenu): readonly NavLeaf[] {
    return menu.kind === 'tabs' ? menu.tabs.flatMap((tab) => tab.items) : menu.items;
  }

  protected toggleMobile(): void {
    this.mobileOpen.update((open) => !open);
    this.openMenu.set(null);
    this.languageOpen.set(false);
  }

  protected toggleMobileSection(id: string): void {
    this.mobileSection.update((current) => (current === id ? null : id));
  }

  protected toggleLanguage(): void {
    this.languageOpen.update((open) => !open);
    this.openMenu.set(null);
  }

  protected closeLanguage(): void {
    this.languageOpen.set(false);
  }

  protected closeAll(): void {
    this.cancelClose();
    this.openMenu.set(null);
    this.languageOpen.set(false);
    this.mobileOpen.set(false);
    this.mobileSection.set(null);
  }
}
