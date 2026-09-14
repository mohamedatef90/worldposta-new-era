import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowRight,
  faEnvelope,
  faGlobe,
  faHeadset,
  faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface FooterColumn {
  readonly title: string;
  readonly links: readonly { readonly label: string; readonly href: string }[];
}

interface ContactLine {
  readonly icon: IconDefinition;
  readonly label: string;
}

/**
 * Site footer.
 *
 * No mockup was supplied for this one, so the columns mirror the header's own
 * navigation and the product groups already listed in the One Platform
 * section — nothing here names a product the site does not.
 */
@Component({
  selector: 'app-site-footer',
  imports: [FaIconComponent, NgOptimizedImage],
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.css',
})
export class SiteFooterComponent {
  protected readonly arrowRight = faArrowRight;

  protected readonly columns: readonly FooterColumn[] = [
    {
      title: 'Cloud & Infrastructure',
      links: [
        { label: 'Cloud Infrastructure', href: '#cloud-infrastructure' },
        { label: 'Virtual Machines', href: '#virtual-machines' },
        { label: 'Kubernetes', href: '#kubernetes' },
        { label: 'Storage', href: '#storage' },
        { label: 'Networking', href: '#networking' },
        { label: 'Backup & DR', href: '#backup-dr' },
      ],
    },
    {
      title: 'Collaboration',
      links: [
        { label: 'Business Email', href: '#business-email' },
        { label: 'Team Chat', href: '#team-chat' },
        { label: 'Conferencing', href: '#conferencing' },
        { label: 'Calendar', href: '#calendar' },
        { label: 'Drive & Files', href: '#drive-files' },
        { label: 'Notes', href: '#notes' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'Why WorldPosta', href: '#why-worldposta' },
        { label: 'Security', href: '#security' },
        { label: 'Compare Providers', href: '#compare' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Service Provider', href: '#service-provider' },
        { label: 'Resources', href: '#resources' },
      ],
    },
  ];

  protected readonly contact: readonly ContactLine[] = [
    { icon: faHeadset, label: '24/7 expert support' },
    { icon: faEnvelope, label: 'hello@worldposta.com' },
    { icon: faLocationDot, label: '35+ global regions' },
    { icon: faGlobe, label: 'worldposta.com' },
  ];

  protected readonly legal: readonly { readonly label: string; readonly href: string }[] = [
    { label: 'Privacy Policy', href: '#privacy' },
    { label: 'Terms of Service', href: '#terms' },
    { label: 'Cookie Settings', href: '#cookies' },
    { label: 'Status', href: '#status' },
  ];

  /**
   * Rendered rather than hardcoded so the notice does not quietly go stale.
   * `Date` is read here, not in the template, where globals are unavailable.
   */
  protected readonly year = new Date().getFullYear();
}
