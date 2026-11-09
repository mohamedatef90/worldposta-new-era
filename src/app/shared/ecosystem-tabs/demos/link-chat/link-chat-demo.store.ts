import { Service, signal } from '@angular/core';

/**
 * Posta Link chat, ported from team-ai-2's ChatAll page and the workspace
 * ConversationStage (WorkspaceDetail.tsx, workspace/views.tsx). The people,
 * conversations, messages and files come from the product's own design frames
 * ("07b Group Chat", "07d Group conversation files"); all of them are fictional.
 * Sending, replies, reactions and uploads happen here, in the browser only.
 */
export type ConversationKind = 'dm' | 'group' | 'channel';

export interface ChatFile {
  readonly name: string;
  /** "v4 · 310 KB", as the Files tab prints it under the name. */
  readonly meta: string;
}

export interface ChatMessage {
  readonly id: string;
  /** Empty for me; a system line has `system: true` instead. */
  readonly sender: string;
  readonly body: string;
  /** "08:12" — the thread only spans today. */
  readonly time: string;
  readonly file?: ChatFile;
  readonly system?: boolean;
  /** emoji → who reacted ('' is me). */
  readonly reactions: Readonly<Record<string, readonly string[]>>;
}

export interface Conversation {
  readonly id: string;
  readonly kind: ConversationKind;
  readonly name: string;
  /** Members other than me, in the order the header lists them. */
  readonly members: readonly string[];
  readonly guest?: string;
  readonly unread: number;
  /** For the list when the thread has nothing newer today. */
  readonly when: string;
  readonly messages: readonly ChatMessage[];
  /** Most recent activity first, as the list orders by last_message_at. */
  readonly rank: number;
}

/** The six quick reactions of the message menu (WorkspaceDetail QUICK_REACTIONS). */
export const QUICK_REACTIONS = ['👍', '🎉', '❤️', '😄', '👀', '🙏'] as const;
/** A short slice of the composer emoji picker. */
export const COMPOSER_EMOJI = ['😀', '😂', '😊', '😍', '🤔', '👍', '👏', '🙌', '🎉', '🔥', '✅', '🚀'] as const;

const URL_RE = /https?:\/\/[^\s]+/g;

let seq = 0;
const msg = (sender: string, body: string, time: string, extra: Partial<ChatMessage> = {}): ChatMessage => ({
  id: `m${++seq}`, sender, body, time, reactions: {}, ...extra,
});

const SEED: readonly Omit<Conversation, 'rank'>[] = [
  {
    id: 'c-brand', kind: 'group', name: 'Brand Launch team', members: ['Mona Adel', 'Omar Ali', 'Salma Hassan', 'Lina Kareem', 'Sara Khalil', 'Mohamed Hassan'], guest: 'Lina Kareem', unread: 3, when: '10:24',
    messages: [
      msg('Sara Khalil', 'Morning team — the final campaign checklist is ready.', '08:12', { file: { name: 'Campaign-checklist.xlsx', meta: 'v4 · 310 KB' }, reactions: { '👍': ['Omar Ali', 'Mona Adel'] } }),
      msg('Mohamed Hassan', 'Confirmed. I added owners and dates to the launch plan.', '08:26', { file: { name: 'Launch-plan.docx', meta: 'v6 · 1.1 MB' } }),
      msg('', 'Great — client approved the visual direction yesterday.', '08:40', { reactions: { '🎉': ['Sara Khalil', 'Salma Hassan', 'Omar Ali'] } }),
      msg('Omar Ali', 'Sharing the latest brand guidelines on Drive — v3, workspace members only. Moodboard is here too: https://drive.worldposta.com/s/brand-launch-moodboard', '08:56', { file: { name: 'Brand-guidelines-v3.pdf', meta: 'v3 · 12.1 MB' } }),
      msg('Lina Kareem', 'Reviewed the tone examples — clear and ready for client handoff.', '10:04', { file: { name: 'Tone-examples.pdf', meta: 'guest link · 2.4 MB' } }),
      msg('', 'Thanks all. Salma, can you drop the pricing table before the sync?', '10:12'),
      msg('Salma Hassan', 'On it — ready in an hour. Draft is up already.', '10:24', { file: { name: 'Pricing-table.xlsx', meta: 'v1 · 420 KB' } }),
    ],
  },
  {
    id: 'c-omar', kind: 'dm', name: 'Omar Nabil', members: ['Omar Nabil'], unread: 0, when: '10:42',
    messages: [
      msg('Omar Nabil', 'Can we move the vendor review to the weekly launch sync?', '10:31'),
      msg('Omar Nabil', 'Agenda so far: https://link.worldposta.com/m/weekly-launch-sync', '10:33'),
      msg('', "Perfect, I'll add it to the agenda", '10:42'),
    ],
  },
  {
    id: 'c-salma', kind: 'dm', name: 'Salma Hassan', members: ['Salma Hassan'], unread: 0, when: '09:51',
    messages: [
      msg('', 'Do you have the last quarter numbers for the pricing table?', '09:40'),
      msg('Salma Hassan', 'Yes — pulling them from the finance sheet now.', '09:51'),
    ],
  },
  {
    id: 'c-ops', kind: 'group', name: 'Ops group (5)', members: ['Nour Rashid', 'Omar Ali', 'Mona Adel', 'Sara Khalil'], unread: 1, when: '09:26',
    messages: [
      msg('Mona Adel', 'Shift handover notes are in the ops folder.', '09:02', { file: { name: 'Handover-notes.docx', meta: 'v2 · 86 KB' } }),
      msg('Omar Ali', 'The incident timeline should go in the monthly review.', '09:18'),
      msg('Nour Rashid', 'Agreed — folding it into the deck.', '09:26'),
    ],
  },
  {
    id: 'c-contoso', kind: 'dm', name: 'Contoso Supplier', members: ['Contoso Supplier'], guest: 'Contoso Supplier', unread: 0, when: 'Yesterday',
    messages: [
      msg('Contoso Supplier', 'Here is the revised quote with the volume discount.', 'Yesterday', { file: { name: 'Quote-rev4.pdf', meta: 'v4 · 640 KB' } }),
    ],
  },
  {
    id: 'c-lina', kind: 'dm', name: 'Lina Kareem', members: ['Lina Kareem'], guest: 'Lina Kareem', unread: 0, when: 'Yesterday',
    messages: [msg('Lina Kareem', 'Reviewed — ready for handoff', 'Yesterday')],
  },
  {
    id: 'c-general', kind: 'channel', name: 'general', members: ['Mona Adel', 'Omar Ali', 'Salma Hassan', 'Sara Khalil', 'Nour Rashid', 'Mohamed Hassan'], unread: 2, when: 'Tuesday',
    messages: [
      msg('Sara Khalil', 'Welcome to the new workspace, everyone 👋', 'Tuesday'),
      msg('Mona Adel', 'Heads up: kickoff moved to Thursday. Updated invite: https://link.worldposta.com/m/kickoff-thursday', 'Tuesday', { reactions: { '👀': ['Omar Ali'] } }),
    ],
  },
];

