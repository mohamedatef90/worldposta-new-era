import { Component, computed, inject, output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faBolt, faCircleCheck, faCircleInfo, faCirclePlus, faCloud, faDatabase, faFileInvoiceDollar, faLayerGroup, faMicrochip,
  faReceipt, faServer, faWallet,
} from '@fortawesome/free-solid-svg-icons';
import { DemoDialogComponent } from '../demo-dialog.component';
import { BillingDemoStore, type AddonName, type BillingMode, type Plan, type PlanAddon, ALL_ADDONS } from './billing-demo.store';

type ResourceType = 'instance' | 'vdc' | 'ready-plan';
type MachineType = 'Type I' | 'Type II';

interface Config {
  billingMode: BillingMode;
  type: ResourceType;
  name: string;
  region: string;
  termValue: number;
  termUnit: 'month' | 'year';
  runtimeHours: number;
  machineType: MachineType;
  quantity: number;
  templateId: string;
  readyPlanId: string;
  vdcCPU: number;
  vdcRAM: number;
  vdcStorage: number;
  gpuEnabled: boolean;
  gpuFamily: 'h100' | 'tesla';
  h100Slices: number;
  teslaOptionId: string;
  flashDiskEnabled: boolean;
  flashDiskType: 'SSD' | 'NVMe';
  flashDiskGB: number;
  staticPublicIPs: number;
  objectStorageGB: number;
  advancedBackupGB: number;
}

/* Pricing constants, exactly as AddCloudEdgeConfigurationPage defines them. */
const PRICE_H100_SLICE_12GB_MONTHLY = 120;
const PRICE_CPU_CORE_MONTHLY = 10;
const PRICE_RAM_GB_MONTHLY = 5;
const PRICE_FLASH_GB_MONTHLY = 0.1;
const PRICE_STATIC_IP_MONTHLY = 4;
const PRICE_OBJECT_STORAGE_GB_MONTHLY = 0.02;
const PRICE_ADVANCED_BACKUP_GB_MONTHLY = 0.05;
const PRICE_FLASH_DISK_SSD_GB_MONTHLY = 0.15;
const PRICE_FLASH_DISK_NVME_GB_MONTHLY = 0.3;

const REGIONS = [{ id: 'eu-central-1', name: 'EU (Frankfurt)' }, { id: 'us-east-1', name: 'EU (Strasbourg)' }];
const TEMPLATES = [
  { id: 'ce-s1', name: 'Micro (CE-S1)', cpu: 2, ramGB: 4, bootDiskGB: 50, priceMonthly: 20, description: 'Best for web proxies & lightweight apps' },
  { id: 'ce-m1', name: 'Standard (CE-M1)', cpu: 4, ramGB: 8, bootDiskGB: 100, priceMonthly: 40, description: 'Production balanced workloads' },
  { id: 'ce-l1', name: 'Power (CE-L1)', cpu: 8, ramGB: 16, bootDiskGB: 200, priceMonthly: 80, description: 'Demanding databases & analytics' },
];
const READY_PLANS = [
  { id: 'rp-starter', name: 'Starter Node', description: '1 vCPU, 2GB RAM, 40GB SSD', cpu: 1, ramGB: 2, diskGB: 40, priceMonthly: 15 },
  { id: 'rp-business', name: 'Business Hub', description: '4 vCPU, 8GB RAM, 100GB SSD', cpu: 4, ramGB: 8, diskGB: 100, priceMonthly: 50 },
  { id: 'rp-enterprise', name: 'Enterprise Core', description: '8 vCPU, 32GB RAM, 500GB NVMe', cpu: 8, ramGB: 32, diskGB: 500, priceMonthly: 120 },
];
const TESLA_OPTIONS = [
  { id: 'tesla-1x12', label: '1 card, 12 GB', priceMonthly: 150 },
  { id: 'tesla-1x24', label: '1 card, 24 GB', priceMonthly: 280 },
  { id: 'tesla-2x24', label: '2 cards, 24 GB', priceMonthly: 500 },
];

