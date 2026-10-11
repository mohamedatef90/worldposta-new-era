import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import { Component, inject, signal, viewChild, type ElementRef } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowRight,
  faAward,
  faBell,
  faBolt,
  faBoxArchive,
  faBrain,
  faBuilding,
  faBuildingColumns,
  faCalendar,
  faCalendarCheck,
  faCertificate,
  faChartColumn,
  faChartSimple,
  faCheck,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faCircleCheck,
  faCircleQuestion,
  faCircleXmark,
  faClock,
  faClockRotateLeft,
  faCloud,
  faCommentDots,
  faComments,
  faCreditCard,
  faDatabase,
  faDesktop,
  faEarthEurope,
  faEllipsis,
  faEnvelope,
  faEnvelopesBulk,
  faFile,
  faFileArrowUp,
  faFileExcel,
  faFileLines,
  faFilePdf,
  faGaugeHigh,
  faGear,
  faGift,
  faGlobe,
  faHandHoldingDollar,
  faHeadset,
  faInbox,
  faLandmark,
  faLayerGroup,
  faListCheck,
  faLock,
  faMagnifyingGlass,
  faPaperPlane,
  faPaperclip,
  faPlane,
  faPlay,
  faPlus,
  faReply,
  faScaleBalanced,
  faServer,
  faShare,
  faShieldHalved,
  faSignal,
  faSitemap,
  faSquareCheck,
  faStar,
  faStopwatch,
  faTableCellsLarge,
  faTableColumns,
  faTowerBroadcast,
  faTrashCan,
  faUpRightAndDownLeftFromCenter,
  faUser,
  faUserCheck,
  faUserGroup,
  faUserShield,
  faUserTie,
  faUsers,
  faVideo,
} from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { MainNavLinksComponent } from '@/shared/main-nav-links/main-nav-links.component';
import { SiteFooterComponent } from '@/shared/site-footer/site-footer.component';
import { SiteHeaderComponent } from '@/shared/site-header/site-header.component';
import { RevealDirective } from '@/shared/directives/reveal.directive';
import { scrollToFragmentOnClick } from '@/shared/utils';

type BillingPeriod = 'monthly' | 'annual';

interface Plan {
  readonly name: string;
  readonly icon?: IconDefinition;
  readonly flag?: string;
  readonly tone?: string;
  readonly featured?: boolean;
  readonly free?: boolean;
  readonly price: { readonly monthly: string; readonly annual: string };
  readonly priceSuffix: string;
  readonly description?: string;
  readonly features: readonly string[];
  readonly cta: { readonly label: string; readonly href: string; readonly variant: 'primary' | 'outline' | 'blue' };
}

interface MigrationTile {
  readonly icon: IconDefinition;
  readonly tone: string;
  readonly num: string;
  readonly titleLines: readonly [string, string];
}

interface CertItem {
  readonly icon?: IconDefinition;
  readonly mark?: string;
  readonly tone: string;
  readonly name: string;
  readonly description: string;
  readonly pill: string;
}

interface Story {
  readonly photo: string;
  readonly photoAlt: string;
  readonly photoWidth: number;
  readonly photoHeight: number;
  readonly chipIcon: IconDefinition;
  readonly chipLabel: string;
  readonly logo: string;
  readonly logoAlt: string;
  readonly logoWidth: number;
  readonly logoHeight: number;
  readonly quote: string;
  readonly cite: string;
}

interface ResourceCard {
  readonly icon: IconDefinition;
  readonly tone: string;
  readonly cover: string;
  readonly coverAlt: string;
  readonly title: string;
  readonly description: string;
  readonly href?: string;
}

/**
 * Posta product marketing page. Reuses the shared header/footer chrome; the
 * sections below are specific to Posta and own their content + CSS.
 */
