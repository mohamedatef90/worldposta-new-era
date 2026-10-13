import { SiteFooterComponent } from '@/shared/site-footer/site-footer.component';
import { Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { SiteHeaderComponent } from '@/shared/site-header/site-header.component';
import { MainNavLinksComponent } from '@/shared/main-nav-links/main-nav-links.component';

@Component({
  imports: [SiteFooterComponent, NgOptimizedImage, SiteHeaderComponent, MainNavLinksComponent],
  templateUrl: './link.component.html',
  styleUrl: './link.component.css',
})
export class PostaLink {
  protected readonly videoNotice = signal('');
  protected readonly trialStatus = signal('');
  protected submitTrial(event: Event): void {
    event.preventDefault();
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.reportValidity()) return;
    const data = new FormData(form);
    const body = ['Posta Link free trial request',
      'Name: ' + String(data.get('fullName') ?? ''),
      'Company: ' + String(data.get('company') ?? ''),
      'Work email: ' + String(data.get('email') ?? ''),
      'Phone: ' + String(data.get('phone') ?? ''),
      'Industry: ' + String(data.get('industry') ?? ''),
      'Team size: ' + String(data.get('teamSize') ?? ''),
    ].join('\n');
    window.location.href = 'mailto:hello@worldposta.com?subject=Posta%20Link%20Free%20Trial&body=' + encodeURIComponent(body);
    this.trialStatus.set('Your trial request is ready in your email app. Review and send it to contact our team.');
  }
  protected watchVideo(): void {
    window.location.href = 'mailto:hello@worldposta.com?subject=Posta%20Link%20Product%20Demo';
    this.videoNotice.set('Your email app will open. Send your demo request to arrange a product walkthrough.');
  }
}