const DEFAULT_CONFIG: Config = {
  billingMode: 'subscription', type: 'instance', name: '', region: 'eu-central-1', termValue: 1, termUnit: 'month', runtimeHours: 730,
  machineType: 'Type I', quantity: 1, templateId: 'ce-s1', readyPlanId: 'rp-starter', vdcCPU: 4, vdcRAM: 8, vdcStorage: 100,
  gpuEnabled: false, gpuFamily: 'h100', h100Slices: 1, teslaOptionId: '', flashDiskEnabled: false, flashDiskType: 'SSD', flashDiskGB: 0,
  staticPublicIPs: 1, objectStorageGB: 0, advancedBackupGB: 0,
};

const isoDay = (d: Date) => d.toISOString().split('T')[0];

/**
 * CloudEdge's configurator, working: billing model, resource architecture,
 * term, tier, hardware blueprint, GPU, volumes and managed extensions, with
 * the Deployment Summary recalculating the unit total live. Saving adds the
 * reservation (and bills a subscription). Ported from
 * user-types-of-worldposta-unified-sign-in/pages/billing/AddCloudEdgeConfigurationPage.tsx
 * and the billing-method choice in CloudEdgeConfigurationsPage.tsx.
 */
@Component({
  selector: 'app-cloudedge-billing-configurator',
  imports: [FaIconComponent, DecimalPipe, DemoDialogComponent],
  templateUrl: './billing-configurator.component.html',
  styleUrls: ['../demo.css', './billing-demo.component.css'],
  host: { class: 'bc-host' },
})
export class BillingConfiguratorComponent {
  private readonly store = inject(BillingDemoStore);

  /** The message to confirm with, once the reservation is saved. */
  readonly saved = output<string>();
  /** Anything else worth confirming (a wallet top up). */
  readonly notice = output<string>();

  protected readonly i = {
    bolt: faBolt, ok: faCircleCheck, info: faCircleInfo, plus: faCirclePlus, cloud: faCloud, disk: faDatabase,
    invoice: faFileInvoiceDollar, layers: faLayerGroup, chip: faMicrochip, receipt: faReceipt, server: faServer, wallet: faWallet,
  };
  protected readonly regions = REGIONS;
  protected readonly templates = TEMPLATES;
  protected readonly readyPlans = READY_PLANS;
  protected readonly teslaOptions = TESLA_OPTIONS;
  protected readonly h100Options = [1, 2, 4, 8];
  protected readonly prices = {
    core: PRICE_CPU_CORE_MONTHLY, ram: PRICE_RAM_GB_MONTHLY, flash: PRICE_FLASH_GB_MONTHLY, ip: PRICE_STATIC_IP_MONTHLY,
    object: PRICE_OBJECT_STORAGE_GB_MONTHLY, backup: PRICE_ADVANCED_BACKUP_GB_MONTHLY, ssd: PRICE_FLASH_DISK_SSD_GB_MONTHLY, nvme: PRICE_FLASH_DISK_NVME_GB_MONTHLY,
  };
  protected readonly architectures: { id: ResourceType; title: string; description: string; icon: typeof faServer }[] = [
    { id: 'instance', title: 'Elastic Instances', description: 'Scalable VMs with customizable vCPU and RAM ratios.', icon: faServer },
    { id: 'vdc', title: 'Virtual Data Center', description: 'Private resource pool with dedicated isolation.', icon: faCloud },
    { id: 'ready-plan', title: 'Ready-To-Run Plans', description: 'Curated high-performance VM bundles for quick launch.', icon: faBolt },
  ];

  protected readonly config = signal<Config>({ ...DEFAULT_CONFIG });
  protected readonly walletBalance = this.store.walletBalance;
  protected readonly step = signal<'config' | 'names'>('config');
  protected readonly nodeNames = signal<string[]>([]);
  protected readonly submitted = signal(false);

  protected set<K extends keyof Config>(key: K, value: Config[K]): void {
    this.config.update((c) => {
      const next = { ...c, [key]: value };
      // Pay-As-You-Go runs elastic instances only; GPUs need Type II hardware.
      if (key === 'billingMode' && value === 'payg_wallet') next.type = 'instance';
      if (key === 'machineType' && value === 'Type I') next.gpuEnabled = false;
      return next;
    });
  }

