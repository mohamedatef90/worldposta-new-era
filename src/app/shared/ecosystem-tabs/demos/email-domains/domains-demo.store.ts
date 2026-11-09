import { Service, signal } from '@angular/core';

/**
 * Email Admin Suite organizations and their domains, ported from the unified
 * sign-in app's OrgsAndDomainsPage and its demo organizations
 * (user-types-of-worldposta-unified-sign-in). State lives for the visit;
 * nothing leaves the browser and no DNS lookup is made.
 */
export type DomainHealth = 'healthy' | 'warning' | 'unhealthy';
export type DnsSection = 'mx' | 'spf' | 'dkim' | 'dmarc';
export type RecordStatus = 'success' | 'warning' | 'error' | 'pending';

export interface DomainInfo {
  readonly id: string;
  readonly domainName: string;
  readonly creationDate: string;
  readonly subDomainCount: number;
  readonly healthStatus: DomainHealth;
  /** DNS sections the admin has verified since the domain was added. */
  readonly verified: Readonly<Record<DnsSection, boolean>>;
}

export interface Organization {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly primaryDomain: string;
  readonly domains: readonly DomainInfo[];
}

export interface DnsRecord {
  readonly host: string;
  readonly type: string;
  readonly value: string;
  readonly ttl?: string;
  readonly priority?: number;
  /** Position across all sections; the suite uses it to vary a warning domain's record states. */
  readonly index: number;
}

export interface DnsSectionInfo {
  readonly id: DnsSection;
  readonly title: string;
  readonly records: readonly DnsRecord[];
}

