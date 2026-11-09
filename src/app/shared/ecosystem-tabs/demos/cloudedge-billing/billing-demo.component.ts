import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faLinux, faWindows } from '@fortawesome/free-brands-svg-icons';
import {
  faArrowDown, faArrowUp, faBan, faCalendarPlus, faCalendarXmark, faChevronDown, faChevronRight, faCircleCheck, faDownload,
  faFileInvoiceDollar, faFloppyDisk, faGlobe, faMagnifyingGlass, faNetworkWired, faPlus, faShieldHalved, faShieldVirus, faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import { DemoDialogComponent } from '../demo-dialog.component';
import { BillingConfiguratorComponent } from './billing-configurator.component';
import { BILLED_TO, BillingDemoStore, type AddonName, type Invoice, type Reservation, type ReservationStatus } from './billing-demo.store';

type View = 'reservations' | 'configure' | 'invoices';
type SortColumn = 'name' | 'planName' | 'status' | 'startDate' | 'endDate';
type InvoiceFilter = 'all' | 'Paid' | 'Unpaid';

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
const money = (n: number) => `$${n.toFixed(2)}`;

/**
 * CloudEdge cost management, working: Reservations (search, sort, add-ons,
 * details, extend, cancel, delete), the configurator that adds them with a
 * live monthly estimate, and the Invoice History (status filter, view, pay,
 * Download PDF as a printable document built in the browser). Ported from
 * cloudedge/src/pages/reservations and
 * user-types-of-worldposta-unified-sign-in/pages/billing (InvoiceHistoryPage,
 * InvoiceDetailPage, AddCloudEdgeConfigurationPage). Only the page content is
 * shown, without the console's sidebar and top bar.
 */
@Component({
  selector: 'app-cloudedge-billing-demo',
  imports: [FaIconComponent, DecimalPipe, DemoDialogComponent, BillingConfiguratorComponent],
  templateUrl: './billing-demo.component.html',
  styleUrls: ['../demo.css', './billing-demo.component.css'],
})
export class BillingDemoComponent {
  private readonly store = inject(BillingDemoStore);

  protected readonly i = {
    up: faArrowUp, down: faArrowDown, ban: faBan, extend: faCalendarPlus, none: faCalendarXmark, open: faChevronDown, closed: faChevronRight,
    ok: faCircleCheck, download: faDownload, invoice: faFileInvoiceDollar, plus: faPlus, search: faMagnifyingGlass, trash: faTrashCan,
  };
  protected readonly addonIcon: Record<AddonName, IconDefinition> = {
    'Windows Enterprise Licenses': faWindows, 'Linux Enterprise Licenses': faLinux, 'Cortex XDR Endpoint Protection / VM': faShieldVirus,
    'Public IPs': faGlobe, 'Load Balancer/ IP': faNetworkWired, 'Advanced Backup by Veeam': faFloppyDisk, 'Trend Micro Deep Security/ VM': faShieldHalved,
  };
  protected readonly statusTone: Record<ReservationStatus, string> = { Active: 'good', Expired: 'bad', Pending: 'warn', Cancelled: 'bad' };
  protected readonly views: { id: View; label: string }[] = [
    { id: 'reservations', label: 'Reservations' },
    { id: 'configure', label: 'New Configuration' },
    { id: 'invoices', label: 'Invoices' },
  ];

  protected readonly view = signal<View>('reservations');
  protected readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  /* ---------- Reservations ---------- */
  protected readonly searchTerm = signal('');
  protected readonly sortColumn = signal<SortColumn>('startDate');
  protected readonly sortDirection = signal<'asc' | 'desc'>('desc');
  protected readonly expandedId = signal<string | null>(null);
  protected readonly columns: { id: SortColumn; label: string }[] = [
    { id: 'name', label: 'Name' }, { id: 'planName', label: 'Plan' }, { id: 'status', label: 'Status' },
    { id: 'startDate', label: 'Start Date' }, { id: 'endDate', label: 'End Date' },
  ];

  protected readonly filteredReservations = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const column = this.sortColumn();
    const dir = this.sortDirection() === 'asc' ? 1 : -1;
    const value = (r: Reservation) => (column === 'planName' ? r.plan.name : r[column]);
    return this.store
      .reservations()
      .filter((r) => r.name.toLowerCase().includes(term) || r.plan.name.toLowerCase().includes(term))
      .sort((a, b) => value(a).localeCompare(value(b)) * dir);
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

  protected toggleExpand(id: string): void {
    this.expandedId.update((open) => (open === id ? null : id));
  }

  protected includedAddons(r: Reservation) {
    return r.plan.addons.filter((a) => a.included);
  }

  protected formatDate(iso: string): string {
    // Dates are calendar days (YYYY-MM-DD), read as UTC so no time zone shifts them.
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  }

  /** The reservation whose Details panel is open (read live, so actions update it). */
  private readonly detailId = signal<string | null>(null);
  protected readonly detail = computed(() => this.store.reservations().find((r) => r.id === this.detailId()) ?? null);

  protected openDetails(r: Reservation): void {
    this.detailId.set(r.id);
  }
  protected closeDetails(): void {
    this.detailId.set(null);
  }

  protected extend(r: Reservation): void {
    const end = new Date(r.endDate);
    end.setFullYear(end.getFullYear() + 1);
    const endDate = end.toISOString().split('T')[0];
    this.store.updateReservation(r.id, { endDate, status: r.status === 'Expired' ? 'Active' : r.status });
    this.notify(`${r.name} extended to ${this.formatDate(endDate)}.`);
  }

  protected readonly confirm = signal<{ kind: 'cancel' | 'delete'; reservation: Reservation } | null>(null);

  protected confirmAction(): void {
    const c = this.confirm();
    this.confirm.set(null);
    if (!c) return;
    if (c.kind === 'cancel') {
      this.store.updateReservation(c.reservation.id, { status: 'Cancelled' });
      this.notify(`${c.reservation.name} cancelled.`);
    } else {
      this.closeDetails();
      this.store.deleteReservation(c.reservation.id);
      this.notify(`${c.reservation.name} deleted.`);
    }
  }

  protected onSaved(message: string): void {
    this.view.set('reservations');
    this.sortColumn.set('startDate');
    this.sortDirection.set('desc');
    this.searchTerm.set('');
    this.notify(message);
  }

  /* ---------- Invoices ---------- */
  protected readonly invoiceFilter = signal<InvoiceFilter>('all');
  protected readonly invoiceFilters: { id: InvoiceFilter; label: string }[] = [
    { id: 'all', label: 'All' }, { id: 'Paid', label: 'Paid' }, { id: 'Unpaid', label: 'Unpaid' },
  ];
  protected readonly invoices = computed(() => {
    const f = this.invoiceFilter();
    return this.store.invoices().filter((inv) => f === 'all' || inv.status === f);
  });
  protected readonly invoiceCount = computed(() => {
    const all = this.store.invoices();
    return { all: all.length, Paid: all.filter((i) => i.status === 'Paid').length, Unpaid: all.filter((i) => i.status === 'Unpaid').length };
  });

  private readonly viewingId = signal<string | null>(null);
  protected readonly viewing = computed(() => this.store.invoices().find((inv) => inv.id === this.viewingId()) ?? null);
  protected readonly billedTo = BILLED_TO;

  protected openInvoice(inv: Invoice): void {
    this.viewingId.set(inv.id);
  }
  protected closeInvoice(): void {
    this.viewingId.set(null);
  }

  protected pay(inv: Invoice): void {
    this.store.payInvoice(inv.id);
    this.notify(`${money(inv.amountDue)} paid on ${inv.id}.`);
  }

  /** Builds the invoice as a printable page and opens the print dialog, where "Save as PDF" makes the file. */
  protected downloadPdf(inv: Invoice): void {
    const rows = inv.lineItems
      .map((l) => `<tr><td>${escapeHtml(l.description)}</td><td class="r">${l.units}</td><td class="r">${money(l.amount)}</td></tr>`)
      .join('');
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${inv.id}</title><style>
      body{font:13px/1.5 system-ui,sans-serif;color:#293c51;margin:40px}
      header{display:flex;justify-content:space-between;border-bottom:2px solid #e2e7ee;padding-bottom:16px}
      h1{margin:0;font-size:28px;letter-spacing:.04em}h2{font-size:11px;text-transform:uppercase;color:#5b6577;margin:0 0 4px}
      .grid{display:flex;justify-content:space-between;margin:20px 0}table{width:100%;border-collapse:collapse}
      th{text-align:left;font-size:11px;text-transform:uppercase;color:#5b6577;border-bottom:2px solid #cbd2dc;padding:6px 0}
      td{padding:8px 0;border-bottom:1px solid #e2e7ee}.r{text-align:right}.tot{margin:16px 0 0 auto;width:280px}
      .tot div{display:flex;justify-content:space-between;padding:3px 0}.due{font-weight:700;color:#3d6b22;font-size:15px;border-top:1px solid #cbd2dc}
      .pill{display:inline-block;padding:1px 8px;border-radius:99px;font-size:11px;font-weight:700;background:${inv.status === 'Paid' ? '#e8f2df;color:#3d6b22' : '#fdf1d8;color:#8a5300'}}
    </style></head><body>
      <header><div><strong>WorldPosta, Inc.</strong><br>789 Cloud Way, Suite 100<br>Internet City, 101010<br>Tax Reg #: WP123456789</div>
      <div class="r"><h1>INVOICE</h1>Invoice # ${inv.id}<br>Invoice Date ${this.formatDate(inv.date)}<br>Invoice Amount ${money(inv.amount)} (USD)<br>Customer ID ${BILLED_TO.id}<br><span class="pill">${inv.status.toUpperCase()}</span></div></header>
      <div class="grid"><div><h2>Billed To</h2><strong>${BILLED_TO.name}</strong><br>${BILLED_TO.address.join('<br>')}<br>${BILLED_TO.email}</div>
      <div class="r"><h2>Subscription</h2>ID ${escapeHtml(inv.subscriptionId)}<br>Billing Period ${escapeHtml(inv.billingPeriod)}<br>Next Billing Date ${escapeHtml(inv.nextBillingDate)}</div></div>
      <table><thead><tr><th>Description</th><th class="r">Units</th><th class="r">Amount (USD)</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="tot"><div><span>Sub Total</span><span>${money(inv.subTotal)}</span></div><div><span>${inv.tax.label}</span><span>${money(inv.tax.amount)}</span></div>
      <div><strong>Total</strong><strong>${money(inv.subTotal + inv.tax.amount)}</strong></div><div><span>Payments</span><span>${money(inv.payments)}</span></div>
      <div class="due"><span>Amount Due (USD)</span><span>${money(inv.amountDue)}</span></div></div>
      <h2 style="margin-top:28px">Payments</h2><p>${escapeHtml(inv.paymentDetails)}</p>
      <h2>Notes</h2><p>All payments are due within 15 days of the invoice date.</p>
    </body></html>`;

    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
    frame.style.cssText = 'position:fixed;width:0;height:0;border:0;opacity:0';
    frame.onload = () => {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
      setTimeout(() => frame.remove(), 1000);
    };
    frame.srcdoc = html;
    document.body.appendChild(frame);
    this.notify(`${inv.id} is ready: choose "Save as PDF" in the print dialog.`);
  }

  /* ---------- Shared ---------- */
  protected notify(text: string): void {
    this.toast.set(text);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 3200);
  }
}
