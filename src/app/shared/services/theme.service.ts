import { DOCUMENT, Service, computed, effect, inject, signal } from '@angular/core';

export type ThemeMode = 'dark' | 'light';

/**
 * Key shared with the no-flash bootstrap script in `src/index.html`.
 * Keep both in sync — the script resolves the initial theme before first paint,
 * this service owns every change after that.
 */
export const THEME_STORAGE_KEY = 'worldposta-theme';

/** The design system is dark-first (see `design-system/unidesign-system.md` §3). */
const DEFAULT_MODE: ThemeMode = 'dark';

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'dark' || value === 'light';
}

/**
 * Single source of truth for the active theme.
 *
 * Writes `data-theme` on `<html>`, which drives both layers at once:
 * the design-system CSS variables (`design-system/design-system.css`) and
 * Tailwind's `dark:` variant (remapped in `src/styles.css`).
 */
@Service()
export class ThemeService {
  readonly #document = inject(DOCUMENT);
  readonly #mode = signal<ThemeMode>(this.#resolveInitialMode());

  /** Currently applied theme. */
  readonly mode = this.#mode.asReadonly();
  readonly isDark = computed(() => this.#mode() === 'dark');

  constructor() {
    effect(() => this.#apply(this.#mode()));
  }

  set(mode: ThemeMode): void {
    this.#mode.set(mode);
  }

  toggle(): void {
    this.#mode.update((mode) => (mode === 'dark' ? 'light' : 'dark'));
  }

  #apply(mode: ThemeMode): void {
    this.#document.documentElement.dataset['theme'] = mode;

    try {
      this.#document.defaultView?.localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Storage can be unavailable (private mode, blocked cookies). The theme
      // still applies for this session; it just won't be remembered.
    }
  }

  #resolveInitialMode(): ThemeMode {
    const view = this.#document.defaultView;

    // The bootstrap script already resolved this before paint — trust it so the
    // rendered theme and the signal can never disagree.
    const applied = this.#document.documentElement.getAttribute('data-theme');
    if (isThemeMode(applied)) {
      return applied;
    }

    try {
      const stored = view?.localStorage.getItem(THEME_STORAGE_KEY) ?? null;
      if (isThemeMode(stored)) {
        return stored;
      }
    } catch {
      // Ignore and fall through to the OS preference.
    }

    return view?.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : DEFAULT_MODE;
  }
}