  protected num<K extends keyof Config>(key: K, raw: string, min = 0, max = Number.MAX_SAFE_INTEGER): void {
    const n = Math.min(max, Math.max(min, Math.floor(Number(raw)) || 0));
    this.set(key, n as Config[K]);
  }

  /** Unit monthly cost, computed as calculateSubtotal() does in the portal. */
  protected readonly subtotal = computed(() => {
    const c = this.config();
    let total = 0;
    if (c.type === 'instance') {
      total += TEMPLATES.find((t) => t.id === c.templateId)?.priceMonthly ?? 0;
      if (c.gpuEnabled) {
        total += c.gpuFamily === 'tesla' ? (TESLA_OPTIONS.find((o) => o.id === c.teslaOptionId)?.priceMonthly ?? 0) : c.h100Slices * PRICE_H100_SLICE_12GB_MONTHLY;
      }
    } else if (c.type === 'vdc') {
      total += c.vdcCPU * PRICE_CPU_CORE_MONTHLY + c.vdcRAM * PRICE_RAM_GB_MONTHLY + c.vdcStorage * PRICE_FLASH_GB_MONTHLY;
    } else {
      total += READY_PLANS.find((p) => p.id === c.readyPlanId)?.priceMonthly ?? 0;
    }
    if (c.type !== 'ready-plan') {
      total += c.staticPublicIPs * PRICE_STATIC_IP_MONTHLY + c.objectStorageGB * PRICE_OBJECT_STORAGE_GB_MONTHLY + c.advancedBackupGB * PRICE_ADVANCED_BACKUP_GB_MONTHLY;
      if (c.flashDiskEnabled) total += c.flashDiskGB * (c.flashDiskType === 'NVMe' ? PRICE_FLASH_DISK_NVME_GB_MONTHLY : PRICE_FLASH_DISK_SSD_GB_MONTHLY);
    }
    if (c.billingMode === 'payg_wallet' && c.type === 'instance') return (total / 730) * c.runtimeHours;
    return total;
  });

  protected readonly quantity = computed(() => (this.config().type === 'vdc' ? 1 : this.config().quantity));
  protected readonly grandTotal = computed(() => this.subtotal() * this.quantity());
  protected readonly termMonths = computed(() => (this.config().termUnit === 'year' ? 12 : 1) * this.config().termValue);
  protected readonly termLabel = computed(() => {
    const { termValue, termUnit } = this.config();
    return `${termValue} ${termUnit}${termValue > 1 ? 's' : ''}`;
  });
  protected readonly overBudget = computed(() => this.config().billingMode === 'payg_wallet' && this.grandTotal() > this.walletBalance());
  protected readonly modelLabel = computed(() => ({ instance: 'Standard Instance', vdc: 'Virtual Data Center', 'ready-plan': 'Ready Plan' })[this.config().type]);
  protected readonly regionName = computed(() => REGIONS.find((r) => r.id === this.config().region)?.name ?? '-');

  protected readonly errors = computed(() => {
    const c = this.config();
    const e: Record<string, string> = {};
    if (!c.name.trim()) e['name'] = 'Please name your configuration.';
    if (c.billingMode === 'subscription' && !(c.termValue >= 1)) e['term'] = 'Enter a duration of at least 1.';
    if (c.billingMode === 'payg_wallet' && !(c.runtimeHours >= 1 && c.runtimeHours <= 730)) e['runtime'] = 'Enter between 1 and 730 hours.';
    if (c.gpuEnabled && c.gpuFamily === 'tesla' && !c.teslaOptionId) e['tesla'] = 'Choose acceleration level.';
    return e;
  });

  protected error(key: string): string | null {
    return this.submitted() ? (this.errors()[key] ?? null) : null;
  }

  protected save(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    if (Object.keys(this.errors()).length || this.overBudget()) return;
    const name = this.config().name.trim();
    if (this.quantity() > 1) {
      this.nodeNames.set(Array.from({ length: this.quantity() }, (_, n) => `${name}-${n + 1}`));
      this.step.set('names');
    } else {
      this.finalize([name]);
    }
  }

