import { Component, input, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faHeadset, faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface JourneyStep {
  readonly icon: IconDefinition;
  readonly tone: string;
  readonly title: string;
  readonly description: string;
}

/**
 * Expert Support visual: the support services as one journey. An expert badge
 * walks down the track and each step lights up as it arrives — "a partner at
 * every step". Pure CSS motion on a real ordered list, so every label stays
 * selectable text.
 *
 * The 12s cycle runs longer than 5s, so it carries a pause control (WCAG
 * 2.2.2); reduced motion shows the finished, static journey instead.
 */
@Component({
  selector: 'app-expert-journey',
  imports: [FaIconComponent],
  template: `
    <div class="journey" [class.is-paused]="paused()">
      <span class="journey__track" aria-hidden="true">
        <span class="journey__fill"></span>
        <span class="journey__expert"><fa-icon [icon]="icons.headset" /></span>
      </span>
      <ol class="journey__list" aria-label="Expert support at every step">
        @for (step of steps(); track step.title; let i = $index) {
          <li class="journey__step" [style.--i]="i">
            <span class="journey__node" aria-hidden="true"></span>
            <div class="journey__card">
              <span class="tone-icon" [attr.data-tone]="step.tone"><fa-icon [icon]="step.icon" aria-hidden="true" /></span>
              <div class="journey__text">
                <strong>{{ step.title }}</strong>
                <span>{{ step.description }}</span>
              </div>
              <span class="journey__index" aria-hidden="true">{{ (i + 1).toString().padStart(2, '0') }}</span>
            </div>
          </li>
        }
      </ol>
    </div>
    <button
      type="button"
      class="journey__toggle"
      [attr.aria-label]="paused() ? 'Play animation' : 'Pause animation'"
      (click)="paused.set(!paused())"
    >
      <fa-icon [icon]="paused() ? icons.play : icons.pause" aria-hidden="true" />
    </button>
  `,
  styleUrl: './expert-journey.component.css',
})
export class ExpertJourneyComponent {
  readonly steps = input.required<readonly JourneyStep[]>();

  protected readonly icons = { headset: faHeadset, play: faPlay, pause: faPause };
  protected readonly paused = signal(false);
}
