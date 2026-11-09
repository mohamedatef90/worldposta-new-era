import { Service, signal } from '@angular/core';

/**
 * Posta calendar on demo data: the calendars and event fields of
 * posta/frontend/apps/web/src/api/calendar.ts (CalEvent). Events are placed
 * in the current month, relative to today, so the grid never looks stale.
 * People are fictional; nothing leaves the browser.
 */
export interface DemoCalendar {
  readonly id: string;
  readonly name: string;
}

export interface DemoEvent {
  readonly id: string;
  readonly calendarId: string;
  readonly subject: string;
  readonly location: string;
  readonly start: string;
  readonly end: string;
  readonly allDay: boolean;
  readonly attendees: readonly string[];
  readonly organizer: string;
  readonly reminderMinutes: number | null;
  readonly description: string;
}

export const DEMO_CALENDARS: readonly DemoCalendar[] = [
  { id: 'cal-work', name: 'Calendar' },
  { id: 'cal-team', name: 'Team events' },
];

const ORGANIZER = 'omar.khaled@alpha-inc.com';

function seed(): DemoEvent[] {
  const now = new Date();
  const y = now.getFullYear();
  const mo = now.getMonth();
  const last = new Date(y, mo + 1, 0).getDate();
  const today = now.getDate();
  const day = (d: number) => Math.min(Math.max(d, 1), last);
  const at = (d: number, h: number, m = 0) => new Date(y, mo, day(d), h, m).toISOString();
  let n = 0;
  const ev = (d: number, h: number, m: number, minutes: number, e: Partial<DemoEvent> & Pick<DemoEvent, 'subject'>): DemoEvent => {
    const start = new Date(y, mo, day(d), h, m);
    return {
      id: `ev${++n}`, calendarId: 'cal-work', location: '', allDay: false, attendees: [], organizer: ORGANIZER, reminderMinutes: 15, description: '',
      start: start.toISOString(), end: new Date(+start + minutes * 60_000).toISOString(), ...e,
    };
  };
  // A weekday a few days from today, wrapping inside the month.
  const soon = (offset: number) => ((today - 1 + offset) % last) + 1;
  return [
    ev(today, 10, 0, 30, { subject: 'Daily stand-up', location: 'Posta Link · #launch', attendees: ['sara.hassan@alpha-inc.com', 'youssef.nabil@alpha-inc.com'], calendarId: 'cal-team' }),
    ev(today, 14, 30, 60, { subject: 'Design review: sign-in flow', location: 'Meeting Room A', attendees: ['laila.mansour@alpha-inc.com', 'sara.hassan@alpha-inc.com'], description: 'Walk through the new unified sign-in screens before handoff.' }),
    ev(soon(1), 9, 0, 60, { subject: 'Weekly product sync', location: 'Posta Link meeting', attendees: ['youssef.nabil@alpha-inc.com', 'laila.mansour@alpha-inc.com', 'sara.hassan@alpha-inc.com'], calendarId: 'cal-team' }),
    ev(4, 11, 0, 60, { subject: '1:1 with Sara Hassan', location: 'Office 3.2', attendees: ['sara.hassan@alpha-inc.com'] }),
    ev(8, 13, 0, 60, { subject: 'Lunch with Beta Division', location: 'Downtown', attendees: ['karim@betadivision.net'] }),
    ev(12, 10, 0, 120, { subject: 'Quarterly business review', location: 'Board room', attendees: ['finance@alpha-inc.com', 'sara.hassan@alpha-inc.com'], description: 'Q3 results, cloud spend and the renewal proposal.' }),
    {
      id: `ev${++n}`, calendarId: 'cal-team', subject: 'Team offsite', location: 'Ain Sokhna', allDay: true, attendees: ['team@alpha-inc.com'],
      organizer: 'sara.hassan@alpha-inc.com', reminderMinutes: null, description: 'Two days of planning for next year.',
      start: at(15, 0), end: new Date(new Date(at(16, 0)).getTime() + (24 * 60 - 1) * 60_000).toISOString(),
    },
    ev(19, 16, 0, 60, { subject: 'Posta Link pilot kickoff', location: 'Posta Link meeting', attendees: ['youssef.nabil@alpha-inc.com'], calendarId: 'cal-team' }),
    ev(22, 22, 0, 90, { subject: 'Security patch window', location: 'CloudEdge · Cairo region', reminderMinutes: 60 }),
    ev(26, 9, 30, 30, { subject: 'Budget sign-off', location: 'Finance office', attendees: ['finance@alpha-inc.com'] }),
  ];
}

@Service()
export class CalendarDemoStore {
  private readonly state = signal<DemoEvent[]>(seed());
  readonly events = this.state.asReadonly();

  add(event: Omit<DemoEvent, 'id'>): DemoEvent {
    const created = { ...event, id: `ev${Date.now()}` };
    this.state.update((list) => [...list, created]);
    return created;
  }

  update(id: string, patch: Partial<Omit<DemoEvent, 'id'>>): void {
    this.state.update((list) => list.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  remove(id: string): void {
    this.state.update((list) => list.filter((e) => e.id !== id));
  }

  /** Moves an event to another day, keeping its time and duration (CalendarPage.handleEventDrop). */
  moveToDay(id: string, target: Date): boolean {
    const e = this.state().find((x) => x.id === id);
    if (!e) return false;
    const start = new Date(e.start);
    const oldDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const newDay = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
    if (oldDay === newDay) return false;
    const delta = newDay - oldDay;
    this.update(id, { start: new Date(+start + delta).toISOString(), end: new Date(+new Date(e.end) + delta).toISOString() });
    return true;
  }

  /** Moves an event to an hour on a day, keeping its duration (CalendarPage.handleEventTimeDrop). */
  moveToHour(id: string, day: Date, hour: number): boolean {
    const e = this.state().find((x) => x.id === id);
    if (!e) return false;
    const duration = +new Date(e.end) - +new Date(e.start);
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, 0);
    if (+start === +new Date(e.start)) return false;
    this.update(id, { start: start.toISOString(), end: new Date(+start + duration).toISOString(), allDay: false });
    return true;
  }
}
