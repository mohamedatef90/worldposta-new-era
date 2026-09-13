import { Component, signal, computed } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faCloud,
  faServer,
  faCubes,
  faDatabase,
  faNetworkWired,
  faShieldHalved,
  faCloudArrowUp,
  faGears,
  faCoins,
  faEnvelope,
  faMessage,
  faVideo,
  faCalendarDays,
  faFolderOpen,
  faFileLines,
  faChartLine,
  faUserShield,
  faPeopleGroup,
  faCheck,
  faArrowRight,
  faArrowUp,
  faBucket,
  faChartPie,
  faChevronRight,
  faEllipsis,
  faHardDrive,
  faMagnifyingGlass,
  faMemory,
  faMicrochip,
  faPlus,
  faRightLeft,
  faRoute,
  faShareNodes,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface TabItem {
  readonly id: string;
  readonly label: string;
  readonly icon: IconDefinition;
}

interface TabGroup {
  readonly id: string;
  readonly label: string;
  readonly items: readonly TabItem[];
}

/**
 * A stat tile. The accent `tone` is decoration only — identity is carried by the
 * icon and the label, so the tile still reads without colour. Tone order is
 * sky → amber → green → purple, which is the order validated for colour-vision
 * separation (green and amber adjacent would collide; amber sits between).
 */
interface ConsoleStat {
  readonly icon: IconDefinition;
  readonly label: string;
  readonly value: string;
  /** Optional change chip, e.g. "12%". */
  readonly delta?: string;
  readonly tone: 'sky' | 'amber' | 'green' | 'purple';
  /** Sparkline series; rendered decoratively beside the value it restates. */
  readonly trend: readonly number[];
}

/**
 * Reserved status states. Kept separate from the stat-tile accents — a status
 * colour never doubles as a decorative one — and always rendered as dot + word,
 * so state is never carried by colour alone.
 */
type StatusTone = 'good' | 'warning' | 'critical';

interface ConsoleRow {
  readonly name: string;
  readonly status: { readonly label: string; readonly tone: StatusTone };
  /** Values for `ConsoleView.columns`, in the same order. */
  readonly cells: readonly string[];
  /** Per-row mark, when a view mixes resource types. Falls back to `rowIcon`. */
  readonly icon?: IconDefinition;
}

/** An in-product preview: stat tiles plus a sample resource table. */
interface ConsoleView {
  readonly title: string;
  readonly total: number;
  /** Column headers after the fixed Name column, in render order. */
  readonly columns: readonly string[];
  /**
   * How many of `columns` precede the Status column. Status sits directly
   * after Name by default; Networking puts Type ahead of it.
   */
  readonly statusAfter?: number;
  readonly rowIcon: IconDefinition;
  readonly createLabel: string;
  readonly searchPlaceholder: string;
  readonly pages: number;
  readonly stats: readonly ConsoleStat[];
  readonly rows: readonly ConsoleRow[];
}

interface TabContent {
  readonly badge: string;
  readonly heading: string;
  readonly description: string;
  readonly bullets: readonly string[];
  readonly image: string;
  readonly imageAlt: string;
  /** Label for the primary CTA; defaults to "Get started". */
  readonly cta?: string;
  /** When present, replaces the screenshot with a live-rendered console preview. */
  readonly console?: ConsoleView;
  readonly benefits: readonly { icon: IconDefinition; title: string; description: string }[];
}

@Component({
  selector: 'app-ecosystem-tabs',
  imports: [FaIconComponent, NgOptimizedImage],
  templateUrl: './ecosystem-tabs.component.html',
  styleUrl: './ecosystem-tabs.component.css',
})
export class EcosystemTabsComponent {
  protected readonly icons = {
    check: faCheck,
    chevronRight: faChevronRight,
    arrowRight: faArrowRight,
    arrowUp: faArrowUp,
    ellipsis: faEllipsis,
    plus: faPlus,
    search: faMagnifyingGlass,
    server: faServer,
  };

  /** Sparkline viewBox; the polyline is stretched to the tile via preserveAspectRatio="none". */
  protected readonly sparkWidth = 100;
  protected readonly sparkHeight = 32;

