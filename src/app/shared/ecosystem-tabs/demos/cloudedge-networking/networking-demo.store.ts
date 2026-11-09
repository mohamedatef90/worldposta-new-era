import { Service, signal } from '@angular/core';

/**
 * CloudEdge NAT rules and the gateways they translate for, ported from the
 * console's NatService and GatewayService mock data
 * (cloudedge/src/pages/nats, cloudedge/src/pages/gateways). State lives for
 * the visit; nothing leaves the browser.
 */
export type NatActionType = 'SNAT' | 'DNAT' | 'NO SNAT' | 'NO DNAT' | 'REFLEXIVE';
export type NatStatus = 'Enabled' | 'Disabled';

export interface NatRule {
  readonly id: string;
  readonly name: string;
  readonly reservation: string | null;
  readonly actionType: NatActionType;
  readonly source: string;
  readonly destination: string;
  readonly translated: string;
  readonly service: string;
  readonly description: string;
  readonly status: NatStatus;
  /** What the create/edit form was filled with, so Edit reopens it as saved. */
  readonly gateway: string;
  readonly elasticIp: string;
  readonly port: string;
}

export interface Gateway {
  readonly id: string;
  readonly name: string;
  readonly reservation: string | null;
  readonly subnet: string;
}

export interface NatForm {
  readonly name: string;
  readonly type: NatActionType;
  readonly gateway: string;
  readonly elasticIp: string;
  readonly port: string;
  readonly description: string;
}

export const GATEWAYS: readonly Gateway[] = [
  { id: 'gw-1', name: 'Primary-Edge-Gateway', reservation: 'Web-Tier-Reservation', subnet: '192.168.1.1/24' },
  { id: 'gw-2', name: 'Dev-Internal-Gateway', reservation: null, subnet: '10.0.0.1/24' },
  { id: 'gw-3', name: 'DMZ-Gateway', reservation: 'Security-Zone-Reservation', subnet: '172.16.0.1/24' },
  { id: 'gw-4', name: 'Backup-Site-Gateway', reservation: null, subnet: '192.168.100.1/24' },
];

export const ELASTIC_IPS = ['85.195.99.176', '102.55.23.1', '99.4.123.55'];

const MOCK_NAT_RULES: NatRule[] = [
  { id: 'nat-1', name: 'Web-Server-Public-Access', reservation: 'Web-Tier-Reservation', actionType: 'DNAT', source: 'Any', destination: '203.0.113.10', translated: '192.168.1.10', service: 'HTTPS', description: 'Allow public access to the main web server.', status: 'Enabled', gateway: 'Primary-Edge-Gateway', elasticIp: '85.195.99.176', port: '443' },
  { id: 'nat-2', name: 'Outbound-Traffic-SNAT', reservation: 'Web-Tier-Reservation', actionType: 'SNAT', source: '192.168.1.0/24', destination: 'Any', translated: '203.0.113.1', service: 'Any', description: 'Masquerade internal traffic for outbound connections.', status: 'Enabled', gateway: 'Primary-Edge-Gateway', elasticIp: '85.195.99.176', port: '' },
  { id: 'nat-3', name: 'No-SNAT-for-VPN', reservation: null, actionType: 'NO SNAT', source: '192.168.1.0/24', destination: '10.10.0.0/16', translated: 'N/A', service: 'Any', description: 'Prevent SNAT for traffic going to the corporate VPN.', status: 'Enabled', gateway: 'Dev-Internal-Gateway', elasticIp: '102.55.23.1', port: '' },
  { id: 'nat-4', name: 'Staging-Server-DNAT', reservation: null, actionType: 'DNAT', source: 'Any', destination: '203.0.113.11', translated: '192.168.2.20:8080', service: 'HTTP', description: 'Port forwarding for the staging web server.', status: 'Disabled', gateway: 'Dev-Internal-Gateway', elasticIp: '99.4.123.55', port: '80' },
];

const WELL_KNOWN: Record<string, string> = { '80': 'HTTP', '443': 'HTTPS', '22': 'SSH', '3306': 'MySQL', '3389': 'RDP' };

/** The network a gateway address sits in, e.g. 192.168.1.1/24 → 192.168.1.0/24. */
const networkOf = (subnet: string): string => {
  const [ip, cidr] = subnet.split('/');
  const o = ip.split('.');
  return `${o[0]}.${o[1]}.${o[2]}.0/${cidr}`;
};

/** Turns the form into a table row, the way the edge applies each NAT type. */
function toRule(form: NatForm, id: string, status: NatStatus): NatRule {
  const gw = GATEWAYS.find((g) => g.name === form.gateway);
  const subnet = gw?.subnet ?? '0.0.0.0/0';
  const host = subnet.split('/')[0];
  const ports = form.port.split(',').map((p) => p.trim()).filter(Boolean);
  const service = ports.length ? ports.map((p) => WELL_KNOWN[p] ?? `TCP/${p}`).join(', ') : 'Any';
  const net = networkOf(subnet);
  const routes: Record<NatActionType, Pick<NatRule, 'source' | 'destination' | 'translated'>> = {
    SNAT: { source: net, destination: 'Any', translated: form.elasticIp },
    DNAT: { source: 'Any', destination: form.elasticIp, translated: ports.length ? `${host}:${ports[0]}` : host },
    'NO SNAT': { source: net, destination: 'Any', translated: 'N/A' },
    'NO DNAT': { source: 'Any', destination: form.elasticIp, translated: 'N/A' },
    REFLEXIVE: { source: net, destination: 'Any', translated: form.elasticIp },
  };
  return {
    id, status, ...routes[form.type],
    name: form.name.trim(), actionType: form.type, reservation: gw?.reservation ?? null, service,
    description: form.description.trim(), gateway: form.gateway, elasticIp: form.elasticIp, port: form.port.trim(),
  };
}

@Service()
export class NetworkingDemoStore {
  private readonly rules = signal<NatRule[]>(MOCK_NAT_RULES);
  readonly natRules = this.rules.asReadonly();

  addNatRule(form: NatForm): NatRule {
    const rule = toRule(form, `nat-${Date.now()}`, 'Enabled');
    this.rules.update((r) => [rule, ...r]);
    return rule;
  }

  updateNatRule(id: string, form: NatForm): void {
    this.rules.update((r) => r.map((rule) => (rule.id === id ? toRule(form, id, rule.status) : rule)));
  }

  setStatus(id: string, status: NatStatus): void {
    this.rules.update((r) => r.map((rule) => (rule.id === id ? { ...rule, status } : rule)));
  }

  deleteNatRule(id: string): void {
    this.rules.update((r) => r.filter((rule) => rule.id !== id));
  }
}