@Component({
  imports: [FaIconComponent, NgOptimizedImage, RevealDirective, MainNavLinksComponent, SiteFooterComponent, SiteHeaderComponent],
  // Plain `href="#id"` anchors resolve against `<base href="/">`, not this
  // route, so a bare click would navigate back to "/" instead of scrolling.
  host: {
    '(click)': 'onInPageAnchorClick($event)',
  },
  selector: 'app-posta',
  styleUrl: './posta.component.css',
  templateUrl: './posta.component.html',
})
export class PostaComponent {
  private readonly document = inject(DOCUMENT);

  protected onInPageAnchorClick(event: MouseEvent): void {
    scrollToFragmentOnClick(event, this.document);
  }

  protected readonly icons = {
    arrowRight: faArrowRight,
    award: faAward,
    bell: faBell,
    bolt: faBolt,
    boxArchive: faBoxArchive,
    brain: faBrain,
    building: faBuilding,
    buildingColumns: faBuildingColumns,
    calendar: faCalendar,
    calendarCheck: faCalendarCheck,
    certificate: faCertificate,
    chartColumn: faChartColumn,
    chartSimple: faChartSimple,
    check: faCheck,
    chevronDown: faChevronDown,
    chevronLeft: faChevronLeft,
    chevronRight: faChevronRight,
    circleCheck: faCircleCheck,
    circleQuestion: faCircleQuestion,
    circleXmark: faCircleXmark,
    clock: faClock,
    clockRotateLeft: faClockRotateLeft,
    cloud: faCloud,
    commentDots: faCommentDots,
    comments: faComments,
    creditCard: faCreditCard,
    database: faDatabase,
    desktop: faDesktop,
    earthEurope: faEarthEurope,
    ellipsis: faEllipsis,
    envelope: faEnvelope,
    envelopesBulk: faEnvelopesBulk,
    file: faFile,
    fileArrowUp: faFileArrowUp,
    fileExcel: faFileExcel,
    fileLines: faFileLines,
    filePdf: faFilePdf,
    gaugeHigh: faGaugeHigh,
    gear: faGear,
    gift: faGift,
    globe: faGlobe,
    google: faGoogle,
    handHoldingDollar: faHandHoldingDollar,
    headset: faHeadset,
    inbox: faInbox,
    landmark: faLandmark,
    layerGroup: faLayerGroup,
    listCheck: faListCheck,
    lock: faLock,
    magnifyingGlass: faMagnifyingGlass,
    paperPlane: faPaperPlane,
    paperclip: faPaperclip,
    plane: faPlane,
    play: faPlay,
    plus: faPlus,
    reply: faReply,
    scaleBalanced: faScaleBalanced,
    server: faServer,
    share: faShare,
    shieldHalved: faShieldHalved,
    signal: faSignal,
    sitemap: faSitemap,
    squareCheck: faSquareCheck,
    star: faStar,
    stopwatch: faStopwatch,
    tableCellsLarge: faTableCellsLarge,
    tableColumns: faTableColumns,
    towerBroadcast: faTowerBroadcast,
    trashCan: faTrashCan,
    upRightAndDownLeftFromCenter: faUpRightAndDownLeftFromCenter,
    user: faUser,
    userCheck: faUserCheck,
    userGroup: faUserGroup,
    userShield: faUserShield,
    userTie: faUserTie,
    users: faUsers,
    video: faVideo,
  };

  /** "Billed annually" copy swaps with the toggle; the plan prices in this mockup are the same either way. */
  protected readonly billing = signal<BillingPeriod>('annual');

  protected readonly compareExpanded = signal(false);

  private readonly storiesTrack = viewChild<ElementRef<HTMLElement>>('storiesTrack');

  protected setBilling(period: BillingPeriod): void {
    this.billing.set(period);
  }

  protected toggleCompare(): void {
    this.compareExpanded.update((open) => !open);
  }

  protected expandCompare(): void {
    this.compareExpanded.set(true);
  }

  protected scrollStories(direction: 1 | -1): void {
    const track = this.storiesTrack()?.nativeElement;
    const card = track?.querySelector<HTMLElement>('.story');
    const step = card ? card.getBoundingClientRect().width + 24 : 300;
    track?.scrollBy({ left: step * direction, behavior: 'smooth' });
  }

