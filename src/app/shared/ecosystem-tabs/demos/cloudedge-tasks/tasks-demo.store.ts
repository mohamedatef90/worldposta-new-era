import { Service, signal } from '@angular/core';

/**
 * CloudEdge scheduled tasks and running tasks, ported from the console's
 * ScheduledTasksComponent, ScheduledGroupsComponent and RunningTasksComponent
 * mock data (cloudedge/src/pages/scheduled-tasks, scheduled-groups,
 * running-tasks). "Run now" progress ticks here, so it keeps going while the
 * visitor switches tabs. Nothing leaves the browser.
 */
export type TaskStatus = 'Enabled' | 'Disabled';
export type Recurring = 'Daily' | 'Weekly' | 'Monthly' | 'No';
export type ActionType = 'One Action' | 'Group of actions';
export type RunStatus = 'Running' | 'Success' | 'Failed' | 'Pending';

export interface ScheduledTask {
  readonly id: string;
  readonly name: string;
  readonly reservation: string;
  readonly description: string;
  readonly status: TaskStatus;
  readonly actionType: ActionType;
  readonly action: string;
  readonly recurring: Recurring;
  readonly recurringValue: number;
  readonly objectType: string;
  readonly objectName: string;
  readonly type: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly recurringTime: string;
  readonly maxCount: number | 'Unlimited';
}

export type TaskForm = Omit<ScheduledTask, 'id'>;

export interface ScheduledGroup {
  readonly id: string;
  readonly name: string;
  readonly isExpanded: boolean;
  readonly status: TaskStatus;
  readonly tasks: readonly ScheduledTask[];
}

export interface RunningTask {
  readonly id: string;
  readonly taskName: string;
  readonly targetResource: string;
  readonly action: string;
  readonly status: RunStatus;
  readonly progress: number;
  readonly startTime: string;
  readonly endTime: string | null;
  readonly initiatedBy: string;
}

/** The action groups defined on the console's Scheduled Groups page. */
export const ACTION_GROUPS = ['evr · Nat', 'b · PolicyRole', 'eg · PolicyRole'];

const task = (t: Partial<ScheduledTask> & Pick<ScheduledTask, 'id' | 'action' | 'objectName' | 'type'>): ScheduledTask => ({
  name: '', reservation: '', description: '', status: 'Enabled', actionType: 'One Action', recurring: 'Daily', recurringValue: 1,
  objectType: 'VirtualMachine', startDate: '2024-07-01', endDate: '', recurringTime: '02:00', maxCount: 'Unlimited', ...t,
});

const INITIAL_GROUPS: ScheduledGroup[] = [
  { id: 'group-1', name: 'Nightly Operations', isExpanded: true, status: 'Enabled', tasks: [
    task({ id: 'task-1', name: 'Nightly VM Shutdown', action: 'Stop VM', objectName: 'All Dev VMs', type: 'Virtual Machine', recurringTime: '02:00' }),
    task({ id: 'task-2', name: 'Weekly DB Snapshot', action: 'Create Snapshot', objectName: 'sql-database-main', type: 'Database', objectType: 'Database', recurringTime: '04:00', maxCount: 5 }),
  ] },
  { id: 'group-2', name: 'Maintenance Scripts', isExpanded: false, status: 'Disabled', tasks: [
    task({ id: 'task-3', name: 'Storage Cleanup', status: 'Disabled', action: 'Run Script', recurring: 'No', objectName: 'Storage Cleanup', type: 'Script', objectType: 'Storage', startDate: '2024-08-01', endDate: '2024-08-01', recurringTime: '', maxCount: 1 }),
  ] },
];

const INITIAL_RUNS: RunningTask[] = [
  { id: 'run-1', taskName: 'Provision New VM', targetResource: 'k8s-worker-node-b', action: 'Create VM', status: 'Running', progress: 75, startTime: '2024-07-30 10:00 UTC', endTime: null, initiatedBy: 'Admin' },
  { id: 'run-2', taskName: 'Nightly VM Shutdown', targetResource: 'All Dev VMs', action: 'Stop VM', status: 'Success', progress: 100, startTime: '2024-07-30 02:00 UTC', endTime: '2024-07-30 02:05 UTC', initiatedBy: 'Scheduler' },
  { id: 'run-3', taskName: 'Apply Security Patch', targetResource: 'prod-web-server-01', action: 'Run Script', status: 'Failed', progress: 30, startTime: '2024-07-29 20:00 UTC', endTime: '2024-07-29 20:01 UTC', initiatedBy: 'Admin' },
  { id: 'run-4', taskName: 'Weekly DB Snapshot', targetResource: 'sql-database-main', action: 'Create Snapshot', status: 'Success', progress: 100, startTime: '2024-07-28 04:00 UTC', endTime: '2024-07-28 04:15 UTC', initiatedBy: 'Scheduler' },
  { id: 'run-5', taskName: 'Scale Out Web Tier', targetResource: 'Web Server Group', action: 'Add VM', status: 'Pending', progress: 0, startTime: '2024-07-30 10:05 UTC', endTime: null, initiatedBy: 'Auto-scaler' },
];

