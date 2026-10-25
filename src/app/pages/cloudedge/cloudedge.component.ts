import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowRight,
  faArrowTrendUp,
  faBookOpen,
  faBuildingColumns,
  faChartColumn,
  faCheck,
  faChevronLeft,
  faChevronRight,
  faCircleCheck,
  faCircleXmark,
  faClockRotateLeft,
  faCloud,
  faCloudArrowUp,
  faCommentDots,
  faDatabase,
  faDharmachakra,
  faDollarSign,
  faGears,
  faGlobe,
  faHeadset,
  faLandmark,
  faLock,
  faNetworkWired,
  faPeopleGroup,
  faPlane,
  faPlus,
  faServer,
  faShieldHalved,
  faSitemap,
  faTriangleExclamation,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { ExpertJourneyComponent } from './expert-journey/expert-journey.component';
import { LoopVideoComponent } from './loop-video/loop-video.component';
import { SiteFooterComponent } from '@/shared/site-footer/site-footer.component';
import { SiteHeaderComponent } from '@/shared/site-header/site-header.component';
import { scrollToFragmentOnClick } from '@/shared/utils';
import { ThemeService } from '@/shared/services/theme.service';

interface HeroChip {
  readonly id: string;
  readonly icon: IconDefinition;
  readonly tone: 'green' | 'blue' | 'purple';
  readonly label: string;
}

interface EcosystemTile {
  readonly label: string;
  readonly href: string;
  readonly colorClass: string;
  /** Either an icon or a partner wordmark image — SAP renders its real logo rather than a stand-in glyph. */
  readonly icon?: IconDefinition;
  readonly logo?: string;
}

interface FeatureItem {
  readonly icon: IconDefinition;
  readonly tone: string;
  readonly title: string;
  readonly description: string;
}

/** A card floated around a central hub icon (Private Cloud, Expert Support, Cloud Computing overview, …). */
interface HubCard extends FeatureItem {
  /** Matches a `.hub__card--<position>` CSS rule for this section. */
  readonly position: string;
}

interface SidebarLink {
  readonly icon: IconDefinition;
  readonly label: string;
  readonly href: string;
  readonly active?: boolean;
}

interface ChecklistItem {
  readonly icon: IconDefinition;
  readonly tone: 'rose' | 'green';
  readonly label: string;
}

interface StatTile {
  readonly icon: IconDefinition;
  readonly tone: string;
  readonly value: string;
  readonly label: string;
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

interface ComparisonProvider {
  readonly name: string;
  readonly logo: string;
  readonly width: number;
  readonly height: number;
  readonly tone: string;
  readonly barPct: number;
  readonly priceTier: string;
}

interface PricingPlan {
  readonly id: string;
  readonly badge?: string;
  readonly name: string;
  readonly blurb: string;
  readonly price: string;
  readonly discount: string;
  readonly featured?: boolean;
  readonly features: readonly string[];
}

interface AddOn {
  readonly icon: IconDefinition;
  readonly tone: string;
  readonly title: string;
  readonly description: string;
}

/**
 * CloudEdge product marketing page. Reuses the shared header/footer chrome;
 * the hero and ecosystem strip mirror the homepage's own CloudEdge content.
 * Everything below the ecosystem strip reproduces the content of the
 * reference section mockups, section for section.
 */
@Component({
  imports: [ExpertJourneyComponent, FaIconComponent, LoopVideoComponent, NgOptimizedImage, SiteFooterComponent, SiteHeaderComponent],
  // Plain `href="#id"` anchors resolve against `<base href="/">`, not this
  // route, so a bare click would navigate back to "/" instead of scrolling.
  host: {
    '(click)': 'onInPageAnchorClick($event)',
  },
  selector: 'app-cloudedge',
  styleUrl: './cloudedge.component.css',
  templateUrl: './cloudedge.component.html',
})
export class CloudEdgeComponent {
  private readonly document = inject(DOCUMENT);

  protected onInPageAnchorClick(event: MouseEvent): void {
    scrollToFragmentOnClick(event, this.document);
  }

  protected readonly icons = {
    arrowRight: faArrowRight,
    check: faCheck,
    circleCheck: faCircleCheck,
    circleXmark: faCircleXmark,
    chevronLeft: faChevronLeft,
    chevronRight: faChevronRight,
    cloud: faCloud,
    globe: faGlobe,
    lock: faLock,
    plus: faPlus,
    server: faServer,
  };

