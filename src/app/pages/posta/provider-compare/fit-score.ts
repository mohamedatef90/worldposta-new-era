import { COMPARISON_SUPPLEMENTS } from './comparison-supplements';
import { RIVALS, type EmailNeed, type ProviderId } from './provider-compare.data';
import { SCREENSHOT_COMPARISONS } from './screenshot-comparisons';

/**
 * Scores how well each provider fits the needs a visitor picked, using the same
 * cells the comparison table shows: ✓ counts 1, ⚠ counts ½, ✗ counts 0. Where
 * the table has no symbol for a need (or no row at all), the need's own `marks`
 * in provider-compare.data.ts decide.
 */

export type Status = 'yes' | 'partial' | 'no';

export interface FitResult {
  readonly id: ProviderId;
  readonly name: string;
  readonly initial: string;
  /** 0–100. */
  readonly score: number;
  readonly yes: number;
  readonly partial: number;
  readonly no: number;
}

const VALUE: Readonly<Record<Status, number>> = { yes: 1, partial: 0.5, no: 0 };
const INITIAL: Readonly<Record<ProviderId, string>> = { posta: 'P', microsoft: 'M', google: 'G', zoho: 'Z' };

function symbolStatus(cell: string): Status | null {
  const text = cell.trim();
  if (text.startsWith('✓')) return 'yes';
  if (text.startsWith('⚠')) return 'partial';
  if (text.startsWith('✗')) return 'no';
  return null;
}

/** Every table cell that answers this need for this provider. */
function cellsFor(needId: string, provider: ProviderId): readonly string[] {
  if (provider === 'posta') {
    return RIVALS.flatMap((rival) =>
      SCREENSHOT_COMPARISONS[rival.id].filter((row) => row.need === needId).map((row) => row.posta),
    );
  }
  const rows = SCREENSHOT_COMPARISONS[provider].filter((row) => row.need === needId).map((row) => row.rival);
  const extra = [
    COMPARISON_SUPPLEMENTS[needId]?.[provider],
    // The combined table shows "AI threat detection" as its own row under spam and phishing.
    needId === 'phishing' ? COMPARISON_SUPPLEMENTS['ai']?.[provider] : undefined,
  ].filter((cell): cell is string => Boolean(cell));
  return [...rows, ...extra];
}

/** 0–1 for one need: the average of its table cells, or its fallback mark. */
function needValue(need: EmailNeed, provider: ProviderId): number {
  const statuses = cellsFor(need.id, provider)
    .map(symbolStatus)
    .filter((status): status is Status => status !== null);
  if (statuses.length === 0) return VALUE[need.marks[provider]];
  return statuses.reduce((sum, status) => sum + VALUE[status], 0) / statuses.length;
}

export function fitFor(provider: ProviderId, name: string, picked: readonly EmailNeed[]): FitResult {
  const values = picked.map((need) => needValue(need, provider));
  const total = values.reduce((sum, value) => sum + value, 0);
  return {
    id: provider,
    name,
    initial: INITIAL[provider],
    score: picked.length ? Math.round((total / picked.length) * 100) : 0,
    yes: values.filter((v) => v === 1).length,
    partial: values.filter((v) => v > 0 && v < 1).length,
    no: values.filter((v) => v === 0).length,
  };
}
