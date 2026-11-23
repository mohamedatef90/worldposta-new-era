import { SiteFooterComponent } from '@/shared/site-footer/site-footer.component';
import { NgOptimizedImage } from '@angular/common';
import { Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { SiteHeaderComponent } from '@/shared/site-header/site-header.component';
import { MainNavLinksComponent } from '@/shared/main-nav-links/main-nav-links.component';

import { LkHeroVisualComponent } from './visuals/lk-hero-visual.component';
import { LkBenefitsVisualComponent } from './visuals/lk-benefits-visual.component';
import { LkWorkflowVisualComponent } from './visuals/lk-workflow-visual.component';
import { LkTrialVisualComponent } from './visuals/lk-trial-visual.component';
import { LkDemoVisualComponent } from './visuals/lk-demo-visual.component';
import { LkFinalVisualComponent } from './visuals/lk-final-visual.component';
import { PageJumpNavComponent } from '@/shared/page-jump-nav/page-jump-nav.component';
@Component({
  imports: [NgOptimizedImage, LkDemoVisualComponent, LkFinalVisualComponent, LkTrialVisualComponent, LkWorkflowVisualComponent, LkBenefitsVisualComponent, LkHeroVisualComponent, PageJumpNavComponent, SiteFooterComponent, SiteHeaderComponent, MainNavLinksComponent],
  templateUrl: './link.component.html',
  styleUrl: './link.component.css',
})
export class PostaLink {
  /**
   * The three pinned cities on the stories map (centres of the pulse dots), in
   * the map image's own pixels and west to east, so the pixel waves fire along
   * the arcs.
   */
  protected readonly storyPins = [[434, 164], [809, 254], [1174, 280]] as const;

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
    window.location.href = 'mailto:support@worldposta.com?subject=Posta%20Link%20Free%20Trial&body=' + encodeURIComponent(body);
    this.trialStatus.set('Your trial request is ready in your email app. Review and send it to contact our team.');
  }
  protected watchVideo(): void {
    window.location.href = 'mailto:support@worldposta.com?subject=Posta%20Link%20Product%20Demo';
    this.videoNotice.set('Your email app will open. Send your demo request to arrange a product walkthrough.');
  }
  // Product video (See Posta Link in Action)
  private readonly demoDialog = viewChild<ElementRef<HTMLDialogElement>>('demoDialog');
  private readonly demoVideo = viewChild<ElementRef<HTMLVideoElement>>('demoVideo');
  protected openVideo(): void {
    const dialog = this.demoDialog()?.nativeElement;
    const video = this.demoVideo()?.nativeElement;
    if (!dialog || !video) return;
    if (!dialog.open) dialog.showModal();
    video.currentTime = 0;
    video.play().catch(() => { /* autoplay blocked: the visitor can press play */ });
  }
  protected closeVideo(): void { this.demoDialog()?.nativeElement.close(); }
  protected onVideoClosed(): void { this.demoVideo()?.nativeElement.pause(); }
  protected onDialogClick(event: MouseEvent): void {
    if (event.target === this.demoDialog()?.nativeElement) this.closeVideo();
  }

  // Benefits: spotlight hub
  protected readonly benefitStep = signal(0);
  protected benefitHover = false;
  protected pickBenefit(i: number): void { this.benefitStep.set(i); }

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.cycle(host.querySelector('lk-benefits-visual'), destroyRef, reduce, 2400, () => this.benefitHover, () => this.benefitStep.update((v) => (v + 1) % 6));
      this.initLiveTiles(host.querySelector('.link-hero'), destroyRef, reduce);
      this.initTilt(host.querySelector('.link-final'), host.querySelector('.final-device-art .lk-tilt'), destroyRef, reduce);
    });
  }

  private watch(el: Element, destroyRef: DestroyRef, cb: (visible: boolean) => void): void {
    if (!('IntersectionObserver' in window)) { cb(true); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => cb(e.isIntersecting)), { threshold: 0.2 });
    io.observe(el);
    destroyRef.onDestroy(() => io.disconnect());
  }

  private cycle(el: Element | null, destroyRef: DestroyRef, reduce: boolean, ms: number, paused: () => boolean, next: () => void): void {
    if (!el || reduce) return;
    let timer = 0;
    const stop = () => { window.clearInterval(timer); timer = 0; };
    this.watch(el, destroyRef, (visible) => {
      stop();
      if (visible) timer = window.setInterval(() => { if (!paused() && !document.hidden) next(); }, ms);
    });
    destroyRef.onDestroy(stop);
  }

  /** Final section: the laptop photo and phone tilt in 3D with the pointer (fine pointers only). */
  private initTilt(area: HTMLElement | null, stage: HTMLElement | null, destroyRef: DestroyRef, reduce: boolean): void {
    if (!area || !stage || reduce || !window.matchMedia('(pointer: fine)').matches) return;
    const art = stage.parentElement as HTMLElement;
    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = art.getBoundingClientRect();
        const x = Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / r.width - 0.5));
        const y = Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / r.height - 0.5));
        stage.style.transform = `rotateY(${(x * 14).toFixed(2)}deg) rotateX(${(-y * 10).toFixed(2)}deg)`;
      });
    };
    const leave = () => { cancelAnimationFrame(raf); stage.style.transform = ''; };
    area.addEventListener('pointermove', move);
    area.addEventListener('pointerleave', leave);
    destroyRef.onDestroy(() => { cancelAnimationFrame(raf); area.removeEventListener('pointermove', move); area.removeEventListener('pointerleave', leave); });
  }

  /** Hero: the four meeting tiles play short muted webcam loops while the hero is on screen. */
  private initLiveTiles(hero: HTMLElement | null, destroyRef: DestroyRef, reduce: boolean): void {
    if (!hero || reduce) return;
    const videos = Array.from(hero.querySelectorAll<HTMLVideoElement>('video.lk-hero-tile'));
    if (!videos.length) return;
    let visible = false;
    const sync = () => {
      videos.forEach((v) => {
        if (visible && !document.hidden) { v.muted = true; v.play().catch(() => { /* stays on its poster */ }); }
        else v.pause();
      });
    };
    const io = 'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => { visible = entries.some((e) => e.isIntersecting); sync(); }, { threshold: 0.1 })
      : null;
    if (io) io.observe(hero); else { visible = true; sync(); }
    document.addEventListener('visibilitychange', sync);
    destroyRef.onDestroy(() => { io?.disconnect(); document.removeEventListener('visibilitychange', sync); videos.forEach((v) => v.pause()); });
  }

}
