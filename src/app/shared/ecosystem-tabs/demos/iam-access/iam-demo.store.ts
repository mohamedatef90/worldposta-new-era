import { Service, signal } from '@angular/core';

/**
 * Account security and access keys. MFA, password and login activity come
 * from the portal's SecuritySettingsPage and AccountSettingsPage
 * (user-types-of-worldposta-unified-sign-in/pages/settings); access keys from
 * WorldPosta IO's KeysPage (objstore/frontend/src/features/keys). Keys are
 * generated in the browser with crypto.getRandomValues and never leave it;
 * passwords are never stored, only the time of the change.
 */
export type MfaMethod = 'app' | 'email';

export interface AccessKey {
  readonly id: string;
  readonly label: string;
  readonly accessKeyId: string;
  readonly createdAt: string;
  readonly lastUsedAt?: string;
}

/** Shown once, at creation; the store keeps only the public part. */
export interface CreatedKey extends AccessKey {
  readonly secretKey: string;
}

export interface LoginLog {
  readonly id: number;
  readonly date: string;
  readonly ip: string;
  readonly location: string;
  readonly device: string;
  readonly status: 'Success' | 'Failed';
}

const ago = (hours: number) => new Date(Date.now() - hours * 3600_000).toISOString();

const LOGIN_LOGS: readonly LoginLog[] = [
  { id: 1, date: ago(0), ip: '192.168.1.10', location: 'New York, USA', device: 'Chrome on macOS', status: 'Success' },
  { id: 2, date: ago(5), ip: '10.0.0.5', location: 'London, UK', device: 'Firefox on Windows', status: 'Success' },
  { id: 3, date: ago(25), ip: '203.0.113.19', location: 'Tokyo, Japan', device: 'Safari on iOS', status: 'Failed' },
  { id: 4, date: ago(48), ip: '198.51.100.22', location: 'Sydney, Australia', device: 'Chrome on Android', status: 'Success' },
];

const KEYS: readonly AccessKey[] = [
  { id: 'k1', label: 'Veeam backup', accessKeyId: 'AKIA7QW3ZP5NX2KD8RLT', createdAt: ago(24 * 40), lastUsedAt: ago(2) },
  { id: 'k2', label: 'Website assets', accessKeyId: 'AKIAM4HV6CJ2YB9TQE3W', createdAt: ago(24 * 12), lastUsedAt: ago(30) },
  { id: 'k3', label: '', accessKeyId: 'AKIAD8LR2XW5NF7PK6ZS', createdAt: ago(24 * 3) },
];

const KEY_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const SECRET_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function randomString(length: number, alphabet: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  // Both alphabets divide 256 evenly, so the modulo is unbiased.
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

@Service()
export class IamDemoStore {
  private readonly mfa = signal<{ enabled: boolean; method: MfaMethod }>({ enabled: false, method: 'app' });
  private readonly keyList = signal<AccessKey[]>([...KEYS]);
  private readonly passwordChanged = signal<string | null>(null);

  readonly mfaState = this.mfa.asReadonly();
  readonly accessKeys = this.keyList.asReadonly();
  readonly passwordChangedAt = this.passwordChanged.asReadonly();
  readonly loginLogs = LOGIN_LOGS;
  readonly email = 'customer@worldposta.com';

  enableMfa(method: MfaMethod): void {
    this.mfa.set({ enabled: true, method });
  }

  disableMfa(): void {
    this.mfa.update((m) => ({ ...m, enabled: false }));
  }

  changePassword(): void {
    this.passwordChanged.set(new Date().toISOString());
  }

  createKey(label: string): CreatedKey {
    const key: CreatedKey = {
      id: `k-${Date.now()}`,
      label,
      accessKeyId: `AKIA${randomString(16, KEY_ALPHABET)}`,
      secretKey: randomString(40, SECRET_ALPHABET),
      createdAt: new Date().toISOString(),
    };
    const { secretKey: _secret, ...stored } = key;
    this.keyList.update((keys) => [...keys, stored]);
    return key;
  }

  revokeKey(id: string): void {
    this.keyList.update((keys) => keys.filter((k) => k.id !== id));
  }
}
