import { Component, ElementRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowRotateLeft, faChevronLeft, faChevronRight, faCircleCheck, faDatabase, faEllipsisVertical, faEye, faMagnifyingGlass,
  faPencil, faPlay, faPlus, faServer, faSpinner, faTrashCan, faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { DemoDialogComponent } from '../demo-dialog.component';
import { ALL_VMS, BackupDemoStore, type BackupJob, type Frequency, type JobForm, type RestoreRequest, type RestoreStatus } from './backup-demo.store';

type JobTab = 'Details' | 'VM' | 'Storage' | 'Schedule';

const BLANK_JOB: JobForm = { name: '', description: '', reservation: 'VDC1', status: true, selectedVmIds: [], frequency: 'Daily', time: '02:00', retentionDays: 14, storagePolicy: 'Standard' };

/**
 * CloudEdge › Operations › Backup, working: Backup Jobs (search, High
 * Priority and Status switches, Run now, Create / Edit Job with the
 * console's Details · VM · Storage · Schedule tabs and VM transfer list,
 * delete with confirmation) and Restore Requests (create one and watch it go
 * Pending → In Progress → Completed, view, delete). Ported from
 * cloudedge/src/pages/backup/jobs and backup/restore-requests; the console
 * reaches them from its sidebar, here a segmented switch does.
 */
@Component({
  selector: 'app-cloudedge-backup-demo',
  imports: [FaIconComponent, DemoDialogComponent],
  templateUrl: './backup-demo.component.html',
  styleUrls: ['../demo.css', './backup-demo.component.css'],
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class BackupDemoComponent {
  private readonly store = inject(BackupDemoStore);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly i = {
    restore: faArrowRotateLeft, left: faChevronLeft, right: faChevronRight, ok: faCircleCheck, db: faDatabase, kebab: faEllipsisVertical,
    view: faEye, search: faMagnifyingGlass, edit: faPencil, run: faPlay, plus: faPlus, server: faServer, spin: faSpinner, trash: faTrashCan,
    warn: faTriangleExclamation,
  };
  protected readonly statusTone: Record<RestoreStatus, string> = { Pending: 'warn', 'In Progress': 'info', Completed: 'good', Failed: 'bad' };

  protected readonly view = signal<'jobs' | 'requests'>('jobs');
  protected readonly jobs = this.store.jobs;
  protected readonly requests = this.store.requests;
  protected readonly jobSearch = signal('');
  protected readonly requestSearch = signal('');
  protected readonly openMenu = signal<string | null>(null);
  protected readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    // Announce runs and restores that finish on their own timers.
    let seen = untracked(this.store.event)?.seq ?? 0;
    effect(() => {
      const e = this.store.event();
      if (e && e.seq > seen) {
        seen = e.seq;
        untracked(() => this.notify(e.text));
      }
    });
  }

  protected readonly filteredJobs = computed(() => {
    const term = this.jobSearch().trim().toLowerCase();
    return this.jobs().filter((j) => !term || j.name.toLowerCase().includes(term) || j.description.toLowerCase().includes(term) || j.reservation.toLowerCase().includes(term));
  });

  protected readonly filteredRequests = computed(() => {
    const term = this.requestSearch().trim().toLowerCase();
    return this.requests().filter((r) => !term || r.name.toLowerCase().includes(term) || r.backupJobName.toLowerCase().includes(term) || r.status.toLowerCase().includes(term));
  });

  protected vmNames(job: BackupJob): string {
    return ALL_VMS.filter((vm) => job.selectedVmIds.includes(vm.id)).map((vm) => vm.name).join(', ') || 'No VMs';
  }

  /* ---------- Row menus ---------- */
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
    const up = btn.bottom + 190 > box.bottom && btn.top - box.top > 190;
    this.menuPos.set({ top: up ? null : btn.bottom - box.top + 4, bottom: up ? box.bottom - btn.top + 4 : null, right: box.right - btn.right });
    this.openMenu.update((open) => (open === id ? null : id));
  }

  protected closeMenu(): void {
    this.openMenu.set(null);
    this.menuTrigger?.focus();
  }

  /* ---------- Jobs ---------- */
  protected setStatus(job: BackupJob, status: boolean): void {
    this.store.setStatus(job.id, status);
    this.notify(`${job.name} ${status ? 'enabled' : 'disabled'}.`);
  }

  protected setPriority(job: BackupJob, high: boolean): void {
    this.store.setPriority(job.id, high);
    this.notify(`${job.name} is ${high ? 'now' : 'no longer'} high priority.`);
  }

  protected runNow(job: BackupJob): void {
    this.closeMenu();
    if (!job.selectedVmIds.length) {
      this.notify(`${job.name} has no VMs to back up. Edit the job to add some.`);
      return;
    }
    this.store.runNow(job.id);
    this.notify(`${job.name} started.`);
  }

  protected readonly deletingJob = signal<BackupJob | null>(null);
  protected readonly deleteTyped = signal('');

  protected askDeleteJob(job: BackupJob): void {
    this.closeMenu();
    this.deleteTyped.set('');
    this.deletingJob.set(job);
  }

  protected confirmDeleteJob(): void {
    const job = this.deletingJob();
    if (!job || this.deleteTyped() !== job.name) return;
    this.store.deleteJob(job.id);
    this.deletingJob.set(null);
    this.notify(`Backup Job ${job.name} deleted.`);
  }

  /* ---------- Create / Edit Job (the console's tabbed modal) ---------- */
  protected readonly tabs: JobTab[] = ['Details', 'VM', 'Storage', 'Schedule'];
  protected readonly frequencies: Frequency[] = ['Daily', 'Weekly', 'Monthly'];
  protected readonly storagePolicies = ['Standard', 'Performance', 'Archive'];
  protected readonly reservations = ['VDC1', 'VDC2', 'VDC3'];
  protected readonly jobDialog = signal<{ id: string | null } | null>(null);
  protected readonly activeTab = signal<JobTab>('Details');
  protected readonly jobForm = signal<JobForm>(BLANK_JOB);
  protected readonly jobSubmitted = signal(false);

  protected readonly jobErrors = computed(() => {
    const f = this.jobForm();
    const id = this.jobDialog()?.id;
    const e: Partial<Record<'name' | 'vms' | 'retention' | 'time', string>> = {};
    if (!f.name.trim()) e.name = 'Name is required.';
    else if (this.jobs().some((j) => j.name === f.name.trim() && j.id !== id)) e.name = 'A backup job with this name already exists.';
    if (!f.selectedVmIds.length) e.vms = 'Select at least one virtual machine to back up.';
    if (!(f.retentionDays >= 1 && f.retentionDays <= 365)) e.retention = 'Keep backups for 1 to 365 days.';
    if (!f.time) e.time = 'Choose a start time.';
    return e;
  });

  /** Which tab each error lives on, so Save can take the visitor to it. */
  private readonly errorTab: Record<string, JobTab> = { name: 'Details', vms: 'VM', retention: 'Storage', time: 'Schedule' };

  protected jobError(key: 'name' | 'vms' | 'retention' | 'time'): string | null {
    return this.jobSubmitted() ? (this.jobErrors()[key] ?? null) : null;
  }

  protected tabHasError(tab: JobTab): boolean {
    return this.jobSubmitted() && Object.keys(this.jobErrors()).some((k) => this.errorTab[k] === tab);
  }

  protected setJob<K extends keyof JobForm>(key: K, value: JobForm[K]): void {
    this.jobForm.update((f) => ({ ...f, [key]: value }));
  }

  protected openCreateJob(): void {
    this.jobForm.set(BLANK_JOB);
    this.resetTransfer();
    this.jobDialog.set({ id: null });
  }

  protected openEditJob(job: BackupJob): void {
    this.closeMenu();
    const { name, description, reservation, status, selectedVmIds, frequency, time, retentionDays, storagePolicy } = job;
    this.jobForm.set({ name, description, reservation, status, selectedVmIds: [...selectedVmIds], frequency, time, retentionDays, storagePolicy });
    this.resetTransfer();
    this.jobDialog.set({ id: job.id });
  }

  private resetTransfer(): void {
    this.activeTab.set('Details');
    this.jobSubmitted.set(false);
    this.vmSearchAvailable.set('');
    this.vmSearchSelected.set('');
    this.pickAvailable.set([]);
    this.pickSelected.set([]);
  }

  protected onTabKey(event: KeyboardEvent, index: number): void {
    const keys: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: this.tabs.length - 1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const next = (keys[event.key] + this.tabs.length) % this.tabs.length;
    this.activeTab.set(this.tabs[next]);
    ((event.currentTarget as HTMLElement).parentElement?.children[next] as HTMLElement | undefined)?.focus();
  }

  protected saveJob(): void {
    this.jobSubmitted.set(true);
    const errors = Object.keys(this.jobErrors());
    if (errors.length) {
      this.activeTab.set(this.errorTab[errors[0]]);
      return;
    }
    const f = { ...this.jobForm(), name: this.jobForm().name.trim(), description: this.jobForm().description.trim() };
    const id = this.jobDialog()?.id;
    if (id) {
      this.store.updateJob(id, f);
      this.notify(`${f.name} saved.`);
    } else {
      this.store.addJob(f);
      this.notify(`Backup Job ${f.name} created: ${f.frequency.toLowerCase()} at ${f.time}, kept ${f.retentionDays} days.`);
    }
    this.jobDialog.set(null);
  }

  /* VM transfer list: pick on either side, then move across. */
  protected readonly vmSearchAvailable = signal('');
  protected readonly vmSearchSelected = signal('');
  protected readonly pickAvailable = signal<string[]>([]);
  protected readonly pickSelected = signal<string[]>([]);

  protected readonly availableVms = computed(() => {
    const term = this.vmSearchAvailable().toLowerCase();
    return ALL_VMS.filter((vm) => !this.jobForm().selectedVmIds.includes(vm.id) && vm.name.toLowerCase().includes(term));
  });
  protected readonly availableCount = computed(() => ALL_VMS.length - this.jobForm().selectedVmIds.length);
  protected readonly chosenVms = computed(() => {
    const term = this.vmSearchSelected().toLowerCase();
    return ALL_VMS.filter((vm) => this.jobForm().selectedVmIds.includes(vm.id) && vm.name.toLowerCase().includes(term));
  });

  protected togglePick(list: 'available' | 'selected', id: string): void {
    const target = list === 'available' ? this.pickAvailable : this.pickSelected;
    target.update((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  protected moveToSelected(): void {
    this.setJob('selectedVmIds', [...this.jobForm().selectedVmIds, ...this.pickAvailable()]);
    this.pickAvailable.set([]);
  }

  protected moveToAvailable(): void {
    const drop = this.pickSelected();
    this.setJob('selectedVmIds', this.jobForm().selectedVmIds.filter((id) => !drop.includes(id)));
    this.pickSelected.set([]);
  }

  /* ---------- Restore Requests ---------- */
  protected readonly requestDialog = signal(false);
  protected readonly reqForm = signal({ name: '', jobId: '', point: '' });
  protected readonly reqSubmitted = signal(false);

  protected readonly reqJob = computed(() => this.jobs().find((j) => j.id === this.reqForm().jobId) ?? null);
  protected readonly reqPoints = computed(() => {
    const job = this.reqJob();
    return job ? this.store.restorePoints(job) : [];
  });

  protected readonly reqErrors = computed(() => {
    const f = this.reqForm();
    return {
      name: f.name.trim() ? null : 'Name is required.',
      job: f.jobId ? null : 'Select a backup job.',
      point: f.point ? null : 'Select a restore point.',
    };
  });

  protected reqError(key: 'name' | 'job' | 'point'): string | null {
    return this.reqSubmitted() ? this.reqErrors()[key] : null;
  }

  protected setReq(key: 'name' | 'jobId' | 'point', value: string): void {
    this.reqForm.update((f) => ({ ...f, [key]: value, ...(key === 'jobId' ? { point: '' } : {}) }));
  }

  protected openCreateRequest(job?: BackupJob): void {
    if (job) this.closeMenu();
    this.reqForm.set({ name: job ? `Restore ${job.name}` : '', jobId: job?.id ?? '', point: '' });
    if (job) this.reqForm.update((f) => ({ ...f, point: this.store.restorePoints(job)[0] }));
    this.reqSubmitted.set(false);
    this.requestDialog.set(true);
  }

  protected submitRequest(): void {
    this.reqSubmitted.set(true);
    const e = this.reqErrors();
    const job = this.reqJob();
    if (e.name || e.job || e.point || !job) return;
    const req = this.store.createRequest(this.reqForm().name.trim(), job.name, this.reqForm().point);
    this.requestDialog.set(false);
    this.view.set('requests');
    this.notify(`Restore request ${req.name} submitted. Status: Pending.`);
  }

  protected readonly viewing = signal<string | null>(null);
  protected readonly viewed = computed(() => this.requests().find((r) => r.id === this.viewing()) ?? null);
  protected readonly steps: RestoreStatus[] = ['Pending', 'In Progress', 'Completed'];

  protected stepDone(req: RestoreRequest, step: RestoreStatus): boolean {
    return this.steps.indexOf(req.status) >= this.steps.indexOf(step);
  }

  protected openView(req: RestoreRequest): void {
    this.closeMenu();
    this.viewing.set(req.id);
  }

  protected readonly deletingRequest = signal<RestoreRequest | null>(null);

  protected askDeleteRequest(req: RestoreRequest): void {
    this.closeMenu();
    this.deletingRequest.set(req);
  }

  protected confirmDeleteRequest(): void {
    const req = this.deletingRequest();
    if (!req) return;
    this.store.deleteRequest(req.id);
    this.deletingRequest.set(null);
    this.notify(`Restore request ${req.name} deleted.`);
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
