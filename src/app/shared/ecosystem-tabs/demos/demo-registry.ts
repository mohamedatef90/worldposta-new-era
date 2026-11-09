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
  emailDomains: {
    title: 'Email Admin Suite · Organizations & Domains',
    load: () => import('./email-domains/domains-demo.component').then((m) => m.DomainsDemoComponent),
  },
  emailDistributionLists: {
    title: 'Email Admin Suite · Distribution Lists',
    load: () => import('./email-distribution-lists/distribution-lists-demo.component').then((m) => m.DistributionListsDemoComponent),
  },
  emailRules: {
    title: 'Email Admin Suite · Rules',
    load: () => import('./email-rules/rules-demo.component').then((m) => m.RulesDemoComponent),
  },
  emailSmtpLogs: {
    title: 'Email Admin Suite · SMTP Logs',
    load: () => import('./email-smtp-logs/smtp-logs-demo.component').then((m) => m.SmtpLogsDemoComponent),
  },
  cloudedgeDashboard: {
    title: 'CloudEdge Console · Dashboard',
    load: () => import('./cloudedge-dashboard/dashboard-demo.component').then((m) => m.CloudedgeDashboardDemoComponent),
  },
  cloudedgeStorage: {
    title: 'CloudEdge Console · Storage',
    load: () => import('./cloudedge-storage/storage-demo.component').then((m) => m.CloudedgeStorageDemoComponent),
  },
  cloudedgeKubernetes: {
    title: 'CloudEdge Console · Kubernetes',
    load: () => import('./cloudedge-kubernetes/kubernetes-demo.component').then((m) => m.CloudedgeKubernetesDemoComponent),
  },
  linkChat: {
    title: 'Posta Link · Chat',
    load: () => import('./link-chat/link-chat-demo.component').then((m) => m.LinkChatDemoComponent),
  },
  linkNotes: {
    title: 'Posta Link · My notes',
    load: () => import('./link-notes/link-notes-demo.component').then((m) => m.LinkNotesDemoComponent),
  },
  workspaceDashboard: {
    title: 'Posta Link · Home',
    load: () => import('./workspace-dashboard/workspace-dashboard-demo.component').then((m) => m.WorkspaceDashboardDemoComponent),
  },
  networking: {
    title: 'CloudEdge Console · Network · NATs',
    load: () => import('./cloudedge-networking/networking-demo.component').then((m) => m.NetworkingDemoComponent),
  },
  firewall: {
    title: 'CloudEdge Console · Security · Gateway Firewall',
    load: () => import('./cloudedge-firewall/firewall-demo.component').then((m) => m.FirewallDemoComponent),
  },
  backup: {
    title: 'CloudEdge Console · Operations · Backup',
    load: () => import('./cloudedge-backup/backup-demo.component').then((m) => m.BackupDemoComponent),
  },
  tasks: {
    title: 'CloudEdge Console · Operations · Scheduled Tasks',
    load: () => import('./cloudedge-tasks/tasks-demo.component').then((m) => m.TasksDemoComponent),
  },
  webmail: {
    title: 'Posta · Inbox',
    load: () => import('./posta-webmail/webmail-demo.component').then((m) => m.WebmailDemoComponent),
  },
  calendar: {
    title: 'Posta · Calendar',
    load: () => import('./posta-calendar/calendar-demo.component').then((m) => m.CalendarDemoComponent),
  },
  drive: {
    title: 'Posta Drive · My Drive',
    load: () => import('./posta-drive/drive-demo.component').then((m) => m.DriveDemoComponent),
  },
  billing: {
    title: 'CloudEdge Console · Cost Management',
    load: () => import('./cloudedge-billing/billing-demo.component').then((m) => m.BillingDemoComponent),
  },
  iam: {
    title: 'WorldPosta Account · Security & Access Keys',
    load: () => import('./iam-access/iam-demo.component').then((m) => m.IamDemoComponent),
  },
  team: {
    title: 'WorldPosta Account · Team Management',
    load: () => import('./team-management/team-demo.component').then((m) => m.TeamDemoComponent),
  },
} satisfies Record<string, DemoEntry>;

export type DemoKey = keyof typeof DEMOS;
