/**
 * Content for the home page ecosystem tabs: the service catalogue and each
 * service's panel. Pure data, kept apart from the component's behaviour.
 */
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faLinux, faUbuntu, faWindows } from '@fortawesome/free-brands-svg-icons';
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
  faArrowUp,
  faBan,
  faBell,
  faBucket,
  faChartColumn,
  faChartPie,
  faCircleCheck,
  faClock,
  faDesktop,
  faDollarSign,
  faFileExcel,
  faFilePdf,
  faFilePowerpoint,
  faFileWord,
  faHardDrive,
  faKey,
  faLock,
  faMemory,
  faMicrochip,
  faRightLeft,
  faRoute,
  faShareNodes,
  faSitemap,
  faStar,
  faTrash,
  faUser,
  faWaveSquare,
  faCamera,
  faCircleXmark,
  faFileShield,
  faFingerprint,
  faFloppyDisk,
  faHourglassHalf,
  faLocationDot,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import type { PanelCard } from './panel-cards/panel-cards.component';
import type { NotesView } from './notes-panel/notes-panel.component';

export interface TabItem {
  readonly id: string;
  readonly label: string;
  readonly icon: IconDefinition;
}

export interface TabGroup {
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
export interface ConsoleStat {
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
export type StatusTone = 'good' | 'warning' | 'critical';

export interface ConsoleRow {
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
export interface ConsoleView {
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
  /*
   * The CloudEdge views mirror real console screens (see the cloudedge repo in
   * CLAUDE.md), so they can carry the page furniture those screens have.
   */
  /** The page's one-line description, shown under the title instead of the count. */
  readonly subtitle?: string;
  /** Secondary actions beside the create button, e.g. Marketplace, Export. */
  readonly toolbar?: readonly string[];
  /** Sub-tabs above the list; the first is the current one. */
  readonly views?: readonly string[];
  readonly capacity?: ConsoleCapacity;
  /** Card view instead of the table, as the real Virtual Machines page opens. */
  readonly cards?: readonly ConsoleCard[];
}

/** Provisioned versus total storage, as the real Storage page's overview bar. */
export interface ConsoleCapacity {
  readonly used: string;
  readonly total: string;
  readonly percent: number;
}

/** A label and value on a console card, e.g. "Cores · 4" or "IP Address · 192.168.1.10". */
export interface ConsoleFact {
  readonly label: string;
  readonly value: string;
}

/** One VM in the real console's card view. */
export interface ConsoleCard {
  readonly name: string;
  /** OS mark: Ubuntu, Windows or Linux. */
  readonly icon: IconDefinition;
  readonly status: { readonly label: string; readonly tone: StatusTone };
  /** Cores, Memory, Storage, NICs. */
  readonly specs: readonly ConsoleFact[];
  /** IP Address, Reservation, Created. */
  readonly meta: readonly ConsoleFact[];
}

/** Accent for a calendar entry. Decoration only - the label and time carry it. */
export type EventTone = 'blue' | 'green' | 'purple' | 'amber';

/** An event sitting in a day cell of the month grid. */
export interface CalendarEvent {
  /** Day of the displayed month. */
  readonly day: number;
  readonly label: string;
  readonly time: string;
  readonly tone: EventTone;
}

export interface AgendaEntry {
  readonly label: string;
  /** Full span, e.g. "10:00 AM - 11:00 AM". */
  readonly time: string;
  readonly tone: EventTone;
  /** Renders the Join affordance, as the live meeting does. */
  readonly join?: boolean;
}

export interface AgendaDay {
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
export interface CalendarView {
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

export interface TabContent {
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

/** The service catalogue, grouped the way the sidebar presents it. */
export const TAB_GROUPS: readonly TabGroup[] = [
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

/** Panel content per service, keyed by tab id. Built once at module load. */
export const TAB_CONTENT: Readonly<Record<string, TabContent>> = {
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
    // 800x450 the template declares — unlike dashboard.avif, which is 1520x684.
    image: '/worldposta-assets/hero/cloudedge/console-dashboard.avif',
    imageDark: '/worldposta-assets/hero/cloudedge/console-dashboard-dark.avif',
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
    image: '/worldposta-assets/hero/cloudedge/dashboard.avif',
    imageAlt: 'Virtual machines management interface',
    cta: 'Create VM',
    console: {
      // Mirrors the real CloudEdge console's Virtual Machines page (card view)
      // and its dashboard's usage tiles, with the console's own sample data.
      // Three of its VMs keep the preview to one row of cards.
      title: 'Virtual Machines',
      subtitle: 'Manage your virtual machines.',
      total: 18,
      columns: [],
      rowIcon: faServer,
      createLabel: 'Add VM',
      toolbar: ['Marketplace', 'Export', 'Filters', 'Recycle Bin'],
      views: ['Card View', 'Table View'],
      searchPlaceholder: 'Search virtual machines...',
      pages: 1,
      stats: [
        { icon: faMicrochip, label: 'CPU Cores (of 64)', value: '45', tone: 'sky', trend: [36, 38, 41, 39, 43, 42, 44, 45] },
        { icon: faMemory, label: 'Memory (of 256 GB)', value: '182 GB', tone: 'amber', trend: [150, 158, 163, 160, 171, 176, 179, 182] },
        { icon: faHardDrive, label: 'Storage (of 2,048 GB)', value: '1,456 GB', tone: 'green', trend: [1180, 1220, 1265, 1300, 1340, 1388, 1420, 1456] },
        { icon: faServer, label: 'Active VMs (of 18)', value: '12', tone: 'purple', trend: [9, 10, 10, 11, 11, 12, 11, 12] },
      ],
      rows: [],
      cards: [
        {
          name: 'prod-web-server-01',
          icon: faUbuntu,
          status: { label: 'Running', tone: 'good' },
          specs: [{ label: 'Cores', value: '4' }, { label: 'Memory', value: '8 GB' }, { label: 'Storage', value: '100 GB' }, { label: 'NICs', value: '2' }],
          meta: [{ label: 'IP Address', value: '192.168.1.10' }, { label: 'Reservation', value: 'Web-Tier-Reservation' }, { label: 'Created', value: '2023-05-10' }],
        },
        {
          name: 'sql-database-main',
          icon: faWindows,
          status: { label: 'Running', tone: 'good' },
          specs: [{ label: 'Cores', value: '8' }, { label: 'Memory', value: '32 GB' }, { label: 'Storage', value: '500 GB' }, { label: 'NICs', value: '1' }],
          meta: [{ label: 'IP Address', value: '192.168.1.15' }, { label: 'Reservation', value: 'DB-Tier-Reservation' }, { label: 'Created', value: '2023-03-22' }],
        },
        {
          name: 'dev-environment-centos',
          icon: faLinux,
          status: { label: 'Stopped', tone: 'critical' },
          specs: [{ label: 'Cores', value: '2' }, { label: 'Memory', value: '4 GB' }, { label: 'Storage', value: '50 GB' }, { label: 'NICs', value: '1' }],
          meta: [{ label: 'IP Address', value: '10.0.0.5' }, { label: 'Reservation', value: 'None' }, { label: 'Created', value: '2023-08-01' }],
        },
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
    image: '/worldposta-assets/hero/cloudedge/console-dashboard.avif',
    imageDark: '/worldposta-assets/hero/cloudedge/console-dashboard-dark.avif',
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
    image: '/worldposta-assets/hero/cloudedge/dashboard.avif',
    imageAlt: 'Cloud storage management interface',
    cta: 'Create Bucket',
    console: {
      // Mirrors the real console's Storage page: capacity overview, then the
      // Disks tab. Figures are the console's own sample disks (2,250 of 10,240 GB).
      title: 'Storage',
      subtitle: 'Manage your virtual disks, object storage, and snapshots.',
      total: 7,
      columns: ['Size', 'Type', 'Attached To', 'Disk #', 'Creation Date'],
      showStatus: false,
      unitLabel: 'disks',
      rowIcon: faHardDrive,
      createLabel: 'Create Disk',
      capacity: { used: '2,250 GB', total: '10 TB', percent: 22 },
      views: ['Disks', 'Object Storage', 'Snapshots'],
      searchPlaceholder: 'Search disks...',
      pages: 1,
      stats: [
        { icon: faHardDrive, label: 'Provisioned', value: '2,250 GB', tone: 'sky', trend: [1600, 1700, 1780, 1850, 1990, 2100, 2180, 2250] },
        { icon: faDatabase, label: 'Disks', value: '7', tone: 'amber', trend: [4, 4, 5, 5, 6, 6, 7, 7] },
        { icon: faBucket, label: 'Buckets', value: '3', tone: 'green', trend: [1, 1, 2, 2, 2, 3, 3, 3] },
        { icon: faCamera, label: 'Snapshots', value: '3', tone: 'purple', trend: [1, 2, 2, 2, 3, 2, 3, 3] },
      ],
      rows: [
        { name: 'prod-web-server-os', cells: ['100 GB', 'High-Performance SSD', 'prod-web-server-01', '0', '2023-05-10'] },
        { name: 'prod-web-server-data', cells: ['250 GB', 'Standard SSD', 'prod-web-server-01', '1', '2023-11-15'] },
        { name: 'sql-database-data', cells: ['500 GB', 'High-Performance SSD', 'sql-database-main', '0', '2023-03-22'] },
        { name: 'k8s-worker-storage', cells: ['200 GB', 'Standard SSD', 'k8s-worker-node-a', '0', '2023-09-15'] },
        { name: 'archived-logs-q3', cells: ['1,000 GB', 'Archive HDD', 'Unattached', 'N/A', '2023-10-01'] },
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
    image: '/worldposta-assets/hero/cloudedge/dashboard.avif',
    imageAlt: 'Network topology and configuration dashboard',
    cta: 'Create Network',
    console: {
      // Mirrors the real console's NATs page; the tiles count its Network
      // section (Gateways, NATs, Reserved IP) from the console's sample data.
      title: 'NATs',
      subtitle: 'Manage your Network Address Translation rules here.',
      total: 4,
      columns: ['Action Type', 'Source', 'Destination', 'Translated', 'Service'],
      statusAfter: 5,
      unitLabel: 'rules',
      rowIcon: faRightLeft,
      createLabel: 'Add NAT Rule',
      searchPlaceholder: 'Search NAT rules...',
      pages: 1,
      stats: [
        { icon: faNetworkWired, label: 'Gateways', value: '4', tone: 'sky', trend: [2, 2, 3, 3, 3, 4, 4, 4] },
        { icon: faRightLeft, label: 'NAT Rules', value: '4', tone: 'amber', trend: [1, 2, 2, 3, 3, 3, 4, 4] },
        { icon: faLocationDot, label: 'Reserved IPs', value: '4', tone: 'green', trend: [2, 2, 3, 3, 3, 4, 4, 4] },
        { icon: faRoute, label: 'Unattached IPs', value: '1', tone: 'purple', trend: [0, 1, 1, 0, 1, 1, 1, 1] },
      ],
      rows: [
        { name: 'Web-Server-Public-Access', status: { label: 'Enabled', tone: 'good' }, cells: ['DNAT', 'Any', '203.0.113.10', '192.168.1.10', 'HTTPS'] },
        { name: 'Outbound-Traffic-SNAT', status: { label: 'Enabled', tone: 'good' }, cells: ['SNAT', '192.168.1.0/24', 'Any', '203.0.113.1', 'Any'] },
        { name: 'No-SNAT-for-VPN', status: { label: 'Enabled', tone: 'good' }, cells: ['NO SNAT', '192.168.1.0/24', '10.10.0.0/16', 'N/A', 'Any'] },
        { name: 'Staging-Server-DNAT', status: { label: 'Disabled', tone: 'warning' }, cells: ['DNAT', 'Any', '203.0.113.11', '192.168.2.20:8080', 'HTTP'] },
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
    image: '/worldposta-assets/hero/cloudedge/security-hub.avif',
    imageAlt: 'Security dashboard with threat monitoring',
    console: {
      // Tiles are the real Security Hub's overview; the table is its Gateway
      // Firewall page, both with the console's own sample data.
      title: 'Gateway Firewall',
      subtitle: 'Manage gateway security policies and rules across your infrastructure.',
      total: 5,
      columns: ['Source', 'Destination', 'Applied To', 'Service', 'Action'],
      statusAfter: 5,
      unitLabel: 'rules',
      rowIcon: faShieldHalved,
      createLabel: 'Add Policy',
      searchPlaceholder: 'Search rules...',
      pages: 1,
      stats: [
        { icon: faBan, label: 'Threats Blocked (24h)', value: '1,428', tone: 'sky', trend: [620, 710, 690, 840, 900, 1010, 1190, 1428] },
        { icon: faFingerprint, label: 'Signatures Active', value: '12,540', tone: 'amber', trend: [11800, 11920, 12010, 12100, 12240, 12330, 12460, 12540] },
        { icon: faTriangleExclamation, label: 'Critical Alerts', value: '12', tone: 'green', trend: [18, 16, 17, 14, 15, 13, 12, 12] },
        { icon: faFileShield, label: 'Security Policies', value: '8', tone: 'purple', trend: [5, 5, 6, 6, 7, 7, 8, 8] },
      ],
      rows: [
        { name: 'Allow SSH to Jumpbox', status: { label: 'Enabled', tone: 'good' }, cells: ['Admin-IP-Set', 'Jumpbox-VM', 'Tier1-Gateway-01', 'SSH', 'Allow'] },
        { name: 'Drop Invalid States', status: { label: 'Enabled', tone: 'good' }, cells: ['Any', 'Any', 'Tier1-Gateway-01', 'Any', 'Drop'] },
        { name: 'Allow Web Inbound', status: { label: 'Enabled', tone: 'good' }, cells: ['Any', 'Web-VIP', 'Tier1-Gateway-01', 'HTTPS', 'Allow'] },
        { name: 'Allow App to DB Outbound', status: { label: 'Enabled', tone: 'good' }, cells: ['App-Subnet', 'DB-Subnet-CIDR', 'Tier1-Gateway-01', 'MySQL', 'Allow'] },
        { name: 'Deny All Other Outbound', status: { label: 'Disabled', tone: 'warning' }, cells: ['Any', 'Any', 'Tier1-Gateway-01', 'Any', 'Reject'] },
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
    image: '/worldposta-assets/hero/cloudedge/dashboard.avif',
    imageAlt: 'Backup and recovery management dashboard',
    cta: 'Create Backup',
    console: {
      // Mirrors the real console's Backup Jobs page and its sample jobs.
      title: 'Backup Jobs',
      subtitle: 'Manage and monitor your backup jobs.',
      total: 2,
      columns: ['Description', 'Is High Priority', 'Reservation'],
      showStatus: false,
      unitLabel: 'jobs',
      rowIcon: faFloppyDisk,
      createLabel: 'Create Job',
      views: ['Jobs', 'Restore Requests'],
      searchPlaceholder: 'Search jobs...',
      pages: 1,
      stats: [
        { icon: faFloppyDisk, label: 'Backup Jobs', value: '2', tone: 'sky', trend: [1, 1, 1, 2, 2, 2, 2, 2] },
        { icon: faCircleCheck, label: 'Enabled', value: '1', tone: 'amber', trend: [1, 1, 1, 1, 2, 1, 1, 1] },
        { icon: faStar, label: 'High Priority', value: '1', tone: 'green', trend: [0, 1, 1, 1, 1, 1, 1, 1] },
        { icon: faServer, label: 'Protected VMs', value: '3', tone: 'purple', trend: [1, 1, 2, 2, 2, 3, 3, 3] },
      ],
      rows: [
        { name: 'Nightly Database Backup', cells: ['Full backup of main database.', 'Yes', 'VDC1'] },
        { name: 'Weekly File Server Backup', cells: ['Incremental backup of user files.', 'No', 'VDC2'] },
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
    image: '/worldposta-assets/hero/cloudedge/dashboard.avif',
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
    image: '/worldposta-assets/hero/cloudedge/scheduled-tasks.avif',
    imageAlt: 'Automation and scheduling dashboard',
    cta: 'Create Automation',
    console: {
      // Mirrors the real console's Running Tasks page and its sample runs.
      title: 'Running Tasks',
      subtitle: 'Monitor all currently running and recently completed tasks.',
      total: 5,
      nameLabel: 'Task',
      columns: ['Target', 'Progress', 'Start Time', 'Initiated By'],
      statusAfter: 1,
      unitLabel: 'tasks',
      rowIcon: faClock,
      toolbar: ['Refresh'],
      searchPlaceholder: 'Search tasks...',
      pages: 1,
      stats: [
        { icon: faClock, label: 'Scheduled Tasks', value: '3', tone: 'sky', trend: [1, 1, 2, 2, 2, 3, 3, 3] },
        { icon: faHourglassHalf, label: 'Running', value: '1', tone: 'amber', trend: [0, 1, 0, 1, 2, 1, 1, 1] },
        { icon: faCircleCheck, label: 'Succeeded', value: '2', tone: 'green', trend: [0, 1, 1, 1, 2, 1, 2, 2] },
        { icon: faCircleXmark, label: 'Failed', value: '1', tone: 'purple', trend: [0, 0, 1, 0, 0, 1, 1, 1] },
      ],
      rows: [
        { name: 'Provision New VM', status: { label: 'Running', tone: 'warning' }, cells: ['k8s-worker-node-b', '75%', '2024-07-30 10:00 UTC', 'Admin'] },
        { name: 'Nightly VM Shutdown', status: { label: 'Success', tone: 'good' }, cells: ['All Dev VMs', '100%', '2024-07-30 02:00 UTC', 'Scheduler'] },
        { name: 'Apply Security Patch', status: { label: 'Failed', tone: 'critical' }, cells: ['prod-web-server-01', '30%', '2024-07-29 20:00 UTC', 'Admin'] },
        { name: 'Weekly DB Snapshot', status: { label: 'Success', tone: 'good' }, cells: ['sql-database-main', '100%', '2024-07-28 04:00 UTC', 'Scheduler'] },
        { name: 'Scale Out Web Tier', status: { label: 'Pending', tone: 'warning' }, cells: ['Web Server Group', '0%', '2024-07-30 10:05 UTC', 'Auto-scaler'] },
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
    image: '/worldposta-assets/hero/cloudedge/dashboard.avif',
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
    image: '/worldposta-assets/hero/posta/suite-light-1680.avif',
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
    image: '/worldposta-assets/hero/posta/suite-light-1680.avif',
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
    image: '/worldposta-assets/hero/posta/suite-light-1680.avif',
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
    image: '/worldposta-assets/hero/posta/suite-light-1680.avif',
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
    image: '/worldposta-assets/hero/posta/suite-light-1680.avif',
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
    image: '/worldposta-assets/hero/posta/suite-light-1680.avif',
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
    image: '/worldposta-assets/hero/posta/suite-light-1680.avif',
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
    image: '/worldposta-assets/hero/cloudedge/dashboard.avif',
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
    image: '/worldposta-assets/hero/cloudedge/dashboard.avif',
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
