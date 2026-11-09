import { Component, input } from '@angular/core';
import type { ConsoleCapacity } from '../ecosystem-tabs.data';

/**
 * The page furniture the real CloudEdge console puts above a list: the page
 * description, secondary toolbar actions, the Storage capacity overview and
 * the sub-tab strip.
 *
 * Presentational only: the preview has nothing to filter or switch, so the
 * toolbar and tabs are hidden from assistive tech, like the search field.
 */
@Component({
  selector: 'app-console-extras',
  templateUrl: './console-extras.component.html',
  styleUrl: './console-extras.component.css',
  host: { style: 'display: contents' },
})
export class ConsoleExtrasComponent {
  /** The page's one-line description, under the title row. */
  readonly subtitle = input<string | undefined>(undefined);
  readonly toolbar = input<readonly string[]>([]);
  readonly capacity = input<ConsoleCapacity | undefined>(undefined);
  /** Sub-tab labels; the first is drawn as the current one. */
  readonly views = input<readonly string[]>([]);
}
