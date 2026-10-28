import { Component } from '@angular/core';

/**
 * "Managed End to End" visual: the SAP stack WorldPosta runs, as live text.
 * Three layers (applications, database, cloud infrastructure) with the two
 * services that wrap all of them (secure operations, monitoring) above.
 * Replaces an AI render with baked-in text; no SAP logo, only product names.
 */
@Component({
  selector: 'app-sap-architecture',
  template: `
    <div class="arch">
      <div class="arch__rails">
        <div class="arch__rail arch__rail--secure">
          <span class="arch__icon" aria-hidden="true">
            <svg viewBox="0 0 32 32"><path d="M16 3c4 3 8 4 11 5v9c0 6-6 10-11 13C11 27 5 23 5 17V8c3-1 7-2 11-5ZM11 16l4 4 7-8" /></svg>
          </span>
          <div>
            <h3>Secure Operations</h3>
            <ul><li>Threat protection</li><li>Access control</li><li>Continuous monitoring</li></ul>
          </div>
        </div>
        <div class="arch__rail arch__rail--monitor">
          <span class="arch__icon" aria-hidden="true">
            <svg viewBox="0 0 32 32"><path d="M5 27V17h5v10M14 27V10h5v17M23 27V3h5v24M3 28h27" /></svg>
          </span>
          <div>
            <h3>Monitoring &amp; Optimization</h3>
            <ul><li>Performance tuning</li><li>Capacity planning</li><li>Proactive alerts</li></ul>
          </div>
        </div>
      </div>

      <ol class="arch__stack" aria-label="SAP landscape layers">
        <li class="arch__layer arch__layer--apps">
          <span class="arch__icon" aria-hidden="true">
            <svg viewBox="0 0 32 32"><rect x="4" y="5" width="24" height="18" rx="2" /><path d="M4 10h24M11 28h10M16 23v5" /></svg>
          </span>
          <div><h3>SAP Applications</h3><p>S/4HANA, ECC and business modules</p></div>
        </li>
        <li class="arch__layer arch__layer--db">
          <span class="arch__icon" aria-hidden="true">
            <svg viewBox="0 0 32 32"><ellipse cx="16" cy="7" rx="10" ry="4" /><path d="M6 7v18c0 2 4.5 4 10 4s10-2 10-4V7M6 16c0 2 4.5 4 10 4s10-2 10-4" /></svg>
          </span>
          <div><h3>Database Layer</h3><p>SAP HANA and supported databases</p></div>
        </li>
        <li class="arch__layer arch__layer--infra">
          <span class="arch__icon" aria-hidden="true">
            <svg viewBox="0 0 32 32"><path d="M9 25a7 7 0 0 1-1-14 10 10 0 0 1 19 2 6 6 0 0 1-1 12Z" /><path d="M12 19h1m3 0h1m3 0h1" /></svg>
          </span>
          <div><h3>Cloud Infrastructure</h3><p>High availability and scalable resources</p></div>
        </li>
      </ol>
    </div>
  `,
  styles: `
    :host { display:block; }
    .arch {
      position:relative; height:100%; box-sizing:border-box; padding:28px;
      display:flex; flex-direction:column; gap:22px;
      border:1px solid var(--color-border); border-radius:var(--radius-xl);
      background:
        radial-gradient(ellipse 70% 55% at 50% 100%, color-mix(in srgb, var(--wp-blue) 12%, transparent), transparent 70%),
        var(--color-bg-secondary);
    }
    h3 { margin:0; font-size:var(--fs-body); line-height:1.3; font-weight:var(--fw-bold); color:var(--color-text-primary); }
    p, li { font-size:13px; line-height:1.45; color:var(--color-text-secondary); }
    p { margin:2px 0 0; }
    ul, ol { list-style:none; margin:0; padding:0; }
    svg { width:22px; height:22px; fill:none; stroke:currentColor; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
    .arch__icon { display:grid; place-items:center; flex-shrink:0; width:44px; height:44px; border-radius:12px; color:var(--tone); background:color-mix(in srgb, var(--tone) 14%, transparent); }

    .arch__rails { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .arch__rail { --tone:var(--color-brand-green); display:flex; gap:12px; align-items:flex-start; padding:14px; border-radius:var(--radius-lg); border:1px solid var(--color-border); background:var(--color-bg-primary); }
    .arch__rail--monitor { --tone:var(--wp-tone-purple); }
    .arch__rail ul { margin-top:6px; display:grid; gap:2px; }
    .arch__rail li::before { content:'✓'; margin-right:6px; color:var(--tone); font-weight:var(--fw-bold); }

    /* The stack: three layers joined by a spine, each wrapped by both rails. */
    .arch__stack { position:relative; flex:1; display:grid; gap:14px; align-content:center; }
    .arch__stack::before { content:''; position:absolute; left:38px; top:30px; bottom:30px; width:2px; border-radius:2px; background:linear-gradient(to bottom, var(--wp-blue), var(--color-brand-green)); opacity:.5; }
    .arch__layer { --tone:var(--wp-blue); position:relative; display:flex; gap:14px; align-items:center; padding:14px 16px; border-radius:var(--radius-lg); border:1px solid color-mix(in srgb, var(--tone) 35%, var(--color-border)); background:var(--color-bg-primary); box-shadow:var(--shadow-sm); }
    .arch__layer--db { --tone:var(--wp-tone-sky); }
    .arch__layer--infra { --tone:var(--color-brand-green); }
    @media (max-width:560px) {
      .arch { padding:18px; }
      .arch__rails { grid-template-columns:1fr; }
    }
  `,
})
export class SapArchitectureComponent {}
