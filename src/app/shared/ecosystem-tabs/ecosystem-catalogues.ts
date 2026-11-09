/**
 * The tab sets the ecosystem section can show. Home shows the whole
 * WorldPosta catalogue; product pages show their own slice of it, in the
 * same layout, so a service reads the same wherever it appears.
 */
import { faCloud, faEnvelope, faGear, faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { ECOSYSTEM_SCREENS, type EcosystemScreen } from './ecosystem-screens';
import { TAB_CONTENT, TAB_GROUPS, type TabContent, type TabGroup } from './ecosystem-tabs.data';

/** A tab whose preview is a working app rather than a capture. */
export type LiveDemo = 'vm' | 'billing' | 'meeting';

export interface EcosystemCatalogue {
  readonly groups: readonly TabGroup[];
  readonly content: Readonly<Record<string, TabContent>>;
  readonly screens: Readonly<Record<string, EcosystemScreen>>;
  readonly live: Readonly<Partial<Record<string, LiveDemo>>>;
}

const LIVE: EcosystemCatalogue['live'] = {
  'virtual-machines': 'vm',
  'cost-management': 'billing',
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
  heading: 'Business Email',
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

/** Posta: business email first, then the collaboration apps that come with it. */
export const POSTA_CATALOGUE: EcosystemCatalogue = {
  groups: [
    {
      id: 'email',
      label: 'Business Email',
      items: [item('business-email')],
    },
    {
      id: 'collaboration',
      label: 'Collaboration',
      items: [item('calendar'), item('drive-files'), item('team-chat'), item('conferencing')],
    },
  ],
  content: { ...TAB_CONTENT, 'business-email': POSTA_EMAIL },
  screens: ECOSYSTEM_SCREENS,
  live: LIVE,
};
