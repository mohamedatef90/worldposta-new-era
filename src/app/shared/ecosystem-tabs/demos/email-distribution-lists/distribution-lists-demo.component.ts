import { Component, ElementRef, computed, inject, signal } from '@angular/core';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft, faCircleCheck, faCirclePlus, faFilter, faMagnifyingGlass, faPencil, faTrashCan, faUserMinus, faUserPlus, faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { DemoDialogComponent } from '../demo-dialog.component';
import { MAILBOX_DOMAINS, MailboxDemoStore } from '../email-mailboxes/mailbox-demo.store';
import { DistributionListsDemoStore, type DistributionList, type DlMember } from './distribution-lists-demo.store';

interface DlFilters { displayName: string; domain: string; dateFrom: string; dateTo: string }
const NO_FILTERS: DlFilters = { displayName: '', domain: 'ALL', dateFrom: '', dateTo: '' };

const blankForm = () => ({
  displayName: '', emailUser: '', emailDomain: MAILBOX_DOMAINS[0], managerEmail: '', note: '', hideFromAddressBook: false,
  members: [] as readonly DlMember[],
});
type DlForm = ReturnType<typeof blankForm>;
type DlTab = 'general' | 'settings' | 'members';

/**
 * Email Admin Suite › Exchange Email › Distribution Lists, working: the lists
 * table with selection and bulk delete, Filters & Search, the Add
 * Distribution List panel with its Select Manager Email picker, and the Edit
 * Distribution List page in-window (General, Settings and Members tabs, where
 * members are added from the organization's mailboxes and removed). Ported
 * from DistributionListsPage.tsx and EditDistributionListPage.tsx in the
 * unified sign-in app; only the page content is shown.
 */
