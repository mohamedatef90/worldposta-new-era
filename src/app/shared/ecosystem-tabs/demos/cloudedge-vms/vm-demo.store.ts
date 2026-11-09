import { Service, signal } from '@angular/core';

/**
 * CloudEdge virtual machines, ported from the console's VirtualMachineService
 * and its mock data (cloudedge/src/pages/virtual-machines). State lives for
 * the visit, so a VM added on Home is still there on the CloudEdge page.
 * Nothing leaves the browser.
 */
export type VmStatus = 'running' | 'stopped' | 'suspended';
export type VmOs = 'windows' | 'ubuntu' | 'linux';

export interface VirtualMachine {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly os: VmOs;
  readonly cores: number;
  readonly memory: number; // GB
  readonly storage: number; // GB
  readonly nicCount: number;
  readonly ipAddress: string;
  readonly reservationName: string | null;
  readonly creationDate: string;
  readonly status: VmStatus;
  readonly deletedAt?: string;
}

export interface NewVm {
  readonly name: string;
  readonly os: VmOs;
  readonly cores: number;
  readonly memory: number;
  readonly storage: number;
  readonly description: string;
  readonly reservationName: string | null;
}

const VIRTUAL_MACHINES_DATA: readonly VirtualMachine[] = [
  { id: 'vm-01', name: 'prod-web-server-01', description: 'Main production web server hosting the company website and customer-facing API.', os: 'ubuntu', cores: 4, memory: 8, storage: 100, nicCount: 2, ipAddress: '192.168.1.10', reservationName: 'Web-Tier-Reservation', creationDate: '2023-05-10', status: 'running' },
  { id: 'vm-02', name: 'sql-database-main', description: 'Primary SQL database server for all production applications. High availability enabled.', os: 'windows', cores: 8, memory: 32, storage: 500, nicCount: 1, ipAddress: '192.168.1.15', reservationName: 'DB-Tier-Reservation', creationDate: '2023-03-22', status: 'running' },
  { id: 'vm-03', name: 'dev-environment-centos', description: 'General purpose development and testing environment for the engineering team.', os: 'linux', cores: 2, memory: 4, storage: 50, nicCount: 1, ipAddress: '10.0.0.5', reservationName: null, creationDate: '2023-08-01', status: 'stopped' },
  { id: 'vm-04', name: 'k8s-worker-node-a', description: 'Kubernetes worker node for the containerized application cluster.', os: 'ubuntu', cores: 16, memory: 64, storage: 200, nicCount: 4, ipAddress: '192.168.2.21', reservationName: 'Compute-Cluster-Reservation', creationDate: '2023-09-15', status: 'running' },
  { id: 'vm-05', name: 'AD-Domain-Controller', description: 'Active Directory domain controller for user authentication and authorization.', os: 'windows', cores: 4, memory: 16, storage: 150, nicCount: 1, ipAddress: '172.16.0.10', reservationName: null, creationDate: '2022-11-30', status: 'suspended' },
];

const today = () => new Date().toISOString().split('T')[0];

@Service()
export class VmDemoStore {
  // As in the console, AD-Domain-Controller starts in the Recycle Bin.
  private readonly active = signal<VirtualMachine[]>(VIRTUAL_MACHINES_DATA.filter((vm) => vm.id !== 'vm-05'));
  private readonly recycled = signal<VirtualMachine[]>(
    VIRTUAL_MACHINES_DATA.filter((vm) => vm.id === 'vm-05').map((vm) => ({ ...vm, deletedAt: new Date(Date.now() - 12 * 3600_000).toISOString() })),
  );

  readonly virtualMachines = this.active.asReadonly();
  readonly recycledVirtualMachines = this.recycled.asReadonly();

  addVm(config: NewVm): VirtualMachine {
    const vm: VirtualMachine = {
      id: `vm-${Date.now()}`,
      ...config,
      nicCount: 1,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      creationDate: today(),
      status: 'running',
    };
    this.active.update((vms) => [vm, ...vms]);
    return vm;
  }

  updateVmStatus(id: string, status: VmStatus): void {
    this.active.update((vms) => vms.map((vm) => (vm.id === id ? { ...vm, status } : vm)));
  }

  /** Moves a VM to the Recycle Bin, powering it off first as the console does. */
  deleteVm(id: string): void {
    const vm = this.active().find((v) => v.id === id);
    if (!vm) return;
    this.recycled.update((bin) => [...bin, { ...vm, status: vm.status === 'running' ? 'stopped' : vm.status, deletedAt: new Date().toISOString() }]);
    this.active.update((vms) => vms.filter((v) => v.id !== id));
  }

  recoverVm(id: string): void {
    const vm = this.recycled().find((v) => v.id === id);
    if (!vm) return;
    const { deletedAt: _deletedAt, ...restored } = vm;
    this.recycled.update((bin) => bin.filter((v) => v.id !== id));
    this.active.update((vms) => [...vms, restored]);
  }

  permanentlyDeleteVm(id: string): void {
    this.recycled.update((bin) => bin.filter((v) => v.id !== id));
  }
}
