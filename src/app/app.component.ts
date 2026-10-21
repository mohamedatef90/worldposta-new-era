import { Component, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
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
 constructor() { this.openHashPage(); }
 protected openHashPage(): void {
  if (window.location.hash === '#cloudspace') void this.router.navigateByUrl('/cloudspace');
 }
}
