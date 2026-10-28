import { Component, computed, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faBolt, faBuilding, faChartLine, faCloudArrowUp, faCode, faDatabase, faEnvelope, faKey, faLandmark, faMagnifyingGlass, faSackDollar, faServer, faShareNodes, faShieldHalved, faUsers } from '@fortawesome/free-solid-svg-icons';
import { SiteHeaderComponent } from '@/shared/site-header/site-header.component';
import { MainNavLinksComponent } from '@/shared/main-nav-links/main-nav-links.component';
import { SiteFooterComponent } from '@/shared/site-footer/site-footer.component';

import { PageJumpNavComponent } from '@/shared/page-jump-nav/page-jump-nav.component';
@Component({
  imports: [PageJumpNavComponent, FaIconComponent, NgOptimizedImage, SiteHeaderComponent, MainNavLinksComponent, SiteFooterComponent],
  templateUrl: './posta-portal.component.html',
  styleUrl: './posta-portal.component.css',
})
export class PostaPortal {
  protected readonly icons = { search: faMagnifyingGlass };

  // What Is Posta Portal: the admin window lists one organization of each type; the gains float beside it.
  protected readonly adminNav = [
    { label: 'Organizations', icon: faUsers },
    { label: 'Mailboxes', icon: faEnvelope },
    { label: 'Security', icon: faShieldHalved },
    { label: 'Billing', icon: faDatabase },
    { label: 'Migration', icon: faCloudArrowUp },
    { label: 'Integrations', icon: faShareNodes },
  ];
  protected readonly portalAudiences = [
    { org: 'Organization A', label: 'Service Providers', tone: 'purple', icon: faServer },
    { org: 'Organization B', label: 'Government Organizations', tone: 'green', icon: faLandmark },
    { org: 'Organization C', label: 'Enterprises', tone: 'blue', icon: faBuilding },
  ];
  protected readonly portalGains = [
    { title: 'Improve Security', text: 'Built-in security and SOC integration', tone: 'green', icon: faShieldHalved },
    { title: 'Increase Efficiency', text: 'Automate and scale your operations', tone: 'blue', icon: faChartLine },
    { title: 'Unlock New Revenue', text: 'Offer branded email services under your own name', tone: 'amber', icon: faSackDollar },
  ];

  // Key Modules: the portal sidebar picks which module's preview the main pane shows.
  protected readonly keyModule = signal(0);
  protected onKeyModuleKey(event: KeyboardEvent): void {
    const step = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const count = this.portalModules.length;
    const next = (this.keyModule() + step + count) % count;
    this.keyModule.set(next);
    (event.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('[role=tab]')[next]?.focus();
  }
  protected readonly mailboxes = [
    { name: 'john@company.com', size: '50 GB' },
    { name: 'sales@company.com', size: '50 GB' },
    { name: 'support@company.com', size: '100 GB' },
  ];
  protected readonly securityMix = [
    { label: 'Clean', value: '98%', tone: 'green' },
    { label: 'Spam', value: '1.2%', tone: 'amber' },
    { label: 'Malware', value: '0.5%', tone: 'rose' },
    { label: 'Blocked', value: '0.3%', tone: 'purple' },
  ];
  protected readonly plans = [
    { name: 'Business Email', price: '$3 / user / month' },
    { name: 'Enterprise Email', price: '$5 / user / month' },
    { name: 'Custom Plan', price: 'Custom pricing' },
  ];
  protected readonly integrations = [
    { label: 'Azure AD', icon: faKey },
    { label: 'API', icon: faCode },
    { label: 'Webhooks', icon: faBolt },
    { label: 'ERP', icon: faBuilding },
  ];

  protected readonly demoStatus = signal('');
  protected submitDemo(event: Event): void {
    event.preventDefault();
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.reportValidity()) return;
    const data = new FormData(form);
    const body = ['Posta Portal demo request',
      'Name: ' + String(data.get('fullName') ?? ''),
      'Company: ' + String(data.get('company') ?? ''),
      'Business email: ' + String(data.get('email') ?? ''),
      'Phone: ' + String(data.get('phone') ?? ''),
      'Country: ' + String(data.get('country') ?? ''),
      'Interested in: ' + String(data.get('interest') ?? ''),
      'Requirements: ' + String(data.get('requirements') ?? ''),
      'Consent: I agree to be contacted by the WorldPosta team.',
    ].join('\n');
    window.location.href = 'mailto:hello@worldposta.com?subject=Posta%20Portal%20Demo%20Request&body=' + encodeURIComponent(body);
    this.demoStatus.set('Your demo request is ready in your email app. Review and send it to contact our team.');
  }

