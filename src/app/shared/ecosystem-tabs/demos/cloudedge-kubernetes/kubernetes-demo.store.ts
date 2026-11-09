import { Service, signal } from '@angular/core';

/**
 * Kubernetes clusters. CloudEdge has no Kubernetes screen yet; the only real
 * one is the portal stub user-types-of-worldposta-unified-sign-in/pages/products/KubernetesPage.tsx,
 * whose mock clusters, statuses and regions this keeps. State lives for the
 * visit, and a new cluster finishes provisioning even if the visitor
 * switches tabs. Nothing leaves the browser.
 */
export type ClusterStatus = 'Running' | 'Stopped' | 'Creating' | 'Error';

export interface KubernetesCluster {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly status: ClusterStatus;
  readonly nodeCount: number;
  readonly region: string;
  readonly creationDate: string;
}

export interface NewCluster {
  readonly name: string;
  readonly version: string;
  readonly nodeCount: number;
  readonly region: string;
}

/** How long a new cluster stays in Creating before it is Running. */
export const PROVISION_MS = 4000;

let seq = 0;

@Service()
export class KubernetesDemoStore {
  private readonly list = signal<KubernetesCluster[]>([
    { id: 'k8s-prod-1', name: 'production-cluster', version: '1.28.2', status: 'Running', nodeCount: 5, region: 'US East (N. Virginia)', creationDate: '2023-11-01T10:00:00Z' },
    { id: 'k8s-staging-1', name: 'staging-cluster', version: '1.27.5', status: 'Running', nodeCount: 2, region: 'EU (Frankfurt)', creationDate: '2023-10-15T14:30:00Z' },
    { id: 'k8s-dev-1', name: 'dev-cluster', version: '1.28.2', status: 'Stopped', nodeCount: 1, region: 'US East (N. Virginia)', creationDate: '2023-09-20T09:00:00Z' },
  ]);

  readonly clusters = this.list.asReadonly();

  createCluster(data: NewCluster): KubernetesCluster {
    const cluster: KubernetesCluster = { id: `k8s-${Date.now()}-${seq++}`, ...data, status: 'Creating', creationDate: new Date().toISOString() };
    this.list.update((l) => [cluster, ...l]);
    setTimeout(() => this.setStatus(cluster.id, 'Running'), PROVISION_MS);
    return cluster;
  }

  setStatus(id: string, status: ClusterStatus): void {
    this.list.update((l) => l.map((c) => (c.id === id ? { ...c, status } : c)));
  }

  scale(id: string, nodeCount: number): void {
    this.list.update((l) => l.map((c) => (c.id === id ? { ...c, nodeCount } : c)));
  }

  delete(id: string): void {
    this.list.update((l) => l.filter((c) => c.id !== id));
  }
}
