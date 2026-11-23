import { Component, input } from '@angular/core';
import { LkAvatarComponent } from './lk-avatar.component';
import { LkIconComponent } from './lk-icon.component';

type Face = 'emma' | 'james' | 'lucas' | 'sophie';
interface Row { name: string; text: string; when: string; badge?: number; face?: Face; ini?: string; tone?: string; group?: boolean; active?: boolean }

/** The Chats list, as the real apps show it. Decorative. */
@Component({
  selector: 'lk-chat-list',
  imports: [LkAvatarComponent, LkIconComponent],
  template: `
    @for (r of rows; track r.name) {
      <div class="row" [class.on]="r.active" [class.dense]="dense()">
        @if (r.group) { <span class="grp"><lk-icon name="users" /></span> }
        @else if (r.face) { <lk-avatar [face]="r.face" /> }
        @else { <lk-avatar [initials]="r.ini ?? ''" [tone]="r.tone ?? '#1f9e83'" /> }
        <span class="tx"><b>{{ r.name }}</b><small>{{ r.text }}</small></span>
        <span class="meta"><time>{{ r.when }}</time>@if (r.badge) { <i>{{ r.badge }}</i> }</span>
      </div>
    }
  `,
  styles: `
    :host{display:flex;flex-direction:column;min-width:0;color:#14213d;font-family:var(--font-body,system-ui,sans-serif);text-align:start}
    .row{display:flex;align-items:center;gap:calc(11*var(--u));padding:calc(10*var(--u)) calc(14*var(--u));--lk-av:calc(36*var(--u))}
    .row.on{background:#f0f7ea}
    .row.dense{padding:calc(7*var(--u)) calc(12*var(--u));gap:calc(9*var(--u));--lk-av:calc(30*var(--u))}
    .grp{display:grid;place-items:center;flex:none;width:calc(36*var(--u));height:calc(36*var(--u));border-radius:50%;background:#1668cf;color:#fff;font-size:calc(19*var(--u))}
    .tx{flex:1;min-width:0;display:grid;gap:calc(2*var(--u))}
    b{font-size:calc(13*var(--u));font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    small{font-size:calc(11.5*var(--u));color:#566377;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .meta{display:grid;justify-items:end;gap:calc(4*var(--u));flex:none}
    time{font-size:calc(10*var(--u));color:#5b687a}
    i{display:grid;place-items:center;min-width:calc(17*var(--u));height:calc(17*var(--u));padding:0 calc(5*var(--u));border-radius:99px;background:#4d7a2c;color:#fff;font-size:calc(9.5*var(--u));font-weight:700;font-style:normal}
  `,
})
export class LkChatListComponent {
  readonly dense = input(false);
  protected readonly rows: Row[] = [
    { name: 'Team Marketing', text: "Let's meet at 3 PM", when: '10:24', badge: 2, group: true, active: true },
    { name: 'Product Team', text: 'File shared', when: '09:41', badge: 1, ini: 'PT', tone: '#1f9e83' },
    { name: 'Ahmed Hassan', text: 'Great, thanks!', when: 'Yesterday', face: 'lucas' },
    { name: 'Operations', text: 'Noted ✅', when: 'Yesterday', ini: 'OP', tone: '#5b8fd6' },
    { name: 'Mona Salah', text: 'See you there', when: 'Monday', face: 'emma' },
  ];
}