  // White-label: visitors type a company name and pick a color; the real admin dashboard shows that brand.
  protected readonly brandColors = [
    { name: 'Green', value: '#4f7d2f' },
    { name: 'Blue', value: '#126ddb' },
    { name: 'Purple', value: '#7a4ee3' },
    { name: 'Orange', value: '#c2410c' },
    { name: 'Teal', value: '#0f766e' },
    { name: 'Crimson', value: '#be123c' },
  ];
  protected readonly brandName = signal('Nile Telecom');
  protected readonly brandColor = signal(this.brandColors[0].value);
  protected readonly brandLabel = computed(() => this.brandName().trim() || 'YourBrand');
  protected readonly brandInitial = computed(() => this.brandLabel().charAt(0).toUpperCase());
  protected readonly brandDomain = computed(() => 'mail.' + (this.brandLabel().toLowerCase().replace(/[^a-z0-9]/g, '') || 'yourbrand') + '.com');

  // Platform tour: one list of capabilities; the selected one is shown in the portal window beside it.
  protected readonly tourModules = [
    { id: 'onboarding', tone: 'blue', nav: 'Customers', title: 'Customer Onboarding', description: 'Self-registration and easy customer management in a multi-tenant environment.', tags: ['Self-registration', 'Bulk import', 'Admin roles'], preview: 'Add new customer form with company name, administrator email and domain, and a Create customer button.', icon: 'M26 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM8 36V26c0-10 24-10 24 0v10ZM8 5a5 5 0 0 0 0 10M32 5a5 5 0 0 1 0 10M3 32V22c0-4 4-5 7-5M37 32V22c0-4-4-5-7-5' },
    { id: 'mailboxes', tone: 'green', nav: 'Mailboxes', title: 'Domain & Mailbox Management', description: 'Create and manage domains, mailboxes, aliases and policies with ease.', tags: ['Aliases', 'Quotas', 'Policies'], preview: 'Mailbox list: john, sales and support mailboxes active, hr mailbox suspended.', icon: 'M4 8h32v24H4ZM4 8l16 13L36 8' },
    { id: 'security', tone: 'purple', nav: 'Security', title: 'Advanced Security', description: 'Anti-spam, anti-malware, DLP and full SOC integration for maximum protection.', tags: ['Anti-spam', 'Anti-malware', 'DLP', 'SOC'], preview: 'Security overview: 98% clean, 1.2% spam, 0.5% malware, 0.3% blocked.', icon: 'M20 3c5 4 10 5 14 7v11c0 8-8 13-14 17C14 34 6 29 6 21V10c4-2 9-3 14-7ZM12 20l6 6 11-13' },
    { id: 'billing', tone: 'amber', nav: 'Billing', title: 'Billing & Subscription', description: 'Flexible plans, automated billing and full control over your customers.', tags: ['Your own pricing', 'Automated invoices', 'Usage reports'], preview: 'Subscription plans: Business, Enterprise and Custom, each with your own pricing.', icon: 'M33 9c0 8-26 8-26 0s26-8 26 0ZM7 9v22c0 8 26 8 26 0V9M7 17c0 8 26 8 26 0M7 24c0 8 26 8 26 0' },
    { id: 'migration', tone: 'blue', nav: 'Migration', title: 'Migration & Backup', description: 'Zero-downtime migration and reliable backup and recovery.', tags: ['Zero downtime', 'Progress tracking', 'Backup & restore'], preview: 'Migration progress: connect and validate done, migrating, 612 of 816 mailboxes moved.', icon: 'M10 31a9 9 0 0 1-2-18 12 12 0 0 1 23 2 8 8 0 0 1-1 16ZM20 35V18m-6 6 6-6 6 6' },
    { id: 'support', tone: 'green', nav: 'Support', title: 'Support & Ticketing', description: 'Integrated support system with AI-powered assistance to serve your customers.', tags: ['Ticketing', 'AI assistant', 'SLA tracking'], preview: 'Support ticket where the AI assistant suggests assigning a license to a new mailbox.', icon: 'M5 21v-4a15 15 0 0 1 30 0v4M5 19H2v11h7V19ZM35 19h3v11h-7V19ZM35 30c0 7-5 7-12 7' },
    { id: 'branding', tone: 'purple', nav: 'Branding', title: 'Customization & White-Labeling', description: 'Brand the platform as your own with custom domain, logo and settings.', tags: ['Custom domain', 'Logo & colors', 'Email templates'], preview: 'Branding settings: portal name, custom domain and brand color, with a Publish branding button.', icon: 'm16 3 8 0 2 5 5 2 5-1 3 6-4 4v5l4 4-3 6-5-1-5 2-2 5h-8l-2-5-5-2-5 1-3-6 4-4v-5l-4-4 3-6 5 1 5-2ZM27 21a7 7 0 1 1-14 0 7 7 0 0 1 14 0' },
    { id: 'integrations', tone: 'blue', nav: 'Integrations', title: 'API & Integrations', description: 'Open APIs and seamless integration with your existing systems and tools.', tags: ['REST API', 'Webhooks', 'SSO'], preview: 'Integrations: single sign-on, REST API, webhooks and ERP.', icon: 'm12 9-9 11 9 11M28 9l9 11-9 11M24 4l-8 32' },
  ];
  protected readonly activeModule = signal(0);
  protected readonly tourModule = computed(() => this.tourModules[this.activeModule()]);
  protected onTourKey(event: KeyboardEvent, index: number): void {
    const count = this.tourModules.length;
    const moves: Record<string, number> = { ArrowDown: (index + 1) % count, ArrowRight: (index + 1) % count, ArrowUp: (index - 1 + count) % count, ArrowLeft: (index - 1 + count) % count, Home: 0, End: count - 1 };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    this.activeModule.set(next);
    const tabs = (event.currentTarget as HTMLElement).closest('[role="tablist"]')?.querySelectorAll<HTMLElement>('[role="tab"]');
    tabs?.[next]?.focus();
  }

