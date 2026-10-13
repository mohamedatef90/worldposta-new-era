import { SiteFooterComponent } from '@/shared/site-footer/site-footer.component';
import { Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { SiteHeaderComponent } from '@/shared/site-header/site-header.component';
import { MainNavLinksComponent } from '@/shared/main-nav-links/main-nav-links.component';
@Component({
  imports: [SiteFooterComponent, NgOptimizedImage, SiteHeaderComponent, MainNavLinksComponent],
  templateUrl: './sap-basis-operations.component.html',
  styleUrl: './sap-basis-operations.component.css',
})
export class SapBasisOperations {
  protected readonly consultationStatus = signal('');
  protected submitConsultation(event: Event): void {
    event.preventDefault();
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.reportValidity()) return;
    const data = new FormData(form);
    const body = ['SAP Basis consultation request',
      'Name: ' + String(data.get('fullName') ?? ''),
      'Company: ' + String(data.get('company') ?? ''),
      'Work email: ' + String(data.get('email') ?? ''),
      'Phone: ' + String(data.get('countryCode') ?? '') + ' ' + String(data.get('phone') ?? ''),
      'Industry: ' + String(data.get('industry') ?? ''),
      'SAP system size: ' + String(data.get('systemSize') ?? ''),
      'Requirements: ' + String(data.get('requirements') ?? ''),
    ].join('\n');
    window.location.href = 'mailto:hello@worldposta.com?subject=SAP%20Basis%20Consultation%20Request&body=' + encodeURIComponent(body);
    this.consultationStatus.set('Your enquiry is ready in your email app. Review and send it to contact our SAP team.');
  }
}

