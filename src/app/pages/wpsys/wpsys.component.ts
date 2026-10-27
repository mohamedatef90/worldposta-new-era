import { SiteFooterComponent } from '@/shared/site-footer/site-footer.component';
import { Component, DestroyRef, ElementRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowRight, faBolt, faChartColumn, faChartLine, faCircleCheck, faCircleQuestion, faCloud, faDiagramProject, faEye, faGear, faHeadset, faLock, faMagnifyingGlass, faServer, faShieldHalved, faUsers } from '@fortawesome/free-solid-svg-icons';
import { SiteHeaderComponent } from '@/shared/site-header/site-header.component';
import { MainNavLinksComponent } from '@/shared/main-nav-links/main-nav-links.component';

@Component({
  imports: [SiteFooterComponent, FaIconComponent, SiteHeaderComponent, MainNavLinksComponent],
  templateUrl: './wpsys.component.html',
  styleUrl: './wpsys.component.css',
})
export class Wpsys {
  protected readonly icons = {
    arrowRight: faArrowRight, server: faServer, shield: faShieldHalved, chart: faChartLine,
    eye: faEye, search: faMagnifyingGlass, bolt: faBolt, headset: faHeadset, users: faUsers,
    cloud: faCloud, gear: faGear, flow: faDiagramProject, portal: faChartColumn, check: faCircleCheck, question: faCircleQuestion, lock: faLock,
  };

  // Approach figure: each tile has a scattered pose (sx, sy, sr) and an ordered slot (ox, oy) around the hub at 280,180.
  protected readonly tiles = [
    { sx: 95, sy: 120, sr: -14, ox: 110, oy: 95 },
    { sx: 170, sy: 72, sr: 10, ox: 215, oy: 60 },
    { sx: 250, sy: 52, sr: -6, ox: 280, oy: 60 },
    { sx: 380, sy: 58, sr: 12, ox: 345, oy: 60 },
    { sx: 470, sy: 100, sr: -10, ox: 450, oy: 95 },
    { sx: 505, sy: 178, sr: 8, ox: 450, oy: 180 },
    { sx: 430, sy: 265, sr: -12, ox: 450, oy: 265 },
    { sx: 360, sy: 305, sr: 6, ox: 345, oy: 300 },
    { sx: 255, sy: 312, sr: -9, ox: 280, oy: 300 },
    { sx: 150, sy: 290, sr: 14, ox: 215, oy: 300 },
    { sx: 68, sy: 215, sr: -7, ox: 110, oy: 265 },
    { sx: 175, sy: 185, sr: 11, ox: 110, oy: 180 },
  ] as const;

  // Approach: the "Without / With WPSYS" switch swaps the list and eases the tiles from scattered (0) to ordered (1).
  protected readonly withWpsys = signal(false);
  private aimFigure: (value: number) => void = () => undefined;
  private readonly compare = {
    before: [
      { title: 'Scattered tools and vendors', text: 'Every system has its own contract and contact.' },
      { title: 'Reactive firefighting', text: 'Problems are found after users complain.' },
      { title: 'Security gaps', text: 'Alerts pile up with no one watching at night.' },
      { title: 'Unclear costs', text: 'Spending grows without a clear plan.' },
    ],
    after: [
      { title: 'One accountable team', text: 'One SLA covers infrastructure, security and support.' },
      { title: 'Proactive monitoring', text: 'Issues are caught and fixed before they spread.' },
      { title: '24/7 protection', text: 'Monitoring, detection and response around the clock.' },
      { title: 'Predictable spending', text: 'A clear plan with reporting you can share.' },
    ],
  };
  protected readonly compareRows = computed(() => (this.withWpsys() ? this.compare.after : this.compare.before));
  protected setWithWpsys(on: boolean): void {
    this.withWpsys.set(on);
    this.aimFigure(on ? 1 : 0);
  }

