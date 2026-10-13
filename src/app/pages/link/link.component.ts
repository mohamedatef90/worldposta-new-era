import { Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { SiteHeaderComponent } from '@/shared/site-header/site-header.component';
import { MainNavLinksComponent } from '@/shared/main-nav-links/main-nav-links.component';

@Component({
  imports: [NgOptimizedImage, SiteHeaderComponent, MainNavLinksComponent],
  templateUrl: './link.component.html',
  styleUrl: './link.component.css',
})
export class PostaLink {
  protected readonly videoNotice = signal('');
  protected watchVideo(): void {
    this.videoNotice.set('The Posta Link video will be available soon. Contact our team for a product walkthrough.');
  }
}
