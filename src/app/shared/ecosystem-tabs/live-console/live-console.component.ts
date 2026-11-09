import { Component, computed, input, output, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faLinux, faUbuntu, faWindows } from '@fortawesome/free-brands-svg-icons';
import {
  faAnglesLeft, faBell, faBuilding, faCartShopping, faChevronDown, faChevronRight, faDatabase, faDesktop, faDownload,
  faEllipsisVertical, faFileExport, faFileInvoiceDollar, faFilter, faGaugeHigh, faIdBadge, faLocationDot, faMagnifyingGlass,
  faNetworkWired, faPlus, faRecycle, faTableCells, faList, faXmark, faTowerBroadcast, faShieldHalved, faCloudArrowUp, faCoins,
} from '@fortawesome/free-solid-svg-icons';

type VmState = 'Running' | 'Stopped' | 'Provisioning';
interface Vm {
  name: string; os: 'ubuntu' | 'windows' | 'linux'; state: VmState;
  cores: number; memory: number; storage: number; nics: number;
  ip: string; reservation: string; created: string;
}
interface Invoice { id: string; period: string; issued: string; due: string; total: number; status: 'Due' | 'Paid'; }

/**
 * A working recreation of two CloudEdge console pages for the home-page
 * ecosystem preview: Virtual Machines (add, start/stop, delete, search,
 * card/table view) and Billing (monthly invoices). Everything happens in the
 * browser only; nothing is sent anywhere. Data mirrors the console's own
 * sample data.
 */
@Component({
  selector: 'app-live-console',
  imports: [FaIconComponent, CurrencyPipe],
  templateUrl: './live-console.component.html',
  styleUrl: './live-console.component.css',
})
export class LiveConsoleComponent {
  readonly mode = input.required<'vm' | 'billing'>();
  /** Sidebar rows that have a matching service on the home page. */
  readonly navigate = output<string>();

  protected readonly i = {
    collapse: faAnglesLeft, bell: faBell, org: faBuilding, cart: faCartShopping, down: faChevronDown, right: faChevronRight,
    storage: faDatabase, vm: faDesktop, download: faDownload, kebab: faEllipsisVertical, export: faFileExport, invoice: faFileInvoiceDollar,
    filter: faFilter, dash: faGaugeHigh, profile: faIdBadge, ip: faLocationDot, search: faMagnifyingGlass, net: faNetworkWired,
    plus: faPlus, bin: faRecycle, cards: faTableCells, list: faList, close: faXmark, nat: faTowerBroadcast,
  };
  protected readonly osIcon: Record<Vm['os'], IconDefinition> = { ubuntu: faUbuntu, windows: faWindows, linux: faLinux };
  protected readonly osName: Record<Vm['os'], string> = { ubuntu: 'Ubuntu 22.04', windows: 'Windows Server 2022', linux: 'CentOS Stream 9' };
  protected readonly osChoices: readonly Vm['os'][] = ['ubuntu', 'windows', 'linux'];

  protected readonly sidebar = [
    { section: '', items: [{ label: 'Dashboard', icon: faGaugeHigh, tab: 'cloud-infrastructure' }] },
    { section: 'Administration', items: [{ label: 'Organizations', icon: faBuilding }, { label: 'Profiles', icon: faIdBadge }] },
    { section: 'Resources', items: [{ label: 'Virtual Machines', icon: faDesktop, tab: 'virtual-machines' }, { label: 'Storage', icon: faDatabase, tab: 'storage' }] },
    { section: 'Network', items: [{ label: 'Gateways', icon: faNetworkWired, tab: 'networking' }, { label: 'NATs', icon: faTowerBroadcast }, { label: 'Reserved IP', icon: faLocationDot }] },
    { section: 'Billing', items: [{ label: 'Invoices', icon: faFileInvoiceDollar, tab: 'cost-management' }] },
  ] as const;

  protected readonly currentPage = computed(() => (this.mode() === 'vm' ? 'Virtual Machines' : 'Invoices'));

