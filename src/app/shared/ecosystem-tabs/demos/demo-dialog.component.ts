import { Component, DestroyRef, ElementRef, afterNextRender, inject, input, output } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

let nextId = 0;

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * A dialog or side panel that opens inside a demo app window, not over the
 * whole page, the way the product's own modals and drawers open over the
 * product. Focus moves in on open, stays inside while open (Tab wraps),
 * Escape closes, and focus returns to whatever opened it.
 *
 * Render it with `@if`; it is open for as long as it exists.
 */
@Component({
  selector: 'app-demo-dialog',
  imports: [FaIconComponent],
  host: { '(keydown)': 'onKey($event)' },
  template: `
    <div class="dd-scrim" (click)="closed.emit()" aria-hidden="true"></div>
    <div class="dd" [class.dd--panel]="kind() === 'panel'" [class.dd--wide]="wide()" role="dialog" aria-modal="true" [attr.aria-labelledby]="titleId">
      <header class="dd__head">
        <h4 class="dd__title" [id]="titleId">{{ title() }}</h4>
        <button type="button" class="dd__close" [attr.aria-label]="'Close ' + title()" (click)="closed.emit()"><fa-icon [icon]="close" aria-hidden="true" /></button>
      </header>
      <div class="dd__body"><ng-content /></div>
      <footer class="dd__foot"><ng-content select="[dialogActions]" /></footer>
    </div>
  `,
  styles: `
    :host{position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;padding:16px}
    .dd-scrim{position:absolute;inset:0;background:rgb(15 23 42 / .45)}
    .dd{position:relative;display:flex;flex-direction:column;width:min(440px,100%);max-height:100%;border:1px solid var(--d-line);border-radius:12px;background:var(--d-card);color:var(--d-ink);box-shadow:0 24px 48px -20px rgb(15 23 42 / .5)}
    .dd--wide{width:min(620px,100%)}
    :host:has(.dd--panel){justify-content:flex-end;padding:0}
    .dd--panel{height:100%;max-height:none;width:min(560px,100%);border-radius:0;border-width:0 0 0 1px}
    .dd__head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px;border-bottom:1px solid var(--d-line)}
    .dd__title{margin:0;font-size:16px;font-weight:700;color:var(--d-ink)}
    .dd__close{display:grid;place-items:center;width:32px;height:32px;border:0;border-radius:50%;background:transparent;color:var(--d-mut);cursor:pointer}
    .dd__close:hover{background:var(--d-soft)}
    .dd__close:focus-visible{outline:3px solid var(--d-focus);outline-offset:1px}
    .dd__body{flex:1;min-height:0;overflow:auto;padding:18px}
    .dd__foot{display:flex;justify-content:flex-end;gap:8px;padding:12px 18px;border-top:1px solid var(--d-line)}
    .dd__foot:empty{display:none}
    @media (prefers-reduced-motion:no-preference){.dd{animation:dd-in .18s ease-out}.dd--panel{animation:dd-slide .22s ease-out}}
    @keyframes dd-in{from{opacity:0;transform:translateY(6px)}}
    @keyframes dd-slide{from{transform:translateX(24px);opacity:.4}}
  `,
})
export class DemoDialogComponent {
  readonly title = input.required<string>();
  /** A centred dialog, or a panel sliding in from the right edge of the app. */
  readonly kind = input<'dialog' | 'panel'>('dialog');
  readonly wide = input(false);
  readonly closed = output<void>();

  protected readonly close = faXmark;
  protected readonly titleId = `demo-dialog-${nextId++}`;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly opener = (typeof document !== 'undefined' ? document.activeElement : null) as HTMLElement | null;

  constructor() {
    // Hand focus back to the control that opened the dialog, if it is still there.
    inject(DestroyRef).onDestroy(() => {
      if (this.opener?.isConnected) this.opener.focus();
    });
    afterNextRender(() => {
      // The first field of the body, else the close button. Each selector part is scoped to the body.
      const inBody = FOCUSABLE.split(',').map((part) => '.dd__body ' + part).join(',');
      const first = this.host.querySelector<HTMLElement>(inBody) ?? this.host.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    });
  }

  protected onKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
      this.closed.emit();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = [...this.host.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
