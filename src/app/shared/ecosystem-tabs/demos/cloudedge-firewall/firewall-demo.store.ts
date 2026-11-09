import { Service, computed, signal } from '@angular/core';

/**
 * CloudEdge gateway firewall policies and their rules, ported from the
 * console's GatewayFirewallService and mock data
 * (cloudedge/src/pages/gateway-firewall). Every change is kept in an undo
 * history, as the console's UNDO button promises. State lives for the visit;
 * nothing leaves the browser.
 */
export type RuleAction = 'Allow' | 'Drop' | 'Reject';

export interface GatewayRule {
  readonly id: string;
  readonly name: string;
  readonly ruleId: string;
  readonly sources: string;
  readonly destinations: string;
  readonly services: string;
  readonly profiles: string;
  readonly appliedTo: string;
  readonly action: RuleAction;
  readonly enabled: boolean;
}

export interface GatewayPolicy {
  readonly id: string;
  readonly name: string;
  readonly policyId: string;
  readonly rules: readonly GatewayRule[];
  readonly isExpanded: boolean;
}

/** A rule as the forms edit it, before it gets its ids. */
export type RuleDraft = Pick<GatewayRule, 'name' | 'sources' | 'destinations' | 'services' | 'profiles' | 'action' | 'enabled'>;

export const APPLIED_TO = 'Tier1-Gateway-01';
export const GROUPS = ['Any', 'Admin-IP-Set', 'Jumpbox-VM', 'Web-VIP', 'App-Subnet', 'DB-Subnet-CIDR', 'Web Servers Group', 'DB Servers Group', 'App Servers Group', 'Mgmt Group'];
export const SERVICES = ['Any', 'HTTP', 'HTTPS', 'SSH', 'MySQL', 'DHCP-Server', 'DHCP-Client'];
export const PROFILES = ['None', 'Block Critical Web Threats', 'Monitor DB Access for Anomalies', 'Default Intranet Policy'];

const MOCK_GATEWAY_POLICIES: GatewayPolicy[] = [
  { id: 'gw-policy1', name: 'T1 Pre-Rules', policyId: '(1)', isExpanded: true, rules: [
    { id: 'gw-rule1-1', name: 'Allow SSH to Jumpbox', ruleId: '101', sources: 'Admin-IP-Set', destinations: 'Jumpbox-VM', services: 'SSH', profiles: 'None', appliedTo: APPLIED_TO, action: 'Allow', enabled: true },
    { id: 'gw-rule1-2', name: 'Drop Invalid States', ruleId: '102', sources: 'Any', destinations: 'Any', services: 'Any', profiles: 'None', appliedTo: APPLIED_TO, action: 'Drop', enabled: true },
  ] },
  { id: 'gw-policy2', name: 'Default Tier1 Rules', policyId: '(3)', isExpanded: true, rules: [
    { id: 'gw-rule2-1', name: 'Allow Web Inbound', ruleId: '103', sources: 'Any', destinations: 'Web-VIP', services: 'HTTPS', profiles: 'None', appliedTo: APPLIED_TO, action: 'Allow', enabled: true },
    { id: 'gw-rule2-2', name: 'Allow App to DB Outbound', ruleId: '104', sources: 'App-Subnet', destinations: 'DB-Subnet-CIDR', services: 'MySQL', profiles: 'None', appliedTo: APPLIED_TO, action: 'Allow', enabled: true },
    { id: 'gw-rule2-3', name: 'Deny All Other Outbound', ruleId: '105', sources: 'Any', destinations: 'Any', services: 'Any', profiles: 'None', appliedTo: APPLIED_TO, action: 'Reject', enabled: false },
  ] },
  { id: 'gw-policy3', name: 'Emergency Block', policyId: '(0)', isExpanded: true, rules: [] },
];

@Service()
export class FirewallDemoStore {
  private readonly state = signal<GatewayPolicy[]>(MOCK_GATEWAY_POLICIES);
  private readonly history = signal<GatewayPolicy[][]>([]);
  private nextRuleId = 106;
  private nextKey = 0;

