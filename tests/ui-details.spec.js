// @ts-check
import { test, expect } from '@playwright/test';

test.describe('UI details', () => {
  test('mobile menu reaches the contact section', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.click('#nav-toggle');
    const contact = page.locator('#nav-menu a.nav__link[href="#contact"]');
    await expect(contact).toBeVisible();
    await contact.click();
    // Whole-word match: the menu's own Tailwind variants spell "[&.active]:…".
    await expect(page.locator('#nav-menu')).not.toHaveClass(/(^|\s)active(\s|$)/);
    await expect(page.locator('#contact')).toBeInViewport();
  });

  test('contact nav item stays out of the desktop bar (CTA covers it)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.locator('#nav-menu a.nav__link[href="#contact"]')).toBeHidden();
  });

  test('logo link meets the 44px touch target', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const box = await page.locator('header a[href="#hero"]').boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  });

  test('centered mobile tagline drops the side rule and italics', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const style = await page.locator('.hero__tagline').evaluate(el => {
      const cs = getComputedStyle(el);
      return { border: cs.borderLeftWidth, font: cs.fontStyle };
    });
    expect(style).toEqual({ border: '0px', font: 'normal' });
  });

  test('desktop tagline keeps the side rule', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const border = await page.locator('.hero__tagline').evaluate(el => getComputedStyle(el).borderLeftWidth);
    expect(border).toBe('2px');
  });

  test('no endlessly looping status indicators', async ({ page }) => {
    await page.goto('/');
    expect(await page.locator('.animate-ping, .animate-pulse').count()).toBe(0);
  });

  test('status badge is visible on mobile too', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('[data-i18n="header.available"]')).toBeVisible();
  });

  test('no unlinked "Verified" claims', async ({ page }) => {
    await page.goto('/');
    expect(await page.locator('.etc-card__verified').count()).toBe(0);
  });

  test('section tags are balanced', async ({ request }) => {
    const html = await (await request.get('/')).text();
    const open = (html.match(/<section\b/g) || []).length;
    const close = (html.match(/<\/section>/g) || []).length;
    expect(close).toBe(open);
  });

  test('desktop section padding is tightened', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const pad = await page.locator('#skills').evaluate(el => parseFloat(getComputedStyle(el).paddingTop));
    expect(pad).toBeLessThanOrEqual(80);
  });
});