  /* ---------------- Virtual machines ---------------- */
  protected readonly vms = signal<Vm[]>([
    { name: 'prod-web-server-01', os: 'ubuntu', state: 'Running', cores: 4, memory: 8, storage: 100, nics: 2, ip: '192.168.1.10', reservation: 'Web-Tier-Reservation', created: '2023-05-10' },
    { name: 'sql-database-main', os: 'windows', state: 'Running', cores: 8, memory: 32, storage: 500, nics: 1, ip: '192.168.1.15', reservation: 'DB-Tier-Reservation', created: '2023-03-22' },
    { name: 'dev-environment-centos', os: 'linux', state: 'Stopped', cores: 2, memory: 4, storage: 50, nics: 1, ip: '10.0.0.5', reservation: 'None', created: '2023-08-01' },
  ]);
  protected readonly view = signal<'card' | 'table'>('card');
  protected readonly query = signal('');
  protected readonly menuFor = signal<string | null>(null);
  protected readonly toast = signal('');
  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? this.vms().filter((v) => v.name.includes(q) || v.ip.includes(q) || v.os.includes(q)) : this.vms();
  });

  protected readonly addOpen = signal(false);
  protected readonly draft = signal({ name: 'web-server-02', os: 'ubuntu' as Vm['os'], cores: 4, memory: 8, storage: 100 });
  protected readonly nameError = computed(() => {
    const n = this.draft().name.trim();
    if (!/^[a-z0-9][a-z0-9-]{1,30}$/.test(n)) return 'Use 2–31 lowercase letters, numbers or hyphens.';
    if (this.vms().some((v) => v.name === n)) return 'A VM with this name already exists.';
    return '';
  });
  protected readonly options = { cores: [2, 4, 8, 16], memory: [4, 8, 16, 32, 64], storage: [50, 100, 200, 500] };

  protected openAdd(): void {
    let n = 2;
    while (this.vms().some((v) => v.name === `web-server-0${n}`)) n++;
    this.draft.set({ name: `web-server-0${n}`, os: 'ubuntu', cores: 4, memory: 8, storage: 100 });
    this.addOpen.set(true);
  }
  protected setDraft(key: 'name' | 'os' | 'cores' | 'memory' | 'storage', value: string | number): void {
    this.draft.update((d) => ({ ...d, [key]: key === 'name' || key === 'os' ? String(value) : Number(value) }));
  }
  protected createVm(): void {
    if (this.nameError()) return;
    const d = this.draft();
    const next = this.vms().length + 20;
    const vm: Vm = { name: d.name.trim(), os: d.os, state: 'Provisioning', cores: d.cores, memory: d.memory, storage: d.storage, nics: 1, ip: `192.168.1.${next}`, reservation: 'None', created: new Date().toISOString().slice(0, 10) };
    this.vms.update((list) => [vm, ...list]);
    this.addOpen.set(false);
    this.query.set('');
    this.flash(`${vm.name} is being provisioned…`);
    setTimeout(() => {
      this.vms.update((list) => list.map((v) => (v.name === vm.name && v.state === 'Provisioning' ? { ...v, state: 'Running' } : v)));
      this.flash(`${vm.name} is running.`);
    }, 2200);
  }
  protected power(vm: Vm): void {
    this.menuFor.set(null);
    const state: VmState = vm.state === 'Running' ? 'Stopped' : 'Running';
    this.vms.update((list) => list.map((v) => (v.name === vm.name ? { ...v, state } : v)));
    this.flash(`${vm.name} ${state === 'Running' ? 'started' : 'stopped'}.`);
  }
  protected remove(vm: Vm): void {
    this.menuFor.set(null);
    this.vms.update((list) => list.filter((v) => v.name !== vm.name));
    this.flash(`${vm.name} moved to the Recycle Bin.`);
  }
  protected readonly totals = computed(() => {
    const on = this.vms().filter((v) => v.state === 'Running');
    return { running: on.length, cores: on.reduce((s, v) => s + v.cores, 0), memory: on.reduce((s, v) => s + v.memory, 0) };
  });
  protected openConsole(vm: Vm): void {
    this.flash(`Web Console for ${vm.name} opens in your CloudEdge console after you sign in.`);
  }
  private flashTimer?: ReturnType<typeof setTimeout>;
  private flash(text: string): void {
    this.toast.set(text);
    clearTimeout(this.flashTimer);
    this.flashTimer = setTimeout(() => this.toast.set(''), 2600);
  }

  /* ---------------- Billing ---------------- */
  /** Monthly totals follow the console's Total Cloud Spend trend. */
  protected readonly invoices: Invoice[] = [
    { id: 'INV-2026-10', period: 'October 2026', issued: 'Nov 1, 2026', due: 'Nov 15, 2026', total: 12430, status: 'Due' },
    { id: 'INV-2026-09', period: 'September 2026', issued: 'Oct 1, 2026', due: 'Oct 15, 2026', total: 12700, status: 'Paid' },
    { id: 'INV-2026-08', period: 'August 2026', issued: 'Sep 1, 2026', due: 'Sep 15, 2026', total: 13000, status: 'Paid' },
    { id: 'INV-2026-07', period: 'July 2026', issued: 'Aug 1, 2026', due: 'Aug 15, 2026', total: 13400, status: 'Paid' },
  ];
  /** October's breakdown, from the console's cost overview; other months scale with their total. */
  private readonly baseLines = [
    { service: 'Virtual Machines', detail: 'prod-vm-cluster', icon: faDesktop, amount: 4320 },
    { service: 'Storage', detail: 'prod-storage', icon: faDatabase, amount: 2180 },
    { service: 'Networking', detail: 'vpc-network', icon: faNetworkWired, amount: 1560 },
    { service: 'Security', detail: 'waf-security', icon: faShieldHalved, amount: 980 },
    { service: 'Backup & DR', detail: 'daily-backup', icon: faCloudArrowUp, amount: 640 },
    { service: 'Other services', detail: 'Kubernetes, monitoring and support', icon: faCoins, amount: 2750 },
  ];
  protected readonly selected = signal(this.invoices[0].id);
  protected readonly invoice = computed(() => {
    const inv = this.invoices.find((x) => x.id === this.selected()) ?? this.invoices[0];
    const ratio = inv.total / 12430;
    const lines = this.baseLines.map((l) => ({ ...l, amount: Math.round(l.amount * ratio) }));
    const drift = inv.total - lines.reduce((s, l) => s + l.amount, 0);
    lines[lines.length - 1].amount += drift;
    return { ...inv, lines };
  });
  protected readonly expanded = signal<string | null>(null);
  protected pay(): void { this.flash('Payments are made from your CloudEdge console after you sign in.'); }
  /** Opens the selected invoice on its own in a print dialog, so it can be saved as PDF. */
  protected download(): void {
    const inv = this.invoice();
    const money = (n: number) => '$' + n.toLocaleString('en-US') + '.00';
    const rows = inv.lines.map((l) => `<tr><td>${l.service}<br><small>${l.detail}</small></td><td>${money(l.amount)}</td></tr>`).join('');
    const w = window.open('', '_blank', 'width=820,height=900');
    if (!w) return;
    w.document.write(`<!doctype html><title>${inv.id}</title><style>body{font:14px system-ui,sans-serif;color:#071c4c;padding:40px}h1{margin:0 0 4px}table{width:100%;border-collapse:collapse;margin-top:24px}td{padding:10px 0;border-bottom:1px solid #e3e8f0}td:last-child{text-align:right}small{color:#5b6577}.t{font-weight:700;font-size:18px}</style><h1>Invoice ${inv.id}</h1><p>WorldPosta CloudEdge · Billed to Worldposta<br>Period: ${inv.period} · Issued ${inv.issued} · Due ${inv.due}</p><table>${rows}<tr><td class="t">Total (USD)</td><td class="t">${money(inv.total)}</td></tr></table><script>print()<\/script>`);
    w.document.close();
  }
}
