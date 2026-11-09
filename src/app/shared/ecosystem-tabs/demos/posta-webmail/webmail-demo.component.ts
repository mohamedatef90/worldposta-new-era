import { Component, ElementRef, computed, inject, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft, faBoxArchive, faChevronDown, faChevronUp, faCircleCheck, faCircleInfo, faEllipsis, faEnvelope, faEnvelopeOpen,
  faFilter, faInbox, faMagnifyingGlass, faPaperclip, faPaperPlane, faPenToSquare, faReply, faReplyAll, faRotateLeft, faShare,
  faStar, faTrashCan, faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { DemoDialogComponent } from '../demo-dialog.component';
import { FOLDER_LABELS, MAIL_FOLDERS, ME, WebmailDemoStore, type MailAddress, type MailFolder, type MailMessage } from './webmail-demo.store';

type FocusTab = 'focused' | 'other' | 'all';
type ComposeKind = 'new' | 'reply' | 'reply-all' | 'forward';
interface ComposeDraft { kind: ComposeKind; to: string; cc: string; showCc: boolean; subject: string; body: string }
interface ListFilters { unread: boolean; flagged: boolean; attachment: boolean }

const EMAIL = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/;
const RE_PREFIX = /^\s*(re|fwd?|fw)\s*:\s*/i;

/** "Re: Subject" without stacking prefixes, as quoteRender.normalizeSubject does. */
function normalizeSubject(subject: string, prefix: 'Re' | 'Fwd'): string {
  let s = subject.trim();
  while (RE_PREFIX.test(s)) s = s.replace(RE_PREFIX, '');
  return `${prefix}: ${s}`;
}

const formatAddress = (a: MailAddress) => `${a.name} <${a.email}>`;

/**
 * Posta web mail inbox, working: the message list with the Focused / Other /
 * All tabs, filter chips and search, the reading pane (opening marks read),
 * row and reader actions (Archive, Star/Flag, Delete, Restore, Mark as
 * read/unread, Move to folder, Move to Other/Focused), and the compose pane
 * for New message, Reply, Reply all and Forward with To validation; Send
 * files it in Sent. Ported from posta/frontend/apps/web/src: MessageListPane,
 * FocusTabs, FilterChipBar, MessageRowActions, ReaderPane,
 * message-viewer/MessageActions and MessageHeader, ComposePane with
 * compose/RecipientField, lib/quoteRender. The folder pane is app navigation,
 * so a compact folder switcher in the list header replaces it.
 */
@Component({
  selector: 'app-posta-webmail-demo',
  imports: [FaIconComponent, DemoDialogComponent],
  templateUrl: './webmail-demo.component.html',
  styleUrls: ['../demo.css', './webmail-demo.component.css'],
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class WebmailDemoComponent {
  private readonly store = inject(WebmailDemoStore);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly i = {
    back: faArrowLeft, archive: faBoxArchive, down: faChevronDown, up: faChevronUp, ok: faCircleCheck, info: faCircleInfo,
    more: faEllipsis, unread: faEnvelope, read: faEnvelopeOpen, filter: faFilter, inbox: faInbox, search: faMagnifyingGlass,
    attach: faPaperclip, send: faPaperPlane, compose: faPenToSquare, reply: faReply, replyAll: faReplyAll, restore: faRotateLeft,
    forward: faShare, star: faStar, trash: faTrashCan, close: faXmark,
  };
  protected readonly folders = MAIL_FOLDERS;
  protected readonly folderLabels = FOLDER_LABELS;
  protected readonly focusTabs: readonly { key: FocusTab; label: string }[] = [
    { key: 'focused', label: 'Focused' },
    { key: 'other', label: 'Other' },
    { key: 'all', label: 'All' },
  ];

  protected readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  /* ---------- List: folder, Focused Inbox tabs, filter chips, search ---------- */
  protected readonly folder = signal<MailFolder>('inbox');
  protected readonly focusTab = signal<FocusTab>('focused');
  protected readonly filters = signal<ListFilters>({ unread: false, flagged: false, attachment: false });
  protected readonly search = signal('');
  protected readonly focusInfoOpen = signal(false);

  protected readonly isFiltered = computed(() => {
    const f = this.filters();
    return f.unread || f.flagged || f.attachment || this.search().trim() !== '';
  });

  protected readonly unreadCounts = computed(() => {
    const counts = {} as Record<MailFolder, number>;
    for (const f of MAIL_FOLDERS) counts[f] = 0;
    for (const m of this.store.messages()) if (!m.isRead) counts[m.folder]++;
    return counts;
  });

  protected readonly items = computed(() => {
    const folder = this.folder();
    const tab = this.focusTab();
    const f = this.filters();
    const q = this.search().trim().toLowerCase();
    return this.store
      .messages()
      .filter(
        (m) =>
          m.folder === folder &&
          (folder !== 'inbox' || tab === 'all' || m.focus === tab) &&
          (!f.unread || !m.isRead) &&
          (!f.flagged || m.isFlagged) &&
          (!f.attachment || m.attachments.length > 0) &&
          (!q || `${m.from.name} ${m.from.email} ${m.subject} ${m.body.join(' ')}`.toLowerCase().includes(q)),
      )
      .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  });

  protected setFolder(value: string): void {
    this.folder.set(value as MailFolder);
    this.closeReader();
  }

  protected toggleFilter(key: keyof ListFilters): void {
    this.filters.update((f) => ({ ...f, [key]: !f[key] }));
  }

  protected clearFilters(): void {
    this.filters.set({ unread: false, flagged: false, attachment: false });
    this.search.set('');
  }

  /** Arrow keys move between the Focused / Other / All tabs, as a tablist should. */
  protected onTabKey(event: KeyboardEvent): void {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const idx = this.focusTabs.findIndex((t) => t.key === this.focusTab());
    const last = this.focusTabs.length - 1;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? last : event.key === 'ArrowLeft' ? (idx === 0 ? last : idx - 1) : idx === last ? 0 : idx + 1;
    this.focusTab.set(this.focusTabs[next].key);
    this.host.querySelector<HTMLElement>(`#wm-tab-${this.focusTabs[next].key}`)?.focus();
  }

  /* ---------- Reading pane ---------- */
  protected readonly openId = signal<string | null>(null);
  protected readonly open = computed(() => this.store.messages().find((m) => m.id === this.openId()) ?? null);

  protected openMessage(m: MailMessage): void {
    this.compose.set(null);
    this.openId.set(m.id);
    if (!m.isRead) this.store.setRead(m.id, true);
  }

  /** Closes the reader; on a phone-width window this is "Back to list". */
  protected closeReader(): void {
    const id = this.openId();
    this.openId.set(null);
    this.moreOpen.set(false);
    if (id) setTimeout(() => this.host.querySelector<HTMLElement>(`[data-msg-id="${id}"]`)?.focus());
  }

  /* ---------- Actions (row hover buttons, reader toolbar, More menu) ---------- */
  protected archive(m: MailMessage): void {
    this.store.move(m.id, 'archive');
    this.leave(m, 'Archived');
  }

  protected remove(m: MailMessage): void {
    this.store.move(m.id, 'deleted');
    this.leave(m, 'Deleted');
  }

  protected restore(m: MailMessage): void {
    this.store.move(m.id, 'inbox');
    this.leave(m, 'Restored to Inbox');
  }

  protected toggleFlag(m: MailMessage): void {
    this.store.setFlag(m.id, !m.isFlagged);
    this.notify(m.isFlagged ? 'Flag removed.' : 'Flagged.');
  }

  protected toggleRead(m: MailMessage): void {
    this.store.setRead(m.id, !m.isRead);
    this.moreOpen.set(false);
    this.notify(m.isRead ? 'Marked as unread.' : 'Marked as read.');
  }

  /** Focused Inbox: move to the tab you are not viewing; the source trains a per-sender rule. */
  protected moveFocus(m: MailMessage): void {
    const target = m.focus === 'focused' ? 'other' : 'focused';
    this.store.setFocus(m.id, target);
    this.moreOpen.set(false);
    if (this.openId() === m.id && this.focusTab() !== 'all') this.openId.set(null);
    this.notify(`${target === 'other' ? 'Moved to Other' : 'Moved to Focused'}. Future mail from ${m.from.email} will land here too.`);
  }

  /** After a move out of the folder, the reader closes as the source navigates back to the folder. */
  private leave(m: MailMessage, done: string): void {
    this.moreOpen.set(false);
    if (this.openId() === m.id) this.closeReader();
    this.notify(`${done}: "${m.subject}".`);
  }

  /* ---------- More menu and Move to folder ---------- */
  protected readonly moreOpen = signal(false);

  protected toggleMore(): void {
    this.moreOpen.update((v) => !v);
  }

  protected closeMore(): void {
    this.moreOpen.set(false);
    this.host.querySelector<HTMLElement>('#wm-more-trigger')?.focus();
  }

  protected readonly moving = signal<MailMessage | null>(null);
  protected readonly moveTarget = signal<MailFolder>('archive');

  protected openMove(m: MailMessage): void {
    this.closeMore();
    this.moveTarget.set(MAIL_FOLDERS.find((f) => f !== m.folder) ?? 'archive');
    this.moving.set(m);
  }

  protected confirmMove(): void {
    const m = this.moving();
    if (!m) return;
    const target = this.moveTarget();
    this.moving.set(null);
    this.store.move(m.id, target);
    this.leave(m, `Moved to ${FOLDER_LABELS[target]}`);
  }

  protected moveToJunk(m: MailMessage): void {
    this.store.move(m.id, 'junk');
    this.leave(m, 'Moved to Junk');
  }

  /* ---------- Compose ---------- */
  protected readonly compose = signal<ComposeDraft | null>(null);
  protected readonly submitted = signal(false);
  protected readonly discardOpen = signal(false);

  private parse(raw: string): string[] {
    return raw.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  }

  protected readonly errors = computed(() => {
    const d = this.compose();
    const e: { to?: string; cc?: string } = {};
    if (!d) return e;
    const to = this.parse(d.to);
    const badTo = to.find((a) => !EMAIL.test(a));
    if (!to.length) e.to = 'Add at least one recipient.';
    else if (badTo) e.to = `"${badTo}" isn't a valid email address.`;
    const badCc = this.parse(d.cc).find((a) => !EMAIL.test(a));
    if (badCc) e.cc = `"${badCc}" isn't a valid email address.`;
    return e;
  });

  protected err(key: 'to' | 'cc'): string | null {
    return this.submitted() ? (this.errors()[key] ?? null) : null;
  }

  protected setDraft<K extends keyof ComposeDraft>(key: K, value: ComposeDraft[K]): void {
    this.compose.update((d) => (d ? { ...d, [key]: value } : d));
  }

  protected newMessage(): void {
    this.startCompose({ kind: 'new', to: '', cc: '', showCc: false, subject: '', body: '' });
  }

  protected replyTo(m: MailMessage, kind: Exclude<ComposeKind, 'new'>): void {
    const when = this.fullDate(m.receivedAt);
    const notMe = (a: MailAddress) => a.email !== ME.email;
    if (kind === 'forward') {
      const header = [
        '---------- Forwarded message ---------',
        `From: ${formatAddress(m.from)}`,
        `Date: ${when}`,
        `Subject: ${m.subject}`,
        `To: ${m.to.map(formatAddress).join(', ')}`,
      ].join('\n');
      this.startCompose({ kind, to: '', cc: '', showCc: false, subject: normalizeSubject(m.subject, 'Fwd'), body: `\n\n${header}\n\n${m.body.join('\n\n')}` });
      return;
    }
    // Reply goes to the sender (or, on your own sent mail, back to its recipients); Reply all adds the other peers.
    const sender = m.from.email === ME.email ? m.to : [m.from];
    const to = kind === 'reply-all' ? [...sender, ...m.to.filter(notMe)] : sender;
    const cc = kind === 'reply-all' ? m.cc.filter(notMe) : [];
    const unique = (list: readonly MailAddress[]) => [...new Set(list.map((a) => a.email))];
    const quote = m.body.join('\n\n').split('\n').map((l) => `> ${l}`).join('\n');
    this.startCompose({
      kind,
      to: unique(to).join(', '),
      cc: unique(cc).join(', '),
      showCc: cc.length > 0,
      subject: normalizeSubject(m.subject, 'Re'),
      body: `\n\nOn ${when}, ${formatAddress(m.from)} wrote:\n${quote}`,
    });
  }

  private startCompose(draft: ComposeDraft): void {
    this.moreOpen.set(false);
    this.submitted.set(false);
    this.compose.set(draft);
    // A new message starts in To; a reply already has recipients, so it starts in the body.
    const field = draft.kind === 'new' || draft.kind === 'forward' ? '#wm-compose-to' : '#wm-compose-body';
    setTimeout(() => {
      const el = this.host.querySelector<HTMLInputElement | HTMLTextAreaElement>(field);
      el?.focus();
      if (el instanceof HTMLTextAreaElement) el.setSelectionRange(0, 0);
    });
  }

  private isDirty(d: ComposeDraft): boolean {
    return d.kind !== 'new' || !!(d.to.trim() || d.cc.trim() || d.subject.trim() || d.body.trim());
  }

  protected cancelCompose(): void {
    const d = this.compose();
    if (d && this.isDirty(d)) this.discardOpen.set(true);
    else this.endCompose();
  }

  protected endCompose(): void {
    this.discardOpen.set(false);
    this.compose.set(null);
    setTimeout(() => (this.host.querySelector<HTMLElement>('.wm-reader-toolbar button') ?? this.host.querySelector<HTMLElement>('#wm-new'))?.focus());
  }

  protected send(): void {
    const d = this.compose();
    if (!d) return;
    this.submitted.set(true);
    const e = this.errors();
    if (e.to || e.cc) {
      setTimeout(() => this.host.querySelector<HTMLElement>(e.to ? '#wm-compose-to' : '#wm-compose-cc')?.focus());
      return;
    }
    const toAddress = (email: string): MailAddress => ({ name: email.split('@')[0], email });
    this.store.send({
      to: this.parse(d.to).map(toAddress),
      cc: this.parse(d.cc).map(toAddress),
      subject: d.subject.trim() || '(no subject)',
      body: d.body.split(/\n{2,}/).map((p) => p.trimEnd()).filter((p) => p.trim()),
    });
    this.compose.set(null);
    this.notify('Sent. Landing in your Sent folder.');
    setTimeout(() => this.host.querySelector<HTMLElement>('#wm-new')?.focus());
  }

  /* ---------- Formatting ---------- */
  /** List dates as lib/messageFormat.fmtDate: time today, "Nov 3" this year, else with the year. */
  protected listDate(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return d.getFullYear() === now.getFullYear()
      ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  protected fullDate(iso: string): string {
    return new Date(iso).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  protected initials(a: MailAddress): string {
    return a.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  }

  /** A stable avatar tone per sender, from a small AA-safe set. */
  protected tone(a: MailAddress): number {
    let h = 0;
    for (const c of a.email) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h % 5;
  }

  protected names(list: readonly MailAddress[]): string {
    return list.map((a) => (a.email === ME.email ? 'me' : a.name)).join(', ');
  }

  protected rowLabel(m: MailMessage): string {
    const who = this.folder() === 'sent' || this.folder() === 'drafts' ? `To ${this.names(m.to)}` : m.from.name;
    return `${m.isRead ? '' : 'Unread. '}${m.isFlagged ? 'Flagged. ' : ''}${who}, ${m.subject || 'no subject'}, ${this.listDate(m.receivedAt)}${m.attachments.length ? ', has attachment' : ''}`;
  }

  protected snippet(m: MailMessage): string {
    return m.body.join(' ').replace(/\s+/g, ' ').slice(0, 120);
  }

  /* ---------- Shared ---------- */
  protected notify(text: string): void {
    this.toast.set(text);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 3200);
  }

  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('.d-menu-wrap')) this.moreOpen.set(false);
    if (!target?.closest('.wm-focus-info')) this.focusInfoOpen.set(false);
  }
}
