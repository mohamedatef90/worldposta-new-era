import { Service, signal } from '@angular/core';

/**
 * Posta web mail on demo data: the folders, Focused Inbox split and message
 * fields of posta/frontend/apps/web (api/types.ts MessageHeader, FolderPane
 * ROLE_LABELS). People and companies are fictional. State lives for the
 * visit; nothing is sent anywhere.
 */
export type MailFolder = 'inbox' | 'sent' | 'drafts' | 'archive' | 'junk' | 'deleted';
export type MailFocus = 'focused' | 'other';

export interface MailAddress {
  readonly name: string;
  readonly email: string;
}

export interface MailMessage {
  readonly id: string;
  readonly folder: MailFolder;
  readonly focus: MailFocus;
  readonly from: MailAddress;
  readonly to: readonly MailAddress[];
  readonly cc: readonly MailAddress[];
  readonly subject: string;
  /** Paragraphs of the plain-text body. */
  readonly body: readonly string[];
  readonly receivedAt: string;
  readonly isRead: boolean;
  readonly isFlagged: boolean;
  readonly attachments: readonly { readonly name: string; readonly size: string }[];
}

/** Folder names as Posta's folder pane labels each role. */
export const FOLDER_LABELS: Record<MailFolder, string> = {
  inbox: 'Inbox',
  sent: 'Sent',
  drafts: 'Drafts',
  archive: 'Archive',
  junk: 'Junk',
  deleted: 'Trash',
};
export const MAIL_FOLDERS: readonly MailFolder[] = ['inbox', 'sent', 'drafts', 'archive', 'junk', 'deleted'];

/** The signed-in demo user. */
export const ME: MailAddress = { name: 'Liam Morin', email: 'liam.morin@alpha-inc.com' };

const P = {
  sara: { name: 'Chloe Wilson', email: 'chloe.wilson@alpha-inc.com' },
  youssef: { name: 'Owen Pelletier', email: 'owen.pelletier@alpha-inc.com' },
  laila: { name: 'Sophie MacDonald', email: 'sophie.macdonald@alpha-inc.com' },
  finance: { name: 'Finance Team', email: 'finance@alpha-inc.com' },
  karim: { name: 'Lucas Campbell', email: 'lucas@betadivision.net' },
  nour: { name: 'Olivia Bergeron', email: 'olivia.bergeron@gamma-corp.io' },
  drive: { name: 'Posta Drive', email: 'no-reply@drive.example.com' },
  news: { name: 'Cloud Weekly', email: 'digest@cloudweekly.example.com' },
  promo: { name: 'Office Supplies Co.', email: 'offers@supplies.example.com' },
} satisfies Record<string, MailAddress>;

/** An ISO time `minutes` before now, so the inbox always reads as fresh. */
const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

const msg = (m: Omit<MailMessage, 'cc' | 'attachments' | 'isFlagged'> & Partial<Pick<MailMessage, 'cc' | 'attachments' | 'isFlagged'>>): MailMessage => ({
  cc: [],
  attachments: [],
  isFlagged: false,
  ...m,
});

