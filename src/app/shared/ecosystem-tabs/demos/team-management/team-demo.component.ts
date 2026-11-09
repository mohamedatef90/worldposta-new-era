import { Component, computed, inject, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft, faCircleCheck, faCirclePlus, faCircleXmark, faKey, faMagnifyingGlass, faPencil, faPlus, faTrashCan,
  faTriangleExclamation, faUserPlus,
} from '@fortawesome/free-solid-svg-icons';
import { DemoDialogComponent } from '../demo-dialog.component';
import {
  COMPANY, DOMAINS, ORGANIZATIONS, PACKAGES, ROLES, TeamDemoStore, type AssignedResource, type TeamUser, type UserGroup,
} from './team-demo.store';

type Page = 'users' | 'user-form' | 'groups' | 'group-form';

interface UserForm {
  fullName: string;
  displayName: string;
  email: string;
  password: string;
  phoneNumber: string;
  assignedGroupId: string;
  requirePasswordChange: boolean;
  enableMfa: boolean;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Team Management, working: Team Users (Add User with validation and
 * assigned resources, edit, change password, delete with "DELETE") and
 * Permission Groups (create, edit, delete, add and remove roles with the
 * Roles Count updating, and choose which users belong to the group).
 * Ported from user-types-of-worldposta-unified-sign-in/pages/customer
 * (CustomerTeamManagementPage, AddTeamUserPage, EditTeamUserPage). Only the
 * page content is shown, without the portal's sidebar and top bar.
 */
@Component({
  selector: 'app-team-management-demo',
  imports: [FaIconComponent, DemoDialogComponent],
  templateUrl: './team-demo.component.html',
  styleUrls: ['../demo.css', './team-demo.component.css'],
})
export class TeamDemoComponent {
  private readonly store = inject(TeamDemoStore);

  protected readonly i = {
    back: faArrowLeft, ok: faCircleCheck, add: faCirclePlus, remove: faCircleXmark, key: faKey, search: faMagnifyingGlass, edit: faPencil,
    plus: faPlus, trash: faTrashCan, warn: faTriangleExclamation, userPlus: faUserPlus,
  };
  protected readonly company = COMPANY;
  protected readonly users = this.store.users;
  protected readonly groups = this.store.groups;

  protected readonly page = signal<Page>('users');
  protected readonly tab = computed<'users' | 'groups'>(() => (this.page().startsWith('user') ? 'users' : 'groups'));
  protected readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  protected groupName(id: string): string {
    return this.groups().find((g) => g.id === id)?.name ?? 'N/A';
  }

  protected memberCount(group: UserGroup): number {
    return this.users().filter((u) => u.assignedGroupId === group.id).length;
  }

  /* ---------- Add / Edit Team User ---------- */
  protected readonly editingUser = signal<TeamUser | null>(null);
  protected readonly userForm = signal<UserForm>(this.blankUser());
  protected readonly resources = signal<AssignedResource[]>([]);
  protected readonly userSubmitted = signal(false);

  private blankUser(): UserForm {
    return {
      fullName: '', displayName: '', email: '', password: '', phoneNumber: '',
      assignedGroupId: this.store.groups()[0]?.id ?? '', requirePasswordChange: true, enableMfa: false,
    };
  }

  protected readonly userErrors = computed(() => {
    const f = this.userForm();
    const editing = this.editingUser();
    const e: Partial<Record<keyof UserForm, string>> = {};
    if (!f.fullName.trim()) e.fullName = 'Name is required.';
    if (!f.displayName.trim()) e.displayName = 'User Name is required.';
    else if (!/^[A-Za-z0-9._-]+$/.test(f.displayName.trim())) e.displayName = 'Use letters, numbers, dots, dashes or underscores.';
    if (!f.email.trim()) e.email = 'Email is required.';
    else if (!EMAIL.test(f.email.trim())) e.email = 'Enter a valid email address, e.g. user@company.com.';
    else if (this.users().some((u) => u.id !== editing?.id && u.email.toLowerCase() === f.email.trim().toLowerCase())) e.email = 'A team user with this email already exists.';
    if (!editing && !f.password) e.password = 'Password is required.';
    else if (f.password && f.password.length < 8) e.password = 'Password must be at least 8 characters long.';
    if (f.phoneNumber && !/^[+\d][\d\s()-]{5,}$/.test(f.phoneNumber.trim())) e.phoneNumber = 'Enter a valid phone number.';
    if (!f.assignedGroupId) e.assignedGroupId = 'Select a group.';
    return e;
  });

  protected readonly hasUserErrors = computed(() => Object.keys(this.userErrors()).length > 0);

