You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection

## Real product source repos (reference only)

The live WorldPosta products live in sibling repos on this machine. Use them as the source of truth when a marketing page needs a product screen, mockup, UI detail, feature name or terminology: study the real screens and recreate them faithfully here instead of inventing UI.

| Product | Path | Stack / notes |
|---|---|---|
| WorldPosta Meet (video meetings) | `/Users/roaya/Roaya-files/Development/worldposta-meet` | Own CLAUDE.md |
| Posta Link (team chat, desktop & mobile) | `/Users/roaya/Roaya-files/Development/team-ai-2` | Own CLAUDE.md |
| Posta web mail client | `/Users/roaya/Roaya-files/Development/posta` | EWS / IMAP+SMTP / Graph; has DESIGN.md |
| Posta iOS mail app | `/Users/roaya/Roaya-files/Development/WP_Posta` | Native SwiftUI, Exchange ActiveSync |
| Posta Conversations | `/Users/roaya/Roaya-files/Development/posta-conversations-html-mvp` | Static HTML prototype |
| Posta Gate (AI email client / security) | `/Users/roaya/Roaya-files/Development/postagate---ai-powered-email-client` | React + Vite |
| CloudEdge console | `/Users/roaya/Roaya-files/Development/cloudedge` | Angular + Vite |
| WorldPosta IO (CloudEdge Object Storage) | `/Users/roaya/Roaya-files/Development/objstore` | Control plane over Ceph RGW; has DESIGN_SYSTEM.md |
| CloudDrive (Posta Drive) | `/Users/roaya/Roaya-files/Development/clouddrive` | Go backend + React/TS SPA |
| Unified sign-in (user types) | `/Users/roaya/Roaya-files/Development/user-types-of-worldposta-unified-sign-in` | React + Vite |
| WorldPosta Knowledge Base | `/Users/roaya/Roaya-files/Development/knowledge` | Full-stack docs and blog system |

Rules:
- **Read only.** Never edit, commit to, or run installs in these repos from this project. Copy what you learn here, adapted to this site's stack and tokens.
- **Screens over guesses.** Before building a product mockup or describing a feature, check the matching repo; mirror real layouts, labels and flows.
- **No real data.** Sample names, emails and figures in recreated screens stay fictional (see PRODUCT.md, Evidence on Hand); never lift real customer data from these repos.
- **Restyle to this site.** Recreated UI uses this project's design tokens and passes the same AA/axe bar, even where the source product does not.
