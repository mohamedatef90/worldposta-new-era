import { Component, computed, effect, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { SiteHeaderComponent } from '@/shared/site-header/site-header.component';
import { SiteFooterComponent } from '@/shared/site-footer/site-footer.component';
import { CASE_STUDY_STORIES } from '../case-studies/case-studies.data';

@Component({
  imports: [NgOptimizedImage, RouterLink, SiteHeaderComponent, SiteFooterComponent],
  templateUrl: './case-study.component.html',
  styleUrl: './case-study.component.css',
})
export class CaseStudy {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly slug = toSignal(inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('slug') ?? '')), { initialValue: '' });
  protected readonly story = computed(() => CASE_STUDY_STORIES[this.slug()]);

  constructor() {
    effect(() => {
      const story = this.story();
      if (!this.slug()) return;
      if (!story) {
        void this.router.navigateByUrl('/case-studies');
        return;
      }
      this.title.setTitle(`${story.titleLead} ${story.titleAccent} | WorldPosta`);
    });
  }
}
