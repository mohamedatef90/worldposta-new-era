import { NgOptimizedImage } from '@angular/common';
import { Component, signal } from '@angular/core';

import { SiteHeaderComponent } from '@/shared/site-header/site-header.component';
import { SiteFooterComponent } from '@/shared/site-footer/site-footer.component';
import { PageJumpNavComponent } from '@/shared/page-jump-nav/page-jump-nav.component';
@Component({
  imports: [PageJumpNavComponent, NgOptimizedImage, SiteHeaderComponent, SiteFooterComponent],
  templateUrl: './seamless-migration.component.html',
  styleUrl: './seamless-migration.component.css',
})
export class SeamlessMigration {
  protected readonly finalEnquiryStatus = signal('');
  protected submitFinalEnquiry(event: Event): void {
    event.preventDefault();
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.reportValidity()) return;
    const data = new FormData(form);
    const body = [
      'Migration consultation request',
      'First name: ' + String(data.get('firstName') ?? ''),
      'Last name: ' + String(data.get('lastName') ?? ''),
      'Business email: ' + String(data.get('email') ?? ''),
      'Company: ' + String(data.get('company') ?? ''),
      'Phone: ' + String(data.get('phone') ?? ''),
      'Country: ' + String(data.get('country') ?? ''),
      'Migration type: ' + String(data.get('migrationType') ?? ''),
      'Permission to contact regarding this enquiry: Yes',
      '',
      'Additional details:',
      String(data.get('details') ?? ''),
    ].join('\n');
    window.location.href = 'mailto:hello@worldposta.com?subject=Migration%20Consultation%20Request&body=' + encodeURIComponent(body);
    this.finalEnquiryStatus.set('Your email app will open with your request. Review and send the email to complete your enquiry.');
  }
  protected readonly migrationOutcomes = [
    { title: 'Faster Time to Value', description: 'Accelerate your migration and start realizing benefits sooner.', color: 'green', metric: '40%', direction: '↑', caption: 'Faster migration turnaround', icon: 'M14 26C13 14 25 5 36 4c0 12-9 24-21 24ZM23 14a4 4 0 1 1 8 0 4 4 0 0 1-8 0M14 17H7l-4 9h11M23 28v7l-9 4V28M9 30l-5 6m8-3-5 5' },
    { title: 'Lower Operational Costs', description: 'Optimize your infrastructure and eliminate unnecessary costs.', color: 'blue', metric: '30%', direction: '↓', caption: 'Reduction in infrastructure costs', icon: 'M7 10c0-8 23-8 23 0s-23 8-23 0M7 10v20c0 6 15 8 20 4M30 10v10M7 20c0 6 17 8 23 1M26 28c0-6 11-6 11 0s-11 6-11 0M26 28v6c0 6 11 6 11 0v-6' },
    { title: 'Improved Performance', description: 'Modernize your environment for better speed, scalability and reliability.', color: 'pink', metric: '50%', direction: '↑', caption: 'Better application performance', icon: 'M5 29a16 16 0 1 1 30 0M8 28h5M10 13l4 4M20 7v5M30 13l-4 4M27 19l-6 8M23 30a3 3 0 1 1-6 0 3 3 0 0 1 6 0' },
    { title: 'Stronger Security Posture', description: 'Reduce risk and stay compliant with industry standards.', color: 'amber', metric: '60%', direction: '↑', caption: 'Fewer security incidents', icon: 'M20 4 34 9v12c0 7-8 12-14 15C14 33 6 28 6 21V9ZM13 20l5 5 10-11' },
    { title: 'Business Continuity', description: 'Keep your business running with minimal disruption and maximum resilience.', color: 'purple', metric: '99.9%', direction: '↑', caption: 'Service availability', icon: 'M5 36V23h6v13M17 36V13h6v23M29 36V4h6v32M3 36h34' },
  ];
  protected readonly migrationTechnologies = [
    { title: 'Veeam', description: 'Reliable backup and replication for seamless migration.', brand: 'veeam', color: 'green', icon: '', features: ['Data protection', 'Fast recovery', 'Minimal downtime'] },
    { title: 'Rackware', description: 'Automated migration and workload mobility for complex environments.', brand: 'rackware', color: 'blue', icon: '', features: ['Automated migration', 'Workload orchestration', 'Reduced risk'] },
    { title: 'Veritas', description: 'Enterprise data management and migration solutions.', brand: 'veritas', color: 'green', icon: '', features: ['Secure data transfer', 'Consistent data integrity', 'Support for hybrid and multi-cloud'] },
    { title: 'VPN & Networking', description: 'Secure and reliable connectivity throughout the migration process.', brand: '', color: 'blue', icon: 'M15 14h10v13H15ZM18 14v-4a2 2 0 0 1 4 0v4M20 27v6M20 7V4M15 20H8m17 0h7M4 16h4v8H4ZM32 16h4v8h-4ZM18 33h4v4h-4ZM18 1h4v3h-4Z', features: ['Encrypted connections', 'Secure data transfer', 'Reliable performance'] },
    { title: 'Load Balancing', description: 'Ensure high availability and zero downtime during cutover.', brand: '', color: 'green', icon: 'M5 3h30v9H5ZM5 16h30v9H5ZM5 29h30v9H5ZM10 8h2m-2 12h2m-2 13h2M26 8h4m-4 12h4m-4 13h4', features: ['Traffic management', 'High availability', 'Business continuity'] },
    { title: 'Automation Tools', description: 'Intelligent automation to simplify and accelerate your migration.', brand: '', color: 'blue', icon: 'M16 4h8l2 5 5-1 5 6-3 5 3 5-5 6-5-1-2 6h-8l-2-6-5 1-5-6 3-5-3-5 5-6 5 1ZM26 20a6 6 0 1 1-12 0 6 6 0 0 1 12 0', features: ['Faster execution', 'Lower human error', 'Optimized performance'] },
  ];
  protected readonly migrationSecurity = [
    { title: 'End-to-End Encryption', description: 'Your data is encrypted during transfer and at rest to ensure maximum protection.', color: 'green', icon: 'M20 4 34 9v12c0 7-8 12-14 15C14 33 6 28 6 21V9ZM13 20l5 5 10-11' },
    { title: 'Secure Access Control', description: 'We implement strict access controls and identity management throughout the migration.', color: 'blue', icon: 'M5 19C5 0 35 0 35 19M10 20C10 6 30 6 30 20v4M15 20c0-8 10-8 10 0 0 7-2 13-6 17M20 18v4c0 7-4 12-8 14M10 25c0 5-2 7-5 9M30 29l-2 7M15 24c0 5-3 8-5 10' },
    { title: 'Network Security', description: 'Secure connectivity via VPN and advanced monitoring to protect your environment.', color: 'pink', icon: 'M24 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0M20 12v10M9 28v-6h22v6M13 32a4 4 0 1 1-8 0 4 4 0 0 1 8 0M35 32a4 4 0 1 1-8 0 4 4 0 0 1 8 0' },
    { title: 'Compliance Ready', description: 'We follow industry standards and compliance requirements to meet your regulatory needs.', color: 'amber', icon: 'M22 36H7V4h18l7 7v10M24 4v10h8M12 19h12M12 25h8M12 31h6M29 22l8 3v6c0 4-5 7-8 9-3-2-8-5-8-9v-6ZM25 30l3 3 5-6' },
    { title: 'Continuous Monitoring', description: 'Real-time monitoring and threat detection throughout the migration process.', color: 'purple', icon: 'M4 6h32v25H4ZM20 31v6M12 37h16M9 23l6-8 6 8 9-12' },
  ];
  protected readonly partnerBenefits = [
    { title: 'Zero Downtime', description: 'Keep your business running with minimal disruption.', color: 'green', icon: 'M20 4 34 9v12c0 7-8 12-14 15C14 33 6 28 6 21V9ZM13 20l5 5 10-11' },
    { title: 'Data Integrity', description: 'Ensure your data is accurate, complete and fully protected.', color: 'blue', icon: 'M7 10v20c0 8 26 8 26 0V10M7 10c0-8 26-8 26 0s-26 8-26 0M7 20c0 8 26 8 26 0' },
    { title: 'Security First', description: 'Built-in security and compliance at every stage of the migration.', color: 'purple', icon: 'M12 18v-7a8 8 0 0 1 16 0v7M8 18h24v19H8ZM20 26v5' },
    { title: 'Expert Team', description: 'Certified engineers with hands-on experience in complex migrations.', color: 'amber', icon: 'M25 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0M10 35v-6c0-10 20-10 20 0v6ZM8 11a4 4 0 0 0 0 8M32 11a4 4 0 0 1 0 8M7 24c-5 0-5 5-5 8h5M33 24c5 0 5 5 5 8h-5' },
    { title: 'Proven Technology', description: 'We use industry-leading tools and automation to ensure a smooth migration.', color: 'pink', icon: 'M16 4h8l2 5 5-1 5 6-3 5 3 5-5 6-5-1-2 6h-8l-2-6-5 1-5-6 3-5-3-5 5-6 5 1ZM26 20a6 6 0 1 1-12 0 6 6 0 0 1 12 0' },
    { title: 'End-to-End Support', description: 'From planning to post-migration optimization, we’re with you all the way.', color: 'green', icon: 'M5 36V23h6v13M17 36V13h6v23M29 36V4h6v32M3 36h34' },
  ];
  protected readonly businessNeeds = [
    'Flexible Migration Strategies',
    'Support for Complex Environments',
    'Minimal Business Disruption',
    'Compliance & Security Assurance',
    'Ongoing Optimization',
  ];
  protected readonly migrationSteps = [
    { number: '01', title: 'Assess', description: 'We analyze your current environment, applications and business goals.', color: 'blue', icon: 'M28 28 37 37M31 18a13 13 0 1 1-26 0 13 13 0 0 1 26 0' },
    { number: '02', title: 'Plan', description: 'We create a detailed migration strategy tailored to your environment, with clear timelines and minimal risk.', color: 'green', icon: 'M9 3h17l7 7v27H9ZM25 3v9h8M14 18h13M14 25h13M14 32h9' },
    { number: '03', title: 'Migrate', description: 'We securely migrate your data, workloads and applications using proven tools and best practices.', color: 'blue', icon: 'M12 33H9C-1 33 0 19 9 18 9 5 28 1 32 16c11 0 12 17 1 17h-6M20 35V17m-7 7 7-7 7 7' },
    { number: '04', title: 'Validate', description: 'We test and validate everything to ensure data integrity, performance and full functionality.', color: 'green', icon: 'M7 4h26v32H7ZM12 20l6 6 11-13' },
    { number: '05', title: 'Switch', description: 'We complete the cutover with minimal disruption, ensuring your business continues to run smoothly.', color: 'blue', icon: 'M16 4h8l2 5 5-1 5 6-3 5 3 5-5 6-5-1-2 6h-8l-2-6-5 1-5-6 3-5-3-5 5-6 5 1ZM26 20a6 6 0 1 1-12 0 6 6 0 0 1 12 0' },
    { number: '06', title: 'Optimize', description: 'We fine-tune your environment and provide ongoing support to ensure maximum performance.', color: 'green', icon: 'M5 36V23h6v13M17 36V13h6v23M29 36V4h6v32M3 36h34' },
  ];
  protected readonly migrationEnvironments = [
    { title: 'Physical to Cloud', description: 'Migrate your on-premise servers and infrastructure to the cloud with minimal disruption.', kind: 'physical', color: 'pink', icon: 'M8 5h24v8H8ZM8 16h24v8H8ZM8 27h24v8H8ZM12 9h2m-2 11h2m-2 11h2' },
    { title: 'Virtual to Cloud', description: 'Move your virtual machines and environments to a secure and scalable cloud platform.', kind: 'virtual', color: 'blue', icon: 'M5 6h30v22H5ZM20 28v7m-8 0h16' },
    { title: 'Cloud to Cloud', description: 'Migrate between cloud providers or regions seamlessly, with full data integrity.', kind: 'cloud', color: 'green', icon: 'M10 31h22c10 0 10-15 1-16C31 3 15 2 12 14 1 13 0 30 10 31Z' },
    { title: 'Data Center to Cloud', description: 'Transfer your entire data center to the cloud, including applications, databases and services.', kind: 'datacenter', color: 'purple', icon: 'M7 35V5h16v30M23 15h10v20M12 11h5m-5 7h5m-5 7h5m-5 7h5m11-11h2m-2 7h2M4 35h32' },
    { title: 'Hybrid Environments', description: 'Migrate and integrate across hybrid environments with a unified and secure approach.', kind: 'hybrid', color: 'amber', icon: 'M20 13v9M9 28v-6h22v6M16 5h8v8h-8ZM5 28h8v8H5ZM27 28h8v8h-8Z' },
  ];
}











