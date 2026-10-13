import { Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { SiteHeaderComponent } from '@/shared/site-header/site-header.component';
import { MainNavLinksComponent } from '@/shared/main-nav-links/main-nav-links.component';
@Component({
  imports: [NgOptimizedImage, SiteHeaderComponent, MainNavLinksComponent],
  templateUrl: './drive.component.html',
  styleUrl: './drive.component.css',
})
export class Drive {
  protected readonly trialStatus = signal('');
  protected submitTrial(event: Event): void {
    event.preventDefault();
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.reportValidity()) return;
    const data = new FormData(form);
    const body = ['Drive free trial request',
      'Name: ' + String(data.get('fullName') ?? ''),
      'Company: ' + String(data.get('company') ?? ''),
      'Work email: ' + String(data.get('email') ?? ''),
      'Phone: ' + String(data.get('countryCode') ?? '') + ' ' + String(data.get('phone') ?? ''),
      'Job title: ' + String(data.get('jobTitle') ?? ''),
      'Team size: ' + String(data.get('teamSize') ?? ''),
      'Purpose: ' + String(data.get('purpose') ?? ''),
    ].join('\n');
    window.location.href = 'mailto:hello@worldposta.com?subject=Drive%20Free%20Trial%20Request&body=' + encodeURIComponent(body);
    this.trialStatus.set('Your trial request is ready in your email app. Review and send it to contact our team.');
  }
}


