import { Component, ElementRef, computed, inject, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowsRotate, faCalendarDays, faChevronLeft, faChevronRight, faCircleCheck, faClock, faLocationDot, faPlus, faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { DemoDialogComponent } from '../demo-dialog.component';
import { CalendarDemoStore, DEMO_CALENDARS, type DemoEvent } from './calendar-demo.store';

type View = 'month' | 'week' | 'day';
type DayPosition = 'single' | 'start' | 'middle' | 'end';
interface EventForm { id: string | null; calendarId: string; subject: string; location: string; start: string; end: string; attendees: string; reminder: string }
interface MonthCell { date: Date; key: string; other: boolean; today: boolean; events: DemoEvent[] }

const HOUR_PX = 40;
const EVENT_MIME = 'application/x-posta-event';

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
const startOfWeek = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay());
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const pad = (n: number) => String(n).padStart(2, '0');
/** datetime-local value, as EventCreateModal.toLocalInput. */
const toLocalInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const toDateInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * Posta calendar, working: Month, Week and Day views with previous / Today /
 * next, New event (also by clicking a day), event details with Edit and
 * Delete event, and drag an event to another day (Month) or hour (Day), with
 * a "Move to date" field in the event details as the keyboard alternative.
 * Ported from posta/frontend/apps/web/src: pages/CalendarPage.tsx (MonthGrid,
 * DayList, TimeGridDayView, handleEventDrop / handleEventTimeDrop) and
 * components/EventCreateModal.tsx and EventDetailsModal.tsx. The calendar
 * sidebar is app navigation and is left out.
 */
@Component({
  selector: 'app-posta-calendar-demo',
  imports: [FaIconComponent, DemoDialogComponent],
  templateUrl: './calendar-demo.component.html',
  styleUrls: ['../demo.css', './calendar-demo.component.css'],
})
export class CalendarDemoComponent {
  private readonly store = inject(CalendarDemoStore);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly i = {
    sync: faArrowsRotate, cal: faCalendarDays, prev: faChevronLeft, next: faChevronRight, ok: faCircleCheck, clock: faClock,
    pin: faLocationDot, plus: faPlus, people: faUsers,
  };
  protected readonly calendars = DEMO_CALENDARS;
  protected readonly weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  protected readonly hours = Array.from({ length: 24 }, (_, h) => h);
  protected readonly hourPx = HOUR_PX;

  protected readonly current = signal(startOfDay(new Date()));
  protected readonly view = signal<View>('month');
  protected readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  /* ---------- Range and header ---------- */
  protected readonly headerLabel = computed(() => {
    const c = this.current();
    if (this.view() === 'month') return c.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (this.view() === 'week') {
      const s = startOfWeek(c);
      const e = new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
      return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return c.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  });

  protected setView(value: string): void {
    this.view.set(value as View);
    if (value === 'day') this.scrollDayToMorning();
  }

  protected navigatePeriod(delta: number): void {
    const d = new Date(this.current());
    if (this.view() === 'month') d.setMonth(d.getMonth() + delta, 1);
    else d.setDate(d.getDate() + (this.view() === 'week' ? 7 * delta : delta));
    this.current.set(startOfDay(d));
  }

  protected goToday(): void {
    this.current.set(startOfDay(new Date()));
    if (this.view() === 'day') this.scrollDayToMorning();
  }

  /** The month grid's day number and "+N more" open that day, as MonthGrid's onDayClick does. */
  protected openDay(d: Date): void {
    this.current.set(startOfDay(d));
    this.view.set('day');
    this.scrollDayToMorning();
  }

  private scrollDayToMorning(): void {
    setTimeout(() => {
      const body = this.host.querySelector<HTMLElement>('.pc-timegrid');
      if (body) body.scrollTop = 7 * HOUR_PX;
    });
  }

  private eventsOn(d: Date): DemoEvent[] {
    const ds = startOfDay(d).getTime();
    const de = endOfDay(d).getTime();
    return this.store
      .events()
      .filter((e) => +new Date(e.start) <= de && +new Date(e.end) >= ds)
      .sort((a, b) => a.start.localeCompare(b.start));
  }

  protected readonly monthCells = computed<MonthCell[]>(() => {
    const c = this.current();
    const first = new Date(c.getFullYear(), c.getMonth(), 1);
    const lastDay = new Date(c.getFullYear(), c.getMonth() + 1, 0);
    const start = startOfWeek(first);
    const end = new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate() + (6 - lastDay.getDay()));
    const today = new Date();
    this.store.events(); // re-run when events change
    const cells: MonthCell[] = [];
    for (let d = new Date(start); d <= end; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
      cells.push({ date: d, key: toDateInput(d), other: d.getMonth() !== c.getMonth(), today: sameDay(d, today), events: this.eventsOn(d) });
    }
    return cells;
  });

