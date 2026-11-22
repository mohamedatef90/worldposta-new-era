/** Data for the Posta page's interactive business email comparison. */

export type RivalId = 'microsoft' | 'google' | 'zoho';
export type ProviderId = 'posta' | RivalId;
export type CompareWith = RivalId | 'all';
export type NeedGroupId = 'daily' | 'mailboxes' | 'start' | 'security';

/**
 * How a provider covers a need.
 * - `yes`: available (a tick).
 * - `partial`: limited, a different approach, or only on some plans (a half mark).
 * Marks are deliberately even-handed: a rival gets a tick wherever it offers the
 * feature, and Posta gets a half mark wherever its own coverage is plan-limited.
 */
export type Mark = 'yes' | 'partial';

export interface Rival {
  readonly id: RivalId;
  readonly name: string;
}

export interface NeedGroup {
  readonly id: NeedGroupId;
  readonly label: string;
}

export interface EmailNeed {
  readonly id: string;
  readonly group: NeedGroupId;
  /** What the visitor taps: a statement about how their team works. */
  readonly chip: string;
  /** Row header in the table. */
  readonly feature: string;
  readonly posta: string;
  readonly rivals: Readonly<Record<RivalId, string>>;
  readonly marks: Readonly<Record<ProviderId, Mark>>;
  /** Short label used in the verdict sentence. */
  readonly short: string;
}

export const RIVALS: readonly Rival[] = [
  { id: 'microsoft', name: 'Microsoft 365' },
  { id: 'google', name: 'Google Workspace' },
  { id: 'zoho', name: 'Zoho Mail' },
];

export const NEED_GROUPS: readonly NeedGroup[] = [
  { id: 'daily', label: 'Daily work' },
  { id: 'mailboxes', label: 'Mailboxes and domains' },
  { id: 'start', label: 'Getting started' },
  { id: 'security', label: 'Security and hosting' },
];

/** Marks in column order: Posta, Microsoft 365, Google Workspace, Zoho Mail. */
function marks(posta: Mark, microsoft: Mark, google: Mark, zoho: Mark): Record<ProviderId, Mark> {
  return { posta, microsoft, google, zoho };
}

