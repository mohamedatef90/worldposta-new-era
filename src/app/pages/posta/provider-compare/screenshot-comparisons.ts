import type { RivalId } from './provider-compare.data';

export interface ScreenshotRow {
  readonly need: string;
  readonly feature: string;
  readonly posta: string;
  readonly rival: string;
}

// Each screenshot has its own wording and row order. The need connects it to
// the existing filters; multiple rows may answer the same selected need.
const rows = (items: readonly (readonly [string, string, string, string])[]): readonly ScreenshotRow[] =>
  items.map(([need, feature, posta, rival]) => ({ need, feature, posta, rival }));

export const SCREENSHOT_COMPARISONS: Readonly<Record<RivalId, readonly ScreenshotRow[]>> = {
  microsoft: rows([
    ['email', 'Business email', '✓ Posta Mail (OWA)', '✓ Exchange Online and Outlook'],
    ['protocol', 'Email protocol', 'Exchange (MAPI) + IMAP', 'Exchange (MAPI) + IMAP'],
    ['outlook', 'Outlook desktop support', '✓ Full Exchange', '✓ Full Exchange'],
    ['mobile', 'Mobile ActiveSync', '✓', '✓'],
    ['calendar', 'Shared calendars & delegation', '✓', '✓'],
    ['distribution', 'Distribution lists', '✓ Free, unlimited', '✓'],
    ['aliases', 'Email aliases', '✓ Free', '✓ Up to 400/mailbox'],
    ['phishing', 'Built-in advanced threat protection', '✓ Posta SecureGate (3-phase)', '✓ Exchange Online Protection included; Defender on some plans'],
    ['sandboxing', 'Email sandboxing', '✓ Included', '✓ Safe Attachments in Defender Plan 1 and 2'],
    ['sla', 'Uptime SLA', '99.9%', '99.9%'],
    ['security', '24/7 support', '✓ Direct', '✓ 24/7; support level by plan'],
    ['files', 'Cloud office apps', '✓ CloudSpace (docs, spreadsheets, presentations)', '✓ Included in most plans'],
    ['chat', 'Video conferencing', '✓ CloudSpace Talks', '✓ Included'],
    ['admin', 'Admin panel complexity', 'Focused, email-centric', 'Complex, multi-service'],
    ['licensing', 'Licensing model', 'Simple per-mailbox', 'Complex tiers (E1, E3, E5, Business Basic, Standard, Premium...)'],
    // Added to cover needs the original comparison had no row for.
    ['recall', 'Email recall', '✓', '✓ Exchange recall; conditions apply'],
    ['rules', 'Server-side inbox rules', '✓ Full Exchange rules (Business, Pro and Enterprise)', '✓ Exchange inbox rules'],
    ['domains', 'Multi-domain support', '✓', '✓ Multiple domains'],
    ['mfa', 'MFA', '✓', '✓ Multi-factor authentication'],
    ['storage', 'Mailbox storage', '✓ 10 GB to 1 TB per mailbox, by plan', '✓ 2 GB to 100 GB per mailbox, by plan'],
    ['recovery', 'Recover deleted email', '✓ 20 to 100 days, by plan', '✓ 14 days by default; up to 30'],
    ['migration', 'Migration and coexistence', '✓ Mail migration and coexistence', '✓ Migration tools; Exchange hybrid'],
  ]),
  google: rows([
    ['email', 'Business email', '✓ Posta Mail (OWA)', '✓ Gmail'],
    ['protocol', 'Email protocol', 'Exchange (MAPI) + IMAP', 'IMAP / Gmail only'],
    ['outlook', 'Outlook desktop (full Exchange)', '✓ Native Exchange', '✓ Google Workspace Sync for Microsoft Outlook'],
    ['calendar', 'Shared calendar (free/busy)', '✓ Full Exchange', '✓ Google Calendar with free/busy'],
    ['delegation', 'Mailbox delegation', '✓ Full MAPI delegation', '✓ Gmail delegation'],
    ['recall', 'Email recall', '✓', '⚠ Undo send only, up to 30 seconds'],
    ['mobile', 'ActiveSync (mobile)', '✓', '✓ Gmail and Calendar mobile apps and sync'],
    ['distribution', 'Distribution lists', '✓ Full Exchange DLs', '✓ Google Groups'],
    ['rules', 'Server-side inbox rules', '✓ Full Exchange rules (Business, Pro and Enterprise)', '✓ Gmail filters and admin routing rules'],
    ['phishing', 'Built-in advanced threat protection', '✓ Posta SecureGate', '✓ Spam, phishing and malware protection; advanced on Business Plus+'],
    ['sandboxing', 'Email sandboxing', '✓ Included', '⚠ Security sandbox on Enterprise plans'],
    ['admin', 'Admin panel', 'Exchange-focused', 'Google Admin Console'],
    ['files', 'Cloud office apps, file storage & video meetings', '✓ CloudSpace (office apps, drive storage, Talks)', '✓ Full Google suite'],
    ['sla', 'Uptime SLA', '99.9%', '99.9%'],
    ['security', '24/7 support', '✓ Direct, all plans', '✓ 24/7 support; level by plan'],
    // Added to cover needs the original comparison had no row for.
    ['aliases', 'Email aliases', '✓ Free', '✓ Up to 30 per user, free'],
    ['domains', 'Multi-domain support', '✓', '✓ Secondary domains and aliases'],
    ['mfa', 'MFA', '✓', '✓ 2-Step Verification'],
    ['licensing', 'Licensing model', 'Simple per-mailbox', 'Per-user plans'],
    ['storage', 'Mailbox storage', '✓ 10 GB to 1 TB per mailbox, by plan', '✓ 5 GB to 5 TB per user, shared with Drive; by plan'],
    ['recovery', 'Recover deleted email', '✓ 20 to 100 days, by plan', '✓ 30 days in Trash, then 25 days admin restore'],
    ['migration', 'Migration and coexistence', '✓ Mail migration and coexistence', '✓ Workspace migration tools'],
  ]),
  zoho: rows([
    ['email', 'Business email', '✓ Posta Mail (OWA)', '✓ Zoho Mail'],
    ['protocol', 'Email protocol', 'Exchange (MAPI) + IMAP', 'IMAP / POP3 only'],
    ['outlook', 'Outlook desktop (Exchange)', '✓ Native Exchange (MAPI)', '✗ IMAP only — no Exchange'],
    ['calendar', 'Shared calendars (Exchange)', '✓ Full Exchange Calendar', '✓ Zoho Calendar with shared calendars'],
    ['delegation', 'Mailbox delegation', '✓ Full Exchange delegation', '✓ Mail delegation and Send on behalf'],
    ['recall', 'Email recall', '✓', '⚠ Paid accounts; internal messages only'],
    ['mobile', 'Exchange ActiveSync', '✓', '✓ Supported on paid plans'],
    ['phishing', 'Built-in threat protection', '✓ Posta SecureGate (3-phase)', '✓ Spam, phishing and malware filtering'],
    ['sandboxing', 'Email sandboxing', '✓ Included', '✗ Not available'],
    ['phishing', 'AI threat detection', '✓ Included', '✗ Not available'],
    ['distribution', 'Distribution lists', '✓ Full Exchange DLs', '✓ Mail groups'],
    ['admin', 'Admin control panel', 'Full Exchange admin', 'Zoho Admin Console'],
    ['domains', 'Multi-domain support', '✓', '✓'],
    ['mfa', 'MFA', '✓', '✓'],
    ['sla', 'Uptime SLA', '99.9%', '99.9%'],
    ['security', '24/7 support', '✓ All plans', '⚠ Business hours on lower plans'],
    ['crm', 'Zoho CRM integration', '✗', '✓ Native'],
    // Added to cover needs the original comparison had no row for.
    ['rules', 'Server-side inbox rules', '✓ Full Exchange rules (Business, Pro and Enterprise)', '✓ Mail filters'],
    ['files', 'Cloud office apps and file storage', '✓ CloudSpace (docs, spreadsheets, presentations)', '✓ Workplace office apps and storage, by plan'],
    ['chat', 'Video conferencing', '✓ CloudSpace Talks', '✓ Zoho Meeting, by plan'],
    ['aliases', 'Email aliases', '✓ Free', '✓ Up to 29 additional aliases'],
    ['licensing', 'Licensing model', 'Simple per-mailbox', 'Per-user plans'],
    ['storage', 'Mailbox storage', '✓ 10 GB to 1 TB per mailbox, by plan', '✓ 5 GB to 100 GB per user, by plan'],
    ['recovery', 'Recover deleted email', '✓ 20 to 100 days, by plan', '⚠ Recovery varies by plan'],
    ['migration', 'Migration and coexistence', '✓ Mail migration and coexistence', '✓ IMAP, Exchange and Google migration'],
  ]),
};
