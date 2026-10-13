import { SiteFooterComponent } from '@/shared/site-footer/site-footer.component';
import { Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { SiteHeaderComponent } from '@/shared/site-header/site-header.component';
import { MainNavLinksComponent } from '@/shared/main-nav-links/main-nav-links.component';

@Component({
  imports: [SiteFooterComponent, NgOptimizedImage, SiteHeaderComponent, MainNavLinksComponent],
  templateUrl: './wpsys.component.html',
  styleUrl: './wpsys.component.css',
})
export class Wpsys {
  protected readonly contactStatus = signal('');
  protected submitContact(event: Event): void {
    event.preventDefault();
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.reportValidity()) return;
    const data = new FormData(form);
    const body = ['WPSYS consultation request',
      'Name: ' + String(data.get('fullName') ?? ''),
      'Work email: ' + String(data.get('email') ?? ''),
      'Company: ' + String(data.get('company') ?? ''),
      'Phone: ' + String(data.get('phone') ?? ''),
      'Industry: ' + String(data.get('industry') ?? ''),
      'Service: ' + String(data.get('service') ?? ''),
    ].join('\n');
    window.location.href = 'mailto:hello@worldposta.com?subject=WPSYS%20Consultation%20Request&body=' + encodeURIComponent(body);
    this.contactStatus.set('Your enquiry is ready in your email app. Review and send it to contact our team.');
  }
}

