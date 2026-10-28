import { Component } from '@angular/core';

/**
 * SAP hero visual: the floating "SAP Operations" glass panel over the data-hall
 * render. Coded, so every label is real text and follows the theme. Sized in
 * container units (cqw), so it scales with the photo at every width.
 * Decorative (the hero copy carries the message), so the hero hides it from
 * assistive tech. Sample statuses only.
 */
@Component({
  selector: 'app-sap-ops-panel',
  template: `
    <div class="panel">
      <p class="panel__title">SAP Operations</p>
      <div class="panel__main">
        <div class="tile">
          <span class="tile__label">System Health</span>
          <span class="health-ring"><svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="13" /><path d="m10 16 4 4 8-8" /></svg></span>
          <span class="tile__value">Healthy</span>
          <span class="tile__bar"></span>
        </div>
        <div class="tile">
          <span class="tile__label">Performance</span>
          <span class="bars">
            @for (h of bars; track $index) {
              <span [style.--h]="h" [style.--i]="$index"></span>
            }
          </span>
        </div>
        <div class="tile">
          <span class="tile__label">Security</span>
          <span class="shield"><svg viewBox="0 0 32 32"><path d="M16 3c4 3 8 4 11 5v9c0 6-6 10-11 13C11 27 5 23 5 17V8c3-1 7-2 11-5Z" /><path d="m11 16 4 4 7-8" /></svg></span>
          <span class="tile__value">Protected</span>
          <span class="tile__bar"></span>
        </div>
      </div>
      <div class="panel__row">
        @for (item of services; track item.label) {
          <div class="mini">
            <svg viewBox="0 0 32 32"><path [attr.d]="item.icon" /></svg>
            <span>{{ item.label }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    :host { display:block; container-type:inline-size; }
    .panel {
      padding:3.4cqw; border-radius:3.2cqw;
      border:1px solid color-mix(in srgb, var(--wp-blue) 22%, transparent);
      background:color-mix(in srgb, var(--color-bg-secondary) 78%, transparent);
      backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px);
      box-shadow:0 2cqw 6cqw -1cqw color-mix(in srgb, var(--wp-blue) 28%, transparent), var(--shadow-lg);
      transform:perspective(1400px) rotateY(-9deg) rotateX(3deg);
      transform-origin:left center;
    }
    .panel__title { margin:0 0 2.6cqw; font-size:4.6cqw; font-weight:var(--fw-bold); letter-spacing:-.02em; color:var(--color-text-primary); }
    .panel__main { display:grid; grid-template-columns:repeat(3, 1fr); gap:2.2cqw; }
    .panel__row { display:grid; grid-template-columns:repeat(4, 1fr); gap:2.2cqw; margin-top:2.2cqw; }
    .tile, .mini { border-radius:2.2cqw; border:1px solid var(--color-border); background:var(--color-bg-primary); }
    .tile { display:flex; flex-direction:column; align-items:center; gap:1.4cqw; padding:2.4cqw 2cqw 2.2cqw; min-height:24cqw; box-sizing:border-box; }
    .tile__label { align-self:flex-start; font-size:3cqw; font-weight:var(--fw-semibold); color:var(--color-text-primary); }
    .tile__value { font-size:2.8cqw; font-weight:var(--fw-semibold); color:var(--color-text-secondary); }
    .tile__bar { width:100%; height:.9cqw; margin-top:auto; border-radius:1cqw; background:linear-gradient(to right, var(--color-brand-green), var(--wp-tone-green)); }
    svg { fill:none; stroke:currentColor; stroke-width:2.2; stroke-linecap:round; stroke-linejoin:round; }
    .health-ring, .shield { display:grid; place-items:center; margin-top:1cqw; }
    .health-ring svg { width:8cqw; height:8cqw; color:var(--color-brand-green); }
    .shield svg { width:8cqw; height:8cqw; color:var(--wp-blue); }
    .bars { display:flex; align-items:flex-end; gap:1cqw; height:11cqw; margin-top:auto; }
    .bars span { width:2.2cqw; height:calc(var(--h) * 1%); border-radius:.6cqw .6cqw 0 0; background:linear-gradient(to top, var(--wp-blue), var(--wp-tone-sky)); }
    .bars span:nth-child(n+5) { background:linear-gradient(to top, var(--color-brand-green), var(--wp-tone-green)); }
    .mini { display:flex; flex-direction:column; align-items:center; gap:1.2cqw; padding:2.2cqw 1.2cqw; text-align:center; }
    .mini svg { width:5.4cqw; height:5.4cqw; color:var(--wp-blue); }
    .mini:last-child svg { color:var(--wp-tone-purple); }
    .mini span { font-size:2.5cqw; line-height:1.3; font-weight:var(--fw-semibold); color:var(--color-text-primary); }
    @media (prefers-reduced-motion:no-preference) {
      .bars span { animation:bar-grow .9s cubic-bezier(.2,.7,.2,1) both; animation-delay:calc(.8s + var(--i) * 70ms); transform-origin:bottom; }
    }
    @keyframes bar-grow { from { transform:scaleY(0); } }
  `,
})
export class SapOpsPanelComponent {
  /** Bar heights (%) for the Performance sparkline. */
  protected readonly bars = [38, 52, 46, 64, 58, 76, 88];

  protected readonly services = [
    { label: 'Infrastructure Management', icon: 'M6 7c0-2 4-3 10-3s10 1 10 3v18c0 2-4 3-10 3S6 27 6 25ZM6 7c0 2 4 3 10 3s10-1 10-3M6 16c0 2 4 3 10 3s10-1 10-3' },
    { label: 'Clustering & High Availability', icon: 'M16 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM6 22a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM26 22a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM16 10v6m0 0-8 7m8-7 8 7' },
    { label: 'SUSE Linux Best Practices', icon: 'M16 4l3 2 4-1 1 4 3 3-2 4 2 4-3 3-1 4-4-1-3 2-3-2-4 1-1-4-3-3 2-4-2-4 3-3 1-4 4 1ZM16 12a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z' },
    { label: 'Continuous Optimization', icon: 'M5 27V17h5v10M14 27V10h5v17M23 27V4h5v23M3 28h27' },
  ];
}
