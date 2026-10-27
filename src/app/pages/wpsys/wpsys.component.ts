import { SiteFooterComponent } from '@/shared/site-footer/site-footer.component';
import { Component, DestroyRef, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowRight, faBolt, faChartLine, faEye, faHeadset, faMagnifyingGlass, faServer, faShieldHalved, faUsers } from '@fortawesome/free-solid-svg-icons';
import { SiteHeaderComponent } from '@/shared/site-header/site-header.component';
import { MainNavLinksComponent } from '@/shared/main-nav-links/main-nav-links.component';

@Component({
  imports: [SiteFooterComponent, NgOptimizedImage, FaIconComponent, SiteHeaderComponent, MainNavLinksComponent],
  templateUrl: './wpsys.component.html',
  styleUrl: './wpsys.component.css',
})
export class Wpsys {
  protected readonly icons = {
    arrowRight: faArrowRight, server: faServer, shield: faShieldHalved, chart: faChartLine,
    eye: faEye, search: faMagnifyingGlass, bolt: faBolt, headset: faHeadset, users: faUsers,
  };

  // Hero: the three outcome cards light up in turn while the hero is on screen.
  protected readonly heroStep = signal(0);

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const hero = host.querySelector('.wx-hero');
      if (!hero) return;
      let timer: ReturnType<typeof setInterval> | undefined;
      const stop = () => { if (timer !== undefined) { clearInterval(timer); timer = undefined; } };
      const io = new IntersectionObserver(([e]) => {
        stop();
        if (e.isIntersecting) timer = setInterval(() => this.heroStep.update(s => (s + 1) % 3), 2600);
      }, { threshold: 0.25 });
      io.observe(hero);
      destroyRef.onDestroy(() => { io.disconnect(); stop(); });
    });
  }

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

