import { Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { SiteHeaderComponent } from '@/shared/site-header/site-header.component';
import { SiteFooterComponent } from '@/shared/site-footer/site-footer.component';

@Component({
  imports: [NgOptimizedImage, SiteHeaderComponent, SiteFooterComponent],
  templateUrl: './our-story.component.html',
  styleUrl: './our-story.component.css',
})
export class OurStory {
  protected readonly consultationStatus = signal('');

  protected requestConsultation(event: Event): void {
    event.preventDefault();
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.reportValidity()) return;
    const data = new FormData(form);
    const body = [
      'WorldPosta consultation request',
      'Full name: ' + String(data.get('fullName') ?? ''),
      'Company: ' + String(data.get('company') ?? ''),
      'Business email: ' + String(data.get('email') ?? ''),
      'Phone: ' + String(data.get('phone') ?? ''),
      '',
      String(data.get('message') ?? ''),
    ].join('\n');
    window.location.href = 'mailto:hello@worldposta.com?subject=WorldPosta%20Consultation%20Request&body=' + encodeURIComponent(body);
    this.consultationStatus.set('Your enquiry is ready in your email app. Review and send it to request your consultation.');
  }
}