  /** The "also part of the WorldPosta ecosystem" strip, just under the hero — CloudEdge's own managed-services lineup. */
  protected readonly ecosystemTiles: readonly EcosystemTile[] = [
    { label: 'Database as a Service', href: '#cloud-computing', colorClass: 'tile--sky', icon: faDatabase },
    { label: 'Kubernetes as a Service', href: '#cloud-computing', colorClass: 'tile--green', icon: faDharmachakra },
    { label: 'Object Storage as a Service', href: '#cloud-computing', colorClass: 'tile--purple', icon: faCloud },
    { label: 'Posta Identity as a Service', href: '#zero-trust', colorClass: 'tile--green', icon: faUser },
    { label: 'Backup as a Service', href: '#expert-support', colorClass: 'tile--sky', icon: faClockRotateLeft },
    { label: 'Veeam Cloud Connect', href: 'https://www.worldposta.com/veeam-cloud-connect', colorClass: 'tile--amber', icon: faCloudArrowUp },
    { label: 'SAP Cloud Solutions', href: '/sap', colorClass: 'tile--sky', logo: '/worldposta-assets/brand-logos/partners/sap.svg' },
  ];

  /** The five benefit chips shown both under the CTAs and floating over the hero photo. */
  protected readonly heroChips: readonly HeroChip[] = [
    { id: 'no-fees', icon: faDatabase, tone: 'green', label: 'No Hidden Fees' },
    { id: 'support', icon: faHeadset, tone: 'blue', label: '24/7 Support' },
    { id: 'migration', icon: faClockRotateLeft, tone: 'purple', label: 'Zero Downtime Migration' },
    { id: 'security', icon: faShieldHalved, tone: 'green', label: 'Maximum Security' },
    { id: 'cost', icon: faChartColumn, tone: 'blue', label: '50% Lower Total Cost' },
  ];

  /** The three benefits that float over the hero photo on desktop. */
  protected readonly heroFloatChips = this.heroChips.filter((c) => ['no-fees', 'support', 'security'].includes(c.id));

  /**
   * Hero visual: a Magnific-generated photo following the brand reference — a
   * professional at a laptop with a frosted-glass cloud and network lines. No
   * text in the image; the benefits stay live in the trust bar below.
   */
  protected readonly heroPhoto = '/worldposta-assets/hero/cloudedge/hero-cloud-partner.avif';

  /*
   * Section photography below is generated with Magnific as concept scenes (no
   * people or brands). Where a laptop shows a screen, it is the real CloudEdge
   * console composited onto a green screen, in the theme that matches the site's.
   */


  /** Private Cloud: dedicated racks in a glass-walled, access-controlled room. */
  protected readonly privateCloudPhoto = '/worldposta-assets/hero/cloudedge/private-cloud-room.avif';

  /** Migration: a laptop on a cart, cabled into a rack, running the move from the CloudEdge console. */
  protected readonly migrationPhoto = computed(() =>
    this.theme.isDark()
      ? '/worldposta-assets/hero/cloudedge/migration-console-dark.avif'
      : '/worldposta-assets/hero/cloudedge/migration-console-light.avif',
  );

  /** Whitepaper: a printed provider comparison beside a laptop showing the CloudEdge console. */
  protected readonly whitepaperPhoto = computed(() =>
    this.theme.isDark()
      ? '/worldposta-assets/hero/cloudedge/whitepaper-console-dark.avif'
      : '/worldposta-assets/hero/cloudedge/whitepaper-console-light.avif',
  );

  // ============================================================
  // CHALLENGES
  // ============================================================
  protected readonly challengeItems: readonly FeatureItem[] = [
    { icon: faDollarSign, tone: 'rose', title: 'Unpredictable costs', description: 'and underutilized resources' },
    { icon: faSitemap, tone: 'purple', title: 'Complex setup', description: 'and management' },
    { icon: faShieldHalved, tone: 'rose', title: 'Security and', description: 'compliance requirements' },
    { icon: faArrowTrendUp, tone: 'amber', title: 'Limited scalability', description: 'to support growth' },
  ];

