import { SiteHeaderComponent } from '../../shared/site-header/site-header.component';
import { scrollToFragmentOnClick } from '../../shared/utils';
import { Component, DestroyRef, ElementRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faFolder, faCalendarDays, faUsers, faNoteSticky, faLayerGroup, faCheck, faShieldHalved, faVideo, faComments, faChartSimple, faLock, faEnvelope, faFileLines, faCoins, faPhone, faLocationDot, faHeadset, faClock, faBell, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { SiteFooterComponent } from '../../shared/site-footer/site-footer.component';
import { PageJumpNavComponent } from '@/shared/page-jump-nav/page-jump-nav.component';

/** Walks through `count` items on a timer; hovering or focusing an item jumps to it and pauses. */
class Spotlight {
 readonly active = signal(0);
 private timer: ReturnType<typeof setTimeout> | undefined;
 private auto = false;
 constructor(private readonly count: number, private readonly dwell: number) {}
 start(auto: boolean): void { this.auto = auto; this.queue(this.dwell); }
 pick(index: number): void { clearTimeout(this.timer); this.active.set(index); }
 resume(): void { this.queue(1400); }
 stop(): void { clearTimeout(this.timer); }
 private queue(delay: number): void {
  clearTimeout(this.timer);
  if (!this.auto) return;
  this.timer = setTimeout(() => { this.active.update(i => (i + 1) % this.count); this.queue(this.dwell); }, delay);
 }
}

@Component({
 selector: 'app-cloudspace',
 host: { '(click)': 'onInPageAnchorClick($event)' },
 imports: [PageJumpNavComponent, SiteHeaderComponent, NgOptimizedImage, FaIconComponent, SiteFooterComponent],
 templateUrl: './cloudspace.component.html',
 styleUrl: './cloudspace.component.css',
})
export class CloudSpace {
 private readonly document = inject(DOCUMENT);
 protected onInPageAnchorClick(event: MouseEvent): void { scrollToFragmentOnClick(event, this.document); }
 // Hero tool spotlight: walks through the tools; the active one lights up in the list and on the laptop and phone.
 protected readonly toolDwell = 2600;
 protected readonly activeTool = signal(0);
 protected readonly activeToolName = computed(() => this.tools[this.activeTool()]?.name ?? '');
 private toolTimer: ReturnType<typeof setTimeout> | undefined;
 private toolsAuto = false;
 // Section spotlights: challenges, matched problem/solution pairs, and the active speaker in the Connect video call.
 protected readonly challengeSpot = new Spotlight(6, 2600);
 protected readonly pairSpot = new Spotlight(4, 2600);
 protected readonly speakerSpot = new Spotlight(4, 1900);
 // Talk to our experts: the three perks light up in turn (step 0-2), then the form glows (step 3).
 protected readonly perkStep = signal(-1);
 private perkTimer: ReturnType<typeof setTimeout> | undefined;
 private runPerks(step: number): void {
  this.perkStep.set(step);
  this.perkTimer = setTimeout(() => this.runPerks(step >= 3 ? 0 : step + 1), step === 3 ? 2400 : 1100);
 }
 private readonly host = inject(ElementRef<HTMLElement>);
 private revealObserver: IntersectionObserver | undefined;
 private callObserver: IntersectionObserver | undefined;
 private callVideos: HTMLVideoElement[] = [];
 private callVisible = false;
 private readonly syncCall = (): void => {
  this.callVideos.forEach(v => {
   if (this.callVisible && !this.document.hidden) { v.muted = true; v.play().catch(() => { /* stays on its poster */ }); }
   else v.pause();
  });
 };
 constructor() {
  afterNextRender(() => {
   const view = this.document.defaultView;
   this.toolsAuto = !(view?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
   this.queueNextTool(this.toolDwell);
   for (const spot of [this.challengeSpot, this.pairSpot, this.speakerSpot]) spot.start(this.toolsAuto);
   this.setUpReveal(view);
   if (this.toolsAuto) this.runPerks(0);
   this.initCallVideos(view);
  });
  inject(DestroyRef).onDestroy(() => {
   clearTimeout(this.toolTimer);
   clearTimeout(this.perkTimer);
   for (const spot of [this.challengeSpot, this.pairSpot, this.speakerSpot]) spot.stop();
   this.revealObserver?.disconnect();
   this.callObserver?.disconnect();
   this.document.removeEventListener('visibilitychange', this.syncCall);
   this.callVideos.forEach(v => v.pause());
  });
 }
 /** Connect: the four meeting tiles play short muted webcam loops while the artwork is on screen. */
 private initCallVideos(view: (Window & typeof globalThis) | null): void {
  const art = (this.host.nativeElement as HTMLElement).querySelector('.connect-artwork');
  if (!art || !this.toolsAuto) return;
  this.callVideos = Array.from(art.querySelectorAll<HTMLVideoElement>('video.cn-vid'));
  if (view && 'IntersectionObserver' in view) {
   this.callObserver = new IntersectionObserver(entries => { this.callVisible = entries.some(e => e.isIntersecting); this.syncCall(); }, { threshold: 0.1 });
   this.callObserver.observe(art);
  } else { this.callVisible = true; this.syncCall(); }
  this.document.addEventListener('visibilitychange', this.syncCall);
 }
 /** Plays each [data-reveal] section's entrance once, when it scrolls into view. */
 private setUpReveal(view: (Window & typeof globalThis) | null): void {
  const hostEl: HTMLElement = this.host.nativeElement;
  if (!this.toolsAuto || !view || !('IntersectionObserver' in view)) return;
  hostEl.classList.add('reveal-ready');
  this.revealObserver = new IntersectionObserver(entries => {
   for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('in-view');
    this.revealObserver?.unobserve(entry.target);
   }
  }, { threshold: 0.18 });
  hostEl.querySelectorAll('[data-reveal]').forEach(el => this.revealObserver?.observe(el));
 }
 /** Connect artwork tilts toward a mouse pointer in 3D. */
 protected tiltArt(event: PointerEvent): void {
  if (!this.toolsAuto || event.pointerType !== 'mouse') return;
  const el = event.currentTarget as HTMLElement;
  const r = el.getBoundingClientRect();
  const dx = (event.clientX - r.left) / r.width - 0.5, dy = (event.clientY - r.top) / r.height - 0.5;
  el.style.transform = `perspective(1200px) rotateY(${(dx * 10).toFixed(2)}deg) rotateX(${(-dy * 8).toFixed(2)}deg)`;
 }
 protected resetTilt(event: PointerEvent): void { (event.currentTarget as HTMLElement).style.transform = ''; }
 protected pickTool(index: number): void { clearTimeout(this.toolTimer); this.activeTool.set(index); }
 protected resumeTools(): void { this.queueNextTool(1400); }
 private queueNextTool(delay: number): void {
  clearTimeout(this.toolTimer);
  if (!this.toolsAuto) return;
  this.toolTimer = setTimeout(() => { this.activeTool.update(i => (i + 1) % this.tools.length); this.queueNextTool(this.toolDwell); }, delay);
 }
 protected readonly icons = {folder:faFolder, calendar:faCalendarDays, users:faUsers, notes:faNoteSticky, apps:faLayerGroup, check:faCheck, shield:faShieldHalved, video:faVideo, chat:faComments, chart:faChartSimple, lock:faLock, mail:faEnvelope, file:faFileLines, cost:faCoins, phone:faPhone, location:faLocationDot, support:faHeadset, clock:faClock, bell:faBell, send:faPaperPlane};
 protected readonly tools = [
 {name:'Drive',copy:'Store, share and collaborate on files securely.',icon:faFolder,color:'green',items:['Documents','Spreadsheets','Presentations','PDF files']},
 {name:'Calendar',copy:'Plan, schedule and stay in sync with your team.',icon:faCalendarDays,color:'blue',items:['Team schedules','Shared calendars','Meeting reminders','Events']},
 {name:'Connect',copy:'Team chat and video meetings in one place.',icon:faUsers,color:'purple',items:['Team chat','Video meetings','Channels','Audio calls','Screen sharing']},
 {name:'Notes',copy:'Capture ideas and keep track of important information.',icon:faNoteSticky,color:'orange',items:['Meeting notes','Project ideas','Action items','Personal notes']},
 {name:'Apps',copy:'Access all your essential tools in one place.',icon:faLayerGroup,color:'blue',items:['Documents','Sheets','Slides','PDF']},
 {name:'Tasks',copy:'Manage tasks, assign work and stay productive.',icon:faCheck,color:'green',items:['Assign work','Track progress','Stay organized','Work together']},
 ];
 protected readonly challenges = [
 {name:'Scattered Files',copy:'Important documents get lost across drives, emails and personal devices.',icon:faFileLines},
 {name:'Disorganized Communication',copy:'Conversations happen in multiple apps, making it hard to keep track.',icon:faComments},
 {name:'Multiple Calendars',copy:'Meetings and schedules are spread across different platforms, leading to conflicts and missed updates.',icon:faCalendarDays},
 {name:'Limited Collaboration',copy:'Teams struggle to work together in real time, especially across locations.',icon:faUsers},
 {name:'Security Concerns',copy:'Sharing files and sensitive information outside the company increases risk.',icon:faShieldHalved},
 {name:'Lower Productivity',copy:'Switching between tools and searching for information wastes valuable time.',icon:faChartSimple},
 ];
 protected readonly benefits = [
 {name:'One Platform',copy:'All your team tools in one place.',icon:faUsers},
 {name:'Enterprise-Grade Security',copy:'Your data stays safe and private.',icon:faShieldHalved},
 {name:'Flexible for Your Business',copy:'Scale anytime, with no complexity.',icon:faLayerGroup},
 {name:'Save Time and Costs',copy:'Less tools, more productivity.',icon:faCoins},
 ];
 protected readonly contactStatus = signal('');
 protected prepareRequest(event: Event): void {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const body = Array.from(data.entries()).map(([key,value]) => key + ': ' + String(value)).join('\n');
  window.location.href = 'mailto:info@worldposta.com?subject=CloudSpace%20demo%20request&body=' + encodeURIComponent(body);
  this.contactStatus.set('Your email app will open with your request. Send it to contact our team.');
 }
}



