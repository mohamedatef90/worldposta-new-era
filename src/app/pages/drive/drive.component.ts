import { SiteFooterComponent } from '@/shared/site-footer/site-footer.component';
import { Component, DestroyRef, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { SiteHeaderComponent } from '@/shared/site-header/site-header.component';
import { MainNavLinksComponent } from '@/shared/main-nav-links/main-nav-links.component';
import { PageJumpNavComponent } from '@/shared/page-jump-nav/page-jump-nav.component';
@Component({
  imports: [PageJumpNavComponent, SiteFooterComponent, NgOptimizedImage, SiteHeaderComponent, MainNavLinksComponent],
  templateUrl: './drive.component.html',
  styleUrl: './drive.component.css',
})
export class Drive {
  /** Challenge section: scattered apps settle into Drive. Loops while visible; respects reduced motion. */
  protected readonly flowConnected = signal(false);
  private flowTimer: ReturnType<typeof setTimeout> | undefined;
  private flowManual = false;

  constructor() {
    const host = inject(ElementRef<HTMLElement>);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.collabReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.collabTabs = host.nativeElement.querySelector('.collab-tabs');
      const collab = host.nativeElement.querySelector('.collab-flow');
      if (collab && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver(([entry]) => { this.collabVisible = entry.isIntersecting; this.restartCollab(); }, { threshold: 0.35 });
        io.observe(collab);
        destroyRef.onDestroy(() => { io.disconnect(); if (this.collabTimer !== undefined) clearInterval(this.collabTimer); });
      }
      this.initPulseMap(host.nativeElement, destroyRef);
      const stage = host.nativeElement.querySelector('.cf-stage');
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!stage || reduce || !('IntersectionObserver' in window)) return;
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !this.flowManual) this.startFlowLoop();
        else this.stopFlowLoop();
      }, { threshold: 0.4 });
      observer.observe(stage);
      destroyRef.onDestroy(() => { observer.disconnect(); this.stopFlowLoop(); });
    });
  }

  /** From file to meeting: the four steps drive the visual. Auto-advances while visible. */
  protected readonly collabStep = signal(0);
  private collabTimer: ReturnType<typeof setInterval> | undefined;
  private collabVisible = false;
  private collabPaused = false;

  protected setCollabStep(step: number): void {
    this.collabStep.set(step);
    this.restartCollab();
  }

  protected onCollabKey(event: KeyboardEvent): void {
    const keys: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    const delta = keys[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    const next = (this.collabStep() + delta + 4) % 4;
    this.setCollabStep(next);
    const list = (event.currentTarget as HTMLElement).parentElement;
    (list?.children[next] as HTMLElement | undefined)?.focus();
  }

  protected pauseCollab(paused: boolean): void {
    this.collabPaused = paused;
    this.collabTabs?.classList.toggle('is-paused', paused);
    this.restartCollab();
  }

  private collabTabs: HTMLElement | null = null;
  private collabReduce = false;

  private restartCollab(): void {
    if (this.collabTimer !== undefined) clearInterval(this.collabTimer);
    this.collabTimer = undefined;
    if (this.collabReduce || !this.collabVisible || this.collabPaused) return;
    this.collabTimer = setInterval(() => this.collabStep.update(s => (s + 1) % 4), 4200);
  }

  /** Global collaboration: a pulse travels from the Drive hub to a teammate every few seconds; activity numbers count up once. */
  private initPulseMap(root: HTMLElement, destroyRef: DestroyRef): void {
    const map = root.querySelector<HTMLElement>('.pulse-map');
    const panel = root.querySelector<HTMLElement>('.global-activity');
    if (!map || !('IntersectionObserver' in window)) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const paths = Array.from(map.querySelectorAll<SVGPathElement>('.gm-arcs path'));
    const pulse = map.querySelector<SVGCircleElement>('.gm-pulse');
    const pins = Array.from(map.querySelectorAll<HTMLElement>('.gm-pin'));
    const cards = Array.from(map.querySelectorAll<HTMLElement>('.gm-card'));
    let index = 0;
    let timer: ReturnType<typeof setInterval> | undefined;
    let frame = 0;
    const live: number[] = [];
    const showCard = (k: number) => {
      pins[k].classList.remove('is-hit');
      void pins[k].offsetWidth;
      pins[k].classList.add('is-hit');
      cards[k].classList.add('is-on');
      live.push(k);
      if (live.length > 2) cards[live.shift()!].classList.remove('is-on');
    };
    const fire = () => {
      const k = index++ % paths.length;
      const path = paths[k];
      const length = path.getTotalLength();
      const start = performance.now();
      const step = (now: number) => {
        const q = Math.min(1, (now - start) / 900);
        const e = q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2;
        const pt = path.getPointAtLength(length * e);
        pulse?.setAttribute('cx', String(pt.x));
        pulse?.setAttribute('cy', String(pt.y));
        if (pulse) pulse.style.opacity = q < 1 ? '1' : '0';
        if (q < 1) frame = requestAnimationFrame(step);
        else showCard(k);
      };
      frame = requestAnimationFrame(step);
    };
    const stop = () => { if (timer !== undefined) clearInterval(timer); timer = undefined; cancelAnimationFrame(frame); };
    const observer = new IntersectionObserver(([entry]) => {
      stop();
      if (!entry.isIntersecting) return;
      if (reduce) { cards.slice(0, 2).forEach(c => c.classList.add('is-on')); return; }
      fire();
      timer = setInterval(fire, 2600);
    }, { threshold: 0.3 });
    observer.observe(map);
    let counted = false;
    const countObserver = panel && !reduce ? new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || counted) return;
      counted = true;
      panel.querySelectorAll('strong').forEach(el => {
        const target = Number((el.textContent ?? '').replace(/[^0-9]/g, ''));
        if (!target) return;
        const start = performance.now();
        const tick = (now: number) => {
          const k = Math.min(1, (now - start) / 1400);
          el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))).toLocaleString('en-US');
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 }) : null;
    if (panel && countObserver) countObserver.observe(panel);
    destroyRef.onDestroy(() => { observer.disconnect(); countObserver?.disconnect(); stop(); });
  }

  protected showFlow(connected: boolean): void {
    this.flowManual = true;
    this.stopFlowLoop();
    this.flowConnected.set(connected);
  }

  private startFlowLoop(): void {
    this.stopFlowLoop();
    // Hold the connected (relieved) state longer so the turning point can land.
    const step = () => {
      this.flowConnected.update(v => !v);
      this.flowTimer = setTimeout(step, this.flowConnected() ? 5200 : 3400);
    };
    this.flowTimer = setTimeout(step, this.flowConnected() ? 5200 : 3400);
  }

  private stopFlowLoop(): void {
    if (this.flowTimer !== undefined) clearTimeout(this.flowTimer);
    this.flowTimer = undefined;
  }

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