  /** The opportunity each challenge turns into, in the same order. */
  private readonly toOpportunities: readonly ChecklistItem[] = [
    { icon: faCircleCheck, tone: 'green', label: 'Optimized and transparent costs' },
    { icon: faCircleCheck, tone: 'green', label: 'Simplified cloud management' },
    { icon: faCircleCheck, tone: 'green', label: 'Enterprise-grade security' },
    { icon: faCircleCheck, tone: 'green', label: 'Scale easily, anytime' },
  ];

  /** Challenge/opportunity pairs for the before/after ledger. */
  protected readonly challengeRows = this.challengeItems.map((item, i) => ({
    ...item,
    to: this.toOpportunities[i].label,
    toIcon: this.toOpportunities[i].icon,
  }));

  // ============================================================
  // CLOUD COMPUTING OVERVIEW
  // ============================================================
  protected readonly sidebarLinks: readonly SidebarLink[] = [
    { icon: faCloud, label: 'Cloud Computing', href: '#cloud-computing', active: true },
    { icon: faServer, label: 'Virtual Machines', href: '#cloud-computing' },
    { icon: faDharmachakra, label: 'Kubernetes', href: '#cloud-computing' },
    { icon: faDatabase, label: 'Storage', href: '#cloud-computing' },
    { icon: faNetworkWired, label: 'Networking', href: '#private-cloud' },
    { icon: faShieldHalved, label: 'Backup & DR', href: '#expert-support' },
    { icon: faLock, label: 'Security', href: '#zero-trust' },
    { icon: faChartColumn, label: 'Monitoring', href: '#expert-support' },
  ];

  protected readonly cloudComputingTrust: readonly StatTile[] = [
    { icon: faPeopleGroup, tone: 'blue', value: '', label: 'Enterprise-grade infrastructure' },
    { icon: faGlobe, tone: 'blue', value: '', label: 'Global availability in 35+ regions' },
    { icon: faShieldHalved, tone: 'blue', value: '', label: 'Secure and compliant by design' },
  ];

  private readonly theme = inject(ThemeService);

  /**
   * The CloudEdge Console screenshot, presented as a floating dashboard mockup
   * instead of the feature hub. Follows the site theme, like the home hero.
   */
  protected readonly cloudComputingDashboard = computed(() =>
    this.theme.isDark()
      ? '/worldposta-assets/hero/cloudedge/console-dashboard-dark.avif'
      : '/worldposta-assets/hero/cloudedge/console-dashboard.avif',
  );

  // ============================================================
  // PRIVATE CLOUD
  // ============================================================
  protected readonly privateCloudFeatures: readonly FeatureItem[] = [
    { icon: faServer, tone: 'blue', title: 'Dedicated Infrastructure', description: 'Your resources. Your rules.' },
    { icon: faShieldHalved, tone: 'green', title: 'Maximum Security', description: 'Isolated and fully protected.' },
    { icon: faGears, tone: 'purple', title: 'Full Control', description: 'Manage and customize as you need.' },
    { icon: faChartColumn, tone: 'amber', title: 'High Performance', description: 'Built for your critical workloads.' },
  ];

  protected readonly privateCloudHub: readonly HubCard[] = [
    { icon: faServer, tone: 'blue', title: 'Dedicated Environment', description: 'Not shared with other tenants', position: 'pc-1' },
    { icon: faShieldHalved, tone: 'green', title: 'Enterprise-Grade Security', description: 'Your data stays in your control', position: 'pc-2' },
    { icon: faGears, tone: 'purple', title: 'Full Customization', description: 'Configure to fit your business needs', position: 'pc-3' },
    { icon: faChartColumn, tone: 'amber', title: 'Scalable Resources', description: 'Scale on your terms, anytime', position: 'pc-4' },
  ];

  // ============================================================
  // ZERO TRUST ARCHITECTURE
  // ============================================================
  protected readonly zeroTrustFeatures: readonly FeatureItem[] = [
    { icon: faServer, tone: 'blue', title: 'Workload Isolation', description: 'Keep critical workloads separated from each other.' },
    { icon: faNetworkWired, tone: 'green', title: 'East-West Protection', description: 'Control traffic between servers and applications.' },
    { icon: faShieldHalved, tone: 'purple', title: 'Least-Privilege Access', description: 'Allow only the connections each workload needs.' },
    { icon: faTriangleExclamation, tone: 'amber', title: 'Contain Threats', description: 'Limit lateral movement if a workload is compromised.' },
  ];


