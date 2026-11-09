import { Service, signal } from '@angular/core';

/**
 * A customer's team: users, permission groups and the roles they grant,
 * ported from the portal's CustomerTeamManagementPage, AddTeamUserPage and
 * EditTeamUserPage with their mock data (MOCK_USERS, MOCK_USER_GROUPS,
 * MOCK_ROLES in user-types-of-worldposta-unified-sign-in). State lives for
 * the visit; passwords are validated but never stored.
 */
export interface Role {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

export interface AssignedResource {
  readonly id: string;
  readonly productId: 'posta' | 'cloudedge';
  readonly packageId: string;
  readonly organizationId: string;
  readonly domainIds: readonly string[];
}

export interface TeamUser {
  readonly id: string;
  readonly fullName: string;
  readonly displayName: string;
  readonly email: string;
  readonly phoneNumber: string;
  readonly assignedGroupId: string;
  readonly mfaEnabled: boolean;
  readonly resources: readonly AssignedResource[];
}

export interface UserGroup {
  readonly id: string;
  readonly name: string;
  readonly permissions: readonly string[];
}

/** The portal's first roles: its six core ones, then the start of its module roles. */
export const ROLES: readonly Role[] = [
  { id: 'view_billing', label: 'View Billing', description: 'Allows user to view invoices and payment history.' },
  { id: 'manage_billing', label: 'Manage Billing', description: 'Allows user to manage subscriptions and payment methods.' },
  { id: 'view_services', label: 'View Services', description: 'Grants read-only access to all subscribed services.' },
  { id: 'manage_services', label: 'Manage Services', description: 'Allows user to create, modify, and delete services.' },
  { id: 'admin_team_users', label: 'Administer Team Users', description: 'Grants full control over team members and groups.' },
  { id: 'view_action_logs', label: 'View Action Logs', description: 'Allows user to see the account activity log.' },
  { id: 'devops_delete_supplier', label: 'Delete Devops Supplier', description: 'Allows user to delete the supplier in the devops module.' },
  { id: 'project_edit_stock', label: 'Edit Project Stock', description: 'Allows user to edit the stock in the project module.' },
  { id: 'marketing_approve_deal', label: 'Approve Marketing Deal', description: 'Allows user to approve the deal in the marketing module.' },
  { id: 'crm_configure_payroll', label: 'Configure Crm Payroll', description: 'Allows user to configure the payroll in the crm module.' },
  { id: 'inventory_create_ticket', label: 'Create Inventory Ticket', description: 'Allows user to create the ticket in the inventory module.' },
  { id: 'project_import_contact', label: 'Import Project Contact', description: 'Allows user to import the contact in the project module.' },
  { id: 'security_configure_deal', label: 'Configure Security Deal', description: 'Allows user to configure the deal in the security module.' },
  { id: 'analytics_approve_contact', label: 'Approve Analytics Contact', description: 'Allows user to approve the contact in the analytics module.' },
  { id: 'support_create_timesheet', label: 'Create Support Timesheet', description: 'Allows user to create the timesheet in the support module.' },
  { id: 'devops_edit_deal', label: 'Edit Devops Deal', description: 'Allows user to edit the deal in the devops module.' },
  { id: 'marketing_view_report', label: 'View Marketing Report', description: 'Allows user to view the report in the marketing module.' },
  { id: 'hr_edit_contact', label: 'Edit Hr Contact', description: 'Allows user to edit the contact in the hr module.' },
  { id: 'project_create_campaign', label: 'Create Project Campaign', description: 'Allows user to create the campaign in the project module.' },
  { id: 'finance_create_user_access', label: 'Create Finance User Access', description: 'Allows user to create the user access in the finance module.' },
];

export const PACKAGES = {
  posta: [{ id: 'posta-basic', name: 'Posta Basic Plan' }, { id: 'posta-standard', name: 'Posta Standard Plan' }, { id: 'posta-premium', name: 'Posta Premium Plan' }],
  cloudedge: [{ id: 'cloudedge-s1', name: 'CloudEdge Small Instance' }, { id: 'cloudedge-m1', name: 'CloudEdge Medium Instance' }, { id: 'cloudedge-l1', name: 'CloudEdge Large Instance' }],
} as const;
export const ORGANIZATIONS = [{ id: 'org-alpha', name: 'Alpha Inc.' }, { id: 'org-beta', name: 'Beta Division' }] as const;
export const DOMAINS = [{ id: 'dom-alpha', name: 'alpha-inc.com' }, { id: 'dom-beta', name: 'betadivision.net' }, { id: 'dom-gamma', name: 'gamma-corp.io' }] as const;

export const COMPANY = 'Alpha Inc.';

const GROUPS: readonly UserGroup[] = [
  { id: 'groupAlphaAdmins', name: 'Team Administrators', permissions: ['view_billing', 'manage_services', 'admin_team_users', 'view_action_logs'] },
  { id: 'groupAlphaViewers', name: 'Service Viewers', permissions: ['view_services', 'view_action_logs'] },
  { id: 'groupBillingManagers', name: 'Billing Managers', permissions: ['view_billing', 'manage_billing'] },
];

const USERS: readonly TeamUser[] = [
  { id: 'user456', fullName: 'Beta User (Team Alpha)', displayName: 'BetaUser', email: 'customer2@worldposta.com', phoneNumber: '', assignedGroupId: 'groupAlphaAdmins', mfaEnabled: true, resources: [] },
  { id: 'user789', fullName: 'Gamma Client (Team Alpha)', displayName: 'GammaClient', email: 'customer3@worldposta.com', phoneNumber: '', assignedGroupId: 'groupAlphaViewers', mfaEnabled: false, resources: [] },
  { id: 'user790', fullName: 'Delta Accountant (Team Alpha)', displayName: 'DeltaAccounts', email: 'customer4@worldposta.com', phoneNumber: '', assignedGroupId: 'groupBillingManagers', mfaEnabled: false, resources: [] },
];

@Service()
export class TeamDemoStore {
  private readonly userList = signal<TeamUser[]>([...USERS]);
  private readonly groupList = signal<UserGroup[]>([...GROUPS]);

  readonly users = this.userList.asReadonly();
  readonly groups = this.groupList.asReadonly();

  addUser(user: Omit<TeamUser, 'id'>): TeamUser {
    const created = { ...user, id: `user-${Date.now()}` };
    this.userList.update((list) => [...list, created]);
    return created;
  }

  updateUser(id: string, change: Partial<TeamUser>): void {
    this.userList.update((list) => list.map((u) => (u.id === id ? { ...u, ...change } : u)));
  }

  deleteUser(id: string): void {
    this.userList.update((list) => list.filter((u) => u.id !== id));
  }

  /** Creates or updates a group, then makes `memberIds` exactly its members. */
  saveGroup(id: string | null, name: string, permissions: readonly string[], memberIds: readonly string[]): UserGroup {
    const group: UserGroup = { id: id ?? `group-${Date.now()}`, name, permissions };
    this.groupList.update((list) => (id ? list.map((g) => (g.id === id ? group : g)) : [...list, group]));
    this.userList.update((list) =>
      list.map((u) =>
        memberIds.includes(u.id) ? { ...u, assignedGroupId: group.id } : u.assignedGroupId === group.id ? { ...u, assignedGroupId: '' } : u,
      ),
    );
    return group;
  }

  deleteGroup(id: string): void {
    this.groupList.update((list) => list.filter((g) => g.id !== id));
  }
}
