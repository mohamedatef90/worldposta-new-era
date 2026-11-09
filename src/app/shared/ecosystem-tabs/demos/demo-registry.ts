import type { Type } from '@angular/core';

/**
 * Every working product demo the ecosystem tabs can show, keyed by the name a
 * catalogue uses in its `live` map. Each entry is the app window's title and a
 * lazy import, so a demo's code downloads only when its tab is opened.
 */
export interface DemoEntry {
  /** Shown in the window bar, as the app's own browser tab reads. */
  readonly title: string;
  readonly load: () => Promise<Type<unknown>>;
}

export const DEMOS = {
  vms: {
    title: 'CloudEdge Console · Virtual Machines',
    load: () => import('./cloudedge-vms/vm-demo.component').then((m) => m.VmDemoComponent),
  },
  mailboxes: {
    title: 'Email Admin Suite · Mailboxes',
    load: () => import('./email-mailboxes/mailbox-demo.component').then((m) => m.MailboxDemoComponent),
  },
  billing: {
    title: 'CloudEdge Console · Billing · Invoices',
    load: () => import('../live-console/live-console.component').then((m) => m.LiveConsoleComponent),
  },
} satisfies Record<string, DemoEntry>;

export type DemoKey = keyof typeof DEMOS;
