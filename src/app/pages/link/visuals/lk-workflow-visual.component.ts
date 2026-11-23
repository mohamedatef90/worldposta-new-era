import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { LkAvatarComponent } from './lk-avatar.component';
import { LkIconComponent } from './lk-icon.component';
import { LkWindowComponent } from './lk-window.component';

/** How it works: four step cards with arrows between them (chat, meeting, files, tasks). Wide strip: the page scrolls it sideways on phones. */
@Component({
  selector: 'lk-workflow-visual',
  imports: [NgOptimizedImage, LkWindowComponent, LkIconComponent, LkAvatarComponent],
  template: `
    <div class="stage" role="img" aria-label="Four steps: Team Chat and Channels for direct and group conversations; Video Meetings for team collaboration; Files and Collaboration to share and edit files together; Tasks and Action Points to turn conversations into tasks, set due dates and keep everyone aligned.">
      <!-- 1 chat -->
      <article class="card s1" aria-hidden="true">
        <header><span class="num">1</span><div><h3>Team Chat &amp; Channels</h3><p>Chat 1:1 or in groups, organize by topics, projects or departments.</p></div></header>
        <div class="shot"><lk-window active="workspaces" sidebar="icons" [search]="false">
          <div class="pane"><h4>Channels</h4>
            @for (c of channels; track c) { <div class="row" [class.on]="c === 'Marketing'"><lk-icon name="hash" /><span>{{ c }}</span></div> }
          </div>
          <div class="pop"><div class="pm"><lk-avatar face="sophie" /><div><p><b>Monica</b> <time>10:24 AM</time></p><p>Here's the latest campaign design.</p><div class="file"><span class="pdf">PDF</span><span><b>Campaign_Design.pdf</b><small>2.4 MB</small></span></div></div></div>
            <div class="pm"><lk-avatar face="james" /><div><p><b>George</b> <time>10:28 AM</time></p><p>Looks great! Let's discuss it in our next meeting.</p></div></div></div>
        </lk-window></div>
      </article>
      <span class="arw a1" aria-hidden="true"><lk-icon name="arrow" [weight]="2.4" /></span>
      <!-- 2 meeting -->
      <article class="card s2" aria-hidden="true">
        <header><span class="num">2</span><div><h3>Video Meetings</h3><p>Start instant meetings, invite unlimited users and collaborate in real time.</p></div></header>
        <div class="call"><div class="g"><span class="gi"><img ngSrc="/worldposta-assets/posta-link-hero-tile-0.avif" fill alt="" /></span><span class="gi"><img ngSrc="/worldposta-assets/posta-link-hero-tile-1.avif" fill alt="" /></span><span class="gi"><img ngSrc="/worldposta-assets/posta-link-hero-tile-2.avif" fill alt="" /></span><span class="gi"><img ngSrc="/worldposta-assets/posta-link-hero-tile-3.avif" fill alt="" /></span></div>
          <div class="ctl"><span class="b"><lk-icon name="mic" /></span><span class="b"><lk-icon name="video" /></span><span class="b"><lk-icon name="screen" /></span><span class="b"><lk-icon name="more" [weight]="3" /></span><span class="b end">Leave</span></div></div>
        <div class="note"><span class="ic" style="--t:#1f8a49;--b:#e3f4ea"><lk-icon name="users" /></span><div><b>Unlimited Meeting Users</b><small>No time limits. No meeting limits.</small></div></div>
      </article>
      <span class="arw a2" aria-hidden="true"><lk-icon name="arrow" [weight]="2.4" /></span>
      <!-- 3 files -->
      <article class="card s3" aria-hidden="true">
        <header><span class="num">3</span><div><h3>Files &amp; Collaboration</h3><p>Share, edit and work on files together — all in one place.</p></div></header>
        <div class="shot"><lk-window active="files" sidebar="icons" [search]="false">
          <div class="pane"><div class="ph"><h4>Files</h4><span class="btn">+ New</span></div><p class="tabs"><b>All files</b><span>Shared with me</span><span>Recent</span></p>
            @for (f of files; track f.n) { <div class="frow"><span class="ft" [style.background]="f.c">{{ f.t }}</span><span class="fn"><b>{{ f.n }}</b><small>{{ f.s }}</small></span><time>{{ f.w }}</time></div> }
          </div>
        </lk-window></div>
        <div class="note"><span class="ic" style="--t:#6d3fd0;--b:#eee8fb"><lk-icon name="link" /></span><div><b>Work Together in Real Time</b><small>Edit, comment and keep everything in sync.</small></div></div>
      </article>
      <span class="arw a3" aria-hidden="true"><lk-icon name="arrow" [weight]="2.4" /></span>
      <!-- 4 tasks -->
      <article class="card s4" aria-hidden="true">
        <header><span class="num">4</span><div><h3>Tasks &amp; Action Points</h3><p>Turn conversations into tasks, set due dates and keep everyone aligned.</p></div></header>
        <div class="shot"><lk-window active="workspaces" sidebar="icons" [search]="false">
          <div class="pane"><div class="ph"><h4>Tasks</h4><span class="btn">+ New task</span></div><p class="tabs"><b>All</b><span>My tasks</span><span>Assigned</span><span>Completed</span></p>
            @for (t of tasks; track t.n) { <div class="trow"><span class="cb" [class.done]="t.done"></span><span class="tn">{{ t.n }}</span><lk-avatar [face]="t.f" /><time>{{ t.d }}</time></div> }
          </div>
        </lk-window></div>
        <div class="note"><span class="ic" style="--t:#1f8a49;--b:#e3f4ea"><lk-icon name="check" [weight]="2.6" /></span><div><b>Stay Organized</b><small>Create, assign and track tasks from chat or meetings.</small></div></div>
      </article>
    </div>
  `,
  styles: `
    :host{display:block;direction:ltr;container-type:inline-size}
    .stage{--u:calc(100cqw / 1536);position:relative;display:grid;grid-template-columns:repeat(4,1fr);width:100%;aspect-ratio:1536/560;column-gap:calc(72*var(--u));font-family:var(--font-body,system-ui,sans-serif);color:#14213d;text-align:start}
    .card{position:relative;display:flex;flex-direction:column;gap:calc(14*var(--u));padding:calc(22*var(--u)) calc(22*var(--u)) calc(18*var(--u));border-radius:calc(28*var(--u));border:1px solid #e0e8f2;box-shadow:0 calc(24*var(--u)) calc(44*var(--u)) calc(-24*var(--u)) rgb(20 33 61/.28);min-height:0;overflow:hidden}
    .s1{background:linear-gradient(160deg,#f4f8ff,#fff 60%);--n:#1668cf}.s2{background:linear-gradient(160deg,#f1faf4,#fff 60%);--n:#1f8a49}.s3{background:linear-gradient(160deg,#f6f2ff,#fff 60%);--n:#6d3fd0}.s4{background:linear-gradient(160deg,#fff8ec,#fff 60%);--n:#d98200}
    header{display:flex;gap:calc(14*var(--u));align-items:flex-start;flex:none}
    .num{display:grid;place-items:center;flex:none;width:calc(46*var(--u));height:calc(46*var(--u));border-radius:50%;background:var(--n);color:#fff;font-size:calc(22*var(--u));font-weight:800}
    h3{margin:0 0 calc(5*var(--u));font-size:calc(21*var(--u));line-height:1.15;font-weight:700;color:#14213d;letter-spacing:-.01em}
    header p{margin:0;font-size:calc(13.5*var(--u));line-height:1.4;color:#4e5b6e}
    .shot{flex:1;min-height:0;display:block}
    .shot lk-window{height:100%}
    .arw{position:absolute;top:calc(250*var(--u));display:grid;place-items:center;width:calc(46*var(--u));height:calc(46*var(--u));border-radius:50%;background:#fff;border:1px solid #dfe8f2;color:#4d7a2c;font-size:calc(20*var(--u));box-shadow:0 calc(8*var(--u)) calc(18*var(--u)) calc(-8*var(--u)) rgb(20 33 61/.3);z-index:2}
        .a1{left:calc(343*var(--u))}.a2{left:calc(745*var(--u))}.a3{left:calc(1147*var(--u))}
    .pane{flex:1;min-width:0;padding:calc(14*var(--u)) calc(14*var(--u)) 0;position:relative}
    h4{margin:0 0 calc(10*var(--u));font-size:calc(15*var(--u));font-weight:700;color:#14213d}
    .row{display:flex;align-items:center;gap:calc(9*var(--u));height:calc(27*var(--u));padding:0 calc(9*var(--u));border-radius:calc(8*var(--u));font-size:calc(12*var(--u));color:#566377}
    .row lk-icon{font-size:calc(13*var(--u))}.row.on{background:#f0f7ea;color:#4d7a2c;font-weight:700}
    .pop{position:absolute;inset:auto calc(8*var(--u)) calc(8*var(--u)) calc(8*var(--u));padding:calc(12*var(--u));border-radius:calc(14*var(--u));background:#fff;border:1px solid #e1e8f1;box-shadow:0 calc(14*var(--u)) calc(28*var(--u)) calc(-12*var(--u)) rgb(20 33 61/.3);display:grid;gap:calc(10*var(--u))}
    .pm{display:flex;gap:calc(9*var(--u));--lk-av:calc(30*var(--u))}.pm p{margin:0;font-size:calc(11.5*var(--u));line-height:1.4;color:#33415a}.pm p b{color:#14213d}.pm time{font-size:calc(9.5*var(--u));color:#5b687a;margin-inline-start:calc(4*var(--u))}
    .file{display:flex;align-items:center;gap:calc(8*var(--u));margin-top:calc(6*var(--u));padding:calc(6*var(--u)) calc(9*var(--u));border:1px solid #e4e9ef;border-radius:calc(9*var(--u));width:max-content}
    .pdf{display:grid;place-items:center;width:calc(24*var(--u));height:calc(24*var(--u));border-radius:calc(6*var(--u));background:#d93a46;color:#fff;font-size:calc(7*var(--u));font-weight:800}
    .file b{display:block;font-size:calc(10.5*var(--u));color:#14213d}.file small{display:block;font-size:calc(9*var(--u));color:#5b687a}
    .call{flex:1;min-height:0;display:flex;flex-direction:column;padding:calc(10*var(--u));border-radius:calc(18*var(--u));background:#0f1824}
    .g{flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:1fr;gap:calc(7*var(--u))}.gi{position:relative;display:block;overflow:hidden;border-radius:calc(9*var(--u))}.gi img{object-fit:cover}
    .ctl{display:flex;justify-content:center;gap:calc(7*var(--u));padding-top:calc(10*var(--u))}
    .b{display:grid;place-items:center;width:calc(36*var(--u));height:calc(28*var(--u));border-radius:calc(9*var(--u));background:#26323f;color:#e6edf5;font-size:calc(13*var(--u))}.b.end{width:auto;padding:0 calc(14*var(--u));background:#e04b55;color:#fff;font-size:calc(11*var(--u));font-weight:700}
    .note{display:flex;align-items:center;gap:calc(12*var(--u));flex:none;padding:calc(11*var(--u)) calc(14*var(--u));border-radius:calc(14*var(--u));background:#fff;border:1px solid #e4e9f0}
    .note b{display:block;font-size:calc(13.5*var(--u));color:#14213d}.note small{display:block;margin-top:calc(2*var(--u));font-size:calc(11.5*var(--u));color:#566377;line-height:1.35}
    .ic{display:grid;place-items:center;flex:none;width:calc(38*var(--u));height:calc(38*var(--u));border-radius:calc(11*var(--u));font-size:calc(20*var(--u));color:var(--t);background:var(--b)}
    .ph{display:flex;align-items:center;justify-content:space-between;margin-bottom:calc(4*var(--u))}.ph h4{margin:0}
    .btn{padding:calc(5*var(--u)) calc(11*var(--u));border-radius:calc(7*var(--u));background:#4d7a2c;color:#fff;font-size:calc(10.5*var(--u));font-weight:700}
    .tabs{display:flex;gap:calc(12*var(--u));margin:0 0 calc(6*var(--u));font-size:calc(10*var(--u));color:#5b687a}.tabs b{color:#4d7a2c}
    .frow{display:flex;align-items:center;gap:calc(10*var(--u));padding:calc(8*var(--u)) 0;border-bottom:1px solid #eef1f5}
    .ft{display:grid;place-items:center;width:calc(24*var(--u));height:calc(24*var(--u));border-radius:calc(5*var(--u));color:#fff;font-size:calc(7.5*var(--u));font-weight:800;flex:none}
    .fn{flex:1;min-width:0;display:grid}.fn b{font-size:calc(11*var(--u));color:#14213d;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fn small{font-size:calc(9*var(--u));color:#5b687a}
    .frow time,.trow time{font-size:calc(9.5*var(--u));color:#5b687a;white-space:nowrap}
    .trow{display:flex;align-items:center;gap:calc(9*var(--u));padding:calc(8*var(--u)) 0;border-bottom:1px solid #eef1f5;--lk-av:calc(24*var(--u))}
    .cb{width:calc(15*var(--u));height:calc(15*var(--u));border-radius:calc(4*var(--u));border:1.5px solid #aab4c2;flex:none}.cb.done{background:#4d7a2c;border-color:#4d7a2c}
    .tn{flex:1;min-width:0;font-size:calc(11*var(--u));color:#14213d;line-height:1.3}
  `,
})
export class LkWorkflowVisualComponent {
  protected readonly channels = ['General', 'Marketing', 'Product', 'Sales', 'Operations', 'Engineering'];
  protected readonly files = [
    { n: 'Sales_Report.xlsx', s: 'Shared · Sales', w: 'Just now', t: 'XLS', c: '#1f8a49' },
    { n: 'Marketing_Plan.pptx', s: 'Shared · Marketing', w: '2h ago', t: 'PPT', c: '#d9532b' },
    { n: 'Product_Overview.docx', s: 'Shared · Product', w: '1 day ago', t: 'DOC', c: '#2b6cd9' },
    { n: 'Brand_Guidelines.pdf', s: 'Shared · Design', w: '2 days ago', t: 'PDF', c: '#d93a46' },
  ];
  protected readonly tasks: { n: string; d: string; f: 'emma' | 'james' | 'sophie' | 'lucas'; done: boolean }[] = [
    { n: 'Prepare campaign deck', d: 'Oct 10', f: 'sophie', done: true },
    { n: 'Review design assets', d: 'Oct 12', f: 'james', done: false },
    { n: 'Finalize launch plan', d: 'Oct 15', f: 'emma', done: false },
    { n: 'Team feedback session', d: 'Oct 16', f: 'lucas', done: false },
  ];
}
