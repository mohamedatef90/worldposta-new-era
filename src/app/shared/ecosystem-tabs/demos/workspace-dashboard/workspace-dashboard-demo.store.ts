import { Service, signal } from '@angular/core';

/**
 * Posta Link home dashboard, ported from team-ai-2's DashboardPage
 * (apps/web/src/pages/Dashboard.tsx, dashboardMeetings.ts, lib/joinCode.ts).
 * The meetings are the fictional ones of the product's "02 Activity Home"
 * design frame, placed around the visitor's own clock so Today, Now and
 * "starts soon" read true. Creating and joining stay in the browser.
 */
export type MeetingState = 'scheduled' | 'active' | 'ended';

export interface DashMeeting {
  readonly id: string;
  readonly title: string;
  readonly workspace: string;
  readonly state: MeetingState;
  /** Start, in ms since epoch; null for an instant meeting that was never scheduled. */
  readonly at: number | null;
  readonly minutes: number;
  readonly recurring?: boolean;
  /** I host it: counts toward "Meetings you hosted this week". */
  readonly mine: boolean;
}

const MIN = 60_000;
const HOUR = 60 * MIN;

/** Today at hh:mm local time. */
function todayAt(h: number, m: number, dayOffset = 0): number {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

function seed(): DashMeeting[] {
  const now = Date.now();
  // The weekly sync is always about to start, as in the design: "starts in 12 minutes".
  const soon = Math.ceil((now + 12 * MIN) / (5 * MIN)) * 5 * MIN;
  return [
    { id: 'mt-sync', title: 'Weekly launch sync', workspace: 'Brand Launch', state: 'scheduled', at: soon, minutes: 45, recurring: true, mine: true },
    { id: 'mt-client', title: 'Client review', workspace: 'Client Portal', state: 'scheduled', at: soon + 2.5 * HOUR, minutes: 30, mine: false },
    { id: 'mt-ops', title: 'Operations planning', workspace: 'Operations', state: 'scheduled', at: todayAt(10, 0, 1), minutes: 60, mine: true },
    { id: 'mt-vendor', title: 'Vendor review', workspace: 'Brand Launch', state: 'ended', at: now - 3 * HOUR, minutes: 25, mine: true },
    { id: 'mt-design', title: 'Design critique', workspace: 'Brand Launch', state: 'ended', at: now - 26 * HOUR, minutes: 40, mine: true },
    { id: 'mt-kickoff', title: 'Brand launch kickoff', workspace: 'Brand Launch', state: 'ended', at: now - 50 * HOUR, minutes: 60, mine: false },
    { id: 'mt-handover', title: 'Ops handover', workspace: 'Operations', state: 'ended', at: now - 4 * 24 * HOUR, minutes: 30, mine: true },
  ];
}

@Service()
export class WorkspaceDashboardDemoStore {
  private readonly state = signal<DashMeeting[]>(seed());
  readonly meetings = this.state.asReadonly();

  /** "Start an instant meeting": a live room, no schedule. */
  startInstant(): DashMeeting {
    const m: DashMeeting = { id: `mt-${Date.now()}`, title: 'Instant meeting', workspace: 'Personal', state: 'active', at: Date.now(), minutes: 0, mine: true };
    this.state.update((list) => [m, ...list]);
    return m;
  }

  schedule(title: string, at: number, minutes: number): DashMeeting {
    const m: DashMeeting = { id: `mt-${Date.now()}`, title, workspace: 'Personal', state: 'scheduled', at, minutes, mine: true };
    this.state.update((list) => [...list, m]);
    return m;
  }

  /** Joining a meeting that is about to start opens its room. */
  join(id: string): void {
    this.state.update((list) => list.map((m) => (m.id === id ? { ...m, state: 'active' } : m)));
  }
}
