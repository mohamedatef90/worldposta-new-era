import { Component, signal, computed, inject, input, linkedSignal } from '@angular/core';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faCloud,
  faServer,
  faCheck,
  faArrowDown,
  faArrowRight,
  faArrowUp,
  faChevronLeft,
  faChevronRight,
  faEllipsis,
  faMinus,
  faMagnifyingGlass,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { ThemeService } from '@/shared/services/theme.service';
import { PanelCardsComponent } from './panel-cards/panel-cards.component';
import { NotesPanelComponent } from './notes-panel/notes-panel.component';
import { ServicePickerComponent } from './service-picker/service-picker.component';
import { ConsoleExtrasComponent } from './console-extras/console-extras.component';
import { ConsoleCardsComponent } from './console-cards/console-cards.component';
import { LiveConsoleComponent } from './live-console/live-console.component';
import { LinkMeetingComponent } from './link-meeting/link-meeting.component';
import { CONSOLE_NAV, type EcosystemAction } from './ecosystem-screens';
import type { TabContent, TabGroup } from './ecosystem-tabs.data';
import { HOME_CATALOGUE, type EcosystemCatalogue, type LiveDemo } from './ecosystem-catalogues';
import { VmDemoComponent } from './demos/cloudedge-vms/vm-demo.component';
import { MailboxDemoComponent } from './demos/email-mailboxes/mailbox-demo.component';


/**
 * "Explore the ecosystem" tabs: a service list beside a live preview of the
 * selected service. Home shows the whole catalogue; product pages pass their
 * own slice and project their own header (eyebrow, h2 and subtitle) — the h2
 * must carry the id given in `headingId`.
 */
@Component({
  selector: 'app-ecosystem-tabs',
  imports: [DecimalPipe, FaIconComponent, NgOptimizedImage, PanelCardsComponent, NotesPanelComponent, ServicePickerComponent, ConsoleExtrasComponent, ConsoleCardsComponent, LiveConsoleComponent, LinkMeetingComponent, VmDemoComponent, MailboxDemoComponent],
  templateUrl: './ecosystem-tabs.component.html',
  styleUrl: './ecosystem-tabs.component.css',
})
export class EcosystemTabsComponent {
  private readonly theme = inject(ThemeService);

  readonly catalogue = input<EcosystemCatalogue>(HOME_CATALOGUE);
  /** Anchor id for the section, for page jump links. */
  readonly sectionId = input<string | null>(null);
  /** Id of the section heading; a projected header must use it on its h2. */
  readonly headingId = input('ecosystem-section-heading');

  protected readonly icons = {
    check: faCheck,
    chevronLeft: faChevronLeft,
    chevronRight: faChevronRight,
    arrowRight: faArrowRight,
    arrowDown: faArrowDown,
    minus: faMinus,
    arrowUp: faArrowUp,
    ellipsis: faEllipsis,
    plus: faPlus,
    search: faMagnifyingGlass,
    server: faServer,
  };

  /** Sparkline viewBox; the polyline is stretched to the tile via preserveAspectRatio="none". */
  protected readonly sparkWidth = 100;
  protected readonly sparkHeight = 32;

  /** Series → SVG polyline points, normalised to the sparkline box. */
  protected sparkLine(trend: readonly number[]): string {
    const max = Math.max(...trend);
    const min = Math.min(...trend);
    const span = max - min || 1;
    const stepX = this.sparkWidth / Math.max(trend.length - 1, 1);
    // Inset by 1px top and bottom so a 2px stroke is never clipped by the viewBox.
    const usable = this.sparkHeight - 2;
    return trend
      .map((v, i) => `${(i * stepX).toFixed(1)},${(1 + usable - ((v - min) / span) * usable).toFixed(1)}`)
      .join(' ');
  }

  /** Same series closed down to the baseline, for the soft area fill. */
  protected sparkArea(trend: readonly number[]): string {
    return `0,${this.sparkHeight} ${this.sparkLine(trend)} ${this.sparkWidth},${this.sparkHeight}`;
  }

  /**
   * 1..n for the (presentational) pager. A computed rather than a template
   * method, so the array is built once per tab instead of on every change
   * detection — the latter makes @for tear down and rebuild the whole list.
   */
  protected readonly pageNumbers = computed<readonly number[]>(() => {
    const pages = this.tabContent().console?.pages ?? 0;
    return Array.from({ length: pages }, (_, i) => i + 1);
  });

