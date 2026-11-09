import { Service, signal } from '@angular/core';

/**
 * CloudEdge cost management: reservations, the wallet and the invoice
 * history. Reservations and plans are ported from the console's
 * ReservationService and its mock data (cloudedge/src/pages/reservations);
 * invoices from the customer portal's mockInvoices
 * (user-types-of-worldposta-unified-sign-in/data.ts). State lives for the
 * visit, so a reservation added on Home is still there on the CloudEdge page.
 * Nothing leaves the browser.
 */
export type AddonName =
  | 'Windows Enterprise Licenses'
  | 'Linux Enterprise Licenses'
  | 'Cortex XDR Endpoint Protection / VM'
  | 'Public IPs'
  | 'Load Balancer/ IP'
  | 'Advanced Backup by Veeam'
  | 'Trend Micro Deep Security/ VM';

export interface PlanAddon {
  readonly name: AddonName;
  readonly included: boolean;
  readonly quantity?: number;
}

export interface Plan {
  readonly name: string;
  readonly type: 'Fixed' | 'Custom';
  readonly cores: number;
  readonly ram: number; // GB
  readonly storage: number; // GB
  readonly addons: readonly PlanAddon[];
  readonly price?: number; // monthly
}

export type ReservationStatus = 'Active' | 'Expired' | 'Pending' | 'Cancelled';
export type BillingMode = 'subscription' | 'payg_wallet';

export interface Reservation {
  readonly id: string;
  readonly name: string;
  readonly plan: Plan;
  readonly status: ReservationStatus;
  readonly startDate: string;
  readonly endDate: string;
  readonly billingMode?: BillingMode;
}

export interface InvoiceLine {
  readonly description: string;
  readonly units: number;
  readonly amount: number;
}

export interface Invoice {
  readonly id: string;
  readonly date: string;
  readonly amount: number;
  readonly status: 'Paid' | 'Unpaid';
  readonly billingPeriod: string;
  readonly nextBillingDate: string;
  readonly subscriptionId: string;
  readonly lineItems: readonly InvoiceLine[];
  readonly subTotal: number;
  readonly tax: { readonly label: string; readonly amount: number };
  readonly payments: number;
  readonly amountDue: number;
  readonly paymentDetails: string;
  readonly type?: string;
}

/** The demo customer every invoice is billed to (the portal's own mock account). */
export const BILLED_TO = {
  id: 'user123',
  name: 'Demo Customer Alpha',
  address: ['123 Innovation Drive', 'Tech City, TX 75001', 'United States'],
  email: 'customer@worldposta.com',
} as const;

export const ALL_ADDONS: readonly AddonName[] = [
  'Windows Enterprise Licenses', 'Linux Enterprise Licenses', 'Cortex XDR Endpoint Protection / VM',
  'Public IPs', 'Load Balancer/ IP', 'Advanced Backup by Veeam', 'Trend Micro Deep Security/ VM',
];

const addons = (included: readonly AddonName[], quantities: Partial<Record<AddonName, number>> = {}): PlanAddon[] =>
  ALL_ADDONS.map((name) => ({ name, included: included.includes(name), quantity: quantities[name] }));

const GENERAL: Plan = { name: 'General Purpose', type: 'Fixed', cores: 6, ram: 32, storage: 150, price: 224, addons: addons(['Cortex XDR Endpoint Protection / VM']) };
const COMPUTE: Plan = { name: 'Compute Optimized', type: 'Fixed', cores: 12, ram: 24, storage: 200, price: 280, addons: addons(['Cortex XDR Endpoint Protection / VM', 'Public IPs'], { 'Public IPs': 1 }) };
const MEMORY: Plan = { name: 'Memory Optimized', type: 'Fixed', cores: 20, ram: 128, storage: 1024, price: 768, addons: addons(['Cortex XDR Endpoint Protection / VM']) };

const RESERVATIONS: readonly Reservation[] = [
  { id: 'res-1', name: 'Web-Tier-Reservation', plan: GENERAL, status: 'Active', startDate: '2023-01-20', endDate: '2025-01-20' },
  { id: 'res-2', name: 'DB-Tier-Reservation', plan: MEMORY, status: 'Active', startDate: '2023-08-01', endDate: '2024-08-01' },
  { id: 'res-3', name: 'Dev-VM-Reservation-Old', plan: GENERAL, status: 'Expired', startDate: '2022-11-15', endDate: '2023-11-15' },
  { id: 'res-4', name: 'Compute-Cluster-Reservation', plan: COMPUTE, status: 'Active', startDate: '2024-02-10', endDate: '2025-02-10' },
  {
    id: 'res-5', name: 'Future-Project-Titan', status: 'Pending', startDate: '2024-09-01', endDate: '2025-09-01',
    plan: { name: 'Custom', type: 'Custom', cores: 16, ram: 64, storage: 1024, addons: addons(ALL_ADDONS, { 'Public IPs': 5 }) },
  },
];

