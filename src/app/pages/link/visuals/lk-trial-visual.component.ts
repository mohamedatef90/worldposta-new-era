import { DestroyRef, Component, ElementRef, afterNextRender, inject, viewChildren } from '@angular/core';
import { LkChatListComponent } from './lk-chat-list.component';
import { LkChipComponent } from './lk-chip.component';
import { LkMeetPaneComponent } from './lk-meet-pane.component';
import { LkWindowComponent } from './lk-window.component';

/** Trial: the Link workspace circled by six ecosystem chips that orbit it (paused on hover and with reduced motion). */
@Component({
  selector: 'lk-trial-visual',
  imports: [LkWindowComponent, LkChatListComponent, LkMeetPaneComponent, LkChipComponent],
  host: { '(mouseenter)': 'hover = true', '(mouseleave)': 'hover = false' },
  template: `
    <div class="stage" role="img" aria-label="Posta Link desktop workspace with team chat and a four-person video meeting, circled by its connected features: team chat, calls and video meetings, workspaces, Posta Drive, calendar and the full WorldPosta ecosystem.">
      <span class="ring" aria-hidden="true"></span>
      <lk-window class="w" active="chat" sidebar="icons">
        <lk-chat-list class="list" />
        <lk-meet-pane [names]="false" />
      </lk-window>
      @for (c of chips; track c.title) {
        <lk-chip class="chip" [icon]="c.icon" [tone]="c.tone" [title]="c.title" [sub]="c.sub" aria-hidden="true" />
      }
    </div>
  `,
  styles: `
    :host{display:block;direction:ltr;container-type:inline-size}
    .stage{--u:calc(100cqw / 800);position:relative;width:100%;aspect-ratio:800/680}
    .ring{position:absolute;left:calc(110*var(--u));top:calc(90*var(--u));width:calc(580*var(--u));height:calc(500*var(--u));border:1.5px dashed rgb(77 122 44/.4);border-radius:50%;pointer-events:none;z-index:1}
    .w{position:absolute;left:calc(130*var(--u));top:calc(185*var(--u));width:calc(540*var(--u));height:calc(310*var(--u));z-index:2}
    .list{width:calc(210*var(--u));flex:none;border-inline-end:1px solid #e4e9ef;padding-top:calc(6*var(--u));overflow:hidden}
    .chip{position:absolute;transform:translate(-50%,-50%);z-index:1}
  `,
})
export class LkTrialVisualComponent {
  protected hover = false;
  private readonly els = viewChildren(LkChipComponent, { read: ElementRef });
  protected readonly chips = [
    { icon: 'chat', tone: 'blue' as const, title: 'Team Chat', sub: '1-1 & group chat' },
    { icon: 'video', tone: 'purple' as const, title: 'Calls & Video Meetings', sub: 'Calls, video & conferences' },
    { icon: 'users', tone: 'green' as const, title: 'Workspaces', sub: 'Organize teams & projects' },
    { icon: 'folder', tone: 'amber' as const, title: 'Posta Drive', sub: 'Share files & links' },
    { icon: 'calendar', tone: 'sky' as const, title: 'Calendar', sub: 'Schedule & stay aligned' },
    { icon: 'grid', tone: 'pink' as const, title: 'Full Ecosystem', sub: 'Works with WorldPosta tools' },
  ];

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let angle = -Math.PI / 2;
      let raf = 0;
      let last = 0;
      const draw = () => {
        const items = this.els();
        items.forEach((ref, i) => {
          const t = angle + (i * Math.PI * 2) / items.length;
          const el = ref.nativeElement as HTMLElement;
          el.style.left = ((400 + 285 * Math.cos(t)) / 8).toFixed(3) + '%';
          el.style.top = ((340 + 250 * Math.sin(t)) / 6.8).toFixed(3) + '%';
          el.style.zIndex = Math.sin(t) > 0 ? '3' : '1';
        });
      };
      const loop = (now: number) => {
        if (last && !this.hover) angle += Math.min(now - last, 64) * 0.00011;
        last = now;
        draw();
        raf = requestAnimationFrame(loop);
      };
      draw();
      if (reduce || !('IntersectionObserver' in window)) return;
      const io = new IntersectionObserver((entries) => {
        cancelAnimationFrame(raf);
        last = 0;
        if (entries.some((e) => e.isIntersecting)) raf = requestAnimationFrame(loop);
      }, { threshold: 0.2 });
      io.observe(host);
      destroyRef.onDestroy(() => { io.disconnect(); cancelAnimationFrame(raf); });
    });
  }
}
