/**
 * Real product screenshots for the ecosystem preview. When a service has one,
 * the panel opens on the actual product screen (always the light capture)
 * instead of a recreated mock-up. Services without a capture keep their live
 * preview.
 *
 * The real buttons on each screen are clickable: each action is a rectangle in
 * capture pixels over a button of the screenshot. An action either opens the
 * matching service (`tab`) or answers with a short message (`message`).
 * CloudEdge screens also make their own sidebar clickable: Dashboard, Virtual
 * Machines, Storage and Gateways open the matching service.
 */
export interface EcosystemAction {
  /** Button rectangle on the capture: x, y, width, height in capture pixels. */
  readonly box: readonly [number, number, number, number];
  readonly label: string;
  /** Service to open, when the button leads to one. */
  readonly tab?: string;
  /** What the button does, shown in the window when there is no service to open. */
  readonly message?: string;
}

export interface EcosystemScreen {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  /** Shown in the browser bar, e.g. "CloudEdge Console · Virtual Machines". */
  readonly title: string;
  readonly alt: string;
  readonly actions: readonly EcosystemAction[];
  /** A product scene rather than a single app screen: shown without the browser bar. */
  readonly scene?: boolean;
  /** True for CloudEdge console captures, whose sidebar becomes navigation. */
  readonly consoleNav?: boolean;
}

/** The CloudEdge sidebar rows that have a matching service, in capture pixels. */
export const CONSOLE_NAV: readonly { readonly label: string; readonly tab: string; readonly y: number }[] = [
  { label: 'Dashboard', tab: 'cloud-infrastructure', y: 105 },
  { label: 'Virtual Machines', tab: 'virtual-machines', y: 363 },
  { label: 'Storage', tab: 'storage', y: 419 },
  { label: 'Gateways', tab: 'networking', y: 520 },
];

const ce = (src: string, title: string, alt: string, actions: readonly EcosystemAction[], width = 1520, height = 684): EcosystemScreen => ({
  src,
  width,
  height,
  title: `CloudEdge Console · ${title}`,
  alt,
  actions,
  consoleNav: true,
});

/** Top bar of every CloudEdge capture (1520 wide). */
const CE_TOP: readonly EcosystemAction[] = [
  { box: [1255, 12, 34, 34], label: 'Notifications', message: '1 new notification: your nightly backup finished successfully.' },
];

const DASHBOARD = '/worldposta-assets/hero/cloudedge/console-dashboard.avif';
const DASHBOARD_ALT =
  'CloudEdge Console dashboard: CPU cores, memory, storage and active VMs, top VMs by resource usage and the security score.';
const DASHBOARD_ACTIONS: readonly EcosystemAction[] = [
  { box: [1233, 130, 136, 40], label: 'Create VM', tab: 'virtual-machines' },
  { box: [1381, 130, 195, 40], label: 'Custom Dashboard', message: 'Custom Dashboard: choose the widgets you want here and arrange them your way.' },
  { box: [1040, 450, 100, 28], label: 'View All VMs', tab: 'virtual-machines' },
  { box: [1182, 426, 393, 400], label: 'Security Score', tab: 'security' },
  { box: [1338, 10, 36, 36], label: 'Notifications', message: '1 new notification: your nightly backup finished successfully.' },
  { box: [1100, 500, 32, 34], label: 'sql-database-main options', message: 'sql-database-main: open, restart, take a snapshot or open the web console.' },
];

const FIREWALL_ACTIONS: readonly EcosystemAction[] = [
  ...CE_TOP,
  { box: [368, 262, 131, 33], label: 'Add Policy', message: 'Add Policy: name it, then add rules for source, destination and service.' },
  { box: [1325, 185, 111, 33], label: 'Actions', message: 'Actions: publish changes, revert to the last version or export the rules.' },
  { box: [1376, 374, 24, 24], label: 'Edit T1 Pre-Rules', message: 'Editing T1 Pre-Rules: rename the policy or change the order of its rules.' },
  { box: [1410, 374, 24, 24], label: 'Delete T1 Pre-Rules', message: 'Deleting a policy asks you to confirm first, so nothing is removed by mistake.' },
  { box: [1134, 433, 81, 22], label: 'Allow rule', message: 'Allow SSH to Jumpbox lets admin IPs reach the jumpbox over SSH.' },
  { box: [1134, 506, 72, 22], label: 'Drop rule', message: 'Drop Invalid States blocks broken or spoofed connections before they reach your network.' },
];

