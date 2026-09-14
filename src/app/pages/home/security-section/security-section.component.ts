import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowRight,
  faEye,
  faFileShield,
  faPeopleGroup,
  faServer,
  faShareNodes,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface SecurityPillar {
  readonly icon: IconDefinition;
  readonly tone: 'blue' | 'green' | 'purple' | 'amber' | 'rose';
  readonly title: string;
  readonly description: string;
}

/**
 * A security partner. `src` is set only where we hold the mark; the rest fall
 * back to a wordmark so the strip is complete without inventing a logo.
 */
interface SecurityPartner {
  readonly name: string;
  readonly src?: string;
  readonly width?: number;
  readonly height?: number;
  /** Near-black marks need lifting on the dark panel, as VMware does elsewhere. */
  readonly invertOnDark?: boolean;
}

@Component({
  selector: 'app-security-section',
  imports: [FaIconComponent, NgOptimizedImage],
  templateUrl: './security-section.component.html',
  styleUrl: './security-section.component.css',
})
export class SecuritySectionComponent {
  protected readonly arrowRight = faArrowRight;

  protected readonly pillars: readonly SecurityPillar[] = [
    {
      icon: faShieldHalved,
      tone: 'blue',
      title: 'Leading Security Vendors',
      description: 'We partner with industry leaders like Fortinet, Palo Alto Networks, F5 and more.',
    },
    {
      icon: faServer,
      tone: 'green',
      title: 'Dedicated & Isolated Environments',
      description: 'Dedicated firewalls, dedicated IPs and isolated cloud instances for greater control.',
    },
    {
      icon: faEye,
      tone: 'purple',
      title: '24/7 SOC Monitoring',
      description: 'Continuous monitoring, threat detection and rapid incident response by our security experts.',
    },
    {
      icon: faFileShield,
      tone: 'amber',
      title: 'Compliance & Governance',
      description: 'Support for ISO, SOC, GDPR and industry regulations to keep your business compliant.',
    },
    {
      icon: faShareNodes,
      tone: 'rose',
      title: 'Secure Across Environments',
      description: 'Consistent security for public cloud, private cloud and on-premise infrastructure.',
    },
    {
      icon: faPeopleGroup,
      tone: 'green',
      title: 'Expert Support',
      description: 'A dedicated team to guide you at every step — from design to daily operations.',
    },
  ];

  /**
   * Marks are Simple Icons paths in each brand's own colour, cropped to their
   * ink so max-height sizes the logo rather than its padding.
   *
   * CrowdStrike and Tenable have no Simple Icons entry, so they keep the
   * wordmark fallback until their SVGs are dropped into `partners/`.
   */
  protected readonly partners: readonly SecurityPartner[] = [
    { name: 'Fortinet', src: '/worldposta-assets/brand-logos/partners/fortinet.svg', width: 50, height: 36 },
    { name: 'Palo Alto Networks', src: '/worldposta-assets/brand-logos/partners/paloalto.svg', width: 50, height: 36 },
    { name: 'F5', src: '/worldposta-assets/brand-logos/partners/f5.svg', width: 36, height: 36 },
    { name: 'CrowdStrike' },
    { name: 'Splunk', src: '/worldposta-assets/brand-logos/partners/splunk.svg', width: 108, height: 32, invertOnDark: true },
    { name: 'Tenable' },
  ];
}