  protected userError(key: keyof UserForm): string | null {
    return this.userSubmitted() ? (this.userErrors()[key] ?? null) : null;
  }

  protected setUserField<K extends keyof UserForm>(key: K, value: UserForm[K]): void {
    this.userForm.update((f) => ({ ...f, [key]: value }));
  }

  protected openAddUser(): void {
    this.editingUser.set(null);
    this.userForm.set(this.blankUser());
    this.resources.set([]);
    this.userSubmitted.set(false);
    this.page.set('user-form');
  }

  protected openEditUser(u: TeamUser): void {
    this.editingUser.set(u);
    this.userForm.set({
      fullName: u.fullName, displayName: u.displayName, email: u.email, password: '', phoneNumber: u.phoneNumber,
      assignedGroupId: u.assignedGroupId, requirePasswordChange: false, enableMfa: u.mfaEnabled,
    });
    this.resources.set([...u.resources]);
    this.userSubmitted.set(false);
    this.page.set('user-form');
  }

  protected saveUser(event: Event): void {
    event.preventDefault();
    this.userSubmitted.set(true);
    if (Object.keys(this.userErrors()).length) return;
    const f = this.userForm();
    const data = {
      fullName: f.fullName.trim(), displayName: f.displayName.trim(), email: f.email.trim(), phoneNumber: f.phoneNumber.trim(),
      assignedGroupId: f.assignedGroupId, mfaEnabled: f.enableMfa, resources: this.resources(),
    };
    const editing = this.editingUser();
    if (editing) {
      this.store.updateUser(editing.id, data);
      this.notify(`${data.fullName} updated.`);
    } else {
      this.store.addUser(data);
      this.notify('User added successfully!');
    }
    this.page.set('users');
  }

  /* ---------- Add Resources to User ---------- */
  protected readonly resourceOpen = signal(false);
  protected readonly resourceForm = signal<{ productId: 'posta' | 'cloudedge'; packageId: string; organizationId: string; domainIds: string[] }>(
    { productId: 'posta', packageId: '', organizationId: '', domainIds: [] },
  );
  protected readonly packages = PACKAGES;
  protected readonly organizations = ORGANIZATIONS;
  protected readonly domains = DOMAINS;

  protected openResource(): void {
    this.resourceForm.set({ productId: 'posta', packageId: '', organizationId: '', domainIds: [] });
    this.resourceOpen.set(true);
  }

  protected setProduct(productId: 'posta' | 'cloudedge'): void {
    this.resourceForm.set({ productId, packageId: '', organizationId: '', domainIds: [] });
  }

  protected toggleDomain(id: string, on: boolean): void {
    this.resourceForm.update((f) => ({ ...f, domainIds: on ? [...f.domainIds, id] : f.domainIds.filter((d) => d !== id) }));
  }

  protected addResource(): void {
    const f = this.resourceForm();
    if (!f.packageId) return;
    this.resources.update((list) => [...list, { id: `res-${Date.now()}`, ...f }]);
    this.resourceOpen.set(false);
  }

  protected removeResource(id: string): void {
    this.resources.update((list) => list.filter((r) => r.id !== id));
  }

  protected packageName(r: AssignedResource): string {
    return [...PACKAGES.posta, ...PACKAGES.cloudedge].find((p) => p.id === r.packageId)?.name ?? '';
  }
  protected orgName(id: string): string {
    return ORGANIZATIONS.find((o) => o.id === id)?.name ?? 'N/A';
  }
  protected domainNames(r: AssignedResource): string {
    return r.domainIds.length ? r.domainIds.map((id) => DOMAINS.find((d) => d.id === id)?.name).join(', ') : 'N/A';
  }

  /* ---------- Delete user (type DELETE) ---------- */
  protected readonly deletingUser = signal<TeamUser | null>(null);
  protected readonly deleteText = signal('');

  protected askDeleteUser(u: TeamUser): void {
    this.deleteText.set('');
    this.deletingUser.set(u);
  }

  protected confirmDeleteUser(): void {
    const u = this.deletingUser();
    if (!u || this.deleteText() !== 'DELETE') return;
    this.store.deleteUser(u.id);
    this.deletingUser.set(null);
    this.notify(`${u.fullName} deleted.`);
  }

  /* ---------- Change a user's password ---------- */
  protected readonly passwordUser = signal<TeamUser | null>(null);
  protected readonly newPassword = signal({ newPassword: '', confirmNewPassword: '' });
  protected readonly passwordError = signal('');

