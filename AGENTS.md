# Repository Guidelines

## Project Structure & Module Organization
This is a static portfolio site with all source assets at the repository root.
- `index.html` holds the page structure, content sections, and `data-i18n` hooks.
- `css/` contains styling, split into `reset.css`, `variables.css`, `layout.css`, `components.css`, and `animations.css`.
- `js/` contains behavior modules like `main.js`, `navigation.js`, `theme.js`, `i18n.js`, and `translations.js`.
- `assets/icons/` stores SVG/PNG assets, plus root-level `favicon.svg`, `robots.txt`, and `sitemap.xml`.

## Build, Test, and Development Commands
No build system or package manager is required.
- Local preview: open `index.html` directly, or run `python3 -m http.server 8080` and visit `http://localhost:8080`.
- There are no automated build or test scripts in this repo.

## Coding Style & Naming Conventions
- Use 2-space indentation in HTML, CSS, and JS to match existing files.
- JavaScript uses semicolons and `const`/`let` declarations.
- CSS relies on custom properties in `css/variables.css`; prefer reusing tokens over hard-coded values.
- Class naming is BEM-like (`nav__item`, `header--hidden`). Keep new classes consistent.
- User-facing strings live in `js/translations.js` with keys like `hero.greeting`, referenced via `data-i18n`.

## Testing Guidelines
There is no automated test suite. Validate changes manually:
- Check navigation, theme toggle, language toggle, modals, and scroll-reveal animations.
- Verify layout on mobile and desktop viewports.
- Watch the browser console for errors or missing assets.

## Commit & Pull Request Guidelines
- Commit history mixes Conventional Commit prefixes (`feat:`) and concise Korean/English summaries. Follow that pattern: one-line, present tense; use `feat:`/`fix:` when it adds clarity.
- PRs should include a short description of changes, link issues if applicable, and provide before/after screenshots for UI or content updates. Call out any translation key changes.

## Deployment & SEO Notes
This site is served via GitHub Pages from the repository root. Keep `index.html` at the root level, and update `sitemap.xml`/`robots.txt` if URLs or indexing rules change.
