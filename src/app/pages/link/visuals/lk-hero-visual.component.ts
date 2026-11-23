import { Component } from '@angular/core';
import { LkAvatarComponent } from './lk-avatar.component';
import { LkChipComponent } from './lk-chip.component';
import { LkIconComponent } from './lk-icon.component';
import { LkWindowComponent } from './lk-window.component';

/** Hero: the Link window with team chat arriving beside a four-person meeting. The tiles are live muted loops (see PostaLink.initLiveTiles). */
@Component({
  selector: 'lk-hero-visual',
  imports: [LkWindowComponent, LkChipComponent, LkIconComponent, LkAvatarComponent],
  template: `
    <div class="stage" role="img" aria-label="Posta Link workspace with team chat messages arriving and a four-person video meeting, with Team Chat, Video Meetings and Workspaces features">
      <div class="chips" aria-hidden="true">
        <lk-chip class="c0" icon="chat" tone="blue" title="Team Chat" sub="1-1 & group chat" />
        <lk-chip class="c1" icon="video" tone="purple" title="Video Meetings" sub="Calls, video calls & conferences" />
        <lk-chip class="c2" icon="users" tone="green" title="Workspaces" sub="Organize teams & projects" />
      </div>
      <lk-window class="w" active="chat">
        <section class="chat">
          <header class="ch"><strong>Team Updates</strong><span># general</span></header>
          <div class="msgs">
            <div class="m m1"><lk-avatar face="emma" /><div><p class="n">Emma Collins <time>10:24 AM</time></p><p class="t">The project files are now in Posta Drive. Let's review them in our meeting today.</p>
              <div class="file"><span class="pdf">PDF</span><span><b>Project_Plan.pdf</b><small>Posta Drive</small></span></div></div></div>
            <div class="m m2"><lk-avatar face="james" /><div><p class="n">James Carter <time>10:26 AM</time></p><p class="t">Great! I've added the tasks in the workspace.</p></div></div>
            <div class="m m3"><lk-avatar face="sophie" /><div><p class="n">Sophie Laurent <time>10:30 AM</time></p><p class="t">Here is the design update.</p></div></div>
          </div>
          <div class="typing"><span class="ty ty0">Emma is typing</span><span class="ty ty1">James is typing</span><span class="ty ty2">Lucas is typing</span><span class="ty ty3">Sophie is typing</span><i class="dots"><b></b><b></b><b></b></i></div>
          <div class="composer"><lk-icon name="file" /><span>Type a message…</span><lk-icon class="snd" name="send" /></div>
        </section>
        <section class="meet">
          <div class="grid">
            @for (t of tiles; track t.n) {
              <div class="tile" [class]="'tile tile-' + t.i">
                <video class="lk-hero-tile" muted loop playsinline preload="none" [attr.poster]="'/worldposta-assets/posta-link-hero-tile-' + t.i + '.avif'" aria-hidden="true"><source [attr.src]="'/worldposta-assets/posta-link-hero-tile-' + t.i + '.mp4'" type="video/mp4" /></video>
                <span class="name">{{ t.n }}</span>
              </div>
            }
          </div>
          <div class="ctl"><span class="b"><lk-icon name="mic" /></span><span class="b"><lk-icon name="video" /></span><span class="b"><lk-icon name="screen" /></span><span class="b"><lk-icon name="more" [weight]="3" /></span><span class="b end"><lk-icon name="phone-off" /></span><span class="cnt"><lk-icon name="users" />4</span></div>
        </section>
      </lk-window>
    </div>
  `,
  styles: `
    :host{display:block;direction:ltr;container-type:inline-size}
    .stage{--u:calc(100cqw / 800);position:relative;width:100%;aspect-ratio:800/468;font-family:var(--font-body,system-ui,sans-serif)}
    .chips{position:absolute;inset:0 0 auto 0;z-index:3;display:flex;justify-content:space-between;padding:0 calc(6*var(--u));pointer-events:none}
    .w{position:absolute;inset:calc(50*var(--u)) 0 0 0}
    lk-chip{animation:none}
    /* chat */
    .chat{display:flex;flex-direction:column;width:calc(292*var(--u));flex:none;padding:calc(16*var(--u)) calc(18*var(--u)) calc(14*var(--u));border-inline-end:1px solid #e4e9ef;min-height:0}
    .ch{display:grid;gap:calc(2*var(--u));margin-bottom:calc(12*var(--u))}.ch strong{color:#14213d;font-size:calc(15*var(--u));font-weight:700}.ch span{font-size:calc(11*var(--u));color:#5b687a}
    .msgs{display:flex;flex-direction:column;gap:calc(11*var(--u));flex:1;min-height:0;overflow:hidden}
    .m{display:flex;gap:calc(9*var(--u));--lk-av:calc(28*var(--u))}
    .n{color:#14213d;margin:0 0 calc(2*var(--u));font-size:calc(11*var(--u));font-weight:700}.n time{font-weight:400;color:#5b687a;margin-inline-start:calc(5*var(--u));font-size:calc(9.5*var(--u))}
    .t{margin:0;font-size:calc(11*var(--u));line-height:1.4;color:#33415a}
    .file{display:flex;align-items:center;gap:calc(9*var(--u));margin-top:calc(7*var(--u));padding:calc(7*var(--u)) calc(10*var(--u));border:1px solid #e4e9ef;border-radius:calc(10*var(--u));width:max-content;max-width:100%}
    .pdf{display:grid;place-items:center;width:calc(26*var(--u));height:calc(26*var(--u));border-radius:calc(6*var(--u));background:#d93a46;color:#fff;font-size:calc(7*var(--u));font-weight:800}
    .file b{display:block;font-size:calc(10.5*var(--u))}.file small{display:block;font-size:calc(9*var(--u));color:#5b687a}
    .typing{position:relative;height:calc(16*var(--u));margin:calc(6*var(--u)) 0 calc(8*var(--u));font-size:calc(10*var(--u));color:#5b687a}
    .ty{position:absolute;inset:0 auto auto 0;opacity:0}.ty0{opacity:1}
    .dots{position:absolute;inset-block-start:calc(5*var(--u));inset-inline-start:calc(calc(100*var(--u)) - calc(6*var(--u)));display:inline-flex;gap:calc(2*var(--u))}
    .dots b{width:calc(3*var(--u));height:calc(3*var(--u));border-radius:50%;background:#8b97a8;display:block}
    .composer{display:flex;align-items:center;gap:calc(9*var(--u));height:calc(38*var(--u));padding:0 calc(12*var(--u));border:1px solid #dfe5ec;border-radius:calc(12*var(--u));font-size:calc(11*var(--u));color:#5b687a;flex:none}
    .composer lk-icon{font-size:calc(15*var(--u))}.composer .snd{margin-inline-start:auto;color:#4d7a2c}
    /* meeting */
    .meet{display:flex;flex-direction:column;flex:1;min-width:0;padding:calc(10*var(--u));background:#0f1824;gap:calc(9*var(--u))}
    .grid{flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:calc(8*var(--u))}
    .tile{position:relative;overflow:hidden;border-radius:calc(10*var(--u));background:#1d2734;border:calc(2.5*var(--u)) solid transparent;min-height:0}
    .tile video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
    .name{position:absolute;inset:auto auto calc(7*var(--u)) calc(7*var(--u));padding:calc(3*var(--u)) calc(8*var(--u));border-radius:calc(6*var(--u));background:rgb(15 24 36/.62);color:#fff;font-size:calc(9.5*var(--u));font-weight:600}
    .ctl{display:flex;align-items:center;justify-content:center;gap:calc(8*var(--u));flex:none;height:calc(34*var(--u))}
    .b{display:grid;place-items:center;width:calc(34*var(--u));height:calc(30*var(--u));border-radius:calc(9*var(--u));background:#26323f;color:#e6edf5;font-size:calc(14*var(--u))}
    .b.end{width:calc(44*var(--u));background:#e04b55;color:#fff}
    .cnt{display:inline-flex;align-items:center;gap:calc(5*var(--u));margin-inline-start:calc(6*var(--u));color:#e6edf5;font-size:calc(11*var(--u));font-weight:600}.cnt lk-icon{font-size:calc(14*var(--u))}
    @media(prefers-reduced-motion:no-preference){
      lk-chip{animation:lkF 6s ease-in-out infinite}.c1{animation-delay:-2s}.c2{animation-delay:-4s}
      .m2{animation:lkM2 6.4s cubic-bezier(.32,.72,0,1) infinite}.m3{animation:lkM3 6.4s cubic-bezier(.32,.72,0,1) infinite}
      .tile{animation:lkRing 6.4s step-end infinite}.tile-1{animation-delay:-4.8s}.tile-2{animation-delay:-3.2s}.tile-3{animation-delay:-1.6s}
      .ty{animation:lkRingT 6.4s step-end infinite}.ty0{animation-name:lkRingT}.ty1{animation-delay:-4.8s}.ty2{animation-delay:-3.2s}.ty3{animation-delay:-1.6s}
      .dots b{animation:lkDot 1.2s ease-in-out infinite}.dots b:nth-child(2){animation-delay:.15s}.dots b:nth-child(3){animation-delay:.3s}
    }
    @keyframes lkF{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    @keyframes lkM2{0%,18%{opacity:0;transform:translateY(8px)}28%,92%{opacity:1;transform:none}100%{opacity:0;transform:translateY(8px)}}
    @keyframes lkM3{0%,42%{opacity:0;transform:translateY(8px)}52%,92%{opacity:1;transform:none}100%{opacity:0;transform:translateY(8px)}}
    @keyframes lkRing{0%{border-color:#5fb36b}25%,100%{border-color:transparent}}
    @keyframes lkRingT{0%{opacity:1}25%,100%{opacity:0}}
    @keyframes lkDot{0%,100%{opacity:.35}50%{opacity:1}}
    .tile.tile-0{border-color:#5fb36b}
    @media(prefers-reduced-motion:no-preference){.tile.tile-0{border-color:transparent}}
  `,
})
export class LkHeroVisualComponent {
  protected readonly tiles = [{ i: 0, n: 'Emma Collins' }, { i: 1, n: 'James Carter' }, { i: 2, n: 'Lucas Meyer' }, { i: 3, n: 'Sophie Laurent' }];
}
