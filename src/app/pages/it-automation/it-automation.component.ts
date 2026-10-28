import { ProductVisualComponent } from '@/shared/product-visual/product-visual.component';
import { Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { SiteHeaderComponent } from '@/shared/site-header/site-header.component';
import { MainNavLinksComponent } from '@/shared/main-nav-links/main-nav-links.component';
import { SiteFooterComponent } from '@/shared/site-footer/site-footer.component';

import { PageJumpNavComponent } from '@/shared/page-jump-nav/page-jump-nav.component';
@Component({
  imports: [PageJumpNavComponent, ProductVisualComponent, NgOptimizedImage, SiteHeaderComponent, MainNavLinksComponent, SiteFooterComponent],
  templateUrl: './it-automation.component.html',
  styleUrl: './it-automation.component.css',
})
export class ItAutomation {
  protected readonly automationContactStatus = signal('');
  protected submitAutomationContact(event: Event): void {
    event.preventDefault();
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.reportValidity()) return;
    const data = new FormData(form);
    const body = ['IT Automation consultation request',
      'Name: ' + String(data.get('fullName') ?? ''),
      'Company: ' + String(data.get('company') ?? ''),
      'Business email: ' + String(data.get('email') ?? ''),
      'Phone: ' + String(data.get('countryCode') ?? '') + ' ' + String(data.get('phone') ?? ''),
      'Job title: ' + String(data.get('jobTitle') ?? ''),
      'Industry: ' + String(data.get('industry') ?? ''),
      'Requirements: ' + String(data.get('requirements') ?? ''),
    ].join('\n');
    window.location.href = 'mailto:hello@worldposta.com?subject=IT%20Automation%20Consultation%20Request&body=' + encodeURIComponent(body);
    this.automationContactStatus.set('Your enquiry is ready in your email app. Review and send it to contact our team.');
  }

  protected readonly automationIndustries = [
    { id: 'finance', tone: 'blue', title: 'Financial Services', description: 'Automate IT operations, strengthen security and ensure compliance.', alt: 'Financial district office towers', icon: 'M3 15 20 4l17 11ZM7 18v14M15 18v14M25 18v14M33 18v14M4 35h32M8 18h24' },
    { id: 'logistics', tone: 'green', title: 'Logistics & Supply Chain', description: 'Ensure always-on operations with automated infrastructure and monitoring.', alt: 'Logistics warehouse and delivery trucks', icon: 'M3 8h22v21H3ZM25 17h8l5 8v4H25M12 31a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM35 31a4 4 0 1 1-8 0 4 4 0 0 1 8 0' },
    { id: 'pharma', tone: 'purple', title: 'Pharmaceutical', description: 'Automate systems, improve operational efficiency and maintain regulatory compliance.', alt: 'Pharmaceutical specialist using a tablet in a cleanroom', icon: 'M14 4h12v10h10v12H26v10H14V26H4V14h10Z' },
    { id: 'manufacturing', tone: 'amber', title: 'FMCG & Manufacturing', description: 'Automate repetitive tasks, optimize IT infrastructure and reduce downtime.', alt: 'Automated manufacturing production line with industrial robots', icon: 'M4 35V18l11 6V14l11 6V5h8v30ZM10 29h2m7 0h2m7 0h2' },
  ];

  protected readonly platformCapabilities = [
    { position: 'operations', tone: 'green', title: 'Intelligent IT Operations', description: 'Automate provisioning, monitoring and incident response.', tags: ['Provisioning', 'Monitoring', 'Incident Response'], icon: 'M5 5h30v8H5ZM5 17h30v8H5ZM5 29h30v8H5ZM10 9h2m-2 12h2m-2 12h2M25 9h5m-5 12h5m-5 12h5' },
    { position: 'infrastructure', tone: 'blue', title: 'Infrastructure Automation', description: 'Automate infrastructure as code, scaling, configuration and network management.', tags: ['IaC', 'Auto Scaling', 'Configuration', 'Networking'], icon: 'M10 31a9 9 0 0 1-2-18 12 12 0 0 1 23 2 8 8 0 0 1-1 16Z' },
    { position: 'devops', tone: 'purple', title: 'DevOps & CI/CD', description: 'Automate testing, deployment and release workflows.', tags: ['Build', 'Test', 'Deploy', 'Release'], icon: 'm12 9-9 11 9 11M28 9l9 11-9 11M24 4l-8 32' },
    { position: 'support', tone: 'amber', title: 'AI-Powered Support', description: 'Multilingual chatbot, intelligent routing and self-service automation.', tags: ['Chatbot', 'Ticket Routing', 'Self-Service'], icon: 'M5 21v-4a15 15 0 0 1 30 0v4M5 19H2v11h7V19ZM35 19h3v11h-7V19ZM35 30c0 7-5 7-12 7' },
    { position: 'security', tone: 'purple', title: 'Security Automation', description: 'Automate security processes, vulnerability management and compliance.', tags: ['Threat Detection', 'Vulnerability Management', 'Compliance'], icon: 'M20 3c5 4 10 5 14 7v11c0 8-8 13-14 17C14 34 6 29 6 21V10c4-2 9-3 14-7ZM12 20l6 6 11-13' },
  ];

  protected readonly capabilities = [
    { title: 'Infrastructure Automation', description: 'Provision, configure and manage servers, storage and networks automatically.', tone: 'blue', subject: 'Infrastructure%20Automation', icon: 'M5 5h30v8H5ZM5 17h30v8H5ZM5 29h30v8H5ZM10 9h2m-2 12h2m-2 12h2M25 9h5m-5 12h5m-5 12h5' },
    { title: 'Application Deployment', description: 'Automate application installations, updates and scaling.', tone: 'green', subject: 'Application%20Deployment', icon: 'm16 3 8 0 2 5 5 2 5-1 3 6-4 4v5l4 4-3 6-5-1-5 2-2 5h-8l-2-5-5-2-5 1-3-6 4-4v-5l-4-4 3-6 5 1 5-2ZM27 21a7 7 0 1 1-14 0 7 7 0 0 1 14 0' },
    { title: 'Security & Compliance', description: 'Automate security tasks, policy enforcement and compliance checks.', tone: 'purple', subject: 'Security%20and%20Compliance', icon: 'M20 3c5 4 10 5 14 7v11c0 8-8 13-14 17C14 34 6 29 6 21V10c4-2 9-3 14-7ZM12 20l6 6 11-13' },
    { title: 'Monitoring & Remediation', description: 'Detect issues, trigger automated actions and keep your systems healthy.', tone: 'amber', subject: 'Monitoring%20and%20Remediation', icon: 'M10 31a9 9 0 0 1-2-18 12 12 0 0 1 23 2 8 8 0 0 1-1 16Z' },
    { title: 'Backup & Disaster Recovery', description: 'Automate backups, recovery processes and routine testing.', tone: 'blue', subject: 'Backup%20and%20Disaster%20Recovery', icon: 'M33 9c0 8-26 8-26 0s26-8 26 0ZM7 9v22c0 8 26 8 26 0V9M7 17c0 8 26 8 26 0M7 24c0 8 26 8 26 0' },
    { title: 'IT Service Management', description: 'Automate routine IT tasks, user provisioning and access management.', tone: 'green', subject: 'IT%20Service%20Management', icon: 'M26 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM8 36V26c0-10 24-10 24 0v10ZM8 5a5 5 0 0 0 0 10M32 5a5 5 0 0 1 0 10M3 32V22c0-4 4-5 7-5M37 32V22c0-4-4-5-7-5' },
  ];
}
