import { Component, signal, computed, inject } from '@angular/core';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
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
  faArrowDown,
  faArrowRight,
  faArrowUp,
  faBan,
  faBell,
  faBorderAll,
  faBucket,
  faChartColumn,
  faChartPie,
  faChevronLeft,
  faChevronRight,
  faCircleCheck,
  faClipboardCheck,
  faClock,
  faDesktop,
  faDollarSign,
  faEllipsis,
  faFileExcel,
  faFilePdf,
  faFilePowerpoint,
  faFileWord,
  faHardDrive,
  faKey,
  faLock,
  faMinus,
  faMagnifyingGlass,
  faMemory,
  faMicrochip,
  faPlus,
  faRightLeft,
  faRoute,
  faShareNodes,
  faSitemap,
  faStar,
  faTrash,
  faUser,
  faWaveSquare,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { ThemeService } from '@/shared/services/theme.service';
import { PanelCardsComponent, type PanelCard } from './panel-cards/panel-cards.component';
import { NotesPanelComponent, type NotesView } from './notes-panel/notes-panel.component';
import { ServicePickerComponent } from './service-picker/service-picker.component';

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
  /**
   * Which way the delta moved. Defaults to 'up'. Needed because a fall is the
   * good news for some metrics - Backup & DR's recovery time is down 40% - and
   * an up arrow there would state the opposite of what happened.
   */
  readonly deltaDirection?: 'up' | 'down' | 'flat';
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
  /** Omitted in views with no Status column - see `ConsoleView.showStatus`. */
  readonly status?: { readonly label: string; readonly tone: StatusTone };
  /** Values for `ConsoleView.columns`, in the same order. */
  readonly cells: readonly string[];
  /** Per-row mark, when a view mixes resource types. Falls back to `rowIcon`. */
  readonly icon?: IconDefinition;
  /** Initials bubble, for rows that name a person. Takes precedence over icons. */
  readonly initials?: string;
}

/** An in-product preview: stat tiles plus a sample resource table. */
interface ConsoleView {
  readonly title: string;
  readonly total: number;
  /**
   * Header for the first column. Defaults to "Name"; Cost Management lists
   * services rather than named resources.
   */
  readonly nameLabel?: string;
  /** Column headers after the fixed Name column, in render order. */
  readonly columns: readonly string[];
  /**
   * Whether the table carries a Status column. Defaults to true; Team Chat and
   * Drive & Files list conversations and files, which have no state to report.
   */
  readonly showStatus?: boolean;
  /** Noun for the row count, e.g. "files". Defaults to "results". */
  readonly unitLabel?: string;
  /**
   * How many of `columns` precede the Status column. Status sits directly
   * after Name by default; Networking puts Type ahead of it.
   */
  readonly statusAfter?: number;
  readonly rowIcon: IconDefinition;
  /** Omitted on views whose table header carries filters instead. */
  readonly createLabel?: string;
  readonly searchPlaceholder: string;
  readonly pages: number;
  readonly stats: readonly ConsoleStat[];
  readonly rows: readonly ConsoleRow[];
}

/** Accent for a calendar entry. Decoration only - the label and time carry it. */
type EventTone = 'blue' | 'green' | 'purple' | 'amber';

/** An event sitting in a day cell of the month grid. */
interface CalendarEvent {
  /** Day of the displayed month. */
  readonly day: number;
  readonly label: string;
  readonly time: string;
  readonly tone: EventTone;
}

interface AgendaEntry {
  readonly label: string;
  /** Full span, e.g. "10:00 AM - 11:00 AM". */
  readonly time: string;
  readonly tone: EventTone;
  /** Renders the Join affordance, as the live meeting does. */
  readonly join?: boolean;
}

interface AgendaDay {
  /** "Today", "Tomorrow". */
  readonly title: string;
  readonly date: string;
  readonly entries: readonly AgendaEntry[];
}

/**
 * A month grid plus an agenda rail. The sibling of `ConsoleView`: same stat
 * tiles above, but a calendar cannot be expressed as a resource table, so it
 * gets its own shape rather than being bent into one.
 */
interface CalendarView {
  readonly month: string;
  readonly weekdays: readonly string[];
  /** Trailing days of the previous month shown before the 1st. */
  readonly leading: readonly number[];
  readonly daysInMonth: number;
  /** Leading days of the next month, filling out the last week. */
  readonly trailing: readonly number[];
  /** Day of this month drawn as today. */
  readonly today: number;
  readonly views: readonly string[];
  readonly activeView: string;
  readonly searchPlaceholder: string;
  readonly createLabel: string;
  readonly events: readonly CalendarEvent[];
  readonly agenda: readonly AgendaDay[];
  readonly viewAllLabel: string;
  readonly stats: readonly ConsoleStat[];
}

interface TabContent {
  readonly badge: string;
  readonly heading: string;
  readonly description: string;
  readonly bullets: readonly string[];
  readonly image: string;
  /**
   * Dark-theme variant of `image`. Only product screenshots that were captured
   * twice have one; everything else falls back to `image`.
   */
  readonly imageDark?: string;
  readonly imageAlt: string;
  /** Label for the primary CTA; defaults to "Get started". */
  readonly cta?: string;
  /** When present, replaces the screenshot with a live-rendered console preview. */
  readonly console?: ConsoleView;
  /** As `console`, for the one view that is a calendar rather than a table. */
  readonly calendar?: CalendarView;
  /** Card row under the stats, on the management-style tabs. */
  readonly cards?: readonly PanelCard[];
  /** As `console`, for the Notes tab, which is a three-pane rather than a table. */
  readonly notes?: NotesView;
  /** Stat tiles for a tab whose preview is not a console or calendar. */
  readonly stats?: readonly ConsoleStat[];
  /**
   * 'wide' drops the left copy / right preview split for a full-width heading
   * with a single trailing action, as the Management tabs are drawn.
   */
  readonly layout?: 'split' | 'wide';
  /** The trailing action in a 'wide' header. */
  readonly headerAction?: string;
  /** Leading mark for `headerAction`; defaults to a plus. */
  readonly headerActionIcon?: IconDefinition;
  readonly benefits: readonly { icon: IconDefinition; title: string; description: string }[];
}

@Component({
  selector: 'app-ecosystem-tabs',
  imports: [DecimalPipe, FaIconComponent, NgOptimizedImage, PanelCardsComponent, NotesPanelComponent, ServicePickerComponent],
  templateUrl: './ecosystem-tabs.component.html',
  styleUrl: './ecosystem-tabs.component.css',
})
export class EcosystemTabsComponent {
  private readonly theme = inject(ThemeService);

