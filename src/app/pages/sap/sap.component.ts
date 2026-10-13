import { SiteFooterComponent } from '@/shared/site-footer/site-footer.component';
import { Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { SiteHeaderComponent } from '@/shared/site-header/site-header.component';
import { MainNavLinksComponent } from '@/shared/main-nav-links/main-nav-links.component';

@Component({
  imports: [SiteFooterComponent, NgOptimizedImage, SiteHeaderComponent, MainNavLinksComponent],
  templateUrl: './sap.component.html',
  styleUrl: './sap.component.css',
})
export class Sap {
  protected readonly enquiryStatus = signal('');
  protected readonly closingEnquiryStatus = signal('');
  protected submitEnquiry(event: Event, closing = false): void {
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
    (closing ? this.closingEnquiryStatus : this.enquiryStatus).set('Your request is ready in your email app. Review and send it to complete your enquiry.');
  }
}


