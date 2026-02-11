---
name: portfolio-quality-gate
description: Run static quality checks for this GitHub Pages portfolio and detect regressions in i18n coverage, SEO and sitemap integrity, and required UI accessibility contracts after changes to index.html, css/, js/, sitemap.xml, or robots.txt.
---

# Portfolio Quality Gate

Use this skill to run deterministic static checks before finalizing portfolio changes.

## Run Sequence

1. Run `node skills/portfolio-quality-gate/scripts/run_all.mjs --repo <repo-path> --format json --strict`.
2. Inspect `errors` first and fix all blocking issues.
3. Review `warnings` and decide whether cleanup is required now or can be deferred.
4. Re-run until `ok: true`.
5. Perform manual UI smoke checks from `references/manual-smoke-checklist.md`.

## Single-Check Commands

- i18n check: `node skills/portfolio-quality-gate/scripts/check_i18n.mjs --repo <repo-path> --format json --strict`
- SEO and sitemap check: `node skills/portfolio-quality-gate/scripts/check_seo_and_sitemap.mjs --repo <repo-path> --format json --strict`
- UI contract check: `node skills/portfolio-quality-gate/scripts/check_ui_contracts.mjs --repo <repo-path> --format json --strict`

## Output Contract

All scripts return:

`{ ok: boolean, errors: Array<{ code: string, file: string, message: string }>, warnings: Array<{ code: string, file: string, message: string }>, stats: object }`

When `--strict` is passed, return exit code `1` if `errors.length > 0`, otherwise `0`.
