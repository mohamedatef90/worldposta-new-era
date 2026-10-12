import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
@Component({
 imports: [RouterOutlet],
 selector: 'app-root',
 styleUrl: './app.component.css',
 templateUrl: './app.component.html',
 host: { '(window:hashchange)': 'openHashPage()' },
})
export class App {
 private readonly router = inject(Router);
 constructor() { this.openHashPage(); }
 protected openHashPage(): void {
  if (window.location.hash === '#cloudspace') void this.router.navigateByUrl('/cloudspace');
 }
}
