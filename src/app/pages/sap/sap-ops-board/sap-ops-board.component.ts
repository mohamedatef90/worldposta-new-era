import { Component, signal } from '@angular/core';

/**
 * "Always-On SAP Operations" visual: a live-looking operations board in code
 * (landscape health, a heartbeat line and a task feed where each event lights
 * up in turn). Sample statuses only, no SLA figures. Replaces an AI render of
 * a fake dashboard. Decorative, so hidden from assistive tech; the loop runs
 * past 5s, so it has a pause control (WCAG 2.2.2), and it is static under
 * reduced motion.
 */
@Component({
  selector: 'app-sap-ops-board',
  template: `
    <div class="board" [class.is-paused]="paused()" aria-hidden="true">
      <div class="board__head">
        <strong>SAP Operations Center</strong>
        <span class="board__live"><span class="board__dot"></span>Live</span>
      </div>

      <div class="board__tiles">
        @for (system of systems; track system.id) {
          <div class="board__tile">
            <span class="board__sid">{{ system.id }}</span>
            <span class="board__state"><span class="board__ok">✓</span>{{ system.state }}</span>
            <span class="board__role">{{ system.role }}</span>
          </div>
        }
      </div>

      <div class="board__pulse">
        <span class="board__label">System availability</span>
        <svg viewBox="0 0 300 60" preserveAspectRatio="none">
          <path class="board__beat" pathLength="1" d="M0 34 H70 L82 34 L90 14 L100 52 L110 24 L118 34 H190 L202 34 L210 18 L220 48 L230 30 L238 34 H300" />
        </svg>
      </div>

      <ol class="board__feed">
        @for (task of tasks; track task.text; let i = $index) {
          <li [style.--i]="i"><span class="board__tag" [attr.data-tone]="task.tone">{{ task.tag }}</span>{{ task.text }}<time>{{ task.time }}</time></li>
        }
      </ol>
    </div>
    <button
      type="button"
      class="board__toggle"
      [attr.aria-label]="paused() ? 'Play animation' : 'Pause animation'"
      (click)="paused.set(!paused())"
    >
      @if (paused()) {
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3l8 5-8 5z" /></svg>
      } @else {
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3h2v10H5zM9 3h2v10H9z" /></svg>
      }
    </button>
  `,
  styles: `
    :host { --cycle:12s; position:relative; display:block; }
    .board {
      height:100%; box-sizing:border-box; padding:24px; display:flex; flex-direction:column; gap:16px;
      border:1px solid var(--color-border); border-radius:var(--radius-xl);
      background:
        radial-gradient(ellipse 70% 50% at 100% 0%, color-mix(in srgb, var(--color-brand-green) 12%, transparent), transparent 70%),
        var(--color-bg-secondary);
    }
    .board__head { display:flex; align-items:center; justify-content:space-between; min-height:44px; padding-right:56px; }
    .board__head strong { font-size:var(--fs-body-lg); color:var(--color-text-primary); }
    .board__live { display:inline-flex; align-items:center; gap:8px; padding:4px 12px; border-radius:999px; font-size:var(--fs-caption); font-weight:var(--fw-bold); color:var(--color-text-primary); background:color-mix(in srgb, var(--color-brand-green) 14%, transparent); }
    .board__dot { width:8px; height:8px; border-radius:50%; background:var(--color-brand-green); }

    .board__tiles { display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; }
    .board__tile { display:grid; gap:4px; padding:14px; border-radius:var(--radius-lg); border:1px solid var(--color-border); background:var(--color-bg-primary); }
    .board__sid { font-size:var(--fs-caption); font-weight:var(--fw-bold); letter-spacing:1px; color:var(--color-text-secondary); }
    .board__state { display:flex; align-items:center; gap:6px; font-size:var(--fs-body); font-weight:var(--fw-bold); color:var(--color-text-primary); }
    .board__ok { display:grid; place-items:center; width:20px; height:20px; border-radius:50%; font-size:11px; color:#fff; background:var(--color-brand-green); }
    .board__role { font-size:var(--fs-caption); color:var(--color-text-secondary); }

    .board__pulse { padding:12px 14px 6px; border-radius:var(--radius-lg); border:1px solid var(--color-border); background:var(--color-bg-primary); }
    .board__label { font-size:var(--fs-caption); font-weight:var(--fw-bold); color:var(--color-text-secondary); }
    .board__pulse svg { display:block; width:100%; height:56px; }
    .board__beat { fill:none; stroke:var(--color-brand-green); stroke-width:2.5; stroke-linejoin:round; vector-effect:non-scaling-stroke; }

    .board__feed { flex:1; list-style:none; margin:0; padding:0; display:grid; gap:8px; align-content:start; }
    .board__feed li { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:var(--radius-md); border:1px solid transparent; font-size:var(--fs-body-sm); color:var(--color-text-primary); background:var(--color-bg-primary); }
    .board__feed time { margin-left:auto; font-size:var(--fs-caption); color:var(--color-text-secondary); white-space:nowrap; }
    .board__tag { flex-shrink:0; padding:2px 8px; border-radius:999px; font-size:11px; font-weight:var(--fw-bold); --tone:var(--wp-tone-blue); color:color-mix(in srgb, var(--tone) 50%, var(--wp-ink)); background:color-mix(in srgb, var(--tone) 14%, transparent); }
    .board__tag[data-tone='green'] { --tone:var(--wp-tone-green); }
    .board__tag[data-tone='purple'] { --tone:var(--wp-tone-purple); }
    .board__tag[data-tone='amber'] { --tone:var(--wp-tone-amber); }

    .board__toggle { position:absolute; right:20px; top:20px; display:grid; place-items:center; width:44px; height:44px; border:1px solid var(--color-border); border-radius:50%; background:var(--color-bg-secondary); color:var(--color-text-primary); cursor:pointer; box-shadow:var(--shadow-sm); }
    .board__toggle svg { width:14px; height:14px; fill:currentColor; }
    .board__toggle:focus-visible { outline:2px solid var(--color-action); outline-offset:2px; }

    @media (prefers-reduced-motion:no-preference) {
      .board__dot { animation:board-blink 1.6s ease-in-out infinite; }
      .board__beat { stroke-dasharray:1; animation:board-beat 3s linear infinite; }
      .board__feed li { animation:board-feed var(--cycle) infinite; animation-delay:calc(var(--i) * var(--cycle) / 4); }
      .is-paused * { animation-play-state:paused !important; }
    }
    @media (prefers-reduced-motion:reduce) { .board__toggle { display:none; } }
    @keyframes board-blink { 50% { opacity:.3; } }
    @keyframes board-beat { from { stroke-dashoffset:1; } to { stroke-dashoffset:-1; } }
    @keyframes board-feed {
      0%, 22%, 100% { border-color:transparent; box-shadow:none; }
      3%, 19% { border-color:color-mix(in srgb, var(--color-brand-green) 50%, var(--color-border)); box-shadow:var(--shadow-sm); }
    }
    @media (max-width:560px) {
      .board { padding:16px; }
      .board__tiles { grid-template-columns:1fr; }
      .board__feed time { display:none; }
    }
  `,
})
export class SapOpsBoardComponent {
  protected readonly paused = signal(false);

  /** Sample landscape (production, quality, development); fictional statuses. */
  protected readonly systems = [
    { id: 'PRD', state: 'Healthy', role: 'Production' },
    { id: 'QAS', state: 'Healthy', role: 'Quality' },
    { id: 'DEV', state: 'Healthy', role: 'Development' },
  ] as const;

  protected readonly tasks = [
    { tag: 'Backup', tone: 'green', text: 'Nightly backup completed on PRD', time: '2 min ago' },
    { tag: 'Patch', tone: 'blue', text: 'Security patch applied to QAS', time: '18 min ago' },
    { tag: 'Tuning', tone: 'purple', text: 'Work process tuning on PRD', time: '1 h ago' },
    { tag: 'Check', tone: 'amber', text: 'Capacity check scheduled for DEV', time: '3 h ago' },
  ] as const;
}