  /** The signup/contact forms in this mockup have no backend yet. */
  protected onMockSubmit(event: Event): void {
    event.preventDefault();
  }

  protected readonly plans: readonly Plan[] = [
    {
      name: 'Posta Free',
      flag: 'Free forever',
      free: true,
      price: { monthly: '$0', annual: '$0' },
      priceSuffix: '/forever',
      description: 'Get started with 5 business emails for your domain.',
      features: ['5 mailboxes', '1 GB per mailbox', 'Your own domain', 'Web & mobile access', 'Team chat (Posta Link)'],
      cta: { label: 'Get 5 Free Emails', href: '#start', variant: 'primary' },
    },
    {
      name: 'Posta Light',
      icon: faEnvelope,
      tone: 'green',
      price: { monthly: '$1.5', annual: '$1.5' },
      priceSuffix: '/user/month',
      features: ['10GB mailbox', '2GB CloudSpace', '20 days restore', '2 hosted domains', 'Essential security'],
      cta: { label: 'Buy now', href: '#contact', variant: 'outline' },
    },
    {
      name: 'Posta Business',
      icon: faUsers,
      featured: true,
      price: { monthly: '$3.5', annual: '$3.5' },
      priceSuffix: '/user/month',
      features: [
        '100GB mailbox',
        '100GB CloudSpace',
        '40 days restore',
        '5 hosted domains',
        'Advanced security',
        'Chat & video',
        'Mail approval + monitoring',
      ],
      cta: { label: 'Buy now', href: '#contact', variant: 'blue' },
    },
    {
      name: 'Posta Pro',
      icon: faChartSimple,
      tone: 'blue',
      price: { monthly: '$5', annual: '$5' },
      priceSuffix: '/user/month',
      features: ['200GB mailbox', '1TB CloudSpace', '60 days restore', '10 hosted domains', 'Advanced security', 'Video conferences'],
      cta: { label: 'Buy now', href: '#contact', variant: 'outline' },
    },
    {
      name: 'Posta Enterprise',
      icon: faBuilding,
      tone: 'teal',
      price: { monthly: '$10', annual: '$10' },
      priceSuffix: '/user/month',
      features: [
        '1TB mailbox',
        '5TB CloudSpace',
        '100 days restore',
        'Unlimited domains',
        'Enterprise security',
        'Archiving',
        'Dedicated support',
      ],
      cta: { label: 'Buy now', href: '#contact', variant: 'outline' },
    },
  ];

  protected readonly migrationTiles: readonly MigrationTile[] = [
    { icon: faStopwatch, tone: 'green', num: '01', titleLines: ['Zero', 'Downtime'] },
    { icon: faHandHoldingDollar, tone: 'blue', num: '02', titleLines: ['Completely', 'Free'] },
    { icon: faFileArrowUp, tone: 'purple', num: '03', titleLines: ['Upload PST', 'Files to Cloud'] },
    { icon: faUserShield, tone: 'green', num: '04', titleLines: ['Secure', 'Process'] },
    { icon: faListCheck, tone: 'blue', num: '05', titleLines: ['Accurate &', 'Easy Tool'] },
    { icon: faEnvelopesBulk, tone: 'amber', num: '06', titleLines: ['IMAP/POP3/', 'Exchange'] },
    { icon: faDesktop, tone: 'pink', num: '07', titleLines: ['RDP', 'Support'] },
    { icon: faUserTie, tone: 'leaf', num: '08', titleLines: ['Dedicated', 'Project Manager'] },
  ];

