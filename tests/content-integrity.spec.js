// @ts-check
import { test, expect } from '@playwright/test';

// Figures the career DB does not accept as confirmed results (2026-10-12),
// plus copy that went stale. Both languages are checked against all copy.
const BANNED = [
  '버그 30%', '개발 속도 20%', '400%', '98%', '50%', '90%', '80~90%', '80–90%',
  '1,400', '50,000', '30%+', '풀스택 1인', '4개월', '3년 10개월', '공공기관 수준',
  '30% fewer', '20% faster', 'sole full-stack', '4 mos', '3y 10m', 'public-sector',
  '86 Provider', '299 테스트', '299 test', '15종+', '15+ shared', '20배', '20×', '98.7'
];
// Substring match on purpose. Confirmed copy (95%, 1,814, 12,384, 379건) was
// checked not to contain any entry above.

// includeImpact / includeProjectData let Task 2 check its own scope before
// Task 3 (impact) and Task 4 (panels) land; the final suite checks everything.
async function collectCopy(page, { includeProjectData, includeImpact = true }) {
  return page.evaluate(({ withProjects, withImpact }) => {
    // translations / projectData are top-level consts in classic (non-module)
    // scripts, so they resolve by name from the page's global scope.
    if (typeof translations === 'undefined') throw new Error('translations not reachable');
    if (withProjects && typeof projectData === 'undefined') throw new Error('projectData not reachable');

    const metas = [...document.querySelectorAll('meta[content]')].map(m => m.getAttribute('content'));
    const body = document.body.cloneNode(true);
    if (!withProjects) {
      body.querySelectorAll('[data-project-panel]').forEach(el => el.remove());
    }
    if (!withImpact) {
      body.querySelectorAll('#impact').forEach(el => el.remove());
    }
    const dict = {};
    Object.entries(translations).forEach(([lang, entries]) => {
      dict[lang] = Object.fromEntries(
        Object.entries(entries).filter(([key]) => withImpact || !key.startsWith('impact.'))
      );
    });
    const parts = [document.title, ...metas, body.textContent || '', JSON.stringify(dict)];
    if (withProjects) {
      parts.push(JSON.stringify(projectData));
    }
    return parts.join('\n');
  }, { withProjects: includeProjectData, withImpact: includeImpact });
}

test.describe('Content integrity against the career DB', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('page copy outside project panels carries no unconfirmed figures', async ({ page }) => {
    // Impact section is rebuilt in Task 3, which flips includeImpact to true.
    const copy = await collectCopy(page, { includeProjectData: false, includeImpact: false });
    const found = BANNED.filter(phrase => copy.includes(phrase));
    expect(found).toEqual([]);
  });

  test('confirmed facts are stated', async ({ page }) => {
    const copy = await collectCopy(page, { includeProjectData: false });
    expect(copy).toContain('2025.12 — 2026.02');
    expect(copy).toContain('3개월');
    expect(copy).toContain('접근성 심사');
    expect(copy).toContain('앱 & 웹 프론트엔드');
  });
});

export { BANNED, collectCopy };
