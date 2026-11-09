import { Component, ElementRef, afterNextRender, computed, inject, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faLinux, faUbuntu, faWindows } from '@fortawesome/free-brands-svg-icons';
import {
  faArrowLeft, faCamera, faCartShopping, faCircleCheck, faCircleInfo, faClone, faDesktop, faEllipsisVertical, faFileCode,
  faFileCsv, faFileExport, faFilter, faList, faMagnifyingGlass, faMagnifyingGlassMinus, faPause, faPlay, faPlus, faPowerOff,
  faRecycle, faRotate, faRotateLeft, faStop, faTableCellsLarge, faTerminal, faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import { DemoDialogComponent } from '../demo-dialog.component';
import { VmDemoStore, type VirtualMachine, type VmOs, type VmStatus } from './vm-demo.store';

type VmAction = 'connect' | 'powerOff' | 'restart';
interface VmFilters { status: 'all' | VmStatus; os: 'all' | VmOs; hasReservation: boolean }
interface Disk { name: string; size: number }

const DEFAULT_FILTERS: VmFilters = { status: 'all', os: 'all', hasReservation: false };

/**
 * CloudEdge › Virtual Machines, working: card and table views, search,
 * filters, export, power actions with the console's confirmations, delete to
 * the Recycle Bin and recover from it, and the Create New Virtual Machine form.
 * Ported from cloudedge/src/pages/virtual-machines; only the page content is
 * shown, without the console's sidebar and top bar.
 */
@Component({
  selector: 'app-vm-demo',
  imports: [FaIconComponent, NgTemplateOutlet, DemoDialogComponent],
  templateUrl: './vm-demo.component.html',
  styleUrls: ['../demo.css', './vm-demo.component.css'],
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class VmDemoComponent {
  private readonly store = inject(VmDemoStore);

  protected readonly i = {
    back: faArrowLeft, snapshot: faCamera, cart: faCartShopping, ok: faCircleCheck, info: faCircleInfo, clone: faClone,
    desktop: faDesktop, kebab: faEllipsisVertical, json: faFileCode, csv: faFileCsv, export: faFileExport, filter: faFilter,
    list: faList, search: faMagnifyingGlass, none: faMagnifyingGlassMinus, suspend: faPause, start: faPlay, plus: faPlus,
    off: faPowerOff, bin: faRecycle, restart: faRotate, recover: faRotateLeft, stop: faStop, cards: faTableCellsLarge,
    console: faTerminal, trash: faTrashCan,
  };
  protected readonly osIcon: Record<VmOs, IconDefinition> = { windows: faWindows, ubuntu: faUbuntu, linux: faLinux };
  protected readonly statusTone: Record<VmStatus, string> = { running: 'good', stopped: 'bad', suspended: 'warn' };

  /**
   * Set by a host page (the Dashboard's Create VM button) to show only the
   * Create New Virtual Machine form; leaving it emits `closed` with the new
   * VM's name, or null when cancelled, instead of returning to the list.
   */
  readonly createOnly = input(false);
  readonly backLabel = input('Virtual Machines');
  readonly closed = output<string | null>();

  protected readonly page = signal<'list' | 'create' | 'bin'>('list');

  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;

  constructor() {
    afterNextRender(() => {
      if (!this.createOnly()) return;
      this.openCreate();
      // The button that opened the form is gone; start keyboard and reader focus at its heading.
      setTimeout(() => this.host.querySelector<HTMLElement>('#vm-create-title')?.focus());
    });
  }

  protected leaveCreate(): void {
    if (this.createOnly()) this.closed.emit(null);
    else this.page.set('list');
  }
  protected readonly viewMode = signal<'card' | 'table'>('card');
  protected readonly searchTerm = signal('');
  protected readonly openMenu = signal<string | null>(null);
  protected readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  protected readonly vms = this.store.virtualMachines;
  protected readonly recycled = this.store.recycledVirtualMachines;

  /* ---------- Filters (the console's filter panel) ---------- */
  protected readonly vmStatuses: VmFilters['status'][] = ['all', 'running', 'stopped', 'suspended'];
  protected readonly vmOses: VmFilters['os'][] = ['all', 'windows', 'ubuntu', 'linux'];
  protected readonly filters = signal<VmFilters>({ ...DEFAULT_FILTERS });
  protected readonly tempFilters = signal<VmFilters>({ ...DEFAULT_FILTERS });
  protected readonly filterOpen = signal(false);

  protected readonly filtered = computed(() => {
    const { status, os, hasReservation } = this.filters();
    const term = this.searchTerm().trim().toLowerCase();
    return this.vms().filter(
      (vm) =>
        (!term || vm.name.toLowerCase().includes(term) || vm.description?.toLowerCase().includes(term) || vm.ipAddress.includes(term)) &&
        (status === 'all' || vm.status === status) &&
        (os === 'all' || vm.os === os) &&
        (!hasReservation || vm.reservationName !== null),
    );
  });

  protected readonly activeFilterCount = computed(() => {
    const { status, os, hasReservation } = this.filters();
    return (status !== 'all' ? 1 : 0) + (os !== 'all' ? 1 : 0) + (hasReservation ? 1 : 0);
  });

  protected openFilters(): void {
    this.tempFilters.set({ ...this.filters() });
    this.filterOpen.set(true);
  }
  protected setTempFilter<K extends keyof VmFilters>(key: K, value: VmFilters[K]): void {
    this.tempFilters.update((f) => ({ ...f, [key]: value }));
  }
  protected applyFilters(): void {
    this.filters.set(this.tempFilters());
    this.filterOpen.set(false);
  }
  protected clearFilters(): void {
    this.filters.set({ ...DEFAULT_FILTERS });
    this.filterOpen.set(false);
  }

  /* ---------- Export (real files, built in the browser) ---------- */
  protected readonly exportOpen = signal(false);

  protected exportAs(kind: 'csv' | 'json'): void {
    const vms = this.filtered();
    let data: string;
    if (kind === 'csv') {
      const headers = ['Name', 'OS', 'Status', 'IP Address', 'Creation Date', 'Cores', 'Memory (GB)', 'Storage (GB)'];
      const rows = vms.map((vm) => [vm.name, vm.os, vm.status, vm.ipAddress, vm.creationDate, vm.cores, vm.memory, vm.storage].map((v) => `"${v}"`).join(','));
      data = [headers.join(','), ...rows].join('\r\n');
    } else {
      data = JSON.stringify(vms, null, 2);
    }
    const url = URL.createObjectURL(new Blob([data], { type: kind === 'csv' ? 'text/csv' : 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `virtual_machines.${kind}`;
    a.click();
    URL.revokeObjectURL(url);
    this.exportOpen.set(false);
    this.notify(`Exported ${vms.length} virtual machines as ${kind.toUpperCase()}.`);
  }

  /* ---------- Row actions and their confirmations ---------- */
  protected readonly confirm = signal<{ vm: VirtualMachine; action: VmAction } | null>(null);
  protected readonly confirmCopy = computed(() => {
    const c = this.confirm();
    if (!c) return null;
    const name = c.vm.name;
    switch (c.action) {
      case 'connect':
        return { title: `Connect to ${name}`, message: `You are about to connect to the web console for ${name}. Proceed?`, button: 'Connect', danger: false };
      case 'powerOff':
        return { title: `Power Off ${name}`, message: `Are you sure you want to power off ${name}? This is equivalent to pulling the power cord.`, button: 'Power Off', danger: true };
      case 'restart':
        return { title: `Restart ${name}`, message: `Are you sure you want to restart ${name}? This will abruptly stop and then start the virtual machine.`, button: 'Restart', danger: true };
    }
  });

  /** The row's "Actions" button: focus goes back to it when its menu closes. */
  private menuTrigger: HTMLElement | null = null;

  protected toggleMenu(event: Event, id: string): void {
    event.stopPropagation();
    this.menuTrigger = event.currentTarget as HTMLElement;
    this.openMenu.update((open) => (open === id ? null : id));
  }

  /** Closes the row menu with focus back on its trigger, so a dialog opened from it returns focus there. */
  protected closeMenu(): void {
    this.openMenu.set(null);
    this.menuTrigger?.focus();
  }

  protected ask(action: VmAction, vm: VirtualMachine): void {
    this.closeMenu();
    this.confirm.set({ vm, action });
  }

  protected confirmAction(): void {
    const c = this.confirm();
    this.confirm.set(null);
    if (!c) return;
    if (c.action === 'powerOff') {
      this.store.updateVmStatus(c.vm.id, 'stopped');
      this.notify(`${c.vm.name} is powered off.`);
    } else if (c.action === 'restart') {
      this.store.updateVmStatus(c.vm.id, 'stopped');
      setTimeout(() => this.store.updateVmStatus(c.vm.id, 'running'), 1000);
      this.notify(`${c.vm.name} is restarting.`);
    } else {
      this.notify(`Web console session opened for ${c.vm.name}.`);
    }
  }

  protected setStatus(vm: VirtualMachine, status: VmStatus, message: string): void {
    this.closeMenu();
    this.store.updateVmStatus(vm.id, status);
    this.notify(message);
  }

  protected snapshot(vm: VirtualMachine): void {
    this.closeMenu();
    this.notify(`Snapshot of ${vm.name} created.`);
  }

  protected clone(vm: VirtualMachine): void {
    this.closeMenu();
    const copy = this.store.addVm({
      name: `${vm.name}-clone`, os: vm.os, cores: vm.cores, memory: vm.memory, storage: vm.storage,
      description: vm.description ?? '', reservationName: vm.reservationName,
    });
    this.notify(`${copy.name} created from ${vm.name}.`);
  }

  /** The VM whose Profile is open. */
  protected readonly profile = signal<VirtualMachine | null>(null);

  /* ---------- Delete: type the name, as the console's advanced delete modal asks ---------- */
  protected readonly deleting = signal<VirtualMachine | null>(null);
  protected readonly deleteTyped = signal('');

  protected askDelete(vm: VirtualMachine): void {
    this.closeMenu();
    this.deleteTyped.set('');
    this.deleting.set(vm);
  }

  protected confirmDelete(): void {
    const vm = this.deleting();
    if (!vm || this.deleteTyped() !== vm.name) return;
    this.store.deleteVm(vm.id);
    this.deleting.set(null);
    this.notify(`${vm.name} moved to the Recycle Bin.`);
  }

  protected recover(vm: VirtualMachine): void {
    this.store.recoverVm(vm.id);
    this.notify(`${vm.name} recovered.`);
  }

  protected purge(vm: VirtualMachine): void {
    this.store.permanentlyDeleteVm(vm.id);
    this.notify(`${vm.name} permanently deleted.`);
  }

  /* ---------- Create New Virtual Machine ---------- */
  protected readonly reservations = ['Default Reservation', 'High-Performance Reservation', 'Storage-Optimized Reservation'];
  protected readonly groups = ['Default Group', 'Web Servers', 'Database Servers'];
  protected readonly gateways = ['Default Gateway', 'DMZ Gateway', 'Internal Gateway'];
  protected readonly osBlueprints = ['Ubuntu 22.04 LTS', 'Windows Server 2022 Datacenter', 'CentOS Stream 9', 'Debian 12', 'Red Hat Enterprise Linux 9'];

  protected readonly form = signal(this.blankForm());
  protected readonly disks = signal<Disk[]>([{ name: 'Disk-01', size: 512 }]);
  protected readonly submitted = signal(false);

  protected readonly formErrors = computed(() => {
    const f = this.form();
    const errors: Record<string, string> = {};
    if (!f.vmName.trim()) errors['vmName'] = 'Virtual Machine Name is required.';
    else if (this.vms().some((vm) => vm.name === f.vmName.trim())) errors['vmName'] = 'A virtual machine with this name already exists.';
    if (!f.reservation) errors['reservation'] = 'Select a reservation.';
    if (!f.group) errors['group'] = 'Select a group.';
    if (!f.osBlueprint) errors['osBlueprint'] = 'Select an OS blueprint.';
    if (!f.hostName.trim()) errors['hostName'] = 'Host Name is required.';
    if (f.password.length < 8) errors['password'] = 'Use at least 8 characters.';
    if (!f.gateway) errors['gateway'] = 'Select a gateway.';
    if (!(f.cpu >= 1)) errors['cpu'] = 'At least 1 CPU.';
    if (!(f.memory >= 1)) errors['memory'] = 'At least 1 GB of memory.';
    if (this.disks().some((d) => !d.name.trim() || !(d.size >= 1))) errors['disks'] = 'Every disk needs a name and a size of at least 1 GB.';
    return errors;
  });

  protected readonly hasErrors = computed(() => Object.keys(this.formErrors()).length > 0);

  protected error(key: string): string | null {
    return this.submitted() ? (this.formErrors()[key] ?? null) : null;
  }

  private blankForm() {
    return { vmName: '', reservation: '', group: '', osBlueprint: '', hostName: '', password: '', gateway: '', cpu: 2, memory: 4, description: '' };
  }

  protected setField(key: keyof ReturnType<VmDemoComponent['blankForm']>, value: string): void {
    this.form.update((f) => ({ ...f, [key]: key === 'cpu' || key === 'memory' ? Number(value) : value }));
  }

  protected openCreate(): void {
    this.form.set(this.blankForm());
    this.disks.set([{ name: 'Disk-01', size: 512 }]);
    this.submitted.set(false);
    this.page.set('create');
  }

  protected addDisk(): void {
    this.disks.update((d) => [...d, { name: `Disk-0${d.length + 1}`, size: 100 }]);
  }
  protected removeDisk(index: number): void {
    this.disks.update((d) => d.filter((_, i) => i !== index));
  }
  protected setDisk(index: number, field: keyof Disk, value: string): void {
    this.disks.update((d) => d.map((disk, i) => (i === index ? { ...disk, [field]: field === 'size' ? Number(value) : value } : disk)));
  }

  protected createVm(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    if (this.hasErrors()) return;
    const f = this.form();
    const os: VmOs = f.osBlueprint.startsWith('Windows') ? 'windows' : f.osBlueprint.startsWith('Ubuntu') ? 'ubuntu' : 'linux';
    const vm = this.store.addVm({
      name: f.vmName.trim(), os, cores: f.cpu, memory: f.memory,
      storage: this.disks().reduce((sum, d) => sum + d.size, 0),
      description: f.description, reservationName: f.reservation,
    });
    if (this.createOnly()) {
      this.closed.emit(vm.name);
      return;
    }
    this.page.set('list');
    this.notify(`${vm.name} created and running.`);
  }

  /* ---------- Shared ---------- */
  protected notify(text: string): void {
    this.toast.set(text);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 3200);
  }

  protected onDocumentClick(event: Event): void {
    const target = event.target as Element | null;
    if (!target?.closest('.d-menu-wrap')) {
      this.openMenu.set(null);
      this.exportOpen.set(false);
    }
  }

  protected deletedAgo(vm: VirtualMachine): string {
    const hours = Math.max(0, Math.round((Date.now() - new Date(vm.deletedAt ?? Date.now()).getTime()) / 3600_000));
    return hours < 1 ? 'Just now' : `${hours} h ago`;
  }
}