@Component({
  selector: 'app-email-distribution-lists-demo',
  imports: [FaIconComponent, DatePipe, NgTemplateOutlet, DemoDialogComponent],
  templateUrl: './distribution-lists-demo.component.html',
  styleUrls: ['../demo.css', './distribution-lists-demo.component.css'],
})
export class DistributionListsDemoComponent {
  private readonly store = inject(DistributionListsDemoStore);
  private readonly mailboxes = inject(MailboxDemoStore).mailboxes;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly i = {
    back: faArrowLeft, ok: faCircleCheck, add: faCirclePlus, filter: faFilter, search: faMagnifyingGlass, pencil: faPencil,
    trash: faTrashCan, removeUser: faUserMinus, addUser: faUserPlus, close: faXmark,
  };
  protected readonly domains = MAILBOX_DOMAINS;
  protected readonly tabs: readonly { id: DlTab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'settings', label: 'Settings' },
    { id: 'members', label: 'Members' },
  ];

  protected readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  /* ---------- Filters & Search ---------- */
  protected readonly filters = signal<DlFilters>({ ...NO_FILTERS });
  protected readonly draftFilters = signal<DlFilters>({ ...NO_FILTERS });
  protected readonly filterOpen = signal(false);
  protected readonly activeFilterCount = computed(() => {
    const f = this.filters();
    return (Object.keys(NO_FILTERS) as (keyof DlFilters)[]).filter((k) => f[k] !== NO_FILTERS[k]).length;
  });

  protected readonly lists = computed(() => {
    const f = this.filters();
    const name = f.displayName.trim().toLowerCase();
    return this.store
      .lists()
      .filter((l) => {
        const created = new Date(l.creationDate);
        return (
          (!name || l.displayName.toLowerCase().includes(name)) &&
          (f.domain === 'ALL' || l.primaryEmail.split('@')[1] === f.domain) &&
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
  protected setDraftFilter(key: keyof DlFilters, value: string): void {
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

  /* ---------- Selection, bulk and single delete ---------- */
  protected readonly selected = signal<readonly string[]>([]);
  protected readonly allSelected = computed(() => this.lists().length > 0 && this.lists().every((l) => this.selected().includes(l.id)));
  protected readonly deleting = signal<readonly DistributionList[] | null>(null);

  protected toggleOne(id: string, checked: boolean): void {
    this.selected.update((ids) => (checked ? [...ids, id] : ids.filter((x) => x !== id)));
  }
  protected toggleAll(checked: boolean): void {
    this.selected.set(checked ? this.lists().map((l) => l.id) : []);
  }
  protected askBulkDelete(): void {
    this.deleting.set(this.store.lists().filter((l) => this.selected().includes(l.id)));
  }
  protected confirmDelete(): void {
    const lists = this.deleting() ?? [];
    const ids = lists.map((l) => l.id);
    this.store.remove(ids);
    this.selected.update((sel) => sel.filter((x) => !ids.includes(x)));
    this.deleting.set(null);
    this.notify(lists.length === 1 ? `${lists[0].displayName} deleted.` : `${lists.length} distribution lists deleted.`);
  }

  /* ---------- Add Distribution List panel and the Edit page share one form ---------- */
  protected readonly addOpen = signal(false);
  protected readonly editing = signal<DistributionList | null>(null);
  protected readonly tab = signal<DlTab>('general');
  protected readonly form = signal<DlForm>(blankForm());
  protected readonly submitted = signal(false);

  protected readonly errors = computed(() => {
    const f = this.form();
    const e: Partial<Record<'displayName' | 'emailUser', string>> = {};
    if (!f.displayName.trim()) e.displayName = 'Display Name is required.';
    const user = f.emailUser.trim();
    const address = `${user}@${f.emailDomain}`.toLowerCase();
    const selfId = this.editing()?.id;
    if (!user) e.emailUser = 'Primary Email Address is required.';
    else if (!/^[a-z0-9._-]+$/i.test(user)) e.emailUser = 'Use letters, numbers, dots, dashes or underscores.';
    else if (this.store.lists().some((l) => l.id !== selfId && l.primaryEmail === address) || this.mailboxes().some((m) => m.login === address)) {
      e.emailUser = 'This email address is already in use.';
    }
    return e;
  });
  protected readonly hasErrors = computed(() => Object.keys(this.errors()).length > 0);
  protected err(key: 'displayName' | 'emailUser'): string | null {
    return this.submitted() ? (this.errors()[key] ?? null) : null;
  }
  protected set<K extends keyof DlForm>(key: K, value: DlForm[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  protected openAdd(): void {
    this.form.set(blankForm());
    this.submitted.set(false);
    this.editing.set(null);
    this.addOpen.set(true);
  }

  protected create(): void {
    this.submitted.set(true);
    if (this.hasErrors()) return;
    const f = this.form();
    const list: DistributionList = {
      id: `dl_${Date.now()}`,
      displayName: f.displayName.trim(),
      primaryEmail: `${f.emailUser.trim()}@${f.emailDomain}`.toLowerCase(),
      creationDate: new Date().toISOString(),
      managerEmail: f.managerEmail || undefined,
      note: f.note.trim(),
      hideFromAddressBook: f.hideFromAddressBook,
      members: [],
    };
    this.store.add(list);
    this.addOpen.set(false);
    this.notify(`Distribution List ${list.displayName} created successfully.`);
  }

  protected openEdit(list: DistributionList): void {
    const [emailUser, emailDomain] = list.primaryEmail.split('@');
    this.form.set({
      displayName: list.displayName, emailUser, emailDomain, managerEmail: list.managerEmail ?? '', note: list.note,
      hideFromAddressBook: list.hideFromAddressBook, members: list.members,
    });
    this.submitted.set(false);
    this.tab.set('general');
    this.editing.set(list);
    this.focusTop();
  }

  protected closeEdit(): void {
    this.editing.set(null);
    this.focusTop();
  }

  protected saveEdit(): void {
    const list = this.editing();
    this.submitted.set(true);
    if (!list) return;
    if (this.hasErrors()) {
      this.tab.set('general');
      return;
    }
    const f = this.form();
    this.store.update({
      ...list,
      displayName: f.displayName.trim(),
      primaryEmail: `${f.emailUser.trim()}@${f.emailDomain}`.toLowerCase(),
      managerEmail: f.managerEmail || undefined,
      note: f.note.trim(),
      hideFromAddressBook: f.hideFromAddressBook,
      members: f.members,
    });
    this.editing.set(null);
    this.focusTop();
    this.notify(`Distribution List ${f.displayName.trim()} updated successfully.`);
  }

  /** Arrow keys move between the edit page tabs, as a tablist does. */
  protected onTabKey(event: KeyboardEvent): void {
    const order = this.tabs.map((t) => t.id);
    const at = order.indexOf(this.tab());
    const next = event.key === 'ArrowRight' ? at + 1 : event.key === 'ArrowLeft' ? at - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? order.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    const id = order[(next + order.length) % order.length];
    this.tab.set(id);
    setTimeout(() => this.host.querySelector<HTMLElement>(`#dl-tab-${id}`)?.focus());
  }

  /* ---------- Select Manager Email ---------- */
  protected readonly managerOpen = signal(false);
  protected readonly managerSearch = signal('');
  protected readonly managerOptions = computed(() => {
    const q = this.managerSearch().trim().toLowerCase();
    return this.mailboxes().filter((m) => m.login.toLowerCase().includes(q) || m.displayName.toLowerCase().includes(q));
  });
  protected openManager(): void {
    this.managerSearch.set('');
    this.managerOpen.set(true);
  }
  protected pickManager(email: string): void {
    this.set('managerEmail', email);
    this.managerOpen.set(false);
  }

  /* ---------- Members ---------- */
  protected readonly memberOpen = signal(false);
  protected readonly memberSearch = signal('');
  protected readonly memberPicks = signal<readonly string[]>([]);
  protected readonly memberOptions = computed(() => {
    const q = this.memberSearch().trim().toLowerCase();
    const current = this.form().members.map((m) => m.email);
    return this.mailboxes().filter(
      (m) => !current.includes(m.login) && (m.login.toLowerCase().includes(q) || m.displayName.toLowerCase().includes(q)),
    );
  });
  protected openMembers(): void {
    this.memberSearch.set('');
    this.memberPicks.set([]);
    this.memberOpen.set(true);
  }
  protected togglePick(email: string, checked: boolean): void {
    this.memberPicks.update((p) => (checked ? [...p, email] : p.filter((x) => x !== email)));
  }
  protected addMembers(): void {
    const picks = this.mailboxes().filter((m) => this.memberPicks().includes(m.login));
    this.set('members', [...this.form().members, ...picks.map((m) => ({ displayName: m.displayName, email: m.login }))]);
    this.memberOpen.set(false);
    this.notify(`${picks.length} ${picks.length === 1 ? 'member' : 'members'} added. Save Changes to apply.`);
  }
  protected removeMember(member: DlMember): void {
    this.set('members', this.form().members.filter((m) => m.email !== member.email));
    this.notify(`${member.displayName} removed. Save Changes to apply.`);
    setTimeout(() => this.host.querySelector<HTMLElement>('#dl-add-members')?.focus());
  }

  /* ---------- Shared ---------- */
  /** Moves focus to the page heading when the page swaps between the table and the edit page. */
  private focusTop(): void {
    setTimeout(() => this.host.querySelector<HTMLElement>('#dl-demo-title')?.focus());
  }

  protected notify(text: string): void {
    this.toast.set(text);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 3200);
  }
}
