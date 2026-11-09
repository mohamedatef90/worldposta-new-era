import { Component, ElementRef, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faCircleCheck, faCirclePause, faCirclePlus, faEye, faEyeSlash, faFileExport, faFilter,
  faPenToSquare, faPencil, faRotate, faTrashCan, faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { DemoDialogComponent } from '../demo-dialog.component';
import {
  MAILBOX_DOMAINS, MAILBOX_LEVELS, MAILBOX_PLANS, MAILBOX_TYPES, MailboxDemoStore, PLAN_QUOTA_GB,
  type Mailbox, type MailboxLevel, type MailboxPlan, type MailboxType,
} from './mailbox-demo.store';

interface MailboxFilters { displayName: string; domain: string; plan: 'ALL' | MailboxPlan; dateFrom: string; dateTo: string }
const NO_FILTERS: MailboxFilters = { displayName: '', domain: 'ALL', plan: 'ALL', dateFrom: '', dateTo: '' };

type BulkAction = 'activate' | 'suspend' | 'delete' | 'plan';

const blankMailbox = () => ({
  firstName: '', initials: '', lastName: '', displayName: '', emailUser: '', emailDomain: MAILBOX_DOMAINS[0],
  password: '', confirmPassword: '', mailboxPlan: 'Posta Business' as MailboxPlan, mailboxType: 'User' as MailboxType,
  level: 'Normal' as MailboxLevel, sendInstructions: true, additionalEmail: '', mfaEnabled: false,
});
type MailboxForm = ReturnType<typeof blankMailbox>;

/**
 * Email Admin Suite › Exchange Email › Mailboxes, working: the mailbox table
 * with inline plan and level edits, selection with bulk actions, Filters &
 * Search, Refresh, Export, delete, and the Add New Mailbox panel with
 * Generate Password. Ported from MailboxesPage.tsx in the unified sign-in app;
 * only the page content is shown, without the suite's sidebar and top bar.
 */
@Component({
  selector: 'app-mailbox-demo',
  imports: [FaIconComponent, DatePipe, DecimalPipe, DemoDialogComponent],
  templateUrl: './mailbox-demo.component.html',
  styleUrls: ['../demo.css', './mailbox-demo.component.css'],
})
export class MailboxDemoComponent {
  private readonly store = inject(MailboxDemoStore);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly i = {
    ok: faCircleCheck, suspend: faCirclePause, add: faCirclePlus, activate: faCircleCheck, show: faEye, hide: faEyeSlash,
    export: faFileExport, filter: faFilter, edit: faPenToSquare, pencil: faPencil, refresh: faRotate, trash: faTrashCan, close: faXmark,
  };
  protected readonly plans = MAILBOX_PLANS;
  protected readonly levels = MAILBOX_LEVELS;
  protected readonly types = MAILBOX_TYPES;
  protected readonly domains = MAILBOX_DOMAINS;
  protected readonly statusTone = { active: 'good', suspended: 'warn', blocked: 'bad' } as const;

  protected readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  /* ---------- Filters & Search ---------- */
  protected readonly filters = signal<MailboxFilters>({ ...NO_FILTERS });
  protected readonly draftFilters = signal<MailboxFilters>({ ...NO_FILTERS });
  protected readonly filterOpen = signal(false);

  protected readonly activeFilterCount = computed(() => {
    const f = this.filters();
    return (Object.keys(NO_FILTERS) as (keyof MailboxFilters)[]).filter((k) => f[k] !== NO_FILTERS[k]).length;
  });

  protected readonly mailboxes = computed(() => {
    const f = this.filters();
    const name = f.displayName.trim().toLowerCase();
    return this.store
      .mailboxes()
      .filter((m) => {
        const created = new Date(m.creationDate);
        return (
          (!name || m.displayName.toLowerCase().includes(name)) &&
          (f.domain === 'ALL' || m.login.split('@')[1] === f.domain) &&
          (f.plan === 'ALL' || m.mailboxPlan === f.plan) &&
          (!f.dateFrom || created >= new Date(f.dateFrom)) &&
          (!f.dateTo || created <= new Date(f.dateTo + 'T23:59:59'))
        );
      })
      .sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
  });

  protected openFilters(): void {
    this.draftFilters.set({ ...this.filters() });
    this.filterOpen.set(true);
  }
  protected setDraftFilter(key: keyof MailboxFilters, value: string): void {
    this.draftFilters.update((f) => ({ ...f, [key]: value }));
  }
  protected applyFilters(): void {
    this.filters.set(this.draftFilters());
    this.filterOpen.set(false);
  }
  protected clearFilters(): void {
    this.filters.set({ ...NO_FILTERS });
    this.filterOpen.set(false);
  }

  /* ---------- Toolbar ---------- */
  protected readonly refreshing = signal(false);

  protected refresh(): void {
    this.refreshing.set(true);
    setTimeout(() => {
      this.refreshing.set(false);
      this.notify(`Mailboxes refreshed: ${this.store.mailboxes().length} mailboxes, all up to date.`);
    }, 1000);
  }

  protected exportAll(): void {
    const headers = ['Display Name', 'Login', 'Mailbox Plan', 'Creation Date', 'Quota Used (GB)', 'Total Quota (GB)', 'Level', 'Status'];
    const rows = this.mailboxes().map((m) =>
      [`"${m.displayName}"`, `"${m.login}"`, `"${m.mailboxPlan}"`, `"${m.creationDate}"`, m.driveQuota.usedGB, m.driveQuota.totalGB, `"${m.level}"`, `"${m.status}"`].join(','),
    );
    const url = URL.createObjectURL(new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mailboxes_export.csv';
    a.click();
    URL.revokeObjectURL(url);
    this.notify(`Exported ${rows.length} mailboxes.`);
  }

  /* ---------- Inline edits: plan and level ---------- */
  protected readonly editing = signal<{ id: string; column: 'plan' | 'level' } | null>(null);

  /** Swaps the cell for its select and puts focus on it, as clicking the dashed value does in the suite. */
  protected startEdit(m: Mailbox, column: 'plan' | 'level'): void {
    this.editing.set({ id: m.id, column });
    setTimeout(() => this.host.querySelector<HTMLSelectElement>('select.mbx-inline')?.focus());
  }

  protected setPlan(m: Mailbox, plan: string): void {
    this.store.update([m.id], { mailboxPlan: plan as MailboxPlan });
    this.editing.set(null);
    this.notify(`${m.displayName} moved to ${plan}.`);
  }
  protected setLevel(m: Mailbox, level: string): void {
    this.store.update([m.id], { level: level as MailboxLevel });
    this.editing.set(null);
    this.notify(`${m.displayName} is now ${level}.`);
  }

  protected quotaPercent(m: Mailbox): number {
    return m.driveQuota.totalGB > 0 ? Math.min(100, (m.driveQuota.usedGB / m.driveQuota.totalGB) * 100) : 0;
  }

  /* ---------- Selection and bulk actions ---------- */
  protected readonly selected = signal<readonly string[]>([]);
  protected readonly allSelected = computed(() => this.mailboxes().length > 0 && this.mailboxes().every((m) => this.selected().includes(m.id)));

  protected toggleOne(id: string, checked: boolean): void {
    this.selected.update((ids) => (checked ? [...ids, id] : ids.filter((x) => x !== id)));
  }
  protected toggleAll(checked: boolean): void {
    this.selected.set(checked ? this.mailboxes().map((m) => m.id) : []);
  }

  protected readonly bulk = signal<BulkAction | null>(null);
  protected readonly bulkPlan = signal<MailboxPlan>('Posta Business');

  protected confirmBulk(): void {
    const ids = this.selected();
    const action = this.bulk();
    const n = ids.length;
    if (action === 'delete') this.store.remove(ids);
    else if (action === 'activate') this.store.update(ids, { status: 'active' });
    else if (action === 'suspend') this.store.update(ids, { status: 'suspended' });
    else if (action === 'plan') this.store.update(ids, { mailboxPlan: this.bulkPlan() });
    const word = { delete: 'deleted', activate: 'activated', suspend: 'suspended', plan: `moved to ${this.bulkPlan()}` }[action ?? 'delete'];
    this.notify(`${n} ${n === 1 ? 'mailbox' : 'mailboxes'} ${word}.`);
    this.selected.set([]);
    this.bulk.set(null);
  }

  /* ---------- Single delete ---------- */
  protected readonly deleting = signal<Mailbox | null>(null);

  protected confirmDelete(): void {
    const m = this.deleting();
    if (!m) return;
    this.store.remove([m.id]);
    this.selected.update((ids) => ids.filter((x) => x !== m.id));
    this.deleting.set(null);
    this.notify(`${m.displayName} deleted.`);
  }

  /* ---------- Edit Mailbox (plan, level, status, MFA) ---------- */
  protected readonly editingMailbox = signal<Mailbox | null>(null);
  protected readonly editDraft = signal<{ plan: MailboxPlan; level: MailboxLevel; active: boolean }>({ plan: 'Posta Business', level: 'Normal', active: true });

  protected openEdit(m: Mailbox): void {
    this.editDraft.set({ plan: m.mailboxPlan, level: m.level, active: m.status === 'active' });
    this.editingMailbox.set(m);
  }
  protected saveEdit(): void {
    const m = this.editingMailbox();
    if (!m) return;
    const d = this.editDraft();
    this.store.update([m.id], {
      mailboxPlan: d.plan, level: d.level,
      status: d.active ? 'active' : m.status === 'active' ? 'suspended' : m.status,
    });
    this.editingMailbox.set(null);
    this.notify(`${m.displayName} saved.`);
  }

  /* ---------- Add New Mailbox ---------- */
  protected readonly addOpen = signal(false);
  protected readonly form = signal<MailboxForm>(blankMailbox());
  protected readonly showPassword = signal(false);
  protected readonly submitted = signal(false);
  /** Display name and email follow the first and last name until the admin types their own. */
  private readonly touched: Partial<Record<keyof MailboxForm, boolean>> = {};

  protected readonly errors = computed(() => {
    const f = this.form();
    const e: Partial<Record<keyof MailboxForm, string>> = {};
    if (!f.displayName.trim()) e.displayName = 'Display Name is required.';
    if (!f.emailUser.trim()) e.emailUser = 'Email address is required.';
    else if (!/^[a-z0-9._-]+$/i.test(f.emailUser)) e.emailUser = 'Use letters, numbers, dots, dashes or underscores.';
    else if (this.store.mailboxes().some((m) => m.login === `${f.emailUser}@${f.emailDomain}`.toLowerCase())) e.emailUser = 'This email address is already in use.';
    if (f.password.length < 8) e.password = 'Complex password with minimum 8 characters required.';
    if (f.password !== f.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    return e;
  });
  protected readonly hasErrors = computed(() => Object.keys(this.errors()).length > 0);

  protected err(key: keyof MailboxForm): string | null {
    return this.submitted() ? (this.errors()[key] ?? null) : null;
  }

  protected openAdd(): void {
    this.form.set(blankMailbox());
    this.touched.displayName = this.touched.emailUser = false;
    this.submitted.set(false);
    this.showPassword.set(false);
    this.addOpen.set(true);
  }

  protected set<K extends keyof MailboxForm>(key: K, value: MailboxForm[K]): void {
    if (key === 'displayName' || key === 'emailUser') this.touched[key] = true;
    this.form.update((f) => {
      const next = { ...f, [key]: value };
      if (key === 'firstName' || key === 'lastName') {
        if (!this.touched.displayName) next.displayName = `${next.firstName} ${next.lastName}`.trim();
        if (!this.touched.emailUser) {
          next.emailUser = [next.firstName, next.lastName].filter(Boolean).join('.').toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9.-]/g, '');
        }
      }
      return next;
    });
  }

  protected generatePassword(): void {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
    const random = new Uint32Array(16);
    crypto.getRandomValues(random);
    const password = Array.from(random, (n) => chars[n % chars.length]).join('');
    this.form.update((f) => ({ ...f, password, confirmPassword: password }));
    this.showPassword.set(true);
  }

  protected save(): void {
    this.submitted.set(true);
    if (this.hasErrors()) return;
    const f = this.form();
    const login = `${f.emailUser}@${f.emailDomain}`.toLowerCase();
    this.store.add({
      id: `mbx_${Date.now()}`,
      displayName: f.displayName.trim(),
      login,
      mailboxPlan: f.mailboxPlan,
      creationDate: new Date().toISOString(),
      driveQuota: { usedGB: 0, totalGB: PLAN_QUOTA_GB[f.mailboxPlan] },
      level: f.level,
      status: 'active',
      mfaEnabled: f.mfaEnabled,
      mailboxType: f.mailboxType,
    });
    this.addOpen.set(false);
    this.notify(`${login} created${f.sendInstructions ? ' and setup instructions sent' : ''}.`);
  }

  /* ---------- Shared ---------- */
  protected notify(text: string): void {
    this.toast.set(text);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 3200);
  }
}