const seed = (): MailMessage[] => [
  msg({
    id: 'm1', folder: 'inbox', focus: 'focused', from: P.sara, to: [ME], cc: [P.youssef], isRead: false, isFlagged: true,
    subject: 'Q3 budget review: final numbers', receivedAt: ago(18),
    body: ['Hi Liam,', 'The finance team closed the Q3 numbers this morning. Cloud spend came in 6% under plan, mostly from the reserved instances we moved in July.', 'Can you look at the billing section on page 3 before we send this to the board on Thursday?', 'Thanks,\nSara'],
    attachments: [{ name: 'Q3_Budget_Review.xlsx', size: '84 KB' }],
  }),
  msg({
    id: 'm2', folder: 'inbox', focus: 'focused', from: P.youssef, to: [ME, P.laila], isRead: false,
    subject: 'Posta Link rollout: pilot teams', receivedAt: ago(95),
    body: ['Team,', 'Marketing and Operations are ready to start the Posta Link pilot next Monday. I have set up the #launch channel and invited both teams.', 'Sophie, could you share the onboarding checklist in the channel before then?', 'Owen'],
  }),
  msg({
    id: 'm3', folder: 'inbox', focus: 'focused', from: P.laila, to: [ME], isRead: true,
    subject: 'Design review moved to 2:30 PM', receivedAt: ago(60 * 5),
    body: ['Hi Liam,', 'Quick heads-up: the design review for the new sign-in flow is now at 2:30 PM in Meeting Room A. The calendar invite is updated.', 'Sophie'],
  }),
  msg({
    id: 'm4', folder: 'inbox', focus: 'focused', from: P.karim, to: [ME], cc: [P.sara], isRead: true,
    subject: 'Contract renewal for CloudEdge capacity', receivedAt: ago(60 * 26),
    body: ['Dear Liam,', 'Following our call, I have attached the renewal proposal for the additional CloudEdge capacity in the Cairo region. Pricing holds for 30 days.', 'Let me know if you would like to walk through it together.', 'Best regards,\nKarim Campbell\nBeta Division'],
    attachments: [{ name: 'Renewal_Proposal.pdf', size: '312 KB' }],
  }),
  msg({
    id: 'm5', folder: 'inbox', focus: 'focused', from: P.finance, to: [ME], isRead: true,
    subject: 'Expense report approved', receivedAt: ago(60 * 50),
    body: ['Your expense report for October has been approved and will be paid with the next payroll run.', 'Finance Team'],
  }),
  msg({
    id: 'm6', folder: 'inbox', focus: 'other', from: P.drive, to: [ME], isRead: false,
    subject: 'Olivia Bergeron shared "Campaign_Brief.pdf" with you', receivedAt: ago(42),
    body: ['Olivia Bergeron shared a file with you in Posta Drive.', 'Campaign_Brief.pdf · 1.2 MB', 'Open it from Drive to view, comment or download.'],
  }),
  msg({
    id: 'm7', folder: 'inbox', focus: 'other', from: P.news, to: [ME], isRead: true,
    subject: 'This week in cloud: object storage tips', receivedAt: ago(60 * 9),
    body: ['Five ways to cut object storage costs, a look at lifecycle rules, and what changed in S3-compatible APIs this month.', 'You are receiving this because you subscribed to Cloud Weekly.'],
  }),
  msg({
    id: 'm8', folder: 'inbox', focus: 'other', from: P.promo, to: [ME], isRead: true,
    subject: '20% off ergonomic chairs this week', receivedAt: ago(60 * 30),
    body: ['Upgrade your workspace: 20% off all ergonomic chairs until Sunday.'],
  }),
  msg({
    id: 'm9', folder: 'sent', focus: 'focused', from: ME, to: [P.nour], isRead: true,
    subject: 'Re: Campaign brief feedback', receivedAt: ago(60 * 3),
    body: ['Hi Olivia,', 'Thanks for the brief. The timeline works for us; I left two comments on the budget slide.', 'Liam'],
  }),
  msg({
    id: 'm10', folder: 'archive', focus: 'focused', from: P.sara, to: [ME], isRead: true,
    subject: 'Welcome to WorldPosta', receivedAt: ago(60 * 24 * 40),
    body: ['Welcome aboard, Liam! Your mailbox, calendar and drive are ready.'],
  }),
  msg({
    id: 'm11', folder: 'drafts', focus: 'focused', from: ME, to: [P.youssef], isRead: true,
    subject: 'Pilot feedback form', receivedAt: ago(60 * 7),
    body: ['Owen, here is a first draft of the questions for the pilot teams:'],
  }),
];

@Service()
export class WebmailDemoStore {
  private readonly state = signal<MailMessage[]>(seed());
  readonly messages = this.state.asReadonly();

  private patch(id: string, change: Partial<MailMessage>): void {
    this.state.update((list) => list.map((m) => (m.id === id ? { ...m, ...change } : m)));
  }

  setRead(id: string, isRead: boolean): void {
    this.patch(id, { isRead });
  }

  setFlag(id: string, isFlagged: boolean): void {
    this.patch(id, { isFlagged });
  }

  move(id: string, folder: MailFolder): void {
    this.patch(id, { folder });
  }

  /** Focused Inbox: moving a message to the other tab. */
  setFocus(id: string, focus: MailFocus): void {
    this.patch(id, { focus });
  }

  send(message: Pick<MailMessage, 'to' | 'cc' | 'subject' | 'body'>): void {
    const sent: MailMessage = {
      ...message,
      id: `m${Date.now()}`,
      folder: 'sent',
      focus: 'focused',
      from: ME,
      receivedAt: new Date().toISOString(),
      isRead: true,
      isFlagged: false,
      attachments: [],
    };
    this.state.update((list) => [sent, ...list]);
  }
}
