import { Component, computed, inject, output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faMicrochip, faReceipt } from '@fortawesome/free-solid-svg-icons';
import { BillingDemoStore, type Plan, type PlanAddon, ALL_ADDONS } from './billing-demo.store';

interface Config {
  templateId: string;
  region: string;
  quantity: number;
}

/* The portal's prices for what this short form keeps. */
const PRICE_STATIC_IP_MONTHLY = 4;
/** Every deployment comes with one static public IPv4, as the portal's default does. */
const DEFAULT_PUBLIC_IPS = 1;

const REGIONS = [
  { id: 'eu-central-1', name: 'EU (Frankfurt)', code: 'fra' },
  { id: 'us-east-1', name: 'EU (Strasbourg)', code: 'sxb' },
];
const TEMPLATES = [
  { id: 'ce-s1', name: 'Micro (CE-S1)', cpu: 2, ramGB: 4, bootDiskGB: 50, priceMonthly: 20, description: 'Best for web proxies & lightweight apps' },
  { id: 'ce-m1', name: 'Standard (CE-M1)', cpu: 4, ramGB: 8, bootDiskGB: 100, priceMonthly: 40, description: 'Production balanced workloads' },
  { id: 'ce-l1', name: 'Power (CE-L1)', cpu: 8, ramGB: 16, bootDiskGB: 200, priceMonthly: 80, description: 'Demanding databases & analytics' },
];

const DEFAULT_CONFIG: Config = { templateId: 'ce-m1', region: 'eu-central-1', quantity: 1 };

const isoDay = (d: Date) => d.toISOString().split('T')[0];

/**
 * CloudEdge's configurator, cut to one short screen for the demo: pick a
 * hardware blueprint, a region and how many nodes, and the Deployment Summary
 * prices it live. Everything else takes the portal's defaults: an elastic
 * instance on a 1-month subscription, Type I tier, one static public IP, and
 * nodes named from the blueprint and region (ce-m1-fra-01, -02...). The full
 * configurator lives in the real portal
 * (user-types-of-worldposta-unified-sign-in/pages/billing/AddCloudEdgeConfigurationPage.tsx).
 */
@Component({
  selector: 'app-cloudedge-billing-configurator',
  imports: [FaIconComponent, DecimalPipe],
  templateUrl: './billing-configurator.component.html',
  styleUrls: ['../demo.css', './billing-demo.component.css'],
  host: { class: 'bc-host' },
})
export class BillingConfiguratorComponent {
  private readonly store = inject(BillingDemoStore);

  /** The message to confirm with, once the reservation is saved. */
  readonly saved = output<string>();

  protected readonly i = { chip: faMicrochip, receipt: faReceipt };
  protected readonly regions = REGIONS;
  protected readonly templates = TEMPLATES;
  protected readonly publicIps = DEFAULT_PUBLIC_IPS;

  protected readonly config = signal<Config>({ ...DEFAULT_CONFIG });
  protected readonly submitted = signal(false);

  protected set<K extends keyof Config>(key: K, value: Config[K]): void {
    this.config.update((c) => ({ ...c, [key]: value }));
  }

  /** Kept as typed, so a cleared field shows its error instead of jumping back to 1. */
  protected readonly quantityRaw = signal(String(DEFAULT_CONFIG.quantity));
  protected setQuantity(raw: string): void {
    this.quantityRaw.set(raw);
    const n = Math.floor(Number(raw));
    if (n >= 1 && n <= 20) this.set('quantity', n);
  }

  private readonly template = computed(() => TEMPLATES.find((t) => t.id === this.config().templateId) ?? TEMPLATES[0]);
  protected readonly blueprintName = computed(() => this.template().name);
  protected readonly regionName = computed(() => REGIONS.find((r) => r.id === this.config().region)?.name ?? '-');

  /** Unit monthly cost: the blueprint plus the default static IP. */
  protected readonly subtotal = computed(() => this.template().priceMonthly + DEFAULT_PUBLIC_IPS * PRICE_STATIC_IP_MONTHLY);
  protected readonly quantity = computed(() => this.config().quantity);
  protected readonly grandTotal = computed(() => this.subtotal() * this.quantity());

  protected readonly quantityError = computed(() => {
    const n = Number(this.quantityRaw());
    return Number.isInteger(n) && n >= 1 && n <= 20 ? null : 'Enter between 1 and 20 nodes.';
  });

  protected save(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    if (this.quantityError()) return;
    const c = this.config();
    const region = REGIONS.find((r) => r.id === c.region) ?? REGIONS[0];
    const base = `${c.templateId}-${region.code}`;
    const names = Array.from({ length: c.quantity }, (_, n) => `${base}-${String(n + 1).padStart(2, '0')}`);
    this.finalize(names);
  }

  private finalize(names: string[]): void {
    const plan = this.buildPlan();
    const start = new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    const stamp = Date.now();
    this.store.addReservations(
      names.map((name, n) => ({
        id: `res-${stamp}-${n}`, name, plan, status: 'Pending', startDate: isoDay(start), endDate: isoDay(end), billingMode: 'subscription',
      })),
    );
    const unit = Math.round(this.subtotal() * 100) / 100;
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const invoice = this.store.billSubscription(
      names.map((name) => ({ description: `CloudEdge - ${name}`, units: 1, amount: unit })),
      `${fmt(start)} to ${fmt(end)}`,
    );
    this.saved.emit(`${names.length > 1 ? `${names.length} reservations` : names[0]} added. Invoice ${invoice.id} is ready.`);
  }

  private buildPlan(): Plan {
    const addons: PlanAddon[] = ALL_ADDONS.map((name) =>
      name === 'Public IPs' ? { name, included: true, quantity: DEFAULT_PUBLIC_IPS } : { name, included: false },
    );
    const t = this.template();
    return { name: t.name, type: 'Fixed', cores: t.cpu, ram: t.ramGB, storage: t.bootDiskGB, addons, price: Math.round(this.subtotal() * 100) / 100 };
  }
}
