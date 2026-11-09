import { Component, ElementRef, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft, faCircleCheck, faCircleInfo, faCirclePlus, faPencil, faPlus, faTrashCan, faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { DemoDialogComponent } from '../demo-dialog.component';
import {
  ACTION_OPTIONS, CONDITION_OPTIONS, MEMBER_ITEMS, RULE_MEMBERS, RulesDemoStore, VALUELESS_ITEMS, itemId,
  type Rule, type RuleItem, type RuleSection,
} from './rules-demo.store';

interface RuleDraft {
  name: string;
  description: string;
  conditions: readonly RuleItem[];
  actions: readonly RuleItem[];
  exceptions: readonly RuleItem[];
}
const KEY: Record<RuleSection, 'conditions' | 'actions' | 'exceptions'> = { condition: 'conditions', action: 'actions', exception: 'exceptions' };

/**
 * Email Admin Suite › Exchange Email › Rules, working: the rules table with
 * the Enabled switch (confirmed), Rule Information, delete, and the rule
 * details page in-window to create or edit a rule: its name, the "Apply this
 * rule if…", "Do the following…" and "Except if…" items picked from the
 * suite's lists, each valued in its own Select dialog. Ported from
 * RulesPage.tsx and RuleDetailsPage.tsx in the unified sign-in app; only the
 * page content is shown.
 */
@Component({
  selector: 'app-email-rules-demo',
  imports: [FaIconComponent, DatePipe, DemoDialogComponent],
  templateUrl: './rules-demo.component.html',
  styleUrls: ['../demo.css', './rules-demo.component.css'],
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class RulesDemoComponent {
  private readonly store = inject(RulesDemoStore);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly i = {
    back: faArrowLeft, ok: faCircleCheck, info: faCircleInfo, add: faCirclePlus, pencil: faPencil, plus: faPlus, trash: faTrashCan, close: faXmark,
  };
  protected readonly sections: readonly { id: RuleSection; title: string; button: string; options: readonly string[] }[] = [
    { id: 'condition', title: 'Apply this rule if...', button: 'Add condition', options: CONDITION_OPTIONS },
    { id: 'action', title: 'Do the following...', button: 'Add action', options: ACTION_OPTIONS },
    { id: 'exception', title: 'Except if...', button: 'Add exception', options: CONDITION_OPTIONS },
  ];
  protected readonly key = KEY;

  protected readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  /* ---------- Rules table ---------- */
  protected readonly rowsPerPage = signal(20);
  protected readonly rules = computed(() => this.store.rules().slice(0, this.rowsPerPage()));
  protected setRows(value: string): void {
    this.rowsPerPage.set(Number(value));
  }
  protected readonly info = signal<Rule | null>(null);
  protected readonly statusChange = signal<{ rule: Rule; next: Rule['status'] } | null>(null);
  protected readonly deleting = signal<Rule | null>(null);

  protected askStatus(event: Event, rule: Rule): void {
    // The switch only flips once the change is confirmed.
    event.preventDefault();
    this.statusChange.set({ rule, next: rule.status === 'enabled' ? 'disabled' : 'enabled' });
  }
  protected confirmStatus(): void {
    const c = this.statusChange();
    if (!c) return;
    this.store.update(c.rule.id, { status: c.next });
    this.statusChange.set(null);
    this.notify(`${c.rule.name} ${c.next}.`);
  }
  protected confirmDelete(): void {
    const r = this.deleting();
    if (!r) return;
    this.store.remove(r.id);
    this.deleting.set(null);
    this.notify(`${r.name} deleted.`);
  }

  /* ---------- Rule details: New Rule / Edit Rule ---------- */
  protected readonly editing = signal<Rule | 'new' | null>(null);
  protected readonly draft = signal<RuleDraft>({ name: '', description: '', conditions: [], actions: [], exceptions: [] });
  protected readonly submitted = signal(false);

  protected readonly errors = computed(() => {
    const d = this.draft();
    const e: Partial<Record<'name' | 'condition' | 'action', string>> = {};
    if (!d.name.trim()) e.name = 'Rule Name is required.';
    else if (this.store.rules().some((r) => r !== this.editing() && r.name.toLowerCase() === d.name.trim().toLowerCase())) e.name = 'A rule with this name already exists.';
    if (!d.conditions.length) e.condition = 'Add at least one condition.';
    if (!d.actions.length) e.action = 'Add at least one action.';
    return e;
  });
  protected err(key: 'name' | 'condition' | 'action' | 'exception'): string | null {
    return this.submitted() && key !== 'exception' ? (this.errors()[key] ?? null) : null;
  }

  protected openRule(rule: Rule | 'new'): void {
    this.draft.set(
      rule === 'new'
        ? { name: '', description: '', conditions: [], actions: [], exceptions: [] }
        : { name: rule.name, description: rule.description, conditions: rule.conditions, actions: rule.actions, exceptions: rule.exceptions },
    );
    this.submitted.set(false);
    this.editing.set(rule);
    this.focusTop();
  }
  protected closeRule(): void {
    this.editing.set(null);
    this.openMenu.set(null);
    this.focusTop();
  }

  protected save(): void {
    this.submitted.set(true);
    if (Object.keys(this.errors()).length) return;
    const d = this.draft();
    const target = this.editing();
    const name = d.name.trim();
    const description = d.description.trim() || this.describe(d);
    if (target === 'new') {
      const now = new Date().toISOString();
      this.store.add({ id: `rule_${Date.now()}`, name, description, status: 'enabled', creationDate: now, lastModified: now, conditions: d.conditions, actions: d.actions, exceptions: d.exceptions });
    } else if (target) {
      this.store.update(target.id, { name, description, conditions: d.conditions, actions: d.actions, exceptions: d.exceptions });
    }
    this.notify(`Rule '${name}' ${target === 'new' ? 'created' : 'updated'} successfully.`);
    this.closeRule();
  }

  /** A one-line summary for a rule saved without a description, e.g. "If the sender is x, redirect the message to y." */
  private describe(d: RuleDraft): string {
    const phrase = (it: RuleItem) => `${it.type.replace(/\.+$/, '').toLowerCase()} ${it.value.join(', ')}`.trim();
    const cond = d.conditions.map(phrase).join(' and ');
    const act = d.actions.map(phrase).join(', then ');
    return `If ${cond}, ${act}.`;
  }

  /* ---------- "Add condition / action / exception" menus ---------- */
  protected readonly openMenu = signal<RuleSection | null>(null);
  private menuTrigger: HTMLElement | null = null;

  protected toggleMenu(event: Event, section: RuleSection): void {
    event.stopPropagation();
    this.menuTrigger = event.currentTarget as HTMLElement;
    this.openMenu.update((open) => (open === section ? null : section));
  }
  protected closeMenu(): void {
    this.openMenu.set(null);
    this.menuTrigger?.focus();
  }
  protected onDocumentClick(event: Event): void {
    if (!(event.target as Element | null)?.closest('.d-menu-wrap')) this.openMenu.set(null);
  }

  protected pickType(section: RuleSection, type: string): void {
    this.closeMenu();
    if (VALUELESS_ITEMS.includes(type)) {
      this.upsert(section, { id: itemId(), type, value: [] });
      this.notify(`${type.replace(/\.+$/, '')} added.`);
      return;
    }
    this.openItem(section, { id: itemId(), type, value: [] });
  }

  protected removeItem(section: RuleSection, it: RuleItem): void {
    this.draft.update((d) => ({ ...d, [KEY[section]]: d[KEY[section]].filter((x) => x.id !== it.id) }));
    setTimeout(() => this.host.querySelector<HTMLElement>(`#rule-add-${section}`)?.focus());
  }

  private upsert(section: RuleSection, it: RuleItem): void {
    this.draft.update((d) => {
      const list = d[KEY[section]];
      const next = list.some((x) => x.id === it.id) ? list.map((x) => (x.id === it.id ? it : x)) : [...list, it];
      return { ...d, [KEY[section]]: next };
    });
  }

  /* ---------- The "Select: …" dialog that values an item ---------- */
  protected readonly modal = signal<{ section: RuleSection; item: RuleItem } | null>(null);
  protected readonly modalValue = signal<readonly string[]>([]);
  protected readonly modalSearch = signal('');
  protected readonly modalText = signal('');
  protected readonly modalSubmitted = signal(false);
  protected readonly isMemberItem = computed(() => MEMBER_ITEMS.includes(this.modal()?.item.type ?? ''));
  protected readonly filteredMembers = computed(() => {
    const q = this.modalSearch().trim().toLowerCase();
    return RULE_MEMBERS.filter((m) => m.toLowerCase().includes(q));
  });
  protected readonly modalError = computed(() =>
    this.modalSubmitted() && !this.modalValue().length ? (this.isMemberItem() ? 'Select at least one recipient.' : 'Enter at least one value.') : null,
  );

  protected openItem(section: RuleSection, it: RuleItem): void {
    this.modal.set({ section, item: it });
    this.modalValue.set(it.value);
    this.modalSearch.set('');
    this.modalText.set('');
    this.modalSubmitted.set(false);
  }
  protected toggleMember(member: string, checked: boolean): void {
    this.modalValue.update((v) => (checked ? [...v, member] : v.filter((m) => m !== member)));
  }
  protected addText(): void {
    const words = this.modalText().split(',').map((w) => w.trim()).filter((w) => w && !this.modalValue().includes(w));
    if (words.length) this.modalValue.update((v) => [...v, ...words]);
    this.modalText.set('');
  }
  protected removeText(word: string): void {
    this.modalValue.update((v) => v.filter((w) => w !== word));
  }
  protected saveItem(): void {
    const m = this.modal();
    if (!m) return;
    if (!this.isMemberItem()) this.addText();
    this.modalSubmitted.set(true);
    if (!this.modalValue().length) return;
    this.upsert(m.section, { ...m.item, value: this.modalValue() });
    this.modal.set(null);
  }

  /* ---------- Shared ---------- */
  private focusTop(): void {
    setTimeout(() => this.host.querySelector<HTMLElement>('#rule-demo-title')?.focus());
  }

  protected notify(text: string): void {
    this.toast.set(text);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 3200);
  }
}
