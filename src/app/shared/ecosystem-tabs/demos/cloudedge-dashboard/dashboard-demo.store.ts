import { Service, signal } from '@angular/core';

/**
 * CloudEdge console dashboard state, ported from cloudedge/src/pages/dashboard
 * (dashboard.component.ts mock figures) and DashboardStateService (widget
 * visibility). Lives for the visit, so a customised layout or a finished
 * speed test is still there after switching tabs. Nothing leaves the browser.
 */
export type StatKey = 'cpu' | 'memory' | 'storage' | 'vms';

export interface StatPoint {
  readonly time: number; // epoch ms
  readonly value: number;
}

export interface StatCard {
  readonly key: StatKey;
  readonly title: string;
  readonly value: number;
  readonly total: number;
  readonly unit: string;
  readonly percentage: number;
  readonly label: string;
  readonly uptime?: string;
  readonly history: readonly StatPoint[];
}

export interface DashboardWidgetVisibility {
  readonly stats: boolean;
  readonly topVms: boolean;
  readonly auditTrail: boolean;
  readonly securityScore: boolean;
  readonly networkStatus: boolean;
  readonly helpfulResources: boolean;
}

export interface AuditTrailEntry {
  readonly id: string;
  readonly eventName: string;
  readonly eventSource: 'Compute' | 'Security' | 'Network' | 'Identity';
  readonly eventTime: string;
  readonly user: string;
  readonly resourceName: string;
  readonly ipAddress: string;
  readonly status: 'Success' | 'Failure';
}

export interface NetworkStatus {
  readonly gateways: number;
  readonly activeNatRules: number;
  readonly speedTestResult: string | null;
  readonly latency: string;
  readonly packetLoss: string;
  readonly isTestingSpeed: boolean;
}

export const DEFAULT_VISIBILITY: DashboardWidgetVisibility = {
  stats: true, topVms: true, auditTrail: true, securityScore: true, networkStatus: true, helpfulResources: true,
};

/** A small seeded generator, so the demo's charts are the same on every visit. */
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/**
 * The console's generateHistoricalData: seven days of readings around a base
 * level with noise and a slow wave. Every five minutes, so the 1H view has points too.
 */
const history = (seed: number, max: number, startPercent: number, noise = 0.2, sineFactor = 0.1, round = false): StatPoint[] => {
  const rand = seeded(seed);
  const now = Date.now();
  const step = 5 * 60_000;
  const total = 7 * 24 * 12;
  const data: StatPoint[] = [];
  for (let i = total; i > 0; i--) {
    let value = max * startPercent + (rand() - 0.5) * max * noise + Math.sin(i / 36) * max * sineFactor;
    value = Math.max(0, Math.min(max, value));
    data.push({ time: now - i * step, value: round ? Math.round(value) : Math.round(value * 10) / 10 });
  }
  return data;
};

const STATS: readonly StatCard[] = [
  { key: 'cpu', title: 'CPU Cores', value: 45, total: 64, unit: 'cores', percentage: 70, label: 'utilized', history: history(11, 100, 0.65) },
  { key: 'memory', title: 'Memory', value: 182, total: 256, unit: 'GB', percentage: 71, label: 'utilized', history: history(23, 100, 0.7) },
  { key: 'storage', title: 'Storage', value: 1456, total: 2048, unit: 'GB', percentage: 71, label: 'utilized', history: history(37, 100, 0.7, 0.05, 0.02) },
  { key: 'vms', title: 'Active VMs', value: 12, total: 18, unit: 'total', percentage: Math.round((12 / 18) * 100), label: '', uptime: 'Uptime: 99.8%', history: history(41, 18, 0.6, 0.3, 0.1, true) },
];

const AUDIT_TRAIL: readonly AuditTrailEntry[] = [
  { id: 'evt-1', eventName: 'StartInstances', eventSource: 'Compute', eventTime: '5 minutes ago', user: 'Admin', resourceName: 'prod-web-server-01', ipAddress: '73.125.88.10', status: 'Success' },
  { id: 'evt-2', eventName: 'CreatePolicy', eventSource: 'Security', eventTime: '1 hour ago', user: 'Admin', resourceName: 'Allow-HTTP-External', ipAddress: '73.125.88.10', status: 'Success' },
  { id: 'evt-3', eventName: 'RunSecurityScan', eventSource: 'Security', eventTime: '3 hours ago', user: 'System', resourceName: 'All Production VMs', ipAddress: 'internal-system', status: 'Success' },
  { id: 'evt-4', eventName: 'AttachVolume', eventSource: 'Compute', eventTime: '6 hours ago', user: 'Admin', resourceName: 'data-archive-01', ipAddress: '73.125.88.10', status: 'Success' },
  { id: 'evt-5', eventName: 'ConsoleLogin', eventSource: 'Identity', eventTime: 'Yesterday', user: 'Jane Doe', resourceName: 'user/jane.doe', ipAddress: '104.28.71.118', status: 'Success' },
  { id: 'evt-6', eventName: 'UpdateGateway', eventSource: 'Network', eventTime: '2 days ago', user: 'Admin', resourceName: 'main-gateway-01', ipAddress: '73.125.88.10', status: 'Failure' },
];

@Service()
export class DashboardDemoStore {
  readonly stats = STATS;
  readonly auditTrail = AUDIT_TRAIL;
  readonly securityScore = { score: 87, activeThreats: 2, blockedAttempts: 156, sslCertificates: '8 valid' } as const;

  private readonly visibility = signal<DashboardWidgetVisibility>(DEFAULT_VISIBILITY);
  readonly widgetVisibility = this.visibility.asReadonly();

  /** Four gateways and three enabled NAT rules, as in the console's gateway and NAT mock data. */
  private readonly network = signal<NetworkStatus>({
    gateways: 4, activeNatRules: 3, speedTestResult: null, latency: '12ms', packetLoss: '0.01%', isTestingSpeed: false,
  });
  readonly networkStatus = this.network.asReadonly();

  /** The bars grow in once per visit, as the console's DashboardAnimationService does. */
  readonly hasAnimated = signal(false);

  updateVisibility(next: DashboardWidgetVisibility): void {
    this.visibility.set(next);
  }

  /** The console's simulated test: 2.5 s, then a download speed between 50 and 500 Mbps. */
  runSpeedTest(): void {
    if (this.network().isTestingSpeed) return;
    this.network.update((n) => ({ ...n, isTestingSpeed: true, speedTestResult: null }));
    setTimeout(() => {
      this.network.update((n) => ({
        ...n,
        isTestingSpeed: false,
        speedTestResult: `${(Math.random() * 450 + 50).toFixed(2)} Mbps`,
        latency: `${Math.round(Math.random() * 10 + 8)}ms`,
        packetLoss: `${(Math.random() * 0.04).toFixed(2)}%`,
      }));
    }, 2500);
  }
}
