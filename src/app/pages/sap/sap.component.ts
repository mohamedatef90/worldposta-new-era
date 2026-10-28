import { SiteFooterComponent } from '@/shared/site-footer/site-footer.component';
import { Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { SiteHeaderComponent } from '@/shared/site-header/site-header.component';
import { MainNavLinksComponent } from '@/shared/main-nav-links/main-nav-links.component';
import { SapArchitectureComponent } from './sap-architecture/sap-architecture.component';
import { SapOpsBoardComponent } from './sap-ops-board/sap-ops-board.component';
import { ThemeService } from '@/shared/services/theme.service';

import { PageJumpNavComponent } from '@/shared/page-jump-nav/page-jump-nav.component';
@Component({
  imports: [PageJumpNavComponent, SiteFooterComponent, NgOptimizedImage, SiteHeaderComponent, MainNavLinksComponent, SapArchitectureComponent, SapOpsBoardComponent],
  templateUrl: './sap.component.html',
  styleUrl: './sap.component.css',
})
export class Sap {
  private readonly theme = inject(ThemeService);

  /*
   * The Services photo (a Magnific concept scene) carries the page's own SAP
   * Operations Center board on its laptop, composited onto the screen, in the
   * board theme that matches the site's. No SAP UI or logo.
   */
  protected readonly servicesPhoto = computed(() => `/worldposta-assets/sap/sap-services-console-${this.theme.isDark() ? 'dark' : 'light'}.avif`);

  protected readonly enquiryStatus = signal('');
  protected submitEnquiry(event: Event): void {
    event.preventDefault();
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.reportValidity()) return;
    const data = new FormData(form);
    const body = [
      'SAP consultation request',
      'First name: ' + String(data.get('firstName') ?? ''),
      'Last name: ' + String(data.get('lastName') ?? ''),
      'Business email: ' + String(data.get('email') ?? ''),
      'Company: ' + String(data.get('company') ?? ''),
      'Phone: ' + String(data.get('phone') ?? ''),
      'Country: ' + String(data.get('country') ?? ''),
      'Service: ' + String(data.get('service') ?? ''),
      'Permission to contact regarding this enquiry: Yes',
      '', 'Additional details:', String(data.get('details') ?? ''),
    ].join('\n');
    window.location.href = 'mailto:hello@worldposta.com?subject=SAP%20Consultation%20Request&body=' + encodeURIComponent(body);
    this.enquiryStatus.set('Your request is ready in your email app. Review and send it to complete your enquiry.');
  }
}


