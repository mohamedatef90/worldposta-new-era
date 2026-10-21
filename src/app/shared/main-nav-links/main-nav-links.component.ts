import { Component, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowRight, faBookOpen, faBuilding, faCloud, faComments, faEnvelope, faEnvelopeOpenText, faFolderOpen,
  faGears, faHandshake, faHeadset, faLayerGroup, faPaperPlane, faRightLeft, faRobot, faScrewdriverWrench,
  faServer, faShieldHalved, faTableColumns, faTrophy, faUserShield,
} from '@fortawesome/free-solid-svg-icons';

interface NavItem { readonly name: string; readonly description: string; readonly href: string; readonly icon: IconDefinition; }
interface NavGroup { readonly title?: string; readonly items: readonly NavItem[]; }
interface NavMenu {
  readonly id: string;
  readonly label: string;
  readonly icon: IconDefinition;
  /** Sitemap tagline, shown under the menu title in the panel. */
  readonly tagline: string;
  readonly href?: string;
  readonly intro?: string;
  readonly overview?: { readonly label: string; readonly href: string };
  readonly groups?: readonly NavGroup[];
}

/**
 * Primary navigation, shared by the desktop bar and the mobile drawer.
 *
 * Follows the official sitemap. Items without a built page stay hidden until they ship:
 * Kubernetes, DBaaS, Posta Identity, Object Storage, Backup and Veeam (CloudEdge); Partner; Pricing;
 * Mission & Vision, Customer List, Our Impact, Leadership Team (About Us); Resources;
 * Help Center, Submit a Ticket, Contact Support, FAQs (Support).
 *
 * Desktop opens a full-width mega panel on hover or click; mobile renders an accordion.
 */
@Component({
  selector: 'app-main-nav-links',
  imports: [RouterLink, RouterLinkActive, FaIconComponent],
  host: { style: 'display: contents', '(document:keydown.escape)': 'close()', '(document:click)': 'outside($event)' },
  templateUrl: './main-nav-links.component.html',
  styleUrl: './main-nav-links.component.css',
})
export class MainNavLinksComponent {
  readonly mobile = input(false);
  readonly linkClick = output<void>();

  protected readonly arrow = faArrowRight;
  protected readonly open = signal('');
  private hoverTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly menus: readonly NavMenu[] = [
    {
      id: 'cloudedge', label: 'CloudEdge', icon: faCloud, tagline: 'Enterprise Cloud Infrastructure',
      intro: 'Scalable compute, private cloud and managed SAP, built for performance, security and lower cost.',
      overview: { label: 'Explore CloudEdge', href: '/cloudedge' },
      groups: [{ title: 'Cloud services', items: [
        { name: 'Cloud Computing', description: 'Scalable IaaS, private cloud and Zero Trust', href: '/cloudedge', icon: faServer },
        { name: 'SAP Cloud Solutions', description: 'Managed SAP hosting, security and operations', href: '/sap', icon: faLayerGroup },
      ] }],
    },
    {
      id: 'posta', label: 'Posta', icon: faEnvelope, tagline: 'Business Email & Collaboration',
      intro: 'Secure business email, files and team chat that work together in one suite.',
      overview: { label: 'Explore Posta', href: '/posta' },
      groups: [{ title: 'Email & collaboration', items: [
        { name: 'Email', description: 'Secure business email on your own domain', href: '/posta', icon: faEnvelopeOpenText },
        { name: 'Drive', description: 'Files, sharing and team collaboration', href: '/drive', icon: faFolderOpen },
        { name: 'Link', description: 'Team chat and video meetings', href: '/link', icon: faComments },
      ] }],
    },
    { id: 'posta-gate', label: 'Posta Gate', icon: faShieldHalved, tagline: 'Email Gateway & Security', href: '/posta-gate-security' },
    {
      id: 'service-provider', label: 'Service Provider', icon: faHandshake, tagline: 'Managed Services & Support',
      intro: 'Managed IT, security and migration from WPSYS, plus the platform service providers run their email business on.',
      overview: { label: 'Explore WPSYS', href: '/wpsys' },
      groups: [
        { title: 'Managed services', items: [
          { name: 'WPSYS', description: 'Managed IT, cybersecurity and cloud operations', href: '/wpsys', icon: faScrewdriverWrench },
          { name: 'Seamless Migration', description: 'Move workloads with zero downtime', href: '/seamless-migration', icon: faRightLeft },
          { name: 'SAP Basis Operations', description: 'SAP administration, monitoring and optimization', href: '/sap-basis-operations', icon: faGears },
          { name: 'IT Automation', description: 'Automate IT tasks and streamline workflows', href: '/it-software-automation-tools', icon: faRobot },
          { name: 'WPSYS SOC', description: '24/7 cloud-based security operations', href: '/cloud-based-soc-solutions', icon: faUserShield },
        ] },
        { title: 'For service providers', items: [
          { name: 'Posta Portal', description: 'White-label email administration platform', href: '/posta-portal', icon: faTableColumns },
        ] },
      ],
    },
    {
      id: 'about', label: 'About Us', icon: faBuilding, tagline: 'Our Story & Impact',
      intro: 'Who we are, what we believe, and the organizations we work with.',
      overview: { label: 'Read our story', href: '/our-story' },
      groups: [{ title: 'Company', items: [
        { name: 'Our Story', description: 'Who we are and why we built WorldPosta', href: '/our-story', icon: faBookOpen },
        { name: 'Case Studies', description: 'How organizations succeed with WorldPosta', href: '/case-studies', icon: faTrophy },
      ] }],
    },
    {
      id: 'support', label: 'Support', icon: faHeadset, tagline: 'Get Help Anytime',
      intro: 'Talk to sales, request a consultation or reach our support team.',
      overview: { label: 'Contact us', href: '/contact' },
      groups: [{ title: 'Get in touch', items: [
        { name: 'Contact Us', description: 'Talk to sales or reach our support team', href: '/contact', icon: faPaperPlane },
      ] }],
    },
  ];

  protected prefix(): string { return this.mobile() ? 'mobile-menu-' : 'desktop-menu-'; }

  protected toggle(id: string): void {
    this.clearHover();
    this.open.update((value) => (value === id ? '' : id));
  }

  /** Hover intent on desktop only: a short delay keeps the panel from flickering as the pointer crosses the bar. */
  protected hoverOpen(id: string): void {
    if (this.mobile()) return;
    this.clearHover();
    this.hoverTimer = setTimeout(() => this.open.set(id), this.open() ? 0 : 120);
  }

  protected hoverClose(): void {
    if (this.mobile()) return;
    this.clearHover();
    this.hoverTimer = setTimeout(() => this.open.set(''), 180);
  }

  protected follow(): void {
    this.close();
    this.linkClick.emit();
  }

  protected close(): void {
    this.clearHover();
    this.open.set('');
  }

  protected outside(event: Event): void {
    if (!(event.target instanceof Element) || !event.target.closest('app-main-nav-links')) this.close();
  }

  private clearHover(): void {
    if (this.hoverTimer) clearTimeout(this.hoverTimer);
    this.hoverTimer = undefined;
  }
}
