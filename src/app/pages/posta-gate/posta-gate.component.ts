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
      const signupSection = host.querySelector('#start-free');
      if (signupSection && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const motionObserver = new IntersectionObserver(entries => {
          for (const entry of entries) signupSection.classList.toggle('is-motion-visible', entry.isIntersecting);
        }, { threshold: 0.2 });
        motionObserver.observe(signupSection);
        destroyRef.onDestroy(() => motionObserver.disconnect());
      }
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

}
