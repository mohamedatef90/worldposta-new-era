import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

interface NavLink {
  readonly label: string;
  readonly routerLink?: string;
  readonly href?: string;
  readonly chevron?: boolean;
}

/**
 * The primary site navigation, projected into every page's `<app-site-header>`.
 * Defined once here — rather than copy-pasted per page — so it stays the same
 * everywhere instead of drifting (as Posta's own section nav had).
 */
@Component({
  selector: 'app-main-nav-links',
  imports: [FaIconComponent, RouterLink],
  // `contents`, not the default `inline`: the projected <a> tags must be
  // direct flex items of the host page's `.site-nav`/`.mobile-nav` container
  // for its `gap` to apply between them — a wrapping element here would
  // collapse that gap to whitespace between my own template's lines.
  host: { style: 'display: contents' },
  template: `
    @for (link of links; track link.label) {
      @if (link.routerLink) {
        <a [routerLink]="link.routerLink" (click)="linkClick.emit()">
          {{ link.label }}
          @if (link.chevron && !mobile()) {
            <fa-icon [icon]="chevronDown" aria-hidden="true" />
          }
        </a>
      } @else {
        <a [href]="link.href" (click)="linkClick.emit()">
          {{ link.label }}
          @if (link.chevron && !mobile()) {
            <fa-icon [icon]="chevronDown" aria-hidden="true" />
          }
        </a>
      }
    }
  `,
})
export class MainNavLinksComponent {
  /** Mobile drawer variant: no chevrons, and `linkClick` is wired to close the menu. */
  readonly mobile = input(false);
  readonly linkClick = output<void>();

  protected readonly chevronDown = faChevronDown;

  protected readonly links: readonly NavLink[] = [
    { label: 'CloudEdge', routerLink: '/cloudedge', chevron: true },
    { label: 'Posta', routerLink: '/posta', chevron: true },
    { label: 'CloudSpace', href: '#cloudspace', chevron: true },
    { label: 'Solutions', href: '#solutions', chevron: true },
    { label: 'Service Provider', href: '#service-provider', chevron: true },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Resources', href: '#resources', chevron: true },
  ];
}
