import { Component, computed, input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

/**
 * Accent for a card row or donut slice. Decoration only — every row states its
 * own label, so nothing here is the sole carrier of meaning.
 */
export type CardTone = 'blue' | 'green' | 'purple' | 'amber' | 'grey';

/** Reserved states for a row's trailing pill, matching the console's tones. */
export type BadgeTone = 'good' | 'warning' | 'critical' | 'neutral';

export interface PanelListItem {
  /** Leading mark. Falls back to `initials` when absent. */
  readonly icon?: IconDefinition;
  /** Avatar bubble, for rows that name a person. */
  readonly initials?: string;
  readonly tone?: CardTone;
  readonly title: string;
  readonly subtitle?: string;
  /** Trailing muted text — a count, a timestamp, a state word. */
  readonly meta?: string;
  /**
   * A third line under the subtitle. Rows whose subtitle runs long carry the
   * timestamp here instead of in `meta`, which would squeeze it into ellipsis.
   */
  readonly note?: string;
  /** Trailing pill, for rows that carry a state. */
  readonly badge?: { readonly label: string; readonly tone: BadgeTone };
}

export interface DonutSlice {
  readonly label: string;
  readonly value: number;
  /** Pre-formatted figure, e.g. "6 (13%)". */
  readonly display: string;
  readonly tone: CardTone;
}

export interface PanelDonut {
  /** Figure at the centre of the ring. */
  readonly total: string;
  readonly caption: string;
  readonly slices: readonly DonutSlice[];
}

/** A headline figure with the faces behind it — the Dashboard active-users card. */
export interface PanelPeople {
  readonly figure: string;
  readonly delta?: string;
  readonly caption: string;
  /** Initials only: these stand for people the visitor cannot identify anyway. */
  readonly avatars: readonly string[];
  /** Overflow bubble, e.g. "+43". */
  readonly more?: string;
}

/** One shortcut in a quick-actions grid. */
export interface PanelAction {
  readonly icon: IconDefinition;
  readonly tone: CardTone;
  readonly label: string;
}

export interface PanelCard {
  readonly title: string;
  /** Renders a "View all" affordance when present. */
  readonly link?: string;
  readonly items?: readonly PanelListItem[];
  readonly donut?: PanelDonut;
  readonly people?: PanelPeople;
  readonly actions?: readonly PanelAction[];
}

/**
 * The card row that sits under the stat tiles on the management-style tabs:
 * lists of teams, activity and requests, plus a role-distribution donut.
 *
 * Split out of EcosystemTabsComponent rather than added to it: that component's
 * stylesheet was already at 18.19kB against the project's 20kB per-component
 * error budget, so this UI could not have lived there without failing the build.
 */
@Component({
  selector: 'app-panel-cards',
  imports: [FaIconComponent],
  templateUrl: './panel-cards.component.html',
  styleUrl: './panel-cards.component.css',
})
export class PanelCardsComponent {
  readonly cards = input.required<readonly PanelCard[]>();

  /** Ring geometry. r is chosen so the circumference is a round-ish number. */
  protected readonly radius = 42;
  protected readonly circumference = 2 * Math.PI * 42;

  /**
   * Each slice as a dash segment, pre-offset so they meet end to end. Memoized
   * per card set: a template method would recompute on every pass.
   */
  protected readonly ringsByCard = computed(() => {
    const map = new Map<string, { slice: DonutSlice; dash: string; offset: number }[]>();
    for (const card of this.cards()) {
      if (!card.donut) continue;
      const total = card.donut.slices.reduce((sum, slice) => sum + slice.value, 0) || 1;
      let covered = 0;
      map.set(
        card.title,
        card.donut.slices.map((slice) => {
          const length = (slice.value / total) * this.circumference;
          const segment = {
            slice,
            dash: `${length} ${this.circumference - length}`,
            offset: -covered,
          };
          covered += length;
          return segment;
        }),
      );
    }
    return map;
  });
}
