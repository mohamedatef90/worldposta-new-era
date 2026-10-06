import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, OnDestroy, afterNextRender, inject, signal } from '@angular/core';

/**
 * Fades an element in once it scrolls into view. Mirrors the "reveal on
 * scroll" treatment used across the marketing sections: elements start faded
 * out and translated down (via the `reveal` class, in each page's own CSS),
 * then settle into place the first time they cross into the viewport.
 */
@Directive({
  selector: '[appReveal]',
  host: {
    class: 'reveal',
    '[class.is-in]': 'isIn()',
  },
})
export class RevealDirective implements OnDestroy {
  private readonly element = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);

  protected readonly isIn = signal(false);
  private observer?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {
      const view = this.document.defaultView;
      if (!view || !('IntersectionObserver' in view)) {
        this.isIn.set(true);
        return;
      }

      this.observer = new view.IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              this.isIn.set(true);
              this.observer?.unobserve(entry.target);
            }
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
      );
      this.observer.observe(this.element.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