  // Who we serve: one tab per audience; the panel shows the selected one.
  protected readonly audiences = [
    {
      id: 'providers', tone: 'process-purple', name: 'Service Providers', short: 'Cloud, hosting and technology partners',
      who: 'Cloud providers, hosting companies and technology partners.',
      icon: 'M10 20a8 8 0 0 1-1-16 11 11 0 0 1 21 2 7 7 0 0 1-1 14ZM7 26h26v5H7ZM7 34h26v5H7Z',
      delivers: ['Scalable infrastructure management', 'Reliable and secure environments', 'Expert support and operations'],
      challenges: ['Growing customer load on the same team', 'Uptime promises that depend on a few people', 'Night and weekend incidents'],
      services: [
        { label: 'Managed IT & Infrastructure', href: '/wpsys#wpsys-services' },
        { label: 'Cloud Management', href: '/cloudedge' },
        { label: 'IT Automation', href: '/it-software-automation-tools' },
      ],
    },
    {
      id: 'enterprises', tone: 'process-blue', name: 'Enterprises', short: 'Complex IT and critical workloads',
      who: 'Organizations with complex IT environments and critical workloads.',
      icon: 'M6 37V3h16v34M22 15h12v22M11 9h6m-6 7h6m-6 7h6m-6 7h6M27 21h3m-3 7h3M3 37h34',
      delivers: ['End-to-end IT management', 'Advanced security and monitoring', 'Cloud, on-premise and hybrid support'],
      challenges: ['Mixed cloud and on-premise systems', 'Security alerts with no one to act on them', 'SAP and core systems that cannot stop'],
      services: [
        { label: 'Cybersecurity & SOC', href: '/cloud-based-soc-solutions' },
        { label: 'SAP Basis Operations', href: '/sap-basis-operations' },
        { label: 'Cloud Management', href: '/cloudedge' },
      ],
    },
    {
      id: 'government', tone: 'process-green', name: 'Government', short: 'Secure, controlled operations',
      who: 'Organizations requiring secure, reliable and controlled IT operations.',
      icon: 'M3 12 20 3l17 9ZM5 16h30M8 16v17m8-17v17m8-17v17m8-17v17M4 34h32M2 38h36',
      delivers: ['High security and compliance', 'Reliable and continuous operations', 'Trusted long-term partnership'],
      challenges: ['Strict security and compliance rules', 'Services citizens rely on every day', 'Long procurement and change cycles'],
      services: [
        { label: 'Cybersecurity & SOC', href: '/cloud-based-soc-solutions' },
        { label: 'Managed IT & Infrastructure', href: '/wpsys#wpsys-services' },
        { label: 'WPSYS Portal', href: '/wpsys#wpsys-contact' },
      ],
    },
  ];
  protected readonly audience = signal(0);
  protected readonly activeAudience = computed(() => this.audiences[this.audience()]);
  protected onAudienceKey(event: KeyboardEvent, index: number): void {
    const count = this.audiences.length;
    const moves: Record<string, number> = { ArrowRight: (index + 1) % count, ArrowLeft: (index - 1 + count) % count, Home: 0, End: count - 1 };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    this.audience.set(next);
    const tabs = (event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLElement>('[role="tab"]');
    tabs?.[next]?.focus();
  }

  // Hero: the three outcome cards light up in turn while the hero is on screen.
  protected readonly heroStep = signal(0);

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const hero = host.querySelector('.wx-hero');
      if (!hero) return;
      let timer: ReturnType<typeof setInterval> | undefined;
      const stop = () => { if (timer !== undefined) { clearInterval(timer); timer = undefined; } };
      const io = new IntersectionObserver(([e]) => {
        stop();
        if (e.isIntersecting) timer = setInterval(() => this.heroStep.update(s => (s + 1) % 3), 2600);
      }, { threshold: 0.25 });
      io.observe(hero);
      destroyRef.onDestroy(() => { io.disconnect(); stop(); });
    });

    // Services: dashed links from each service card to the WPSYS core, redrawn on resize.
    afterNextRender(() => {
      const hub = host.querySelector<HTMLElement>('.sv-hub');
      const svg = hub?.querySelector<SVGSVGElement>('.sv-wires');
      const core = hub?.querySelector<HTMLElement>('.sv-core');
      if (!hub || !svg || !core) return;
      const draw = () => {
        if (getComputedStyle(svg).display === 'none') return;
        const H = hub.getBoundingClientRect();
        const C = core.getBoundingClientRect();
        svg.setAttribute('viewBox', `0 0 ${H.width} ${H.height}`);
        const cy = C.top + C.height / 2 - H.top;
        let d = '';
        hub.querySelectorAll<HTMLElement>('.sv-col--l .sv-card').forEach(c => {
          const r = c.getBoundingClientRect();
          const x1 = r.right - H.left, y1 = r.top + r.height / 2 - H.top, x2 = C.left - H.left, m = (x1 + x2) / 2;
          d += `M${x1} ${y1}C${m} ${y1} ${m} ${cy} ${x2} ${cy}`;
        });
        hub.querySelectorAll<HTMLElement>('.sv-col--r .sv-card').forEach(c => {
          const r = c.getBoundingClientRect();
          const x2 = r.left - H.left, y2 = r.top + r.height / 2 - H.top, x1 = C.right - H.left, m = (x1 + x2) / 2;
          d += `M${x1} ${cy}C${m} ${cy} ${m} ${y2} ${x2} ${y2}`;
        });
        svg.innerHTML = `<path d="${d}"/>`;
      };
      const ro = new ResizeObserver(draw);
      ro.observe(hub);
      draw();
      destroyRef.onDestroy(() => ro.disconnect());
    });

    // Approach: ease the figure between scattered and ordered when the switch changes.
    afterNextRender(() => {
      const figure = host.querySelector<HTMLElement>('.cx-figure');
      if (!figure) return;
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      let current = 0;
      let target = 0;
      let frame = 0;
      const tick = () => {
        current += (target - current) * 0.1;
        if (Math.abs(target - current) < 0.002) current = target;
        figure.style.setProperty('--t', current.toFixed(3));
        frame = current === target ? 0 : requestAnimationFrame(tick);
      };
      this.aimFigure = (value: number) => {
        target = value;
        if (reduce) {
          current = value;
          figure.style.setProperty('--t', String(value));
          return;
        }
        if (!frame) frame = requestAnimationFrame(tick);
      };
      this.aimFigure(this.withWpsys() ? 1 : 0);
      destroyRef.onDestroy(() => {
        if (frame) cancelAnimationFrame(frame);
      });
    });
  }

  protected readonly contactStatus = signal('');
  protected submitContact(event: Event): void {
    event.preventDefault();
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.reportValidity()) return;
    const data = new FormData(form);
    const body = ['WPSYS consultation request',
      'Name: ' + String(data.get('fullName') ?? ''),
      'Work email: ' + String(data.get('email') ?? ''),
      'Company: ' + String(data.get('company') ?? ''),
      'Phone: ' + String(data.get('phone') ?? ''),
      'Industry: ' + String(data.get('industry') ?? ''),
      'Service: ' + String(data.get('service') ?? ''),
    ].join('\n');
    window.location.href = 'mailto:hello@worldposta.com?subject=WPSYS%20Consultation%20Request&body=' + encodeURIComponent(body);
    this.contactStatus.set('Your enquiry is ready in your email app. Review and send it to contact our team.');
  }
}

