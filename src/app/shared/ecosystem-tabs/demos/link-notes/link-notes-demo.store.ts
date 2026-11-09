import { Service, signal } from '@angular/core';

/**
 * Posta Link meeting notes, ported from team-ai-2's meeting notes panel
 * (apps/web/src/pages/meeting/useNotes.ts, the panel in pages/Meeting.tsx and
 * its i18n strings). Notes are kept per meeting, as the product keeps one per
 * (meeting, user); the meetings are the fictional ones of the product's
 * "02 Activity Home" design frame. Saving is simulated: nothing leaves the browser.
 */
export interface MeetingNote {
  readonly id: string;
  readonly meeting: string;
  /** Workspace and length, as the meeting cards print them: "Brand Launch · 45 min". */
  readonly context: string;
  /** "Today · 2:00 PM". */
  readonly when: string;
  readonly body: string;
  /** For the list order: last edited first. */
  readonly edited: number;
}

export type SaveState = 'idle' | 'saving' | 'saved';

/** Debounce for the save, as useNotes' SAVE_DEBOUNCE_MS. */
export const SAVE_DEBOUNCE_MS = 800;

const SEED: readonly MeetingNote[] = [
  {
    id: 'n-launch', meeting: 'Weekly launch sync', context: 'Brand Launch · 45 min', when: 'Today · 2:00 PM', edited: 5,
    body: 'Agenda\n- Campaign checklist v4: final review\n- Pricing table from Salma\n- Vendor review (Omar)\n\nDecisions\n- Visual direction approved by the client\n- Launch stays on the 14th\n\nAction items\n- Sara: share the final checklist in #brand-launch\n- Lina: confirm tone examples with the client',
  },
  {
    id: 'n-client', meeting: 'Client review', context: 'Client Portal · 30 min', when: 'Today · 4:30 PM', edited: 4,
    body: 'Questions for the client\n- Do they need guest access past Friday?\n- Who signs off on the pricing page?\n\nBring the tone examples and Brand-guidelines-v3.pdf.',
  },
  {
    id: 'n-ops', meeting: 'Operations planning', context: 'Operations · 60 min', when: 'Tomorrow · 10:00 AM', edited: 3,
    body: '',
  },
  {
    id: 'n-kickoff', meeting: 'Brand launch kickoff', context: 'Brand Launch · 60 min', when: 'Tuesday · 11:00 AM', edited: 2,
    body: 'Kickoff moved to Thursday.\n\nTeam: Mona, Omar, Salma, Lina (guest), Sara.\nGoal: launch the new brand site and campaign in three weeks.\n\nNext: Mohamed adds owners and dates to the launch plan.',
  },
];

@Service()
export class LinkNotesDemoStore {
  private readonly state = signal<MeetingNote[]>([...SEED]);
  readonly notes = this.state.asReadonly();
  readonly activeId = signal<string | null>('n-launch');
  readonly saveState = signal<SaveState>('idle');

  private edits = SEED.length;
  private timer?: ReturnType<typeof setTimeout>;

  /** Every keystroke is kept at once; the "save to your account" is debounced, as useNotes does. */
  write(id: string, body: string): void {
    this.patch(id, { body, edited: ++this.edits });
    this.saveState.set('saving');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.saveState.set('saved'), SAVE_DEBOUNCE_MS + 300);
  }

  rename(id: string, meeting: string): void {
    this.patch(id, { meeting, edited: ++this.edits });
  }

  create(): MeetingNote {
    const note: MeetingNote = { id: `n-${Date.now()}`, meeting: 'New meeting', context: 'Personal · 30 min', when: 'Today', body: '', edited: ++this.edits };
    this.state.update((list) => [note, ...list]);
    this.activeId.set(note.id);
    this.saveState.set('idle');
    return note;
  }

  remove(id: string): void {
    const list = this.state().filter((n) => n.id !== id);
    this.state.set(list);
    if (this.activeId() === id) this.activeId.set(list[0]?.id ?? null);
    this.saveState.set('idle');
  }

  select(id: string): void {
    this.activeId.set(id);
    // A save still in flight finishes; it is for the account, not the open note.
    if (this.saveState() !== 'saving') this.saveState.set('idle');
  }

  private patch(id: string, change: Partial<MeetingNote>): void {
    this.state.update((list) => list.map((n) => (n.id === id ? { ...n, ...change } : n)));
  }
}
