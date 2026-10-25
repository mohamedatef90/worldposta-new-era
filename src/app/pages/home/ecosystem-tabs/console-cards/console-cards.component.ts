import { Component, input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import type { ConsoleCard } from '../ecosystem-tabs.data';

/**
 * The real CloudEdge console's Virtual Machines card view: OS mark, name and
 * state, spec tiles, network and reservation facts, and the Profile and Web
 * Console actions every VM carries.
 */
@Component({
  selector: 'app-console-cards',
  imports: [FaIconComponent],
  templateUrl: './console-cards.component.html',
  styleUrl: './console-cards.component.css',
})
export class ConsoleCardsComponent {
  readonly cards = input.required<readonly ConsoleCard[]>();
  /** Names the list for assistive tech, e.g. "Virtual machines". */
  readonly label = input.required<string>();
}
