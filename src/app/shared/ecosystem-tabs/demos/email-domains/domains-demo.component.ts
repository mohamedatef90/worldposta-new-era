import { Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft, faCheck, faCheckDouble, faChevronRight, faCircleCheck, faCircleExclamation, faCircleXmark, faClock,
  faCopy, faEllipsisVertical, faGlobe, faPlus, faSpinner, faStar, faTrashCan, faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { DemoDialogComponent } from '../demo-dialog.component';
import {
  DNS_SECTIONS, DomainsDemoStore, recordStatus,
  type DnsSection, type DomainInfo, type Organization, type RecordStatus,
} from './domains-demo.store';

type View = 'table' | 'stepper' | 'dns' | 'org-settings';
type Progress = 'idle' | 'verifying' | 'success';
const ALL_SECTIONS: readonly DnsSection[] = DNS_SECTIONS.map((s) => s.id);

/**
 * Email Admin Suite › Organizations & Domains, working: the organization list
 * and its domains table with health checks, the Add Domain stepper (verify
 * ownership with a TXT record, then the MX, SPF, DKIM and DMARC records with
 * copy buttons), per-domain DNS Configuration whose checks flip a domain to
 * HEALTH OK, primary domain, Organization Settings and confirmed deletes.
 * Ported from OrgsAndDomainsPage.tsx in the unified sign-in app; only the
 * page content is shown, without the suite's sidebar and top bar.
 */
@Component({
  selector: 'app-email-domains-demo',
  imports: [FaIconComponent, NgTemplateOutlet, DemoDialogComponent],
  templateUrl: './domains-demo.component.html',
  styleUrls: ['../demo.css', './domains-demo.component.css'],
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class DomainsDemoComponent {
  private readonly store = inject(DomainsDemoStore);

  protected readonly i = {
    back: faArrowLeft, check: faCheck, checkAll: faCheckDouble, chevron: faChevronRight, ok: faCircleCheck, bad: faCircleExclamation,
    error: faCircleXmark, pending: faClock, copy: faCopy, kebab: faEllipsisVertical, globe: faGlobe, plus: faPlus, spin: faSpinner,
    star: faStar, trash: faTrashCan, warn: faTriangleExclamation,
  };
  protected readonly sections = DNS_SECTIONS;
  protected readonly steps = ['Verify Domain', 'Configure DNS'];
  protected readonly statusIcon = { success: faCircleCheck, warning: faTriangleExclamation, error: faCircleXmark, pending: faClock };
  protected readonly statusText: Record<RecordStatus, string> = {
    success: 'Record verified', warning: 'Record has issues', error: 'Record missing or incorrect', pending: 'Verification pending',
  };

  protected readonly organizations = this.store.organizations;
  protected readonly activeOrgId = this.store.activeOrgId;
  protected readonly activeOrg = computed(() => this.organizations().find((o) => o.id === this.activeOrgId()) ?? null);
  protected readonly view = signal<View>('table');

  protected readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  /* ---------- Table: row menu, delete, primary ---------- */
  protected readonly openMenu = signal<string | null>(null);
  private menuTrigger: HTMLElement | null = null;
  protected readonly deleting = signal<DomainInfo | null>(null);

  protected toggleMenu(event: Event, id: string): void {
    event.stopPropagation();
    this.menuTrigger = event.currentTarget as HTMLElement;
    this.openMenu.update((open) => (open === id ? null : id));
  }
  protected closeMenu(): void {
    this.openMenu.set(null);
    this.menuTrigger?.focus();
  }
  protected onDocumentClick(event: Event): void {
    if (!(event.target as Element | null)?.closest('.d-menu-wrap')) this.openMenu.set(null);
  }

  protected setPrimary(d: DomainInfo): void {
    const org = this.activeOrg();
    this.closeMenu();
    if (!org) return;
    this.store.setPrimary(org.id, d.domainName);
    this.notify(`${d.domainName} is now the primary domain of ${org.name}.`);
  }
  protected askDelete(d: DomainInfo): void {
    this.closeMenu();
    this.deleting.set(d);
  }
  protected confirmDelete(): void {
    const d = this.deleting();
    const org = this.activeOrg();
    if (!d || !org) return;
    this.store.deleteDomain(org.id, d.id);
    this.deleting.set(null);
    this.notify(`${d.domainName} deleted from ${org.name}.`);
  }

  protected healthLabel(d: DomainInfo): string {
    return d.healthStatus === 'healthy' ? 'HEALTH OK' : d.healthStatus === 'warning' ? 'CHECK' : 'VERIFY NOW';
  }

  /* ---------- Add Domain stepper ---------- */
  protected readonly step = signal(0);
  protected readonly form = signal({ domain: '', organization: '' });
  protected readonly submitted = signal(false);
  protected readonly ownership = signal<Progress>('idle');
  protected readonly records = signal<Progress>('idle');
  protected readonly stepVerified = signal<Partial<Record<DnsSection, boolean>>>({});
  protected readonly txtValue = signal('');

  protected readonly errors = computed(() => {
    const f = this.form();
    const e: { domain?: string; organization?: string } = {};
    const name = f.domain.trim();
    if (!name) e.domain = 'Domain Name is required.';
    else if (!/^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(name)) e.domain = 'Enter a valid domain, for example yourdomain.com.';
    else if (this.organizations().some((o) => o.domains.some((d) => d.domainName === name))) e.domain = 'This domain is already added.';
    if (!f.organization.trim()) e.organization = 'Organization Name is required.';
    return e;
  });
  protected err(key: 'domain' | 'organization'): string | null {
    return this.submitted() ? (this.errors()[key] ?? null) : null;
  }

  protected startAdd(): void {
    this.step.set(0);
    this.form.set({ domain: '', organization: this.activeOrg()?.name ?? '' });
    this.submitted.set(false);
    this.ownership.set('idle');
    this.records.set('idle');
    this.stepVerified.set({});
    this.txtValue.set(`wp-verification-${Math.random().toString(16).slice(2, 10)}`);
    this.view.set('stepper');
  }

  protected setField(key: 'domain' | 'organization', value: string): void {
    this.form.update((f) => ({ ...f, [key]: key === 'domain' ? value.toLowerCase() : value }));
  }

  protected verifyOwnership(): void {
    this.submitted.set(true);
    if (Object.keys(this.errors()).length) return;
    this.ownership.set('verifying');
    setTimeout(() => {
      this.ownership.set('success');
      this.notify(`Ownership of ${this.form().domain.trim()} verified.`);
      setTimeout(() => this.step.set(1), 1000);
    }, 1500);
  }

  protected skipRecords(): void {
    this.finishAdd(false);
  }

  private finishAdd(healthy: boolean): void {
    const f = this.form();
    const domainName = f.domain.trim();
    const org = this.store.addDomain(f.organization.trim(), domainName, healthy);
    this.view.set('table');
    this.notify(healthy ? `${domainName} added to ${org.name}. HEALTH OK.` : `${domainName} added to ${org.name}. Finish its DNS records to clear the CHECK.`);
  }

  /* ---------- DNS Configuration (the stepper's second step, or an existing domain) ---------- */
  protected readonly dnsDomainId = signal<string | null>(null);
  protected readonly dnsDomain = computed(() => {
    const id = this.dnsDomainId();
    for (const o of this.organizations()) {
      const hit = o.domains.find((d) => d.id === id);
      if (hit) return hit;
    }
    return null;
  });
  protected readonly checking = signal<Partial<Record<DnsSection | 'all', boolean>>>({});

  protected openDns(d: DomainInfo): void {
    this.dnsDomainId.set(d.id);
    this.checking.set({});
    this.view.set('dns');
  }

  protected status(section: DnsSection, index: number): RecordStatus {
    const d = this.view() === 'dns' ? this.dnsDomain() : null;
    if (d) return recordStatus(d, section, index);
    return this.records() === 'success' || this.stepVerified()[section] ? 'success' : 'pending';
  }
  protected sectionDone(section: DnsSection): boolean {
    const d = this.view() === 'dns' ? this.dnsDomain() : null;
    if (d) return d.healthStatus === 'healthy' || d.verified[section];
    return this.records() === 'success' || !!this.stepVerified()[section];
  }
  protected readonly allDone = computed(() => {
    const d = this.view() === 'dns' ? this.dnsDomain() : null;
    return d ? d.healthStatus === 'healthy' : this.records() === 'success';
  });

  protected verifySection(section: DnsSection, title: string): void {
    this.checking.update((c) => ({ ...c, [section]: true }));
    const label = title.split(':')[0].replace('Configure ', '');
    setTimeout(() => {
      this.checking.update((c) => ({ ...c, [section]: false }));
      const d = this.view() === 'dns' ? this.dnsDomain() : null;
      if (!d) {
        this.stepVerified.update((v) => ({ ...v, [section]: true }));
        this.notify(`${label} found and verified.`);
        return;
      }
      const after = this.store.verify(d.id, [section]);
      this.notify(after?.healthStatus === 'healthy' ? `All records verified. ${d.domainName}: HEALTH OK.` : `${label} verified for ${d.domainName}.`);
    }, 1500);
  }

  protected verifyAll(): void {
    const d = this.view() === 'dns' ? this.dnsDomain() : null;
    if (!d) {
      this.records.set('verifying');
      setTimeout(() => {
        this.records.set('success');
        setTimeout(() => this.finishAdd(true), 1000);
      }, 1500);
      return;
    }
    this.checking.update((c) => ({ ...c, all: true }));
    setTimeout(() => {
      this.checking.update((c) => ({ ...c, all: false }));
      this.store.verify(d.id, ALL_SECTIONS);
      this.notify(`All DNS records verified. ${d.domainName}: HEALTH OK.`);
    }, 1500);
  }

  /* ---------- Copy buttons ---------- */
  protected readonly copied = signal<string | null>(null);
  private copiedTimer?: ReturnType<typeof setTimeout>;

  protected copy(key: string, value: string): void {
    const done = () => {
      this.copied.set(key);
      clearTimeout(this.copiedTimer);
      this.copiedTimer = setTimeout(() => this.copied.set(null), 2000);
      this.notify('Copied to clipboard.');
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(value).then(done, () => this.notify('Failed to copy text.'));
    else this.notify('Failed to copy text.');
  }

  /* ---------- Organization Settings ---------- */
  protected readonly orgDraft = signal({ name: '', description: '' });
  protected readonly orgSubmitted = signal(false);
  protected readonly deletingOrg = signal<Organization | null>(null);
  protected readonly orgNameError = computed(() => {
    const name = this.orgDraft().name.trim();
    if (!name) return 'Organization Name is required.';
    const clash = this.organizations().some((o) => o.id !== this.activeOrgId() && o.name.toLowerCase() === name.toLowerCase());
    return clash ? 'An organization with this name already exists.' : null;
  });

  protected openOrgSettings(): void {
    const org = this.activeOrg();
    if (!org) return;
    this.orgDraft.set({ name: org.name, description: org.description });
    this.orgSubmitted.set(false);
    this.view.set('org-settings');
  }
  protected saveOrg(): void {
    const org = this.activeOrg();
    this.orgSubmitted.set(true);
    if (!org || this.orgNameError()) return;
    const d = this.orgDraft();
    this.store.updateOrg(org.id, d.name.trim(), d.description.trim());
    this.view.set('table');
    this.notify(`${d.name.trim()} saved.`);
  }
  protected confirmDeleteOrg(): void {
    const org = this.deletingOrg();
    if (!org) return;
    this.store.deleteOrg(org.id);
    this.deletingOrg.set(null);
    this.view.set('table');
    this.notify(`${org.name} deleted.`);
  }

  /* ---------- Shared ---------- */
  protected notify(text: string): void {
    this.toast.set(text);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 3200);
  }
}
