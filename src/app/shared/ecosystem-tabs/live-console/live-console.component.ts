import { Component, computed, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCloudArrowUp, faCoins, faDatabase, faDesktop, faDownload, faNetworkWired, faShieldHalved } from '@fortawesome/free-solid-svg-icons';
interface Invoice { id: string; period: string; issued: string; due: string; total: number; status: 'Due' | 'Paid'; }

/**
 * CloudEdge billing invoices for the ecosystem preview: the page content only,
 * with no console sidebar or top bar. Everything happens in the browser.
 * (Virtual Machines moved to demos/cloudedge-vms, ported from the console.)
 */
@Component({
  selector: 'app-live-console',
  imports: [FaIconComponent, CurrencyPipe],
  templateUrl: './live-console.component.html',
  styleUrl: './live-console.component.css',
})
export class LiveConsoleComponent {

  protected readonly i = { download: faDownload };


  protected readonly toast = signal('');
  private flashTimer?: ReturnType<typeof setTimeout>;
  private flash(text: string): void {
    this.toast.set(text);
    clearTimeout(this.flashTimer);
    this.flashTimer = setTimeout(() => this.toast.set(''), 2600);
  }

  /* ---------------- Billing ---------------- */
  /** Monthly totals follow the console's Total Cloud Spend trend. */
  protected readonly invoices: Invoice[] = [
    { id: 'INV-2026-10', period: 'October 2026', issued: 'Nov 1, 2026', due: 'Nov 15, 2026', total: 12430, status: 'Due' },
    { id: 'INV-2026-09', period: 'September 2026', issued: 'Oct 1, 2026', due: 'Oct 15, 2026', total: 12700, status: 'Paid' },
    { id: 'INV-2026-08', period: 'August 2026', issued: 'Sep 1, 2026', due: 'Sep 15, 2026', total: 13000, status: 'Paid' },
    { id: 'INV-2026-07', period: 'July 2026', issued: 'Aug 1, 2026', due: 'Aug 15, 2026', total: 13400, status: 'Paid' },
  ];
  /** October's breakdown, from the console's cost overview; other months scale with their total. */
  private readonly baseLines = [
    { service: 'Virtual Machines', detail: 'prod-vm-cluster', icon: faDesktop, amount: 4320 },
    { service: 'Storage', detail: 'prod-storage', icon: faDatabase, amount: 2180 },
    { service: 'Networking', detail: 'vpc-network', icon: faNetworkWired, amount: 1560 },
    { service: 'Security', detail: 'waf-security', icon: faShieldHalved, amount: 980 },
    { service: 'Backup & DR', detail: 'daily-backup', icon: faCloudArrowUp, amount: 640 },
    { service: 'Other services', detail: 'Kubernetes, monitoring and support', icon: faCoins, amount: 2750 },
  ];
  protected readonly selected = signal(this.invoices[0].id);
  protected readonly invoice = computed(() => {
    const inv = this.invoices.find((x) => x.id === this.selected()) ?? this.invoices[0];
    const ratio = inv.total / 12430;
    const lines = this.baseLines.map((l) => ({ ...l, amount: Math.round(l.amount * ratio) }));
    const drift = inv.total - lines.reduce((s, l) => s + l.amount, 0);
    lines[lines.length - 1].amount += drift;
    return { ...inv, lines };
  });
  protected readonly expanded = signal<string | null>(null);
  protected pay(): void { this.flash('Payments are made from your CloudEdge console after you sign in.'); }
  /** Opens the selected invoice on its own in a print dialog, so it can be saved as PDF. */
  protected download(): void {
    const inv = this.invoice();
    const money = (n: number) => '$' + n.toLocaleString('en-US') + '.00';
    const rows = inv.lines.map((l) => `<tr><td>${l.service}<br><small>${l.detail}</small></td><td>${money(l.amount)}</td></tr>`).join('');
    const w = window.open('', '_blank', 'width=820,height=900');
    if (!w) return;
    w.document.write(`<!doctype html><title>${inv.id}</title><style>body{font:14px system-ui,sans-serif;color:#071c4c;padding:40px}h1{margin:0 0 4px}table{width:100%;border-collapse:collapse;margin-top:24px}td{padding:10px 0;border-bottom:1px solid #e3e8f0}td:last-child{text-align:right}small{color:#5b6577}.t{font-weight:700;font-size:18px}</style><h1>Invoice ${inv.id}</h1><p>WorldPosta CloudEdge · Billed to Worldposta<br>Period: ${inv.period} · Issued ${inv.issued} · Due ${inv.due}</p><table>${rows}<tr><td class="t">Total (USD)</td><td class="t">${money(inv.total)}</td></tr></table><script>print()<\/script>`);
    w.document.close();
  }
}
