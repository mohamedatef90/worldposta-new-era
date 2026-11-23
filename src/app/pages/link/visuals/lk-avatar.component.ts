import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';

/** A round avatar: a face photo when `face` is set, otherwise initials on a tone. Decorative. */
@Component({
  selector: 'lk-avatar',
  imports: [NgOptimizedImage],
  template: `
    @if (face(); as f) {
      <img [ngSrc]="'/worldposta-assets/link-ui/face-' + f + '.webp'" width="120" height="120" alt="" />
    } @else {
      <span class="ini" [style.background]="tone()">{{ initials() }}</span>
    }
  `,
  styles: `
    :host{display:block;flex:none;width:var(--lk-av,2.6em);height:var(--lk-av,2.6em);border-radius:50%;overflow:hidden;background:#dfe6ee}
    img{display:block;width:100%;height:100%;object-fit:cover}
    .ini{display:grid;place-items:center;width:100%;height:100%;color:#fff;font-weight:700;font-size:calc(var(--lk-av,2.6em)*.38)}
  `,
})
export class LkAvatarComponent {
  readonly face = input<'emma' | 'james' | 'lucas' | 'sophie' | null>(null);
  readonly initials = input('');
  readonly tone = input('#1f9e83');
}
