import { Component, input } from '@angular/core';

/** Resolution-independent product illustration; sample content, never live telemetry. */
@Component({
  selector: 'app-product-visual',
  template: `
    <figure class="product-visual" [attr.aria-label]="kind() === 'portal' ? 'Illustrative Posta Portal administration interface' : 'Illustrative IT automation workflow'">
      <figcaption><span class="visual-brand">{{ kind() === 'portal' ? 'Posta Portal' : 'WPSYS Automation' }}</span><span>Interface preview</span></figcaption>
      @if (kind() === 'portal') {
        <div class="portal-interface">
          <div class="visual-sidebar" aria-hidden="true"><b>Workspace</b><span class="selected">Organizations</span><span>Domains</span><span>Mailboxes</span><span>Security</span><span>Billing</span></div>
          <div class="visual-workspace"><header><div><small>Administration</small><h3>Organizations</h3></div><span class="visual-label">Multi-tenant control</span></header>
            <div class="visual-summary"><div><span>Customers</span><strong>One workspace</strong></div><div><span>Email services</span><strong>Centralized</strong></div><div><span>Access policies</span><strong>In your control</strong></div></div>
            <div class="visual-table" aria-label="Example organizations"><div class="visual-row visual-row--head"><span>Organization</span><span>Services</span><span>Management</span></div><div class="visual-row"><span><i>A</i>Organization A</span><span>Email & domains</span><span class="visual-label">Configured</span></div><div class="visual-row"><span><i>B</i>Organization B</span><span>Mailboxes</span><span class="visual-label">Configured</span></div><div class="visual-row"><span><i>C</i>Organization C</span><span>Security policies</span><span class="visual-label">Configured</span></div></div>
            <div class="visual-bottom"><div><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6ZM8 12l3 3 5-6"/></svg><span><b>Security built in</b><small>Policies across every tenant</small></span></div><div><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v13H3ZM3 6l9 7 9-7"/></svg><span><b>Connected services</b><small>Email, domains and mailboxes</small></span></div></div>
          </div>
        </div>
      } @else {
        <div class="automation-interface"><header><div><small>Workflow designer</small><h3>From event to outcome</h3></div><span class="visual-label">Policy-driven workflows</span></header>
          <ol class="visual-flow"><li><span class="flow-icon"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="m18 3-12 15h9l-2 11 13-16h-9Z"/></svg></span><strong>Trigger</strong><small>Events & conditions</small></li><li><span class="flow-icon"><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="4" width="9" height="9" rx="2"/><rect x="19" y="19" width="9" height="9" rx="2"/><path d="M13 8h10v11M8 13v11h11"/></svg></span><strong>Automate</strong><small>Run approved workflows</small></li><li><span class="flow-icon"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 28V16h5v12M14 28V9h5v19M24 28V3h5v25"/></svg></span><strong>Monitor</strong><small>Track execution</small></li><li><span class="flow-icon"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="m4 25 10-10 6 5L29 6M19 6h10v10"/></svg></span><strong>Optimize</strong><small>Improve continuously</small></li></ol>
          <div class="workflow-line"><span><i></i>Workflow controls</span><span>Approval gates</span><span>Audit trail</span></div>
          <div class="visual-bottom"><div><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h4l3-7 4 14 3-7h3"/></svg><span><b>Execution visibility</b><small>Follow every step in one place</small></span></div><div><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6ZM8 12l3 3 5-6"/></svg><span><b>Consistent operations</b><small>Repeatable, controlled actions</small></span></div></div>
        </div>
      }
    </figure>
  `,
  styleUrl: './product-visual.component.css',
})
export class ProductVisualComponent {
  readonly kind = input<'portal' | 'automation'>('portal');
}
