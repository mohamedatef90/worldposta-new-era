import { Component, computed, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheck, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { EMAIL_NEEDS, NEED_GROUPS, RIVALS, type CompareWith, type EmailNeed } from './provider-compare.data';
import { fitFor, type FitResult } from './fit-score';
import { SCREENSHOT_COMPARISONS } from './screenshot-comparisons';
import { COMPARISON_SUPPLEMENTS } from './comparison-supplements';

/**
 * Interactive business email comparison: visitors tap what is true for their
 * team and pick a provider. The table narrows to match, and a fit scale shows
 * how well Posta Workspace and the compared providers each cover those needs.
 */
@Component({
  selector: 'app-provider-compare',
  imports: [FaIconComponent],
  templateUrl: './provider-compare.component.html',
  styleUrl: './provider-compare.component.css',
})
export class ProviderCompareComponent {
  protected readonly icons = { check: faCheck, reset: faRotateLeft };
  protected readonly needs = EMAIL_NEEDS;
  protected readonly rivals = RIVALS;
  protected readonly screenshotComparisons = SCREENSHOT_COMPARISONS;
  protected readonly groups = NEED_GROUPS.map((group) => ({
    ...group,
    needs: EMAIL_NEEDS.filter((need) => need.group === group.id),
  }));

  protected readonly selected = signal<readonly string[]>([]);
  protected readonly compareWith = signal<CompareWith>('all');
  protected readonly showAllRows = signal(false);

  protected readonly picked = computed(() => this.needs.filter((n) => this.selected().includes(n.id)));

  protected readonly visibleRivals = computed(() => {
    const pick = this.compareWith();
    return pick === 'all' ? this.rivals : this.rivals.filter((r) => r.id === pick);
  });

  protected readonly isFiltered = computed(() => this.picked().length > 0 && !this.showAllRows());
  protected readonly rows = computed<readonly EmailNeed[]>(() => (this.isFiltered() ? this.picked() : this.needs));
  protected screenshotRows(provider: 'microsoft' | 'google' | 'zoho') {
    const rows = this.screenshotComparisons[provider];
    if (!this.isFiltered()) return rows;
    const selected = this.selected();
    return rows.filter((row) => selected.includes(row.need) || (row.feature === 'Shared calendars & delegation' && selected.includes('delegation')) || (row.feature === 'Cloud office apps, file storage & video meetings' && selected.includes('chat')));
  }
  protected readonly allProviderRows = computed(() => {
    const labels: Readonly<Record<string, string>> = {
      protocol: 'Email protocol', outlook: 'Outlook desktop support', mobile: 'Mobile ActiveSync',
      calendar: 'Shared calendars', delegation: 'Mailbox delegation', distribution: 'Distribution lists',
      aliases: 'Email aliases', phishing: 'Built-in threat protection', ai: 'AI threat detection',
      sandboxing: 'Email sandboxing', sla: 'Uptime SLA', security: '24/7 support',
      files: 'Cloud office apps and file storage', chat: 'Video conferencing', admin: 'Admin panel',
      licensing: 'Licensing model', hosting: 'Regional data center options', recall: 'Email recall',
      rules: 'Server-side inbox rules', domains: 'Multi-domain support', mfa: 'MFA', crm: 'Zoho CRM integration',
    };
    const combined = new Map<string, { id: string; feature: string; posta: string; rivals: Partial<Record<'microsoft' | 'google' | 'zoho', string>> }>();
    for (const rival of this.rivals) {
      for (const row of this.screenshotComparisons[rival.id]) {
        const id = row.feature === 'AI threat detection' ? 'ai' : row.need;
        let entry = combined.get(id);
        if (!entry) {
          entry = { id, feature: labels[id] ?? row.feature, posta: row.posta, rivals: {} };
          combined.set(id, entry);
        }
        entry.rivals[rival.id] = row.rival;
      }
    }
    for (const [id, values] of Object.entries(COMPARISON_SUPPLEMENTS)) {
      const row = combined.get(id);
      if (row) row.rivals = { ...values, ...row.rivals };
    }
    const selected = this.selected();
    return [...combined.values()].filter((row) => !this.isFiltered() || selected.includes(row.id) || (row.id === 'ai' && selected.includes('phishing')) || (row.id === 'calendar' && selected.includes('delegation')) || (row.id === 'files' && selected.includes('chat')));
  });

  /** Fit scores: Posta Workspace first, then the providers being compared. */
  protected readonly fits = computed<readonly FitResult[]>(() => {
    const picked = this.picked();
    return [{ id: 'posta' as const, name: 'Posta Workspace' }, ...this.visibleRivals()].map((p) => fitFor(p.id, p.name, picked));
  });

  /** Pins on the fit scale; providers on the same score fan out side by side instead of hiding each other. */
  protected readonly pins = computed(() => {
    const fits = this.fits();
    return fits.map((fit) => {
      const tied = fits.filter((f) => f.score === fit.score);
      const index = tied.indexOf(fit);
      // Fan the cluster inward from its score, so pins at either end stay on the scale.
      const offset = fit.score >= 50 ? -(tied.length - 1 - index) * 22 : index * 22;
      return { ...fit, offset };
    });
  });

  /** One sentence for screen readers, announced as the scores change. */
  protected readonly fitSummary = computed(() =>
    this.picked().length
      ? `Fit for ${this.picked().length} needs: ${this.fits().map((f) => `${f.name} ${f.score}%`).join(', ')}.`
      : '',
  );

  protected isOn(id: string): boolean {
    return this.selected().includes(id);
  }

  protected toggle(id: string): void {
    this.selected.update((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  protected selectAll(): void {
    this.selected.set(this.needs.map((n) => n.id));
  }

  protected reset(): void {
    this.selected.set([]);
    this.compareWith.set('all');
    this.showAllRows.set(false);
  }
}
