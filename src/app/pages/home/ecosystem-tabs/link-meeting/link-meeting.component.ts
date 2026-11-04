import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, viewChildren } from '@angular/core';

/**
 * The Posta Link hero meeting window, reused for the Conferencing service: the four
 * meeting tiles play their short muted loops while the window is on screen.
 */
@Component({
  selector: 'app-link-meeting',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './link-meeting.component.html',
  styleUrl: './link-meeting.component.css',
})
export class LinkMeetingComponent {
  private readonly tiles = viewChildren<ElementRef<HTMLVideoElement>>('tile');

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      let visible = false;
      const sync = () =>
        this.tiles().forEach(({ nativeElement: v }) => {
          if (visible && !document.hidden) { v.muted = true; v.play().catch(() => { /* stays on its poster */ }); }
          else v.pause();
        });
      const io = 'IntersectionObserver' in window
        ? new IntersectionObserver((entries) => { visible = entries.some((e) => e.isIntersecting); sync(); }, { threshold: 0.1 })
        : null;
      document.addEventListener('visibilitychange', sync);
      if (io) io.observe(host); else { visible = true; sync(); }
      destroyRef.onDestroy(() => { io?.disconnect(); document.removeEventListener('visibilitychange', sync); this.tiles().forEach((t) => t.nativeElement.pause()); });
    });
  }
}
