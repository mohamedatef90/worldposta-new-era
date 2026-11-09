import { Component, ElementRef, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft, faCheck, faChevronDown, faChevronRight, faCircleCheck, faCirclePlus, faClone, faFileExport, faFloppyDisk,
  faPencil, faPenToSquare, faPlus, faRotateLeft, faShieldHalved, faTrashCan, faTriangleExclamation, faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { DemoDialogComponent } from '../demo-dialog.component';
import {
  APPLIED_TO, FirewallDemoStore, GROUPS, PROFILES, SERVICES, type GatewayPolicy, type GatewayRule, type RuleAction, type RuleDraft,
} from './firewall-demo.store';

type Renaming = { policyId: string; ruleId: string | null; value: string };
type PageRule = RuleDraft & { id?: string; key: number };

const NEW_RULE = (n: number): RuleDraft => ({ name: `New Rule ${n}`, sources: 'Any', destinations: 'Any', services: 'Any', profiles: 'None', action: 'Allow', enabled: true });

/**
 * CloudEdge › Security › Gateway Firewall, working: policies that expand to
 * their rules, inline rename, the Allow / Drop / Reject action dropdown that
 * recolours the rule, enable switches, ADD POLICY and Edit Policy (the
 * console's add-gateway-policy page), inline ADD RULE, CLONE, UNDO, DELETE
 * with confirmation, Save as a draft and Export FW configuration.
 * Ported from cloudedge/src/pages/gateway-firewall (gateway-firewall,
 * components/gateway-rules, action-dropdown, editable-name,
 * pages/add-gateway-policy); page content only, no console sidebar.
 */
@Component({
  selector: 'app-cloudedge-firewall-demo',
  imports: [FaIconComponent, NgTemplateOutlet, DemoDialogComponent],
  templateUrl: './firewall-demo.component.html',
  styleUrls: ['../demo.css', './firewall-demo.component.css'],
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class FirewallDemoComponent {
  private readonly store = inject(FirewallDemoStore);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);

  protected readonly i = {
    back: faArrowLeft, check: faCheck, open: faChevronDown, closed: faChevronRight, ok: faCircleCheck, addPolicy: faCirclePlus,
    clone: faClone, export: faFileExport, save: faFloppyDisk, rename: faPencil, edit: faPenToSquare, plus: faPlus, undo: faRotateLeft,
    shield: faShieldHalved, trash: faTrashCan, warn: faTriangleExclamation, cancel: faXmark, chevron: faChevronDown,
  };
  protected readonly actions: RuleAction[] = ['Allow', 'Drop', 'Reject'];
  protected readonly groups = GROUPS;
  protected readonly services = SERVICES;
  protected readonly profiles = PROFILES;
  protected readonly appliedTo = APPLIED_TO;

  protected readonly policies = this.store.policies;
  protected readonly canUndo = this.store.canUndo;
  protected readonly page = signal<'list' | 'policy'>('list');
  protected readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  /* ---------- Selection and the toolbar ---------- */
  protected readonly selected = signal<string[]>([]);
  protected readonly selectedPolicy = computed(() => {
    const s = this.selected();
    return s.length === 1 ? (this.policies().find((p) => p.id === s[0]) ?? null) : null;
  });

  protected isSelected(id: string): boolean {
    return this.selected().includes(id);
  }

  protected select(id: string, checked: boolean): void {
    this.selected.update((s) => (checked ? [...s, id] : s.filter((x) => x !== id)));
  }

  protected clone(): void {
    const [id] = this.selected();
    const name = id ? this.store.clone(id) : null;
    if (name) this.notify(`${name} created.`);
  }

  protected undo(): void {
    this.store.undo();
    this.cancelNewRule();
    this.selected.update((s) => s.filter((id) => this.exists(id)));
    this.notify('Last change undone.');
  }

  private exists(id: string): boolean {
    return this.policies().some((p) => p.id === id || p.rules.some((r) => r.id === id));
  }

  /** Rules near the bottom of the table open their action menu upwards, so the scroll box doesn't clip it. */
  protected readonly opensUp = computed(() => {
    const rows: (string | null)[] = [];
    for (const p of this.policies()) {
      rows.push(null);
      if (!p.isExpanded) continue;
      rows.push(...p.rules.map((r) => r.id));
      if (!p.rules.length || this.addingTo() === p.id) rows.push(null);
    }
    return new Set(rows.slice(-3).filter((id): id is string => !!id && rows.length > 4));
  });

  protected togglePolicy(policy: GatewayPolicy): void {
    this.store.toggleExpanded(policy.id);
  }

  /* ---------- ACTIONS menu ---------- */
  protected readonly actionsOpen = signal(false);
  private actionsTrigger: HTMLElement | null = null;

  protected toggleActions(event: Event): void {
    this.actionsTrigger = event.currentTarget as HTMLElement;
    this.actionsOpen.update((o) => !o);
  }

  protected closeActions(): void {
    this.actionsOpen.set(false);
    this.actionsTrigger?.focus();
  }

  protected saveDraft(): void {
    this.closeActions();
    this.store.saveDraft();
    this.notify('Firewall configuration saved as a draft.');
  }

  protected exportConfig(): void {
    this.closeActions();
    const config = { gateway: APPLIED_TO, draftSavedAt: this.store.draftSavedAt(), policies: this.policies().map(({ isExpanded: _e, ...p }) => p) };
    const url = URL.createObjectURL(new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gateway-firewall-configuration.json';
    a.click();
    URL.revokeObjectURL(url);
    this.notify('FW configuration exported as JSON.');
  }

  /* ---------- Rule action dropdown ---------- */
  protected readonly actionMenu = signal<string | null>(null);
  private actionMenuTrigger: HTMLElement | null = null;

  protected toggleActionMenu(event: Event, id: string): void {
    event.stopPropagation();
    this.actionMenuTrigger = event.currentTarget as HTMLElement;
    this.actionMenu.update((open) => (open === id ? null : id));
  }

  protected closeActionMenu(): void {
    this.actionMenu.set(null);
    this.actionMenuTrigger?.focus();
  }

  protected setAction(policy: GatewayPolicy, rule: GatewayRule, action: RuleAction): void {
    this.closeActionMenu();
    if (rule.action === action) return;
    this.store.updateRule(policy.id, rule.id, { action });
    this.notify(`${rule.name} now set to ${action}.`);
  }

  protected setEnabled(policy: GatewayPolicy, rule: GatewayRule, enabled: boolean): void {
    this.store.updateRule(policy.id, rule.id, { enabled });
    this.notify(`${rule.name} ${enabled ? 'enabled' : 'disabled'}.`);
  }

  /* ---------- Inline rename (editable-name) ---------- */
  protected readonly renaming = signal<Renaming | null>(null);

  protected startRename(policyId: string, ruleId: string | null, name: string): void {
    this.renaming.set({ policyId, ruleId, value: name });
    afterNextRender(() => this.host.querySelector<HTMLInputElement>('#fw-rename')?.select(), { injector: this.injector });
  }

  /** Enter saves and keeps focus on the name's pencil; leaving the field (blur) saves where focus went. */
  protected saveRename(fromBlur = false): void {
    const r = this.renaming();
    if (!r) return;
    this.renaming.set(null);
    const name = r.value.trim();
    const policy = this.policies().find((p) => p.id === r.policyId);
    const current = r.ruleId ? policy?.rules.find((x) => x.id === r.ruleId)?.name : policy?.name;
    if (name && name !== current) {
      if (r.ruleId) this.store.updateRule(r.policyId, r.ruleId, { name });
      else this.store.renamePolicy(r.policyId, name);
      this.notify(`Renamed to ${name}.`);
    }
    if (!fromBlur) this.focusRenameButton(r);
  }

  protected cancelRename(): void {
    const r = this.renaming();
    this.renaming.set(null);
    if (r) this.focusRenameButton(r);
  }

  private focusRenameButton(r: Renaming): void {
    afterNextRender(() => this.host.querySelector<HTMLElement>(`[data-rename="${r.ruleId ?? r.policyId}"]`)?.focus(), { injector: this.injector });
  }

  protected isRenaming(policyId: string, ruleId: string | null): boolean {
    const r = this.renaming();
    return !!r && r.policyId === policyId && r.ruleId === ruleId;
  }

  protected setRenameValue(value: string): void {
    this.renaming.update((r) => (r ? { ...r, value } : r));
  }

  /* ---------- ADD RULE: an inline row in the selected policy ---------- */
  protected readonly addingTo = signal<string | null>(null);
  protected readonly newRule = signal<RuleDraft>(NEW_RULE(1));
  protected readonly newRuleError = signal(false);

  protected startAddRule(): void {
    const policy = this.selectedPolicy();
    if (!policy) return;
    if (!policy.isExpanded) this.store.toggleExpanded(policy.id);
    this.newRule.set({ ...NEW_RULE(policy.rules.length + 1), name: '' });
    this.newRuleError.set(false);
    this.addingTo.set(policy.id);
    afterNextRender(() => this.host.querySelector<HTMLInputElement>('#fw-new-rule-name')?.focus(), { injector: this.injector });
  }

  protected setNewRule<K extends keyof RuleDraft>(key: K, value: RuleDraft[K]): void {
    this.newRule.update((r) => ({ ...r, [key]: value }));
  }

  protected saveNewRule(): void {
    const policyId = this.addingTo();
    const draft = this.newRule();
    if (!policyId) return;
    if (!draft.name.trim()) {
      this.newRuleError.set(true);
      this.host.querySelector<HTMLInputElement>('#fw-new-rule-name')?.focus();
      return;
    }
    const rule = this.store.addRule(policyId, { ...draft, name: draft.name.trim() });
    this.addingTo.set(null);
    this.notify(`Rule ${rule.name} (${rule.ruleId}) added.`);
  }

  protected cancelNewRule(): void {
    this.addingTo.set(null);
  }

  /* ---------- Delete: one rule from its row, a policy by name, a selection by DELETE ---------- */
  protected readonly deleting = signal<{ ids: string[]; title: string; label: string; confirmText: string; count: number } | null>(null);
  protected readonly deleteTyped = signal('');

  protected askDeleteRule(rule: GatewayRule): void {
    this.deleteTyped.set('');
    this.deleting.set({ ids: [rule.id], title: 'Delete Rule', label: `the Rule ${rule.name}`, confirmText: rule.name, count: 1 });
  }

  protected askDeletePolicy(policy: GatewayPolicy): void {
    this.deleteTyped.set('');
    this.deleting.set({ ids: [policy.id], title: 'Delete Policy', label: `the Policy ${policy.name}`, confirmText: policy.name, count: 1 });
  }

  protected askDeleteSelected(): void {
    const ids = this.selected();
    if (!ids.length) return;
    this.deleteTyped.set('');
    this.deleting.set({ ids, title: ids.length === 1 ? 'Delete Item' : 'Delete Items', label: `the selected ${ids.length} ${ids.length === 1 ? 'Item' : 'Items'}`, confirmText: 'DELETE', count: ids.length });
  }

  protected confirmDelete(): void {
    const d = this.deleting();
    if (!d || this.deleteTyped() !== d.confirmText) return;
    this.store.deleteItems(d.ids);
    this.selected.update((s) => s.filter((x) => !d.ids.includes(x)));
    if (this.addingTo() && d.ids.includes(this.addingTo()!)) this.addingTo.set(null);
    this.deleting.set(null);
    const what = d.label.replace(/^the /, '');
    this.notify(`${what.charAt(0).toUpperCase()}${what.slice(1)} deleted. Use UNDO to bring ${d.count === 1 ? 'it' : 'them'} back.`);
  }

  /* ---------- Add / Edit Gateway Firewall Policy page ---------- */
  protected readonly editingPolicyId = signal<string | null>(null);
  protected readonly policyName = signal('');
  protected readonly pageRules = signal<PageRule[]>([]);
  protected readonly pageSubmitted = signal(false);
  /** Adding a policy asks only for its name, one service and one action. */
  protected readonly quickService = signal<string>('HTTPS');
  protected readonly quickAction = signal<RuleAction>('Allow');
  private nextKey = 0;

  protected readonly pageErrors = computed(() => ({
    name: this.policyName().trim() ? null : 'Policy Name is required.',
    rules: this.pageRules().some((r) => !r.name.trim()) ? 'Every rule needs a name.' : null,
  }));

  protected openAddPolicy(): void {
    this.editingPolicyId.set(null);
    this.policyName.set('');
    this.pageRules.set([]);
    this.quickService.set('HTTPS');
    this.quickAction.set('Allow');
    this.pageSubmitted.set(false);
    this.page.set('policy');
  }

  protected openEditPolicy(policy: GatewayPolicy): void {
    this.editingPolicyId.set(policy.id);
    this.policyName.set(policy.name);
    this.pageRules.set(policy.rules.map((r) => ({ id: r.id, key: this.nextKey++, name: r.name, sources: r.sources, destinations: r.destinations, services: r.services, profiles: r.profiles, action: r.action, enabled: r.enabled })));
    this.pageSubmitted.set(false);
    this.page.set('policy');
  }

  protected addPageRule(): void {
    this.pageRules.update((rules) => [...rules, { ...NEW_RULE(rules.length + 1), key: this.nextKey++ }]);
  }

  protected setPageRule<K extends keyof RuleDraft>(key: number, field: K, value: RuleDraft[K]): void {
    this.pageRules.update((rules) => rules.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  }

  protected removePageRule(key: number): void {
    this.pageRules.update((rules) => rules.filter((r) => r.key !== key));
  }

  protected savePolicy(event: Event): void {
    event.preventDefault();
    this.pageSubmitted.set(true);
    const errors = this.pageErrors();
    if (errors.name || (this.editingPolicyId() && errors.rules)) return;
    const name = this.policyName().trim();
    const id = this.editingPolicyId();
    const rules = id
      ? this.pageRules().map(({ key: _k, ...r }) => ({ ...r, name: r.name.trim() }))
      : [{ ...NEW_RULE(1), name: this.quickService() === 'Any' ? `${name} rule` : `${this.quickAction()} ${this.quickService()}`, services: this.quickService(), action: this.quickAction() }];
    if (id) {
      this.store.savePolicy(id, name, rules);
      this.notify(`Policy ${name} saved.`);
    } else {
      this.store.addPolicy(name, rules);
      this.notify(`Policy ${name} added with ${rules.length} ${rules.length === 1 ? 'rule' : 'rules'}.`);
    }
    this.page.set('list');
  }

  /* ---------- Shared ---------- */
  protected notify(text: string): void {
    this.toast.set(text);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 3200);
  }

  protected onDocumentClick(event: Event): void {
    if (!(event.target as Element | null)?.closest('.d-menu-wrap')) {
      this.actionMenu.set(null);
      this.actionsOpen.set(false);
    }
  }

  protected actionTone(action: RuleAction): string {
    return action === 'Allow' ? 'good' : action === 'Drop' ? 'warn' : 'bad';
  }
}
