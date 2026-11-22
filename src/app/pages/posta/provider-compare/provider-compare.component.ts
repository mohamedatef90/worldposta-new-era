import { Component, computed, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheck, faChevronDown, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { EMAIL_NEEDS, NEED_GROUPS, RIVALS, type CompareWith, type EmailNeed, type NeedGroupId, type RivalId } from './provider-compare.data';
import { fitFor, type FitResult } from './fit-score';
import { SCREENSHOT_COMPARISONS } from './screenshot-comparisons';
import { COMPARISON_SUPPLEMENTS } from './comparison-supplements';

/** Provider-comparison rows, grouped the way the table accordion presents them. */
const COMPARE_THEMES: readonly { id: string; label: string; ids: readonly string[] }[] = [
  { id: 'email', label: 'Email & Outlook', ids: ['email', 'protocol', 'outlook', 'mobile', 'calendar', 'distribution', 'aliases', 'recall', 'rules', 'delegation'] },
  { id: 'security', label: 'Security & reliability', ids: ['phishing', 'ai', 'sandboxing', 'sla', 'security', 'mfa'] },
  { id: 'storage', label: 'Storage & recovery', ids: ['storage', 'recovery'] },
  { id: 'collab', label: 'Collaboration & apps', ids: ['files', 'chat', 'crm'] },
  { id: 'admin', label: 'Admin, licensing & migration', ids: ['admin', 'licensing', 'migration', 'domains'] },
];

const SCORE_SHORT: Readonly<Record<string, string>> = {
  posta: 'Posta',
  microsoft: 'Microsoft',
  google: 'Google',
  zoho: 'Zoho',
};

interface CompareRow {
  readonly id: string;
  readonly feature: string;
  readonly posta: string;
  readonly rivals: Partial<Record<RivalId, string>>;
}

function rowCell(row: CompareRow, provider: string): string {
  return provider === 'posta' ? row.posta : (row.rivals[provider as RivalId] ?? '—');
}

function isScoredCell(cell: string): boolean {
  const text = cell.trim();
  return text.startsWith('✓') || text.startsWith('⚠') || text.startsWith('✗');
}

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
  protected readonly icons = { check: faCheck, reset: faRotateLeft, chevron: faChevronDown };
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
  protected readonly activeGroup = signal<NeedGroupId>('daily');
  protected readonly openGroup = signal('email');

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
      storage: 'Mailbox storage', recovery: 'Recover deleted email', migration: 'Migration and coexistence',
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

  /** Columns in the comparison table and the score pills on each group. */
  protected readonly tableColumns = computed(() => {
    const rivals = this.compareWith() === 'all' ? this.rivals : this.visibleRivals();
    return [
      { id: 'posta' as const, short: 'Posta', heading: 'WorldPosta Posta' },
      ...rivals.map((rival) => ({ id: rival.id, short: SCORE_SHORT[rival.id], heading: rival.name })),
    ];
  });

  /** Comparison rows folded into themed accordion groups, with a coverage score per provider. */
  protected readonly compareGroups = computed(() => {
    const columns = this.tableColumns();
    const rows = this.comparisonRows();
    return COMPARE_THEMES.map((theme) => {
      const groupRows = theme.ids.flatMap((id) => rows.filter((row) => row.id === id));
      const scored = groupRows.filter((row) => columns.some((column) => isScoredCell(rowCell(row, column.id))));
      return {
        id: theme.id,
        label: theme.label,
        rows: groupRows,
        scores: columns.map((column) => ({
          id: column.id,
          name: column.short,
          covered: scored.filter((row) => rowCell(row, column.id).trim().startsWith('✓')).length,
          total: scored.length,
        })),
      };
    }).filter((group) => group.rows.length > 0);
  });

  /** The open accordion group. An empty value means every group is closed. */
  protected readonly shownGroup = computed(() => {
    const open = this.openGroup();
    if (!open) return '';
    const groups = this.compareGroups();
    return groups.some((group) => group.id === open) ? open : (groups[0]?.id ?? '');
  });

  /** One sentence for screen readers, announced as the scores change. */
  protected readonly fitSummary = computed(() => {
    const count = this.picked().length;
    return count
      ? `Fit for ${count} ${count === 1 ? 'need' : 'needs'}: ${this.fits().map((fit) => `${fit.name} ${fit.yes} of ${count}`).join(', ')}.`
      : '';
  });

  protected pickedIn(groupId: NeedGroupId): number {
    return this.groups.find((group) => group.id === groupId)?.needs.filter((need) => this.isOn(need.id)).length ?? 0;
  }

  protected activeNeeds(): readonly EmailNeed[] {
    return this.groups.find((group) => group.id === this.activeGroup())?.needs ?? [];
  }

  protected onNeedTabKey(event: KeyboardEvent, groupId: NeedGroupId): void {
    const ids = this.groups.map((group) => group.id);
    const index = ids.indexOf(groupId);
    const next = event.key === 'ArrowDown' || event.key === 'ArrowRight'
      ? ids[(index + 1) % ids.length]
      : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
        ? ids[(index - 1 + ids.length) % ids.length]
        : event.key === 'Home'
          ? ids[0]
          : event.key === 'End'
            ? ids[ids.length - 1]
            : null;
    if (!next) return;
    event.preventDefault();
    this.activeGroup.set(next);
    queueMicrotask(() => document.getElementById(`need-tab-${next}`)?.focus());
  }

  protected toggleCompareGroup(id: string): void {
    this.openGroup.update((current) => (current === id ? '' : id));
  }

  protected cell(row: CompareRow, provider: string): string {
    return rowCell(row, provider);
  }

  private comparisonRows(): readonly CompareRow[] {
    if (this.compareWith() === 'all') return this.allProviderRows();
    const rival = this.visibleRivals()[0];
    return this.screenshotRows(rival.id).map((row) => ({
      id: row.feature.toLowerCase().includes('ai threat') ? 'ai' : row.need,
      feature: row.feature,
      posta: row.posta,
      rivals: { [rival.id]: row.rival },
    }));
  }

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
    this.activeGroup.set('daily');
    this.openGroup.set('email');
  }
}