/** The console's "2024-07-30 10:00 UTC" format. */
const utc = (d: Date): string => `${d.toISOString().slice(0, 10)} ${d.toISOString().slice(11, 16)} UTC`;

@Service()
export class TasksDemoStore {
  private readonly groupsState = signal<ScheduledGroup[]>(INITIAL_GROUPS);
  private readonly runsState = signal<RunningTask[]>(INITIAL_RUNS);
  readonly groups = this.groupsState.asReadonly();
  readonly runs = this.runsState.asReadonly();
  /** The latest run that finished on its own, for the page to announce. */
  readonly event = signal<{ seq: number; text: string } | null>(null);
  private seq = 0;
  private ticker?: ReturnType<typeof setInterval>;

  private mapGroup(id: string, fn: (g: ScheduledGroup) => ScheduledGroup): void {
    this.groupsState.update((groups) => groups.map((g) => (g.id === id ? fn(g) : g)));
  }

  toggleGroup(id: string): void {
    this.mapGroup(id, (g) => ({ ...g, isExpanded: !g.isExpanded }));
  }

  setGroupStatus(id: string, status: TaskStatus): void {
    this.mapGroup(id, (g) => ({ ...g, status }));
  }

  addTask(groupId: string, form: TaskForm): ScheduledTask {
    const t: ScheduledTask = { ...form, id: `task-${Date.now()}` };
    this.mapGroup(groupId, (g) => ({ ...g, isExpanded: true, tasks: [t, ...g.tasks] }));
    return t;
  }

  /** Saves an edited task, moving it if its group changed. */
  updateTask(taskId: string, groupId: string, form: TaskForm): void {
    const t: ScheduledTask = { ...form, id: taskId };
    this.groupsState.update((groups) =>
      groups.map((g) => {
        const rest = g.tasks.filter((x) => x.id !== taskId);
        if (g.id !== groupId) return rest.length === g.tasks.length ? g : { ...g, tasks: rest };
        const at = g.tasks.findIndex((x) => x.id === taskId);
        return { ...g, isExpanded: true, tasks: at >= 0 ? g.tasks.map((x) => (x.id === taskId ? t : x)) : [t, ...g.tasks] };
      }),
    );
  }

  setTaskStatus(groupId: string, taskId: string, status: TaskStatus): void {
    this.mapGroup(groupId, (g) => ({ ...g, tasks: g.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)) }));
  }

  deleteTask(groupId: string, taskId: string): void {
    this.mapGroup(groupId, (g) => ({ ...g, tasks: g.tasks.filter((t) => t.id !== taskId) }));
  }

  /** Starts the task now; its progress ticks up until it succeeds. */
  runNow(t: ScheduledTask): RunningTask {
    const run: RunningTask = {
      id: `run-now-${Date.now()}`, taskName: t.name || t.action, targetResource: t.objectName, action: t.action,
      status: 'Running', progress: 0, startTime: utc(new Date()), endTime: null, initiatedBy: 'Admin',
    };
    this.runsState.update((runs) => [run, ...runs]);
    this.startTicker();
    return run;
  }

  /** The console's Refresh: re-reads progress (here, nudges the oldest running task on). */
  refresh(): void {
    this.advance((r) => (r.id === 'run-1' ? 10 : 0));
  }

  /** Moves running tasks on by the given step; those reaching 100% succeed and are announced. */
  private advance(step: (r: RunningTask) => number): number {
    const finished: string[] = [];
    let moving = 0;
    const runs = this.runsState().map((r) => {
      const by = r.status === 'Running' ? step(r) : 0;
      if (!by) return r;
      moving++;
      const progress = Math.min(100, r.progress + by);
      if (progress < 100) return { ...r, progress };
      finished.push(r.taskName);
      return { ...r, progress: 100, status: 'Success' as const, endTime: utc(new Date()) };
    });
    this.runsState.set(runs);
    for (const name of finished) this.event.set({ seq: ++this.seq, text: `${name} finished successfully.` });
    return moving;
  }

  /** Ticks the runs started with Run now; the seeded ones only move on Refresh, as in the console. */
  private startTicker(): void {
    if (this.ticker) return;
    this.ticker = setInterval(() => {
      const moving = this.advance((r) => (r.id.startsWith('run-now-') ? 9 + Math.round(Math.random() * 8) : 0));
      if (!moving) {
        clearInterval(this.ticker);
        this.ticker = undefined;
      }
    }, 700);
  }
}
