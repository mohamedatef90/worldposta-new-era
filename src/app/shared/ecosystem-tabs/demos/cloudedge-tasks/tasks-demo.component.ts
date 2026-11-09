import { Component, ElementRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faBan, faChevronDown, faChevronRight, faCircleCheck, faCirclePlus, faCircleXmark, faClock, faEllipsisVertical, faFileLines,
  faListCheck, faListUl, faMagnifyingGlass, faPencil, faPlay, faPlus, faRotate, faSpinner, faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { DemoDialogComponent } from '../demo-dialog.component';
import {
  ACTION_GROUPS, TasksDemoStore, type ActionType, type Recurring, type RunStatus, type ScheduledGroup, type ScheduledTask, type TaskForm,
} from './tasks-demo.store';

type Details = Pick<TaskForm, 'objectType' | 'objectName' | 'actionType' | 'action' | 'recurring' | 'recurringValue' | 'startDate' | 'endDate' | 'recurringTime'> & {
  maxCount: string;
};
type DetailKey = keyof Details;

/** The objects each Object Type offers, from the console's VM, database and storage mock data. */
const OBJECTS: Record<string, string[]> = {
  VirtualMachine: ['All Dev VMs', 'All Production VMs', 'prod-web-server-01', 'dev-environment-centos', 'k8s-worker-node-a'],
  Database: ['sql-database-main'],
  Storage: ['Storage Cleanup', 'backup-volume-01'],
};
const TYPE_LABEL: Record<string, string> = { VirtualMachine: 'Virtual Machine', Database: 'Database', Storage: 'Storage' };
const ONE_ACTIONS = ['Snapshot', 'Start', 'Stop', 'Run Script'];
/** How the Task Detail's action reads in the tasks table. */
const ACTION_LABEL: Record<string, string> = { Snapshot: 'Create Snapshot', Start: 'Start VM', Stop: 'Stop VM' };
const ACTION_KEY: Record<string, string> = { 'Create Snapshot': 'Snapshot', 'Start VM': 'Start', 'Stop VM': 'Stop' };

const today = () => new Date().toISOString().slice(0, 10);

/**
 * CloudEdge › Operations › Scheduled Tasks, working: grouped tasks with
 * search, Enable / Disable switches (pause and resume), Create New Task with
 * the console's Task Detail modal (One Action or Group of actions, Daily /
 * Weekly / Monthly), Edit, Log, Delete with confirmation, and Run now, which
 * shows the run on the Running Tasks page and finishes it on a timer.
 * Ported from cloudedge/src/pages/scheduled-tasks, scheduled-groups and
 * running-tasks; page content only, the console's sidebar becomes a switch.
 */
@Component({
  selector: 'app-cloudedge-tasks-demo',
  imports: [FaIconComponent, DemoDialogComponent],
  templateUrl: './tasks-demo.component.html',
  styleUrls: ['../demo.css', './tasks-demo.component.css'],
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class TasksDemoComponent {
  private readonly store = inject(TasksDemoStore);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly i = {
    ban: faBan, open: faChevronDown, closed: faChevronRight, ok: faCircleCheck, create: faCirclePlus, clock: faClock, kebab: faEllipsisVertical,
    log: faFileLines, running: faListCheck, details: faListUl, search: faMagnifyingGlass, edit: faPencil, play: faPlay, plus: faPlus,
    refresh: faRotate, spin: faSpinner, trash: faTrashCan,
  };
  protected readonly runStyle: Record<RunStatus, { tone: string; icon: IconDefinition }> = {
    Running: { tone: 'info', icon: faSpinner }, Success: { tone: 'good', icon: faCircleCheck },
    Failed: { tone: 'bad', icon: faCircleXmark }, Pending: { tone: 'warn', icon: faClock },
  };

  protected readonly view = signal<'scheduled' | 'running'>('scheduled');
  protected readonly groups = this.store.groups;
  protected readonly runs = this.store.runs;
  protected readonly searchTerm = signal('');
  protected readonly openMenu = signal<string | null>(null);
  protected readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    // Announce runs that finish on their own timer.
    let seen = untracked(this.store.event)?.seq ?? 0;
    effect(() => {
      const e = this.store.event();
      if (e && e.seq > seen) {
        seen = e.seq;
        untracked(() => this.notify(e.text));
      }
    });
  }

  /** As in the console: a group matches by name, else shows only its matching tasks. */
  protected readonly filteredGroups = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.groups();
    return this.groups().flatMap((g) => {
      if (g.name.toLowerCase().includes(term)) return [g];
      const tasks = g.tasks.filter((t) => t.action.toLowerCase().includes(term) || t.objectName.toLowerCase().includes(term) || t.name.toLowerCase().includes(term));
      return tasks.length ? [{ ...g, tasks, isExpanded: true }] : [];
    });
  });

  protected readonly runningCount = computed(() => this.runs().filter((r) => r.status === 'Running').length);

  protected recurringLabel(t: ScheduledTask): string {
    if (t.recurring === 'No') return 'No';
    if (t.recurringValue <= 1) return t.recurring;
    const unit = t.recurring === 'Daily' ? 'days' : t.recurring === 'Weekly' ? 'weeks' : 'months';
    return `Every ${t.recurringValue} ${unit}`;
  }

  /* ---------- Groups and task rows ---------- */
  protected toggleGroup(group: ScheduledGroup): void {
    this.store.toggleGroup(group.id);
  }

  protected setGroupStatus(group: ScheduledGroup, on: boolean): void {
    this.store.setGroupStatus(group.id, on ? 'Enabled' : 'Disabled');
    this.notify(`${group.name} ${on ? 'resumed' : 'paused'}.`);
  }

  protected setTaskStatus(group: ScheduledGroup, t: ScheduledTask, on: boolean, fromMenu = false): void {
    if (fromMenu) this.closeMenu();
    this.store.setTaskStatus(group.id, t.id, on ? 'Enabled' : 'Disabled');
    this.notify(`${t.name || t.action} ${on ? 'enabled' : 'disabled'}.`);
  }

  private menuTrigger: HTMLElement | null = null;

  /**
   * Where the open row menu sits, relative to the app window (the host is its
   * containing block), so the scrolling table never clips it. It opens upwards
   * when there isn't room below.
   */
  protected readonly menuPos = signal<{ top: number | null; bottom: number | null; right: number }>({ top: 0, bottom: null, right: 0 });

  protected toggleMenu(event: Event, id: string): void {
    event.stopPropagation();
    this.menuTrigger = event.currentTarget as HTMLElement;
    const box = this.host.getBoundingClientRect();
    const btn = this.menuTrigger.getBoundingClientRect();
    const up = btn.bottom + 210 > box.bottom && btn.top - box.top > 210;
    this.menuPos.set({ top: up ? null : btn.bottom - box.top + 4, bottom: up ? box.bottom - btn.top + 4 : null, right: box.right - btn.right });
    this.openMenu.update((open) => (open === id ? null : id));
  }

  protected closeMenu(): void {
    this.openMenu.set(null);
    this.menuTrigger?.focus();
  }

  protected runNow(t: ScheduledTask): void {
    this.closeMenu();
    this.store.runNow(t);
    this.view.set('running');
    this.notify(`${t.name || t.action} started. Follow it in Running Tasks.`);
  }

  protected readonly logFor = signal<ScheduledTask | null>(null);
  protected readonly logRuns = computed(() => {
    const t = this.logFor();
    return t ? this.runs().filter((r) => r.taskName === (t.name || t.action) || (r.action === t.action && r.targetResource === t.objectName)) : [];
  });

  protected openLog(t: ScheduledTask): void {
    this.closeMenu();
    this.logFor.set(t);
  }

  protected readonly deleting = signal<{ group: ScheduledGroup; task: ScheduledTask } | null>(null);

  protected askDelete(group: ScheduledGroup, t: ScheduledTask): void {
    this.closeMenu();
    this.deleting.set({ group, task: t });
  }

  protected confirmDelete(): void {
    const d = this.deleting();
    if (!d) return;
    this.store.deleteTask(d.group.id, d.task.id);
    this.deleting.set(null);
    this.notify(`Scheduled Task ${d.task.name || d.task.action} deleted.`);
  }

  /* ---------- Create New Task, and its Task Detail modal ---------- */
  protected readonly reservations = ['Reservation Alpha', 'Reservation Beta'];
  protected readonly objectTypes = Object.keys(OBJECTS);
  protected readonly recurrings: Recurring[] = ['Daily', 'Weekly', 'Monthly', 'No'];
  protected readonly actionTypes: ActionType[] = ['One Action', 'Group of actions'];

  protected readonly taskDialog = signal<{ id: string | null } | null>(null);
  protected readonly main = signal({ name: '', groupId: 'group-1', reservation: '', description: '', status: true });
  protected readonly details = signal<Details | null>(null);
  protected readonly mainSubmitted = signal(false);

  protected readonly mainErrors = computed(() => ({
    name: this.main().name.trim() ? null : 'Name is required.',
    details: this.details() ? null : 'Add the task details: what to run and when.',
    target: this.details()?.objectName ? null : 'Select a virtual machine.',
  }));

  /* Create: Name, target VM and action only; the rest takes the defaults below and stays editable with Edit. */
  protected readonly quickTargets = OBJECTS['VirtualMachine'];
  protected readonly quickActions = ONE_ACTIONS.filter((a) => a !== 'Run Script');
  protected actionText(a: string): string {
    return ACTION_LABEL[a] ?? a;
  }

  protected setQuick(key: 'objectName' | 'action', value: string): void {
    this.details.update((d) => (d ? { ...d, [key]: value } : d));
  }

  protected readonly detailsSummary = computed(() => {
    const d = this.details();
    if (!d) return null;
    const when = d.recurring === 'No' ? `once on ${d.startDate}` : `${d.recurring.toLowerCase()} at ${d.recurringTime} UTC from ${d.startDate}`;
    return `${this.actionLabel(d)} on ${d.objectName}, ${when}`;
  });

  private actionLabel(d: Pick<Details, 'action' | 'actionType'>): string {
    return d.actionType === 'One Action' ? (ACTION_LABEL[d.action] ?? d.action) : `Group: ${d.action}`;
  }

  protected setMain(key: 'name' | 'groupId' | 'reservation' | 'description', value: string): void {
    this.main.update((m) => ({ ...m, [key]: value }));
  }

  protected setMainStatus(on: boolean): void {
    this.main.update((m) => ({ ...m, status: on }));
  }

  protected openCreate(): void {
    // Defaults: first group and reservation, enabled, daily at 02:00 UTC from today, no end date.
    this.main.set({ name: '', groupId: this.groups()[0]?.id ?? '', reservation: this.reservations[0], description: '', status: true });
    this.details.set(this.blankDetails());
    this.mainSubmitted.set(false);
    this.taskDialog.set({ id: null });
  }

  protected openEdit(group: ScheduledGroup, t: ScheduledTask): void {
    this.closeMenu();
    this.main.set({ name: t.name, groupId: group.id, reservation: t.reservation, description: t.description, status: t.status === 'Enabled' });
    this.details.set({
      objectType: t.objectType, objectName: t.objectName, actionType: t.actionType,
      action: t.actionType === 'One Action' ? (ACTION_KEY[t.action] ?? t.action) : t.action,
      recurring: t.recurring, recurringValue: t.recurringValue, startDate: t.startDate, endDate: t.endDate,
      recurringTime: t.recurringTime, maxCount: String(t.maxCount === 'Unlimited' ? 10 : t.maxCount),
    });
    this.mainSubmitted.set(false);
    this.taskDialog.set({ id: t.id });
  }

  protected saveTask(): void {
    this.mainSubmitted.set(true);
    const e = this.mainErrors();
    const d = this.details();
    if (e.name || e.details || e.target || !d) return;
    const m = this.main();
    const form: TaskForm = {
      name: m.name.trim(), reservation: m.reservation, description: m.description.trim(), status: m.status ? 'Enabled' : 'Disabled',
      actionType: d.actionType, action: this.actionLabel(d).replace(/^Group: /, ''), recurring: d.recurring, recurringValue: d.recurringValue,
      objectType: d.objectType, objectName: d.objectName, type: d.actionType === 'Group of actions' ? 'Group' : TYPE_LABEL[d.objectType],
      startDate: d.startDate, endDate: d.endDate, recurringTime: d.recurringTime, maxCount: Number(d.maxCount),
    };
    const id = this.taskDialog()?.id;
    if (id) {
      this.store.updateTask(id, m.groupId, form);
      this.notify(`${form.name} saved.`);
    } else {
      this.store.addTask(m.groupId, form);
      this.notify(`Task ${form.name} created: ${this.recurringLabel({ ...form, id: '' }).toLowerCase()} at ${form.recurringTime} UTC.`);
    }
    this.searchTerm.set('');
    this.taskDialog.set(null);
  }

  /* Task Detail: edits a draft, copied into the task on Save. */
  protected readonly detailOpen = signal(false);
  protected readonly draft = signal<Details>(this.blankDetails());
  protected readonly draftSubmitted = signal(false);

  private blankDetails(): Details {
    return { objectType: 'VirtualMachine', objectName: '', actionType: 'One Action', action: 'Snapshot', recurring: 'Daily', recurringValue: 1, startDate: today(), endDate: '', recurringTime: '02:00', maxCount: '10' };
  }

  protected readonly objects = computed(() => OBJECTS[this.draft().objectType] ?? []);
  protected readonly actionOptions = computed(() => (this.draft().actionType === 'One Action' ? ONE_ACTIONS : ACTION_GROUPS));

  protected readonly draftErrors = computed(() => {
    const d = this.draft();
    return {
      objectName: d.objectName ? null : 'Select an object.',
      maxCount: Number(d.maxCount) >= 1 ? null : 'Max Count must be at least 1.',
      recurringValue: d.recurringValue >= 1 ? null : 'Recurring Value must be at least 1.',
      startDate: d.startDate ? null : 'Start Date is required.',
      endDate: d.endDate && d.startDate && d.endDate < d.startDate ? 'End Date must be on or after the Start Date.' : null,
      recurringTime: d.recurringTime ? null : 'Recurring Time is required.',
    };
  });

  protected draftError(key: keyof ReturnType<TasksDemoComponent['draftErrors']>): string | null {
    return this.draftSubmitted() ? this.draftErrors()[key] : null;
  }

  protected setDraft<K extends DetailKey>(key: K, value: Details[K]): void {
    this.draft.update((d) => {
      const next = { ...d, [key]: value };
      if (key === 'objectType') next.objectName = '';
      if (key === 'actionType') next.action = value === 'One Action' ? ONE_ACTIONS[0] : ACTION_GROUPS[0];
      return next;
    });
  }

  protected openDetails(): void {
    this.draft.set(this.details() ?? this.blankDetails());
    this.draftSubmitted.set(false);
    this.detailOpen.set(true);
  }

  protected saveDetails(): void {
    this.draftSubmitted.set(true);
    if (Object.values(this.draftErrors()).some(Boolean)) return;
    this.details.set(this.draft());
    this.detailOpen.set(false);
  }

  /* ---------- Running Tasks ---------- */
  protected readonly statusOptions: ('all' | RunStatus)[] = ['all', 'Running', 'Success', 'Failed', 'Pending'];
  protected readonly statusFilter = signal<'all' | RunStatus>('all');
  protected readonly refreshing = signal(false);
  protected readonly filteredRuns = computed(() => {
    const f = this.statusFilter();
    return f === 'all' ? this.runs() : this.runs().filter((r) => r.status === f);
  });

  protected refresh(): void {
    this.refreshing.set(true);
    setTimeout(() => {
      this.store.refresh();
      this.refreshing.set(false);
      this.notify('Running tasks refreshed.');
    }, 500);
  }

  /* ---------- Shared ---------- */
  protected notify(text: string): void {
    this.toast.set(text);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 3200);
  }

  protected onDocumentClick(event: Event): void {
    if (!(event.target as Element | null)?.closest('.d-menu-wrap')) this.openMenu.set(null);
  }
}
