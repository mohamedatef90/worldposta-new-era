import { Component, computed, inject, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowRight, faCircleCheck, faCircleXmark, faCopy, faEnvelopeOpenText, faEye, faEyeSlash, faKey, faPlus, faQrcode, faShieldHalved,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { DemoDialogComponent } from '../demo-dialog.component';
import { IamDemoStore, type AccessKey, type CreatedKey, type MfaMethod } from './iam-demo.store';

type View = 'security' | 'keys';
type PasswordField = 'oldPassword' | 'newPassword' | 'confirmNewPassword';

/** The manual-entry secret the portal shows under its QR code. */
const MFA_SECRET = 'JBSWY3DPEHPK3PXP';

/**
 * Account security and access keys, working: the MFA setup flow (method,
 * code, "MFA Enabled!", manage and disable), Change Password with
 * validation, Recent Login Activity, and WorldPosta IO access keys (create
 * with a show-once secret, copy, revoke). Ported from
 * user-types-of-worldposta-unified-sign-in/pages/settings/SecuritySettingsPage.tsx
 * (+ the Change Password card of AccountSettingsPage.tsx) and
 * objstore/frontend/src/features/keys/KeysPage.tsx + CreateKeyDialog.tsx.
 * Only the page content is shown, without the portal's sidebar and top bar.
 */
@Component({
  selector: 'app-iam-access-demo',
  imports: [FaIconComponent, DemoDialogComponent],
  templateUrl: './iam-demo.component.html',
  styleUrls: ['../demo.css', './iam-demo.component.css'],
})
export class IamDemoComponent {
  private readonly store = inject(IamDemoStore);

  protected readonly i = {
    arrow: faArrowRight, ok: faCircleCheck, off: faCircleXmark, copy: faCopy, mail: faEnvelopeOpenText, show: faEye, hide: faEyeSlash,
    key: faKey, plus: faPlus, qr: faQrcode, shield: faShieldHalved, warn: faTriangleExclamation,
  };
  protected readonly views: { id: View; label: string }[] = [
    { id: 'security', label: 'Security Settings' },
    { id: 'keys', label: 'Access Keys' },
  ];
  protected readonly view = signal<View>('security');
  protected readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  protected readonly mfa = this.store.mfaState;
  protected readonly logs = this.store.loginLogs;
  protected readonly email = this.store.email;
  protected readonly secret = MFA_SECRET;

  /* ---------- MFA setup, as the portal's three-step modal ---------- */
  protected readonly mfaOpen = signal(false);
  protected readonly mfaStep = signal<1 | 2 | 3>(1);
  protected readonly mfaMethod = signal<MfaMethod>('app');
  protected readonly mfaCode = signal('');
  protected readonly mfaError = signal('');
  protected readonly confirmDisable = signal(false);

  protected openMfa(): void {
    this.mfaStep.set(1);
    this.mfaMethod.set('app');
    this.mfaCode.set('');
    this.mfaError.set('');
    this.confirmDisable.set(false);
    this.mfaOpen.set(true);
  }

  protected mfaContinue(): void {
    this.mfaError.set('');
    this.mfaStep.set(2);
  }

  protected setCode(value: string): void {
    // Digits only, as an authenticator code; extra characters are dropped.
    this.mfaCode.set(value.replace(/\D/g, '').slice(0, 6));
    this.mfaError.set('');
  }

  /** Any six digits verify in the demo; the format is still checked. */
  protected verify(): void {
    if (!/^\d{6}$/.test(this.mfaCode())) {
      this.mfaError.set('Enter the 6-digit code from your ' + (this.mfaMethod() === 'app' ? 'authenticator app.' : 'email.'));
      return;
    }
    this.store.enableMfa(this.mfaMethod());
    this.mfaStep.set(3);
    this.notify('Multi-Factor Authentication is enabled.');
  }

  protected disableMfa(): void {
    this.store.disableMfa();
    this.mfaOpen.set(false);
    this.notify('Multi-Factor Authentication is disabled.');
  }

  /** A QR-like pattern for the demo (the portal draws a real otpauth QR with an online service). */
  protected readonly qrCells = (() => {
    const n = 25;
    const cells: { x: number; y: number }[] = [];
    let seed = 0;
    for (const ch of MFA_SECRET) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    const rand = () => ((seed = (seed * 1103515245 + 12345) >>> 0) >>> 16) & 1;
    const finder = (x: number, y: number) =>
      [[0, 0], [n - 7, 0], [0, n - 7]].some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7);
    const finderOn = (x: number, y: number) => {
      const [fx, fy] = x < 7 && y < 7 ? [0, 0] : x >= n - 7 ? [n - 7, 0] : [0, n - 7];
      const dx = x - fx;
      const dy = y - fy;
      return dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
    };
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (finder(x, y) ? finderOn(x, y) : rand()) cells.push({ x, y });
      }
    }
    return cells;
  })();

  /* ---------- Change Password ---------- */
  protected readonly passwords = signal<Record<PasswordField, string>>({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
  protected readonly showPasswords = signal(false);
  protected readonly passwordSubmitted = signal(false);
  protected readonly passwordChangedAt = this.store.passwordChangedAt;

  protected readonly passwordErrors = computed(() => {
    const p = this.passwords();
    const e: Partial<Record<PasswordField, string>> = {};
    if (!p.oldPassword) e.oldPassword = 'Enter your current password.';
    if (p.newPassword.length < 8) e.newPassword = 'Password must be at least 8 characters long.';
    else if (p.newPassword === p.oldPassword) e.newPassword = 'Choose a password different from the old one.';
    if (p.confirmNewPassword !== p.newPassword || !p.confirmNewPassword) e.confirmNewPassword = 'New passwords do not match.';
    return e;
  });

  protected passwordError(field: PasswordField): string | null {
    return this.passwordSubmitted() ? (this.passwordErrors()[field] ?? null) : null;
  }

  protected setPassword(field: PasswordField, value: string): void {
    this.passwords.update((p) => ({ ...p, [field]: value }));
  }

  protected changePassword(event: Event): void {
    event.preventDefault();
    this.passwordSubmitted.set(true);
    if (Object.keys(this.passwordErrors()).length) return;
    this.store.changePassword();
    this.passwords.set({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    this.passwordSubmitted.set(false);
    this.notify('Your password has been changed.');
  }

  /* ---------- Access keys ---------- */
  protected readonly keys = this.store.accessKeys;
  protected readonly createOpen = signal(false);
  protected readonly keyLabel = signal('');
  protected readonly minted = signal<CreatedKey | null>(null);
  protected readonly revoking = signal<AccessKey | null>(null);

  protected openCreate(): void {
    this.keyLabel.set('');
    this.minted.set(null);
    this.createOpen.set(true);
  }

  protected createKey(event: Event): void {
    event.preventDefault();
    this.minted.set(this.store.createKey(this.keyLabel().trim()));
  }

  /** Closing forgets the secret for good, as the real dialog does. */
  protected closeCreate(): void {
    const created = this.minted();
    this.createOpen.set(false);
    this.minted.set(null);
    if (created) this.notify(`Access key ${created.accessKeyId} created.`);
  }

  protected async copy(text: string, what: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.notify(`${what} copied to the clipboard.`);
    } catch {
      this.notify(`Couldn't reach the clipboard. Select the ${what.toLowerCase()} and copy it.`);
    }
  }

  protected confirmRevoke(): void {
    const key = this.revoking();
    this.revoking.set(null);
    if (!key) return;
    this.store.revokeKey(key.id);
    this.notify('Access key revoked');
  }

  /* ---------- Shared ---------- */
  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  protected notify(text: string): void {
    this.toast.set(text);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 3200);
  }
}
