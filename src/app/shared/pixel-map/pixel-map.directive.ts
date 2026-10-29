import { DOCUMENT, DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';
import { type DotGrid, WORLD_DOT_GRID } from './world-dot-grid';

/** Opacity of each fade step, as a share of the dot colour's own alpha. */
const LEVELS = [0.06, 0.35, 0.68, 1] as const;
const FPS = 24;
const REVEAL_MS = 1400;

/**
 * Draws a dotted map on a <canvas> with each dot fading in and out on its own
 * slow cycle, in stepped levels so it reads as pixels rather than a glow.
 *
 * - The dots appear in random order the first time the map scrolls into view.
 * - The dot colour comes from the canvas's CSS `color` (alpha included), so
 *   themes restyle it in CSS; it is re-read when the theme changes.
 * - Runs at 24 fps only while the map is on screen and the tab is visible.
 *   Under reduced motion it draws the full map once and stays still.
 * - Sized from layout via ResizeObserver, sharp up to 2x device pixels.
 */
@Directive({
  selector: 'canvas[appPixelMap]',
  host: { 'aria-hidden': 'true' },
})
export class PixelMapDirective {
  /** Which dot map to draw; the world map unless another grid is passed. */
  readonly grid = input<DotGrid>(WORLD_DOT_GRID);

  readonly #canvas = inject<ElementRef<HTMLCanvasElement>>(ElementRef).nativeElement;
  readonly #document = inject(DOCUMENT);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const win = this.#document.defaultView;
      const ctx = this.#canvas.getContext('2d');
      if (!win || !ctx) return;

      const grid = this.grid();
      const dots = expand(grid);
      const reduce = win.matchMedia('(prefers-reduced-motion: reduce)');
      let colour = readColour(win, this.#canvas);
      let scale = 1, dpr = 1, size = 1;
      let visible = false, raf = 0, last = 0, revealStart = -1;

      const resize = () => {
        const box = this.#canvas.getBoundingClientRect();
        if (!box.width) return;
        dpr = Math.min(win.devicePixelRatio || 1, 2);
        this.#canvas.width = Math.round(box.width * dpr);
        this.#canvas.height = Math.round(box.height * dpr);
        scale = this.#canvas.width / grid.width;
        // Source dots are about half their pitch; keep at least one device pixel.
        size = Math.max(1, Math.round(grid.pitchX * scale * 0.5));
      };

      const draw = (now: number) => {
        const { width, height } = this.#canvas;
        ctx.clearRect(0, 0, width, height);
        const still = reduce.matches;
        const revealed = still ? 1 : revealStart < 0 ? 0 : (now - revealStart) / REVEAL_MS;
        const t = now / 1000;
        // Bucket dots by fade level so each level is one fillStyle change.
        const buckets: number[][] = [[], [], [], []];
        for (let i = 0; i < dots.count; i++) {
          if (dots.reveal[i] > revealed) continue;
          let level = LEVELS.length - 1;
          if (!still) {
            const wave = 0.5 + 0.5 * Math.sin(t * dots.speed[i] + dots.phase[i]);
            level = Math.min(LEVELS.length - 1, Math.floor((1 - dots.depth[i] * (1 - wave)) * LEVELS.length));
          }
          buckets[level].push(i);
        }
        buckets.forEach((bucket, level) => {
          if (!bucket.length) return;
          ctx.fillStyle = `rgba(${colour.r},${colour.g},${colour.b},${(colour.a * LEVELS[level]).toFixed(3)})`;
          for (const i of bucket) {
            ctx.fillRect(Math.round(dots.x[i] * scale - size / 2), Math.round(dots.y[i] * scale - size / 2), size, size);
          }
        });
      };

      const loop = (now: number) => {
        raf = 0;
        if (!visible || this.#document.hidden || reduce.matches) return;
        if (now - last >= 1000 / FPS) { last = now; draw(now); }
        raf = win.requestAnimationFrame(loop);
      };
      const start = () => {
        if (reduce.matches) { draw(performance.now()); return; }
        if (!raf && visible && !this.#document.hidden) raf = win.requestAnimationFrame(loop);
      };

      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && revealStart < 0) revealStart = performance.now();
        start();
      });
      const ro = new ResizeObserver(() => { resize(); draw(performance.now()); });
      const themeWatch = new MutationObserver(() => { colour = readColour(win, this.#canvas); draw(performance.now()); });
      const onVisibility = () => start();
      const onMotion = () => { draw(performance.now()); start(); };

      resize();
      draw(performance.now());
      io.observe(this.#canvas);
      ro.observe(this.#canvas);
      themeWatch.observe(this.#document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
      this.#document.addEventListener('visibilitychange', onVisibility);
      reduce.addEventListener('change', onMotion);

      destroyRef.onDestroy(() => {
        if (raf) win.cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        themeWatch.disconnect();
        this.#document.removeEventListener('visibilitychange', onVisibility);
        reduce.removeEventListener('change', onMotion);
      });
    });
  }
}

interface Dots {
  readonly count: number;
  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly phase: Float32Array;
  readonly speed: Float32Array;
  readonly depth: Float32Array;
  readonly reveal: Float32Array;
}

/** Unpacks the run-length rows into per-dot positions and seeded random timing. */
function expand(grid: DotGrid): Dots {
  const count = grid.rows.reduce((n, row) => n + row.filter((_, i) => i % 2 === 1).reduce((a, b) => a + b, 0), 0);
  const dots: Dots = {
    count,
    x: new Float32Array(count), y: new Float32Array(count),
    phase: new Float32Array(count), speed: new Float32Array(count),
    depth: new Float32Array(count), reveal: new Float32Array(count),
  };
  const random = seeded(1350599);
  let i = 0;
  grid.rows.forEach((row, r) => {
    for (let k = 0; k < row.length; k += 2) {
      for (let c = row[k]; c < row[k] + row[k + 1]; c++, i++) {
        dots.x[i] = grid.x0 + c * grid.pitchX;
        dots.y[i] = grid.y0 + r * grid.pitchY;
        dots.phase[i] = random() * Math.PI * 2;
        dots.speed[i] = (Math.PI * 2) / (2.5 + random() * 3.5); // one fade cycle every 2.5–6 s
        dots.depth[i] = 0.5 + random() * 0.5; // how far this dot dims at its lowest
        dots.reveal[i] = random();
      }
    }
  });
  return dots;
}

/** Small deterministic PRNG, so the pattern is the same on every visit. */
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function readColour(win: Window, el: Element): { r: number; g: number; b: number; a: number } {
  const [r = 72, g = 121, b = 162, a = 1] = (win.getComputedStyle(el).color.match(/[\d.]+/g) ?? []).map(Number);
  return { r, g, b, a };
}
