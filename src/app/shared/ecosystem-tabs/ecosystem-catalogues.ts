/**
 * The tab sets the ecosystem section can show. Home shows the whole
 * WorldPosta catalogue; product pages show their own slice of it, in the
 * same layout, so a service reads the same wherever it appears.
 */
import { faClipboardList, faCloud, faEnvelope, faGear, faGlobe, faInbox, faListCheck, faShieldHalved, faUserGroup, faUsersViewfinder } from '@fortawesome/free-solid-svg-icons';
import { ECOSYSTEM_SCREENS, type EcosystemScreen } from './ecosystem-screens';
import type { DemoKey } from './demos/demo-registry';
import { TAB_CONTENT, TAB_GROUPS, type TabContent, type TabGroup } from './ecosystem-tabs.data';

/** A tab whose preview is a working app rather than a capture: a registered demo, or the Posta Link meeting window. */
export type LiveDemo = DemoKey | 'meeting';

export interface EcosystemCatalogue {
  readonly groups: readonly TabGroup[];
  readonly content: Readonly<Record<string, TabContent>>;
  readonly screens: Readonly<Record<string, EcosystemScreen>>;
  readonly live: Readonly<Partial<Record<string, LiveDemo>>>;
}

const LIVE: EcosystemCatalogue['live'] = {
  'cloud-infrastructure': 'cloudedgeDashboard',
  monitoring: 'cloudedgeDashboard',
  'virtual-machines': 'vms',
  storage: 'cloudedgeStorage',
  networking: 'networking',
  security: 'firewall',
  'backup-dr': 'backup',
  automation: 'tasks',
  kubernetes: 'cloudedgeKubernetes',
  'business-email': 'webmail',
  calendar: 'calendar',
  'drive-files': 'drive',
  'team-chat': 'linkChat',
  notes: 'linkNotes',
  dashboard: 'workspaceDashboard',
  'cost-management': 'billing',
  'iam-access': 'iam',
  'team-management': 'team',
  conferencing: 'meeting',
};

const group = (id: string): TabGroup => {
  const hit = TAB_GROUPS.find((g) => g.id === id);
  if (!hit) throw new Error(`Unknown ecosystem group: ${id}`);
  return hit;
};

const item = (id: string) => {
  for (const g of TAB_GROUPS) {
    const hit = g.items.find((i) => i.id === id);
    if (hit) return hit;
  }
  throw new Error(`Unknown ecosystem tab: ${id}`);
};

/** Home: every service, grouped as the sidebar presents it. */
export const HOME_CATALOGUE: EcosystemCatalogue = {
  groups: TAB_GROUPS,
  content: TAB_CONTENT,
  screens: ECOSYSTEM_SCREENS,
  live: LIVE,
};

/** CloudEdge: the cloud services and the management tools that run them. */
export const CLOUDEDGE_CATALOGUE: EcosystemCatalogue = {
  ...HOME_CATALOGUE,
  groups: [group('cloud-infrastructure'), group('management')],
};

/**
 * Posta's Business Email tab carries the copy of the Posta page's former
 * console panel. Its screen is home's: the Email Admin Suite mailboxes list.
 */
const POSTA_EMAIL: TabContent = {
  ...TAB_CONTENT['business-email'],
  badge: 'Email Admin Suite',
  heading: 'Mailboxes',
  description: 'Manage mailboxes, domains and policies from one console.',
  bullets: [
    'Custom domain email (you@yourcompany.com)',
    'Advanced security and anti-spam protection',
    'Access from anywhere, on any device',
  ],
  cta: 'Create Your Business Email',
  benefits: [
    { icon: faEnvelope, title: 'Custom Domain Email', description: 'you@yourcompany.com, fully configured in minutes.' },
    { icon: faShieldHalved, title: 'Advanced Security', description: 'Anti-spam and anti-malware protection built in.' },
    { icon: faCloud, title: 'Access Anywhere', description: 'Webmail, mobile and desktop clients, always in sync.' },
    { icon: faGear, title: 'Full Admin Control', description: 'Manage mailboxes, domains and policies from one console.' },
  ],
};

/** Email Admin Suite pages beyond Mailboxes. Each tab runs the suite's real page on demo data. */
const adminTab = (heading: string, description: string, bullets: readonly string[]): TabContent => ({
  badge: 'Email Admin Suite',
  heading,
  description,
  bullets,
  cta: 'Create Your Business Email',
  benefits: POSTA_EMAIL.benefits,
});

const EMAIL_ADMIN_CONTENT: Readonly<Record<string, TabContent>> = {
  webmail: {
    ...TAB_CONTENT['business-email'],
    badge: 'Posta · Email Services',
    heading: 'Webmail',
    cta: 'Create Your Business Email',
    benefits: POSTA_EMAIL.benefits,
  },
  'email-domains': adminTab('Organizations & Domains', 'Add your domains, verify them and keep their DNS healthy.', [
    'Verify a domain with one TXT record',
    'MX, SPF, DKIM and DMARC checks',
    'Organize domains by organization',
  ]),
  'email-distribution-lists': adminTab('Distribution Lists', 'One address that reaches a whole team.', [
    'Add members from your mailboxes',
    'Set a manager for each list',
    'Hide lists from the address book',
  ]),
  'email-rules': adminTab('Rules', 'Decide what happens to mail before it reaches an inbox.', [
    'Conditions, actions and exceptions',
    'Apply rules to people, groups or domains',
    'Turn rules on and off at any time',
  ]),
  'email-smtp-logs': adminTab('SMTP Logs', 'See every message your domains sent and received.', [
    'Filter by sender, recipient and status',
    'Release quarantined mail',
    'Block senders in one click',
  ]),
};

/** Posta: the inbox, its Email Admin Suite, then the collaboration apps that come with it. */
export const POSTA_CATALOGUE: EcosystemCatalogue = {
  groups: [
    { id: 'email', label: 'Business Email', items: [{ id: 'webmail', label: 'Webmail', icon: faInbox }] },
    {
      id: 'email-admin',
      label: 'Email Admin Suite',
      items: [
        { id: 'business-email', label: 'Mailboxes', icon: faUsersViewfinder },
        { id: 'email-domains', label: 'Organizations & Domains', icon: faGlobe },
        { id: 'email-distribution-lists', label: 'Distribution Lists', icon: faUserGroup },
        { id: 'email-rules', label: 'Rules', icon: faListCheck },
        { id: 'email-smtp-logs', label: 'SMTP Logs', icon: faClipboardList },
      ],
    },
    {
      id: 'collaboration',
      label: 'Collaboration',
      items: [item('calendar'), item('drive-files'), item('team-chat'), item('conferencing')],
    },
  ],
  content: { ...TAB_CONTENT, 'business-email': POSTA_EMAIL, ...EMAIL_ADMIN_CONTENT },
  screens: ECOSYSTEM_SCREENS,
  live: {
    ...LIVE,
    webmail: 'webmail',
    'business-email': 'mailboxes',
    'email-domains': 'emailDomains',
    'email-distribution-lists': 'emailDistributionLists',
    'email-rules': 'emailRules',
    'email-smtp-logs': 'emailSmtpLogs',
  },
};
