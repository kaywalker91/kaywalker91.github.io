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
    const copy = await collectCopy(page, { includeProjectData: false });
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

  test('impact counters count up from 0 and settle on the real value', async ({ page }) => {
    // Off-screen at load, so the counter resets to 0 instead of jumping from
    // the final value back to 0 in view.
    const before = await page.locator('.impact-stat__number').first().textContent();
    expect(before).toBe('0');
    await page.locator('#impact').scrollIntoViewIfNeeded();
    await expect(page.locator('.impact-stat__number').first()).toHaveText('95', { timeout: 5000 });
  });

  test('impact stats: no decorative rings, real values in raw HTML', async ({ page, request }) => {
    expect(await page.locator('.impact-stat__chart-svg').count()).toBe(0);
    const html = await (await request.get('/')).text();
    // Without JS (or before the counter runs) the figure must read correctly.
    expect(html).toContain('data-count="95">95</span>');
    expect(html).toContain('data-count="1814">1,814</span>');
    expect(html).toContain('data-count="12384">12,384</span>');
    await expect(page.locator('.impact-stat')).toHaveCount(4);
  });

  test('project panels carry no unconfirmed figures in either language', async ({ page }) => {
    const copy = await collectCopy(page, { includeProjectData: true });
    const found = BANNED.filter(phrase => copy.includes(phrase));
    expect(found).toEqual([]);
  });

  test('panels lead with role and the problem, MindLog links to Google Play', async ({ page }) => {
    const order = await page.evaluate(() => {
      const panel = document.querySelector('[data-project-panel="pllilab"]');
      return [...panel.querySelectorAll('.project-panel__label')].map(l => l.dataset.i18n);
    });
    expect(order.slice(0, 3)).toEqual(['projects.panel.role', 'projects.panel.challenge', 'projects.panel.solution']);
    await expect(page.locator('[data-project-panel="mindlog"] a[href="https://play.google.com/store/apps/details?id=com.mindlog.mindlog"]')).toHaveCount(1);
    await expect(page.locator('.project-card[data-project="cryptonative"] .project-card__status')).toHaveText('Archive');
  });
});

export { BANNED, collectCopy };