export const ECOSYSTEM_SCREENS: Readonly<Record<string, EcosystemScreen>> = {
  'cloud-infrastructure': ce(DASHBOARD, 'Dashboard', DASHBOARD_ALT, DASHBOARD_ACTIONS, 1600, 900),
  'virtual-machines': ce(
    '/worldposta-assets/home-v3/ce-vm.avif',
    'Virtual Machines',
    'CloudEdge Console Virtual Machines page in card view: prod-web-server-01, sql-database-main and dev-environment-centos with their cores, memory, storage and NICs.',
    [],
  ),
  storage: ce('/worldposta-assets/home-v3/ce-storage.avif', 'Storage', 'CloudEdge Console Storage page: capacity overview and the disks list.', [
    ...CE_TOP,
    { box: [368, 503, 129, 36], label: 'Create Disk', message: 'Create Disk: pick a size and a type, then attach it to any VM.' },
    { box: [432, 436, 115, 30], label: 'Object Storage', message: 'Object Storage: buckets for backups, media and archives.' },
    { box: [563, 436, 86, 30], label: 'Snapshots', message: 'Snapshots: point-in-time copies of your disks that you can restore from.' },
    { box: [893, 626, 154, 22], label: 'AD-Domain-Controller', tab: 'virtual-machines' },
    { box: [1419, 624, 24, 26], label: 'ad-dc-backup options', message: 'ad-dc-backup: attach, resize, snapshot or delete this disk.' },
  ]),
  networking: ce('/worldposta-assets/home-v3/ce-firewall.avif', 'Gateway Firewall', 'CloudEdge Console Gateway Firewall page with its rule groups and allow and drop rules.', FIREWALL_ACTIONS),
  security: ce('/worldposta-assets/home-v3/ce-firewall.avif', 'Gateway Firewall', 'CloudEdge Console Gateway Firewall page with its security policies and allow and drop rules.', FIREWALL_ACTIONS),
  'backup-dr': ce('/worldposta-assets/home-v3/ce-backup.avif', 'Backup Jobs', 'CloudEdge Console Backup Jobs page with the nightly database and weekly file server backups.', [
    ...CE_TOP,
    { box: [368, 267, 124, 36], label: 'Create Job', message: 'Create Job: choose what to back up, when it runs and how long copies are kept.' },
    { box: [1086, 396, 42, 24], label: 'Nightly Database Backup priority', message: 'Nightly Database Backup runs first as a high-priority job.' },
    { box: [1086, 461, 42, 24], label: 'Weekly File Server Backup priority', message: 'Weekly File Server Backup runs at normal priority. Switch it on to run it first.' },
    { box: [1419, 397, 24, 24], label: 'Nightly Database Backup options', message: 'Nightly Database Backup: run now, edit the schedule or restore from a copy.' },
    { box: [1419, 462, 24, 24], label: 'Weekly File Server Backup options', message: 'Weekly File Server Backup: run now, edit the schedule or restore from a copy.' },
  ]),
  monitoring: ce(DASHBOARD, 'Dashboard', DASHBOARD_ALT, DASHBOARD_ACTIONS, 1600, 900),
  automation: ce('/worldposta-assets/home-v3/ce-tasks.avif', 'Scheduled Tasks', 'CloudEdge Console Scheduled Tasks page with nightly operations and maintenance scripts.', [
    ...CE_TOP,
    { box: [368, 267, 131, 36], label: 'Create Task', message: 'Create Task: pick an action, the VMs it runs on and when it repeats.' },
    { box: [397, 452, 40, 24], label: 'Stop VM task', message: 'Stop VM is on: all dev VMs stop every night at 02:00 UTC.' },
    { box: [397, 525, 40, 24], label: 'Create Snapshot task', message: 'Create Snapshot is on: sql-database-main is snapshotted daily at 04:00 UTC, keeping 5.' },
    { box: [480, 598, 245, 24], label: 'Maintenance Scripts', message: 'Maintenance Scripts: 1 task, currently paused.' },
    { box: [1427, 457, 24, 24], label: 'Stop VM options', message: 'Stop VM: run now, edit, pause or delete this task.' },
  ]),
  'cost-management': ce('/worldposta-assets/home-v3/ce-pool.avif', 'Reservations', 'CloudEdge Console Reservations page: resource reservations with plan, status and dates.', []),
  'business-email': {
    src: '/worldposta-assets/posta/email-exchange-mailboxes.avif',
    width: 1540,
    height: 735,
    title: 'Email Admin Suite · Mailboxes',
    alt: 'WorldPosta Email Admin Suite Mailboxes page listing mailboxes with their plans, quotas and levels.',
    actions: [
      { box: [1341, 156, 135, 40], label: 'Add Mailbox', message: 'Add Mailbox: enter the name and login, then pick a mailbox plan.' },
      { box: [1147, 156, 186, 40], label: 'Export all mailboxes', message: 'Export all mailboxes saves the full mailbox list as a file.' },
      { box: [1037, 156, 101, 40], label: 'Refresh', message: 'Mailboxes refreshed: 6 mailboxes, all up to date.' },
      { box: [875, 156, 154, 40], label: 'Filters & Search', message: 'Filter mailboxes by plan, level or quota, or search by name and login.' },
      { box: [782, 297, 108, 24], label: 'Posta Enterprise plan', message: 'Support Queue is on the Posta Enterprise plan, using 500 GB of its 1024 GB.' },
      { box: [1404, 295, 24, 24], label: 'Edit Support Queue', message: 'Editing Support Queue: change its plan, quota, level or aliases.' },
      { box: [1433, 295, 24, 24], label: 'Delete Support Queue', message: 'Deleting a mailbox asks you to confirm first, so nothing is removed by mistake.' },
    ],
  },
  // The connected-mode visual of the Drive page's challenge section: Drive, Link and the apps in one place.
  'drive-files': {
    src: '/worldposta-assets/home-v3/drive-connected.avif',
    width: 2000,
    height: 732,
    title: 'Posta Drive · Everything connected',
    alt: 'A smiling professional at her laptop next to Link team chats and Posta Drive, with messages, email, files, spreadsheets, presentations and meetings connected in one place.',
    scene: true,
    actions: [
      { box: [612, 439, 319, 68], label: 'Marketing Team', tab: 'team-chat' },
      { box: [612, 516, 319, 68], label: 'Product Review', tab: 'team-chat' },
      { box: [612, 593, 319, 68], label: 'Operations', tab: 'team-chat' },
      { box: [684, 356, 95, 36], label: 'Link Meetings', tab: 'conferencing' },
      { box: [1320, 176, 244, 56], label: 'New messages', tab: 'team-chat' },
      { box: [1587, 176, 244, 56], label: 'Email', tab: 'business-email' },
      { box: [1320, 246, 244, 56], label: 'Files', message: 'Every file lives in Posta Drive, so the whole team works on one latest version.' },
      { box: [1587, 246, 244, 56], label: 'Spreadsheets', message: 'Spreadsheets open and are edited right in Drive, instead of being sent in different channels.' },
      { box: [1320, 316, 244, 56], label: 'Presentations', message: 'Presentations stay in one place: no more Final_v3_FINAL.pptx.' },
      { box: [1587, 316, 244, 56], label: 'Meetings', tab: 'calendar' },
      { box: [1111, 144, 95, 33], label: 'New', message: 'Create a folder, a document, a spreadsheet or a presentation, or upload files.' },
    ],
  },
  // Posta Link screens: frames of the Posta Link product video and the Posta Link hero window.
  'team-chat': {
    src: '/worldposta-assets/home-v3/link-chat.avif',
    width: 1138,
    height: 713,
    title: 'Posta Link · #marketing',
    alt: 'Posta Link #marketing channel with team messages, a shared Campaign_Brief.pdf from Posta Drive and an approved decision.',
    actions: [
      { box: [963, 77, 156, 40], label: 'Start meeting', tab: 'conferencing' },
      { box: [305, 495, 214, 62], label: 'Campaign_Brief.pdf', tab: 'drive-files' },
      { box: [9, 160, 176, 30], label: 'Meetings', tab: 'conferencing' },
      { box: [9, 199, 176, 30], label: 'Calendar', tab: 'calendar' },
      { box: [9, 237, 176, 30], label: 'Files', tab: 'drive-files' },
      { box: [244, 648, 878, 50], label: 'Message #marketing', message: 'Type a message, mention a teammate with @ or attach a file from Posta Drive.' },
    ],
  },
  conferencing: {
    src: '/worldposta-assets/home-v3/link-meeting.avif',
    width: 1600,
    height: 822,
    title: 'Posta Link · Meeting',
    alt: 'Posta Link workspace with Team Updates chat beside a four-person video meeting and call controls.',
    actions: [], // shown live by LinkMeetingComponent
  },
  notes: {
    src: '/worldposta-assets/home-v3/link-files-tasks.avif',
    width: 1138,
    height: 713,
    title: 'Posta Link · Launch_Plan.docx',
    alt: 'Posta Link shared document Launch_Plan.docx being edited together, with a Tasks list beside it.',
    actions: [
      { box: [9, 123, 176, 30], label: 'Chat', tab: 'team-chat' },
      { box: [9, 161, 176, 30], label: 'Meetings', tab: 'conferencing' },
      { box: [9, 199, 176, 30], label: 'Calendar', tab: 'calendar' },
      { box: [842, 278, 28, 28], label: 'Review budget', message: 'Review budget marked done. All 3 launch tasks are complete.' },
      { box: [690, 108, 84, 32], label: 'People editing', message: '3 people are editing Launch_Plan.docx right now.' },
    ],
  },
};
