import { Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { SiteHeaderComponent } from '@/shared/site-header/site-header.component';
import { SiteFooterComponent } from '@/shared/site-footer/site-footer.component';

@Component({
  imports: [NgOptimizedImage, SiteHeaderComponent, SiteFooterComponent],
  templateUrl: './posta-gate.component.html',
  styleUrl: './posta-gate.component.css',
})
export class PostaGate {
  protected readonly signupStatus = signal('');
  protected requestFreePlan(event: Event): void {
    event.preventDefault();
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.reportValidity()) return;
    const data = new FormData(form);
    const body = ['Posta Gate free plan request',
      'Full name: ' + String(data.get('fullName') ?? ''),
      'Company: ' + String(data.get('company') ?? ''),
      'Work email: ' + String(data.get('email') ?? ''),
      'Phone: ' + String(data.get('phone') ?? ''),
      'Industry: ' + String(data.get('industry') ?? ''),
    ].join('\n');
    window.location.href = 'mailto:hello@worldposta.com?subject=Posta%20Gate%20Free%20Plan%20Request&body=' + encodeURIComponent(body);
    this.signupStatus.set('Your request is ready in your email app. Review and send it to request your free plan.');
  }
}