  /**
   * Stat tiles for whichever preview the active tab renders. Console and
   * calendar views both open with the same four tiles.
   */
  protected readonly panelStats = computed(
    () =>
      this.tabContent().console?.stats ??
      this.tabContent().calendar?.stats ??
      this.tabContent().stats ??
      null,
  );

  /**
   * The month grid as rows of seven cells, padded from the neighbouring months.
   * Memoized for the same reason as the console table: a template method would
   * hand `@for` fresh arrays on every pass.
   */
  protected readonly calendarWeeks = computed(() => {
    const view = this.tabContent().calendar;
    if (!view) return null;
    const byDay = new Map(view.events.map((event) => [event.day, event]));
    const cells = [
      ...view.leading.map((day) => ({ day, outside: true, today: false, event: undefined })),
      ...Array.from({ length: view.daysInMonth }, (_, index) => {
        const day = index + 1;
        return { day, outside: false, today: day === view.today, event: byDay.get(day) };
      }),
      ...view.trailing.map((day) => ({ day, outside: true, today: false, event: undefined })),
    ];
    const weeks: (typeof cells)[] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
  });

  /**
   * The active console's table, pre-sliced around the Status column. Memoized
   * rather than sliced in the template: a template method returns fresh arrays
   * on every change-detection pass, which trips NG0956 and makes `@for` tear
   * down and rebuild every row.
   */
  protected readonly consoleTable = computed(() => {
    const view = this.tabContent().console;
    if (!view || view.cards) return null;
    const split = view.statusAfter ?? 0;
    return {
      nameLabel: view.nameLabel ?? 'Name',
      showStatus: view.showStatus ?? true,
      unitLabel: view.unitLabel ?? 'results',
      columnsBefore: view.columns.slice(0, split),
      columnsAfter: view.columns.slice(split),
      rows: view.rows.map((row) => ({
        name: row.name,
        status: row.status,
        initials: row.initials,
        icon: row.icon ?? view.rowIcon,
        before: row.cells.slice(0, split),
        after: row.cells.slice(split),
      })),
    };
  });

  protected readonly tabGroups = computed(() => this.catalogue().groups);

  /** Opens on the catalogue's first service, and again whenever the catalogue changes. */
  protected readonly activeTabId = linkedSignal(() => this.tabGroups()[0].items[0].id);

  /**
   * Phone-only disclosure state for the service list. On a phone the sidebar
   * cost 537px of navigation before any content, and half its 19 tabs sat off
   * screen in a horizontal scroller; collapsed behind the picker it costs one
   * row. Desktop never reads this.
   */
  protected readonly pickerOpen = signal(false);

  /** The picker face: what you are looking at, and which family it belongs to. */
  protected readonly activeTab = computed(() => {
    const id = this.activeTabId();
    for (const group of this.tabGroups()) {
      const hit = group.items.find((item) => item.id === id);
      if (hit) return { ...hit, groupLabel: group.label };
    }
    const first = this.tabGroups()[0];
    return { ...first.items[0], groupLabel: first.label };
  });

  /** Shown on the picker so the catalogue behind it is not a secret. */
  protected readonly serviceCount = computed(() => this.tabGroups().reduce((n, g) => n + g.items.length, 0));

  /**
   * The panel screenshot for the active theme. A light screenshot on the dark
   * page reads as a bright slab, so tabs that have a dark capture swap to it;
   * the rest fall back to the light one.
   */
  protected readonly panelImage = computed(() => {
    const content = this.tabContent();
    return this.theme.isDark() && content.imageDark ? content.imageDark : content.image;
  });

  /** Icon of the active tab, shown beside the badge. */
  protected readonly activeIcon = computed<IconDefinition>(() => {
    const id = this.activeTabId();
    for (const group of this.tabGroups()) {
      const hit = group.items.find((item) => item.id === id);
      if (hit) return hit.icon;
    }
    return faCloud;
  });

