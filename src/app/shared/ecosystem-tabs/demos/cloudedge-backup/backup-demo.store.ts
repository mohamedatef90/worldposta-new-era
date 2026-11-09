import { Service, signal } from '@angular/core';

/**
 * CloudEdge backup jobs and restore requests, ported from the console's
 * JobsComponent and RestoreRequestsComponent mock data
 * (cloudedge/src/pages/backup). Runs and restores progress on timers held
 * here, so they keep going while the visitor switches tabs. Nothing leaves
 * the browser.
 */
export type Frequency = 'Daily' | 'Weekly' | 'Monthly';
export type RestoreStatus = 'Pending' | 'In Progress' | 'Completed' | 'Failed';

export interface BackupJob {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly isHighPriority: boolean;
  readonly reservation: string;
  readonly status: boolean;
  readonly selectedVmIds: readonly string[];
  readonly frequency: Frequency;
  readonly time: string;
  readonly retentionDays: number;
  readonly storagePolicy: string;
  readonly lastRun: string | null;
  readonly running: boolean;
}

export type JobForm = Pick<BackupJob, 'name' | 'description' | 'reservation' | 'status' | 'selectedVmIds' | 'frequency' | 'time' | 'retentionDays' | 'storagePolicy'>;

export interface RestoreRequest {
  readonly id: string;
  readonly name: string;
  readonly backupJobName: string;
  readonly restorePoint: string;
  readonly requestedAt: string;
  readonly status: RestoreStatus;
}

export interface VmItem {
  readonly id: string;
  readonly name: string;
}

export const ALL_VMS: readonly VmItem[] = [
  { id: 'vm1', name: 'App-Server-01' },
  { id: 'vm2', name: 'App-Server-02' },
  { id: 'vm3', name: 'DB-Node-01' },
  { id: 'vm4', name: 'DB-Node-02' },
  { id: 'vm5', name: 'Cache-Redis-01' },
  { id: 'vm6', name: 'Web-Proxy-01' },
  { id: 'vm7', name: 'Web-Proxy-02' },
  { id: 'vm8', name: 'Worker-Node-01' },
];

const pad = (n: number) => String(n).padStart(2, '0');
/** The console's "2023-11-05 10:00 AM" format. */
export const stamp = (d: Date): string => {
  const h = d.getHours();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(h % 12 || 12)}:${pad(d.getMinutes())} ${h < 12 ? 'AM' : 'PM'}`;
};

const INITIAL_JOBS: BackupJob[] = [
  { id: '1', name: 'Nightly Database Backup', description: 'Full backup of main database.', isHighPriority: true, reservation: 'VDC1', status: true, selectedVmIds: ['vm3', 'vm4'], frequency: 'Daily', time: '02:00', retentionDays: 14, storagePolicy: 'Performance', lastRun: null, running: false },
  { id: '2', name: 'Weekly File Server Backup', description: 'Incremental backup of user files.', isHighPriority: false, reservation: 'VDC2', status: false, selectedVmIds: ['vm1'], frequency: 'Weekly', time: '23:00', retentionDays: 30, storagePolicy: 'Standard', lastRun: null, running: false },
];

const INITIAL_REQUESTS: RestoreRequest[] = [
  { id: '1', name: 'Restore DB to yesterday', backupJobName: 'Nightly Database Backup', restorePoint: '2023-11-04 02:00 AM', requestedAt: '2023-11-05 10:00 AM', status: 'Completed' },
  { id: '2', name: 'Restore Files HR', backupJobName: 'Weekly File Server Backup', restorePoint: '2023-11-05 11:00 PM', requestedAt: '2023-11-06 02:30 PM', status: 'In Progress' },
];

@Service()
export class BackupDemoStore {
  private readonly jobsState = signal<BackupJob[]>(INITIAL_JOBS);
  private readonly requestsState = signal<RestoreRequest[]>(INITIAL_REQUESTS);
  readonly jobs = this.jobsState.asReadonly();
  readonly requests = this.requestsState.asReadonly();
  /** The latest thing that finished on its own, for the page to announce. */
  readonly event = signal<{ seq: number; text: string } | null>(null);
  private seq = 0;

  private emit(text: string): void {
    this.event.set({ seq: ++this.seq, text });
  }

  private patchJob(id: string, changes: Partial<BackupJob>): void {
    this.jobsState.update((jobs) => jobs.map((j) => (j.id === id ? { ...j, ...changes } : j)));
  }

  addJob(form: JobForm): BackupJob {
    const job: BackupJob = { ...form, id: `job-${Date.now()}`, isHighPriority: false, lastRun: null, running: false };
    this.jobsState.update((jobs) => [...jobs, job]);
    return job;
  }

  updateJob(id: string, form: JobForm): void {
    this.patchJob(id, form);
  }

  setStatus(id: string, status: boolean): void {
    this.patchJob(id, { status });
  }

  setPriority(id: string, isHighPriority: boolean): void {
    this.patchJob(id, { isHighPriority });
  }

  deleteJob(id: string): void {
    this.jobsState.update((jobs) => jobs.filter((j) => j.id !== id));
  }

  /** Backs the job's VMs up now; it finishes a few seconds later. */
  runNow(id: string): void {
    const job = this.jobsState().find((j) => j.id === id);
    if (!job || job.running) return;
    this.patchJob(id, { running: true });
    setTimeout(() => {
      const current = this.jobsState().find((j) => j.id === id);
      if (!current) return;
      this.patchJob(id, { running: false, lastRun: stamp(new Date()) });
      const n = current.selectedVmIds.length;
      this.emit(`${current.name} finished: ${n} ${n === 1 ? 'VM' : 'VMs'} backed up.`);
    }, 3500);
  }

  /** The restore points a job has kept, newest first. */
  restorePoints(job: BackupJob): string[] {
    const [h, m] = job.time.split(':').map(Number);
    const step = job.frequency === 'Daily' ? 1 : job.frequency === 'Weekly' ? 7 : 30;
    const points = Array.from({ length: 4 }, (_, n) => {
      const d = new Date();
      d.setHours(h, m, 0, 0);
      d.setDate(d.getDate() - 1 - n * step);
      return stamp(d);
    });
    return job.lastRun ? [job.lastRun, ...points] : points;
  }

  /** Files a restore request; it moves Pending → In Progress → Completed on timers. */
  createRequest(name: string, backupJobName: string, restorePoint: string): RestoreRequest {
    const req: RestoreRequest = { id: `req-${Date.now()}`, name, backupJobName, restorePoint, requestedAt: stamp(new Date()), status: 'Pending' };
    this.requestsState.update((reqs) => [req, ...reqs]);
    const advance = (status: RestoreStatus, delay: number) =>
      setTimeout(() => {
        if (!this.requestsState().some((r) => r.id === req.id)) return;
        this.requestsState.update((reqs) => reqs.map((r) => (r.id === req.id ? { ...r, status } : r)));
        this.emit(`Restore request ${name} is ${status === 'Completed' ? 'completed' : 'in progress'}.`);
      }, delay);
    advance('In Progress', 2500);
    advance('Completed', 8000);
    return req;
  }

  deleteRequest(id: string): void {
    this.requestsState.update((reqs) => reqs.filter((r) => r.id !== id));
  }
}
