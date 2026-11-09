import { Service, signal } from '@angular/core';

/**
 * Email Admin Suite transport rules, ported from the unified sign-in app's
 * RulesPage / RuleDetailsPage and their mock data
 * (user-types-of-worldposta-unified-sign-in: data.ts mockRules). The source
 * loads the same sample conditions for every rule; here each rule keeps its
 * own, matching its description. State lives for the visit; nothing leaves
 * the browser.
 */
export type RuleSection = 'condition' | 'action' | 'exception';

export interface RuleItem {
  readonly id: string;
  readonly type: string;
  readonly value: readonly string[];
}

export interface Rule {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly status: 'enabled' | 'disabled';
  readonly creationDate: string;
  readonly lastModified: string;
  readonly conditions: readonly RuleItem[];
  readonly actions: readonly RuleItem[];
  readonly exceptions: readonly RuleItem[];
}

export const CONDITION_OPTIONS: readonly string[] = [
  'The sender is...',
  'The recipient is...',
  'The subject or body includes...',
  'Any attachment content includes...',
  'The sender is member of...',
  'The recipient is member of...',
  'The sender address includes...',
  'The recipient address includes...',
  'The sender domain is...',
  'The recipient domain is...',
  'The Attachment Found...',
  'Message Type Match..',
];

export const ACTION_OPTIONS: readonly string[] = [
  'Forward the message for approval to...',
  'Redirect the message to...',
  'Reject the message with the explanation...',
  'Delete the message without notifying anyone...',
  'Bcc the message to...',
  'Append the disclaimer...',
];

/** The people and groups the suite offers when a rule item needs recipients. */
export const RULE_MEMBERS: readonly string[] = [
  'john.doe@alpha-inc.com',
  'jane.smith@alpha-inc.com',
  'sales@alpha-inc.com (Group)',
  'support@betadivision.net (Group)',
  'peter.jones@betadivision.net',
  'mary.w@alpha-inc.com',
  'hr@alpha-inc.com (Group)',
  'ceo@alpha-inc.com',
  'billing@alpha-inc.com (Group)',
];

/** Items that pick people or groups; the rest take typed words, domains or text. */
export const MEMBER_ITEMS: readonly string[] = [
  'The sender is...', 'The recipient is...', 'The sender is member of...', 'The recipient is member of...',
  'Forward the message for approval to...', 'Redirect the message to...', 'Bcc the message to...',
];
/** Items that need no value at all. */
export const VALUELESS_ITEMS: readonly string[] = ['Delete the message without notifying anyone...'];

let seq = 0;
export const itemId = (): string => `ri_${++seq}`;
const item = (type: string, ...value: string[]): RuleItem => ({ id: itemId(), type, value });

const MOCK_RULES: readonly Rule[] = [
  {
    id: 'rule1', name: 'Block Spam', description: 'Moves emails with high spam score to Junk folder.', status: 'enabled',
    creationDate: '2023-01-10T12:00:00Z', lastModified: '2023-10-25T08:30:00Z',
    conditions: [item('Message Type Match..', 'Spam (SCL 5 or higher)')],
    actions: [item('Redirect the message to...', 'support@betadivision.net (Group)')],
    exceptions: [item('The sender is member of...', 'hr@alpha-inc.com (Group)')],
  },
  {
    id: 'rule2', name: 'Forward Invoices', description: 'Forwards emails with "invoice" in subject to billing@alpha.inc.', status: 'enabled',
    creationDate: '2023-02-15T14:00:00Z', lastModified: '2023-09-30T10:00:00Z',
    conditions: [item('The subject or body includes...', 'invoice')],
    actions: [item('Bcc the message to...', 'billing@alpha-inc.com (Group)')],
    exceptions: [],
  },
  {
    id: 'rule3', name: 'Vacation Auto-Reply (Old)', description: 'Old auto-reply for holidays.', status: 'disabled',
    creationDate: '2022-12-20T10:00:00Z', lastModified: '2023-01-05T11:00:00Z',
    conditions: [item('The recipient is...', 'jane.smith@alpha-inc.com')],
    actions: [item('Forward the message for approval to...', 'john.doe@alpha-inc.com')],
    exceptions: [item('The sender is member of...', 'hr@alpha-inc.com (Group)')],
  },
];

@Service()
export class RulesDemoStore {
  private readonly state = signal<Rule[]>([...MOCK_RULES]);
  readonly rules = this.state.asReadonly();

  add(rule: Rule): void {
    this.state.update((all) => [...all, rule]);
  }

  update(id: string, change: Partial<Omit<Rule, 'id' | 'creationDate'>>): void {
    const lastModified = new Date().toISOString();
    this.state.update((all) => all.map((r) => (r.id === id ? { ...r, ...change, lastModified } : r)));
  }

  remove(id: string): void {
    this.state.update((all) => all.filter((r) => r.id !== id));
  }
}
