import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowRight,
  faChartColumn,
  faCheck,
  faDollarSign,
  faGears,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface Provider {
  readonly name: string;
  readonly logo?: string;
  /** Intrinsic ratio of the cropped mark, for NgOptimizedImage. */
  readonly width?: number;
  readonly height?: number;
  readonly us?: boolean;
}

interface ComparisonRow {
  readonly feature: string;
  /** One entry per provider, in the same order. */
  readonly has: readonly boolean[];
}

interface ComparisonNote {
  readonly icon: IconDefinition;
  readonly tone: 'blue' | 'green' | 'purple' | 'amber';
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-provider-comparison',
  imports: [FaIconComponent, NgOptimizedImage],
  templateUrl: './provider-comparison.component.html',
  styleUrl: './provider-comparison.component.css',
})
export class ProviderComparisonComponent {
  protected readonly arrowRight = faArrowRight;
  protected readonly check = faCheck;

  protected readonly providers: readonly Provider[] = [
    { name: 'WorldPosta', logo: '/worldposta-assets/WP-Logo.avif', width: 120, height: 31, us: true },
    { name: 'AWS', logo: '/worldposta-assets/brand-logos/providers/aws.svg', width: 60, height: 36 },
    { name: 'Microsoft Azure', logo: '/worldposta-assets/brand-logos/providers/azure.svg', width: 38, height: 36 },
    { name: 'Google Cloud', logo: '/worldposta-assets/brand-logos/providers/google-cloud.svg', width: 45, height: 36 },
  ];

  protected readonly rows: readonly ComparisonRow[] = [
    { feature: 'Pricing Flexibility', has: [true, true, true, true] },
    { feature: 'Local Support', has: [true, false, false, false] },
    { feature: 'Data Residency', has: [true, true, true, true] },
    { feature: 'Security & Compliance', has: [true, true, true, true] },
    { feature: 'Hybrid & On-Prem Options', has: [true, true, true, true] },
    { feature: 'Dedicated Resources', has: [true, false, false, false] },
  ];

  protected readonly notes: readonly ComparisonNote[] = [
    {
      icon: faChartColumn,
      tone: 'blue',
      title: 'Compare Key Features',
      description: 'See the differences that matter to your business.',
    },
    {
      icon: faDollarSign,
      tone: 'green',
      title: 'Evaluate Total Cost',
      description: 'Make informed decisions with transparent pricing.',
    },
    {
      icon: faShieldHalved,
      tone: 'purple',
      title: 'Check Compliance',
      description: 'Find the right fit for your industry requirements.',
    },
    {
      icon: faGears,
      tone: 'amber',
      title: 'Choose with Confidence',
      description: 'Get the insights you need in one place.',
    },
  ];
}