  /** Series → SVG polyline points, normalised to the sparkline box. */
  protected sparkLine(trend: readonly number[]): string {
    const max = Math.max(...trend);
    const min = Math.min(...trend);
    const span = max - min || 1;
    const stepX = this.sparkWidth / Math.max(trend.length - 1, 1);
    // Inset by 1px top and bottom so a 2px stroke is never clipped by the viewBox.
    const usable = this.sparkHeight - 2;
    return trend
      .map((v, i) => `${(i * stepX).toFixed(1)},${(1 + usable - ((v - min) / span) * usable).toFixed(1)}`)
      .join(' ');
  }

  /** Same series closed down to the baseline, for the soft area fill. */
  protected sparkArea(trend: readonly number[]): string {
    return `0,${this.sparkHeight} ${this.sparkLine(trend)} ${this.sparkWidth},${this.sparkHeight}`;
  }

  /**
   * 1..n for the (presentational) pager. A computed rather than a template
   * method, so the array is built once per tab instead of on every change
   * detection — the latter makes @for tear down and rebuild the whole list.
   */
  protected readonly pageNumbers = computed<readonly number[]>(() => {
    const pages = this.tabContent().console?.pages ?? 0;
    return Array.from({ length: pages }, (_, i) => i + 1);
  });

  /**
   * The active console's table, pre-sliced around the Status column. Memoized
   * rather than sliced in the template: a template method returns fresh arrays
   * on every change-detection pass, which trips NG0956 and makes `@for` tear
   * down and rebuild every row.
   */
  protected readonly consoleTable = computed(() => {
    const view = this.tabContent().console;
    if (!view) return null;
    const split = view.statusAfter ?? 0;
    return {
      columnsBefore: view.columns.slice(0, split),
      columnsAfter: view.columns.slice(split),
      rows: view.rows.map((row) => ({
        name: row.name,
        status: row.status,
        icon: row.icon ?? view.rowIcon,
        before: row.cells.slice(0, split),
        after: row.cells.slice(split),
      })),
    };
  });

  protected readonly tabGroups: readonly TabGroup[] = [
    {
      id: 'cloud-infrastructure',
      label: 'Cloud & Infrastructure',
      items: [
        { id: 'cloud-infrastructure', label: 'Cloud Infrastructure', icon: faCloud },
        { id: 'virtual-machines', label: 'Virtual Machines', icon: faServer },
        { id: 'kubernetes', label: 'Kubernetes', icon: faCubes },
        { id: 'storage', label: 'Storage', icon: faDatabase },
        { id: 'networking', label: 'Networking', icon: faNetworkWired },
        { id: 'security', label: 'Security', icon: faShieldHalved },
        { id: 'backup-dr', label: 'Backup & DR', icon: faCloudArrowUp },
        { id: 'automation', label: 'Automation', icon: faGears },
        { id: 'cost-management', label: 'Cost Management', icon: faCoins },
      ],
    },
    {
      id: 'collaboration',
      label: 'Collaboration & Productivity',
      items: [
        { id: 'business-email', label: 'Business Email', icon: faEnvelope },
        { id: 'team-chat', label: 'Team Chat', icon: faMessage },
        { id: 'conferencing', label: 'Conferencing', icon: faVideo },
        { id: 'calendar', label: 'Calendar', icon: faCalendarDays },
        { id: 'drive-files', label: 'Drive & Files', icon: faFolderOpen },
        { id: 'notes', label: 'Notes', icon: faFileLines },
        { id: 'dashboard', label: 'Dashboard', icon: faChartLine },
      ],
    },
    {
      id: 'management',
      label: 'Management',
      items: [
        { id: 'iam-access', label: 'IAM & Access Management', icon: faUserShield },
        { id: 'team-management', label: 'Team Management', icon: faPeopleGroup },
      ],
    },
  ];

  protected readonly activeTabId = signal<string>('cloud-infrastructure');

  /** Icon of the active tab, shown beside the badge. */
  protected readonly activeIcon = computed<IconDefinition>(() => {
    const id = this.activeTabId();
    for (const group of this.tabGroups) {
      const hit = group.items.find((item) => item.id === id);
      if (hit) return hit.icon;
    }
    return faCloud;
  });