const day = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString().split('T')[0];

const INVOICES: readonly Invoice[] = [
  {
    id: 'INV-2024-004', date: '2024-08-01', amount: 250, status: 'Unpaid', type: 'Renewal',
    billingPeriod: 'Aug 1, 2024 to Sep 1, 2024', nextBillingDate: 'Sep 1, 2024', subscriptionId: 'sub-cloud-cluster-xyz',
    lineItems: [{ description: 'CloudEdge - Web Server Cluster', units: 1, amount: 238.1 }, { description: 'Posta Standard Plan (5 users)', units: 1, amount: 50 }],
    subTotal: 288.1, tax: { label: 'Tax (8.25%)', amount: 23.77 }, payments: -61.87, amountDue: 250, paymentDetails: 'Awaiting payment.',
  },
  {
    id: 'INV-2024-005', date: day(0), amount: 38, status: 'Unpaid', type: 'New Subscription',
    billingPeriod: 'Current', nextBillingDate: 'Next Month', subscriptionId: 'sub-posta-biz-456',
    lineItems: [{ description: 'Posta Business Plan (10 users)', units: 1, amount: 38 }],
    subTotal: 38, tax: { label: 'Tax (0%)', amount: 0 }, payments: 0, amountDue: 38, paymentDetails: 'Awaiting payment.',
  },
  {
    id: 'INV-2024-006', date: day(-10), amount: 55, status: 'Unpaid', type: 'Upgrade',
    billingPeriod: 'Current', nextBillingDate: 'Next Month', subscriptionId: 'sub-posta-pro-789',
    lineItems: [{ description: 'Posta Pro Plan (10 users)', units: 1, amount: 55 }],
    subTotal: 55, tax: { label: 'Tax (0%)', amount: 0 }, payments: 0, amountDue: 55, paymentDetails: 'Awaiting payment.',
  },
  {
    id: 'INV-2024-003', date: '2024-07-01', amount: 150, status: 'Paid',
    billingPeriod: 'Jul 1, 2024 to Aug 1, 2024', nextBillingDate: 'Aug 1, 2024', subscriptionId: 'sub-posta-std-abc',
    lineItems: [{ description: 'Posta Standard Plan (10 users)', units: 1, amount: 100 }, { description: 'Advanced Email Archiving', units: 1, amount: 42.86 }],
    subTotal: 142.86, tax: { label: 'Tax (5%)', amount: 7.14 }, payments: -150, amountDue: 0,
    paymentDetails: '$150.00 was paid on Jul 3, 2024 by Visa card ending 4242.',
  },
];

const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });

@Service()
export class BillingDemoStore {
  private readonly reservationList = signal<Reservation[]>([...RESERVATIONS]);
  private readonly invoiceList = signal<Invoice[]>([...INVOICES]);
  private readonly wallet = signal(200);
  private invoiceSeq = 8;

  readonly reservations = this.reservationList.asReadonly();
  readonly invoices = this.invoiceList.asReadonly();
  readonly walletBalance = this.wallet.asReadonly();

  addReservations(reservations: readonly Reservation[]): void {
    this.reservationList.update((list) => [...reservations, ...list]);
  }

  updateReservation(id: string, change: Partial<Reservation>): void {
    this.reservationList.update((list) => list.map((r) => (r.id === id ? { ...r, ...change } : r)));
  }

  deleteReservation(id: string): void {
    this.reservationList.update((list) => list.filter((r) => r.id !== id));
  }

  topUp(amount: number): void {
    this.wallet.update((balance) => balance + amount);
  }

  /** A subscription is billed upfront: its first period becomes an unpaid invoice. */
  billSubscription(lines: readonly InvoiceLine[], period: string): Invoice {
    const subTotal = Math.round(lines.reduce((sum, l) => sum + l.amount, 0) * 100) / 100;
    const invoice: Invoice = {
      id: `INV-2024-${String(this.invoiceSeq++).padStart(3, '0')}`, date: day(0), amount: subTotal, status: 'Unpaid', type: 'New Subscription',
      billingPeriod: period, nextBillingDate: 'Next Month', subscriptionId: `sub-cloudedge-${Date.now().toString(36)}`,
      lineItems: lines, subTotal, tax: { label: 'Tax (0%)', amount: 0 }, payments: 0, amountDue: subTotal, paymentDetails: 'Awaiting payment.',
    };
    this.invoiceList.update((list) => [invoice, ...list]);
    return invoice;
  }

  payInvoice(id: string): void {
    this.invoiceList.update((list) =>
      list.map((inv) =>
        inv.id === id
          ? { ...inv, status: 'Paid', payments: inv.payments - inv.amountDue, amountDue: 0, paymentDetails: `$${inv.amountDue.toFixed(2)} was paid on ${shortDate(day(0))} by Visa card ending 4242.` }
          : inv,
      ),
    );
  }
}
