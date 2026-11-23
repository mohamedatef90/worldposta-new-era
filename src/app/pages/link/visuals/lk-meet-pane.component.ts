import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';
import { LkIconComponent } from './lk-icon.component';

/** A four-person video meeting with its control bar (still frames). Decorative. */
@Component({
  selector: 'lk-meet-pane',
  imports: [NgOptimizedImage, LkIconComponent],
  template: `
    <div class="grid">
      @for (t of tiles; track t.i) {
        <div class="tile"><img [ngSrc]="'/worldposta-assets/posta-link-hero-tile-' + t.i + '.avif'" fill alt="" />@if (names()) { <span class="name">{{ t.n }}</span> }</div>
      }
    </div>
    <div class="ctl"><span class="b"><lk-icon name="mic" /></span><span class="b"><lk-icon name="video" /></span><span class="b"><lk-icon name="screen" /></span><span class="b"><lk-icon name="more" [weight]="3" /></span><span class="b end"><lk-icon name="phone-off" /></span>@if (count()) { <span class="cnt"><lk-icon name="users" />{{ count() }}</span> }</div>
  `,
  styles: `
    :host{display:flex;flex-direction:column;flex:1;min-width:0;min-height:0;padding:calc(10*var(--u));gap:calc(9*var(--u));background:#0f1824;font-family:var(--font-body,system-ui,sans-serif)}
    .grid{flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:1fr;gap:calc(8*var(--u))}
    .tile{position:relative;overflow:hidden;border-radius:calc(10*var(--u));background:#1d2734;min-height:0}
    .tile img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
    .name{position:absolute;inset:auto auto calc(7*var(--u)) calc(7*var(--u));padding:calc(3*var(--u)) calc(8*var(--u));border-radius:calc(6*var(--u));background:rgb(15 24 36/.62);color:#fff;font-size:calc(9.5*var(--u));font-weight:600}
    .ctl{display:flex;align-items:center;justify-content:center;gap:calc(8*var(--u));flex:none;height:calc(32*var(--u))}
    .b{display:grid;place-items:center;width:calc(34*var(--u));height:calc(28*var(--u));border-radius:calc(9*var(--u));background:#26323f;color:#e6edf5;font-size:calc(14*var(--u))}
    .b.end{width:calc(42*var(--u));background:#e04b55;color:#fff}
    .cnt{display:inline-flex;align-items:center;gap:calc(5*var(--u));margin-inline-start:calc(6*var(--u));color:#e6edf5;font-size:calc(11*var(--u));font-weight:600}.cnt lk-icon{font-size:calc(14*var(--u))}
  `,
})
export class LkMeetPaneComponent {
  readonly names = input(true);
  readonly count = input(0);
  protected readonly tiles = [{ i: 0, n: 'Emma Collins' }, { i: 1, n: 'James Carter' }, { i: 2, n: 'Lucas Meyer' }, { i: 3, n: 'Sophie Laurent' }];
}
