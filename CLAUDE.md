# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static portfolio website for a Flutter mobile developer (김대각 / Daegak Kim), deployed via GitHub Pages at https://kaywalker91.github.io. No build system, no package manager — vanilla HTML/CSS/JS served directly from the repository root.

## Development

```bash
# Local preview (no build step required)
python3 -m http.server 8080
# Then visit http://localhost:8080
```

No automated tests exist. Validate changes manually: navigation, theme toggle, language toggle, modals, scroll-reveal animations, and responsive layout across viewports.

## Architecture

### Page Structure

- **`index.html`** — Main portfolio page (~1,400 lines). All content sections, `data-i18n` attribute hooks, and Tailwind CSS CDN config are here.
- **`celebtrip/`** — Portfolio variant emphasizing global service experience (self-contained HTML/CSS/JS).
- **`munto/`** — Company-specific portfolio variant (self-contained HTML/CSS/JS).

Each subdirectory portfolio is independent with its own `index.html`, `css/`, and `js/` — they do NOT share modules with the root site.

### CSS Token System (`css/`)

`variables.css` defines the design token layer (colors, spacing, typography). All other CSS files reference these tokens. Theme switching uses `[data-theme="dark"]` on `<html>` to swap token values. Do not hard-code color or spacing values — always use existing CSS custom properties.

File responsibilities: `reset.css` (normalize), `variables.css` (tokens + theme variants), `layout.css` (grid/container/header), `components.css` (buttons/cards/modals), `animations.css` (keyframes + scroll-reveal).

### JavaScript Modules (`js/`)

- **`main.js`** — App initialization, IntersectionObserver-based scroll reveals, project filtering, modal system, counter animations, lazy loading.
- **`navigation.js`** — Header show/hide on scroll, smooth scroll, active section highlighting.
- **`theme.js`** — Dark/light toggle with `localStorage` persistence and `prefers-color-scheme` detection.
- **`i18n.js`** — Language switching (ko/en) via `data-i18n` attributes, persisted to `localStorage`.
- **`translations.js`** — All user-facing strings keyed like `hero.greeting`, `about.title`.

### Key Patterns

- **i18n**: Content uses `data-i18n="key.path"` attributes. All translatable strings must be added to `translations.js` for both `ko` and `en`.
- **Scroll animations**: Elements with `.reveal` class get `.active` added via IntersectionObserver in `main.js`.
- **Accessibility**: Skip links, ARIA attributes, focus traps in modals, keyboard handlers (Enter/Space/Escape), `prefers-reduced-motion` respected.
- **Performance**: Scroll events throttled at 16ms (60fps), images lazy-loaded via IntersectionObserver, `requestAnimationFrame` for counter animations.

## Conventions

- 2-space indentation in HTML, CSS, and JS.
- Semicolons and `const`/`let` in JavaScript.
- BEM-like CSS class naming (`nav__item`, `header--hidden`).
- Commit style: Conventional Commits (`feat:`, `fix:`, `refactor:`) with Korean or English summaries.
- UI/content PRs should include before/after screenshots and note any translation key changes.

## Deployment

GitHub Pages serves directly from the `main` branch root. Keep `index.html` at root level. Update `sitemap.xml` and `robots.txt` when URLs or indexing rules change.