  protected readonly certs: readonly CertItem[] = [
    {
      mark: '/worldposta-assets/brand-logos/partners/microsoft.svg',
      tone: 'sky',
      name: 'Microsoft Exchange',
      description: 'Enterprise-grade email platform',
      pill: 'Trusted Technology',
    },
    { icon: faCertificate, tone: 'indigo', name: 'ISO 27001', description: 'Information security management system', pill: 'Certified' },
    { icon: faAward, tone: 'sky', name: 'SOC 2 Type II', description: 'Trust services with 12-month window', pill: 'Attested' },
    { icon: faCreditCard, tone: 'green', name: 'PCI DSS', description: 'Card-handling workloads', pill: 'Level 1 Validated' },
    { icon: faEarthEurope, tone: 'blue', name: 'GDPR', description: 'Data processing addendum included', pill: 'Compliant' },
    { icon: faTowerBroadcast, tone: 'amber', name: 'TRA • UAE', description: 'Telecom regulatory authority registered', pill: 'Registered' },
    { icon: faLandmark, tone: 'teal', name: 'NCA • KSA', description: 'Aligned with national cybersecurity requirements', pill: 'Aligned' },
  ];

  protected readonly stories: readonly Story[] = [
    {
      photo: '/worldposta-assets/posta/story-bbva.webp',
      photoAlt: 'BBVA headquarters building',
      photoWidth: 1100,
      photoHeight: 376,
      chipIcon: faBuildingColumns,
      chipLabel: 'Banking',
      logo: '/worldposta-assets/brand-logos/customers/bbva.webp',
      logoAlt: 'BBVA',
      logoWidth: 214,
      logoHeight: 64,
      quote: 'WorldPosta helped us modernize our infrastructure and scale globally with confidence.',
      cite: 'IT Director, BBVA',
    },
    {
      photo: '/worldposta-assets/posta/story-iberia.webp',
      photoAlt: 'Iberia aircraft in flight',
      photoWidth: 1100,
      photoHeight: 418,
      chipIcon: faPlane,
      chipLabel: 'Aviation',
      logo: '/worldposta-assets/brand-logos/customers/iberia.webp',
      logoAlt: 'Iberia',
      logoWidth: 288,
      logoHeight: 64,
      quote: 'Reliable, secure and flexible cloud infrastructure that supports our mission-critical operations.',
      cite: 'Head of Infrastructure, Iberia',
    },
    {
      photo: '/worldposta-assets/posta/story-government.webp',
      photoAlt: 'Government building',
      photoWidth: 1100,
      photoHeight: 380,
      chipIcon: faLandmark,
      chipLabel: 'Government',
      logo: '/worldposta-assets/brand-logos/customers/lseg.webp',
      logoAlt: 'LSEG',
      logoWidth: 148,
      logoHeight: 64,
      quote: 'WorldPosta provides the performance and security we need to serve our customers worldwide.',
      cite: 'CTO, LSEG',
    },
  ];

  protected readonly resources: readonly ResourceCard[] = [
    {
      icon: faEnvelope,
      tone: 'blue',
      cover: '/worldposta-assets/posta/datasheet-zoho.webp',
      coverAlt: 'Posta vs. Zoho datasheet cover',
      title: 'Posta Vs. Zoho',
      description: 'Compare key factors like security, integration, performance, and support.',
      href: '/worldposta-assets/legacy/datasheets/Posta vs zoho Datasheet.pdf',
    },
    {
      icon: faScaleBalanced,
      tone: 'purple',
      cover: '/worldposta-assets/posta/datasheet-zimbra.webp',
      coverAlt: 'Posta vs. Zimbra datasheet cover',
      title: 'Posta Vs. Zimbra',
      description: 'Find the right business email solution based on your specific needs.',
      href: '/worldposta-assets/legacy/datasheets/Posta vs. Zimbra Datasheet.pdf',
    },
    {
      icon: faShieldHalved,
      tone: 'green',
      cover: '/worldposta-assets/posta/datasheet-security.webp',
      coverAlt: 'Posta Security Framework datasheet cover',
      title: 'Posta Security Framework',
      description: 'Learn how Posta protects your business with advanced security.',
      href: '/worldposta-assets/legacy/datasheets/Posta_Security_Framework.pdf',
    },
    {
      icon: faFile,
      tone: 'amber',
      cover: '/worldposta-assets/posta/datasheet-comm-hub.webp',
      coverAlt: 'Posta Communication Hub datasheet cover',
      title: 'Posta Datasheet — Communication Hub',
      description: 'Explore enterprise-grade email and collaboration powered by Microsoft.',
    },
  ];
}
