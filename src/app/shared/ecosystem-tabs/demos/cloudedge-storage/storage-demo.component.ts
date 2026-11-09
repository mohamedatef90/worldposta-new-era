import { Component, computed, inject, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowDown, faArrowUp, faCamera, faCircleCheck, faCircleInfo, faEllipsisVertical, faExpand, faFolderOpen, faGear, faHardDrive,
  faLink, faLinkSlash, faMagnifyingGlass, faPlus, faTrashCan, faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { DemoDialogComponent } from '../demo-dialog.component';
import { VmDemoStore } from '../cloudedge-vms/vm-demo.store';
import { StorageDemoStore, type AccessLevel, type Bucket, type Disk, type DiskType, type Snapshot } from './storage-demo.store';

type StorageTab = 'disks' | 'objectStorage' | 'snapshots';
type DiskSort = 'name' | 'size' | 'type' | 'attachedTo' | 'diskNumber' | 'creationDate';
type SnapSort = 'name' | 'sourceDisk' | 'size' | 'creationTime';

/** The dialog that is open, if any, and what it acts on. */
type Dialog =
  | { kind: 'disk'; edit: Disk | null }
  | { kind: 'attach'; disk: Disk }
  | { kind: 'detach'; disk: Disk }
  | { kind: 'deleteDisk'; disk: Disk }
  | { kind: 'snapshot'; disk: Disk | null }
  | { kind: 'fromSnapshot'; snap: Snapshot }
  | { kind: 'deleteSnapshot'; snap: Snapshot }
  | { kind: 'bucket' }
  | { kind: 'deleteBucket'; bucket: Bucket };

interface FormState {
  name: string;
  size: number;
  type: DiskType;
  vm: string;
  diskNumber: string;
  diskId: string;
  region: string;
  access: AccessLevel;
  typed: string;
}

const BLANK: FormState = { name: '', size: 100, type: 'Standard SSD', vm: '', diskNumber: '', diskId: '', region: 'us-east-1', access: 'Private', typed: '' };
const THREE_DAYS = 3 * 24 * 3600_000;

/**
 * CloudEdge › Storage, working: the Capacity Overview, and the Disks, Object
 * Storage and Snapshots tabs with search and sorting. Create, resize, attach,
 * detach and delete disks; create snapshots (from a disk's menu or the
 * Create Snapshot dialog), create a disk from a snapshot, and create or
 * delete buckets. Ported from cloudedge/src/pages/storage (storage.component
 * and its create-edit-disk, attach-disk and create-snapshot modals); only the
 * page content is shown.
 */
@Component({
  selector: 'app-cloudedge-storage-demo',
  imports: [FaIconComponent, DemoDialogComponent],
  templateUrl: './storage-demo.component.html',
  styleUrls: ['../demo.css', './storage-demo.component.css'],
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class CloudedgeStorageDemoComponent {
  protected readonly store = inject(StorageDemoStore);
  private readonly vmStore = inject(VmDemoStore);

  protected readonly i = {
    plus: faPlus, search: faMagnifyingGlass, kebab: faEllipsisVertical, up: faArrowUp, down: faArrowDown, ok: faCircleCheck,
    info: faCircleInfo, warn: faTriangleExclamation, attach: faLink, detach: faLinkSlash, snapshot: faCamera, resize: faExpand,
    trash: faTrashCan, disk: faHardDrive, files: faFolderOpen, settings: faGear,
  };

  protected readonly diskTypes: DiskType[] = ['Standard SSD', 'High-Performance SSD', 'Archive HDD'];
  protected readonly regions = ['us-east-1', 'us-west-2', 'eu-central-1'];
  protected readonly vms = this.vmStore.virtualMachines;
  protected readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  /* ---------- Capacity Overview ---------- */
  protected readonly usedPercent = computed(() => Math.min(100, (this.store.provisioned() / this.store.totalCapacity) * 100));

  /* ---------- Tabs (arrow keys move between them) ---------- */
  protected readonly tabs: { id: StorageTab; label: string }[] = [
    { id: 'disks', label: 'Disks' },
    { id: 'objectStorage', label: 'Object Storage' },
    { id: 'snapshots', label: 'Snapshots' },
  ];
  protected readonly activeTab = signal<StorageTab>('disks');

  protected selectTab(tab: StorageTab): void {
    this.activeTab.set(tab);
    this.openMenu.set(null);
  }

  protected onTabKey(event: KeyboardEvent): void {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const n = this.tabs.findIndex((t) => t.id === this.activeTab());
    const last = this.tabs.length - 1;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? last : event.key === 'ArrowLeft' ? (n === 0 ? last : n - 1) : n === last ? 0 : n + 1;
    this.selectTab(this.tabs[next].id);
    const list = (event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role="tab"]');
    queueMicrotask(() => list[next]?.focus());
  }

  /* ---------- Disks: search and sort ---------- */
  protected readonly diskSearch = signal('');
  protected readonly diskSort = signal<{ col: DiskSort; dir: 'asc' | 'desc' }>({ col: 'name', dir: 'asc' });
  protected readonly diskCols: { col: DiskSort; label: string }[] = [
    { col: 'name', label: 'Name' }, { col: 'size', label: 'Size' }, { col: 'type', label: 'Type' },
    { col: 'attachedTo', label: 'Attached To' }, { col: 'diskNumber', label: 'Disk #' }, { col: 'creationDate', label: 'Creation Date' },
  ];

  protected readonly filteredDisks = computed(() => {
    const term = this.diskSearch().trim().toLowerCase();
    const { col, dir } = this.diskSort();
    const list = this.store.disks().filter((d) => d.name.toLowerCase().includes(term) || (d.attachedTo ?? '').toLowerCase().includes(term));
    return [...list].sort((a, b) => compare(a[col], b[col]) * (dir === 'asc' ? 1 : -1));
  });

  protected sortDisks(col: DiskSort): void {
    this.diskSort.update((s) => (s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' }));
  }

  /* ---------- Snapshots: search and sort ---------- */
  protected readonly snapSearch = signal('');
  protected readonly snapSort = signal<{ col: SnapSort; dir: 'asc' | 'desc' }>({ col: 'creationTime', dir: 'desc' });
  protected readonly snapCols: { col: SnapSort; label: string }[] = [
    { col: 'name', label: 'Snapshot Name' }, { col: 'sourceDisk', label: 'Source Disk' }, { col: 'size', label: 'Size' }, { col: 'creationTime', label: 'Creation Time' },
  ];

  protected readonly filteredSnapshots = computed(() => {
    const term = this.snapSearch().trim().toLowerCase();
    const { col, dir } = this.snapSort();
    const list = this.store.snapshots().filter((s) => s.name.toLowerCase().includes(term) || s.sourceDisk.toLowerCase().includes(term));
    return [...list].sort((a, b) => compare(a[col], b[col]) * (dir === 'asc' ? 1 : -1));
  });

  protected sortSnapshots(col: SnapSort): void {
    this.snapSort.update((s) => (s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'desc' }));
  }

  protected isOld(snap: Snapshot): boolean {
    return Date.now() - new Date(snap.creationTime).getTime() > THREE_DAYS;
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  /* ---------- Row menus ---------- */
  protected readonly openMenu = signal<string | null>(null);
  private menuTrigger: HTMLElement | null = null;

  protected toggleMenu(event: Event, id: string): void {
    event.stopPropagation();
    this.menuTrigger = event.currentTarget as HTMLElement;
    this.openMenu.update((open) => (open === id ? null : id));
  }

  protected closeMenu(): void {
    this.openMenu.set(null);
    this.menuTrigger?.focus();
  }

  /** Menus near the bottom of a table open upwards, as the console's do, so the table does not clip them. */
  protected menuUp(index: number, count: number): boolean {
    return index >= 2 && index >= count - 2;
  }

  /* ---------- Dialogs ---------- */
  protected readonly dialog = signal<Dialog | null>(null);
  protected readonly f = signal<FormState>({ ...BLANK });
  protected readonly submitted = signal(false);

  protected open(dialog: Dialog, patch: Partial<FormState> = {}): void {
    if (this.openMenu()) this.closeMenu();
    this.f.set({ ...BLANK, ...patch });
    this.submitted.set(false);
    this.dialog.set(dialog);
  }

  protected close(): void {
    this.dialog.set(null);
  }

  protected set<K extends keyof FormState>(key: K, value: FormState[K]): void {
    this.f.update((f) => {
      const next = { ...f, [key]: value };
      // A different VM frees a different set of disk numbers, and has different disks.
      if (key === 'vm') {
        next.diskNumber = '';
        next.diskId = '';
      }
      return next;
    });
  }

  protected num(value: string): number {
    return value === '' ? NaN : Number(value);
  }

  protected readonly freeNumbers = computed(() => (this.f().vm ? this.store.freeDiskNumbers(this.f().vm) : []));
  protected readonly disksOfVm = computed(() => this.store.disks().filter((d) => d.attachedTo === this.f().vm));

  /** Validation for whichever dialog is open, in the console's words where it has them. */
  protected readonly errors = computed<Record<string, string>>(() => {
    const d = this.dialog();
    const f = this.f();
    const e: Record<string, string> = {};
    if (!d) return e;
    const name = f.name.trim();
    const diskExists = (n: string) => this.store.disks().some((x) => x.name === n);
    const available = this.store.available();
    switch (d.kind) {
      case 'disk':
        if (d.edit) {
          if (!(f.size > d.edit.size)) e['size'] = `New size must be larger than the current ${d.edit.size} GB.`;
          else if (f.size - d.edit.size > available) e['size'] = `Only ${available} GB of storage is available.`;
        } else {
          if (!name) e['name'] = 'Disk Name is required.';
          else if (diskExists(name)) e['name'] = 'A disk with this name already exists.';
          if (!(f.size >= 1)) e['size'] = 'Size must be at least 1 GB.';
          else if (f.size > available) e['size'] = `Only ${available} GB of storage is available.`;
          if (f.vm && f.diskNumber === '') e['diskNumber'] = 'Please select a disk number.';
        }
        break;
      case 'attach':
        if (!f.vm) e['vm'] = 'Select a virtual machine.';
        else if (f.diskNumber === '') e['diskNumber'] = 'Please select a disk number.';
        break;
      case 'snapshot':
        if (!d.disk) {
          if (!f.vm) e['vm'] = 'Select a virtual machine.';
          else if (!f.diskId) e['diskId'] = this.disksOfVm().length ? 'Select a disk.' : 'This VM has no attachable disks.';
        }
        if (!name) e['name'] = 'Snapshot Name is required.';
        break;
      case 'fromSnapshot':
        if (!name) e['name'] = 'Disk Name is required.';
        else if (diskExists(name)) e['name'] = 'A disk with this name already exists.';
        if (!(f.size >= d.snap.size)) e['size'] = `A disk from this snapshot needs at least ${d.snap.size} GB.`;
        else if (f.size > available) e['size'] = `Only ${available} GB of storage is available.`;
        break;
      case 'bucket':
        if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(name)) e['name'] = 'Use 3–63 lowercase letters, numbers, dots or hyphens.';
        else if (this.store.buckets().some((b) => b.name === name)) e['name'] = 'A bucket with this name already exists.';
        break;
    }
    return e;
  });

  protected err(key: string): string | null {
    return this.submitted() ? (this.errors()[key] ?? null) : null;
  }

  /** Each dialog's confirm button. */
  protected submit(event?: Event): void {
    event?.preventDefault();
    this.submitted.set(true);
    const d = this.dialog();
    if (!d || Object.keys(this.errors()).length) return;
    const f = this.f();
    const name = f.name.trim();
    switch (d.kind) {
      case 'disk':
        if (d.edit) {
          this.store.resizeDisk(d.edit.id, f.size);
          this.notify(`${d.edit.name} resized to ${f.size} GB.`);
        } else {
          const disk = this.store.createDisk({ name, size: f.size, type: f.type, attachedTo: f.vm || null, diskNumber: f.vm ? Number(f.diskNumber) : null });
          this.notify(disk.attachedTo ? `${disk.name} created and attached to ${disk.attachedTo} as disk ${disk.diskNumber}.` : `${disk.name} created.`);
        }
        break;
      case 'attach':
        this.store.attachDisk(d.disk.id, f.vm, Number(f.diskNumber));
        this.notify(`${d.disk.name} attached to ${f.vm} as disk ${f.diskNumber}.`);
        break;
      case 'detach':
        this.store.detachDisk(d.disk.id);
        this.notify(`${d.disk.name} detached from ${d.disk.attachedTo}.`);
        break;
      case 'deleteDisk':
        if (f.typed !== d.disk.name) return;
        this.store.deleteDisk(d.disk.id);
        this.notify(`${d.disk.name} deleted. ${d.disk.size} GB returned to the pool.`);
        break;
      case 'snapshot': {
        const disk = d.disk ?? this.store.disks().find((x) => x.id === f.diskId);
        if (!disk) return;
        this.store.createSnapshot(disk, name);
        this.selectTab('snapshots');
        this.notify(`Snapshot ${name} of ${disk.name} created.`);
        break;
      }
      case 'fromSnapshot':
        this.store.createDisk({ name, size: f.size, type: f.type, attachedTo: null, diskNumber: null });
        this.selectTab('disks');
        this.notify(`${name} created from ${d.snap.name}.`);
        break;
      case 'deleteSnapshot':
        if (f.typed !== d.snap.name) return;
        this.store.deleteSnapshot(d.snap.id);
        this.notify(`Snapshot ${d.snap.name} deleted.`);
        break;
      case 'bucket':
        this.store.createBucket(name, f.region, f.access);
        this.notify(`Bucket ${name} created in ${f.region}.`);
        break;
      case 'deleteBucket':
        if (f.typed !== d.bucket.name) return;
        this.store.deleteBucket(d.bucket.id);
        this.notify(`Bucket ${d.bucket.name} deleted.`);
        break;
    }
    this.dialog.set(null);
  }

  /* ---------- Row actions that open a dialog ---------- */
  protected createDisk(): void {
    this.open({ kind: 'disk', edit: null });
  }
  protected resize(disk: Disk): void {
    this.open({ kind: 'disk', edit: disk }, { name: disk.name, size: disk.size, type: disk.type });
  }
  protected snapshotOf(disk: Disk): void {
    this.open({ kind: 'snapshot', disk }, { name: `${disk.name}-snapshot-${new Date().toISOString().slice(0, 10)}` });
  }
  protected diskFrom(snap: Snapshot): void {
    this.open({ kind: 'fromSnapshot', snap }, { name: `${snap.name}-disk`, size: snap.size });
  }
  protected bucketAction(bucket: Bucket, what: string): void {
    this.closeMenu();
    this.notify(`${what} for ${bucket.name} opens in WorldPosta IO.`);
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

/** Strings alphabetically, numbers numerically, empty values last. */
function compare(a: string | number | null, b: string | number | null): number {
  if (a === null || b === null) return a === b ? 0 : a === null ? 1 : -1;
  return typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b));
}
