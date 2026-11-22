import { Component, computed, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SiteHeaderComponent } from '@/shared/site-header/site-header.component';
import { SiteFooterComponent } from '@/shared/site-footer/site-footer.component';
import { CASE_STUDIES } from './case-studies.data';

@Component({
  imports: [NgOptimizedImage, RouterLink, SiteHeaderComponent, SiteFooterComponent],
  templateUrl: './case-studies.component.html',
  styleUrl: './case-studies.component.css',
})
export class CaseStudies {
  protected readonly northAmericaCountries = ['United States'] as const;
  protected readonly europeCountries = [] as string[];
  protected readonly southAsiaCountries = ['Pakistan'] as const;
  protected readonly middleEastCountries = ['Egypt', 'KSA', 'UAE'] as const;
  protected readonly industries = [...new Set(CASE_STUDIES.map((study) => study.industry))].sort((a, b) => a.localeCompare(b));
  protected readonly services = ['CloudEdge', 'Posta Workspace'] as const;

  protected readonly country = signal('');
  protected readonly service = signal('');
  protected readonly industry = signal('');
  protected readonly view = signal<'grid' | 'list'>('grid');

  protected readonly results = computed(() =>
    CASE_STUDIES.filter(
      (study) =>
        (!this.country() || study.country === this.country() ||
          (this.country() === 'North America' && this.northAmericaCountries.some((country) => country === study.country)) ||
          (this.country() === 'South Asia' && this.southAsiaCountries.some((country) => country === study.country)) ||
          (this.country() === 'Middle East' && this.middleEastCountries.some((country) => country === study.country)) ||
          (this.country() === 'Europe' && this.europeCountries.some((country) => country === study.country))) &&
        (!this.service() || study.category?.some((category) => category === this.service())) &&
        (!this.industry() || study.industry === this.industry()),
    ).sort((a, b) => {
      if (this.country()) return 0;
      const priority = (country: string) =>
        country === 'North America' || this.northAmericaCountries.some((item) => item === country) ? 0 : country === 'Pakistan' ? 1 : 2;
      return priority(a.country) - priority(b.country);
    }),
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
