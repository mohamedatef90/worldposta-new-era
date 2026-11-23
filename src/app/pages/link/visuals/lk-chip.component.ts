import { Component, input } from '@angular/core';
import { LkIconComponent } from './lk-icon.component';

/** Feature chip: a tinted icon tile with a title and one line. Decorative. */
@Component({
  selector: 'lk-chip',
  imports: [LkIconComponent],
  template: `
    <span class="ic" [attr.data-tone]="tone()"><lk-icon [name]="icon()" /></span>
    <span class="tx"><strong>{{ title() }}</strong>@if (sub()) { <small>{{ sub() }}</small> }</span>
  `,
  styles: `
    :host{display:inline-flex;align-items:center;gap:calc(11*var(--u));padding:calc(10*var(--u)) calc(16*var(--u)) calc(10*var(--u)) calc(10*var(--u));border-radius:calc(16*var(--u));background:#fff;border:1px solid #dfe8f2;box-shadow:0 calc(12*var(--u)) calc(26*var(--u)) calc(-12*var(--u)) rgb(20 33 61/.22);color:#14213d;font-family:var(--font-body,system-ui,sans-serif);text-align:start;white-space:nowrap}
    .ic{display:grid;place-items:center;width:calc(34*var(--u));height:calc(34*var(--u));border-radius:calc(10*var(--u));font-size:calc(18*var(--u));flex:none;color:var(--t);background:var(--b)}
    .ic[data-tone=blue]{--t:#1668cf;--b:#e6effc}.ic[data-tone=purple]{--t:#6d3fd0;--b:#eee8fb}.ic[data-tone=green]{--t:#1f8a49;--b:#e3f4ea}
    .ic[data-tone=amber]{--t:#a96a00;--b:#fdf1d8}.ic[data-tone=sky]{--t:#157cb8;--b:#e1f1fb}.ic[data-tone=pink]{--t:#c42e6f;--b:#fbe3ee}.ic[data-tone=teal]{--t:#127f7f;--b:#dff3f2}
    .tx{display:grid;gap:calc(1*var(--u))}
    strong{font-size:calc(12.5*var(--u));font-weight:700;line-height:1.2}
    small{font-size:calc(10.5*var(--u));color:#5b687a;line-height:1.25}
  `,
})
export class LkChipComponent {
  readonly icon = input.required<string>();
  readonly tone = input<'blue' | 'purple' | 'green' | 'amber' | 'sky' | 'pink' | 'teal'>('blue');
  readonly title = input.required<string>();
  readonly sub = input('');
}