  protected setNodeName(index: number, value: string): void {
    this.nodeNames.update((names) => names.map((n, i) => (i === index ? value : n)));
  }

  protected readonly nameErrors = computed(() => {
    const names = this.nodeNames().map((n) => n.trim());
    return names.map((n, i) => (!n ? 'Each node needs a name.' : names.indexOf(n) !== i ? 'Names must be unique.' : null));
  });

  protected readonly namesInvalid = computed(() => this.nameErrors().some((e) => e !== null));

  protected confirmNames(): void {
    if (this.namesInvalid()) return;
    this.finalize(this.nodeNames().map((n) => n.trim()));
  }

  private finalize(names: string[]): void {
    const c = this.config();
    const plan = this.buildPlan(c);
    const start = new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + (c.billingMode === 'subscription' ? this.termMonths() : 1));
    const stamp = Date.now();
    this.store.addReservations(
      names.map((name, n) => ({
        id: `res-${stamp}-${n}`, name, plan, status: 'Pending', startDate: isoDay(start), endDate: isoDay(end), billingMode: c.billingMode,
      })),
    );
    let message: string;
    if (c.billingMode === 'subscription') {
      const unit = Math.round(this.subtotal() * 100) / 100;
      const invoice = this.store.billSubscription(
        names.map((name) => ({ description: `CloudEdge - ${name}`, units: 1, amount: unit })),
        `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} to ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      );
      message = `${names.length > 1 ? `${names.length} reservations` : names[0]} added. Invoice ${invoice.id} is ready.`;
    } else {
      message = `${names.length > 1 ? `${names.length} reservations` : names[0]} added, charged hourly from your wallet.`;
    }
    this.saved.emit(message);
  }

  private buildPlan(c: Config): Plan {
    const extras: AddonName[] = [];
    const quantities: Partial<Record<AddonName, number>> = {};
    if (c.type !== 'ready-plan') {
      if (c.staticPublicIPs > 0) { extras.push('Public IPs'); quantities['Public IPs'] = c.staticPublicIPs; }
      if (c.advancedBackupGB > 0) extras.push('Advanced Backup by Veeam');
    }
    const addons: PlanAddon[] = ALL_ADDONS.map((name) => ({ name, included: extras.includes(name), quantity: quantities[name] }));
    const price = Math.round(this.subtotal() * 100) / 100;
    const volume = c.flashDiskEnabled ? c.flashDiskGB : 0;
    if (c.type === 'vdc') return { name: 'Custom', type: 'Custom', cores: c.vdcCPU, ram: c.vdcRAM, storage: c.vdcStorage + volume, addons, price };
    if (c.type === 'ready-plan') {
      const p = READY_PLANS.find((r) => r.id === c.readyPlanId) ?? READY_PLANS[0];
      return { name: p.name, type: 'Fixed', cores: p.cpu, ram: p.ramGB, storage: p.diskGB, addons, price };
    }
    const t = TEMPLATES.find((tpl) => tpl.id === c.templateId) ?? TEMPLATES[0];
    return { name: t.name, type: 'Fixed', cores: t.cpu, ram: t.ramGB, storage: t.bootDiskGB + volume, addons, price };
  }

  /* ---------- Wallet top up (Pay-As-You-Go) ---------- */
  protected readonly topUpOpen = signal(false);
  protected readonly topUpAmount = signal('');
  protected readonly topUpError = signal('');

  protected openTopUp(): void {
    this.topUpAmount.set('');
    this.topUpError.set('');
    this.topUpOpen.set(true);
  }

  protected confirmTopUp(): void {
    const raw = this.topUpAmount().trim();
    const amount = raw === '' ? 50 : Number(raw);
    if (!(amount > 0) || amount > 10_000) {
      this.topUpError.set('Enter an amount between 1 and 10,000 USD.');
      return;
    }
    this.store.topUp(amount);
    this.topUpOpen.set(false);
    this.notice.emit(`$${amount.toFixed(2)} added to your wallet.`);
  }
}
