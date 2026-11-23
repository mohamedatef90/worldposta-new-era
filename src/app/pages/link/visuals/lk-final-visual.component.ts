import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { LkChatListComponent } from './lk-chat-list.component';
import { LkIconComponent } from './lk-icon.component';
import { LkMeetPaneComponent } from './lk-meet-pane.component';
import { LkWindowComponent } from './lk-window.component';

/** Closing visual: Link on a laptop (meeting) beside the phone app (chats). Tilts with the pointer (see PostaLink.initTilt). */
@Component({
  selector: 'lk-final-visual',
  imports: [NgOptimizedImage, LkWindowComponent, LkMeetPaneComponent, LkChatListComponent, LkIconComponent],
  template: `
    <div class="stage lk-tilt" role="img" aria-label="Posta Link on a laptop displaying a four-person video meeting, alongside a mobile app displaying team conversations.">
      <div class="laptop" aria-hidden="true">
        <div class="lid"><div class="scr"><lk-window class="w" active="links" sidebar="icons" [flat]="true"><lk-meet-pane [count]="4" /></lk-window></div></div>
        <div class="base"><span></span></div>
      </div>
      <div class="phone" aria-hidden="true">
        <div class="ph">
          <header><img ngSrc="/worldposta-assets/link-ui/link-logo.webp" width="320" height="320" alt="" /><span class="plus"><lk-icon name="plus" [weight]="2.4" /></span></header>
          <lk-chat-list class="rows" [dense]="true" />
          <nav class="tabs">@for (t of tabs; track t.l) { <span [class.on]="t.on"><lk-icon [name]="t.i" />{{ t.l }}</span> }</nav>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host{display:block;direction:ltr;container-type:inline-size;perspective:1100px;perspective-origin:50% 50%}
    .stage{--u:calc(100cqw / 640);position:relative;width:100%;aspect-ratio:640/520;transform-style:preserve-3d;transform-origin:50% 50%;transition:transform .25s ease-out;will-change:transform;font-family:var(--font-body,system-ui,sans-serif)}
    .laptop{position:absolute;inset:calc(10*var(--u)) auto auto 0;width:calc(520*var(--u))}
    .lid{padding:calc(11*var(--u)) calc(11*var(--u)) calc(14*var(--u));border-radius:calc(20*var(--u)) calc(20*var(--u)) calc(6*var(--u)) calc(6*var(--u));background:#121a26;box-shadow:0 calc(30*var(--u)) calc(50*var(--u)) calc(-24*var(--u)) rgb(20 33 61/.55),inset 0 0 0 1px #2a3647}
    .scr{position:relative;aspect-ratio:16/10.3;border-radius:calc(8*var(--u));overflow:hidden;background:#fff}
    .w{position:absolute;inset:0}
    .base{position:relative;height:calc(14*var(--u));margin-inline:calc(-26*var(--u));border-radius:0 0 calc(18*var(--u)) calc(18*var(--u));background:linear-gradient(#d7dce3,#aeb6c1);box-shadow:0 calc(18*var(--u)) calc(30*var(--u)) calc(-14*var(--u)) rgb(20 33 61/.5)}
    .base span{position:absolute;left:50%;top:0;width:calc(90*var(--u));height:calc(6*var(--u));transform:translateX(-50%);border-radius:0 0 calc(8*var(--u)) calc(8*var(--u));background:#9aa3af}
    .phone{position:absolute;inset:calc(120*var(--u)) 0 auto auto;width:calc(214*var(--u));transform:translateZ(60px)}
    .ph{display:flex;flex-direction:column;height:calc(396*var(--u));padding:calc(7*var(--u));border-radius:calc(38*var(--u));background:#14213d;box-shadow:0 calc(34*var(--u)) calc(54*var(--u)) calc(-24*var(--u)) rgb(20 33 61/.6)}
    .ph>*{background:#fcfdfe}
    .ph header{display:flex;align-items:center;justify-content:space-between;padding:calc(18*var(--u)) calc(14*var(--u)) calc(6*var(--u));border-radius:calc(32*var(--u)) calc(32*var(--u)) 0 0}
    .ph header img{width:calc(40*var(--u));height:calc(40*var(--u));object-fit:contain}
    .plus{display:grid;place-items:center;width:calc(28*var(--u));height:calc(28*var(--u));border-radius:50%;background:#14213d;color:#fff;font-size:calc(15*var(--u))}
    .rows{flex:1;min-height:0;overflow:hidden}
    .tabs{display:flex;justify-content:space-around;padding:calc(7*var(--u)) calc(2*var(--u)) calc(10*var(--u));border-top:1px solid #e4e9ef;border-radius:0 0 calc(32*var(--u)) calc(32*var(--u));color:#5b687a}
    .tabs span{display:grid;justify-items:center;gap:calc(2*var(--u));font-size:calc(7.2*var(--u));font-weight:600;letter-spacing:-.01em}.tabs lk-icon{font-size:calc(15*var(--u))}.tabs .on{color:#4d7a2c}
  `,
})
export class LkFinalVisualComponent {
  protected readonly tabs = [
    { i: 'chat', l: 'Chats', on: true }, { i: 'phone', l: 'Calls', on: false }, { i: 'video', l: 'Links', on: false },
    { i: 'users', l: 'Workspaces', on: false }, { i: 'activity', l: 'Activity', on: false },
  ];
}