/** Ordered by group, so the table reads in the same order as the chips. */
export const EMAIL_NEEDS: readonly EmailNeed[] = [
  // ---- Daily work ----
  {
    id: 'email', group: 'daily', chip: 'We want email on our own domain', feature: 'Business email',
    posta: 'Posta Mail', short: 'business email',
    rivals: { microsoft: 'Exchange Online and Outlook', google: 'Gmail', zoho: 'Zoho Mail' },
    marks: marks('yes', 'yes', 'yes', 'yes'),
  },
  {
    id: 'protocol', group: 'daily', chip: 'We need Exchange and IMAP', feature: 'Email protocol',
    posta: 'Exchange (MAPI) + IMAP', short: 'Exchange and IMAP',
    rivals: { microsoft: 'Exchange (MAPI) + IMAP', google: 'IMAP / Gmail only', zoho: 'IMAP / POP3 only' },
    marks: marks('yes', 'yes', 'partial', 'partial'),
  },
  {
    id: 'outlook', group: 'daily', chip: 'Our team works in Outlook desktop', feature: 'Outlook desktop',
    posta: 'Native Exchange (MAPI)', short: 'Outlook desktop',
    rivals: { microsoft: 'Full Exchange', google: 'Workspace Sync for Outlook', zoho: 'IMAP only — no Exchange' },
    marks: marks('yes', 'yes', 'yes', 'partial'),
  },
  {
    id: 'mobile', group: 'daily', chip: 'People handle email on their phones', feature: 'Mobile synchronization',
    posta: 'Exchange ActiveSync', short: 'mobile sync',
    rivals: { microsoft: 'Exchange ActiveSync', google: 'Mobile apps and sync', zoho: 'ActiveSync on paid plans' },
    marks: marks('yes', 'yes', 'yes', 'partial'),
  },
  {
    id: 'calendar', group: 'daily', chip: 'We book meetings on shared calendars', feature: 'Calendar',
    posta: 'Full Exchange Calendar', short: 'shared calendars',
    rivals: { microsoft: 'Outlook Calendar', google: 'Google Calendar', zoho: 'Zoho Calendar' },
    marks: marks('yes', 'yes', 'yes', 'yes'),
  },
  {
    id: 'delegation', group: 'daily', chip: 'We delegate mailbox access', feature: 'Mailbox delegation',
    posta: 'Full Exchange delegation', short: 'mailbox delegation',
    rivals: { microsoft: 'Full Access, Send As and Send on Behalf', google: 'Gmail delegation', zoho: 'Delegation and Send on behalf' },
    marks: marks('yes', 'yes', 'yes', 'yes'),
  },
  {
    id: 'recall', group: 'daily', chip: 'We need to recall sent email', feature: 'Email recall',
    posta: 'Message recall', short: 'email recall',
    rivals: { microsoft: 'Recall; conditions apply', google: 'Undo send only', zoho: 'Recall options vary' },
    marks: marks('yes', 'yes', 'partial', 'partial'),
  },
  {
    id: 'rules', group: 'daily', chip: 'We automate mailbox rules', feature: 'Exchange rules',
    posta: 'On Business, Pro and Enterprise plans', short: 'mailbox rules',
    rivals: { microsoft: 'Inbox and mail flow rules', google: 'Gmail filters and routing rules', zoho: 'Mail filters' },
    marks: marks('partial', 'yes', 'yes', 'yes'),
  },
  {
    id: 'files', group: 'daily', chip: 'We write documents and share files', feature: 'Documents and files',
    posta: 'CloudSpace office apps and file storage', short: 'documents and files',
    rivals: { microsoft: 'Microsoft 365 apps and OneDrive, by plan', google: 'Docs, Sheets, Slides and Drive', zoho: 'Workplace apps, by plan' },
    marks: marks('yes', 'yes', 'yes', 'yes'),
  },
  {
    id: 'chat', group: 'daily', chip: 'We chat and meet as a team', feature: 'Team chat and meetings',
    posta: 'CloudSpace Talks for video meetings', short: 'video meetings',
    rivals: { microsoft: 'Teams, by plan', google: 'Chat and Meet, by plan', zoho: 'Workplace apps, by plan' },
    marks: marks('yes', 'yes', 'yes', 'yes'),
  },

  // ---- Mailboxes and domains ----
  {
    id: 'distribution', group: 'mailboxes', chip: 'We use distribution lists', feature: 'Distribution lists',
    posta: 'Free, unlimited', short: 'distribution lists',
    rivals: { microsoft: 'Distribution groups, no extra license', google: 'Google Groups, no extra license', zoho: 'Mail groups, by plan' },
    marks: marks('yes', 'yes', 'yes', 'yes'),
  },
  {
    id: 'aliases', group: 'mailboxes', chip: 'We need email aliases', feature: 'Email aliases',
    posta: 'Free', short: 'email aliases',
    rivals: { microsoft: 'Free; limits apply', google: 'Free; limits apply', zoho: 'Limits vary by plan' },
    marks: marks('yes', 'yes', 'yes', 'yes'),
  },
  {
    id: 'admin', group: 'mailboxes', chip: 'We manage our own email settings', feature: 'Email administration',
    posta: 'Full Exchange admin', short: 'email administration',
    rivals: { microsoft: 'Microsoft 365 and Exchange admin centers', google: 'Google Admin console', zoho: 'Zoho Mail Admin Console' },
    marks: marks('yes', 'yes', 'yes', 'yes'),
  },
  {
    id: 'storage', group: 'mailboxes', chip: 'We keep a lot of email', feature: 'Mailbox storage',
    posta: '10 GB to 1 TB per mailbox, depending on plan', short: 'mailbox storage',
    rivals: { microsoft: '2 GB to 100 GB per mailbox, by plan', google: '5 GB to 5 TB per user, shared with Drive; by plan', zoho: '5 GB to 100 GB per user, by plan' },
    marks: marks('yes', 'yes', 'yes', 'yes'),
  },
  {
    id: 'recovery', group: 'mailboxes', chip: 'We sometimes need deleted email back', feature: 'Recover deleted email',
    posta: '20 to 100 days, depending on plan', short: 'deleted email recovery',
    rivals: { microsoft: '14 days by default; up to 30', google: '30 days in Trash, then 25 days admin restore', zoho: 'Recovery varies by plan' },
    marks: marks('yes', 'yes', 'yes', 'partial'),
  },
  {
    id: 'domains', group: 'mailboxes', chip: 'We run more than one domain', feature: 'Multiple domains',
    posta: '2 to unlimited hosted domains, depending on plan', short: 'multiple domains',
    rivals: { microsoft: 'Multiple domains', google: 'Secondary domains and aliases', zoho: 'Multiple domains, by plan' },
    marks: marks('yes', 'yes', 'yes', 'yes'),
  },

  // ---- Getting started ----
  {
    id: 'licensing', group: 'start', chip: 'We want per-mailbox licensing', feature: 'Licensing model',
    posta: 'Simple per-mailbox', short: 'per-mailbox licensing',
    rivals: { microsoft: 'Per-user licensing, by plan', google: 'Per-user licensing, by plan', zoho: 'Per-user licensing, by plan' },
    marks: marks('yes', 'yes', 'yes', 'yes'),
  },
  {
    id: 'migration', group: 'start', chip: 'We are moving from another provider', feature: 'Migration and coexistence',
    posta: 'Mail migration and coexistence', short: 'migration',
    rivals: { microsoft: 'Migration tools; Exchange hybrid', google: 'Workspace migration tools', zoho: 'IMAP, Exchange and Google migration' },
    marks: marks('yes', 'yes', 'yes', 'yes'),
  },

  // ---- Security and hosting ----
  {
    id: 'sandboxing', group: 'security', chip: 'We need email sandboxing', feature: 'Email sandboxing',
    posta: 'Included', short: 'email sandboxing',
    rivals: { microsoft: 'Defender for Office 365, by plan', google: 'Security sandbox on some plans', zoho: 'Varies by plan' },
    marks: marks('yes', 'yes', 'partial', 'partial'),
  },
  {
    id: 'mfa', group: 'security', chip: 'We require multi-factor authentication', feature: 'Multi-factor authentication',
    posta: 'Multi-factor sign-in', short: 'multi-factor sign-in',
    rivals: { microsoft: 'Multi-factor authentication', google: '2-Step Verification', zoho: 'Multi-factor authentication' },
    marks: marks('yes', 'yes', 'yes', 'yes'),
  },
  {
    id: 'sla', group: 'security', chip: 'We need an uptime commitment', feature: 'Uptime SLA',
    posta: '99.9%', short: 'an uptime SLA',
    rivals: { microsoft: '99.9%, financially backed', google: '99.9%', zoho: '99.9%' },
    marks: marks('yes', 'yes', 'yes', 'yes'),
  },
  {
    id: 'phishing', group: 'security', chip: 'We get a lot of spam and phishing', feature: 'Spam and phishing filtering',
    posta: 'Posta SecureGate (3-phase)', short: 'spam and phishing filtering',
    rivals: { microsoft: 'Exchange Online Protection; Defender on some plans', google: 'Spam, phishing and malware protection', zoho: 'Spam and malware filtering' },
    marks: marks('yes', 'yes', 'yes', 'yes'),
  },
  {
    id: 'hosting', group: 'security', chip: 'We care where our data is hosted', feature: 'Where data is hosted',
    posta: 'Regional data centers', short: 'regional hosting',
    rivals: { microsoft: 'Data residency by region and plan', google: 'Data regions on eligible plans', zoho: 'Data centers in several regions' },
    marks: marks('yes', 'yes', 'partial', 'yes'),
  },
  {
    id: 'security', group: 'security', chip: 'We need security and technical support', feature: 'Security and support',
    posta: 'Direct, all plans', short: 'technical support',
    rivals: { microsoft: '24/7 support; level by plan', google: '24/7 support; level by plan', zoho: 'Support level by plan' },
    marks: marks('yes', 'yes', 'yes', 'partial'),
  },
];

/** "a", "a and b", "a, b and c". */
export function joinList(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}
