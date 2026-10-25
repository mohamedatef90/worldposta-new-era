import { Component, signal, computed, inject } from '@angular/core';
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
import { TAB_CONTENT, TAB_GROUPS, type TabContent, type TabGroup } from './ecosystem-tabs.data';


@Component({
  selector: 'app-ecosystem-tabs',
  imports: [DecimalPipe, FaIconComponent, NgOptimizedImage, PanelCardsComponent, NotesPanelComponent, ServicePickerComponent, ConsoleExtrasComponent, ConsoleCardsComponent],
  templateUrl: './ecosystem-tabs.component.html',
  styleUrl: './ecosystem-tabs.component.css',
})
export class EcosystemTabsComponent {
  private readonly theme = inject(ThemeService);

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

  protected readonly tabGroups = TAB_GROUPS;

  protected readonly activeTabId = signal<string>('cloud-infrastructure');

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
    for (const group of this.tabGroups) {
      const hit = group.items.find((item) => item.id === id);
      if (hit) return { ...hit, groupLabel: group.label };
    }
    const first = this.tabGroups[0];
    return { ...first.items[0], groupLabel: first.label };
  });

  /** Shown on the picker so the catalogue behind it is not a secret. */
  protected readonly serviceCount = this.tabGroups.reduce((n, g) => n + g.items.length, 0);

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
    for (const group of this.tabGroups) {
      const hit = group.items.find((item) => item.id === id);
      if (hit) return hit.icon;
    }
    return faCloud;
  });

  protected readonly tabContent = computed<TabContent>(
    () => TAB_CONTENT[this.activeTabId()] ?? TAB_CONTENT['cloud-infrastructure'],
  );

  protected setActiveTab(tabId: string): void {
    this.activeTabId.set(tabId);
    // Picking a service is the end of the errand: fold the list away so the
    // panel it just changed is what you are looking at.
    this.pickerOpen.set(false);
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
    const group = this.tabGroups.find((g) => g.id === groupId);
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