/** What a teammate says back, per conversation, in turn. */
const REPLIES: Readonly<Record<string, readonly string[]>> = {
  'c-brand': ['Looks good to me 👍', 'Noted — I will update the checklist.', 'Can we go over this in the 2:00 PM sync?'],
  'c-omar': ['Great, thanks!', 'See you at the sync.'],
  'c-salma': ['Sending them over in a few minutes.', 'Done — check the Files tab.'],
  'c-ops': ['On it.', 'I will add it to the review deck.'],
  'c-contoso': ['Thank you, we will confirm by end of day.'],
  'c-lina': ['Happy to help — ping me if anything changes.'],
  'c-general': ['Thanks for the update!', 'See everyone Thursday.'],
};

export function linksIn(m: ChatMessage): string[] {
  return m.body.match(URL_RE) ?? [];
}

@Service()
export class LinkChatDemoStore {
  private readonly state = signal<Conversation[]>(SEED.map((c, i) => ({ ...c, messages: [...c.messages], rank: -i })));
  readonly conversations = this.state.asReadonly();
  /** The conversation open in the thread; kept across tab switches. */
  readonly activeId = signal('c-brand');
  /** Who is typing where, while a simulated reply is on its way. */
  readonly typing = signal<{ conversationId: string; name: string } | null>(null);
  /** The last message a teammate sent, for the polite live region. */
  readonly arrived = signal<{ conversationId: string; text: string } | null>(null);

  private ranks = 0;
  private replyTurn: Record<string, number> = {};

  open(id: string): void {
    this.activeId.set(id);
    this.patch(id, (c) => ({ ...c, unread: 0 }));
  }

  send(id: string, body: string, file?: ChatFile): void {
    const m = msg('', body, this.now(), file ? { file } : {});
    this.patch(id, (c) => ({ ...c, messages: [...c.messages, m], rank: ++this.ranks }));
    this.scheduleReply(id);
  }

  system(id: string, body: string): void {
    this.patch(id, (c) => ({ ...c, messages: [...c.messages, msg('', body, this.now(), { system: true })] }));
  }

  /** Adds my reaction, or takes it back if it is already there. */
  toggleReaction(id: string, messageId: string, emoji: string): void {
    this.patch(id, (c) => ({
      ...c,
      messages: c.messages.map((m) => {
        if (m.id !== messageId) return m;
        const who = m.reactions[emoji] ?? [];
        const next = who.includes('') ? who.filter((w) => w !== '') : [...who, ''];
        const reactions = { ...m.reactions, [emoji]: next };
        if (!next.length) delete reactions[emoji];
        return { ...m, reactions };
      }),
    }));
  }

  /** A teammate starts typing a beat after I post, then answers. */
  private scheduleReply(id: string): void {
    const conv = this.state().find((c) => c.id === id);
    if (!conv) return;
    const turn = this.replyTurn[id] ?? 0;
    this.replyTurn[id] = turn + 1;
    const name = conv.members[turn % conv.members.length];
    const lines = REPLIES[id] ?? ['👍'];
    const text = lines[turn % lines.length];
    setTimeout(() => this.typing.set({ conversationId: id, name }), 700);
    setTimeout(() => {
      this.typing.set(null);
      this.patch(id, (c) => ({
        ...c,
        messages: [...c.messages, msg(name, text, this.now())],
        unread: this.activeId() === id ? 0 : c.unread + 1,
        rank: ++this.ranks,
      }));
      this.arrived.set({ conversationId: id, text: `${name} in ${conv.kind === 'channel' ? '#' : ''}${conv.name}: ${text}` });
    }, 2600);
  }

  private patch(id: string, fn: (c: Conversation) => Conversation): void {
    this.state.update((list) => list.map((c) => (c.id === id ? fn(c) : c)));
  }

  private now(): string {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
}