  /**
   * The real product screenshot for the active service, when one exists.
   * Always the light capture, so the product reads the same in both themes.
   * Hotspots and sidebar targets are converted to percentages of the capture.
   */
  protected readonly screen = computed(() => {
    const shot = this.catalogue().screens[this.activeTabId()];
    if (!shot) return null;
    const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(2)}%`;
    return {
      ...shot,
      actions: shot.actions.map((a) => ({
        ...a,
        left: pct(a.box[0], shot.width),
        top: pct(a.box[1], shot.height),
        width: pct(a.box[2], shot.width),
        height: pct(a.box[3], shot.height),
      })),
      nav: shot.consoleNav
        ? CONSOLE_NAV.map((item) => ({
            ...item,
            top: pct(item.y - 26, shot.height),
            height: pct(52, shot.height),
            width: pct(304, shot.width),
            current: item.tab === this.activeTabId(),
          }))
        : [],
    };
  });

  /** Services whose preview is the working console instead of a screenshot. */
  protected readonly liveMode = computed(() => {
    const live = this.catalogue().live[this.activeTabId()];
    return live && live !== 'meeting' ? live : null;
  });

  /** The window title for each working app, as its own browser tab reads. */
  protected readonly liveTitle: Record<Exclude<LiveDemo, 'meeting'>, string> = {
    vms: 'CloudEdge Console · Virtual Machines',
    mailboxes: 'Email Admin Suite · Mailboxes',
    billing: 'CloudEdge Console · Billing · Invoices',
  };

  /** Conferencing shows the live Posta Link meeting window from the Posta Link hero. */
  protected readonly meeting = computed(() => this.catalogue().live[this.activeTabId()] === 'meeting');

  /** The answer of the screenshot button the visitor just pressed. */
  protected readonly actionNote = signal<{ label: string; text: string } | null>(null);
  private actionTimer?: ReturnType<typeof setTimeout>;

  /** A real button on the screenshot: open its service, or answer in the window. */
  protected runAction(action: EcosystemAction): void {
    if (action.tab) { this.setActiveTab(action.tab); return; }
    // The label is already shown as the badge, so drop a leading "Label:" from the text.
    let text = action.message ?? '';
    if (text.startsWith(action.label + ':')) {
      text = text.slice(action.label.length + 1).trim();
      text = text.charAt(0).toUpperCase() + text.slice(1);
    }
    this.actionNote.set({ label: action.label, text });
    clearTimeout(this.actionTimer);
    this.actionTimer = setTimeout(() => this.actionNote.set(null), 3600);
  }

  protected readonly tabContent = computed<TabContent>(() => {
    const { content } = this.catalogue();
    return content[this.activeTabId()] ?? content[this.tabGroups()[0].items[0].id];
  });

  protected setActiveTab(tabId: string): void {
    this.activeTabId.set(tabId);
    this.actionNote.set(null);
    // Picking a service is the end of the errand: fold the list away so the
    // panel it just changed is what you are looking at.
    this.pickerOpen.set(false);
    // Bring the product screen into view when the panel top is off screen
    // (always the case on phones, where the panel sits under the list).
    setTimeout(() => {
      const panel = document.getElementById('tabpanel-' + tabId);
      if (!panel) return;
      const top = panel.getBoundingClientRect().top;
      if (top < 64 || top > window.innerHeight * 0.45) {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        panel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }
    }, 340);
  }

  protected togglePicker(): void {
    this.pickerOpen.update((open) => !open);
  }

  /** Each group is its own tablist, so each needs one Tab stop: its selected tab, else its first. */
  protected isTabStop(group: TabGroup, itemIndex: number): boolean {
    const activeIndex = group.items.findIndex((item) => item.id === this.activeTabId());
    return itemIndex === (activeIndex === -1 ? 0 : activeIndex);
  }

  protected handleKeydown(event: KeyboardEvent, groupId: string, itemIndex: number): void {
    const group = this.tabGroups().find((g) => g.id === groupId);
    if (!group) return;

    const items = group.items;
    let newIndex = itemIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        newIndex = itemIndex < items.length - 1 ? itemIndex + 1 : 0;
        break;
      case 'ArrowUp':
        event.preventDefault();
        newIndex = itemIndex > 0 ? itemIndex - 1 : items.length - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    const newTabId = items[newIndex].id;
    this.setActiveTab(newTabId);

    // Focus the new tab button
    setTimeout(() => {
      const button = document.getElementById(`tab-${newTabId}`);
      button?.focus();
    }, 0);
  }
}
