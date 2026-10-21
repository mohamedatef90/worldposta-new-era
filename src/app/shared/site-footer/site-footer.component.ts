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
    { title: 'Cloud & Operations', links: [
      { label: 'CloudEdge', href: '/cloudedge' },
      { label: 'SAP Cloud Operations', href: '/sap' },
      { label: 'SAP Basis Operations', href: '/sap-basis-operations' },
      { label: 'Seamless Migration', href: '/seamless-migration' },
      { label: 'WPSYS Managed IT', href: '/wpsys' },
      { label: 'IT Automation', href: '/it-software-automation-tools' },
    ] },
    { title: 'Email & Collaboration', links: [
      { label: 'Posta Business Email', href: '/posta' },
      { label: 'CloudSpace', href: '/cloudspace' },
      { label: 'Posta Link', href: '/link' },
      { label: 'Posta Drive', href: '/drive' },
      { label: 'Posta Portal', href: '/posta-portal' },
    ] },
    { title: 'Explore WorldPosta', links: [
      { label: 'Our Story', href: '/our-story' },
      { label: 'Cloud SOC', href: '/cloud-based-soc-solutions' },
      { label: 'Posta Gate Security', href: '/posta-gate-security' },
      { label: 'Cloud Pricing', href: '/cloudedge#pricing' },
      { label: 'Email Pricing', href: '/posta#pricing' },
      { label: 'Guides & Resources', href: '/posta#resources' },
    ] },
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