  // Original sections (overview, key features outcomes, key modules).
  protected readonly portalModules = [
    { id: 'onboarding', tone: 'blue', title: 'Customer Onboarding', description: 'Self-registration and easy customer management in a multi-tenant environment.', icon: 'M26 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM8 36V26c0-10 24-10 24 0v10ZM8 5a5 5 0 0 0 0 10M32 5a5 5 0 0 1 0 10M3 32V22c0-4 4-5 7-5M37 32V22c0-4-4-5-7-5', preview: 'Add New Customer: Company Name, Administrator Email, Domain Name, Create Customer.' },
    { id: 'mailboxes', tone: 'green', title: 'Domain & Mailbox Management', description: 'Create and manage domains, mailboxes, aliases and policies with ease.', icon: 'M4 8h32v24H4ZM4 8l16 13L36 8', preview: 'Mailboxes: Search mailboxes; john@company.com 50 GB Active; sales@company.com 50 GB Active; support@company.com 100 GB Active.' },
    { id: 'security', tone: 'purple', title: 'Advanced Security', description: 'Anti-spam, anti-malware, DLP and full SOC integration for maximum protection.', icon: 'M20 3c5 4 10 5 14 7v11c0 8-8 13-14 17C14 34 6 29 6 21V10c4-2 9-3 14-7ZM12 20l6 6 11-13', preview: 'Security Overview: 98% Secure; Clean 98%, Spam 1.2%, Malware 0.5%, Blocked 0.3%.' },
    { id: 'billing', tone: 'amber', title: 'Billing & Subscription Management', description: 'Flexible plans, automated billing and full control over your customers.', icon: 'M33 9c0 8-26 8-26 0s26-8 26 0ZM7 9v22c0 8 26 8 26 0V9M7 17c0 8 26 8 26 0M7 24c0 8 26 8 26 0', preview: 'Subscription Plans: Add Plan; Business Email $3 / user / month; Enterprise Email $5 / user / month; Custom Plan Custom pricing.' },
    { id: 'migration', tone: 'blue', title: 'Migration & Backup', description: 'Seamless migration and reliable backup for zero downtime.', icon: 'M10 31a9 9 0 0 1-2-18 12 12 0 0 1 23 2 8 8 0 0 1-1 16ZM20 35V18m-6 6 6-6 6 6', preview: 'Migration Progress: Connect, Validate, Migrate, Complete. 75%.' },
    { id: 'integrations', tone: 'green', title: 'Customization & Integrations', description: 'White-label the platform and integrate with your existing systems via API.', icon: 'm16 3 8 0 2 5 5 2 5-1 3 6-4 4v5l4 4-3 6-5-1-5 2-2 5h-8l-2-5-5-2-5 1-3-6 4-4v-5l-4-4 3-6 5 1 5-2ZM27 21a7 7 0 1 1-14 0 7 7 0 0 1 14 0', preview: 'Integrations: Azure AD, API, Webhooks, ERP.' },
  ];
  protected readonly platformOutcomes = [
    { tone: 'green', title: 'Improve Efficiency', description: 'Automate operations and reduce manual work.', icon: 'M6 35V23h7v12M17 35V13h7v22M28 35V4h7v31' },
    { tone: 'blue', title: 'Reduce Costs', description: 'Scale your email services without heavy investment.', icon: 'M36 20a16 16 0 1 1-32 0 16 16 0 0 1 32 0ZM20 9v12h9' },
    { tone: 'purple', title: 'Grow Your Business', description: 'Offer reliable, secure email services under your own brand.', icon: 'M4 32 16 20l7 6L36 8M25 8h11v11' },
    { tone: 'amber', title: 'All in One Place', description: 'Manage, secure and support your customers seamlessly.', icon: 'M26 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM8 36V26c0-10 24-10 24 0v10ZM8 5a5 5 0 0 0 0 10M32 5a5 5 0 0 1 0 10M3 32V22c0-4 4-5 7-5M37 32V22c0-4-4-5-7-5' },
  ];
  protected readonly portalFeatures = [
    { tone: 'blue', title: 'Multi-Tenant Management', description: 'Manage customers, domains and mailboxes from a single platform.', icon: 'M26 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM8 36V26c0-10 24-10 24 0v10ZM8 5a5 5 0 0 0 0 10M32 5a5 5 0 0 1 0 10M3 32V22c0-4 4-5 7-5M37 32V22c0-4-4-5-7-5' },
    { tone: 'green', title: 'Advanced Email Security', description: 'Anti-spam, anti-malware, DLP and integration with SOC for maximum protection.', icon: 'M20 3c5 4 10 5 14 7v11c0 8-8 13-14 17C14 34 6 29 6 21V10c4-2 9-3 14-7ZM12 20l6 6 11-13' },
    { tone: 'purple', title: 'Billing & Subscription Management', description: 'Flexible plans, automated billing and full control over your customers.', icon: 'M33 9c0 8-26 8-26 0s26-8 26 0ZM7 9v22c0 8 26 8 26 0V9M7 17c0 8 26 8 26 0M7 24c0 8 26 8 26 0' },
    { tone: 'amber', title: 'Migration & Backup', description: 'Seamless migration and reliable backup for zero downtime.', icon: 'M10 31a9 9 0 0 1-2-18 12 12 0 0 1 23 2 8 8 0 0 1-1 16ZM20 35V18m-6 6 6-6 6 6' },
    { tone: 'blue', title: 'Self-Service & AI Support', description: 'Customer self-registration, AI-powered support and ticketing.', icon: 'm16 3 8 0 2 5 5 2 5-1 3 6-4 4v5l4 4-3 6-5-1-5 2-2 5h-8l-2-5-5-2-5 1-3-6 4-4v-5l-4-4 3-6 5 1 5-2ZM27 21a7 7 0 1 1-14 0 7 7 0 0 1 14 0' },
    { tone: 'green', title: 'Customizable & Integrations', description: 'White-label, fully customizable and open for API integrations.', icon: 'M14 20a5 5 0 1 1-10 0 5 5 0 0 1 10 0ZM35 7a5 5 0 1 1-10 0 5 5 0 0 1 10 0ZM35 33a5 5 0 1 1-10 0 5 5 0 0 1 10 0ZM14 17l11-7M14 23l11 7' },
  ];
}

