import { Component, input, output } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

/** What the picker face shows: the service you are on, and its family. */
export interface PickedService {
  readonly label: string;
  readonly icon: IconDefinition;
  readonly groupLabel: string;
}

/**
 * Phone-only disclosure that stands in for the service sidebar.
 *
 * On a phone the sidebar spent 537px on navigation before any content showed,
 * and half of its 19 tabs sat off-screen inside a horizontal scroller nested in
 * vertical lists. This collapses all of that to a single row that names what
 * you are looking at and how much else there is; the real tablist expands
 * underneath it on demand and is unchanged above 768px.
 *
 * Its own component because `ecosystem-tabs.component.css` is 19.58 kB against
 * a 20 kB per-component error budget — these styles would fail the build there.
 */
@Component({
  selector: 'app-service-picker',
  imports: [FaIconComponent],
  templateUrl: './service-picker.component.html',
  styleUrl: './service-picker.component.css',
})
export class ServicePickerComponent {
  readonly service = input.required<PickedService>();
  readonly count = input.required<number>();
  readonly open = input(false);
  /** Id of the tablist this controls, for aria-controls. */
  readonly controls = input.required<string>();

  readonly toggled = output<void>();

  protected readonly chevron = faChevronDown;
}
