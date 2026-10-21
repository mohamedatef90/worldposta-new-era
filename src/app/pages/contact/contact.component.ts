import { Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faBell, faChartSimple, faClock, faCoins, faComments, faCalendarDays, faEnvelope, faFileLines, faFolder, faHeadset, faLayerGroup, faLocationDot, faPaperPlane, faPhone, faShieldHalved, faUsers } from '@fortawesome/free-solid-svg-icons';
import { SiteHeaderComponent } from '@/shared/site-header/site-header.component';
import { SiteFooterComponent } from '@/shared/site-footer/site-footer.component';

@Component({
  imports: [NgOptimizedImage, FaIconComponent, SiteHeaderComponent, SiteFooterComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class Contact {
  protected readonly icons = {
    folder: faFolder, calendar: faCalendarDays, users: faUsers, apps: faLayerGroup, shield: faShieldHalved,
    chat: faComments, chart: faChartSimple, mail: faEnvelope, file: faFileLines, cost: faCoins, phone: faPhone,
    location: faLocationDot, support: faHeadset, clock: faClock, bell: faBell, send: faPaperPlane,
  };
  protected readonly contactStatus = signal('');
  protected readonly newsletterStatus = signal('');

  protected prepareRequest(event: Event): void {
    event.preventDefault();
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.reportValidity()) return;
    const body = Array.from(new FormData(form).entries()).map(([key, value]) => key + ': ' + String(value)).join('\n');
    window.location.href = 'mailto:info@worldposta.com?subject=Contact%20request&body=' + encodeURIComponent(body);
    this.contactStatus.set('Your email app will open with your request. Send it to contact our team.');
  }

  protected subscribe(event: Event): void {
    event.preventDefault();
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.reportValidity()) return;
    const email = String(new FormData(form).get('email') ?? '');
    window.location.href = 'mailto:info@worldposta.com?subject=Newsletter%20subscription&body=' + encodeURIComponent('Please subscribe me to WorldPosta updates: ' + email);
    this.newsletterStatus.set('Send the subscription request from your email app.');
  }
}
