import { Service, signal } from '@angular/core';

/**
 * Email Admin Suite distribution lists, ported from the unified sign-in app's
 * DistributionListsPage / EditDistributionListPage and their mock data
 * (user-types-of-worldposta-unified-sign-in: data.ts mockDistributionLists).
 * The source keeps no members, note or address-book flag on a list; the demo
 * adds them so the edit page's Members and Settings tabs work. State lives for
 * the visit; nothing leaves the browser.
 */
export interface DlMember {
  readonly email: string;
  readonly displayName: string;
}

export interface DistributionList {
  readonly id: string;
  readonly displayName: string;
  readonly primaryEmail: string;
  readonly creationDate: string;
  readonly managerEmail?: string;
  readonly note: string;
  readonly hideFromAddressBook: boolean;
  readonly members: readonly DlMember[];
}

const MOCK_LISTS: readonly DistributionList[] = [
  {
    id: 'dl1', displayName: 'All Employees', primaryEmail: 'all@alpha-inc.com', creationDate: '2023-01-20T10:00:00Z', managerEmail: 'admin@alpha-inc.com',
    note: '', hideFromAddressBook: false,
    members: [
      { displayName: 'John Doe', email: 'john.doe@alpha-inc.com' },
      { displayName: 'Jane Smith', email: 'jane.smith@alpha-inc.com' },
      { displayName: 'Sales Team', email: 'sales@alpha-inc.com' },
    ],
  },
  {
    id: 'dl2', displayName: 'Marketing Team', primaryEmail: 'marketing@alpha-inc.com', creationDate: '2023-02-15T11:30:00Z', managerEmail: 'manager@alpha-inc.com',
    note: '', hideFromAddressBook: false,
    members: [{ displayName: 'Jane Smith', email: 'jane.smith@alpha-inc.com' }],
  },
];

@Service()
export class DistributionListsDemoStore {
  private readonly state = signal<DistributionList[]>([...MOCK_LISTS]);
  readonly lists = this.state.asReadonly();

  add(list: DistributionList): void {
    this.state.update((all) => [list, ...all]);
  }

  update(list: DistributionList): void {
    this.state.update((all) => all.map((l) => (l.id === list.id ? list : l)));
  }

  remove(ids: readonly string[]): void {
    this.state.update((all) => all.filter((l) => !ids.includes(l.id)));
  }
}
