import { Component, computed, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SiteHeaderComponent } from '@/shared/site-header/site-header.component';
import { SiteFooterComponent } from '@/shared/site-footer/site-footer.component';
import { CASE_STUDIES } from './case-studies.data';

const unique = (values: readonly string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b));

@Component({
  imports: [NgOptimizedImage, RouterLink, SiteHeaderComponent, SiteFooterComponent],
  templateUrl: './case-studies.component.html',
  styleUrl: './case-studies.component.css',
})
export class CaseStudies {
  protected readonly countries = unique(CASE_STUDIES.map((study) => study.country));
  protected readonly services = unique(CASE_STUDIES.flatMap((study) => study.services));
  protected readonly industries = unique(CASE_STUDIES.map((study) => study.industry));

  protected readonly country = signal('');
  protected readonly service = signal('');
  protected readonly industry = signal('');
  protected readonly view = signal<'grid' | 'list'>('grid');

  protected readonly results = computed(() =>
    CASE_STUDIES.filter(
      (study) =>
        (!this.country() || study.country === this.country()) &&
        (!this.service() || study.services.includes(this.service())) &&
        (!this.industry() || study.industry === this.industry()),
    ),
  );
  protected readonly filtered = computed(() => !!(this.country() || this.service() || this.industry()));

  protected pick(target: EventTarget | null, field: 'country' | 'service' | 'industry'): void {
    if (!(target instanceof HTMLSelectElement)) return;
    this[field].set(target.value);
  }

  protected reset(): void {
    this.country.set('');
    this.service.set('');
    this.industry.set('');
  }
}