  protected openPassword(u: TeamUser): void {
    this.newPassword.set({ newPassword: '', confirmNewPassword: '' });
    this.passwordError.set('');
    this.passwordUser.set(u);
  }

  protected savePassword(): void {
    const u = this.passwordUser();
    const p = this.newPassword();
    if (!u) return;
    if (p.newPassword.length < 8) return this.passwordError.set('Password must be at least 8 characters long.');
    if (p.newPassword !== p.confirmNewPassword) return this.passwordError.set('Passwords do not match.');
    this.passwordUser.set(null);
    this.notify(`Password for ${u.fullName} has been changed successfully.`);
  }

  /* ---------- Permission Groups ---------- */
  protected readonly groupSearch = signal('');
  protected readonly filteredGroups = computed(() => {
    const term = this.groupSearch().trim().toLowerCase();
    return this.groups().filter((g) => g.name.toLowerCase().includes(term));
  });

  protected readonly editingGroup = signal<UserGroup | null>(null);
  protected readonly groupFormName = signal('');
  protected readonly groupRoles = signal<string[]>([]);
  protected readonly groupMembers = signal<string[]>([]);
  protected readonly roleSearch = signal('');
  protected readonly groupSubmitted = signal(false);

  protected readonly availableRoles = computed(() => {
    const term = this.roleSearch().trim().toLowerCase();
    const picked = this.groupRoles();
    return ROLES.filter((r) => !picked.includes(r.id) && (r.label.toLowerCase().includes(term) || r.description.toLowerCase().includes(term)));
  });
  protected readonly selectedRoles = computed(() => this.groupRoles().map((id) => ROLES.find((r) => r.id === id)).filter((r) => !!r));

  protected readonly groupNameError = computed(() => {
    const name = this.groupFormName().trim();
    if (!name) return 'Group Name is required.';
    if (this.groups().some((g) => g.id !== this.editingGroup()?.id && g.name.toLowerCase() === name.toLowerCase())) return 'A group with this name already exists.';
    return null;
  });

  protected openCreateGroup(): void {
    this.editingGroup.set(null);
    this.groupFormName.set('');
    this.groupRoles.set([]);
    this.groupMembers.set([]);
    this.roleSearch.set('');
    this.groupSubmitted.set(false);
    this.page.set('group-form');
  }

  protected openEditGroup(g: UserGroup): void {
    this.editingGroup.set(g);
    this.groupFormName.set(g.name);
    this.groupRoles.set([...g.permissions]);
    this.groupMembers.set(this.users().filter((u) => u.assignedGroupId === g.id).map((u) => u.id));
    this.roleSearch.set('');
    this.groupSubmitted.set(false);
    this.page.set('group-form');
  }

  /** Adding or removing a role moves focus to the list it left, so keyboard users keep their place. */
  protected setRole(roleId: string, on: boolean, event: Event): void {
    const list = (event.currentTarget as HTMLElement).closest<HTMLElement>('.tm-roles');
    this.groupRoles.update((roles) => (on ? [...roles, roleId] : roles.filter((r) => r !== roleId)));
    const label = ROLES.find((r) => r.id === roleId)?.label ?? '';
    this.roleNote.set(`${label} ${on ? 'added' : 'removed'}. ${this.groupRoles().length} roles selected.`);
    setTimeout(() => (list?.querySelector<HTMLElement>('button') ?? list)?.focus());
  }
  protected readonly roleNote = signal('');

  protected toggleMember(userId: string, on: boolean): void {
    this.groupMembers.update((ids) => (on ? [...ids, userId] : ids.filter((id) => id !== userId)));
  }

  protected saveGroup(): void {
    this.groupSubmitted.set(true);
    if (this.groupNameError()) return;
    const editing = this.editingGroup();
    const g = this.store.saveGroup(editing?.id ?? null, this.groupFormName().trim(), this.groupRoles(), this.groupMembers());
    this.page.set('groups');
    this.notify(editing ? `${g.name} saved.` : `${g.name} created.`);
  }

  protected readonly deletingGroup = signal<UserGroup | null>(null);
  protected readonly deleteGroupBlocked = computed(() => {
    const g = this.deletingGroup();
    return g ? this.memberCount(g) : 0;
  });

  protected confirmDeleteGroup(): void {
    const g = this.deletingGroup();
    if (!g || this.deleteGroupBlocked()) return;
    this.store.deleteGroup(g.id);
    this.deletingGroup.set(null);
    this.notify(`${g.name} deleted.`);
  }

  /* ---------- Shared ---------- */
  protected notify(text: string): void {
    this.toast.set(text);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 3200);
  }
}
