import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowRight,
  faClipboardCheck,
  faCoins,
  faCreditCard,
  faDatabase,
  faGlobe,
  faHeadset,
  faLock,
  faServer,
  faShieldHalved,
  faUserShield,
} from '@fortawesome/free-solid-svg-icons';

interface Metric {
  readonly icon: IconDefinition;
  readonly value: string;
  readonly label: string;
  readonly description: string;
  readonly tone: 'green' | 'blue' | 'purple';
}

/**
 * A real brand mark. Every logo sits on a fixed-colour plate so the brand
 * colours stay true regardless of theme — see `.logo-plate` in the stylesheet.
 */
interface BrandLogo {
  readonly name: string;
  readonly src: string;
  /** Intrinsic size of the asset; keeps NgOptimizedImage's aspect-ratio check happy. */
  readonly width: number;
  readonly height: number;
}

/** Partners are the same, except Oracle has no logo file yet (see README note). */
type PartnerLogo = BrandLogo | { readonly name: string; readonly src?: undefined };

interface Certification {
  readonly label: string;
  readonly detail: string;
  readonly tone: 'green' | 'blue' | 'purple';
  /** Shown while no `mark` is available — representative, never a stand-in badge. */
  readonly icon: IconDefinition;
  /**
   * The mark issued by the body that certified us. Optional because these are
   * restricted trademarks we cannot self-generate: an ISO 27001 claim is carried
   * by the certification body's mark (BSI, TUV, SGS, DNV, …) plus a certificate
   * number, PCI SSC and AICPA licence their marks, and GDPR has no official mark
   * at all. Drop the real file in `brand-logos/certifications/` and set this.
   */
  readonly mark?: { readonly src: string; readonly width: number; readonly height: number };
}

@Component({
  selector: 'app-performance-trust',
  imports: [FaIconComponent, NgOptimizedImage],
  templateUrl: './performance-trust.component.html',
  styleUrl: './performance-trust.component.css',
})
export class PerformanceTrustComponent {
  protected readonly icons = { arrowRight: faArrowRight };

  protected readonly metrics: readonly Metric[] = [
    { icon: faShieldHalved, value: '99.99%', label: 'SLA Uptime', description: 'Reliable. Always on.', tone: 'green' },
    { icon: faGlobe, value: '35', label: 'Availability Zones', description: 'Global coverage.', tone: 'blue' },
    { icon: faHeadset, value: '24/7', label: 'Expert Support', description: 'Real people. Real answers.', tone: 'purple' },
    { icon: faCoins, value: 'Up to 50%', label: 'Lower Costs', description: 'Enterprise-grade cloud at a fraction of the cost.', tone: 'green' },
    { icon: faLock, value: '30+', label: 'Security Engines', description: 'Multi-layer protection for your business.', tone: 'blue' },
    { icon: faServer, value: '24 TB', label: 'Memory per VM', description: 'High-performance infrastructure.', tone: 'purple' },
  ];

  protected readonly customerLogos: readonly BrandLogo[] = [
    { name: 'BBVA', src: 'customers/bbva.avif', width: 214, height: 64 },
    { name: 'DFM', src: 'customers/dfm.avif', width: 140, height: 64 },
    { name: 'LSEG', src: 'customers/lseg.avif', width: 148, height: 64 },
    { name: 'KBC', src: 'customers/kbc.avif', width: 81, height: 64 },
    { name: 'ITV', src: 'customers/itv.avif', width: 128, height: 64 },
    { name: 'Iberia', src: 'customers/iberia.avif', width: 288, height: 64 },
    { name: 'First Abu Dhabi Bank', src: 'customers/fab.avif', width: 109, height: 64 },
    { name: 'Ferrovial', src: 'customers/ferrovial.avif', width: 114, height: 64 },
    { name: 'Michelin', src: 'customers/michelin.avif', width: 114, height: 64 },
  ];

  protected readonly certifications: readonly Certification[] = [
    { label: 'ISO 27001', detail: 'Information Security', tone: 'blue', icon: faShieldHalved },
    { label: 'PCI DSS', detail: 'Payment Card Industry', tone: 'green', icon: faCreditCard },
    { label: 'SOC 2', detail: 'Type II Compliant', tone: 'blue', icon: faClipboardCheck },
    { label: 'GDPR', detail: 'Data Protection', tone: 'purple', icon: faUserShield },
  ];

  protected readonly partnerLogos: readonly PartnerLogo[] = [
    { name: 'Microsoft', src: 'partners/microsoft.svg', width: 36, height: 36 },
    { name: 'VMware', src: 'partners/vmware.svg', width: 82, height: 13 },
    { name: 'SAP', src: 'partners/sap.svg', width: 73, height: 36 },
    { name: 'Fortinet', src: 'partners/fortinet.svg', width: 50, height: 36 },
    { name: 'Dell Technologies', src: 'partners/dell.svg', width: 36, height: 36 },
    { name: 'Oracle', src: 'partners/oracle.svg', width: 231, height: 30 },
  ];

  /** Every logo path is relative to this folder. */
  protected readonly logoBase = '/worldposta-assets/brand-logos/';

  protected readonly databaseIcon = faDatabase;
}