  // ============================================================
  // GLOBAL BUSINESS
  // ============================================================
  protected readonly globalStats: readonly StatTile[] = [
    { icon: faGlobe, tone: 'blue', value: '35+', label: 'Global Regions' },
    { icon: faClockRotateLeft, tone: 'purple', value: '99.99%', label: 'SLA Uptime' },
    { icon: faPeopleGroup, tone: 'green', value: '500+', label: 'Enterprise Customers' },
    { icon: faChartColumn, tone: 'amber', value: 'Up to 50%', label: 'Lower Costs' },
  ];

  // ============================================================
  // MIGRATION
  // ============================================================
  protected readonly migrationFeatures: readonly FeatureItem[] = [
    { icon: faClockRotateLeft, tone: 'blue', title: 'Seamless Migration', description: 'With zero downtime' },
    { icon: faGears, tone: 'green', title: 'Expert Team', description: 'Plan, migrate and support' },
    { icon: faShieldHalved, tone: 'purple', title: 'Data Security', description: 'Protected at every step' },
    { icon: faChartColumn, tone: 'amber', title: 'Minimal Disruption', description: 'Your business stays online' },
  ];

  protected readonly migrationChecklist: readonly string[] = ['Planning', 'Data Transfer', 'Testing & Validation', 'Go Live'];

  // ============================================================
  // SUCCESS STORIES — reused verbatim from the Posta page.
  // ============================================================
  protected readonly stories: readonly Story[] = [
    {
      photo: '/worldposta-assets/posta/story-bbva.avif',
      photoAlt: 'BBVA headquarters building',
      photoWidth: 1100,
      photoHeight: 376,
      chipIcon: faBuildingColumns,
      chipLabel: 'Banking',
      logo: '/worldposta-assets/brand-logos/customers/bbva.avif',
      logoAlt: 'BBVA',
      logoWidth: 214,
      logoHeight: 64,
      quote: 'WorldPosta helped us modernize our infrastructure and scale globally with confidence.',
      cite: 'IT Director, BBVA',
    },
    {
      photo: '/worldposta-assets/posta/story-iberia.avif',
      photoAlt: 'Iberia aircraft in flight',
      photoWidth: 1100,
      photoHeight: 418,
      chipIcon: faPlane,
      chipLabel: 'Aviation',
      logo: '/worldposta-assets/brand-logos/customers/iberia.avif',
      logoAlt: 'Iberia',
      logoWidth: 288,
      logoHeight: 64,
      quote: 'Reliable, secure and flexible cloud infrastructure that supports our mission-critical operations.',
      cite: 'Head of Infrastructure, Iberia',
    },
    {
      photo: '/worldposta-assets/posta/story-government.avif',
      photoAlt: 'Government building',
      photoWidth: 1100,
      photoHeight: 380,
      chipIcon: faLandmark,
      chipLabel: 'Government',
      logo: '/worldposta-assets/brand-logos/customers/lseg.avif',
      logoAlt: 'LSEG',
      logoWidth: 148,
      logoHeight: 64,
      quote: 'WorldPosta provides the performance and security we need to serve our customers worldwide.',
      cite: 'CTO, LSEG',
    },
  ];

  // ============================================================
  // COMPARE CLOUD PROVIDERS (white paper)
  // ============================================================
  protected readonly whitePaperFeatures: readonly FeatureItem[] = [
    { icon: faChartColumn, tone: 'blue', title: 'Performance comparison', description: 'Real benchmarks and use cases' },
    { icon: faDollarSign, tone: 'green', title: 'Detailed cost analysis', description: 'Understand total cost of ownership' },
    { icon: faShieldHalved, tone: 'purple', title: 'Security & compliance', description: 'Meet industry and regulatory requirements' },
    { icon: faGears, tone: 'amber', title: 'Expert recommendations', description: 'Practical guidance based on your business needs' },
  ];

