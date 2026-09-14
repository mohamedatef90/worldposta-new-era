import { Component } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowRight,
  faArrowsUpDownLeftRight,
  faChartColumn,
  faCloud,
  faCoins,
  faDatabase,
  faGears,
  faGlobe,
  faHeadset,
  faLock,
  faPeopleGroup,
  faShieldHalved,
  faStar,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface ChallengePair {
  readonly challenge: { readonly icon: IconDefinition; readonly title: string; readonly description: string };
  readonly solution: { readonly icon: IconDefinition; readonly title: string; readonly description: string };
  readonly tone: 'rose' | 'purple' | 'amber' | 'indigo' | 'pink';
}

interface ProofPoint {
  readonly icon: IconDefinition;
  readonly tone: 'blue' | 'green' | 'purple' | 'amber';
  readonly value: string;
  readonly label: string;
  readonly note: string;
}

@Component({
  selector: 'app-why-worldposta',
  imports: [FaIconComponent],
  templateUrl: './why-worldposta.component.html',
  styleUrl: './why-worldposta.component.css',
})
export class WhyWorldpostaComponent {
  protected readonly arrowRight = faArrowRight;

  /**
   * Each row is a problem answered by what we do about it. The pairing is the
   * point, so the two sit in one row rather than in two independent lists.
   */
  protected readonly pairs: readonly ChallengePair[] = [
    {
      tone: 'rose',
      challenge: {
        icon: faCoins,
        title: 'Rising cloud costs',
        description: 'Unpredictable spending and lack of cost visibility.',
      },
      solution: {
        icon: faDatabase,
        title: 'Cost optimization',
        description: 'Transparent pricing and right-sized solutions to maximize your ROI.',
      },
    },
    {
      tone: 'purple',
      challenge: {
        icon: faShieldHalved,
        title: 'Security and compliance concerns',
        description: 'Protecting data and meeting industry regulations is complex.',
      },
      solution: {
        icon: faLock,
        title: 'Enterprise-grade security',
        description: 'Built-in security, global compliance and 24/7 monitoring for your peace of mind.',
      },
    },
    {
      tone: 'amber',
      challenge: {
        icon: faArrowsUpDownLeftRight,
        title: 'Need for scalability',
        description: "Your business needs to move fast, but infrastructure can't keep up.",
      },
      solution: {
        icon: faChartColumn,
        title: 'Scalable infrastructure',
        description: 'Flexible, on-demand resources to support your growth — anytime, anywhere.',
      },
    },
    {
      tone: 'indigo',
      challenge: {
        icon: faGears,
        title: 'Need for more control',
        description: 'Not all workloads are suited for the public cloud.',
      },
      solution: {
        icon: faCloud,
        title: 'Private Cloud solutions',
        description: 'Secure, dedicated infrastructure giving you full control, performance and flexibility.',
      },
    },
    {
      tone: 'pink',
      challenge: {
        icon: faUsers,
        title: 'Lack of cloud expertise',
        description: 'Finding the right skills and guidance can slow down your journey.',
      },
      solution: {
        icon: faHeadset,
        title: 'A trusted partner',
        description: 'Our experts are with you every step of the way — from strategy to operations.',
      },
    },
  ];

  protected readonly proof: readonly ProofPoint[] = [
    { icon: faGlobe, tone: 'blue', value: '35+', label: 'Global Regions', note: 'Local presence. Global reach.' },
    { icon: faPeopleGroup, tone: 'green', value: '500+', label: 'Enterprise Customers', note: 'Across industries worldwide.' },
    { icon: faShieldHalved, tone: 'purple', value: '99.99%', label: 'Service Uptime', note: "Because your business can't wait." },
    { icon: faStar, tone: 'green', value: 'Trusted Partner', label: 'For a Smarter Cloud Future', note: 'More than a provider — a partner in your success.' },
  ];
}
