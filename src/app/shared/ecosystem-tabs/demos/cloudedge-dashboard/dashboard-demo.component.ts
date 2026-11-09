import { Component, DestroyRef, ElementRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faLinux, faUbuntu, faWindows } from '@fortawesome/free-brands-svg-icons';
import {
  faChartSimple, faCircleCheck, faCircleInfo, faCircleUser, faClock, faDatabase, faDesktop, faEllipsisVertical,
  faHeadset, faLayerGroup, faListCheck, faMicrochip, faNetworkWired, faPlug, faPlus, faRocket, faShieldHalved,
  faTableCellsLarge, faTrashCan, faUser, faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { DemoDialogComponent } from '../demo-dialog.component';
import { VmDemoComponent } from '../cloudedge-vms/vm-demo.component';
import { VmDemoStore, type VmOs, type VirtualMachine } from '../cloudedge-vms/vm-demo.store';
import { DashboardDemoStore, type AuditTrailEntry, type DashboardWidgetVisibility, type StatCard, type StatKey } from './dashboard-demo.store';

type Timeframe = '1H' | '24H' | '7D';

interface TopVm {
  readonly vm: VirtualMachine;
  readonly cpu: number;
  readonly memory: number;
  readonly storage: number;
}

/** Chart frame, in SVG user units. */
const W = 600;
const H = 260;
const PAD = { top: 12, right: 16, bottom: 34, left: 46 };
const SPAN: Record<Timeframe, number> = { '1H': 3600_000, '24H': 24 * 3600_000, '7D': 7 * 24 * 3600_000 };
const SPAN_LABEL: Record<Timeframe, string> = { '1H': 'last hour', '24H': 'last 24 hours', '7D': 'last 7 days' };

/** A stable pseudo-usage per VM, standing in for the console's random "top VMs" figures. */
const usage = (id: string, salt: number, min: number, range: number) => {
  let h = salt;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 9973;
  return min + (h % range);
};

/**
 * CloudEdge › Dashboard, working: stat cards that open their historical chart
 * (1H / 24H / 7D), Top VMs by Resource Usage read from the Virtual Machines
 * demo, the latest Audit Trail events, Security Score, Create VM (the Virtual
 * Machines demo's form, in place) and the Customize Dashboard dialog. Ported from
 * cloudedge/src/pages/dashboard (dashboard.component.ts, stat-chart-modal,
 * customize-dashboard-modal); only the page content is shown.
 */
@Component({
  selector: 'app-cloudedge-dashboard-demo',
  imports: [FaIconComponent, DemoDialogComponent, VmDemoComponent],
  templateUrl: './dashboard-demo.component.html',
  styleUrls: ['../demo.css', './dashboard-demo.component.css'],
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class CloudedgeDashboardDemoComponent {
  private readonly store = inject(DashboardDemoStore);
  private readonly vmStore = inject(VmDemoStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;

  protected readonly i = {
    plus: faPlus, layout: faTableCellsLarge, kebab: faEllipsisVertical, plug: faPlug, manage: faListCheck, info: faCircleInfo,
    trash: faTrashCan, user: faUser, net: faNetworkWired, clock: faClock, ok: faCircleCheck, rocket: faRocket, users: faUsers, support: faHeadset,
  };
  protected readonly statIcon: Record<StatKey, IconDefinition> = { cpu: faMicrochip, memory: faChartSimple, storage: faDatabase, vms: faLayerGroup };
  protected readonly osIcon: Record<VmOs, IconDefinition> = { windows: faWindows, ubuntu: faUbuntu, linux: faLinux };
  protected readonly auditIcon: Record<AuditTrailEntry['eventSource'], IconDefinition> = {
    Compute: faDesktop, Security: faShieldHalved, Network: faNetworkWired, Identity: faCircleUser,
  };

  protected readonly stats = this.store.stats;
  protected readonly visibility = this.store.widgetVisibility;
  protected readonly security = this.store.securityScore;
  protected readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  /** Bars and the score ring grow from zero the first time the dashboard opens in a visit. */
  protected readonly ready = signal(this.store.hasAnimated());

  constructor() {
    afterNextRender(() => {
      if (this.ready()) return;
      const timer = setTimeout(() => {
        this.ready.set(true);
        this.store.hasAnimated.set(true);
      }, 100);
      this.destroyRef.onDestroy(() => clearTimeout(timer));
    });
  }

  protected readonly helpfulResources = [
    { title: 'Getting Started Guide', description: 'Our step-by-step guide to launch your first VM.', icon: faRocket },
    { title: 'Community Forum', description: 'Ask questions and share knowledge with others.', icon: faUsers },
    { title: 'Contact Support', description: 'Get help from our expert support team when you need it.', icon: faHeadset },
  ];

  /* ---------- Top VMs by Resource Usage (from the Virtual Machines demo) ---------- */
  protected readonly topVms = computed<TopVm[]>(() =>
    this.vmStore
      .virtualMachines()
      .map((vm) => {
        const on = vm.status === 'running';
        return { vm, cpu: on ? usage(vm.id, 7, 60, 35) : 0, memory: on ? usage(vm.id, 13, 55, 40) : 0, storage: on ? usage(vm.id, 29, 20, 70) : 0 };
      })
      .sort((a, b) => b.cpu + b.memory - (a.cpu + a.memory))
      .slice(0, 3),
  );

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

  protected vmAction(text: string): void {
    this.closeMenu();
    this.notify(text);
  }

  protected readonly deleting = signal<VirtualMachine | null>(null);

  protected askDelete(vm: VirtualMachine): void {
    this.closeMenu();
    this.deleting.set(vm);
  }

  protected confirmDelete(): void {
    const vm = this.deleting();
    this.deleting.set(null);
    if (!vm) return;
    this.vmStore.deleteVm(vm.id);
    this.notify(`${vm.name} moved to the Recycle Bin.`);
  }

  /* ---------- Audit Trail: the latest events; the full log lives in Action Logs ---------- */
  protected readonly audit = this.store.auditTrail;

  /* ---------- Create VM: the Virtual Machines demo's form, in place ---------- */
  protected readonly creating = signal(false);
  private createTrigger: HTMLElement | null = null;

  protected openCreate(event: Event): void {
    this.createTrigger = event.currentTarget as HTMLElement;
    this.creating.set(true);
  }

  protected onCreateClosed(name: string | null): void {
    this.creating.set(false);
    if (name) this.notify(`${name} created and running. It is listed on the Virtual Machines page.`);
    // The trigger is re-rendered with the dashboard; focus its replacement.
    setTimeout(() => (this.host.querySelector<HTMLElement>('.ced-create') ?? this.createTrigger)?.focus());
  }

  /* ---------- Security Score ring ---------- */
  protected readonly circumference = 2 * Math.PI * 60;
  protected readonly scoreOffset = computed(() => this.circumference - ((this.ready() ? this.security.score : 5) / 100) * this.circumference);

  /* ---------- Stat chart dialog ---------- */
  protected readonly chartStat = signal<StatCard | null>(null);
  protected readonly timeframe = signal<Timeframe>('24H');
  protected readonly timeframes: Timeframe[] = ['1H', '24H', '7D'];
  protected readonly frame = { w: W, h: H, pad: PAD };

  protected openChart(stat: StatCard): void {
    this.timeframe.set('24H');
    this.chartStat.set(stat);
  }

  protected readonly chart = computed(() => {
    const stat = this.chartStat();
    if (!stat) return null;
    const tf = this.timeframe();
    const end = stat.history[stat.history.length - 1].time;
    const start = end - SPAN[tf];
    const all = stat.history.filter((p) => p.time >= start);
    // Thin the 7-day series to about 170 points; the line reads the same.
    const step = Math.max(1, Math.floor(all.length / 170));
    const points = all.filter((_, n) => n % step === 0 || n === all.length - 1);
    const yMax = stat.key === 'vms' ? stat.total : 100;
    const iw = W - PAD.left - PAD.right;
    const ih = H - PAD.top - PAD.bottom;
    const x = (t: number) => PAD.left + ((t - start) / (end - start)) * iw;
    const y = (v: number) => PAD.top + ih - (v / yMax) * ih;
    const line = points.map((p, n) => `${n ? 'L' : 'M'}${x(p.time).toFixed(1)},${y(p.value).toFixed(1)}`).join('');
    const area = `${line}L${x(end).toFixed(1)},${PAD.top + ih}L${x(points[0].time).toFixed(1)},${PAD.top + ih}Z`;
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ y: y(f * yMax), label: String(Math.round(f * yMax)) }));
    const fmt = (t: number) =>
      tf === '7D'
        ? new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : new Date(t).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const xTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ x: PAD.left + f * iw, label: fmt(start + f * (end - start)) }));
    const values = all.map((p) => p.value);
    const avg = values.reduce((s, v) => s + v, 0) / values.length;
    const unit = stat.key === 'vms' ? '' : '%';
    const digits = stat.key === 'vms' ? 0 : 1;
    const summary = {
      average: avg.toFixed(digits) + unit,
      peak: Math.max(...values).toFixed(digits) + unit,
      low: Math.min(...values).toFixed(digits) + unit,
    };
    const axis = stat.key === 'vms' ? 'VM Count' : 'Utilization (%)';
    return {
      line, area, yTicks, xTicks, axis, summary,
      description: `${axis} for ${stat.title} over the ${SPAN_LABEL[tf]}: average ${summary.average}, peak ${summary.peak}, low ${summary.low}.`,
    };
  });

  /* ---------- Customize Dashboard ---------- */
  protected readonly widgetConfig: { key: keyof DashboardWidgetVisibility; label: string }[] = [
    { key: 'stats', label: 'Stats Grid' },
    { key: 'topVms', label: 'Top VMs by Resource Usage' },
    { key: 'auditTrail', label: 'Audit Trail' },
    { key: 'securityScore', label: 'Security Score' },
    { key: 'helpfulResources', label: 'Helpful Resources' },
  ];
  protected readonly customizing = signal<DashboardWidgetVisibility | null>(null);

  protected openCustomize(): void {
    this.customizing.set({ ...this.visibility() });
  }

  protected toggleWidget(key: keyof DashboardWidgetVisibility, on: boolean): void {
    this.customizing.update((v) => (v ? { ...v, [key]: on } : v));
  }

  protected saveLayout(): void {
    const next = this.customizing();
    this.customizing.set(null);
    if (!next) return;
    this.store.updateVisibility(next);
    const shown = Object.values(next).filter(Boolean).length;
    this.notify(`Dashboard saved. ${shown} of ${this.widgetConfig.length} widgets shown.`);
  }

  protected readonly nothingShown = computed(() => !Object.values(this.visibility()).some(Boolean));
  protected readonly mainShown = computed(() => this.visibility().topVms || this.visibility().auditTrail);
  protected readonly sideShown = computed(() => this.visibility().securityScore || this.visibility().helpfulResources);

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
