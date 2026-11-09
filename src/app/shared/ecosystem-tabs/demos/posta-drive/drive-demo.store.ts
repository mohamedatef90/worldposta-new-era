import { Service, signal } from '@angular/core';

/**
 * Posta Drive (CloudDrive) on demo data: the file fields of
 * clouddrive/web/src/api.ts FileItem, the share tiers of ShareDialog, and
 * file names from shareDemoFixtures.ts. Uploads only record a name and size
 * read locally; no file content is kept or sent anywhere.
 */
export type ShareRole = 'viewer' | 'commenter' | 'editor' | 'manager';

export interface DriveShare {
  readonly email: string;
  readonly role: ShareRole;
}

export interface DriveLink {
  readonly url: string;
  readonly permission: Exclude<ShareRole, 'manager'>;
  readonly allowDownload: boolean;
}

export interface DriveItem {
  readonly id: string;
  readonly kind: 'folder' | 'file';
  readonly name: string;
  readonly parentId: string | null;
  readonly sizeBytes: number;
  readonly updatedAt: string;
  readonly starred: boolean;
  readonly trashedAt: string | null;
  readonly shares: readonly DriveShare[];
  readonly link: DriveLink | null;
}

const ago = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();
const KB = 1024;
const MB = 1024 * KB;

const item = (id: string, kind: DriveItem['kind'], name: string, parentId: string | null, sizeBytes: number, hours: number, extra: Partial<DriveItem> = {}): DriveItem => ({
  id, kind, name, parentId, sizeBytes, updatedAt: ago(hours), starred: false, trashedAt: null, shares: [], link: null, ...extra,
});

const seed = (): DriveItem[] => [
  item('f-marketing', 'folder', 'Marketing Assets', null, 0, 5, { shares: [{ email: 'chloe.wilson@alpha-inc.com', role: 'editor' }] }),
  item('f-q1', 'folder', 'Q1 Reports', null, 0, 30),
  item('f-projects', 'folder', 'Projects', null, 0, 52, { starred: true }),
  item('f-finance', 'folder', 'Finance', null, 0, 200),
  item('d-proposal', 'file', 'Proposal.docx', null, 248 * KB, 2, { starred: true }),
  item('d-budget', 'file', 'Budget_2026.xlsx', null, 96 * KB, 20, { shares: [{ email: 'finance@alpha-inc.com', role: 'commenter' }] }),
  item('d-pitch', 'file', 'Pitch_Deck.pptx', null, 4.6 * MB, 74),
  item('d-notes', 'file', 'Meeting_Notes.md', null, 6 * KB, 3),
  item('d-campaign', 'file', 'Campaign_Brief.pdf', 'f-marketing', 1.2 * MB, 6),
  item('d-logo', 'file', 'Logo_Pack.zip', 'f-marketing', 18.4 * MB, 120),
  item('d-banner', 'file', 'Launch_Banner.png', 'f-marketing', 2.1 * MB, 9),
  item('f-social', 'folder', 'Social Media', 'f-marketing', 0, 48),
  item('d-posts', 'file', 'November_Posts.xlsx', 'f-social', 64 * KB, 48),
  item('d-q1sum', 'file', 'Q1_Summary.pdf', 'f-q1', 820 * KB, 30),
  item('d-q1data', 'file', 'Q1_Data.xlsx', 'f-q1', 310 * KB, 31),
  item('d-launch', 'file', 'Launch_Plan.docx', 'f-projects', 132 * KB, 4, { starred: true }),
  item('d-billing', 'file', 'Plan_Billing.pdf', 'f-finance', 540 * KB, 200),
  item('d-brief', 'file', 'Confidential_Brief.pdf', 'f-finance', 380 * KB, 210),
  item('d-old', 'file', 'Old_Draft.docx', null, 88 * KB, 300, { trashedAt: ago(26) }),
];

@Service()
export class DriveDemoStore {
  private readonly state = signal<DriveItem[]>(seed());
  readonly items = this.state.asReadonly();

  private patch(ids: readonly string[], change: (it: DriveItem) => Partial<DriveItem>): void {
    this.state.update((list) => list.map((it) => (ids.includes(it.id) ? { ...it, ...change(it) } : it)));
  }

  get(id: string | null): DriveItem | undefined {
    return id ? this.state().find((it) => it.id === id) : undefined;
  }

  /** True when `id` is `ancestorId` or sits anywhere inside it. */
  isInside(id: string | null, ancestorId: string): boolean {
    for (let cur = this.get(id); cur; cur = this.get(cur.parentId)) if (cur.id === ancestorId) return true;
    return false;
  }

  /** Hidden from the Drive when the item, or any folder above it, is in Trash. */
  isTrashed(it: DriveItem): boolean {
    for (let cur: DriveItem | undefined = it; cur; cur = this.get(cur.parentId)) if (cur.trashedAt) return true;
    return false;
  }

  create(kind: DriveItem['kind'], name: string, parentId: string | null, sizeBytes = 0): DriveItem {
    const created = item(`${kind[0]}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, kind, name, parentId, sizeBytes, 0);
    this.state.update((list) => [...list, created]);
    return created;
  }

  rename(id: string, name: string): void {
    this.patch([id], () => ({ name, updatedAt: new Date().toISOString() }));
  }

  setStar(ids: readonly string[], starred: boolean): void {
    this.patch(ids, () => ({ starred }));
  }

  move(ids: readonly string[], parentId: string | null): void {
    this.patch(ids, () => ({ parentId }));
  }

  trash(ids: readonly string[]): void {
    const at = new Date().toISOString();
    this.patch(ids, () => ({ trashedAt: at }));
  }

  /** Restores to where it was, or to Home when that folder is itself in Trash. */
  restore(id: string): void {
    this.patch([id], (it) => {
      const parent = this.get(it.parentId);
      return { trashedAt: null, parentId: parent && !this.isTrashed(parent) ? it.parentId : null };
    });
  }

  /** Delete forever, with everything inside a folder. */
  purge(id: string): void {
    this.state.update((list) => list.filter((it) => !this.isInside(it.id, id)));
  }

  share(id: string, entry: DriveShare): void {
    this.patch([id], (it) => ({ shares: [...it.shares.filter((s) => s.email !== entry.email), entry] }));
  }

  revoke(id: string, email: string): void {
    this.patch([id], (it) => ({ shares: it.shares.filter((s) => s.email !== email) }));
  }

  setLink(id: string, link: DriveLink | null): void {
    this.patch([id], () => ({ link }));
  }

  /** Total size of the files in a folder and its sub-folders. */
  folderSize(id: string): number {
    return this.state()
      .filter((it) => it.kind === 'file' && it.id !== id && this.isInside(it.id, id) && !this.isTrashed(it))
      .reduce((sum, it) => sum + it.sizeBytes, 0);
  }
}
