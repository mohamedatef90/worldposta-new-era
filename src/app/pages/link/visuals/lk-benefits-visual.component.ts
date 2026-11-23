import { NgOptimizedImage } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { LkIconComponent } from './lk-icon.component';

interface Benefit { icon: string; tone: string; title: string; text: string; x: number; y: number; w: number; path: string; dot: [number, number] }

/** Benefits: the Link hub with six benefit cards around it; the active card lights its dotted connector and puts its icon on the hub. */
@Component({
  selector: 'lk-benefits-visual',
  imports: [NgOptimizedImage, LkIconComponent],
  template: `
    <div class="stage lk-spotlight" role="img" aria-label="Posta Link app hub surrounded by Faster Communication, Higher Team Productivity, Easy File Access, Seamless Meetings, Better Organization and Secure and Reliable benefit cards, connected with colored dotted lines.">
      <svg class="paths" viewBox="0 0 800 580" aria-hidden="true" focusable="false">
        @for (b of items; track b.title; let i = $index) {
          <path [attr.d]="b.path" [attr.stroke]="'var(--c' + i + ')'" [class.on]="step() === i" />
          <circle [attr.cx]="b.dot[0]" [attr.cy]="b.dot[1]" r="4.5" [attr.fill]="'var(--c' + i + ')'" [class.on]="step() === i" />
        }
      </svg>
      <div class="hub" aria-hidden="true">
        <span class="halo"></span>
        <div class="hubwin"><i></i><i></i><i></i>
          <img ngSrc="/worldposta-assets/link-ui/link-logo.webp" width="320" height="320" alt="" />
        </div>
        @for (b of items; track b.title; let i = $index) {
          <span class="badge" [class.on]="step() === i" [style.--t]="'var(--c' + i + ')'" [style.--b]="'var(--b' + i + ')'"><lk-icon [name]="b.icon" /></span>
        }
      </div>
      @for (b of items; track b.title; let i = $index) {
        <div class="card" aria-hidden="true" [class.on]="step() === i" [style.left.%]="b.x / 8" [style.top.%]="b.y / 5.8" [style.width.%]="b.w / 8" (mouseenter)="pick.emit(i)">
          <span class="ic" [style.--t]="'var(--c' + i + ')'" [style.--b]="'var(--b' + i + ')'"><lk-icon [name]="b.icon" /></span>
          <span class="tx"><strong>{{ b.title }}</strong><small>{{ b.text }}</small></span>
        </div>
      }
    </div>
  `,
  styles: `
    :host{display:block;direction:ltr;container-type:inline-size;--c0:#1668cf;--b0:#e6effc;--c1:#1f8a49;--b1:#e3f4ea;--c2:#b97800;--b2:#fdf1d8;--c3:#6d3fd0;--b3:#eee8fb;--c4:#c42e6f;--b4:#fbe3ee;--c5:#127f7f;--b5:#dff3f2}
    .stage{--u:calc(100cqw / 800);position:relative;width:100%;aspect-ratio:800/580;font-family:var(--font-body,system-ui,sans-serif)}
    .paths{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}
    .paths path{fill:none;stroke-width:2;stroke-dasharray:3 6;stroke-linecap:round;opacity:.35;transition:opacity .3s,stroke-width .3s}
    .paths path.on{opacity:1;stroke-width:2.8}
    .paths circle{opacity:.4;transition:opacity .3s}.paths circle.on{opacity:1}
    .hub{position:absolute;left:calc(305*var(--u));top:calc(195*var(--u));width:calc(190*var(--u));height:calc(190*var(--u))}
    .halo{position:absolute;inset:calc(-34*var(--u));border-radius:50%;background:radial-gradient(closest-side,rgb(22 104 207/.14),transparent)}
    .hubwin{position:absolute;inset:calc(10*var(--u)) 0;display:grid;place-items:center;border-radius:calc(22*var(--u));background:#fff;border:1px solid #dfe5f2;box-shadow:0 calc(24*var(--u)) calc(44*var(--u)) calc(-18*var(--u)) rgb(20 33 61/.3)}
    .hubwin i{position:absolute;top:calc(13*var(--u));width:calc(9*var(--u));height:calc(9*var(--u));border-radius:50%}
    .hubwin i:nth-of-type(1){left:calc(14*var(--u));background:#ee9a92}.hubwin i:nth-of-type(2){left:calc(29*var(--u));background:#f1c670}.hubwin i:nth-of-type(3){left:calc(44*var(--u));background:#a3d17e}
    .hubwin img{width:calc(104*var(--u));height:calc(104*var(--u));object-fit:contain;margin-top:calc(8*var(--u))}
    .badge{position:absolute;right:calc(-14*var(--u));bottom:calc(8*var(--u));display:grid;place-items:center;width:calc(48*var(--u));height:calc(48*var(--u));border-radius:50%;font-size:calc(24*var(--u));color:var(--t);background:var(--b);border:calc(3*var(--u)) solid #fff;box-shadow:0 calc(8*var(--u)) calc(16*var(--u)) calc(-6*var(--u)) rgb(20 33 61/.3);opacity:0;transform:scale(.8);transition:opacity .35s,transform .45s cubic-bezier(.32,.72,0,1)}
    .badge.on{opacity:1;transform:none}
    .card{position:absolute;display:flex;gap:calc(14*var(--u));align-items:flex-start;padding:calc(20*var(--u)) calc(18*var(--u));border-radius:calc(22*var(--u));background:#fff;border:1px solid #e1e8f1;box-shadow:0 calc(14*var(--u)) calc(30*var(--u)) calc(-16*var(--u)) rgb(20 33 61/.25);color:#14213d;text-align:start;opacity:.72;transition:opacity .35s,transform .5s cubic-bezier(.32,.72,0,1),box-shadow .35s;cursor:default}
    .card.on{opacity:1;transform:translateY(-1.2%);box-shadow:0 calc(22*var(--u)) calc(34*var(--u)) calc(-14*var(--u)) rgb(20 33 61/.3)}
    .ic{display:grid;place-items:center;flex:none;width:calc(44*var(--u));height:calc(44*var(--u));border-radius:calc(13*var(--u));font-size:calc(24*var(--u));color:var(--t);background:var(--b)}
    .tx{display:grid;gap:calc(5*var(--u))}
    strong{font-size:calc(16*var(--u));line-height:1.2;font-weight:700;letter-spacing:-.01em}
    small{font-size:calc(12.5*var(--u));line-height:1.4;color:#566377}
    @media(prefers-reduced-motion:no-preference){.paths path.on{animation:lkFlow 1s linear infinite}}
    @media(prefers-reduced-motion:reduce){.card{opacity:1}}
    @keyframes lkFlow{to{stroke-dashoffset:-9}}
  `,
})
export class LkBenefitsVisualComponent {
  readonly step = input(0);
  readonly pick = output<number>();
  protected readonly items: Benefit[] = [
    { icon: 'chat', tone: 'blue', title: 'Faster Communication', text: 'Keep conversations, files and decisions in one place.', x: 0, y: 8, w: 270, path: 'M270 80 C 330 80, 335 190, 362 238', dot: [270, 80] },
    { icon: 'users', tone: 'green', title: 'Higher Team Productivity', text: 'Turn ideas into action with tasks, deadlines and real-time collaboration.', x: 530, y: 8, w: 270, path: 'M530 80 C 470 80, 465 190, 438 238', dot: [530, 80] },
    { icon: 'folder', tone: 'amber', title: 'Easy File Access', text: 'Store, share and edit files together — no more version confusion.', x: 0, y: 232, w: 270, path: 'M270 300 L 305 300', dot: [270, 300] },
    { icon: 'video', tone: 'purple', title: 'Seamless Meetings', text: 'Start instant video calls and bring your team together, anytime.', x: 530, y: 232, w: 270, path: 'M530 300 L 495 300', dot: [530, 300] },
    { icon: 'calendar', tone: 'pink', title: 'Better Organization', text: 'Schedule meetings, manage tasks and keep your team aligned.', x: 0, y: 440, w: 270, path: 'M270 510 C 330 510, 335 400, 362 352', dot: [270, 510] },
    { icon: 'shield', tone: 'teal', title: 'Secure & Reliable', text: 'Your data and conversations are protected with enterprise-grade security.', x: 530, y: 440, w: 270, path: 'M530 510 C 470 510, 465 400, 438 352', dot: [530, 510] },
  ];
}
