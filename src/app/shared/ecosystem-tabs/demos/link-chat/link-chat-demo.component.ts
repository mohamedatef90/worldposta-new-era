import { Component, ElementRef, afterNextRender, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft, faCircleCheck, faComment, faFaceSmile, faGlobe, faHashtag, faLink, faMagnifyingGlass,
  faPaperPlane, faPaperclip, faPlus, faUsers, faVideo,
} from '@fortawesome/free-solid-svg-icons';
import {
  COMPOSER_EMOJI, LinkChatDemoStore, QUICK_REACTIONS, linksIn,
  type ChatMessage, type Conversation, type ConversationKind,
} from './link-chat-demo.store';

type StageTab = 'chat' | 'files' | 'links';
type FileType = 'all' | 'doc' | 'sheet' | 'pdf' | 'other';

const SECTIONS: readonly { kind: ConversationKind; label: string }[] = [
  { kind: 'dm', label: 'Direct messages' },
  { kind: 'group', label: 'Groups' },
  { kind: 'channel', label: 'Channels' },
];

const EXT_TYPE: Record<string, FileType> = { docx: 'doc', doc: 'doc', txt: 'doc', xlsx: 'sheet', xls: 'sheet', csv: 'sheet', pdf: 'pdf' };

/** Six AA-safe avatar tints, picked from the name so a person keeps one colour (ChatAll tintOf). */
const TINTS = 6;

/**
 * Posta Link › Chat, working: the conversation list (Direct messages, Groups,
 * Channels) beside the open conversation with its Chat / Files / Links tabs,
 * the composer (Enter sends, Shift+Enter is a new line), emoji, attachments,
 * reactions, a teammate who types and answers, unread badges and Start meeting.
 * Ported from team-ai-2 apps/web/src/pages/ChatAll.tsx and the ConversationStage
 * in WorkspaceDetail.tsx (with workspace/views.tsx Files and Links tabs and
 * workspace/MessageAttachment.tsx); content area only, no app rail or top bar.
 */
