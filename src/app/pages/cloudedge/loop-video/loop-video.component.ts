import { Component, DestroyRef, ElementRef, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { ThemeService } from '@/shared/services/theme.service';

const BASE = '/worldposta-assets/hero/cloudedge/';

/**
 * A short Remotion loop rendered once per site theme, as
 * `<name>-{light,dark}.{webm,mp4}` plus `<name>-poster-{light,dark}.avif`.
 * Used for the Challenge (invoices resolving into one CloudEdge bill) and
 * Zero Trust (connections checked at the policy gateway) visuals.
 *
 * Decorative, so hidden from assistive tech, but it moves for longer than 5s,
 * so it carries its own pause control (WCAG 2.2.2). Reduced motion shows the
 * resolved poster frame only, and the loop pauses while it is off screen.
 */
@Component({
  selector: 'app-loop-video',
  imports: [FaIconComponent],
  template: `
    @for (src of sources(); track src.theme) {
      <video
        #video
        class="loop__video"
        [poster]="src.poster"
        muted
        loop
        playsinline
        preload="metadata"
        aria-hidden="true"
        (loadeddata)="sync()"
      >
        <source [src]="src.webm" type="video/webm" />
        <source [src]="src.mp4" type="video/mp4" />
      </video>
    }
    @if (!reducedMotion()) {
      <button
        type="button"
        class="loop__toggle"
        [attr.aria-label]="paused() ? 'Play animation' : 'Pause animation'"
        (click)="paused.set(!paused())"
      >
        <fa-icon [icon]="paused() ? icons.play : icons.pause" aria-hidden="true" />
      </button>
    }
  `,
  styles: `
    :host { position:relative; display:block; overflow:hidden; border-radius:28px; border:1px solid var(--wp-panel-line); background:var(--wp-panel); }
    .loop__video { display:block; width:100%; height:100%; object-fit:cover; }
    .loop__toggle {
      position:absolute; right:12px; bottom:12px; display:grid; place-items:center; width:44px; height:44px;
      border:1px solid var(--wp-panel-line); border-radius:50%; background:var(--wp-panel); color:var(--wp-ink);
      box-shadow:var(--shadow-sm); cursor:pointer; font-size:14px;
    }
    .loop__toggle:hover { background:var(--color-bg-tertiary); }
    .loop__toggle:focus-visible { outline:2px solid var(--color-action); outline-offset:2px; }
  `,
})
export class LoopVideoComponent {
  /** Asset name, e.g. `challenge-loop`. */
  readonly name = input.required<string>();

  private readonly theme = inject(ThemeService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly video = viewChild<ElementRef<HTMLVideoElement>>('video');

  protected readonly icons = { play: faPlay, pause: faPause };
  protected readonly paused = signal(false);
  protected readonly reducedMotion = signal(matchMedia('(prefers-reduced-motion: reduce)').matches);
  private readonly onScreen = signal(false);

  /** One entry, keyed by theme, so a theme switch swaps in a fresh <video>. */
  protected readonly sources = computed(() => {
    const theme = this.theme.isDark() ? 'dark' : 'light';
    const base = BASE + this.name();
    return [
      {
        theme,
        webm: `${base}-${theme}.webm`,
        mp4: `${base}-${theme}.mp4`,
        poster: `${base}-poster-${theme}.avif`,
      },
    ];
  });

  constructor() {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = (e: MediaQueryListEvent) => this.reducedMotion.set(e.matches);
    motion.addEventListener('change', onMotion);

    const io = new IntersectionObserver(([entry]) => this.onScreen.set(entry.isIntersecting));
    io.observe(this.host.nativeElement);

    inject(DestroyRef).onDestroy(() => {
      motion.removeEventListener('change', onMotion);
      io.disconnect();
    });

    effect(() => this.sync());
  }

  /** Plays only when visible, not paused by the visitor and motion is allowed. */
  protected sync(): void {
    const el = this.video()?.nativeElement;
    if (!el) return;
    el.muted = true;
    if (this.onScreen() && !this.paused() && !this.reducedMotion()) {
      el.play().catch(() => this.paused.set(true));
    } else {
      el.pause();
    }
  }
}
