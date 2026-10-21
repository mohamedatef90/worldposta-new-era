import { Component, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { scrollToFragmentOnClick } from '@/shared/utils';
import { Router, RouterOutlet } from '@angular/router';
@Component({
 imports: [RouterOutlet],
 selector: 'app-root',
 styleUrl: './app.component.css',
 templateUrl: './app.component.html',
 host: { '(window:hashchange)': 'openHashPage()', '(click)': 'onFragmentClick($event)' },
})
export class App {
 private readonly router = inject(Router);
 private readonly document = inject(DOCUMENT);
 /** `<base href="/">` makes plain `href="#id"` links resolve to `/#id`; keep them on the current page. */
 protected onFragmentClick(event: MouseEvent): void { if (!event.defaultPrevented) scrollToFragmentOnClick(event, this.document); }
 constructor() { this.openHashPage(); }
 protected openHashPage(): void {
  if (window.location.hash === '#cloudspace') void this.router.navigateByUrl('/cloudspace');
 }
}