  protected readonly weekDays = computed(() => {
    const s = startOfWeek(this.current());
    this.store.events();
    return Array.from({ length: 7 }, (_, n) => {
      const date = new Date(s.getFullYear(), s.getMonth(), s.getDate() + n);
      return { date, key: toDateInput(date), events: this.eventsOn(date) };
    });
  });

  /** Day view bars, placed by start time and duration (TimeGridDayView). */
  protected readonly dayBars = computed(() => {
    const day = this.current();
    const ds = startOfDay(day);
    const de = endOfDay(day);
    return this.eventsOn(day).map((e) => {
      const es = new Date(e.start);
      const ee = new Date(e.end);
      const startHour = es < ds ? 0 : es.getHours() + es.getMinutes() / 60;
      const endHour = ee > de ? 24 : ee.getHours() + ee.getMinutes() / 60;
      return { e, top: startHour * HOUR_PX, height: Math.max(22, (endHour - startHour) * HOUR_PX) };
    });
  });

  /* ---------- Labels ---------- */
  protected fmtTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  protected longDate(d: Date): string {
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  protected hourLabel(h: number): string {
    return `${pad(h)}:00`;
  }

  /** Where an event sits on a given day of the month grid, for the continuation arrows. */
  protected position(e: DemoEvent, d: Date): DayPosition {
    const ds = startOfDay(d).getTime();
    const de = endOfDay(d).getTime();
    const es = +new Date(e.start);
    const ee = +new Date(e.end);
    const startsHere = es >= ds && es <= de;
    const endsHere = ee >= ds && ee <= de;
    return startsHere && endsHere ? 'single' : startsHere ? 'start' : endsHere ? 'end' : 'middle';
  }

  protected when(e: DemoEvent): string {
    const s = new Date(e.start);
    const en = new Date(e.end);
    const date = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (e.allDay) return sameDay(s, en) ? `${date(s)} · All day` : `${date(s)} – ${date(en)} · All day`;
    return sameDay(s, en) ? `${date(s)} · ${this.fmtTime(e.start)} – ${this.fmtTime(e.end)}` : `${date(s)} ${this.fmtTime(e.start)} – ${date(en)} ${this.fmtTime(e.end)}`;
  }

  protected pillLabel(e: DemoEvent, d: Date): string {
    const time = e.allDay ? 'All day' : this.fmtTime(e.start);
    return `${time}, ${e.subject || '(no title)'}, ${this.longDate(d)}`;
  }

  protected dayLabel(cell: MonthCell): string {
    const n = cell.events.length;
    return `${this.longDate(cell.date)}${cell.today ? ', today' : ''}, ${n ? `${n} ${n === 1 ? 'event' : 'events'}` : 'no events'}. Open day view`;
  }

  /* ---------- Drag an event to another day or hour ---------- */
  private dragId: string | null = null;
  protected readonly dropKey = signal<string | null>(null);

  protected onDragStart(event: DragEvent, e: DemoEvent): void {
    event.stopPropagation();
    this.dragId = e.id;
    event.dataTransfer?.setData(EVENT_MIME, e.id);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  protected onDragEnd(): void {
    this.dragId = null;
    this.dropKey.set(null);
  }

  protected onDragOver(event: DragEvent, key: string): void {
    if (!this.dragId && !event.dataTransfer?.types.includes(EVENT_MIME)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.dropKey.set(key);
  }

  protected onDropDay(event: DragEvent, d: Date): void {
    event.preventDefault();
    const id = event.dataTransfer?.getData(EVENT_MIME) || this.dragId;
    this.onDragEnd();
    if (id) this.moveToDay(id, d);
  }

  protected onDropHour(event: DragEvent, h: number): void {
    event.preventDefault();
    const id = event.dataTransfer?.getData(EVENT_MIME) || this.dragId;
    this.onDragEnd();
    const e = this.store.events().find((x) => x.id === id);
    if (e && this.store.moveToHour(e.id, this.current(), h)) this.notify(`"${e.subject}" moved to ${this.hourLabel(h)}.`);
  }

  private moveToDay(id: string, d: Date): void {
    const e = this.store.events().find((x) => x.id === id);
    if (e && this.store.moveToDay(id, d)) this.notify(`"${e.subject}" moved to ${this.longDate(d)}.`);
  }

  /* ---------- Event details (EventDetailsModal) ---------- */
  protected readonly detailsId = signal<string | null>(null);
  protected readonly details = computed(() => this.store.events().find((e) => e.id === this.detailsId()) ?? null);
  protected readonly confirming = signal(false);
  protected readonly moveDate = signal('');

  protected openDetails(event: Event, e: DemoEvent): void {
    event.stopPropagation();
    this.confirming.set(false);
    this.moveDate.set(toDateInput(new Date(e.start)));
    this.detailsId.set(e.id);
  }

  protected closeDetails(): void {
    this.detailsId.set(null);
    this.confirming.set(false);
  }

  /** "Move to date": the keyboard way to do what dragging a pill does. */
  protected moveFromDetails(e: DemoEvent): void {
    const [y, m, d] = this.moveDate().split('-').map(Number);
    if (!y || !m || !d) return;
    const target = new Date(y, m - 1, d);
    if (sameDay(target, new Date(e.start))) {
      this.notify(`"${e.subject}" is already on ${this.longDate(target)}.`);
      return;
    }
    this.moveToDay(e.id, target);
  }

  protected deleteEvent(e: DemoEvent): void {
    this.store.remove(e.id);
    this.closeDetails();
    this.notify(`"${e.subject}" deleted.`);
  }

  /* ---------- New / Edit event (EventCreateModal) ---------- */
  protected readonly form = signal<EventForm | null>(null);
  protected readonly submitted = signal(false);

  protected readonly errors = computed(() => {
    const f = this.form();
    const e: Partial<Record<'subject' | 'calendarId' | 'end', string>> = {};
    if (!f) return e;
    if (!f.subject.trim()) e.subject = 'Subject required';
    if (!f.calendarId) e.calendarId = 'Pick a calendar';
    if (!f.start || !f.end || new Date(f.end) <= new Date(f.start)) e.end = 'End must be after start';
    return e;
  });

  protected err(key: 'subject' | 'calendarId' | 'end'): string | null {
    return this.submitted() ? (this.errors()[key] ?? null) : null;
  }

  protected setField<K extends keyof EventForm>(key: K, value: EventForm[K]): void {
    this.form.update((f) => (f ? { ...f, [key]: value } : f));
  }

  /** New event: on a clicked day it starts at 9:00, otherwise at the next half hour, and runs 30 minutes. */
  protected openCreate(day?: Date): void {
    const now = new Date();
    const base = day && !sameDay(day, now) ? new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9, 0) : new Date(Math.ceil(+now / 1_800_000) * 1_800_000);
    if (day) this.current.set(startOfDay(day));
    this.submitted.set(false);
    this.form.set({
      id: null, calendarId: DEMO_CALENDARS[0].id, subject: '', location: '',
      start: toLocalInput(base), end: toLocalInput(new Date(+base + 30 * 60_000)), attendees: '', reminder: '15',
    });
  }

  protected openEdit(e: DemoEvent): void {
    this.detailsId.set(null);
    this.submitted.set(false);
    this.form.set({
      id: e.id, calendarId: e.calendarId, subject: e.subject, location: e.location,
      start: toLocalInput(new Date(e.start)), end: toLocalInput(new Date(e.end)), attendees: e.attendees.join(', '),
      reminder: e.reminderMinutes === null ? '' : String(e.reminderMinutes),
    });
  }

  protected save(): void {
    const f = this.form();
    if (!f) return;
    this.submitted.set(true);
    const errors = this.errors();
    const first = errors.subject ? '#pc-subject' : errors.calendarId ? '#pc-calendar' : errors.end ? '#pc-end' : null;
    if (first) {
      setTimeout(() => this.host.querySelector<HTMLElement>(first)?.focus());
      return;
    }
    const data = {
      calendarId: f.calendarId,
      subject: f.subject.trim(),
      location: f.location.trim(),
      start: new Date(f.start).toISOString(),
      end: new Date(f.end).toISOString(),
      allDay: false,
      // As the source: anything with an @ counts as an attendee address.
      attendees: f.attendees.split(/[,;\s]+/).map((s) => s.trim().toLowerCase()).filter((s) => s.includes('@')),
      reminderMinutes: f.reminder.trim() ? Math.max(0, Math.min(1440, parseInt(f.reminder, 10) || 0)) : null,
    };
    if (f.id) {
      this.store.update(f.id, data);
      this.notify(`"${data.subject}" saved.`);
    } else {
      this.store.add({ ...data, organizer: 'liam.morin@alpha-inc.com', description: '' });
      this.notify(`"${data.subject}" added on ${this.longDate(new Date(data.start))}.`);
    }
    this.current.set(startOfDay(new Date(data.start)));
    this.form.set(null);
  }

  /* ---------- Sync ---------- */
  protected readonly syncing = signal(false);

  protected sync(): void {
    this.syncing.set(true);
    setTimeout(() => {
      this.syncing.set(false);
      this.notify('Calendar synced. Everything is up to date.');
    }, 900);
  }

  protected calendarName(id: string): string {
    return DEMO_CALENDARS.find((c) => c.id === id)?.name ?? '';
  }

  protected notify(text: string): void {
    this.toast.set(text);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 3200);
  }
}
