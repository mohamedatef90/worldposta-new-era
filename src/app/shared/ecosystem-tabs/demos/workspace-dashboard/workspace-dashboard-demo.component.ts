import { Component, DestroyRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowRight, faCalendarDays, faCircleCheck, faSquareCheck, faVideo } from '@fortawesome/free-solid-svg-icons';
import { DemoDialogComponent } from '../demo-dialog.component';
import { WorkspaceDashboardDemoStore, type DashMeeting } from './workspace-dashboard-demo.store';

const DAY = 86_400_000;
const UPCOMING_LIMIT = 6;

const pad = (n: number) => String(n).padStart(2, '0');
const localDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const startOfDay = (t: number) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
/** Monday to Sunday, as the source's startOfThisWeek / endOfThisWeek. */
const weekBounds = (t: number): [number, number] => {
  const d = new Date(t);
  const dow = d.getDay() || 7;
  const start = startOfDay(t) - (dow - 1) * DAY;
  return [start, start + 7 * DAY - 1];
};

/** lib/joinCode.ts: a code or a pasted meeting link, reduced to its last path segment. */
function checkJoinCode(raw: string): { ok: boolean; code: string; error?: string } {
  let s = raw.trim();
  if (!s) return { ok: false, code: '' };
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) {
    try { s = new URL(s).pathname.split('/').filter(Boolean).pop() ?? ''; } catch { /* treated as a path below */ }
  }
  s = s.split(/[?#]/)[0].replace(/\/+$/, '');
  if (s.includes('/')) s = s.split('/').filter(Boolean).pop() ?? '';
  if (s.length < 3) return { ok: false, code: s, error: 'Enter at least 3 characters, or paste the full meeting link.' };
  if (s.length > 64 || !/^[A-Za-z0-9_-]+$/.test(s)) return { ok: false, code: s, error: "That doesn't look like a meeting code. Paste the code or the full meeting link." };
  return { ok: true, code: s };
}

/**
 * Posta Link › Home, working: the greeting with a live clock, the three quick
 * actions (Start an instant meeting, Schedule for later, Join with a code) with
 * their dialogs and validation, Today & upcoming (live first, then soonest,
 * Join when it is about to start), Recent (last 7 days) and the week's stats,
 * all recomputed as meetings are added. Ported from team-ai-2
 * apps/web/src/pages/Dashboard.tsx, dashboardMeetings.ts and lib/joinCode.ts;
 * content area only.
 */
@Component({
  selector: 'app-workspace-dashboard-demo',
  imports: [FaIconComponent, DemoDialogComponent],
  templateUrl: './workspace-dashboard-demo.component.html',
  styleUrls: ['../demo.css', './workspace-dashboard-demo.component.css'],
})
export class WorkspaceDashboardDemoComponent {
  private readonly store = inject(WorkspaceDashboardDemoStore);

  protected readonly i = { arrow: faArrowRight, cal: faCalendarDays, ok: faCircleCheck, code: faSquareCheck, video: faVideo };

  /** The clock ticks every second, as the source's live clock does. */
  protected readonly now = signal(Date.now());

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const id = setInterval(() => this.now.set(Date.now()), 1000);
      destroyRef.onDestroy(() => clearInterval(id));
    });
  }

  protected readonly greeting = computed(() => {
    const h = new Date(this.now()).getHours();
    if (h < 5) return 'Late night';
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    if (h < 21) return 'Good evening';
    return 'Good night';
  });
  protected readonly dateLabel = computed(() => new Date(this.now()).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
  protected readonly clock = computed(() => this.time(this.now()));

  /** Live first, then soonest start; a meeting stays listed until its scheduled end. */
  private readonly upcomingAll = computed(() => {
    const now = this.now();
    return this.store
      .meetings()
      .filter((m) => m.state === 'active' || (m.state === 'scheduled' && (m.at ?? now) + m.minutes * 60_000 > now))
      .sort((a, b) => (a.state === 'active' ? 0 : 1) - (b.state === 'active' ? 0 : 1) || (a.at ?? 0) - (b.at ?? 0));
  });
  protected readonly upcoming = computed(() => this.upcomingAll().slice(0, UPCOMING_LIMIT));
  protected readonly upcomingTotal = computed(() => this.upcomingAll().length);

  protected readonly recent = computed(() => {
    const since = this.now() - 7 * DAY;
    return this.store
      .meetings()
      .filter((m) => m.state === 'ended' && this.endOf(m) >= since)
      .sort((a, b) => this.endOf(b) - this.endOf(a))
      .slice(0, 5);
  });

  protected readonly summary = computed(() => {
    const now = this.now();
    const today0 = startOfDay(now);
    const today1 = today0 + DAY - 1;
    const [, week1] = weekBounds(now);
    const live = this.store.meetings().filter((m) => m.state !== 'ended');
    const today = live.filter((m) => m.state === 'active' || (m.at !== null && m.at >= today0 && m.at <= today1)).length;
    const later = live.filter((m) => m.state === 'scheduled' && m.at !== null && m.at > today1 && m.at <= week1).length;
    if (!today && !later) return 'No meetings scheduled — ready when you are.';
    if (!today) return `${later} upcoming this week.`;
    const s = today === 1 ? '' : 's';
    return later ? `You have ${today} meeting${s} today and ${later} upcoming this week.` : `You have ${today} meeting${s} today — ready when you are.`;
  });

  protected readonly stats = computed(() => {
    const [w0, w1] = weekBounds(this.now());
    const hosted = this.store.meetings().filter((m) => {
      if (!m.mine) return false;
      const ref = m.state === 'ended' ? this.endOf(m) : m.at;
      return ref !== null && ref >= w0 && ref <= w1;
    });
    const total = hosted.reduce((sum, m) => sum + m.minutes, 0);
    return [
      { value: this.duration(total), label: 'Total time in meetings this week' },
      { value: String(hosted.length), label: 'Meetings you hosted this week' },
      { value: this.duration(hosted.length ? Math.round(total / hosted.length) : 0), label: 'Average meeting duration this week' },
      { value: String(this.store.meetings().length), label: 'Total meetings on your account' },
    ];
  });

  protected isLive(m: DashMeeting): boolean {
    return m.state === 'active' || m.at === null;
  }
  /** Within 15 minutes of the start, or under way: Join instead of Open. */
  protected isSoon(m: DashMeeting): boolean {
    if (this.isLive(m)) return true;
    const delta = (m.at ?? 0) - this.now();
    return delta <= 15 * 60_000 && delta >= -60 * 60_000;
  }
  protected dayLabel(t: number): string {
    return startOfDay(t) === startOfDay(this.now()) ? 'Today' : new Date(t).toLocaleDateString('en-US', { weekday: 'short' });
  }
  protected time(t: number): string {
    return new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  protected endOf(m: DashMeeting): number {
    return (m.at ?? 0) + m.minutes * 60_000;
  }
  protected duration(min: number): string {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h ? `${h}h ${m}m` : `${m}m`;
  }

  /* ---------- Quick actions ---------- */
  protected startInstant(): void {
    this.store.startInstant();
    this.notify('Instant meeting started. Open the Conferencing tab to see a meeting live.');
  }

  protected join(m: DashMeeting): void {
    this.store.join(m.id);
    this.notify(`Joining ${m.title}. Open the Conferencing tab to see a meeting live.`);
  }
  protected openMeeting(m: DashMeeting): void {
    this.notify(`${m.title} opens ${m.at ? this.dayLabel(m.at).toLowerCase() + ' at ' + this.time(m.at) : 'now'}: its room, chat and notes are ready.`);
  }

  /* ---------- Schedule a meeting ---------- */
  protected readonly scheduling = signal(false);
  protected readonly sched = signal({ title: '', date: '', time: '', minutes: 30 });
  protected readonly schedError = signal('');
  protected readonly minDate = computed(() => localDate(new Date(this.now())));
  protected readonly schedComplete = computed(() => {
    const s = this.sched();
    return !!s.title.trim() && !!s.date && !!s.time;
  });
  protected readonly schedTouched = computed(() => {
    const s = this.sched();
    return !!(s.title || s.date || s.time);
  });

  protected openSchedule(): void {
    this.sched.set({ title: '', date: '', time: '', minutes: 30 });
    this.schedError.set('');
    this.scheduling.set(true);
  }
  protected setSched<K extends 'title' | 'date' | 'time' | 'minutes'>(key: K, value: string): void {
    this.sched.update((s) => ({ ...s, [key]: key === 'minutes' ? Number(value) : value }));
    this.schedError.set('');
  }
  protected submitSchedule(): void {
    const s = this.sched();
    if (!this.schedComplete()) return;
    const at = new Date(`${s.date}T${s.time}:00`).getTime();
    if (Number.isNaN(at) || at < Date.now()) {
      this.schedError.set('That start time has already passed. Pick a time in the future.');
      return;
    }
    const m = this.store.schedule(s.title.trim(), at, s.minutes);
    this.scheduling.set(false);
    this.notify(`${m.title} scheduled for ${this.dayLabel(at).toLowerCase() === 'today' ? 'today' : new Date(at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${this.time(at)}.`);
  }

  /* ---------- Join with a code ---------- */
  protected readonly joining = signal(false);
  protected readonly joinCode = signal('');
  protected readonly joinCheck = computed(() => checkJoinCode(this.joinCode()));

  protected openJoin(): void {
    this.joinCode.set('');
    this.joining.set(true);
  }
  protected submitJoin(): void {
    const check = this.joinCheck();
    if (!check.ok) return;
    this.joining.set(false);
    this.notify(`Joining meeting ${check.code}. In Posta Link this opens the meeting room.`);
  }

  /* ---------- Shared ---------- */
  protected readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  protected notify(text: string): void {
    this.toast.set(text);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 3600);
  }
}