  protected readonly icons = {
    check: faCheck,
    chevronLeft: faChevronLeft,
    chevronRight: faChevronRight,
    arrowRight: faArrowRight,
    arrowDown: faArrowDown,
    minus: faMinus,
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
   * Stat tiles for whichever preview the active tab renders. Console and
   * calendar views both open with the same four tiles.
   */
  protected readonly panelStats = computed(
    () =>
      this.tabContent().console?.stats ??
      this.tabContent().calendar?.stats ??
      this.tabContent().stats ??
      null,
  );

  /**
   * The month grid as rows of seven cells, padded from the neighbouring months.
   * Memoized for the same reason as the console table: a template method would
   * hand `@for` fresh arrays on every pass.
   */
  protected readonly calendarWeeks = computed(() => {
    const view = this.tabContent().calendar;
    if (!view) return null;
    const byDay = new Map(view.events.map((event) => [event.day, event]));
    const cells = [
      ...view.leading.map((day) => ({ day, outside: true, today: false, event: undefined })),
      ...Array.from({ length: view.daysInMonth }, (_, index) => {
        const day = index + 1;
        return { day, outside: false, today: day === view.today, event: byDay.get(day) };
      }),
      ...view.trailing.map((day) => ({ day, outside: true, today: false, event: undefined })),
    ];
    const weeks: (typeof cells)[] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
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
      nameLabel: view.nameLabel ?? 'Name',
      showStatus: view.showStatus ?? true,
      unitLabel: view.unitLabel ?? 'results',
      columnsBefore: view.columns.slice(0, split),
      columnsAfter: view.columns.slice(split),
      rows: view.rows.map((row) => ({
        name: row.name,
        status: row.status,
        initials: row.initials,
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
        { id: 'monitoring', label: 'Monitoring', icon: faChartColumn },
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

  /**
   * Phone-only disclosure state for the service list. On a phone the sidebar
   * cost 537px of navigation before any content, and half its 19 tabs sat off
   * screen in a horizontal scroller; collapsed behind the picker it costs one
   * row. Desktop never reads this.
   */
  protected readonly pickerOpen = signal(false);

  /** The picker face: what you are looking at, and which family it belongs to. */
  protected readonly activeTab = computed(() => {
    const id = this.activeTabId();
    for (const group of this.tabGroups) {
      const hit = group.items.find((item) => item.id === id);
      if (hit) return { ...hit, groupLabel: group.label };
    }
    const first = this.tabGroups[0];
    return { ...first.items[0], groupLabel: first.label };
  });

  /** Shown on the picker so the catalogue behind it is not a secret. */
  protected readonly serviceCount = this.tabGroups.reduce((n, g) => n + g.items.length, 0);

  /**
   * The panel screenshot for the active theme. A light screenshot on the dark
   * page reads as a bright slab, so tabs that have a dark capture swap to it;
   * the rest fall back to the light one.
   */
  protected readonly panelImage = computed(() => {
    const content = this.tabContent();
    return this.theme.isDark() && content.imageDark ? content.imageDark : content.image;
  });

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
        // Captured from the live CloudEdge console (1600x900), so it matches the
        // 800x450 the template declares — unlike dashboard.png, which is 1520x684.
        image: '/worldposta-assets/hero/cloudedge/console-dashboard.png',
        imageDark: '/worldposta-assets/hero/cloudedge/console-dashboard-dark.png',
        imageAlt:
          'CloudEdge Console dashboard: CPU, memory, storage and active VM usage, top VMs by resource usage, and a security score of 87%',
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
        // The console has no Kubernetes route, so there is no Kubernetes screen
        // to capture. This shows the CloudEdge console dashboard, and the alt
        // says so rather than describing a screen that does not exist.
        image: '/worldposta-assets/hero/cloudedge/console-dashboard.png',
        imageDark: '/worldposta-assets/hero/cloudedge/console-dashboard-dark.png',
        imageAlt: 'CloudEdge Console dashboard showing cluster resource usage',
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
        badge: 'Cloud & Infrastructure',
        heading: 'Security',
        description:
          'Comprehensive, enterprise-grade security to protect your data, applications and infrastructure.',
        bullets: [
          'Advanced threat protection',
          'Identity & access management',
          'Compliance and continuous monitoring',
        ],
        image: '/worldposta-assets/hero/cloudedge/security-hub.png',
        imageAlt: 'Security dashboard with threat monitoring',
        console: {
          title: 'Security Services',
          total: 8,
          // Type sits ahead of Status here, as in the Networking view.
          columns: ['Type', 'Region', 'Protected Resources', 'Last Updated'],
          statusAfter: 1,
          // Every row names a different kind of service, so each carries its own
          // mark; this fallback only applies if one is ever added without it.
          rowIcon: faShieldHalved,
          createLabel: 'Add Policy',
          searchPlaceholder: 'Search security services...',
          pages: 2,
          stats: [
            { icon: faShieldHalved, label: 'Protected Resources', value: '320', delta: '18%', tone: 'sky', trend: [271, 278, 286, 294, 301, 308, 314, 320] },
            { icon: faBan, label: 'Blocked Threats', value: '1.8M', delta: '24%', tone: 'amber', trend: [1.45, 1.5, 1.55, 1.62, 1.67, 1.72, 1.76, 1.8] },
            { icon: faLock, label: 'Active Policies', value: '124', delta: '12%', tone: 'green', trend: [111, 113, 115, 117, 119, 121, 123, 124] },
            { icon: faClipboardCheck, label: 'Compliance Score', value: '99.9%', delta: '5%', tone: 'purple', trend: [95.1, 96, 96.8, 97.4, 98.1, 98.8, 99.4, 99.9] },
          ],
          rows: [
            { name: 'Web Application Firewall', icon: faBorderAll, status: { label: 'Active', tone: 'good' }, cells: ['WAF', 'UAE', '12 websites', 'Jan 12, 2024'] },
            { name: 'DDoS Protection', icon: faShieldHalved, status: { label: 'Active', tone: 'good' }, cells: ['DDoS', 'Global', 'All applications', 'Jan 10, 2024'] },
            { name: 'Identity & Access Management', icon: faPeopleGroup, status: { label: 'Active', tone: 'good' }, cells: ['IAM', 'UAE', '320 users', 'Jan 08, 2024'] },
            { name: 'Key Management', icon: faKey, status: { label: 'Active', tone: 'good' }, cells: ['KMS', 'KSA', '48 keys', 'Jan 05, 2024'] },
            { name: 'Vulnerability Scanning', icon: faMagnifyingGlass, status: { label: 'Scanning', tone: 'warning' }, cells: ['Scanner', 'UAE', '28 resources', 'Jan 02, 2024'] },
          ],
        },
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
        badge: 'Cloud & Infrastructure',
        heading: 'Backup & DR',
        description:
          'Reliable backup and disaster recovery to keep your business resilient and always on.',
        bullets: [
          'Automated and secure backups',
          'Fast recovery and minimal downtime',
          'Scalable and flexible disaster recovery solutions',
        ],
        image: '/worldposta-assets/hero/cloudedge/dashboard.png',
        imageAlt: 'Backup and recovery management dashboard',
        cta: 'Create Backup',
        console: {
          title: 'Backup Jobs',
          total: 42,
          // Status sits directly after Name in this view, so no statusAfter.
          columns: ['Type', 'Last Run', 'Next Run', 'Size'],
          rowIcon: faCloudArrowUp,
          createLabel: 'New Backup',
          searchPlaceholder: 'Search backup jobs...',
          pages: 5,
          stats: [
            { icon: faDatabase, label: 'Protected Workloads', value: '312', delta: '18%', tone: 'sky', trend: [264, 271, 279, 287, 294, 301, 307, 312] },
            { icon: faShieldHalved, label: 'Backup Success Rate', value: '99.9%', delta: '2%', tone: 'amber', trend: [98, 98.3, 98.6, 98.9, 99.2, 99.5, 99.7, 99.9] },
            // The only falling metric here, and the fall is the improvement.
            { icon: faChartPie, label: 'Average Recovery Time', value: '15 min', delta: '40%', deltaDirection: 'down', tone: 'green', trend: [25, 23, 22, 20, 19, 17, 16, 15] },
            { icon: faHardDrive, label: 'Total Backup Storage', value: '28.6 TB', delta: '22%', tone: 'purple', trend: [23.4, 24.2, 25, 25.8, 26.6, 27.4, 28, 28.6] },
          ],
          rows: [
            { name: 'Production-Servers', icon: faBorderAll, status: { label: 'Completed', tone: 'good' }, cells: ['Full Backup', 'Jan 12, 2024 01:00 AM', 'Jan 13, 2024 01:00 AM', '1.2 TB'] },
            { name: 'Databases', icon: faDatabase, status: { label: 'Completed', tone: 'good' }, cells: ['Incremental', 'Jan 11, 2024 11:30 PM', 'Jan 12, 2024 11:30 PM', '850 GB'] },
            { name: 'Application-Files', icon: faFolderOpen, status: { label: 'Completed', tone: 'good' }, cells: ['Incremental', 'Jan 11, 2024 10:00 PM', 'Jan 12, 2024 10:00 PM', '420 GB'] },
            { name: 'User-Data', icon: faUser, status: { label: 'In Progress', tone: 'warning' }, cells: ['Incremental', 'Jan 12, 2024 12:15 PM', 'Jan 13, 2024 12:15 PM', '230 GB'] },
            { name: 'Disaster-Recovery', icon: faCloud, status: { label: 'Completed', tone: 'good' }, cells: ['Full Backup', 'Jan 10, 2024 02:00 AM', 'Jan 17, 2024 02:00 AM', '4.8 TB'] },
          ],
        },
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
      monitoring: {
        badge: 'Cloud & Infrastructure',
        heading: 'Monitoring',
        description:
          'Gain real-time visibility and insights into your infrastructure, applications and services.',
        bullets: [
          'Real-time performance monitoring',
          'Proactive alerts and notifications',
          'Custom dashboards and reporting',
        ],
        image: '/worldposta-assets/hero/cloudedge/dashboard.png',
        imageAlt: 'Monitoring dashboard with resource health and response times',
        cta: 'View Dashboard',
        console: {
          title: 'Monitored Resources',
          total: 128,
          columns: ['Type', 'CPU', 'Memory', 'Response Time', 'Uptime'],
          statusAfter: 1,
          rowIcon: faChartColumn,
          createLabel: 'Add Monitor',
          searchPlaceholder: 'Search resources...',
          pages: 5,
          stats: [
            { icon: faServer, label: 'Monitored Resources', value: '128', delta: '16%', tone: 'sky', trend: [110, 113, 116, 119, 121, 124, 126, 128] },
            // Fewer alerts and faster responses are both improvements.
            { icon: faBell, label: 'Active Alerts', value: '3', delta: '40%', deltaDirection: 'down', tone: 'amber', trend: [5, 5, 4, 4, 4, 3, 3, 3] },
            { icon: faClock, label: 'Uptime', value: '99.98%', delta: '0.2%', tone: 'green', trend: [99.78, 99.81, 99.84, 99.87, 99.9, 99.93, 99.96, 99.98] },
            { icon: faWaveSquare, label: 'Average Response Time', value: '120 ms', delta: '28%', deltaDirection: 'down', tone: 'purple', trend: [167, 160, 152, 145, 138, 131, 125, 120] },
          ],
          rows: [
            { name: 'prod-web-01', icon: faServer, status: { label: 'Healthy', tone: 'good' }, cells: ['Virtual Machine', '24%', '56%', '120 ms', '99.99%'] },
            { name: 'commerce-cluster', icon: faCubes, status: { label: 'Healthy', tone: 'good' }, cells: ['Kubernetes', '38%', '62%', '210 ms', '99.97%'] },
            { name: 'app-database', icon: faDatabase, status: { label: 'Warning', tone: 'warning' }, cells: ['Database', '72%', '78%', '340 ms', '99.95%'] },
            { name: 'vpc-network', icon: faNetworkWired, status: { label: 'Healthy', tone: 'good' }, cells: ['Network', '18%', '42%', '95 ms', '99.99%'] },
            { name: 'web-loadbalancer', icon: faSitemap, status: { label: 'Healthy', tone: 'good' }, cells: ['Load Balancer', '26%', '48%', '110 ms', '99.98%'] },
          ],
        },
        // Not in the reference mockup, which stops above this strip - these are
        // drawn from the bullets above and are the one part of this tab awaiting
        // your wording.
        benefits: [
          {
            icon: faChartColumn,
            title: 'Live Metrics',
            description: 'Resource health and performance in real time',
          },
          {
            icon: faBell,
            title: 'Proactive Alerts',
            description: 'Notified before an issue reaches your users',
          },
          {
            icon: faWaveSquare,
            title: 'Response Insight',
            description: 'Latency tracked across every monitored service',
          },
          {
            icon: faFileLines,
            title: 'Custom Dashboards',
            description: 'Build the view your team needs and share it',
          },
        ],
      },
      automation: {
        badge: 'Cloud & Infrastructure',
        heading: 'Automation',
        description:
          'Automate your cloud operations, streamline workflows and save time with intelligent automation.',
        bullets: [
          'Automate routine tasks and workflows',
          'Reduce operational effort and human error',
          'Integrate across your cloud services',
        ],
        image: '/worldposta-assets/hero/cloudedge/scheduled-tasks.png',
        imageAlt: 'Automation and scheduling dashboard',
        cta: 'Create Automation',
        console: {
          title: 'Automation Workflows',
          total: 48,
          columns: ['Trigger', 'Last Run', 'Next Run'],
          statusAfter: 1,
          rowIcon: faGears,
          createLabel: 'Create Workflow',
          searchPlaceholder: 'Search workflows...',
          pages: 5,
          stats: [
            { icon: faGears, label: 'Automations Executed', value: '12.4 K', delta: '26%', tone: 'sky', trend: [9.8, 10.2, 10.7, 11.1, 11.5, 11.9, 12.2, 12.4] },
            { icon: faClock, label: 'Time Saved', value: '320 hrs', delta: '40%', tone: 'amber', trend: [229, 241, 254, 268, 281, 295, 308, 320] },
            { icon: faFileLines, label: 'Active Workflows', value: '48', delta: '20%', tone: 'green', trend: [40, 41, 42, 44, 45, 46, 47, 48] },
            { icon: faCircleCheck, label: 'Success Rate', value: '99.7%', delta: '3%', tone: 'purple', trend: [96.8, 97.2, 97.6, 98.1, 98.5, 98.9, 99.3, 99.7] },
          ],
          rows: [
            { name: 'Auto Scale VMs', icon: faCloud, status: { label: 'Active', tone: 'good' }, cells: ['CPU > 70%', 'Jan 12, 2024 10:20 AM', 'Jan 12, 2024 11:00 AM'] },
            { name: 'Daily Backup', icon: faDatabase, status: { label: 'Active', tone: 'good' }, cells: ['Schedule (Daily)', 'Jan 12, 2024 02:00 AM', 'Jan 13, 2024 02:00 AM'] },
            { name: 'Security Alert Notification', icon: faShieldHalved, status: { label: 'Active', tone: 'good' }, cells: ['Security Event', 'Jan 11, 2024 08:15 PM', 'Continuous'] },
            { name: 'Cost Report Generation', icon: faFileLines, status: { label: 'Paused', tone: 'warning' }, cells: ['Schedule (Weekly)', 'Jan 08, 2024 09:00 AM', 'Jan 15, 2024 09:00 AM'] },
            { name: 'User Provisioning', icon: faPeopleGroup, status: { label: 'Active', tone: 'good' }, cells: ['New User', 'Jan 12, 2024 01:10 PM', 'Continuous'] },
          ],
        },
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
        badge: 'Cloud & Infrastructure',
        heading: 'Cost Management',
        description:
          'Gain full visibility, optimize cloud spending and get more value from your infrastructure.',
        bullets: [
          'Real-time cost visibility and reporting',
          'Identify savings and optimization opportunities',
          'Set budgets, alerts and spending controls',
        ],
        image: '/worldposta-assets/hero/cloudedge/dashboard.png',
        imageAlt: 'Cost analysis and optimization dashboard',
        cta: 'View Cost Insights',
        console: {
          title: 'Cost Overview',
          total: 24,
          // This view lists services, not named resources.
          nameLabel: 'Service',
          // Status trails the budget figures here rather than leading the row.
          columns: ['Resource', 'Current Spend', 'Change', 'Budget', 'Budget Used'],
          statusAfter: 5,
          rowIcon: faCoins,
          createLabel: 'Create Budget',
          searchPlaceholder: 'Search resources, services or tags...',
          pages: 5,
          stats: [
            // Spend falling and alerts falling are both the good direction here.
            { icon: faDollarSign, label: 'Total Cloud Spend', value: '$12,430', delta: '18%', deltaDirection: 'down', tone: 'sky', trend: [15158, 14700, 14200, 13800, 13400, 13000, 12700, 12430] },
            { icon: faChartColumn, label: 'Potential Savings', value: '$3,250', delta: '24%', tone: 'amber', trend: [2621, 2720, 2810, 2900, 2990, 3080, 3170, 3250] },
            { icon: faChartPie, label: 'Budget Utilization', value: '68%', delta: '12%', deltaDirection: 'down', tone: 'green', trend: [77, 76, 75, 73, 72, 70, 69, 68] },
            { icon: faBell, label: 'Active Alerts', value: '5', delta: '50%', deltaDirection: 'down', tone: 'purple', trend: [10, 9, 9, 8, 7, 6, 6, 5] },
          ],
          rows: [
            { name: 'Virtual Machines', icon: faDesktop, status: { label: 'On Track', tone: 'good' }, cells: ['prod-vm-cluster', '$4,320', '↓ 18%', '$6,000', '72%'] },
            { name: 'Storage', icon: faDatabase, status: { label: 'On Track', tone: 'good' }, cells: ['prod-storage', '$2,180', '↑ 12%', '$3,000', '73%'] },
            { name: 'Networking', icon: faNetworkWired, status: { label: 'On Track', tone: 'good' }, cells: ['vpc-network', '$1,560', '↓ 25%', '$2,500', '62%'] },
            { name: 'Security', icon: faShieldHalved, status: { label: 'Attention', tone: 'warning' }, cells: ['waf-security', '$980', '↑ 8%', '$1,200', '82%'] },
            { name: 'Backup & DR', icon: faCloudArrowUp, status: { label: 'On Track', tone: 'good' }, cells: ['daily-backup', '$640', '↓ 20%', '$1,000', '64%'] },
          ],
        },
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
        badge: 'Collaboration & Productivity',
        heading: 'Business Email',
        description:
          'Secure, reliable and professional email for your business, built for productivity.',
        bullets: [
          'Custom domain email (you@yourcompany.com)',
          'Advanced security and anti-spam protection',
          'Access from anywhere, on any device',
        ],
        image: '/worldposta-assets/hero/posta/suite-light-1680.png',
        imageAlt: 'Business email interface',
        cta: 'Create Email Account',
        console: {
          title: 'Email Accounts',
          total: 1250,
          columns: ['Email Address', 'Plan', 'Storage Used', 'Last Login'],
          statusAfter: 2,
          rowIcon: faEnvelope,
          createLabel: 'Add Account',
          searchPlaceholder: 'Search email accounts...',
          pages: 5,
          stats: [
            { icon: faEnvelope, label: 'Active Mailboxes', value: '1,250', delta: '12%', tone: 'sky', trend: [1116, 1136, 1156, 1176, 1196, 1216, 1234, 1250] },
            { icon: faShieldHalved, label: 'Spam Blocked', value: '99.8%', delta: '6%', tone: 'amber', trend: [94.2, 95, 95.8, 96.6, 97.4, 98.2, 99, 99.8] },
            { icon: faDatabase, label: 'Storage Used', value: '680 GB', delta: '8%', tone: 'green', trend: [630, 637, 644, 651, 658, 665, 672, 680] },
            { icon: faPeopleGroup, label: 'Active Users', value: '1,180', delta: '14%', tone: 'purple', trend: [1035, 1056, 1077, 1098, 1119, 1140, 1160, 1180] },
          ],
          rows: [
            { name: 'Ahmed Hassan', icon: faUser, status: { label: 'Active', tone: 'good' }, cells: ['ahmed@yourcompany.com', 'Business Pro', '12 GB / 50 GB', 'Jan 12, 2024 10:24 AM'] },
            { name: 'Sara Ali', icon: faUser, status: { label: 'Active', tone: 'good' }, cells: ['sara@yourcompany.com', 'Business Pro', '8 GB / 50 GB', 'Jan 12, 2024 09:18 AM'] },
            { name: 'Marketing Team', icon: faPeopleGroup, status: { label: 'Active', tone: 'good' }, cells: ['marketing@yourcompany.com', 'Business Standard', '24 GB / 100 GB', 'Jan 11, 2024 06:45 PM'] },
            { name: 'Sales Team', icon: faPeopleGroup, status: { label: 'Active', tone: 'good' }, cells: ['sales@yourcompany.com', 'Business Standard', '18 GB / 100 GB', 'Jan 11, 2024 04:12 PM'] },
            { name: 'Support', icon: faPeopleGroup, status: { label: 'Active', tone: 'good' }, cells: ['support@yourcompany.com', 'Business Pro', '32 GB / 100 GB', 'Jan 10, 2024 11:03 AM'] },
          ],
        },
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
        badge: 'Collaboration & Productivity',
        heading: 'Team Chat',
        description:
          'Connect your teams, streamline communication and get work done — all in one secure platform.',
        bullets: [
          'Real-time messaging and group chats',
          'Secure and compliant communication',
          'Integrations with your favorite tools',
        ],
        image: '/worldposta-assets/hero/posta/suite-light-1680.png',
        imageAlt: 'Team chat application',
        cta: 'Open Team Chat',
        console: {
          title: 'Recent Conversations',
          total: 24,
          nameLabel: 'Name / Channel',
          columns: ['Type', 'Last Message', 'Time', 'Unread'],
          // A conversation has no state to report, so this view has no Status.
          showStatus: false,
          unitLabel: 'conversations',
          rowIcon: faMessage,
          createLabel: 'New Chat',
          searchPlaceholder: 'Search conversations...',
          pages: 5,
          stats: [
            { icon: faPeopleGroup, label: 'Active Users', value: '1,180', delta: '14%', tone: 'sky', trend: [1035, 1056, 1077, 1098, 1119, 1140, 1160, 1180] },
            { icon: faMessage, label: 'Active Channels', value: '320', delta: '25%', tone: 'amber', trend: [256, 265, 274, 283, 292, 301, 311, 320] },
            { icon: faFileLines, label: 'Messages Sent', value: '24.5K', delta: '32%', tone: 'green', trend: [18.6, 19.4, 20.3, 21.2, 22.1, 23, 23.8, 24.5] },
            { icon: faClock, label: 'Average Response Time', value: '2 min', delta: '40%', deltaDirection: 'down', tone: 'purple', trend: [3.3, 3.1, 2.9, 2.7, 2.5, 2.3, 2.1, 2] },
          ],
          rows: [
            { name: 'Marketing Team', icon: faPeopleGroup, cells: ['Group', 'Sarah: Great work on the campaign! 🎉', '10:24 AM', '2'] },
            { name: 'Ahmed Hassan', icon: faUser, cells: ['Direct', "Let's review the proposal today.", '09:18 AM', '1'] },
            { name: 'Product Updates', icon: faMessage, cells: ['Channel', 'System: New version deployed successfully.', '08:45 AM', '0'] },
            { name: 'Sara Ali', icon: faUser, cells: ['Direct', 'Can you share the latest deck?', 'Yesterday', '0'] },
            { name: 'All Company', icon: faMessage, cells: ['Channel', 'HR: Team building event next week.', 'Yesterday', '5'] },
          ],
        },
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
        badge: 'Collaboration & Productivity',
        heading: 'Conferencing',
        description:
          'Host secure, high-quality video meetings and bring your teams closer, from anywhere.',
        bullets: [
          'HD video and crystal-clear audio',
          'Screen sharing, recording and live captions',
          'Secure and reliable for teams of any size',
        ],
        image: '/worldposta-assets/hero/posta/suite-light-1680.png',
        imageAlt: 'Video conferencing interface',
        cta: 'Start a Meeting',
        console: {
          title: 'Upcoming Meetings',
          total: 5,
          nameLabel: 'Title',
          columns: ['Date & Time', 'Organizer', 'Participants'],
          statusAfter: 3,
          unitLabel: 'meetings',
          rowIcon: faVideo,
          createLabel: 'Schedule Meeting',
          searchPlaceholder: 'Search meetings...',
          pages: 1,
          stats: [
            { icon: faPeopleGroup, label: 'Meetings Hosted', value: '1,320', delta: '28%', tone: 'sky', trend: [1031, 1074, 1117, 1160, 1203, 1246, 1283, 1320] },
            { icon: faClock, label: 'Total Meeting Minutes', value: '56.4K', delta: '35%', tone: 'amber', trend: [41.8, 43.9, 46, 48.1, 50.2, 52.3, 54.4, 56.4] },
            { icon: faDesktop, label: 'Active Users', value: '890', delta: '18%', tone: 'green', trend: [754, 774, 793, 813, 832, 852, 871, 890] },
            { icon: faShieldHalved, label: 'Meeting Success Rate', value: '99.8%', delta: '2%', tone: 'purple', trend: [97.8, 98.1, 98.4, 98.7, 99, 99.3, 99.6, 99.8] },
          ],
          rows: [
            { name: 'Marketing Sync', status: { label: 'Upcoming', tone: 'good' }, cells: ['Jan 12, 2024 10:00 AM', 'Sara Ali', '+8'] },
            { name: 'Product Roadmap', status: { label: 'Upcoming', tone: 'good' }, cells: ['Jan 12, 2024 02:00 PM', 'Ahmed Hassan', '+12'] },
            { name: 'Client Presentation', status: { label: 'Upcoming', tone: 'good' }, cells: ['Jan 13, 2024 11:00 AM', 'Mona Khaled', '+5'] },
            { name: 'Team Weekly', status: { label: 'Upcoming', tone: 'good' }, cells: ['Jan 14, 2024 09:00 AM', 'Omar Adel', '+10'] },
            { name: 'HR Update', status: { label: 'Upcoming', tone: 'good' }, cells: ['Jan 15, 2024 03:00 PM', 'Nour Ibrahim', '+6'] },
          ],
        },
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
        badge: 'Collaboration & Productivity',
        heading: 'Calendar',
        description:
          'Plan, organize and stay in sync across your teams. Seamless scheduling for a more productive business.',
        bullets: [
          'Schedule meetings and events',
          'Share calendars with your team',
          'Integrate with email, chat and conferencing',
        ],
        image: '/worldposta-assets/hero/posta/suite-light-1680.png',
        imageAlt: 'Calendar and scheduling interface',
        cta: 'Create Event',
        calendar: {
          month: 'January 2024',
          weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          // January 2024 opens on a Monday, so one December day leads the grid
          // and three February days close it - 35 cells, five rows.
          leading: [31],
          daysInMonth: 31,
          trailing: [1, 2, 3],
          today: 22,
          views: ['Day', 'Week', 'Month'],
          activeView: 'Month',
          searchPlaceholder: 'Search events...',
          createLabel: 'Add Event',
          stats: [
            { icon: faPeopleGroup, label: 'Upcoming Meetings', value: '12', delta: '25%', tone: 'sky', trend: [9, 9, 10, 10, 11, 11, 12, 12] },
            { icon: faCalendarDays, label: 'This Week', value: '28', delta: '16%', tone: 'amber', trend: [24, 24, 25, 26, 26, 27, 27, 28] },
            { icon: faClock, label: 'Hours Scheduled', value: '46', delta: '32%', tone: 'green', trend: [35, 36, 38, 40, 41, 43, 44, 46] },
            { icon: faCircleCheck, label: 'Event Completion Rate', value: '96%', delta: '4%', tone: 'purple', trend: [92.3, 92.9, 93.4, 94, 94.6, 95.1, 95.6, 96] },
          ],
          events: [
            { day: 1, label: 'Team Sync', time: '10:00 AM', tone: 'blue' },
            { day: 2, label: 'Product Review', time: '2:00 PM', tone: 'green' },
            { day: 4, label: 'Client Meeting', time: '11:00 AM', tone: 'purple' },
            { day: 8, label: 'Marketing Plan', time: '11:00 AM', tone: 'green' },
            { day: 10, label: 'Security Workshop', time: '3:00 PM', tone: 'blue' },
            { day: 12, label: 'Team Check-in', time: '10:00 AM', tone: 'green' },
            { day: 15, label: 'HR Update', time: '1:00 PM', tone: 'purple' },
            { day: 17, label: 'Product Demo', time: '2:00 PM', tone: 'amber' },
            { day: 19, label: 'Budget Review', time: '11:00 AM', tone: 'purple' },
            { day: 22, label: 'All Hands', time: '10:00 AM', tone: 'blue' },
            { day: 24, label: 'Strategy Session', time: '3:00 PM', tone: 'blue' },
            { day: 26, label: 'Client Follow-up', time: '1:00 PM', tone: 'green' },
            { day: 30, label: 'Q&A Session', time: '2:00 PM', tone: 'green' },
          ],
          agenda: [
            {
              title: 'Today',
              date: 'Mon, Jan 22, 2024',
              entries: [
                { label: 'All Hands Meeting', time: '10:00 AM - 11:00 AM', tone: 'blue', join: true },
                { label: 'Marketing Sync', time: '1:00 PM - 2:00 PM', tone: 'green' },
                { label: 'Product Demo Prep', time: '3:00 PM - 4:00 PM', tone: 'purple' },
              ],
            },
            {
              title: 'Tomorrow',
              date: 'Tue, Jan 23, 2024',
              entries: [
                { label: 'Client Presentation', time: '11:00 AM - 12:00 PM', tone: 'amber' },
                { label: 'Team Check-in', time: '2:00 PM - 3:00 PM', tone: 'green' },
                { label: 'Security Workshop', time: '4:00 PM - 5:00 PM', tone: 'blue' },
              ],
            },
          ],
          viewAllLabel: 'View All Events',
        },
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
        badge: 'Collaboration & Productivity',
        heading: 'Drive & Files',
        description:
          'Store, share and collaborate on your files securely from anywhere.',
        bullets: [
          'Secure cloud storage for your business',
          'Share files and folders with your teams',
          'Access and collaborate from any device',
        ],
        image: '/worldposta-assets/hero/posta/suite-light-1680.png',
        imageAlt: 'Cloud storage and file management interface',
        cta: 'Upload Files',
        console: {
          title: 'My Drive',
          total: 12480,
          columns: ['Owner', 'Last Modified', 'Size'],
          // Files and folders carry no status.
          showStatus: false,
          unitLabel: 'files',
          rowIcon: faFolderOpen,
          createLabel: 'Upload',
          searchPlaceholder: 'Search files and folders...',
          pages: 5,
          stats: [
            { icon: faFileLines, label: 'Total Files', value: '12,480', delta: '12%', tone: 'sky', trend: [11143, 11340, 11537, 11734, 11931, 12128, 12304, 12480] },
            { icon: faPeopleGroup, label: 'Shared Folders', value: '320', delta: '18%', tone: 'amber', trend: [271, 278, 285, 292, 299, 306, 313, 320] },
            { icon: faDatabase, label: 'Storage Used', value: '680 GB', delta: '8%', tone: 'green', trend: [630, 637, 644, 651, 658, 665, 672, 680] },
            { icon: faUser, label: 'Active Collaborators', value: '48', delta: '14%', tone: 'purple', trend: [42, 43, 44, 45, 46, 47, 47, 48] },
          ],
          rows: [
            { name: 'Marketing Materials', icon: faFolderOpen, cells: ['Me', 'Jan 12, 2024 10:24 AM', '—'] },
            { name: 'Sales Enablement', icon: faFolderOpen, cells: ['Ahmed Hassan', 'Jan 11, 2024 02:15 PM', '—'] },
            { name: 'HR', icon: faFolderOpen, cells: ['Sara Ali', 'Jan 10, 2024 11:03 AM', '—'] },
            { name: 'Project Phoenix', icon: faFolderOpen, cells: ['Me', 'Jan 09, 2024 04:20 PM', '—'] },
            { name: 'Product Brochure.pdf', icon: faFilePdf, cells: ['Marketing Team', 'Jan 08, 2024 01:12 PM', '4.2 MB'] },
            { name: 'Q1 Strategy Deck.pptx', icon: faFilePowerpoint, cells: ['Omar Adel', 'Jan 07, 2024 03:45 PM', '12.8 MB'] },
            { name: 'Budget 2024.xlsx', icon: faFileExcel, cells: ['Finance Team', 'Jan 06, 2024 09:30 AM', '1.1 MB'] },
            { name: 'Meeting Notes.docx', icon: faFileWord, cells: ['Me', 'Jan 05, 2024 05:18 PM', '320 KB'] },
          ],
        },
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
        badge: 'Collaboration & Productivity',
        heading: 'Notes',
        description: 'Capture ideas, organize information and keep your team aligned.',
        bullets: [
          'Create and organize notes effortlessly',
          'Share and collaborate with your team',
          'Access your notes from anywhere',
        ],
        cta: 'Create Note',
        image: '/worldposta-assets/hero/posta/suite-light-1680.png',
        imageAlt: 'Note-taking application interface',
        stats: [
          { icon: faFileLines, label: 'Total Notes', value: '1,420', delta: '18%', tone: 'sky', trend: [980, 1040, 1105, 1160, 1235, 1300, 1365, 1420] },
          { icon: faShareNodes, label: 'Shared Notes', value: '320', delta: '25%', tone: 'sky', trend: [190, 210, 232, 248, 268, 289, 305, 320] },
          { icon: faFolderOpen, label: 'Notebooks', value: '24', delta: '9%', tone: 'green', trend: [18, 19, 20, 20, 21, 22, 23, 24] },
          { icon: faClock, label: 'Recent Activity', value: '156', delta: '32%', tone: 'green', trend: [92, 101, 112, 120, 131, 140, 149, 156] },
        ],
        notes: {
          railTitle: 'Notebooks',
          rail: [
            { icon: faFileLines, label: 'All Notes', count: '1,420', active: true },
            { icon: faFileLines, label: 'My Notes', count: '320' },
            { icon: faPeopleGroup, label: 'Shared with Me', count: '260' },
            { icon: faStar, label: 'Starred', count: '85' },
            { icon: faClock, label: 'Recent', count: '156' },
            { icon: faTrash, label: 'Trash', count: '12' },
          ],
          booksTitle: 'My Notebooks',
          books: [
            { tone: 'purple', label: 'Marketing', count: '24' },
            { tone: 'green', label: 'Product', count: '18' },
            { tone: 'blue', label: 'Sales', count: '16' },
            { tone: 'blue', label: 'HR', count: '12' },
            { tone: 'amber', label: 'Personal', count: '28' },
          ],
          listTitle: 'All Notes',
          searchPlaceholder: 'Search notes...',
          createLabel: 'New Note',
          columns: ['Title', 'Last Modified', 'Owner'],
          rows: [
            { title: 'Q1 Marketing Plan', modified: 'Jan 12, 2024 10:24 AM', owner: 'Me', tone: 'blue', starred: true, active: true },
            { title: 'Product Ideas', modified: 'Jan 11, 2024 02:15 PM', owner: 'Ahmed Hassan', tone: 'green' },
            { title: 'Meeting Notes - Strategy', modified: 'Jan 10, 2024 11:03 AM', owner: 'Sara Ali', tone: 'blue' },
            { title: 'Client Requirements', modified: 'Jan 09, 2024 04:20 PM', owner: 'Omar Adel', tone: 'blue' },
            { title: 'Team Action Items', modified: 'Jan 08, 2024 01:12 PM', owner: 'Me', tone: 'amber' },
            { title: 'Budget Planning', modified: 'Jan 07, 2024 03:45 PM', owner: 'Finance Team', tone: 'purple' },
            { title: 'HR Policies', modified: 'Jan 06, 2024 09:30 AM', owner: 'Nour Ibrahim', tone: 'blue' },
            { title: 'Ideas - 2024', modified: 'Jan 05, 2024 05:18 PM', owner: 'Me', tone: 'amber' },
          ],
          footer: 'Showing 1 - 8 of 1,420 notes',
          pages: 5,
          detail: {
            title: 'Q1 Marketing Plan',
            modified: 'Last modified: Jan 12, 2024 10:24 AM',
            owner: 'Owner: Me',
            overview: 'Overview of the Q1 marketing strategy, key initiatives and expected outcomes.',
            keyPointsTitle: 'Key Points',
            keyPoints: [
              'Launch new campaign in February',
              'Increase brand awareness by 25%',
              'Focus on digital channels',
              'Align with sales team for lead generation',
            ],
            attachmentsTitle: 'Attachments (2)',
            attachments: [
              { kind: 'PDF', tone: 'amber', name: 'Campaign Brief.pdf', size: '2.4 MB' },
              { kind: 'PPT', tone: 'amber', name: 'Q1 Strategy Deck.pptx', size: '12.8 MB' },
            ],
          },
        },
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
        badge: 'Collaboration & Productivity',
        heading: 'Dashboard',
        description: 'Your workspace at a glance. Stay organized, connected and productive.',
        bullets: ['Real-time metrics', 'Custom reports', 'Data visualization'],
        image: '/worldposta-assets/hero/posta/suite-light-1680.png',
        imageAlt: 'Analytics dashboard interface',
        layout: 'wide',
        headerAction: 'Mon, Jan 22, 2024',
        headerActionIcon: faCalendarDays,
        stats: [
          { icon: faEnvelope, label: 'Unread Emails', value: '12', delta: '20%', tone: 'sky', trend: [6, 7, 8, 8, 9, 10, 11, 12] },
          { icon: faMessage, label: 'Open Chats', value: '8', delta: '14%', tone: 'green', trend: [4, 5, 5, 6, 6, 7, 7, 8] },
          { icon: faCalendarDays, label: 'Upcoming Meetings', value: '5', delta: '25%', tone: 'purple', trend: [2, 2, 3, 3, 4, 4, 5, 5] },
          { icon: faFileLines, label: 'Recent Files', value: '24', delta: '33%', tone: 'amber', trend: [12, 14, 16, 17, 19, 21, 22, 24] },
        ],
        cards: [
          {
            title: 'Today\u2019s Schedule',
            link: 'View Calendar',
            items: [
              { icon: faVideo, tone: 'blue', title: 'Marketing Sync', subtitle: 'Microsoft Teams', meta: '10:00 AM' },
              { icon: faPeopleGroup, tone: 'green', title: 'Product Review', subtitle: 'Meeting Room 2', meta: '12:00 PM' },
              { icon: faVideo, tone: 'blue', title: 'Client Presentation', subtitle: 'Zoom', meta: '3:00 PM' },
              { icon: faMessage, tone: 'purple', title: 'Team Check-in', subtitle: 'Team Chat', meta: '5:00 PM' },
            ],
          },
          {
            title: 'Recent Files',
            link: 'View all',
            items: [
              { icon: faFilePowerpoint, tone: 'amber', title: 'Q1 Strategy Deck.pptx', subtitle: 'Modified 2 hours ago' },
              { icon: faFileWord, tone: 'blue', title: 'Marketing Plan 2024.docx', subtitle: 'Modified 4 hours ago' },
              { icon: faFileExcel, tone: 'green', title: 'Budget Tracker.xlsx', subtitle: 'Modified 1 day ago' },
              { icon: faFilePdf, tone: 'amber', title: 'Client Brief.pdf', subtitle: 'Modified 1 day ago' },
              { icon: faFolderOpen, tone: 'grey', title: 'Campaign Assets.zip', subtitle: 'Modified 2 days ago' },
            ],
          },
          {
            title: 'Team Activity',
            link: 'View all',
            items: [
              { initials: 'SA', tone: 'blue', title: 'Sara Ali', subtitle: 'updated Marketing Plan 2024.docx', note: '2 hours ago' },
              { initials: 'AH', tone: 'green', title: 'Ahmed Hassan', subtitle: 'shared a folder with the team', note: '4 hours ago' },
              { initials: 'MK', tone: 'purple', title: 'Mona Khaled', subtitle: 'added a comment on Client Brief.pdf', note: '6 hours ago' },
              { initials: 'OA', tone: 'amber', title: 'Omar Adel', subtitle: 'created a new note', note: '1 day ago' },
              { initials: 'NI', tone: 'blue', title: 'Nour Ibrahim', subtitle: 'uploaded Campaign Assets.zip', note: '1 day ago' },
            ],
          },
          {
            title: 'Storage Usage',
            link: 'View details',
            donut: {
              total: '680 GB',
              caption: 'of 1 TB',
              slices: [
                { label: 'Documents', value: 260, display: '260 GB', tone: 'blue' },
                { label: 'Images', value: 180, display: '180 GB', tone: 'green' },
                { label: 'Videos', value: 120, display: '120 GB', tone: 'purple' },
                { label: 'Other', value: 120, display: '120 GB', tone: 'grey' },
              ],
            },
          },
          {
            title: 'Active Users',
            link: 'View all',
            people: {
              figure: '48',
              delta: '14%',
              caption: 'out of 60 licensed users',
              avatars: ['SA', 'AH', 'MK', 'OA', 'NI'],
              more: '+43',
            },
          },
          {
            title: 'Quick Actions',
            actions: [
              { icon: faEnvelope, tone: 'blue', label: 'Compose Email' },
              { icon: faMessage, tone: 'green', label: 'Start a Chat' },
              { icon: faVideo, tone: 'purple', label: 'Schedule Meeting' },
              { icon: faCloudArrowUp, tone: 'amber', label: 'Upload File' },
            ],
          },
        ],
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
        badge: 'Management',
        heading: 'IAM & Access Management',
        description: 'Control access, secure your resources, and empower your teams.',
        bullets: ['Fine-grained permissions', 'Multi-factor auth', 'Audit logs'],
        image: '/worldposta-assets/hero/cloudedge/dashboard.png',
        imageAlt: 'IAM and access control dashboard',
        layout: 'wide',
        headerAction: 'Add User',
        cards: [
          {
            title: 'User Distribution by Role',
            donut: {
              total: '248',
              caption: 'Users',
              slices: [
                { label: 'Administrators', value: 12, display: '12 (5%)', tone: 'blue' },
                { label: 'Managers', value: 38, display: '38 (15%)', tone: 'green' },
                { label: 'Standard Users', value: 168, display: '168 (68%)', tone: 'purple' },
                { label: 'Guests', value: 30, display: '30 (12%)', tone: 'amber' },
              ],
            },
          },
          {
            title: 'Access Requests',
            link: 'View all',
            items: [
              { icon: faUser, tone: 'blue', title: 'New user invitation', subtitle: 'Nour Ibrahim · 2 hours ago', badge: { label: 'Pending', tone: 'warning' } },
              { icon: faFolderOpen, tone: 'amber', title: 'Access to Project Folder', subtitle: 'Ahmed Hassan · 4 hours ago', badge: { label: 'Approved', tone: 'good' } },
              { icon: faShieldHalved, tone: 'purple', title: 'Admin role request', subtitle: 'Sara Ali · 1 day ago', badge: { label: 'Pending', tone: 'warning' } },
              { icon: faDatabase, tone: 'green', title: 'Access to Production', subtitle: 'Omar Adel · 1 day ago', badge: { label: 'Denied', tone: 'critical' } },
            ],
          },
          {
            title: 'Security & Compliance',
            items: [
              { icon: faLock, tone: 'blue', title: 'Multi-Factor Authentication', meta: 'Enabled' },
              { icon: faKey, tone: 'green', title: 'Single Sign-On (SSO)', meta: 'Enabled' },
              { icon: faFileLines, tone: 'purple', title: 'Access Policies', meta: 'Active' },
              { icon: faChartColumn, tone: 'amber', title: 'Audit Logs', meta: 'Enabled' },
            ],
          },
        ],
        console: {
          title: 'Users',
          total: 248,
          columns: ['Email', 'Role', 'Last Active'],
          statusAfter: 2,
          unitLabel: 'users',
          rowIcon: faUser,
          searchPlaceholder: 'Search users...',
          pages: 5,
          stats: [
            { icon: faPeopleGroup, label: 'Total Users', value: '248', delta: '12%', tone: 'sky', trend: [221, 225, 229, 233, 237, 241, 245, 248] },
            { icon: faShieldHalved, label: 'Active Users', value: '230', delta: '8%', tone: 'amber', trend: [213, 215, 218, 220, 223, 225, 228, 230] },
            { icon: faEnvelope, label: 'Pending Invitations', value: '18', delta: '25%', deltaDirection: 'down', tone: 'green', trend: [24, 23, 22, 21, 20, 19, 18, 18] },
            { icon: faKey, label: 'Roles & Permissions', value: '12', delta: '20%', tone: 'purple', trend: [10, 10, 11, 11, 11, 12, 12, 12] },
          ],
          rows: [
            { name: 'Sara Ali', initials: 'SA', status: { label: 'Active', tone: 'good' }, cells: ['sara.ali@worldposta.com', 'Administrator', 'Today, 10:24 AM'] },
            { name: 'Ahmed Hassan', initials: 'AH', status: { label: 'Active', tone: 'good' }, cells: ['ahmed.hassan@worldposta.com', 'Manager', 'Today, 09:12 AM'] },
            { name: 'Mona Khaled', initials: 'MK', status: { label: 'Active', tone: 'good' }, cells: ['mona.khaled@worldposta.com', 'Standard User', 'Yesterday, 04:30 PM'] },
            { name: 'Omar Adel', initials: 'OA', status: { label: 'Inactive', tone: 'warning' }, cells: ['omar.adel@worldposta.com', 'Standard User', 'Jan 20, 2024'] },
            { name: 'Nour Ibrahim', initials: 'NI', status: { label: 'Active', tone: 'good' }, cells: ['nour.ibrahim@worldposta.com', 'Guest', 'Today, 11:05 AM'] },
          ],
        },
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
        badge: 'Management',
        heading: 'Team Management',
        description:
          'Build, organize and empower your team. Manage members, roles and collaboration settings all in one place.',
        bullets: ['Team hierarchy', 'Bulk operations', 'Activity reports'],
        image: '/worldposta-assets/hero/cloudedge/dashboard.png',
        imageAlt: 'Team management dashboard',
        layout: 'wide',
        headerAction: 'Invite Member',
        cards: [
          {
            title: 'Teams',
            link: 'View all',
            items: [
              { icon: faPeopleGroup, tone: 'purple', title: 'Marketing', meta: '12 members' },
              { icon: faPeopleGroup, tone: 'green', title: 'Sales', meta: '9 members' },
              { icon: faPeopleGroup, tone: 'blue', title: 'Product', meta: '8 members' },
              { icon: faPeopleGroup, tone: 'purple', title: 'IT', meta: '6 members' },
              { icon: faPeopleGroup, tone: 'amber', title: 'Finance', meta: '5 members' },
              { icon: faPeopleGroup, tone: 'green', title: 'HR', meta: '4 members' },
              { icon: faPeopleGroup, tone: 'grey', title: 'Operations', meta: '4 members' },
              { icon: faPeopleGroup, tone: 'blue', title: 'Management', meta: '3 members' },
            ],
          },
          {
            title: 'Role Distribution',
            donut: {
              total: '48',
              caption: 'Members',
              slices: [
                { label: 'Administrators', value: 6, display: '6 (13%)', tone: 'blue' },
                { label: 'Managers', value: 10, display: '10 (21%)', tone: 'green' },
                { label: 'Standard Users', value: 28, display: '28 (58%)', tone: 'purple' },
                { label: 'Guests', value: 4, display: '4 (8%)', tone: 'amber' },
              ],
            },
          },
          {
            title: 'Recent Activity',
            link: 'View all',
            items: [
              { icon: faUser, tone: 'blue', title: 'Sara Ali joined the Marketing team', subtitle: '2 hours ago' },
              { icon: faArrowUp, tone: 'green', title: 'Ahmed Hassan was promoted to Manager', subtitle: '4 hours ago' },
              { icon: faPeopleGroup, tone: 'purple', title: 'Mona Khaled joined the Product team', subtitle: '1 day ago' },
              { icon: faEnvelope, tone: 'amber', title: 'Omar Adel invited a new member', subtitle: '1 day ago' },
              { icon: faGears, tone: 'grey', title: 'Nour Ibrahim updated team settings', subtitle: '2 days ago' },
            ],
          },
        ],
        console: {
          title: 'Team Members',
          total: 48,
          columns: ['Email', 'Team', 'Role', 'Last Active'],
          statusAfter: 3,
          unitLabel: 'members',
          rowIcon: faUser,
          // The mockup's table header carries All Teams / All Roles filters
          // rather than a create action.
          searchPlaceholder: 'Search members, teams or roles...',
          pages: 5,
          stats: [
            { icon: faPeopleGroup, label: 'Total Members', value: '48', delta: '12%', tone: 'sky', trend: [43, 44, 44, 45, 46, 47, 47, 48] },
            { icon: faUser, label: 'Active Members', value: '42', delta: '8%', tone: 'amber', trend: [39, 39, 40, 40, 41, 41, 42, 42] },
            // No rise and no fall - a flat delta rather than an asserted one.
            { icon: faEnvelope, label: 'Pending Invitations', value: '6', delta: '0%', deltaDirection: 'flat', tone: 'green', trend: [6, 6, 6, 6, 6, 6, 6, 6] },
            { icon: faChartColumn, label: 'Teams', value: '8', delta: '33%', tone: 'purple', trend: [6, 6, 7, 7, 7, 8, 8, 8] },
          ],
          rows: [
            { name: 'Sara Ali', initials: 'SA', status: { label: 'Active', tone: 'good' }, cells: ['sara.ali@worldposta.com', 'Marketing', 'Manager', 'Today, 10:24 AM'] },
            { name: 'Ahmed Hassan', initials: 'AH', status: { label: 'Active', tone: 'good' }, cells: ['ahmed.hassan@worldposta.com', 'Sales', 'Standard User', 'Today, 09:12 AM'] },
            { name: 'Mona Khaled', initials: 'MK', status: { label: 'Active', tone: 'good' }, cells: ['mona.khaled@worldposta.com', 'Product', 'Standard User', 'Yesterday, 04:30 PM'] },
            { name: 'Omar Adel', initials: 'OA', status: { label: 'Active', tone: 'good' }, cells: ['omar.adel@worldposta.com', 'IT', 'Administrator', 'Jan 20, 2024'] },
            { name: 'Nour Ibrahim', initials: 'NI', status: { label: 'Inactive', tone: 'warning' }, cells: ['nour.ibrahim@worldposta.com', 'HR', 'Standard User', 'Jan 18, 2024'] },
          ],
        },
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
    // Picking a service is the end of the errand: fold the list away so the
    // panel it just changed is what you are looking at.
    this.pickerOpen.set(false);
  }

  protected togglePicker(): void {
    this.pickerOpen.update((open) => !open);
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
