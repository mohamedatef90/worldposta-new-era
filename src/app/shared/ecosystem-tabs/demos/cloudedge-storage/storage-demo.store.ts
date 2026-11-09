import { Service, computed, signal } from '@angular/core';

/**
 * CloudEdge storage, ported from cloudedge/src/pages/storage/storage.component.ts
 * and its mock disks, buckets and snapshots. State lives for the visit, so
 * a disk created here is still there after switching tabs. Nothing leaves
 * the browser.
 */
export type DiskType = 'Standard SSD' | 'High-Performance SSD' | 'Archive HDD';
export type AccessLevel = 'Private' | 'Public';

export interface Disk {
  readonly id: string;
  readonly name: string;
  readonly size: number; // GB
  readonly type: DiskType;
  readonly attachedTo: string | null;
  readonly diskNumber: number | null;
  readonly creationDate: string;
}

export interface Bucket {
  readonly id: string;
  readonly name: string;
  readonly region: string;
  readonly accessLevel: AccessLevel;
}

export interface Snapshot {
  readonly id: string;
  readonly name: string;
  readonly sourceDisk: string;
  readonly size: number; // GB
  readonly creationTime: string;
}

export interface NewDisk {
  readonly name: string;
  readonly size: number;
  readonly type: DiskType;
  readonly attachedTo: string | null;
  readonly diskNumber: number | null;
}

const DAY = 24 * 3600_000;
const today = () => new Date().toISOString().split('T')[0];
let seq = 0;
const uid = (prefix: string) => `${prefix}-${Date.now()}-${seq++}`;

@Service()
export class StorageDemoStore {
  /** 10 TB, in GB. */
  readonly totalCapacity = 10240;

  private readonly diskList = signal<Disk[]>([
    { id: 'disk-1', name: 'prod-web-server-os', size: 100, type: 'High-Performance SSD', attachedTo: 'prod-web-server-01', diskNumber: 0, creationDate: '2023-05-10' },
    { id: 'disk-7', name: 'prod-web-server-data', size: 250, type: 'Standard SSD', attachedTo: 'prod-web-server-01', diskNumber: 1, creationDate: '2023-11-15' },
    { id: 'disk-2', name: 'sql-database-data', size: 500, type: 'High-Performance SSD', attachedTo: 'sql-database-main', diskNumber: 0, creationDate: '2023-03-22' },
    { id: 'disk-3', name: 'dev-env-main-disk', size: 50, type: 'Standard SSD', attachedTo: 'dev-environment-centos', diskNumber: 0, creationDate: '2023-08-01' },
    { id: 'disk-4', name: 'k8s-worker-storage', size: 200, type: 'Standard SSD', attachedTo: 'k8s-worker-node-a', diskNumber: 0, creationDate: '2023-09-15' },
    { id: 'disk-5', name: 'archived-logs-q3', size: 1000, type: 'Archive HDD', attachedTo: null, diskNumber: null, creationDate: '2023-10-01' },
    { id: 'disk-6', name: 'ad-dc-backup', size: 150, type: 'Standard SSD', attachedTo: 'AD-Domain-Controller', diskNumber: 0, creationDate: '2022-11-30' },
  ]);

  private readonly bucketList = signal<Bucket[]>([
    { id: 'bucket-1', name: 'website-static-assets', region: 'us-east-1', accessLevel: 'Public' },
    { id: 'bucket-2', name: 'database-backups-private', region: 'us-west-2', accessLevel: 'Private' },
    { id: 'bucket-3', name: 'application-logs', region: 'eu-central-1', accessLevel: 'Private' },
  ]);

  private readonly snapshotList = signal<Snapshot[]>([
    { id: 'snap-1', name: 'prod-web-os-pre-patch', sourceDisk: 'prod-web-server-os', size: 100, creationTime: '2023-10-26T10:00:00Z' },
    { id: 'snap-2', name: 'sql-db-weekly-backup', sourceDisk: 'sql-database-data', size: 500, creationTime: new Date(Date.now() - 4 * DAY).toISOString() },
    { id: 'snap-3', name: 'dev-env-before-upgrade', sourceDisk: 'dev-env-main-disk', size: 50, creationTime: new Date(Date.now() - 10 * DAY).toISOString() },
  ]);

  readonly disks = this.diskList.asReadonly();
  readonly buckets = this.bucketList.asReadonly();
  readonly snapshots = this.snapshotList.asReadonly();

  /** Capacity Overview: provisioned disk space against the 10 TB pool. */
  readonly provisioned = computed(() => this.diskList().reduce((sum, d) => sum + d.size, 0));
  readonly available = computed(() => this.totalCapacity - this.provisioned());

  createDisk(data: NewDisk): Disk {
    const disk: Disk = { id: uid('disk'), ...data, creationDate: today() };
    this.diskList.update((list) => [disk, ...list]);
    return disk;
  }

  resizeDisk(id: string, size: number): void {
    this.diskList.update((list) => list.map((d) => (d.id === id ? { ...d, size } : d)));
  }

  attachDisk(id: string, vmName: string, diskNumber: number): void {
    this.diskList.update((list) => list.map((d) => (d.id === id ? { ...d, attachedTo: vmName, diskNumber } : d)));
  }

  detachDisk(id: string): void {
    this.diskList.update((list) => list.map((d) => (d.id === id ? { ...d, attachedTo: null, diskNumber: null } : d)));
  }

  deleteDisk(id: string): void {
    this.diskList.update((list) => list.filter((d) => d.id !== id));
  }

  createSnapshot(disk: Disk, name: string): Snapshot {
    const snap: Snapshot = { id: uid('snap'), name, sourceDisk: disk.name, size: disk.size, creationTime: new Date().toISOString() };
    this.snapshotList.update((list) => [snap, ...list]);
    return snap;
  }

  deleteSnapshot(id: string): void {
    this.snapshotList.update((list) => list.filter((s) => s.id !== id));
  }

  createBucket(name: string, region: string, accessLevel: AccessLevel): Bucket {
    const bucket: Bucket = { id: uid('bucket'), name, region, accessLevel };
    this.bucketList.update((list) => [...list, bucket]);
    return bucket;
  }

  deleteBucket(id: string): void {
    this.bucketList.update((list) => list.filter((b) => b.id !== id));
  }

  /** The console offers the first 16 free disk slots on a VM. */
  freeDiskNumbers(vmName: string): number[] {
    const used = new Set(this.diskList().filter((d) => d.attachedTo === vmName && d.diskNumber !== null).map((d) => d.diskNumber));
    const free: number[] = [];
    for (let n = 0; free.length < 16 && n <= 100; n++) if (!used.has(n)) free.push(n);
    return free;
  }
}
