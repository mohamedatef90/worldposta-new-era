import { Component, computed, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowRight,
  faClock,
  faCloud,
  faGlobe,
  faMessage,
  faServer,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { ThemeService } from '@/shared/services/theme.service';

interface Assurance {
  readonly icon: IconDefinition;
  readonly tone: 'blue' | 'green' | 'purple';
  readonly title: string;
  readonly description: string;
}

/** A capability chip orbiting the cloud mark. */
interface OrbitChip {
  readonly icon: IconDefinition;
  readonly tone: 'blue' | 'green' | 'amber' | 'indigo';
  readonly label: string;
  /** Which corner it sits in. */
  readonly place: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

@Component({
  selector: 'app-get-started',
  imports: [FaIconComponent, NgOptimizedImage],
  templateUrl: './get-started.component.html',
  styleUrl: './get-started.component.css',
})
export class GetStartedComponent {
  protected readonly arrowRight = faArrowRight;

  private readonly theme = inject(ThemeService);

  /**
   * The mark ships as a light/dark pair: the navy half of the symbol all but
   * disappears on the dark band, so that half goes pale while the green holds.
   */
  protected readonly symbol = computed(() =>
    this.theme.isDark()
      ? '/worldposta-assets/brand-logos/wp-symbol-light.svg'
      : '/worldposta-assets/brand-logos/wp-symbol.svg',
  );

  protected readonly assurances: readonly Assurance[] = [
    {
      icon: faMessage,
      tone: 'blue',
      title: 'Expert Guidance',
      description: 'From consultation to deployment',
    },
    {
      icon: faClock,
      tone: 'green',
      title: 'Fast Response',
      description: 'Get answers when you need them',
    },
    {
      icon: faShieldHalved,
      tone: 'purple',
      title: 'Tailored Solutions',
      description: 'Built around your goals',
    },
  ];

  protected readonly chips: readonly OrbitChip[] = [
    { icon: faCloud, tone: 'blue', label: 'Cloud Infrastructure', place: 'top-left' },
    { icon: faServer, tone: 'indigo', label: 'Private Cloud', place: 'top-right' },
    { icon: faShieldHalved, tone: 'green', label: 'Security & Compliance', place: 'bottom-left' },
    { icon: faGlobe, tone: 'amber', label: 'Global Connectivity', place: 'bottom-right' },
  ];
}
