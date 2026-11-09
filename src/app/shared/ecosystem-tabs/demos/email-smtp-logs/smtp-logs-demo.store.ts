import { Service, signal } from '@angular/core';

/**
 * Email Admin Suite SMTP logs, ported from the unified sign-in app's
 * EmailAdminSmtpLogsPage and its mock data (user-types-of-worldposta-unified-
 * sign-in: data.ts mockSmtpLogs, types.ts SmtpLogEntry). The four source
 * entries are kept and joined by more fictional ones so every action and
 * status shows. State lives for the visit; nothing leaves the browser.
 */
export type SmtpLogAction = 'DELIVER' | 'QUARANTINE' | 'REJECT' | 'ARCHIVE' | 'PASS';
export type SmtpLogStatus =
  | 'Passed' | 'Archived' | 'Rejected (Data)' | 'Rejected (Block)' | 'Spam (Confirmed)' | 'Spam (Scam)' | 'Rejected (Suspect)' | 'User Invalid';

export interface SmtpLogEntry {
  readonly id: string;
  readonly timestamp: string;
  readonly from: string;
  readonly to: string;
  readonly subject: string;
  readonly action: SmtpLogAction;
  readonly status: SmtpLogStatus;
  readonly details: string;
  /** Set once an admin releases the message from quarantine. */
  readonly released?: boolean;
}

export const SMTP_ACTIONS: readonly SmtpLogAction[] = ['PASS', 'DELIVER', 'ARCHIVE', 'QUARANTINE', 'REJECT'];
export const SMTP_STATUSES: readonly SmtpLogStatus[] = [
  'Passed', 'Archived', 'Rejected (Data)', 'Rejected (Block)', 'Spam (Confirmed)', 'Spam (Scam)', 'Rejected (Suspect)', 'User Invalid',
];
export const SMTP_DOMAINS: readonly string[] = ['alpha-inc.com', 'betadivision.net', 'gamma-corp.io'];

const HOUR = 3_600_000;
const at = (hoursAgo: number): string => new Date(Date.now() - hoursAgo * HOUR).toISOString();

const mockLogs = (): SmtpLogEntry[] => [
  { id: 'smtp1', timestamp: at(0), from: 'user@external.com', to: 'sales@alpha.inc', subject: 'Inquiry about your services', action: 'PASS', status: 'Passed', details: 'Message-ID: <123@external.com>' },
  { id: 'smtp2', timestamp: at(1), from: 'spam@spamdomain.com', to: 'info@alpha.inc', subject: '!!! You WON a PRIZE !!!', action: 'REJECT', status: 'Spam (Confirmed)', details: 'High spam score (15.2)' },
  { id: 'smtp3', timestamp: at(2), from: 'marketing@legit.com', to: 'contact@alpha.inc', subject: 'Our latest newsletter', action: 'DELIVER', status: 'Passed', details: 'Message-ID: <abc@legit.com>' },
  { id: 'smtp4', timestamp: at(3), from: 'hr@alpha.inc', to: 'archive@alpha.inc', subject: 'FW: Employee Onboarding', action: 'ARCHIVE', status: 'Archived', details: 'Archived by rule: "Internal HR Comms"' },
  { id: 'smtp5', timestamp: at(4.5), from: 'billing@vendor-portal.example', to: 'accounts@alpha.inc', subject: 'Invoice #4471 is overdue', action: 'QUARANTINE', status: 'Spam (Scam)', details: 'Link points to a lookalike domain (score 9.4)' },
  { id: 'smtp6', timestamp: at(6), from: 'noreply@parcel-notice.example', to: 'john.doe@alpha.inc', subject: 'Your parcel is waiting', action: 'QUARANTINE', status: 'Rejected (Suspect)', details: 'Low sender reputation (score 6.1)' },
  { id: 'smtp7', timestamp: at(8), from: 'ceo@alpha.inc', to: 'all@alpha.inc', subject: 'Quarterly town hall', action: 'DELIVER', status: 'Passed', details: 'Message-ID: <th-q3@alpha.inc>' },
  { id: 'smtp8', timestamp: at(12), from: 'mailer@bulk-sender.example', to: 'nobody@alpha.inc', subject: 'Re: your account', action: 'REJECT', status: 'User Invalid', details: 'Recipient address does not exist' },
  { id: 'smtp9', timestamp: at(26), from: 'partner@betadivision.net', to: 'sales@alpha.inc', subject: 'Signed contract attached', action: 'DELIVER', status: 'Passed', details: 'Message-ID: <ctr-88@betadivision.net>' },
  { id: 'smtp10', timestamp: at(29), from: 'unknown@relay.example', to: 'support@alpha.inc', subject: 'Payment details update', action: 'REJECT', status: 'Rejected (Block)', details: 'Sending IP 203.0.113.7 is on a blocklist' },
  { id: 'smtp11', timestamp: at(50), from: 'scanner@print.example', to: 'jane.smith@alpha.inc', subject: 'Scanned document', action: 'QUARANTINE', status: 'Rejected (Data)', details: 'Attachment type .exe is not allowed' },
  { id: 'smtp12', timestamp: at(74), from: 'newsletter@legit.com', to: 'contact@alpha.inc', subject: 'Weekly digest', action: 'PASS', status: 'Passed', details: 'Message-ID: <wd-31@legit.com>' },
];

@Service()
export class SmtpLogsDemoStore {
  private readonly state = signal<SmtpLogEntry[]>(mockLogs());
  readonly logs = this.state.asReadonly();
  private readonly blocked = signal<readonly string[]>([]);
  readonly blockedSenders = this.blocked.asReadonly();

  /** Releases a quarantined message: it is delivered and the log says so. */
  release(id: string): SmtpLogEntry | null {
    let hit: SmtpLogEntry | null = null;
    this.state.update((all) =>
      all.map((l) => {
        if (l.id !== id || l.action !== 'QUARANTINE') return l;
        hit = { ...l, action: 'DELIVER', status: 'Passed', released: true, details: `${l.details} · Released by admin` };
        return hit;
      }),
    );
    return hit;
  }

  block(sender: string): void {
    this.blocked.update((list) => (list.includes(sender) ? list : [...list, sender]));
  }

  unblock(sender: string): void {
    this.blocked.update((list) => list.filter((s) => s !== sender));
  }
}
