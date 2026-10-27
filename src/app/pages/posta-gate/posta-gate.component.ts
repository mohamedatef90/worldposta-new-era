import { Component, DestroyRef, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowRight,
  faBolt,
  faBrain,
  faCheck,
  faChartColumn,
  faClock,
  faFilter,
  faGift,
  faPlug,
  faSliders,
  faUsers,
  faBoxOpen,
  faEnvelope,
  faEnvelopeCircleCheck,
  faEnvelopeOpenText,
  faGlobe,
  faLayerGroup,
  faServer,
  faVirusSlash,
  faXmark,
  faCircleQuestion,
  faFile,
  faGear,
  faInbox,
  faMagnifyingGlass,
  faPaperPlane,
  faPlus,
  faShieldHalved,
  faStar,
  faTrashCan,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faMicrosoft } from '@fortawesome/free-brands-svg-icons';
import { SiteHeaderComponent } from '@/shared/site-header/site-header.component';
import { SiteFooterComponent } from '@/shared/site-footer/site-footer.component';

@Component({
  imports: [NgOptimizedImage, FaIconComponent, SiteHeaderComponent, SiteFooterComponent],
  templateUrl: './posta-gate.component.html',
  styleUrl: './posta-gate.component.css',
})
export class PostaGate {
  protected readonly icons = {
    inbox: faInbox,
    search: faMagnifyingGlass,
    question: faCircleQuestion,
    gear: faGear,
    plus: faPlus,
    star: faStar,
    send: faPaperPlane,
    file: faFile,
    shield: faShieldHalved,
    shieldCheck: faShieldHalved,
    trash: faTrashCan,
    brain: faBrain,
    arrowRight: faArrowRight,
    warn: faTriangleExclamation,
    incoming: faEnvelopeOpenText,
    layers: faLayerGroup,
    delivered: faEnvelopeCircleCheck,
    microsoft: faMicrosoft,
    google: faGoogle,
    envelope: faEnvelope,
    server: faServer,
    virus: faVirusSlash,
    sandbox: faBoxOpen,
    globe: faGlobe,
    xmark: faXmark,
    sliders: faSliders,
    chart: faChartColumn,
    clock: faClock,
    filter: faFilter,
    users: faUsers,
    bolt: faBolt,
    plug: faPlug,
    gift: faGift,
    check: faCheck,
  };


  // Hero: gateway lane — which incoming email is passing through Posta Gate
  protected readonly gateStep = signal(0);

  // Reliable delivery: before / after inbox
  protected readonly reliableSafe = signal(false);
  private reliableTimer: ReturnType<typeof setTimeout> | undefined;
  private reliableManual = false;
  protected showReliable(safe: boolean): void {
    this.reliableManual = true;
    if (this.reliableTimer !== undefined) clearTimeout(this.reliableTimer);
    this.reliableSafe.set(safe);
  }

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const heroStage = host.querySelector('.gl-stage');
      if (heroStage && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        let heroTimer: ReturnType<typeof setInterval> | undefined;
        const heroIo = new IntersectionObserver((entries) => entries.forEach((e) => {
          if (heroTimer !== undefined) clearInterval(heroTimer);
          heroTimer = e.isIntersecting ? setInterval(() => { if (!document.hidden) this.gateStep.update((v) => (v + 1) % 4); }, 2200) : undefined;
        }), { threshold: 0.2 });
        heroIo.observe(heroStage);
        destroyRef.onDestroy(() => { heroIo.disconnect(); if (heroTimer !== undefined) clearInterval(heroTimer); });
      }
      const box = host.querySelector('.rl-ba');
      if (!box) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { this.reliableSafe.set(true); return; }
      const stop = () => { if (this.reliableTimer !== undefined) clearTimeout(this.reliableTimer); this.reliableTimer = undefined; };
      const step = () => {
        this.reliableSafe.update(v => !v);
        this.reliableTimer = setTimeout(step, this.reliableSafe() ? 4200 : 2800);
      };
      const io = new IntersectionObserver((entries) => entries.forEach((e) => {
        stop();
        if (e.isIntersecting && !this.reliableManual) this.reliableTimer = setTimeout(step, this.reliableSafe() ? 4200 : 2800);
      }), { threshold: 0.35 });
      io.observe(box);
      destroyRef.onDestroy(() => { io.disconnect(); stop(); });
    });
  }

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
