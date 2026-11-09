import { Component, computed, effect, inject, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faCircleCheck, faCircleNotch, faEllipsis, faMinus, faPlay, faPlus, faServer, faStop, faTrashCan, faTriangleExclamation, faUpRightAndDownLeftFromCenter,
} from '@fortawesome/free-solid-svg-icons';
import { DemoDialogComponent } from '../demo-dialog.component';
import { KubernetesDemoStore, type ClusterStatus, type KubernetesCluster } from './kubernetes-demo.store';

/** Node counts the demo allows, per cluster. */
const MIN_NODES = 1;
const MAX_NODES = 20;

interface ClusterForm {
  name: string;
  version: string;
  nodeCount: number;
  region: string;
}

/**
 * Kubernetes Clusters in the CloudEdge console look, working: Create Cluster
 * (the new cluster shows Creating, then Running), scale nodes, stop and
 * start, and delete with a typed-name confirmation. CloudEdge has no
 * Kubernetes page; this is built from the portal stub
 * user-types-of-worldposta-unified-sign-in/pages/products/KubernetesPage.tsx
 * (its table, statuses, mock clusters and region names) and the console's
 * dialogs. Only the page content is shown.
 */
@Component({
  selector: 'app-cloudedge-kubernetes-demo',
  imports: [FaIconComponent, DemoDialogComponent],
  templateUrl: './kubernetes-demo.component.html',
  styleUrls: ['../demo.css', './kubernetes-demo.component.css'],
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class CloudedgeKubernetesDemoComponent {
  private readonly store = inject(KubernetesDemoStore);

  protected readonly i = {
    plus: faPlus, minus: faMinus, kebab: faEllipsis, scale: faUpRightAndDownLeftFromCenter, start: faPlay, stop: faStop,
    trash: faTrashCan, ok: faCircleCheck, spin: faCircleNotch, warn: faTriangleExclamation, server: faServer,
  };
  protected readonly statusTone: Record<ClusterStatus, string> = { Running: 'good', Creating: 'info', Stopped: 'muted', Error: 'bad' };
  protected readonly versions = ['1.28.2', '1.27.5'];
  protected readonly regions = ['US East (N. Virginia)', 'EU (Frankfurt)', 'EU (Strasbourg)'];
  protected readonly limits = { min: MIN_NODES, max: MAX_NODES };

  protected readonly clusters = this.store.clusters;
  protected readonly totalNodes = computed(() => this.clusters().reduce((sum, c) => sum + (c.status === 'Running' ? c.nodeCount : 0), 0));
  protected readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  /** Clusters seen in Creating, so the page can say when each one is ready. */
  private readonly provisioning = new Set<string>();

  constructor() {
    effect(() => {
      for (const c of this.clusters()) {
        if (c.status === 'Creating') this.provisioning.add(c.id);
        else if (this.provisioning.delete(c.id) && c.status === 'Running') this.notify(`${c.name} is running with ${c.nodeCount} ${c.nodeCount === 1 ? 'node' : 'nodes'}.`);
      }
    });
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString();
  }

  /* ---------- Row menu ---------- */
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

  protected menuUp(index: number, count: number): boolean {
    return index >= 2 && index >= count - 2;
  }

  protected setPower(cluster: KubernetesCluster, status: 'Running' | 'Stopped'): void {
    this.closeMenu();
    this.store.setStatus(cluster.id, status);
    this.notify(status === 'Running' ? `${cluster.name} started.` : `${cluster.name} stopped. Its workloads are paused.`);
  }

  /* ---------- Create Cluster ---------- */
  protected readonly creating = signal<ClusterForm | null>(null);
  protected readonly submitted = signal(false);

  protected readonly createErrors = computed<Record<string, string>>(() => {
    const f = this.creating();
    const e: Record<string, string> = {};
    if (!f) return e;
    const name = f.name.trim();
    if (!name) e['name'] = 'Cluster Name is required.';
    else if (!/^[a-z]([a-z0-9-]{0,38}[a-z0-9])?$/.test(name)) e['name'] = 'Use lowercase letters, numbers and hyphens, starting with a letter (up to 40 characters).';
    else if (this.clusters().some((c) => c.name === name)) e['name'] = 'A cluster with this name already exists.';
    if (!Number.isInteger(f.nodeCount) || f.nodeCount < MIN_NODES || f.nodeCount > MAX_NODES) e['nodeCount'] = `Node count must be between ${MIN_NODES} and ${MAX_NODES}.`;
    return e;
  });

  protected err(key: string): string | null {
    return this.submitted() ? (this.createErrors()[key] ?? null) : null;
  }

  protected openCreate(): void {
    this.submitted.set(false);
    this.creating.set({ name: '', version: this.versions[0], nodeCount: 3, region: this.regions[0] });
  }

  protected setField<K extends keyof ClusterForm>(key: K, value: ClusterForm[K]): void {
    this.creating.update((f) => (f ? { ...f, [key]: value } : f));
  }

  protected create(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    const f = this.creating();
    if (!f || Object.keys(this.createErrors()).length) return;
    const cluster = this.store.createCluster({ ...f, name: f.name.trim() });
    this.creating.set(null);
    this.notify(`Creating ${cluster.name} in ${cluster.region}. This takes a few seconds.`);
  }

  /* ---------- Scale Nodes ---------- */
  protected readonly scaling = signal<{ cluster: KubernetesCluster; nodes: number } | null>(null);
  protected readonly scaleError = computed(() => {
    const s = this.scaling();
    if (!s) return null;
    if (!Number.isInteger(s.nodes) || s.nodes < MIN_NODES || s.nodes > MAX_NODES) return `Node count must be between ${MIN_NODES} and ${MAX_NODES}.`;
    return null;
  });

  protected openScale(cluster: KubernetesCluster): void {
    this.closeMenu();
    this.scaling.set({ cluster, nodes: cluster.nodeCount });
  }

  protected setNodes(nodes: number): void {
    this.scaling.update((s) => (s ? { ...s, nodes } : s));
  }

  protected applyScale(event: Event): void {
    event.preventDefault();
    const s = this.scaling();
    if (!s || this.scaleError()) return;
    this.scaling.set(null);
    if (s.nodes === s.cluster.nodeCount) return;
    this.store.scale(s.cluster.id, s.nodes);
    this.notify(`${s.cluster.name} scaled from ${s.cluster.nodeCount} to ${s.nodes} ${s.nodes === 1 ? 'node' : 'nodes'}.`);
  }

  /* ---------- Delete ---------- */
  protected readonly deleting = signal<KubernetesCluster | null>(null);
  protected readonly deleteTyped = signal('');

  protected askDelete(cluster: KubernetesCluster): void {
    this.closeMenu();
    this.deleteTyped.set('');
    this.deleting.set(cluster);
  }

  protected confirmDelete(): void {
    const c = this.deleting();
    if (!c || this.deleteTyped() !== c.name) return;
    this.store.delete(c.id);
    this.provisioning.delete(c.id);
    this.deleting.set(null);
    this.notify(`${c.name} deleted.`);
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
