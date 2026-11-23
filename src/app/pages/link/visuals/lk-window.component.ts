import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';
import { LkAvatarComponent } from './lk-avatar.component';
import { LkIconComponent } from './lk-icon.component';

interface NavItem { key: string; label: string; icon: string; badge?: number }
interface NavGroup { heading: string | null; items: NavItem[] }

/** The sidebar the real Link apps use (apps/web AppRail): Home and Activity, then Talk, Link & Calls and Keep. */
const NAV: NavGroup[] = [
  { heading: null, items: [{ key: 'home', label: 'Home', icon: 'home' }, { key: 'activity', label: 'Activity', icon: 'activity' }] },
  { heading: 'Talk', items: [{ key: 'chat', label: 'Chat', icon: 'chat', badge: 2 }, { key: 'workspaces', label: 'Workspaces', icon: 'users' }] },
  { heading: 'Link & Calls', items: [{ key: 'links', label: 'Links', icon: 'video' }, { key: 'calls', label: 'Calls', icon: 'phone' }] },
  { heading: 'Keep', items: [{ key: 'calendar', label: 'Calendar', icon: 'calendar' }, { key: 'files', label: 'Files', icon: 'folder' }] },
];

/**
 * The Posta Link desktop window as pure HTML/CSS. Sizes are in `em`: the host visual sets font-size so that
 * 1em is one design pixel and the whole window scales with its container. Decorative: the parent carries the label.
 */
@Component({
  selector: 'lk-window',
  imports: [NgOptimizedImage, LkIconComponent, LkAvatarComponent],
  template: `
    <div class="win" [class.win--flat]="flat()" aria-hidden="true">
      <header class="bar">
        <img class="logo" ngSrc="/worldposta-assets/link-ui/link-logo.webp" width="320" height="320" alt="" />
        @if (search()) {
          <div class="find"><lk-icon name="search" /><span>Search or start a conversation…</span></div>
        } @else {
          <span class="grow"></span>
        }
        <lk-icon class="act" name="video" />
        <lk-icon class="act" name="bell" />
        <lk-avatar class="me" face="emma" />
      </header>
      <div class="body">
        @if (sidebar() !== 'none') {
          <nav class="rail" [class.rail--icons]="sidebar() === 'icons'">
            @for (g of groups; track $index) {
              <div class="grp">
                @if (g.heading && sidebar() === 'full') { <p class="gh">{{ g.heading }}</p> }
                @for (n of g.items; track n.key) {
                  <div class="it" [class.on]="n.key === active()">
                    <lk-icon [name]="n.icon" />
                    @if (sidebar() === 'full') { <span class="lb">{{ n.label }}</span> }
                    @if (n.badge && sidebar() === 'full') { <span class="bd">{{ n.badge }}</span> }
                  </div>
                }
              </div>
            }
          </nav>
        }
        <div class="main"><ng-content /></div>
      </div>
    </div>
  `,
  styles: `
    :host{display:block;--lk-ink:#14213d;--lk-mut:#5b687a;--lk-ground:#f4f6f9;--lk-surface:#fcfdfe;--lk-border:#e4e9ef;--lk-action:#4d7a2c;--lk-select:#f0f7ea;--lk-mine:#e2f0d5}
    .win{display:flex;flex-direction:column;width:100%;height:100%;background:var(--lk-surface);color:var(--lk-ink);border-radius:calc(14*var(--u));overflow:hidden;box-shadow:0 0 0 1px var(--lk-border),0 calc(30*var(--u)) calc(60*var(--u)) calc(-20*var(--u)) rgb(20 33 61/.28),0 calc(8*var(--u)) calc(18*var(--u)) calc(-8*var(--u)) rgb(20 33 61/.16);font-family:var(--font-body,system-ui,sans-serif);line-height:1.3;text-align:start}
    .win--flat{border-radius:0;box-shadow:none}
    .bar{display:flex;align-items:center;gap:calc(14*var(--u));height:calc(46*var(--u));padding:0 calc(16*var(--u));border-bottom:1px solid var(--lk-border);flex:none}
    .logo{width:calc(36*var(--u));height:calc(36*var(--u));object-fit:contain;flex:none}
    .find{display:flex;align-items:center;gap:calc(8*var(--u));flex:1;max-width:calc(330*var(--u));height:calc(28*var(--u));padding:0 calc(12*var(--u));border-radius:calc(99*var(--u));background:#eef2f6;color:var(--lk-mut);font-size:calc(11*var(--u));white-space:nowrap;overflow:hidden}
    .find lk-icon{font-size:calc(13*var(--u))}
    .grow{flex:1}
    .act{font-size:calc(17*var(--u));color:var(--lk-mut)}
    .find+.act,.grow+.act{margin-inline-start:auto}
    .me{--lk-av:calc(28*var(--u))}
    .body{display:flex;flex:1;min-height:0}
    .rail{display:flex;flex-direction:column;gap:calc(6*var(--u));width:calc(152*var(--u));padding:calc(12*var(--u)) calc(10*var(--u));border-inline-end:1px solid var(--lk-border);background:var(--lk-surface);flex:none;overflow:hidden}
    .rail--icons{width:calc(48*var(--u));align-items:center;padding-inline:calc(6*var(--u))}
    .grp{display:flex;flex-direction:column;gap:calc(2*var(--u))}
    .gh{margin:calc(8*var(--u)) calc(8*var(--u)) calc(3*var(--u));font-size:calc(8.5*var(--u));font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--lk-mut)}
    .it{position:relative;display:flex;align-items:center;gap:calc(9*var(--u));height:calc(30*var(--u));padding:0 calc(9*var(--u));border-radius:calc(8*var(--u));font-size:calc(12*var(--u));color:var(--lk-mut);font-weight:500;white-space:nowrap}
    .rail--icons .it{width:calc(34*var(--u));justify-content:center;padding:0}
    .it lk-icon{font-size:calc(16*var(--u))}
    .it.on{background:var(--lk-select);color:var(--lk-action);font-weight:700}
    .bd{margin-inline-start:auto;display:grid;place-items:center;min-width:calc(17*var(--u));height:calc(17*var(--u));padding:0 calc(5*var(--u));border-radius:calc(99*var(--u));background:var(--lk-action);color:#fff;font-size:calc(9.5*var(--u));font-weight:700}
    .main{flex:1;min-width:0;min-height:0;display:flex;background:var(--lk-surface)}
  `,
})
export class LkWindowComponent {
  readonly active = input('chat');
  readonly sidebar = input<'full' | 'icons' | 'none'>('full');
  readonly search = input(true);
  readonly flat = input(false);
  protected readonly groups = NAV;
}
