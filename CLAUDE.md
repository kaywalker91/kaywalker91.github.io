# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static portfolio website for a Flutter mobile developer (김대각 / Daegak Kim), deployed via GitHub Pages at https://kaywalker91.github.io. No build step — vanilla HTML/CSS/JS served directly from the repository root.

## Development

```bash
# Local preview (no build step required)
python3 -m http.server 8080
# Then visit http://localhost:8080

# End-to-end suite (starts its own server on :8080)
npx playwright test

# Rebuild utility CSS after adding/removing Tailwind classes in index.html or js/
npm run build:css
```

The Playwright suite in `tests/` covers navigation, the project filter, the project accordion, and responsive layout. Run it after any change to `index.html`, `css/`, or `js/` — structural edits break it silently otherwise.

Beyond the Playwright suite, validate manually: navigation, theme toggle, language toggle, the project accordion, scroll-reveal animations, and responsive layout across viewports.

## Architecture

### Page Structure

- **`celebtrip/`** — Portfolio variant emphasizing global service experience (self-contained HTML/CSS/JS).
- **`munto/`** — Company-specific portfolio variant (self-contained HTML/CSS/JS).

Each subdirectory portfolio is independent with its own `index.html`, `css/`, and `js/` — they do NOT share modules with the root site.

### CSS Token System (`css/`)

`variables.css` defines the design token layer (colors, spacing, typography). All other CSS files reference these tokens. Theme switching uses `[data-theme="dark"]` on `<html>` to swap token values. Do not hard-code color or spacing values — always use existing CSS custom properties.

### Key Patterns

- **i18n**: Content uses `data-i18n="key.path"` attributes. All translatable strings must be added to `translations.js` for both `ko` and `en`.
- **Scroll animations**: Elements with `.reveal` class get `.active` added via IntersectionObserver in `main.js`.
- **Project detail**: Each `.project-card` is an accordion — a `.project-card__toggle` button (`aria-expanded` + `aria-controls`) over a `.project-card__panel`. The panel body is rendered from `projectData` in `main.js`, not written in the markup.

## Conventions

- 2-space indentation in HTML, CSS, and JS.
- Semicolons and `const`/`let` in JavaScript.
- BEM-like CSS class naming (`nav__item`, `header--hidden`).
- Commit style: Conventional Commits (`feat:`, `fix:`, `refactor:`) with Korean or English summaries.
- UI/content PRs should include before/after screenshots and note any translation key changes.

## Deployment

GitHub Pages serves directly from the `main` branch root. Keep `index.html` at root level. Update `sitemap.xml` and `robots.txt` when URLs or indexing rules change.

**Asset cache busting**: every `css/` and `js/` reference in `index.html` carries a `?v=YYYYMMDD` query (12 references total, including css/tailwind.css). Bump all of them to the same new value whenever `css/` or `js/` ships — append a letter (`20260805b`) for a second ship on the same day. GitHub Pages serves assets with `max-age=600`, so without this a returning visitor gets new HTML against a cached old script — which half-breaks any change spanning markup and script. The subdirectory portfolios (`celebtrip/`, `munto/`) are self-contained and out of scope for this rule.

**Social share card**: `assets/og-image.png` (1200×630) is the `og:image` / `twitter:image`. It is generated from `assets/og-image.source.html`, which inlines the dark-theme tokens so it renders standalone. Regenerate after editing the source:

```js
// node this from the repo root (Playwright's chromium is already installed)
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.goto('file://' + process.cwd() + '/assets/og-image.source.html');
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(1200);           // webfonts must land before the shot
await p.screenshot({ path: 'assets/og-image.png' });
await b.close();
```

Anything listed in `.gitignore` 404s on the live site, so never point a `<meta>` tag at it.
