import { Component, inject } from '@angular/core';
import { DOCUMENT, ViewportScroller } from '@angular/common';
import { scrollToFragmentOnClick } from './shared/utils/scroll-to-fragment';
import { Router, RouterOutlet } from '@angular/router';
@Component({
 imports: [RouterOutlet],
 selector: 'app-root',
 styleUrl: './app.component.css',
 templateUrl: './app.component.html',
 host: { '(window:hashchange)': 'openHashPage()', '(click)': 'onAnchorClick($event)' },
})
export class App {
 private readonly router = inject(Router);
 private readonly document = inject(DOCUMENT);
 protected onAnchorClick(event: MouseEvent): void { scrollToFragmentOnClick(event, this.document); }
 constructor() {
  // Deep links (/page#section) scroll through the router, which ignores CSS
  // scroll-padding; reuse that value so they land under the sticky header too.
  inject(ViewportScroller).setOffset(() => [0, parseFloat(getComputedStyle(this.document.documentElement).scrollPaddingTop) || 0]);
  this.openHashPage();
 }
 protected openHashPage(): void {
  if (window.location.hash === '#cloudspace') void this.router.navigateByUrl('/cloudspace');
 }
}