@Component({
  selector: 'app-link-chat-demo',
  imports: [FaIconComponent],
  templateUrl: './link-chat-demo.component.html',
  styleUrls: ['../demo.css', './link-chat-demo.component.css'],
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class LinkChatDemoComponent {
  protected readonly store = inject(LinkChatDemoStore);
  private readonly composer = viewChild<ElementRef<HTMLTextAreaElement>>('composer');
  private readonly thread = viewChild<ElementRef<HTMLElement>>('thread');

  protected readonly i = {
    back: faArrowLeft, ok: faCircleCheck, chat: faComment, smile: faFaceSmile, globe: faGlobe, hash: faHashtag, link: faLink,
    search: faMagnifyingGlass, send: faPaperPlane, clip: faPaperclip, plus: faPlus, group: faUsers, video: faVideo,
  };
  protected readonly reactions = QUICK_REACTIONS;
  protected readonly emoji = COMPOSER_EMOJI;
  protected readonly reducedMotion = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Conversation list ---------- */
  protected readonly query = signal('');
  protected readonly sections = computed(() => {
    const q = this.query().trim().toLowerCase();
    const shown = [...this.store.conversations()]
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .sort((a, b) => b.rank - a.rank);
    return SECTIONS.map((s) => ({ ...s, rows: shown.filter((c) => c.kind === s.kind) })).filter((s) => s.rows.length);
  });

  protected readonly active = computed(() => this.store.conversations().find((c) => c.id === this.store.activeId()) ?? null);
  /** On a narrow window the list and the thread take turns; this says which is showing. */
  protected readonly showThread = signal(false);

  protected open(c: Conversation): void {
    this.store.open(c.id);
    this.tab.set('chat');
    this.searching.set(false);
    this.search.set('');
    this.draft.set('');
    this.showThread.set(true);
    this.scrollToEnd();
  }

  protected back(): void {
    this.showThread.set(false);
    const id = this.store.activeId();
    setTimeout(() => document.querySelector<HTMLElement>(`[data-conv="${id}"]`)?.focus());
  }

  protected preview(c: Conversation): string {
    const last = c.messages[c.messages.length - 1];
    if (!last) return '';
    const body = last.body || last.file?.name || '';
    if (last.system) return body;
    return last.sender ? `${c.kind === 'dm' ? '' : last.sender.split(' ')[0] + ': '}${body}` : `You: ${body}`;
  }
  protected lastWhen(c: Conversation): string {
    return c.messages[c.messages.length - 1]?.time ?? c.when;
  }

  protected title(c: Conversation): string {
    return c.kind === 'channel' ? `# ${c.name}` : c.name;
  }
  protected status(c: Conversation): string {
    if (c.kind === 'dm') return c.guest ? 'Direct message · guest' : 'Direct message';
    if (c.kind === 'channel') return `Public channel · ${c.members.length + 1} members`;
    return [...c.members.map((m) => m.split(' ')[0] + (m === c.guest ? ' (guest)' : '')), 'You'].join(', ');
  }

  protected initials(name: string): string {
    const parts = name.replace('#', '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    return (parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  protected tint(id: string): string {
    let h = 0;
    for (let n = 0; n < id.length; n++) h = (h * 31 + id.charCodeAt(n)) >>> 0;
    return `lc-av--t${h % TINTS}`;
  }

  /* ---------- Thread ---------- */
  protected readonly tab = signal<StageTab>('chat');
  protected readonly searching = signal(false);
  protected readonly search = signal('');

  protected readonly messages = computed(() => {
    const c = this.active();
    const q = this.search().trim().toLowerCase();
    if (!c) return [];
    return q ? c.messages.filter((m) => m.body.toLowerCase().includes(q) || m.file?.name.toLowerCase().includes(q)) : c.messages;
  });

  protected readonly typingHere = computed(() => {
    const t = this.store.typing();
    return t && t.conversationId === this.store.activeId() ? `${t.name} is typing…` : '';
  });

  protected reactionList(m: ChatMessage): { emoji: string; count: number; mine: boolean }[] {
    return Object.entries(m.reactions).map(([emoji, who]) => ({ emoji, count: who.length, mine: who.includes('') }));
  }

  /** Each message's react menu; one open at a time. */
  protected readonly reactMenu = signal<string | null>(null);
  private menuTrigger: HTMLElement | null = null;

  protected toggleReactMenu(event: Event, id: string): void {
    event.stopPropagation();
    this.emojiOpen.set(false);
    this.menuTrigger = event.currentTarget as HTMLElement;
    this.reactMenu.update((open) => (open === id ? null : id));
    if (this.reactMenu()) setTimeout(() => document.querySelector<HTMLElement>('.lc-react-menu button')?.focus());
  }
  protected closeReactMenu(): void {
    this.reactMenu.set(null);
    this.menuTrigger?.focus();
  }
  protected react(m: ChatMessage, emoji: string): void {
    const c = this.active();
    if (!c) return;
    const had = m.reactions[emoji]?.includes('');
    this.store.toggleReaction(c.id, m.id, emoji);
    if (this.reactMenu()) this.closeReactMenu();
    this.notify(had ? `Removed your ${emoji} reaction.` : `Reacted ${emoji}.`);
  }

  /* ---------- Composer ---------- */
  protected readonly draft = signal('');
  protected readonly emojiOpen = signal(false);

  protected onComposerKey(event: KeyboardEvent): void {
    if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;
    event.preventDefault();
    this.send();
  }

  protected send(): void {
    const c = this.active();
    const body = this.draft().trim();
    if (!c || !body) return;
    this.store.send(c.id, body);
    this.draft.set('');
    this.search.set('');
    this.scrollToEnd();
  }

  protected toggleEmoji(event: Event): void {
    event.stopPropagation();
    this.reactMenu.set(null);
    this.menuTrigger = event.currentTarget as HTMLElement;
    this.emojiOpen.update((v) => !v);
  }
  protected closeEmoji(): void {
    this.emojiOpen.set(false);
    this.menuTrigger?.focus();
  }

  /** At the caret, not at the end: people reach for emoji mid-sentence. */
  protected insertEmoji(emoji: string): void {
    const el = this.composer()?.nativeElement;
    const text = this.draft();
    const at = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? at;
    this.draft.set(text.slice(0, at) + emoji + text.slice(end));
    this.emojiOpen.set(false);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      el.setSelectionRange(at + emoji.length, at + emoji.length);
    });
  }

  /** The file never leaves the browser: only its name and size join the thread. */
  protected attach(input: HTMLInputElement): void {
    const c = this.active();
    const file = input.files?.[0];
    input.value = '';
    if (!c || !file) return;
    this.store.send(c.id, this.draft().trim(), { name: file.name, meta: `v1 · ${this.size(file.size)}` });
    this.draft.set('');
    this.notify(`${file.name} shared in ${c.kind === 'channel' ? '#' : ''}${c.name}.`);
    this.scrollToEnd();
  }

  protected startMeeting(): void {
    const c = this.active();
    if (!c) return;
    this.store.system(c.id, 'You started a meeting');
    this.scrollToEnd();
    this.notify(`Meeting started in ${c.kind === 'channel' ? '#' : ''}${c.name}. Open the Conferencing tab to see it live.`);
  }

  /* ---------- Files and Links tabs ---------- */
  protected readonly fileType = signal<FileType>('all');

  protected readonly files = computed(() => {
    const c = this.active();
    if (!c) return [];
    return c.messages
      .filter((m) => m.file)
      .map((m) => ({ id: m.id, name: m.file!.name, meta: m.file!.meta, ext: this.ext(m.file!.name), when: m.time, sender: m.sender || 'You' }))
      .filter((f) => this.fileType() === 'all' || (EXT_TYPE[f.ext] ?? 'other') === this.fileType());
  });
  protected readonly fileCount = computed(() => this.active()?.messages.filter((m) => m.file).length ?? 0);

  protected readonly links = computed(() => {
    const c = this.active();
    if (!c) return [];
    return c.messages
      .flatMap((m) => linksIn(m).map((url, n) => ({ id: `${m.id}-${n}`, url, sender: m.sender || 'You', when: m.time })))
      .reverse();
  });

  protected ext(name: string): string {
    return name.split('.').pop()?.toLowerCase() ?? '';
  }
  protected sharedOn(when: string): string {
    return when.includes(':') ? `Today ${when}` : when;
  }

  protected copyLink(url: string): void {
    const done = () => this.notify('Link copied.');
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(done, () => this.notify('Copy is not available in this browser.'));
    else this.notify('Copy is not available in this browser.');
  }

  protected setTab(tab: StageTab): void {
    this.tab.set(tab);
    if (tab === 'chat') this.scrollToEnd();
  }
  /** Arrow keys move between the three tabs, as a tablist does. */
  protected onTabKey(event: KeyboardEvent): void {
    const order: StageTab[] = ['chat', 'files', 'links'];
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = order[(order.indexOf(this.tab()) + step + order.length) % order.length];
    this.setTab(next);
    setTimeout(() => document.getElementById(`lc-tab-${next}`)?.focus());
  }

  /* ---------- Shared ---------- */
  protected readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    afterNextRender(() => {
      this.store.open(this.store.activeId());
      this.scrollToEnd();
    });
    // A reply in the open conversation keeps the thread pinned to the newest message.
    effect(() => {
      this.active()?.messages.length;
      this.typingHere();
      this.scrollToEnd();
    });
  }

  protected notify(text: string): void {
    this.toast.set(text);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 3200);
  }

  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('.d-menu-wrap')) {
      this.reactMenu.set(null);
      this.emojiOpen.set(false);
    }
  }

  private scrollToEnd(): void {
    setTimeout(() => {
      const el = this.thread()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  private size(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
}
