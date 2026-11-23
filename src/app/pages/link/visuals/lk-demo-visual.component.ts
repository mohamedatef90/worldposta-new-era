import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { LkChatListComponent } from './lk-chat-list.component';
import { LkIconComponent } from './lk-icon.component';
import { LkWindowComponent } from './lk-window.component';

/** Product demo preview: the Link window playing a "60-sec Product Demo", with the four steps under it. The page puts its Play button on top. */
@Component({
  selector: 'lk-demo-visual',
  imports: [NgOptimizedImage, LkWindowComponent, LkChatListComponent, LkIconComponent],
  template: `
    <div class="stage" role="img" aria-label="Posta Link demo preview with chat sidebar and a video meeting, followed by four steps: Start a conversation, Turn chat into a meeting, Work together, and Stay connected.">
      <lk-window class="w" active="chat">
        <lk-chat-list class="list" />
        <div class="vid">
          <img class="main" ngSrc="/worldposta-assets/posta-link-hero-tile-3.avif" fill alt="" />
          <div class="thumbs"><span class="th"><img ngSrc="/worldposta-assets/posta-link-hero-tile-1.avif" fill alt="" /></span><span class="th"><img ngSrc="/worldposta-assets/posta-link-hero-tile-0.avif" fill alt="" /></span><span class="th"><img ngSrc="/worldposta-assets/posta-link-hero-tile-2.avif" fill alt="" /></span></div>
          <span class="tag">60-sec Product Demo</span>
          <div class="bar"><span class="trk"><i></i></span><div class="tr"><lk-icon name="chevron" /><b>0:00 / 1:00</b><span class="sp"></span><lk-icon name="mic" /><lk-icon name="settings" /><lk-icon name="screen" /></div></div>
        </div>
      </lk-window>
      <ol class="steps" aria-hidden="true">
        @for (s of steps; track s.n) {
          <li [attr.data-t]="s.tone"><span class="n">{{ s.n }}</span><div><p><lk-icon [name]="s.icon" /><b>{{ s.title }}</b></p><small>{{ s.text }}</small></div></li>
        }
      </ol>
    </div>
  `,
  styles: `
    :host{display:block;direction:ltr;container-type:inline-size}
    .stage{--u:calc(100cqw / 960);position:relative;width:100%;aspect-ratio:960/660;font-family:var(--font-body,system-ui,sans-serif);text-align:start}
    .w{position:absolute;inset:0 0 auto 0;height:calc(470*var(--u))}
    .list{width:calc(262*var(--u));flex:none;border-inline-end:1px solid #e4e9ef;padding-top:calc(8*var(--u));overflow:hidden}
    .vid{position:relative;flex:1;min-width:0;margin:calc(14*var(--u));border-radius:calc(16*var(--u));overflow:hidden;background:#1d2734}
    .main{object-fit:cover;object-position:50% 20%}
    .thumbs{position:absolute;inset:calc(14*var(--u)) auto auto calc(14*var(--u));display:grid;gap:calc(8*var(--u));width:calc(76*var(--u))}
    .th{position:relative;display:block;aspect-ratio:3/4;overflow:hidden;border-radius:calc(9*var(--u));border:calc(2*var(--u)) solid rgb(255 255 255/.9)}.th img{object-fit:cover}
    .tag{position:absolute;inset:auto auto calc(70*var(--u)) calc(110*var(--u));padding:calc(7*var(--u)) calc(14*var(--u));border-radius:calc(8*var(--u));background:rgb(15 24 36/.62);color:#fff;font-size:calc(12.5*var(--u));font-weight:600}
    .bar{position:absolute;inset:auto calc(16*var(--u)) calc(12*var(--u)) calc(16*var(--u));color:#fff}
    .trk{display:block;height:calc(3*var(--u));border-radius:9px;background:rgb(255 255 255/.4)}.trk i{display:block;width:6%;height:100%;border-radius:9px;background:#fff}
    .tr{display:flex;align-items:center;gap:calc(14*var(--u));margin-top:calc(10*var(--u));font-size:calc(17*var(--u))}.tr b{font-size:calc(12.5*var(--u));font-weight:600}.sp{flex:1}
    .steps{position:absolute;inset:calc(498*var(--u)) 0 auto 0;margin:0;padding:calc(18*var(--u)) calc(22*var(--u));list-style:none;display:grid;grid-template-columns:repeat(4,1fr);gap:calc(18*var(--u));border-radius:calc(18*var(--u));background:#fff;border:1px solid #e1e8f1;box-shadow:0 calc(14*var(--u)) calc(30*var(--u)) calc(-16*var(--u)) rgb(20 33 61/.28)}
    li{display:flex;gap:calc(12*var(--u));align-items:flex-start;--c:#1668cf;--b:#e6effc}
    li[data-t=purple]{--c:#6d3fd0;--b:#eee8fb}li[data-t=green]{--c:#1f8a49;--b:#e3f4ea}li[data-t=amber]{--c:#a96a00;--b:#fdf1d8}
    .n{display:grid;place-items:center;flex:none;width:calc(40*var(--u));height:calc(40*var(--u));border-radius:50%;background:var(--b);color:var(--c);font-size:calc(17*var(--u));font-weight:800}
    li p{display:flex;align-items:flex-start;gap:calc(7*var(--u));margin:0 0 calc(5*var(--u));font-size:calc(14.5*var(--u));line-height:1.2;color:var(--c)}li p b{color:#14213d;font-weight:700}li p lk-icon{font-size:calc(16*var(--u));margin-top:calc(1*var(--u))}
    li small{display:block;font-size:calc(12.5*var(--u));line-height:1.4;color:#566377}
  `,
})
export class LkDemoVisualComponent {
  protected readonly steps = [
    { n: 1, tone: 'blue', icon: 'chat', title: 'Start a conversation', text: 'Chat with your team instantly.' },
    { n: 2, tone: 'purple', icon: 'video', title: 'Turn chat into a meeting', text: 'Start a video meeting with one click.' },
    { n: 3, tone: 'green', icon: 'file', title: 'Work together', text: 'Share files and collaborate in real time.' },
    { n: 4, tone: 'amber', icon: 'users', title: 'Stay connected', text: 'Keep everything in one workspace.' },
  ];
}
