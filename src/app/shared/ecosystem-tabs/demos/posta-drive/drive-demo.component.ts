import { Component, DestroyRef, ElementRef, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowRight, faCircleCheck, faCircleInfo, faCopy, faEllipsisVertical, faEye, faFile, faFileExcel, faFileImage, faFileLines,
  faFilePdf, faFilePowerpoint, faFileWord, faFileZipper, faFolder, faFolderPlus, faGlobe, faList, faLock, faPen, faPlus,
  faRotateLeft, faShareNodes, faSort, faSortDown, faSortUp, faStar, faTableCellsLarge, faTrashCan, faUpload, faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { DemoDialogComponent } from '../demo-dialog.component';
import { DriveDemoStore, type DriveItem, type DriveLink, type ShareRole } from './drive-demo.store';

type Section = 'drive' | 'starred' | 'trash';
type SortCol = 'name' | 'size' | 'modified';
interface Upload { id: string; name: string; size: number; parentId: string | null; loaded: number; status: 'uploading' | 'done' | 'cancelled' }
interface NameDialog { mode: 'folder' | 'rename'; item: DriveItem | null; value: string; submitted: boolean }

const FILES_MIME = 'application/x-clouddrive-files';
const EMAIL = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/;

/** The share tiers and their one-line descriptions, from ShareDialog's TierPicker. */
export const TIERS: Record<ShareRole, { title: string; sub: string }> = {
  viewer: { title: 'View', sub: "Read & download — can't comment or edit" },
  commenter: { title: 'Comment', sub: "Read + leave comments — can't change the file" },
  editor: { title: 'Edit', sub: 'Full access — can edit in Office Online' },
  manager: { title: 'Manage', sub: 'Edit + manage access and sharing' },
};

/** Byte sizes as Dashboard.fmtBytes. */
export function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

/**
 * Posta Drive file area, working: breadcrumbs into folders, the New menu
 * (New folder, Document, Spreadsheet, Presentation, Upload file), local
 * uploads with the upload tray's progress, list and grid views with sorting,
 * star, rename, Move to… (and dragging rows onto a folder or breadcrumb),
 * Share (Restricted people with a role, or Anyone with link with Copy link),
 * Move to trash, and Trash with Restore and Delete forever. Ported from
 * clouddrive/web/src: Dashboard.tsx (drive toolbar, files table and grid,
 * row actions menu), NewMenu, UploadTray and uploadStore, MoveDialog,
 * ShareDialog, Trash. The AppSidebar and FolderTree rails are left out; a
 * My Drive / Starred / Trash switch stands in for their links.
 */
@Component({
  selector: 'app-posta-drive-demo',
  imports: [FaIconComponent, NgTemplateOutlet, DemoDialogComponent],
  templateUrl: './drive-demo.component.html',
  styleUrls: ['../demo.css', './drive-demo.component.css'],
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class DriveDemoComponent {
  private readonly store = inject(DriveDemoStore);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly i = {
    move: faArrowRight, ok: faCircleCheck, info: faCircleInfo, copy: faCopy, kebab: faEllipsisVertical, preview: faEye, folder: faFolder,
    newFolder: faFolderPlus, globe: faGlobe, list: faList, lock: faLock, rename: faPen, plus: faPlus, restore: faRotateLeft,
    share: faShareNodes, sort: faSort, sortDown: faSortDown, sortUp: faSortUp, star: faStar, grid: faTableCellsLarge, trash: faTrashCan,
    upload: faUpload, close: faXmark, doc: faFileWord, sheet: faFileExcel, slides: faFilePowerpoint,
  };
  protected readonly tiers = TIERS;
  protected readonly peopleTiers: readonly ShareRole[] = ['viewer', 'commenter', 'editor', 'manager'];
  protected readonly linkTiers: readonly DriveLink['permission'][] = ['viewer', 'commenter', 'editor'];
  protected readonly fmtBytes = fmtBytes;

  protected readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    // Leaving the tab mid-upload finishes those uploads, so the files are there on return.
    inject(DestroyRef).onDestroy(() => {
      this.uploadTimers.forEach((t) => clearInterval(t));
      for (const u of this.uploads()) if (u.status === 'uploading') this.store.create('file', u.name, u.parentId, u.size);
    });
  }

  /* ---------- Where we are ---------- */
  protected readonly section = signal<Section>('drive');
  protected readonly folderId = signal<string | null>(null);
  protected readonly view = signal<'list' | 'grid'>('list');
  protected readonly sortCol = signal<SortCol>('name');
  protected readonly sortDir = signal<'asc' | 'desc'>('asc');

  protected readonly crumbs = computed(() => {
    this.store.items();
    const path: { id: string | null; name: string }[] = [];
    for (let cur = this.store.get(this.folderId()); cur; cur = this.store.get(cur.parentId)) path.unshift({ id: cur.id, name: cur.name });
    return [{ id: null, name: 'My Drive' }, ...path];
  });

  protected readonly rows = computed(() => {
    const section = this.section();
    const all = this.store.items();
    const list =
      section === 'trash'
        ? all.filter((it) => {
            const parent = this.store.get(it.parentId);
            return it.trashedAt && !(parent && this.store.isTrashed(parent));
          })
        : section === 'starred'
          ? all.filter((it) => it.starred && !this.store.isTrashed(it))
          : all.filter((it) => it.parentId === this.folderId() && !this.store.isTrashed(it));
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    const col = this.sortCol();
    return [...list].sort((a, b) => {
      // Folders always before files, whatever the sort column (Dashboard.sortedRows).
      if (a.kind !== b.kind) return a.kind === 'folder' ? -1 : 1;
      const cmp =
        col === 'size' ? this.size(a) - this.size(b) : col === 'modified' ? a.updatedAt.localeCompare(b.updatedAt) : a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      return cmp * dir;
    });
  });
  protected readonly folderRows = computed(() => this.rows().filter((it) => it.kind === 'folder'));
  protected readonly fileRows = computed(() => this.rows().filter((it) => it.kind === 'file'));

  protected setSection(s: Section): void {
    this.section.set(s);
    this.folderId.set(null);
    this.selected.set([]);
  }

  protected openFolder(id: string | null): void {
    this.section.set('drive');
    this.folderId.set(id);
    this.selected.set([]);
    this.openMenu.set(null);
  }

  protected toggleSort(col: SortCol): void {
    if (this.sortCol() === col) this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      this.sortCol.set(col);
      this.sortDir.set('asc');
    }
  }

  protected ariaSort(col: SortCol): 'ascending' | 'descending' | 'none' {
    return this.sortCol() !== col ? 'none' : this.sortDir() === 'asc' ? 'ascending' : 'descending';
  }

  protected sortIcon(col: SortCol): IconDefinition {
    return this.sortCol() !== col ? this.i.sort : this.sortDir() === 'asc' ? this.i.sortUp : this.i.sortDown;
  }

  /** Default click: a folder opens; a file would open in the Drive viewer. */
  protected openItem(it: DriveItem): void {
    if (it.kind === 'folder') this.openFolder(it.id);
    else this.notify(`${it.name} opens in the Posta Drive viewer. In this demo files stay on your device.`);
  }

  /* ---------- Display helpers ---------- */
  protected size(it: DriveItem): number {
    return it.kind === 'folder' ? this.store.folderSize(it.id) : it.sizeBytes;
  }

  protected sizeLabel(it: DriveItem): string {
    if (it.kind === 'file') return fmtBytes(it.sizeBytes);
    const n = this.store.folderSize(it.id);
    return n ? fmtBytes(n) : '—';
  }

  protected date(iso: string | null): string {
    return iso ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';
  }

  protected icon(it: DriveItem): IconDefinition {
    if (it.kind === 'folder') return faFolder;
    const ext = it.name.split('.').pop()?.toLowerCase() ?? '';
    if (['doc', 'docx'].includes(ext)) return faFileWord;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return faFileExcel;
    if (['ppt', 'pptx'].includes(ext)) return faFilePowerpoint;
    if (ext === 'pdf') return faFilePdf;
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif'].includes(ext)) return faFileImage;
    if (['zip', 'rar', '7z', 'gz'].includes(ext)) return faFileZipper;
    if (['md', 'txt'].includes(ext)) return faFileLines;
    return faFile;
  }

  protected iconKind(it: DriveItem): string {
    const ic = this.icon(it);
    return ic === faFolder ? 'folder' : ic === faFileWord ? 'doc' : ic === faFileExcel ? 'sheet' : ic === faFilePowerpoint ? 'slides' : ic === faFilePdf ? 'pdf' : 'other';
  }

  protected location(it: DriveItem): string {
    return this.store.get(it.parentId)?.name ?? 'My Drive';
  }

  /* ---------- Selection ---------- */
  protected readonly selected = signal<readonly string[]>([]);
  protected readonly allSelected = computed(() => this.rows().length > 0 && this.rows().every((it) => this.selected().includes(it.id)));

  protected toggleOne(id: string, checked: boolean): void {
    this.selected.update((ids) => (checked ? [...ids, id] : ids.filter((x) => x !== id)));
  }

  protected toggleAll(checked: boolean): void {
    this.selected.set(checked ? this.rows().map((it) => it.id) : []);
  }

  /* ---------- Menus ---------- */
  protected readonly openMenu = signal<string | null>(null);
  private menuTrigger: HTMLElement | null = null;

  protected toggleMenu(event: Event, id: string): void {
    this.menuTrigger = event.currentTarget as HTMLElement;
    this.openMenu.update((open) => (open === id ? null : id));
  }

  protected closeMenu(): void {
    this.openMenu.set(null);
    this.menuTrigger?.focus();
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!(event.target as HTMLElement | null)?.closest('.d-menu-wrap')) this.openMenu.set(null);
  }

  /* ---------- Star ---------- */
  protected toggleStar(it: DriveItem): void {
    this.store.setStar([it.id], !it.starred);
    this.notify(it.starred ? `Removed ${it.name} from Starred.` : `Starred ${it.name}.`);
  }

  protected bulkStar(starred: boolean): void {
    const ids = this.selected();
    this.store.setStar(ids, starred);
    this.notify(`${starred ? 'Starred' : 'Unstarred'} ${ids.length} item${ids.length === 1 ? '' : 's'}.`);
    this.selected.set([]);
  }

  /* ---------- New folder, new files, rename ---------- */
  protected readonly nameDialog = signal<NameDialog | null>(null);

  protected readonly nameError = computed(() => {
    const d = this.nameDialog();
    if (!d) return null;
    const v = d.value.trim();
    if (!v) return d.mode === 'folder' ? 'Folder name is required.' : 'Name is required.';
    if (/[\\/]/.test(v)) return 'Names can’t contain / or \\.';
    return null;
  });

  protected newFolder(): void {
    this.openMenu.set(null);
    this.nameDialog.set({ mode: 'folder', item: null, value: '', submitted: false });
  }

  protected startRename(it: DriveItem): void {
    this.closeMenu();
    this.nameDialog.set({ mode: 'rename', item: it, value: it.name, submitted: false });
  }

  protected setName(value: string): void {
    this.nameDialog.update((d) => (d ? { ...d, value } : d));
  }

  protected saveName(): void {
    const d = this.nameDialog();
    if (!d) return;
    if (this.nameError()) {
      this.nameDialog.set({ ...d, submitted: true });
      return;
    }
    const name = d.value.trim();
    if (d.mode === 'folder') {
      this.store.create('folder', name, this.section() === 'drive' ? this.folderId() : null);
      this.notify(`Created folder ${name}.`);
    } else if (d.item && name !== d.item.name) {
      this.store.rename(d.item.id, name);
      this.notify(`Renamed to ${name}.`);
    }
    this.nameDialog.set(null);
  }

  /** New › Document / Spreadsheet / Presentation: an empty Office file in this folder. */
  protected newFile(ext: 'docx' | 'xlsx' | 'pptx'): void {
    this.openMenu.set(null);
    const base = { docx: 'Untitled document', xlsx: 'Untitled spreadsheet', pptx: 'Untitled presentation' }[ext];
    const created = this.store.create('file', `${base}.${ext}`, this.section() === 'drive' ? this.folderId() : null, 0);
    this.notify(`Created ${created.name}.`);
  }

  /* ---------- Upload (local only) and the upload tray ---------- */
  protected readonly uploads = signal<Upload[]>([]);
  private readonly uploadTimers = new Map<string, ReturnType<typeof setInterval>>();
  private clearTimer?: ReturnType<typeof setTimeout>;
  protected readonly inFlight = computed(() => this.uploads().filter((u) => u.status === 'uploading').length);
  protected readonly dropFiles = signal(false);

  protected pickFiles(): void {
    this.openMenu.set(null);
    this.host.querySelector<HTMLInputElement>('#pd-upload')?.click();
  }

  protected onFilesPicked(input: HTMLInputElement): void {
    this.uploadFiles(input.files);
    input.value = '';
  }

  /** Only the name and size are read; the content never leaves the browser, or even gets read. */
  private uploadFiles(files: FileList | null | undefined): void {
    if (!files?.length) return;
    const parentId = this.section() === 'drive' ? this.folderId() : null;
    clearTimeout(this.clearTimer);
    for (const file of Array.from(files)) {
      const up: Upload = { id: Math.random().toString(36).slice(2), name: file.name, size: file.size, parentId, loaded: 0, status: 'uploading' };
      this.uploads.update((list) => [...list, up]);
      // Simulated transfer: about 1.6 s per file whatever its size.
      const step = Math.max(1, Math.ceil(file.size / 14));
      const timer = setInterval(() => {
        const cur = this.uploads().find((u) => u.id === up.id);
        if (!cur || cur.status !== 'uploading') return this.stopTimer(up.id);
        const loaded = Math.min(cur.size, cur.loaded + step);
        const done = loaded >= cur.size;
        this.uploads.update((list) => list.map((u) => (u.id === up.id ? { ...u, loaded, status: done ? 'done' : 'uploading' } : u)));
        if (done) {
          this.stopTimer(up.id);
          this.store.create('file', file.name, parentId, file.size);
          this.notify(`Uploaded ${file.name}.`);
          this.scheduleTrayClear();
        }
      }, 115);
      this.uploadTimers.set(up.id, timer);
    }
  }

  private stopTimer(id: string): void {
    clearInterval(this.uploadTimers.get(id));
    this.uploadTimers.delete(id);
  }

  /** The tray clears itself 5 s after everything finished successfully (TC-022). */
  private scheduleTrayClear(): void {
    if (this.inFlight() || this.uploads().some((u) => u.status !== 'done')) return;
    this.clearTimer = setTimeout(() => this.clearFinished(), 5000);
  }

  protected cancelUpload(u: Upload): void {
    this.stopTimer(u.id);
    this.uploads.update((list) => list.map((x) => (x.id === u.id ? { ...x, status: 'cancelled' } : x)));
    this.notify(`Cancelled ${u.name}.`);
  }

  protected clearFinished(): void {
    this.uploads.update((list) => list.filter((u) => u.status === 'uploading'));
  }

  protected pct(u: Upload): number {
    return u.size ? Math.min(100, Math.floor((u.loaded / u.size) * 100)) : u.status === 'done' ? 100 : 0;
  }

  /* ---------- Drag rows onto a folder (or a breadcrumb); drop files from the desktop to upload ---------- */
  private dragIds: string[] = [];
  protected readonly dropTarget = signal<string | null>(null);

  protected onRowDragStart(event: DragEvent, it: DriveItem): void {
    this.dragIds = this.selected().includes(it.id) ? [...this.selected()] : [it.id];
    event.dataTransfer?.setData(FILES_MIME, JSON.stringify(this.dragIds));
    event.dataTransfer?.setData('text/plain', it.name);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  protected onRowDragEnd(): void {
    this.dragIds = [];
    this.dropTarget.set(null);
  }

  private canDropInto(target: string | null): boolean {
    return this.dragIds.length > 0 && this.dragIds.every((id) => (target === null ? true : !this.store.isInside(target, id)) && this.store.get(id)?.parentId !== target);
  }

  protected onFolderDragOver(event: DragEvent, target: string | null): void {
    if (!this.dragIds.length) return;
    event.stopPropagation();
    if (!this.canDropInto(target)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.dropTarget.set(target ?? 'root');
  }

  protected onFolderDrop(event: DragEvent, target: string | null): void {
    if (!this.dragIds.length) return;
    event.preventDefault();
    event.stopPropagation();
    const ids = this.dragIds;
    this.onRowDragEnd();
    if (ids.every((id) => this.store.get(id)?.parentId !== target && (target === null || !this.store.isInside(target, id)))) this.moveItems(ids, target);
  }

  protected onListDragOver(event: DragEvent): void {
    if (this.dragIds.length || !event.dataTransfer?.types.includes('Files') || this.section() === 'trash') return;
    event.preventDefault();
    this.dropFiles.set(true);
  }

  protected onListDrop(event: DragEvent): void {
    if (this.dragIds.length || !this.dropFiles()) return;
    event.preventDefault();
    this.dropFiles.set(false);
    this.uploadFiles(event.dataTransfer?.files);
  }

  /* ---------- Move to… (MoveDialog) ---------- */
  protected readonly moveIds = signal<readonly string[] | null>(null);
  /** undefined: nothing picked yet; null: Home. */
  protected readonly movePick = signal<string | null | undefined>(undefined);

  protected readonly moveTree = computed(() => {
    const ids = this.moveIds() ?? [];
    const all = this.store.items();
    const out: { id: string; name: string; depth: number }[] = [];
    const walk = (parentId: string | null, depth: number) => {
      all
        .filter((it) => it.kind === 'folder' && it.parentId === parentId && !it.trashedAt && !ids.includes(it.id))
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((f) => {
          out.push({ id: f.id, name: f.name, depth });
          walk(f.id, depth + 1);
        });
    };
    walk(null, 1);
    return out;
  });

  protected openMove(ids: readonly string[]): void {
    this.closeMenu();
    this.movePick.set(undefined);
    this.moveIds.set(ids);
  }

  protected confirmMove(): void {
    const ids = this.moveIds();
    const target = this.movePick();
    if (!ids || target === undefined) return;
    this.moveIds.set(null);
    this.moveItems(ids, target);
  }

  private moveItems(ids: readonly string[], target: string | null): void {
    this.store.move(ids, target);
    this.selected.set([]);
    const where = target ? (this.store.get(target)?.name ?? 'folder') : 'My Drive';
    this.notify(`Moved ${ids.length} item${ids.length === 1 ? '' : 's'} to ${where}.`);
  }

  protected pickName(): string {
    const p = this.movePick();
    return p === undefined ? '(pick a folder above — My Drive is allowed)' : p === null ? 'My Drive' : (this.store.get(p)?.name ?? '');
  }

  /* ---------- Trash ---------- */
  protected readonly trashIds = signal<readonly string[] | null>(null);
  protected readonly purging = signal<DriveItem | null>(null);

  protected askTrash(ids: readonly string[]): void {
    this.closeMenu();
    this.trashIds.set(ids);
  }

  protected trashMessage(ids: readonly string[]): string {
    return ids.length === 1 ? `"${this.store.get(ids[0])?.name}" will be moved to trash.` : `${ids.length} item(s) will be moved to trash.`;
  }

  protected confirmTrash(): void {
    const ids = this.trashIds() ?? [];
    this.store.trash(ids);
    this.selected.set([]);
    this.trashIds.set(null);
    this.notify(`Moved to trash. Restore ${ids.length === 1 ? 'it' : 'them'} from Trash.`);
  }

  protected restore(it: DriveItem): void {
    this.store.restore(it.id);
    this.notify(`Restored "${it.name}" to ${this.location(this.store.get(it.id) ?? it)}.`);
  }

  protected confirmPurge(): void {
    const it = this.purging();
    if (!it) return;
    this.store.purge(it.id);
    this.purging.set(null);
    this.notify(`Deleted "${it.name}" forever.`);
  }

  /* ---------- Share (ShareDialog) ---------- */
  protected readonly shareId = signal<string | null>(null);
  protected readonly shareItem = computed(() => this.store.get(this.shareId()) ?? null);
  protected readonly shareTab = signal<'people' | 'link'>('people');
  protected readonly shareEmail = signal('');
  protected readonly shareRole = signal<ShareRole>('viewer');
  protected readonly shareSubmitted = signal(false);
  protected readonly linkPermission = signal<DriveLink['permission']>('viewer');
  protected readonly linkDownload = signal(true);

  protected readonly shareError = computed(() => {
    const email = this.shareEmail().trim().toLowerCase();
    if (!email) return 'Enter an email address.';
    if (!EMAIL.test(email)) return 'Enter a valid email address, like name@example.com.';
    return null;
  });

  protected openShare(it: DriveItem): void {
    this.closeMenu();
    this.shareTab.set(it.link ? 'link' : 'people');
    this.shareEmail.set('');
    this.shareRole.set('viewer');
    this.shareSubmitted.set(false);
    this.linkPermission.set(it.link?.permission ?? 'viewer');
    this.linkDownload.set(it.link?.allowDownload ?? true);
    this.shareId.set(it.id);
  }

  protected addPerson(it: DriveItem): void {
    this.shareSubmitted.set(true);
    if (this.shareError()) {
      this.host.querySelector<HTMLElement>('#pd-share-email')?.focus();
      return;
    }
    const email = this.shareEmail().trim().toLowerCase();
    this.store.share(it.id, { email, role: this.shareRole() });
    this.notify(`Shared with ${email} (${this.shareRole()}).`);
    this.shareEmail.set('');
    this.shareSubmitted.set(false);
  }

  protected revoke(it: DriveItem, email: string): void {
    this.store.revoke(it.id, email);
    this.notify(`${email} no longer has access to "${it.name}".`);
  }

  protected createLink(it: DriveItem): void {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(9)), (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 14);
    this.store.setLink(it.id, { url: `https://drive.worldposta.com/s/${token}`, permission: this.linkPermission(), allowDownload: this.linkDownload() });
    this.notify('Public link created.');
  }

  protected removeLink(it: DriveItem): void {
    this.store.setLink(it.id, null);
    this.shareTab.set('people');
    this.notify('Link sharing turned off. Only people you add can open it.');
  }

  protected async copyLink(link: DriveLink): Promise<void> {
    try {
      if (!navigator.clipboard) throw new Error('no clipboard');
      await navigator.clipboard.writeText(link.url);
      this.notify('Link copied.');
    } catch {
      // Same fallback idea as the source: make the URL easy to copy by hand.
      this.host.querySelector<HTMLInputElement>('#pd-link-url')?.select();
      this.notify('Press Ctrl+C (or Cmd+C) to copy the selected link.');
    }
  }

  /* ---------- Shared ---------- */
  protected notify(text: string): void {
    this.toast.set(text);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 3200);
  }
}
