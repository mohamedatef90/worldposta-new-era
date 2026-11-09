import { Component, computed, inject, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowDown, faArrowLeft, faArrowUp, faBan, faCircleCheck, faEllipsisVertical, faMagnifyingGlass, faNetworkWired, faPencil,
  faPlay, faPlus, faTrashCan, faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { DemoDialogComponent } from '../demo-dialog.component';
import { ELASTIC_IPS, GATEWAYS, NetworkingDemoStore, type NatActionType, type NatForm, type NatRule } from './networking-demo.store';

type SortColumn = 'name' | 'reservation' | 'actionType' | 'source' | 'destination' | 'translated' | 'service' | 'description' | 'status';

const BLANK: NatForm = { name: '', type: 'SNAT', gateway: '', elasticIp: '', port: '', description: '' };

/**
 * CloudEdge › Network › NATs, working: the NAT rules table with search and
 * sortable columns, Add / Edit NAT Rule (the console's create-edit page and
 * its validation), enable or disable a rule, and delete with the console's
 * type-the-name confirmation. Ported from cloudedge/src/pages/nats and
 * nats/pages/create-edit-nat; page content only, no console sidebar.
 */
@Component({
  selector: 'app-cloudedge-networking-demo',
  imports: [FaIconComponent, DemoDialogComponent],
  templateUrl: './networking-demo.component.html',
  styleUrls: ['../demo.css', './networking-demo.component.css'],
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class NetworkingDemoComponent {
  private readonly store = inject(NetworkingDemoStore);

  protected readonly i = {
    back: faArrowLeft, up: faArrowUp, down: faArrowDown, ok: faCircleCheck, kebab: faEllipsisVertical, search: faMagnifyingGlass,
    net: faNetworkWired, edit: faPencil, plus: faPlus, trash: faTrashCan, warn: faTriangleExclamation, enable: faPlay, disable: faBan,
  };

  protected readonly page = signal<'list' | 'form'>('list');
  protected readonly searchTerm = signal('');
  protected readonly sortColumn = signal<SortColumn>('name');
  protected readonly sortDirection = signal<'asc' | 'desc'>('asc');
  protected readonly openMenu = signal<string | null>(null);
  protected readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  protected readonly columns: { key: SortColumn; label: string }[] = [
    { key: 'name', label: 'Name' }, { key: 'reservation', label: 'Reservation' }, { key: 'actionType', label: 'Action Type' },
    { key: 'source', label: 'Source' }, { key: 'destination', label: 'Destination' }, { key: 'translated', label: 'Translated' },
    { key: 'service', label: 'Service' }, { key: 'description', label: 'Description' }, { key: 'status', label: 'Status' },
  ];

  protected readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const column = this.sortColumn();
    const dir = this.sortDirection() === 'asc' ? 1 : -1;
    return this.store
      .natRules()
      .filter(
        (r) =>
          !term || r.name.toLowerCase().includes(term) || r.source.toLowerCase().includes(term) || r.destination.toLowerCase().includes(term) ||
          r.description.toLowerCase().includes(term) || !!r.reservation?.toLowerCase().includes(term),
      )
      .sort((a, b) => {
        const av = a[column];
        const bv = b[column];
        if (av === null || bv === null) return (av === bv ? 0 : av === null ? -1 : 1) * dir;
        return String(av).localeCompare(String(bv)) * dir;
      });
  });

  protected setSort(column: SortColumn): void {
    if (this.sortColumn() === column) this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  protected ariaSort(column: SortColumn): 'ascending' | 'descending' | null {
    return this.sortColumn() === column ? (this.sortDirection() === 'asc' ? 'ascending' : 'descending') : null;
  }

  /* ---------- Row menu ---------- */
  private menuTrigger: HTMLElement | null = null;

  protected toggleMenu(event: Event, id: string): void {
    event.stopPropagation();
    this.menuTrigger = event.currentTarget as HTMLElement;
    this.openMenu.update((open) => (open === id ? null : id));
  }

  protected closeMenu(): void {
    this.openMenu.set(null);
    this.menuTrigger?.focus();
  }

  protected toggleStatus(rule: NatRule): void {
    this.closeMenu();
    const next = rule.status === 'Enabled' ? 'Disabled' : 'Enabled';
    this.store.setStatus(rule.id, next);
    this.notify(`${rule.name} ${next.toLowerCase()}.`);
  }

  /* ---------- Delete (type the name) ---------- */
  protected readonly deleting = signal<NatRule | null>(null);
  protected readonly deleteTyped = signal('');

  protected askDelete(rule: NatRule): void {
    this.closeMenu();
    this.deleteTyped.set('');
    this.deleting.set(rule);
  }

  protected confirmDelete(): void {
    const rule = this.deleting();
    if (!rule || this.deleteTyped() !== rule.name) return;
    this.store.deleteNatRule(rule.id);
    this.deleting.set(null);
    this.notify(`NAT Rule ${rule.name} deleted.`);
  }

  /* ---------- Create / Edit NAT Rule ---------- */
  protected readonly natTypes: NatActionType[] = ['DNAT', 'SNAT', 'NO SNAT', 'NO DNAT', 'REFLEXIVE'];
  protected readonly gateways = GATEWAYS;
  protected readonly elasticIps = ELASTIC_IPS;
  protected readonly cidrPrefixes = Array.from({ length: 33 }, (_, n) => n);

  protected readonly editingId = signal<string | null>(null);
  protected readonly form = signal<NatForm>(BLANK);
  protected readonly submitted = signal(false);

  /** The read-only address of the chosen gateway, split as the console shows it. */
  protected readonly gatewayAddress = computed(() => {
    const gw = GATEWAYS.find((g) => g.name === this.form().gateway);
    if (!gw) return { octets: ['', '', '', ''], cidr: 24 };
    const [ip, cidr] = gw.subnet.split('/');
    return { octets: ip.split('.'), cidr: Number(cidr) };
  });

  protected readonly formErrors = computed(() => {
    const f = this.form();
    const errors: Partial<Record<keyof NatForm, string>> = {};
    if (!f.name.trim()) errors.name = 'Name is required.';
    else if (f.name.length > 50) errors.name = 'Name must be 50 characters or fewer.';
    else if (this.store.natRules().some((r) => r.name === f.name.trim() && r.id !== this.editingId())) errors.name = 'A NAT rule with this name already exists.';
    if (!f.gateway) errors.gateway = 'Select a gateway.';
    if (!f.elasticIp) errors.elasticIp = 'Select an Elastic IP.';
    const ports = f.port.split(',').map((p) => p.trim()).filter(Boolean);
    if (ports.some((p) => !/^\d+$/.test(p) || +p < 1 || +p > 65535)) errors.port = 'Enter ports between 1 and 65535, separated by commas.';
    return errors;
  });

  protected readonly hasErrors = computed(() => Object.keys(this.formErrors()).length > 0);

  protected error(key: keyof NatForm): string | null {
    return this.submitted() ? (this.formErrors()[key] ?? null) : null;
  }

  protected setField(key: keyof NatForm, value: string): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.form.set({ ...BLANK, elasticIp: ELASTIC_IPS[0] });
    this.submitted.set(false);
    this.page.set('form');
  }

  protected openEdit(rule: NatRule): void {
    this.closeMenu();
    this.editingId.set(rule.id);
    this.form.set({ name: rule.name, type: rule.actionType, gateway: rule.gateway, elasticIp: rule.elasticIp, port: rule.port, description: rule.description });
    this.submitted.set(false);
    this.page.set('form');
  }

  protected save(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    if (this.hasErrors()) return;
    const id = this.editingId();
    if (id) {
      this.store.updateNatRule(id, this.form());
      this.notify(`${this.form().name.trim()} saved.`);
    } else {
      const rule = this.store.addNatRule(this.form());
      this.notify(`NAT Rule ${rule.name} created.`);
    }
    this.page.set('list');
  }

  /* ---------- Shared ---------- */
  protected notify(text: string): void {
    this.toast.set(text);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 3200);
  }

  protected onDocumentClick(event: Event): void {
    if (!(event.target as Element | null)?.closest('.d-menu-wrap')) this.openMenu.set(null);
  }
}
