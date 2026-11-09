import { Service, signal } from '@angular/core';

/**
 * Email Admin Suite mailboxes, ported from the unified sign-in app's
 * MailboxesPage and its mock data (user-types-of-worldposta-unified-sign-in:
 * types.ts, data.ts). State lives for the visit; nothing leaves the browser.
 */
export type MailboxPlan = 'Posta Light' | 'Posta Business' | 'Posta Pro' | 'Posta Enterprise';
export type MailboxLevel = 'Normal' | 'VIP' | 'Admin';
export type MailboxType = 'User' | 'Room' | 'Equipment' | 'Shared';
export type MailboxStatus = 'active' | 'suspended' | 'blocked';

export interface Mailbox {
  readonly id: string;
  readonly displayName: string;
  readonly login: string;
  readonly mailboxPlan: MailboxPlan;
  readonly creationDate: string;
  readonly driveQuota: { readonly usedGB: number; readonly totalGB: number };
  readonly level: MailboxLevel;
  readonly status: MailboxStatus;
  readonly mfaEnabled?: boolean;
  readonly mailboxType?: MailboxType;
}

export const MAILBOX_PLANS: readonly MailboxPlan[] = ['Posta Light', 'Posta Business', 'Posta Pro', 'Posta Enterprise'];
export const MAILBOX_LEVELS: readonly MailboxLevel[] = ['Normal', 'VIP', 'Admin'];
export const MAILBOX_TYPES: readonly MailboxType[] = ['User', 'Room', 'Equipment', 'Shared'];
export const MAILBOX_DOMAINS: readonly string[] = ['alpha-inc.com', 'betadivision.net', 'gamma-corp.io'];

/** Drive quota a new mailbox gets on each plan, as the Add Mailbox panel assigns it. */
export const PLAN_QUOTA_GB: Record<MailboxPlan, number> = {
  'Posta Light': 10,
  'Posta Business': 100,
  'Posta Pro': 200,
  'Posta Enterprise': 1024,
};

const MOCK_MAILBOXES: readonly Mailbox[] = [
  { id: 'mbx_001', displayName: 'John Doe', login: 'john.doe@alpha-inc.com', mailboxPlan: 'Posta Business', creationDate: '2023-10-01T10:00:00Z', driveQuota: { usedGB: 25.5, totalGB: 100 }, level: 'Normal', status: 'active', mfaEnabled: true, mailboxType: 'User' },
  { id: 'mbx_002', displayName: 'Jane Smith', login: 'jane.smith@alpha-inc.com', mailboxPlan: 'Posta Pro', creationDate: '2023-09-15T11:30:00Z', driveQuota: { usedGB: 150.2, totalGB: 200 }, level: 'VIP', status: 'active', mfaEnabled: true, mailboxType: 'User' },
  { id: 'mbx_003', displayName: 'Sales Team', login: 'sales@alpha-inc.com', mailboxPlan: 'Posta Light', creationDate: '2023-08-20T09:00:00Z', driveQuota: { usedGB: 8.1, totalGB: 10 }, level: 'Normal', status: 'suspended', mailboxType: 'Shared' },
  { id: 'mbx_004', displayName: 'Conference Room A', login: 'conf.a@alpha-inc.com', mailboxPlan: 'Posta Light', creationDate: '2023-07-01T14:00:00Z', driveQuota: { usedGB: 0.5, totalGB: 10 }, level: 'Normal', status: 'active', mailboxType: 'Room' },
  { id: 'mbx_005', displayName: 'Support Queue', login: 'support@betadivision.net', mailboxPlan: 'Posta Enterprise', creationDate: '2023-11-05T16:45:00Z', driveQuota: { usedGB: 500, totalGB: 1024 }, level: 'Admin', status: 'active', mailboxType: 'Shared' },
  { id: 'mbx_006', displayName: 'Blocked User', login: 'blocked.user@gamma-corp.io', mailboxPlan: 'Posta Business', creationDate: '2023-06-10T12:00:00Z', driveQuota: { usedGB: 12, totalGB: 100 }, level: 'Normal', status: 'blocked', mailboxType: 'User' },
];

@Service()
export class MailboxDemoStore {
  private readonly state = signal<Mailbox[]>([...MOCK_MAILBOXES]);
  readonly mailboxes = this.state.asReadonly();

  add(mailbox: Mailbox): void {
    this.state.update((list) => [mailbox, ...list]);
  }

  update(ids: readonly string[], change: Partial<Pick<Mailbox, 'mailboxPlan' | 'level' | 'status'>>): void {
    this.state.update((list) =>
      list.map((m) => {
        if (!ids.includes(m.id)) return m;
        const next = { ...m, ...change };
        // A plan change moves the mailbox to that plan's drive quota.
        return change.mailboxPlan ? { ...next, driveQuota: { ...m.driveQuota, totalGB: PLAN_QUOTA_GB[change.mailboxPlan] } } : next;
      }),
    );
  }

  remove(ids: readonly string[]): void {
    this.state.update((list) => list.filter((m) => !ids.includes(m.id)));
  }
}