  protected readonly comparisonProviders: readonly ComparisonProvider[] = [
    { name: 'WorldPosta', logo: '/worldposta-assets/WP-Logo.avif', width: 96, height: 25, tone: 'green', barPct: 35, priceTier: '$$' },
    { name: 'AWS', logo: '/worldposta-assets/brand-logos/providers/aws.svg', width: 40, height: 24, tone: 'amber', barPct: 70, priceTier: '$$$' },
    { name: 'Microsoft Azure', logo: '/worldposta-assets/brand-logos/providers/azure.svg', width: 26, height: 24, tone: 'blue', barPct: 68, priceTier: '$$$' },
    { name: 'Google Cloud', logo: '/worldposta-assets/brand-logos/providers/google-cloud.svg', width: 30, height: 24, tone: 'rose', barPct: 72, priceTier: '$$$' },
  ];

  // ============================================================
  // EXPERT SUPPORT
  // ============================================================
  protected readonly expertSupportHub: readonly FeatureItem[] = [
    { icon: faHeadset, tone: 'blue', title: 'Consultation & Design', description: 'Get the right architecture for your needs.' },
    { icon: faGears, tone: 'blue', title: 'Migration Assistance', description: 'Seamless and secure transition.' },
    { icon: faCloud, tone: 'green', title: 'Zero Downtime Migrations', description: 'Keep your business running, always.' },
    { icon: faShieldHalved, tone: 'purple', title: 'Advanced Security', description: 'Enterprise-grade protection and compliance.' },
    { icon: faCommentDots, tone: 'blue', title: '24/7 Expert Support', description: 'Real people. Real answers.' },
    { icon: faBookOpen, tone: 'amber', title: 'Ongoing Guidance', description: 'From deployment to optimization.' },
  ];

  // ============================================================
  // PRICING
  // ============================================================
  protected readonly pricingTrust: readonly FeatureItem[] = [
    { icon: faShieldHalved, tone: 'blue', title: 'Enterprise-Grade Security', description: 'Your data stays protected.' },
    { icon: faDatabase, tone: 'blue', title: '99.9% Uptime', description: 'Reliable. Always on.' },
    { icon: faHeadset, tone: 'green', title: '24/7 Expert Support', description: 'Real people. Real answers.' },
  ];

  protected readonly pricingPlans: readonly PricingPlan[] = [
    {
      id: 'ce-32',
      badge: 'Most Popular',
      name: 'CE-32',
      blurb: 'Perfect for small and medium teams',
      price: '$224',
      discount: '60% OFF',
      featured: true,
      features: [
        '32 GB RAM',
        '6 vCPU Cores',
        '150 GB Flash NVMe Storage',
        '1 GB Internet',
        '6 TB Traffic',
        'Free Firewall',
        'Ransomware Recovery (3 days)',
        'Next Generation Firewall as a Service',
        'Cortex XDR Antivirus (By PaloAlto)',
        'Ransomware Protection',
        '99.9% Availability',
        'Free Support',
      ],
    },
    {
      id: 'ce-128',
      name: 'CE-128',
      blurb: 'Ideal for growing businesses',
      price: '$768',
      discount: '60% OFF',
      features: [
        '128 GB RAM',
        '6 vCPU Cores',
        '1 TB Flash NVMe Storage',
        '1 GB Internet',
        '12 TB Traffic',
        'Free Firewall',
        'Ransomware Recovery (3 days)',
        'Next Generation Firewall as a Service',
        'Cortex XDR Antivirus (By PaloAlto)',
        'Ransomware Protection',
        '99.9% Availability',
        'Free Support',
      ],
    },
  ];

  protected readonly addOns: readonly AddOn[] = [
    { icon: faGears, tone: 'blue', title: 'vCore', description: '$X per core' },
    { icon: faDatabase, tone: 'green', title: 'RAM', description: '$X per GB' },
    { icon: faServer, tone: 'amber', title: 'Storage', description: '$X per TB' },
    { icon: faShieldHalved, tone: 'purple', title: 'Firewalls', description: 'Choose from multiple options' },
    { icon: faNetworkWired, tone: 'blue', title: 'Load Balancer', description: 'High availability and traffic management' },
    { icon: faCloudArrowUp, tone: 'sky', title: 'Backup Solutions', description: 'Secure and reliable data protection' },
  ];

  /** Center icon for the remaining hub-and-spoke diagram. */
  protected readonly hubCenters = {
    expertSupport: faCloud,
  };

  protected readonly zeroTrustCenterIcon = faShieldHalved;
}