/** The records WorldPosta asks every domain to publish, as the DNS Configuration view lists them. */
export const DNS_SECTIONS: readonly DnsSectionInfo[] = [
  {
    id: 'mx', title: 'Configure MX Records: Essential for receiving emails',
    records: [1, 2, 3, 4].map((n, i) => ({ host: 'Blank or @', type: 'MX', ttl: '3600', priority: 5, value: `wp-secure-cloudmail0${n}.worldposta.com`, index: i })),
  },
  { id: 'spf', title: 'Configure SPF Record: Prevents others from spoofing your domain', records: [{ host: '@', type: 'TXT', value: 'v=spf1 mx include:_spf.worldposta.com -all', index: 4 }] },
  { id: 'dkim', title: 'Configure DKIM Record: Cryptographic signing for outbound mail', records: [{ host: 'worldposta._domainkey', type: 'CNAME', value: 'dkim.worldposta.com', index: 5 }] },
  { id: 'dmarc', title: 'Configure DMARC Record: Instructions for receiving servers', records: [{ host: '_dmarc', type: 'TXT', value: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@worldposta.com', index: 6 }] },
];

const NONE_VERIFIED: Record<DnsSection, boolean> = { mx: false, spf: false, dkim: false, dmarc: false };
const ALL_VERIFIED: Record<DnsSection, boolean> = { mx: true, spf: true, dkim: true, dmarc: true };

const domain = (id: string, domainName: string, creationDate: string, subDomainCount: number, healthStatus: DomainHealth): DomainInfo => ({
  id, domainName, creationDate, subDomainCount, healthStatus, verified: healthStatus === 'healthy' ? ALL_VERIFIED : NONE_VERIFIED,
});

const DEMO_ORGS: readonly Organization[] = [
  {
    id: '1', name: 'Alpha Solutions Group', description: 'Primary business entity for Alpha Solutions operations.', primaryDomain: 'alphasolutions.info',
    domains: [
      domain('d1', 'alphasolutions.info', 'Jan 12, 2018', 2, 'healthy'),
      domain('d2', 'core-tech.test', 'Nov 18, 2019', 0, 'healthy'),
      domain('d3', 'pharmagen.com', 'Jul 29, 2021', 1, 'healthy'),
      domain('d4', 'staging-env.io', 'Sep 9, 2021', 0, 'warning'),
      domain('d5', 'rwanda-ops.net', 'Jun 29, 2022', 0, 'healthy'),
      domain('d6', 'nour-logistics.net', 'Jun 29, 2022', 0, 'healthy'),
      domain('d7', 'hds-global.com', 'Oct 17, 2022', 0, 'healthy'),
      domain('d8', 'ed-holdings.co', 'Dec 11, 2022', 0, 'unhealthy'),
    ],
  },
  { id: '2', name: 'Beta Innovations', description: 'Research and development division focusing on next-gen cloud tech.', primaryDomain: 'betainnovations.com', domains: [domain('d9', 'betainnovations.com', 'Mar 15, 2023', 0, 'healthy')] },
  { id: '3', name: 'Tooli Global', description: 'Logistics and supply chain management services.', primaryDomain: 'tooliglobal.net', domains: [] },
  { id: '4', name: 'MyTest Enterprise', description: 'QA and Testing organization for internal benchmarks.', primaryDomain: 'mytest-qa.io', domains: [] },
];

/** A record's state: verified sections pass, an unhealthy domain fails, a warning domain is mixed, as in the suite. */
export function recordStatus(d: DomainInfo, section: DnsSection, index: number): RecordStatus {
  if (d.healthStatus === 'healthy' || d.verified[section]) return 'success';
  if (d.healthStatus === 'unhealthy') return 'error';
  return index % 2 === 0 ? 'success' : 'warning';
}

@Service()
export class DomainsDemoStore {
  private readonly state = signal<Organization[]>(structuredClone(DEMO_ORGS) as Organization[]);
  readonly organizations = this.state.asReadonly();
  /** The organization picked in the list; kept here so it survives tab switches. */
  readonly activeOrgId = signal<string | null>('1');
  private seq = 0;

  /** Adds the domain to the organization of that name, creating the organization if it is new. */
  addDomain(organizationName: string, domainName: string, healthy: boolean): Organization {
    const created = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newDomain = domain(`d-new-${++this.seq}`, domainName, created, 0, healthy ? 'healthy' : 'warning');
    const existing = this.state().find((o) => o.name.toLowerCase() === organizationName.toLowerCase());
    const org: Organization = existing
      ? { ...existing, primaryDomain: existing.primaryDomain || domainName, domains: [...existing.domains, newDomain] }
      : { id: `org-new-${++this.seq}`, name: organizationName, description: '', primaryDomain: domainName, domains: [newDomain] };
    this.state.update((list) => (existing ? list.map((o) => (o.id === org.id ? org : o)) : [...list, org]));
    this.activeOrgId.set(org.id);
    return org;
  }

  deleteDomain(orgId: string, domainId: string): void {
    this.mapOrg(orgId, (o) => {
      const domains = o.domains.filter((d) => d.id !== domainId);
      const primaryGone = !domains.some((d) => d.domainName === o.primaryDomain) && o.domains.some((d) => d.domainName === o.primaryDomain);
      return { ...o, domains, primaryDomain: primaryGone ? (domains[0]?.domainName ?? '') : o.primaryDomain };
    });
  }

  setPrimary(orgId: string, domainName: string): void {
    this.mapOrg(orgId, (o) => ({ ...o, primaryDomain: domainName }));
  }

  /** Marks DNS sections as verified; once all four pass, the domain reads HEALTH OK. */
  verify(domainId: string, sections: readonly DnsSection[]): DomainInfo | null {
    let result: DomainInfo | null = null;
    this.state.update((list) =>
      list.map((o) => ({
        ...o,
        domains: o.domains.map((d) => {
          if (d.id !== domainId) return d;
          const verified = { ...d.verified };
          for (const s of sections) verified[s] = true;
          const allPass = Object.values(verified).every(Boolean);
          result = { ...d, verified, healthStatus: allPass ? 'healthy' : d.healthStatus };
          return result;
        }),
      })),
    );
    return result;
  }

  updateOrg(orgId: string, name: string, description: string): void {
    this.mapOrg(orgId, (o) => ({ ...o, name, description }));
  }

  deleteOrg(orgId: string): void {
    this.state.update((list) => list.filter((o) => o.id !== orgId));
    if (this.activeOrgId() === orgId) this.activeOrgId.set(this.state()[0]?.id ?? null);
  }

  private mapOrg(orgId: string, change: (o: Organization) => Organization): void {
    this.state.update((list) => list.map((o) => (o.id === orgId ? change(o) : o)));
  }
}
