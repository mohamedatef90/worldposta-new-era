import { Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { SiteHeaderComponent } from '@/shared/site-header/site-header.component';
import { MainNavLinksComponent } from '@/shared/main-nav-links/main-nav-links.component';
import { SiteFooterComponent } from '@/shared/site-footer/site-footer.component';

import { PageJumpNavComponent } from '@/shared/page-jump-nav/page-jump-nav.component';
@Component({
  imports: [PageJumpNavComponent, NgOptimizedImage, SiteHeaderComponent, MainNavLinksComponent, SiteFooterComponent],
  templateUrl: './wpsys-soc.component.html',
  styleUrl: './wpsys-soc.component.css',
})
export class WpsysSoc {
  protected readonly contactStatus = signal('');
  protected submitSocContact(event: Event): void {
    event.preventDefault();
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.reportValidity()) return;
    const data = new FormData(form);
    const body = ['WPSYS SOC consultation request',
      'Name: ' + String(data.get('fullName') ?? ''),
      'Company: ' + String(data.get('company') ?? ''),
      'Business email: ' + String(data.get('email') ?? ''),
      'Phone: ' + String(data.get('phone') ?? ''),
      'Job title: ' + String(data.get('jobTitle') ?? ''),
      'Requirements: ' + String(data.get('requirements') ?? ''),
    ].join('\n');
    window.location.href = 'mailto:hello@worldposta.com?subject=WPSYS%20SOC%20Consultation%20Request&body=' + encodeURIComponent(body);
    this.contactStatus.set('Your enquiry is ready in your email app. Review and send it to contact our SOC team.');
  }

  protected readonly socAdvantages = [
    { tone: 'blue', title: 'Modern & Scalable', description: 'Cloud-native SOC built to scale with your business, without the cost and complexity of on-premise infrastructure.', icon: 'M10 31a9 9 0 0 1-2-18 12 12 0 0 1 23 2 8 8 0 0 1-1 16Z' },
    { tone: 'green', title: 'Expert-Led Protection', description: '24/7 monitoring by certified security analysts using advanced threat intelligence and AI-driven detection.', icon: 'M20 3c5 4 10 5 14 7v11c0 8-8 13-14 17C14 34 6 29 6 21V10c4-2 9-3 14-7ZM20 12v14m-6-6 6 6 6-6' },
    { tone: 'purple', title: 'Faster, Smarter Response', description: 'Automated alert correlation and guided investigation to detect, contain and eliminate threats before they impact your business.', icon: 'M6 35V23h7v12M17 35V13h7v22M28 35V4h7v31M4 15l10-8 9 2 12-7' },
  ];
  protected readonly socAssurances = [
    { tone: 'green', title: '24/7 Monitoring', description: 'Around-the-clock coverage across all environments.', icon: 'M36 20a16 16 0 1 1-32 0 16 16 0 0 1 32 0ZM20 9v12h9' },
    { tone: 'blue', title: 'Global Threat Intelligence', description: 'Real-time insights from worldwide threat sources.', icon: 'M36 20a16 16 0 1 1-32 0 16 16 0 0 1 32 0ZM4 20h32M7 11h26M7 29h26M20 4c-10 9-10 23 0 32 10-9 10-23 0-32Z' },
    { tone: 'purple', title: 'Certified Analysts', description: 'Expert security team with proven experience.', icon: 'M26 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM8 36V26c0-10 24-10 24 0v10ZM8 5a5 5 0 0 0 0 10M32 5a5 5 0 0 1 0 10M3 32V22c0-4 4-5 7-5M37 32V22c0-4-4-5-7-5' },
    { tone: 'amber', title: 'Cloud-Native Platform', description: 'Scalable, secure and always up to date.', icon: 'M5 5h30v8H5ZM5 17h30v8H5ZM5 29h30v8H5ZM10 9h2m-2 12h2m-2 12h2M25 9h5m-5 12h5m-5 12h5' },
  ];

  protected readonly keyBenefits = [
    { tone: 'green', title: '24/7 Monitoring & Response', description: 'Continuous monitoring by expert analysts, with rapid incident response.', icon: 'M20 3c5 4 10 5 14 7v11c0 8-8 13-14 17C14 34 6 29 6 21V10c4-2 9-3 14-7Z' },
    { tone: 'blue', title: 'Advanced Threat Detection', description: 'Detect and stop advanced threats using AI and global threat intelligence.', icon: 'M34 20a14 14 0 1 1-28 0 14 14 0 0 1 28 0ZM20 2v10M20 28v10M2 20h10M28 20h10M24 20a4 4 0 1 1-8 0 4 4 0 0 1 8 0' },
    { tone: 'purple', title: 'Maximum Uptime', description: 'Cloud-based infrastructure ensures high availability and continuous protection.', icon: 'M10 31a9 9 0 0 1-2-18 12 12 0 0 1 23 2 8 8 0 0 1-1 16Z' },
    { tone: 'amber', title: 'Scalable & Flexible', description: 'Easily scale to meet your business needs across multiple locations and cloud environments.', icon: 'M33 9c0 8-26 8-26 0s26-8 26 0ZM7 9v22c0 8 26 8 26 0V9M7 17c0 8 26 8 26 0M7 24c0 8 26 8 26 0' },
    { tone: 'green', title: 'Compliance Ready', description: 'Support for industry standards and regulatory requirements (e.g. ISO, NIST, GDPR).', icon: 'M8 3h17l8 8v26H8ZM25 3v9h8M14 19h13M14 25h13M14 31h9' },
    { tone: 'blue', title: 'Lower Risk & Cost', description: 'Reduce security risks and avoid costly downtime with a proactive, cost-efficient SOC.', icon: 'M36 20a16 16 0 1 1-32 0 16 16 0 0 1 32 0ZM20 8v24M26 13c-8-6-17 5-6 7s3 13-6 7' },
  ];

  protected readonly workflowSteps = [
    { tone: 'blue', title: 'Collect & Monitor', description: '24/7 monitoring of logs, devices, cloud environments and applications.', icon: 'M10 31a9 9 0 0 1-2-18 12 12 0 0 1 23 2 8 8 0 0 1-1 16ZM20 35V18m-6 6 6-6 6 6' },
    { tone: 'green', title: 'Detect & Analyze', description: 'Advanced threat detection, correlation and AI-driven analysis to identify suspicious activity.', icon: 'M28 17a11 11 0 1 1-22 0 11 11 0 0 1 22 0ZM25 25l10 10' },
    { tone: 'purple', title: 'Investigate', description: 'Our security experts analyze incidents, validate threats and determine the impact and best response.', icon: 'M20 3c5 4 10 5 14 7v11c0 8-8 13-14 17C14 34 6 29 6 21V10c4-2 9-3 14-7ZM12 20l6 6 11-13' },
    { tone: 'amber', title: 'Respond & Contain', description: 'Immediate actions to contain, mitigate and neutralize threats, minimizing business disruption.', icon: 'm16 3 8 0 2 5 5 2 5-1 3 6-4 4v5l4 4-3 6-5-1-5 2-2 5h-8l-2-5-5-2-5 1-3-6 4-4v-5l-4-4 3-6 5 1 5-2ZM27 21a7 7 0 1 1-14 0 7 7 0 0 1 14 0' },
    { tone: 'blue', title: 'Report & Improve', description: 'Detailed reporting, root cause analysis and continuous improvement to strengthen your security posture.', icon: 'M8 3h17l8 8v26H8ZM25 3v9h8M14 19h13M14 25h13M14 31h9' },
  ];
  protected readonly workflowOutcomes = [
    { tone: 'green', title: 'Faster Response Times', description: 'Reduce dwell time and prevent wider impact.', icon: 'M20 3c5 4 10 5 14 7v11c0 8-8 13-14 17C14 34 6 29 6 21V10c4-2 9-3 14-7Z' },
    { tone: 'blue', title: 'Greater Visibility', description: 'Unified view across cloud, on-premise and hybrid environments.', icon: 'M6 35V23h7v12M17 35V13h7v22M28 35V4h7v31' },
    { tone: 'purple', title: 'Stronger Security Posture', description: 'Continuous monitoring and proactive threat hunting.', icon: 'M33 9c0 8-26 8-26 0s26-8 26 0ZM7 9v22c0 8 26 8 26 0V9M7 17c0 8 26 8 26 0M7 24c0 8 26 8 26 0' },
    { tone: 'amber', title: 'Lower Risk & Cost', description: 'Detect and resolve threats early, avoiding costly downtime and breaches.', icon: 'M33 9c0 8-26 8-26 0s26-8 26 0ZM7 9v22c0 8 26 8 26 0V9M7 17c0 8 26 8 26 0M7 24c0 8 26 8 26 0' },
  ];

  protected readonly features = [
    { tone: 'green', title: '24/7 Threat Monitoring', description: 'Continuous monitoring across your cloud and on-premise environments.', icon: 'M20 3c5 4 10 5 14 7v11c0 8-8 13-14 17C14 34 6 29 6 21V10c4-2 9-3 14-7ZM12 20l6 6 11-13' },
    { tone: 'blue', title: 'Advanced Threat Detection', description: 'Identify and stop threats before they impact your business.', icon: 'M28 17a11 11 0 1 1-22 0 11 11 0 0 1 22 0ZM25 25l10 10' },
    { tone: 'purple', title: 'Rapid Incident Response', description: 'Expert analysts respond quickly to contain and remediate threats.', icon: 'm22 3-13 20h11l-4 14 15-23H21l5-11Z' },
    { tone: 'amber', title: 'Global Threat Intelligence', description: 'Leverage real-time intelligence from global threat feeds and AI analytics.', icon: 'M14 20a5 5 0 1 1-10 0 5 5 0 0 1 10 0ZM35 7a5 5 0 1 1-10 0 5 5 0 0 1 10 0ZM35 33a5 5 0 1 1-10 0 5 5 0 0 1 10 0ZM14 17l11-7M14 23l11 7' },
    { tone: 'green', title: 'Cloud-Native & Scalable', description: 'Built for modern IT environments with flexible, scalable deployment.', icon: 'M10 31a9 9 0 0 1-2-18 12 12 0 0 1 23 2 8 8 0 0 1-1 16Z' },
    { tone: 'blue', title: 'Compliance & Reporting', description: 'Get detailed reports to meet industry and regulatory requirements.', icon: 'M8 3h17l8 8v26H8ZM25 3v9h8M14 19h13M14 25h13M14 31h9' },
  ];
}