  protected readonly tabContent = computed<TabContent>(() => {
    const tabId = this.activeTabId();
    const contentMap: Record<string, TabContent> = {
      'cloud-infrastructure': {
        badge: 'Cloud & Infrastructure',
        heading: 'Cloud Infrastructure',
        description:
          'Scalable, secure and high-performance cloud infrastructure for your business.',
        bullets: [
          'Deploy in minutes',
          'High availability & global reach',
          'Enterprise-grade security',
        ],
        image: '/worldposta-assets/hero/cloudedge/dashboard.png',
        imageAlt: 'CloudEdge Console dashboard showing infrastructure overview',
        benefits: [
          {
            icon: faShieldHalved,
            title: 'Enterprise-Grade Security',
            description: 'Advanced security features and compliance certifications',
          },
          {
            icon: faPeopleGroup,
            title: 'Built for Teams',
            description: 'Collaboration tools and team management built-in',
          },
          {
            icon: faCubes,
            title: 'Fully Integrated',
            description: 'Seamless integration with all WorldPosta services',
          },
          {
            icon: faCloud,
            title: 'Access Anywhere',
            description: 'Manage your infrastructure from anywhere, anytime',
          },
        ],
      },
      'virtual-machines': {
        badge: 'Cloud & Infrastructure',
        heading: 'Virtual Machines',
        description:
          'Flexible, secure and high-performance virtual machines to power your business applications.',
        bullets: ['On-demand provisioning', 'Scalable resources (CPU, Memory, Storage)', 'Enterprise-grade security'],
        image: '/worldposta-assets/hero/cloudedge/dashboard.png',
        imageAlt: 'Virtual machines management interface',
        cta: 'Create VM',
        console: {
          title: 'Virtual Machines',
          total: 156,
          columns: ['OS', 'CPU', 'Memory', 'Storage', 'Region', 'Created'],
          rowIcon: faServer,
          createLabel: 'Create VM',
          searchPlaceholder: 'Search VMs...',
          pages: 5,
          stats: [
            { icon: faServer, label: 'Total VMs', value: '156', delta: '12%', tone: 'sky', trend: [120, 126, 131, 129, 138, 144, 149, 156] },
            { icon: faMicrochip, label: 'CPU Usage', value: '45%', tone: 'amber', trend: [38, 41, 39, 44, 42, 46, 43, 45] },
            { icon: faMemory, label: 'Memory Usage', value: '62%', tone: 'green', trend: [51, 55, 53, 58, 60, 57, 61, 62] },
            { icon: faHardDrive, label: 'Storage Allocated', value: '18.4 TB', tone: 'purple', trend: [12.1, 13, 13.6, 14.8, 15.4, 16.9, 17.6, 18.4] },
          ],
          rows: [
            { name: 'web-server-01', status: { label: 'Running', tone: 'good' }, cells: ['Ubuntu 22.04', '4 vCPU', '8 GB', '100 GB', 'UAE', 'Jan 12, 2024'] },
            { name: 'app-server-02', status: { label: 'Running', tone: 'good' }, cells: ['CentOS 8', '8 vCPU', '16 GB', '200 GB', 'KSA', 'Jan 10, 2024'] },
            { name: 'db-server-01', status: { label: 'Stopped', tone: 'critical' }, cells: ['Windows Server', '8 vCPU', '32 GB', '500 GB', 'UAE', 'Jan 08, 2024'] },
            { name: 'test-env', status: { label: 'Running', tone: 'good' }, cells: ['Ubuntu 22.04', '2 vCPU', '4 GB', '80 GB', 'Egypt', 'Jan 05, 2024'] },
            { name: 'staging-app', status: { label: 'Running', tone: 'good' }, cells: ['CentOS 8', '4 vCPU', '8 GB', '100 GB', 'UAE', 'Jan 02, 2024'] },
          ],
        },
        benefits: [
          {
            icon: faServer,
            title: 'Powerful Performance',
            description: 'Latest generation processors and SSD storage',
          },
          {
            icon: faGears,
            title: 'Easy Management',
            description: 'Intuitive controls and automation tools',
          },
          {
            icon: faNetworkWired,
            title: 'Global Network',
            description: 'Deploy across multiple regions worldwide',
          },
          {
            icon: faCoins,
            title: 'Cost Effective',
            description: 'Competitive pricing with flexible billing',
          },
        ],
      },
      kubernetes: {
        badge: 'CloudEdge Kubernetes',
        heading: 'Managed Kubernetes Service',
        description:
          'Deploy and scale containerized applications with fully managed Kubernetes clusters. Focus on your code while we handle the infrastructure.',
        bullets: [
          'Fully managed clusters',
          'Auto-scaling & self-healing',
          'Integrated monitoring',
        ],
        image: '/worldposta-assets/hero/cloudedge/dashboard.png',
        imageAlt: 'Kubernetes cluster management dashboard',
        benefits: [
          {
            icon: faCubes,
            title: 'Container Orchestration',
            description: 'Industry-standard Kubernetes deployment',
          },
          {
            icon: faGears,
            title: 'Automated Updates',
            description: 'Automatic security patches and upgrades',
          },
          {
            icon: faChartLine,
            title: 'Built-in Monitoring',
            description: 'Real-time metrics and logging',
          },
          {
            icon: faShieldHalved,
            title: 'Secure by Default',
            description: 'Network policies and RBAC enabled',
          },
        ],
      },
      storage: {
        badge: 'Cloud & Infrastructure',
        heading: 'Storage',
        description:
          'Secure, scalable and high-performance storage for all your data, from backups to big data workloads.',
        bullets: [
          'Highly scalable storage',
          'Durable and secure',
          'Seamless integration with your cloud environment',
        ],
        image: '/worldposta-assets/hero/cloudedge/dashboard.png',
        imageAlt: 'Cloud storage management interface',
        cta: 'Create Bucket',
        console: {
          title: 'Storage Buckets',
          total: 12,
          columns: ['Storage Used', 'Objects', 'Region', 'Created'],
          rowIcon: faBucket,
          createLabel: 'Create Bucket',
          searchPlaceholder: 'Search buckets...',
          pages: 3,
          stats: [
            { icon: faDatabase, label: 'Total Storage', value: '18.4 TB', delta: '12%', tone: 'sky', trend: [12.1, 13, 13.6, 14.8, 15.4, 16.9, 17.6, 18.4] },
            { icon: faFileLines, label: 'Total Objects', value: '2.8 M', delta: '18%', tone: 'amber', trend: [1.9, 2.0, 2.2, 2.3, 2.4, 2.6, 2.7, 2.8] },
            { icon: faChartPie, label: 'Storage Usage', value: '62%', tone: 'green', trend: [44, 47, 49, 52, 55, 57, 60, 62] },
            { icon: faShieldHalved, label: 'Data Durability', value: '99.99%', tone: 'purple', trend: [99.94, 99.95, 99.96, 99.96, 99.97, 99.98, 99.99, 99.99] },
          ],
          rows: [
            { name: 'website-assets', status: { label: 'Active', tone: 'good' }, cells: ['420 GB', '1.2 M', 'UAE', 'Jan 12, 2024'] },
            { name: 'backup-data', status: { label: 'Active', tone: 'good' }, cells: ['2.1 TB', '340 K', 'KSA', 'Jan 10, 2024'] },
            { name: 'customer-docs', status: { label: 'Active', tone: 'good' }, cells: ['850 GB', '620 K', 'UAE', 'Jan 08, 2024'] },
            { name: 'logs-archive', status: { label: 'Growing', tone: 'warning' }, cells: ['6.4 TB', '520 K', 'Egypt', 'Jan 05, 2024'] },
            { name: 'media-files', status: { label: 'Active', tone: 'good' }, cells: ['1.2 TB', '110 K', 'UAE', 'Jan 02, 2024'] },
          ],
        },
        benefits: [
          {
            icon: faDatabase,
            title: 'Highly Durable',
            description: 'Eleven nines of durability guarantee',
          },
          {
            icon: faCloud,
            title: 'Auto-Scaling',
            description: 'Scales automatically with your needs',
          },
          {
            icon: faShieldHalved,
            title: 'Encrypted Storage',
            description: 'Data encrypted at rest and in transit',
          },
          {
            icon: faCoins,
            title: 'Flexible Pricing',
            description: 'Pay only for what you use',
          },
        ],
      },
      networking: {
        badge: 'Cloud & Infrastructure',
        heading: 'Networking',
        description:
          'Reliable, high-performance networking to connect, secure and scale your cloud environment.',
        bullets: [
          'Scalable and flexible networking',
          'Advanced security and traffic control',
          'Seamless integration with your cloud resources',
        ],
        image: '/worldposta-assets/hero/cloudedge/dashboard.png',
        imageAlt: 'Network topology and configuration dashboard',
        cta: 'Create Network',
        console: {
          title: 'Network Resources',
          total: 28,
          // Type sits ahead of Status in this view; the rest follow it.
          columns: ['Type', 'Region', 'Attached Resources', 'Created'],
          statusAfter: 1,
          rowIcon: faNetworkWired,
          createLabel: 'Create Network',
          searchPlaceholder: 'Search networks...',
          pages: 5,
          stats: [
            { icon: faShareNodes, label: 'Total Networks', value: '28', delta: '16%', tone: 'sky', trend: [21, 22, 23, 24, 25, 26, 27, 28] },
            { icon: faRightLeft, label: 'Data Transfer', value: '12.6 TB', delta: '24%', tone: 'amber', trend: [8.2, 9.1, 9.8, 10.4, 11.2, 11.8, 12.2, 12.6] },
            { icon: faShieldHalved, label: 'Active Security Rules', value: '156', delta: '12%', tone: 'green', trend: [128, 133, 137, 141, 145, 149, 152, 156] },
            { icon: faServer, label: 'Load Balancers', value: '12', delta: '8%', tone: 'purple', trend: [8, 9, 9, 10, 10, 11, 11, 12] },
          ],
          rows: [
            { name: 'prod-vpc', icon: faCloud, status: { label: 'Active', tone: 'good' }, cells: ['VPC', 'UAE', '12 subnets', 'Jan 12, 2024'] },
            { name: 'app-subnet-01', icon: faShareNodes, status: { label: 'Active', tone: 'good' }, cells: ['Subnet', 'UAE', '4 instances', 'Jan 10, 2024'] },
            { name: 'db-subnet-01', icon: faShareNodes, status: { label: 'Active', tone: 'good' }, cells: ['Subnet', 'KSA', '2 instances', 'Jan 08, 2024'] },
            { name: 'web-lb', icon: faServer, status: { label: 'Active', tone: 'good' }, cells: ['Load Balancer', 'UAE', '3 instances', 'Jan 05, 2024'] },
            { name: 'nat-gateway', icon: faRoute, status: { label: 'Degraded', tone: 'warning' }, cells: ['NAT Gateway', 'Egypt', '1 VPC', 'Jan 02, 2024'] },
          ],
        },
        benefits: [
          {
            icon: faNetworkWired,
            title: 'Global Backbone',
            description: 'Low-latency private network worldwide',
          },
          {
            icon: faShieldHalved,
            title: 'Secure Connectivity',
            description: 'VPN, firewall, and DDoS protection',
          },
          {
            icon: faGears,
            title: 'Easy Configuration',
            description: 'Intuitive network management tools',
          },
          {
            icon: faCloud,
            title: 'Hybrid Ready',
            description: 'Connect cloud and on-premises seamlessly',
          },
        ],
      },
      security: {
        badge: 'CloudEdge Security',
        heading: 'Enterprise Security & Compliance',
        description:
          'Protect your infrastructure with advanced security features. Built-in compliance, encryption, and threat detection keep your data safe.',
        bullets: [
          'Advanced threat detection',
          'Compliance certifications',
          'Zero-trust security',
        ],
        image: '/worldposta-assets/hero/cloudedge/security-hub.png',
        imageAlt: 'Security dashboard with threat monitoring',
        benefits: [
          {
            icon: faShieldHalved,
            title: 'Multi-Layer Security',
            description: 'Defense in depth with multiple security layers',
          },
          {
            icon: faUserShield,
            title: 'Access Control',
            description: 'Fine-grained IAM and RBAC policies',
          },
          {
            icon: faGears,
            title: 'Automated Compliance',
            description: 'Continuous compliance monitoring',
          },
          {
            icon: faCloud,
            title: 'Threat Intelligence',
            description: 'Real-time threat detection and response',
          },
        ],
      },
      'backup-dr': {
        badge: 'CloudEdge Backup & DR',
        heading: 'Backup & Disaster Recovery',
        description:
          'Protect your business with automated backups and disaster recovery. Restore your infrastructure in minutes, not hours.',
        bullets: ['Automated backups', 'Point-in-time recovery', 'Cross-region replication'],
        image: '/worldposta-assets/hero/cloudedge/dashboard.png',
        imageAlt: 'Backup and recovery management dashboard',
        benefits: [
          {
            icon: faCloudArrowUp,
            title: 'Automated Backups',
            description: 'Schedule automatic backup snapshots',
          },
          {
            icon: faDatabase,
            title: 'Quick Recovery',
            description: 'Restore entire systems in minutes',
          },
          {
            icon: faCloud,
            title: 'Geo-Redundant',
            description: 'Cross-region replication included',
          },
          {
            icon: faShieldHalved,
            title: 'Verified Backups',
            description: 'Automated backup testing and validation',
          },
        ],
      },
      automation: {
        badge: 'CloudEdge Automation',
        heading: 'Infrastructure as Code',
        description:
          'Automate your infrastructure deployment and management. Use industry-standard tools and templates to scale efficiently.',
        bullets: [
          'Terraform integration',
          'API-first architecture',
          'CI/CD pipelines',
        ],
        image: '/worldposta-assets/hero/cloudedge/scheduled-tasks.png',
        imageAlt: 'Automation and scheduling dashboard',
        benefits: [
          {
            icon: faGears,
            title: 'Full Automation',
            description: 'Automate provisioning and configuration',
          },
          {
            icon: faCloud,
            title: 'Infrastructure as Code',
            description: 'Version-controlled infrastructure',
          },
          {
            icon: faChartLine,
            title: 'CI/CD Ready',
            description: 'Integrate with your existing pipelines',
          },
          {
            icon: faCoins,
            title: 'Reduce Costs',
            description: 'Optimize resources automatically',
          },
        ],
      },
      'cost-management': {
        badge: 'CloudEdge Cost Management',
        heading: 'Optimize Your Cloud Spending',
        description:
          'Track, analyze, and optimize your cloud costs. Get insights and recommendations to reduce spending without sacrificing performance.',
        bullets: ['Cost tracking & alerts', 'Optimization recommendations', 'Budget management'],
        image: '/worldposta-assets/hero/cloudedge/dashboard.png',
        imageAlt: 'Cost analysis and optimization dashboard',
        benefits: [
          {
            icon: faCoins,
            title: 'Cost Visibility',
            description: 'Detailed breakdown of all cloud costs',
          },
          {
            icon: faChartLine,
            title: 'Smart Recommendations',
            description: 'AI-powered optimization suggestions',
          },
          {
            icon: faGears,
            title: 'Auto-Optimization',
            description: 'Automatic resource rightsizing',
          },
          {
            icon: faCloud,
            title: 'Budget Alerts',
            description: 'Real-time alerts for budget thresholds',
          },
        ],
      },
      'business-email': {
        badge: 'Posta Mail',
        heading: 'Professional Business Email',
        description:
          'Secure, reliable business email with your custom domain. Advanced spam filtering, calendar integration, and mobile apps included.',
        bullets: ['Custom domain', 'Advanced spam filtering', 'Calendar integration'],
        image: '/worldposta-assets/hero/posta/suite-light-1680.png',
        imageAlt: 'Business email interface',
        benefits: [
          {
            icon: faEnvelope,
            title: 'Professional Email',
            description: 'Custom domain with unlimited aliases',
          },
          {
            icon: faShieldHalved,
            title: 'Advanced Security',
            description: 'Spam filtering and malware protection',
          },
          {
            icon: faCloud,
            title: 'Cloud Sync',
            description: 'Access from any device, anywhere',
          },
          {
            icon: faPeopleGroup,
            title: 'Team Features',
            description: 'Shared calendars and contacts',
          },
        ],
      },
      'team-chat': {
        badge: 'Posta Chat',
        heading: 'Real-Time Team Communication',
        description:
          'Instant messaging for teams. Channels, direct messages, file sharing, and integrations with your favorite tools.',
        bullets: ['Channels & DMs', 'File sharing', 'App integrations'],
        image: '/worldposta-assets/hero/posta/suite-light-1680.png',
        imageAlt: 'Team chat application',
        benefits: [
          {
            icon: faMessage,
            title: 'Instant Messaging',
            description: 'Real-time chat with rich formatting',
          },
          {
            icon: faPeopleGroup,
            title: 'Team Collaboration',
            description: 'Channels, threads, and mentions',
          },
          {
            icon: faFolderOpen,
            title: 'File Sharing',
            description: 'Share files up to 1GB instantly',
          },
          {
            icon: faGears,
            title: 'Integrations',
            description: 'Connect with 1000+ apps',
          },
        ],
      },
      conferencing: {
        badge: 'Posta Meet',
        heading: 'Video Conferencing & Meetings',
        description:
          'High-quality video conferencing for teams. Screen sharing, recording, and virtual backgrounds included.',
        bullets: ['HD video & audio', 'Screen sharing', 'Meeting recording'],
        image: '/worldposta-assets/hero/posta/suite-light-1680.png',
        imageAlt: 'Video conferencing interface',
        benefits: [
          {
            icon: faVideo,
            title: 'HD Video Calls',
            description: 'Crystal-clear video up to 1080p',
          },
          {
            icon: faPeopleGroup,
            title: 'Large Meetings',
            description: 'Host up to 500 participants',
          },
          {
            icon: faCloud,
            title: 'Cloud Recording',
            description: 'Automatic recording and transcription',
          },
          {
            icon: faShieldHalved,
            title: 'Secure Meetings',
            description: 'End-to-end encryption available',
          },
        ],
      },
      calendar: {
        badge: 'Posta Calendar',
        heading: 'Shared Calendars & Scheduling',
        description:
          'Keep your team synchronized with shared calendars. Schedule meetings, set reminders, and manage resources effortlessly.',
        bullets: ['Shared calendars', 'Meeting scheduler', 'Resource booking'],
        image: '/worldposta-assets/hero/posta/suite-light-1680.png',
        imageAlt: 'Calendar and scheduling interface',
        benefits: [
          {
            icon: faCalendarDays,
            title: 'Smart Scheduling',
            description: 'Find meeting times automatically',
          },
          {
            icon: faPeopleGroup,
            title: 'Team Calendars',
            description: 'Share schedules with your team',
          },
          {
            icon: faVideo,
            title: 'Meeting Links',
            description: 'Auto-generate video call links',
          },
          {
            icon: faGears,
            title: 'Integrations',
            description: 'Sync with Google, Outlook, and more',
          },
        ],
      },
      'drive-files': {
        badge: 'Posta Drive',
        heading: 'Cloud Storage & File Sharing',
        description:
          'Store, sync, and share files securely. Real-time collaboration, version history, and advanced sharing controls.',
        bullets: ['Unlimited storage', 'Real-time collaboration', 'Version history'],
        image: '/worldposta-assets/hero/posta/suite-light-1680.png',
        imageAlt: 'Cloud storage and file management interface',
        benefits: [
          {
            icon: faFolderOpen,
            title: 'Unlimited Storage',
            description: 'Store all your files in the cloud',
          },
          {
            icon: faPeopleGroup,
            title: 'Team Collaboration',
            description: 'Edit documents together in real-time',
          },
          {
            icon: faShieldHalved,
            title: 'Secure Sharing',
            description: 'Granular permissions and expiring links',
          },
          {
            icon: faCloud,
            title: 'Auto Sync',
            description: 'Desktop and mobile apps included',
          },
        ],
      },
      notes: {
        badge: 'Posta Notes',
        heading: 'Collaborative Note-Taking',
        description:
          'Capture ideas and organize knowledge. Rich text editing, checklists, and real-time collaboration for teams.',
        bullets: ['Rich text editor', 'Team workspaces', 'Quick search'],
        image: '/worldposta-assets/hero/posta/suite-light-1680.png',
        imageAlt: 'Note-taking application interface',
        benefits: [
          {
            icon: faFileLines,
            title: 'Rich Editing',
            description: 'Formatting, images, and code blocks',
          },
          {
            icon: faPeopleGroup,
            title: 'Team Notebooks',
            description: 'Organize and share knowledge',
          },
          {
            icon: faGears,
            title: 'Quick Capture',
            description: 'Save from anywhere with extensions',
          },
          {
            icon: faCloud,
            title: 'Cloud Sync',
            description: 'Access notes on all devices',
          },
        ],
      },
      dashboard: {
        badge: 'Posta Dashboard',
        heading: 'Business Analytics & Insights',
        description:
          'Visualize your business metrics in real-time. Customizable dashboards and reports to make data-driven decisions.',
        bullets: ['Real-time metrics', 'Custom reports', 'Data visualization'],
        image: '/worldposta-assets/hero/posta/suite-light-1680.png',
        imageAlt: 'Analytics dashboard interface',
        benefits: [
          {
            icon: faChartLine,
            title: 'Real-Time Data',
            description: 'Live metrics and KPI tracking',
          },
          {
            icon: faGears,
            title: 'Custom Dashboards',
            description: 'Build dashboards for any use case',
          },
          {
            icon: faPeopleGroup,
            title: 'Team Reports',
            description: 'Share insights with your team',
          },
          {
            icon: faCloud,
            title: 'Data Export',
            description: 'Export to Excel, PDF, and more',
          },
        ],
      },
      'iam-access': {
        badge: 'CloudEdge IAM',
        heading: 'Identity & Access Management',
        description:
          'Control who has access to what. Fine-grained permissions, multi-factor authentication, and audit logs for complete security.',
        bullets: ['Fine-grained permissions', 'Multi-factor auth', 'Audit logs'],
        image: '/worldposta-assets/hero/cloudedge/dashboard.png',
        imageAlt: 'IAM and access control dashboard',
        benefits: [
          {
            icon: faUserShield,
            title: 'Role-Based Access',
            description: 'Assign permissions with RBAC policies',
          },
          {
            icon: faShieldHalved,
            title: 'Multi-Factor Auth',
            description: 'Secure access with 2FA/MFA',
          },
          {
            icon: faGears,
            title: 'SSO Integration',
            description: 'Connect with SAML and OAuth providers',
          },
          {
            icon: faChartLine,
            title: 'Audit Trail',
            description: 'Complete activity logs and reports',
          },
        ],
      },
      'team-management': {
        badge: 'WorldPosta Teams',
        heading: 'Team & Organization Management',
        description:
          'Manage your team, departments, and resources from one place. Onboarding, offboarding, and team permissions simplified.',
        bullets: ['Team hierarchy', 'Bulk operations', 'Activity reports'],
        image: '/worldposta-assets/hero/cloudedge/dashboard.png',
        imageAlt: 'Team management dashboard',
        benefits: [
          {
            icon: faPeopleGroup,
            title: 'Team Organization',
            description: 'Create departments and teams',
          },
          {
            icon: faUserShield,
            title: 'Access Control',
            description: 'Manage permissions at scale',
          },
          {
            icon: faGears,
            title: 'Bulk Operations',
            description: 'Onboard and offboard efficiently',
          },
          {
            icon: faChartLine,
            title: 'Usage Analytics',
            description: 'Monitor team activity and adoption',
          },
        ],
      },
    };
    return contentMap[tabId] || contentMap['cloud-infrastructure'];
  });

  protected setActiveTab(tabId: string): void {
    this.activeTabId.set(tabId);
  }

  protected handleKeydown(event: KeyboardEvent, groupId: string, itemIndex: number): void {
    const group = this.tabGroups.find((g) => g.id === groupId);
    if (!group) return;

    const items = group.items;
    let newIndex = itemIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        newIndex = itemIndex < items.length - 1 ? itemIndex + 1 : 0;
        break;
      case 'ArrowUp':
        event.preventDefault();
        newIndex = itemIndex > 0 ? itemIndex - 1 : items.length - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    const newTabId = items[newIndex].id;
    this.setActiveTab(newTabId);

    // Focus the new tab button
    setTimeout(() => {
      const button = document.getElementById(`tab-${newTabId}`);
      button?.focus();
    }, 0);
  }
}
