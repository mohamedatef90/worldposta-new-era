import { Component, computed, inject, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft, faCalendarDays, faCircleCheck, faCopy, faDownload, faMagnifyingGlass, faPenToSquare, faPlus, faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import { DemoDialogComponent } from '../demo-dialog.component';
import { LinkNotesDemoStore, type MeetingNote } from './link-notes-demo.store';

/**
 * Posta Link › My notes, working. There is no standalone Notes app in Posta
 * Link: notes are the meeting notes panel, one private note per meeting. This
 * demo lists the meetings' notes beside that panel: typing saves on a debounce
 * (Saving… then Saved), Copy uses the clipboard with a fallback, Download makes
 * a .txt in the browser, and notes can be added and deleted (with a confirm).
 * Ported from team-ai-2 apps/web/src/pages/meeting/useNotes.ts, the notes
 * panel in pages/Meeting.tsx and i18n/strings.ts (notes_*).
 */
@Component({
  selector: 'app-link-notes-demo',
  imports: [FaIconComponent, DemoDialogComponent],
  templateUrl: './link-notes-demo.component.html',
  styleUrls: ['../demo.css', './link-notes-demo.component.css'],
})
export class LinkNotesDemoComponent {
  protected readonly store = inject(LinkNotesDemoStore);

  protected readonly i = {
    back: faArrowLeft, cal: faCalendarDays, ok: faCircleCheck, copy: faCopy, download: faDownload,
    search: faMagnifyingGlass, pen: faPenToSquare, plus: faPlus, trash: faTrashCan,
  };

  protected readonly query = signal('');
  protected readonly list = computed(() => {
    const q = this.query().trim().toLowerCase();
    return [...this.store.notes()]
      .filter((n) => !q || n.meeting.toLowerCase().includes(q) || n.body.toLowerCase().includes(q))
      .sort((a, b) => b.edited - a.edited);
  });
  protected readonly active = computed(() => this.store.notes().find((n) => n.id === this.store.activeId()) ?? null);
  /** Narrow windows show the list or the note, with Back between them. */
  protected readonly showEditor = signal(false);

  protected readonly status = computed(() => {
    switch (this.store.saveState()) {
      case 'saving': return 'Saving…';
      case 'saved': return 'Saved. Notes are private to you and saved to your account.';
      default: return 'Notes are private to you and saved to your account.';
    }
  });

  protected preview(n: MeetingNote): string {
    return n.body.trim().split('\n').find((l) => l.trim())?.replace(/^-\s*/, '') ?? 'No notes yet';
  }

  protected open(n: MeetingNote): void {
    this.store.select(n.id);
    this.showEditor.set(true);
  }

  protected back(): void {
    this.showEditor.set(false);
    const id = this.store.activeId();
    setTimeout(() => document.querySelector<HTMLElement>(`[data-note="${id}"]`)?.focus());
  }

  protected create(): void {
    this.query.set('');
    this.store.create();
    this.showEditor.set(true);
    setTimeout(() => document.getElementById('ln-title')?.focus());
    this.notify('New note created.');
  }

  /* ---------- Copy and Download, as the panel's two buttons ---------- */
  protected copy(n: MeetingNote): void {
    if (!n.body.trim()) return;
    const done = () => this.notify('Notes copied to the clipboard.');
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(n.body).then(done, () => this.copyFallback(n.body, done));
    else this.copyFallback(n.body, done);
  }

  /** For browsers without the async clipboard: a hidden textarea and execCommand. */
  private copyFallback(text: string, done: () => void): void {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    if (ok) done();
    else this.notify('Copy is not available here. Select the text and copy it instead.');
  }

  protected download(n: MeetingNote): void {
    if (!n.body.trim()) return;
    const url = URL.createObjectURL(new Blob([n.body], { type: 'text/plain;charset=utf-8' }));
    const safe = n.meeting.replace(/[^\w\s-]/g, '').slice(0, 40).trim().replace(/\s+/g, '-') || 'meeting';
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safe}-notes.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.notify(`Downloaded ${safe}-notes.txt.`);
  }

  /* ---------- Delete, after a confirm ---------- */
  protected readonly deleting = signal<MeetingNote | null>(null);

  protected confirmDelete(): void {
    const n = this.deleting();
    if (!n) return;
    this.store.remove(n.id);
    this.deleting.set(null);
    this.showEditor.set(false);
    this.notify(`Notes for ${n.meeting} deleted.`);
    // The trigger went with the note, so focus lands on the note that is open now.
    setTimeout(() => document.querySelector<HTMLElement>(`[data-note="${this.store.activeId()}"]`)?.focus());
  }

  /* ---------- Shared ---------- */
  protected readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  protected notify(text: string): void {
    this.toast.set(text);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 3200);
  }
}
