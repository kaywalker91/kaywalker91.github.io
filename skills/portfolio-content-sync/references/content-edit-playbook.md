# Content Edit Playbook

Use this flow whenever project or experience content changes.

## Project Card Updates

1. Update project card content in `index.html`.
2. Ensure each updated card still has correct `data-project="<id>"`.
3. Update `projectData.<id>` in `js/main.js` for modal content parity.
4. Confirm links, features, challenge, solution, achievements, and tech arrays stay coherent.

## Translation Updates

1. Add or update keys in both `translations.ko` and `translations.en`.
2. Keep key naming under stable prefixes (`projects.*`, `experience.*`, `modal.*`).
3. Avoid adding language-specific keys in only one dictionary.
4. Remove obsolete keys only after confirming no active `data-i18n` reference remains.

## Verification Commands

- `node skills/portfolio-content-sync/scripts/audit_content_sync.mjs --repo <repo-path> --format json --strict`
- `node skills/portfolio-content-sync/scripts/audit_translation_sync.mjs --repo <repo-path> --format json --strict`
- `node skills/portfolio-quality-gate/scripts/run_all.mjs --repo <repo-path> --format json --strict`

## Completion Criteria

- All sync checks return `ok: true`.
- No strict-mode errors remain.
- Manual UI review confirms updated copy appears in both languages.
