---
name: portfolio-content-sync
description: Audit cross-file content synchronization for this portfolio by validating data-project to projectData alignment and translation consistency for projects.*, experience.*, and modal.* keys across index.html, js/main.js, and js/translations.js.
---

# Portfolio Content Sync

Use this skill when content updates touch project cards, experience sections, or translation dictionaries.

## Run Sequence

1. Run `node skills/portfolio-content-sync/scripts/audit_content_sync.mjs --repo <repo-path> --format json --strict`.
2. Run `node skills/portfolio-content-sync/scripts/audit_translation_sync.mjs --repo <repo-path> --format json --strict`.
3. Fix all `errors`, then review `warnings`.
4. Re-run both checks until they return `ok: true`.
5. Apply manual update flow from `references/content-edit-playbook.md`.

## Output Contract

All scripts return:

`{ ok: boolean, errors: Array<{ code: string, file: string, message: string }>, warnings: Array<{ code: string, file: string, message: string }>, stats: object }`

When `--strict` is passed, return exit code `1` if `errors.length > 0`, otherwise `0`.