  readonly policies = this.state.asReadonly();
  readonly canUndo = computed(() => this.history().length > 0);
  /** The last configuration saved as a draft, for the export. */
  readonly draftSavedAt = signal<string | null>(null);

  private commit(next: GatewayPolicy[]): void {
    this.history.update((h) => [...h.slice(-19), this.state()]);
    this.state.set(next);
  }

  private mapPolicy(id: string, fn: (p: GatewayPolicy) => GatewayPolicy): GatewayPolicy[] {
    return this.state().map((p) => (p.id === id ? fn(p) : p));
  }

  private makeRule(draft: RuleDraft): GatewayRule {
    return { ...draft, id: `gw-rule-${Date.now()}-${this.nextKey++}`, ruleId: String(this.nextRuleId++), appliedTo: APPLIED_TO };
  }

  undo(): void {
    const h = this.history();
    if (!h.length) return;
    this.state.set(h[h.length - 1]);
    this.history.set(h.slice(0, -1));
  }

  /** Expanding a policy is a view change, so it stays out of the undo history. */
  toggleExpanded(id: string): void {
    this.state.set(this.mapPolicy(id, (p) => ({ ...p, isExpanded: !p.isExpanded })));
  }

  addPolicy(name: string, rules: RuleDraft[]): GatewayPolicy {
    const policy: GatewayPolicy = { id: `gw-policy-${Date.now()}`, name, policyId: `(${rules.length})`, isExpanded: true, rules: rules.map((r) => this.makeRule(r)) };
    this.commit([policy, ...this.state()]);
    return policy;
  }

  /** Saves the Edit Policy page: kept rules keep their ids, new ones get the next ones. */
  savePolicy(id: string, name: string, rules: (RuleDraft & { id?: string })[]): void {
    this.commit(
      this.mapPolicy(id, (p) => ({
        ...p, name,
        rules: rules.map((r) => {
          const kept = r.id ? p.rules.find((x) => x.id === r.id) : undefined;
          const { id: _id, ...draft } = r;
          return kept ? { ...kept, ...draft } : this.makeRule(draft);
        }),
      })),
    );
  }

  renamePolicy(id: string, name: string): void {
    this.commit(this.mapPolicy(id, (p) => ({ ...p, name })));
  }

  updateRule(policyId: string, ruleId: string, changes: Partial<RuleDraft>): void {
    this.commit(this.mapPolicy(policyId, (p) => ({ ...p, rules: p.rules.map((r) => (r.id === ruleId ? { ...r, ...changes } : r)) })));
  }

  addRule(policyId: string, draft: RuleDraft): GatewayRule {
    const rule = this.makeRule(draft);
    this.commit(this.mapPolicy(policyId, (p) => ({ ...p, isExpanded: true, rules: [...p.rules, rule] })));
    return rule;
  }

  /** Clones a policy (with its rules) or a single rule, right after the original. */
  clone(id: string): string | null {
    const policies = this.state();
    const pi = policies.findIndex((p) => p.id === id);
    if (pi >= 0) {
      const src = policies[pi];
      const copy: GatewayPolicy = { ...src, id: `gw-policy-${Date.now()}`, name: `${src.name} (copy)`, rules: src.rules.map((r) => this.makeRule(r)) };
      this.commit([...policies.slice(0, pi + 1), copy, ...policies.slice(pi + 1)]);
      return copy.name;
    }
    for (const p of policies) {
      const ri = p.rules.findIndex((r) => r.id === id);
      if (ri < 0) continue;
      const copy = this.makeRule({ ...p.rules[ri], name: `${p.rules[ri].name} (copy)` });
      this.commit(this.mapPolicy(p.id, (x) => ({ ...x, rules: [...x.rules.slice(0, ri + 1), copy, ...x.rules.slice(ri + 1)] })));
      return copy.name;
    }
    return null;
  }

  /** Deletes policies and rules by id, in one undoable step. */
  deleteItems(ids: readonly string[]): void {
    this.commit(
      this.state()
        .filter((p) => !ids.includes(p.id))
        .map((p) => ({ ...p, rules: p.rules.filter((r) => !ids.includes(r.id)) })),
    );
  }

  saveDraft(): void {
    this.draftSavedAt.set(new Date().toISOString());
  }
}
