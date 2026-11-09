import { Component, ElementRef, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faBan, faBiohazard, faChevronLeft, faChevronRight, faCircleCheck, faEnvelope, faEye, faFilter, faPaperPlane,
  faPaperclip, faShieldVirus, faUnlock, type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { DemoDialogComponent } from '../demo-dialog.component';
import {
  SMTP_ACTIONS, SMTP_DOMAINS, SMTP_STATUSES, SmtpLogsDemoStore,
  type SmtpLogAction, type SmtpLogEntry, type SmtpLogStatus,
} from './smtp-logs-demo.store';

interface Filters {
  from: string;
  to: string;
  subject: string;
  action: SmtpLogAction | 'ALL';
  dateFrom: string;
  dateTo: string;
  statuses: readonly SmtpLogStatus[];
}
const NO_FILTERS: Filters = { from: '', to: '', subject: '', action: 'ALL', dateFrom: '', dateTo: '', statuses: [] };
type Tab = 'statistics' | 'logs';
type TextFilter = 'from' | 'to' | 'subject' | 'action' | 'dateFrom' | 'dateTo';

/**
 * Email Admin Suite › SMTP Logs, working: the Statistics tab (Today's
 * Summary by domain, Email Classification by period) and the SMTP Log
 * Explorer with Filter Logs (sender, recipient, subject, action, dates,
 * statuses), paging, and a log details panel that releases a quarantined
 * message or blocks its sender, updating the row. Ported from
 * EmailAdminSmtpLogsPage.tsx in the unified sign-in app; only the page
 * content is shown.
 */
@Component({
  selector: 'app-email-smtp-logs-demo',
  imports: [FaIconComponent, DatePipe, DecimalPipe, DemoDialogComponent],
  templateUrl: './smtp-logs-demo.component.html',
  styleUrls: ['../demo.css', './smtp-logs-demo.component.css'],
})
export class SmtpLogsDemoComponent {
  private readonly store = inject(SmtpLogsDemoStore);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly i = {
    block: faBan, prev: faChevronLeft, next: faChevronRight, ok: faCircleCheck, view: faEye, filter: faFilter, release: faPaperPlane, unblock: faUnlock,
  };
  protected readonly actions = SMTP_ACTIONS;
  protected readonly statuses = SMTP_STATUSES;
  protected readonly domains = SMTP_DOMAINS;
  protected readonly blocked = this.store.blockedSenders;

  protected readonly tab = signal<Tab>('logs');
  protected readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  protected onTabKey(event: KeyboardEvent): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const next: Tab = this.tab() === 'logs' ? 'statistics' : 'logs';
    this.tab.set(next);
    setTimeout(() => this.host.querySelector<HTMLElement>(`#smtp-tab-${next}`)?.focus());
  }

  /* ---------- Statistics ---------- */
  protected readonly domain = signal('ALL');
  protected readonly period = signal('1w');
  private readonly releasedToday = computed(() => this.store.logs().filter((l) => l.released).length);

  protected readonly summary = computed((): readonly { title: string; value: number; icon: IconDefinition; tone: string }[] => {
    const m = this.domain() === 'ALL' ? 1 : 0.25;
    return [
      { title: 'Total Mails', value: Math.floor(53 * m), icon: faEnvelope, tone: 'blue' },
      { title: 'Delivered', value: Math.floor(51 * m) + this.releasedToday(), icon: faCircleCheck, tone: 'green' },
      { title: 'Released', value: Math.floor(1 * m) + this.releasedToday(), icon: faPaperPlane, tone: 'green' },
      // The three quarantined demo logs are already in the source's figure; each release takes one off.
      { title: 'Spam Quarantine', value: Math.max(0, Math.floor(1 * m) + this.store.logs().filter((l) => l.action === 'QUARANTINE').length - 3), icon: faShieldVirus, tone: 'amber' },
      { title: 'Blocked', value: this.blocked().length, icon: faBan, tone: 'red' },
      { title: 'Virus Blocked', value: 0, icon: faBiohazard, tone: 'red' },
      { title: 'Attachment Blocked', value: 0, icon: faPaperclip, tone: 'red' },
    ];
  });

  protected readonly classification = computed(() => {
    const scale = Number(this.period()[0]) * (this.domain() === 'ALL' ? 1 : 0.35);
    const rows = [
      { label: 'Delivered', value: Math.floor(2943 * scale), tone: 'green' },
      { label: 'Spam Quarantine', value: Math.floor(121 * scale), tone: 'amber' },
      { label: 'Released', value: Math.floor(1 * scale) + this.releasedToday(), tone: 'blue' },
      { label: 'Blocked', value: 0, tone: 'red' },
      { label: 'Virus Blocked', value: 0, tone: 'red' },
      { label: 'Attachment Blocked', value: 0, tone: 'red' },
    ];
    const total = Math.floor(3065 * scale) + this.releasedToday();
    return { rows: rows.map((r) => ({ ...r, percent: total ? (r.value / total) * 100 : 0 })), total };
  });

  /* ---------- Filter Logs ---------- */
  protected readonly filters = signal<Filters>({ ...NO_FILTERS });
  protected readonly draft = signal<Filters>({ ...NO_FILTERS });
  protected readonly filterOpen = signal(false);
  protected readonly activeFilterCount = computed(() => {
    const f = this.filters();
    return (Object.keys(NO_FILTERS) as (keyof Filters)[]).filter((k) => (k === 'statuses' ? f.statuses.length > 0 : f[k] !== NO_FILTERS[k])).length;
  });

  protected readonly filtered = computed(() => {
    const f = this.filters();
    const has = (value: string, q: string) => !q.trim() || value.toLowerCase().includes(q.trim().toLowerCase());
    return this.store
      .logs()
      .filter((l) => {
        const when = new Date(l.timestamp);
        return (
          has(l.from, f.from) && has(l.to, f.to) && has(l.subject, f.subject) &&
          (f.action === 'ALL' || l.action === f.action) &&
          (!f.statuses.length || f.statuses.includes(l.status)) &&
          (!f.dateFrom || when >= new Date(f.dateFrom + 'T00:00:00')) &&
          (!f.dateTo || when <= new Date(f.dateTo + 'T23:59:59.999'))
        );
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  });

  protected openFilters(): void {
    this.draft.set({ ...this.filters() });
    this.filterOpen.set(true);
  }
  protected setDraft(key: TextFilter, value: string): void {
    this.draft.update((f) => ({ ...f, [key]: value }));
  }
  protected toggleStatus(status: SmtpLogStatus, checked: boolean): void {
    this.draft.update((f) => ({ ...f, statuses: checked ? [...f.statuses, status] : f.statuses.filter((s) => s !== status) }));
  }
  protected applyFilters(): void {
    this.filters.set(this.draft());
    this.page.set(1);
    this.filterOpen.set(false);
  }
  protected clearFilters(): void {
    this.filters.set({ ...NO_FILTERS });
    this.page.set(1);
    this.filterOpen.set(false);
  }

  /* ---------- Paging ---------- */
  protected readonly page = signal(1);
  protected readonly perPage = signal(10);
  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.perPage())));
  protected readonly paged = computed(() => {
    const start = (Math.min(this.page(), this.pageCount()) - 1) * this.perPage();
    return this.filtered().slice(start, start + this.perPage());
  });
  protected readonly range = computed(() => {
    const total = this.filtered().length;
    const start = (Math.min(this.page(), this.pageCount()) - 1) * this.perPage();
    return { from: total ? start + 1 : 0, to: Math.min(total, start + this.perPage()), total };
  });
  protected setPerPage(value: string): void {
    this.perPage.set(Number(value));
    this.page.set(1);
  }

  /* ---------- Log details and its actions ---------- */
  protected readonly viewingId = signal<string | null>(null);
  protected readonly viewing = computed(() => this.store.logs().find((l) => l.id === this.viewingId()) ?? null);
  protected readonly releasing = signal<SmtpLogEntry | null>(null);

  protected confirmRelease(): void {
    const l = this.releasing();
    this.releasing.set(null);
    if (!l) return;
    const done = this.store.release(l.id);
    if (done) this.notify(`Message released and delivered to ${done.to}.`);
    // The Release button is gone now; keep focus inside the details panel.
    setTimeout(() => this.host.querySelector<HTMLElement>('.smtp-block-btn')?.focus());
  }
  protected toggleBlock(l: SmtpLogEntry): void {
    if (this.blocked().includes(l.from)) {
      this.store.unblock(l.from);
      this.notify(`${l.from} unblocked.`);
    } else {
      this.store.block(l.from);
      this.notify(`${l.from} blocked. Future mail from this sender is rejected.`);
    }
  }

  protected tone(status: SmtpLogStatus): 'good' | 'info' | 'bad' | 'warn' | 'neutral' {
    if (status === 'Passed') return 'good';
    if (status === 'Archived') return 'info';
    if (status === 'Rejected (Suspect)') return 'warn';
    if (status === 'User Invalid') return 'neutral';
    return 'bad';
  }

  protected notify(text: string): void {
    this.toast.set(text);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 3200);
  }
}
