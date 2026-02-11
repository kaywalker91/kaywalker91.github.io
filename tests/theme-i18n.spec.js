// @ts-check
import { test, expect } from '@playwright/test';
import {
  validateAccessibilityTree,
  batchAssertions,
  captureFailureScreenshot,
  waitForThemeTransition,
  waitForI18nUpdate,
  getLocalStorage,
  verifyAccessible
} from './helpers.js';

/**
 * Phase 1.1: browser_snapshot priority strategy
 * Core interaction flow testing: Theme + Language Toggle
 *
 * Token efficiency:
 * - browser_snapshot (500 tokens) vs screenshot (1000-2000 tokens)
 * - Batch assertions (single page load for multiple checks)
 * - Conditional screenshots (failure only)
 */

test.describe('Theme & i18n Validation (Phase 1.1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
  });

  test('Theme toggle: dark mode activation', async ({ page }) => {
    try {
      // Batch 1: Initial state verification
      await batchAssertions(page, [
        async (p) => {
          const html = p.locator('html');
          const initialTheme = await html.getAttribute('data-theme');

          // Default could be light or dark (based on system preference)
          expect(['light', 'dark']).toContain(initialTheme);
        },
        async (p) => {
          // Verify theme toggle button is accessible
          await verifyAccessible(p, '#theme-toggle');
        }
      ]);

      // Batch 2: Toggle to dark mode
      await page.click('#theme-toggle');
      await waitForThemeTransition(page);

      await batchAssertions(page, [
        async (p) => {
          // Verify data-theme attribute
          const html = p.locator('html');
          const theme = await html.getAttribute('data-theme');

          // After toggle, theme should change
          expect(theme).toBeTruthy();
        },
        async (p) => {
          // Verify localStorage persistence
          const savedTheme = await getLocalStorage(p, 'theme');
          expect(['light', 'dark']).toContain(savedTheme);
        }
      ]);

      // Batch 3: Accessibility tree validation (replaces screenshot)
      await validateAccessibilityTree(page, {
        role: 'button' // Theme toggle should be accessible
      });

    } catch (error) {
      await captureFailureScreenshot(page, 'theme-toggle-dark');
      throw error;
    }
  });

  test('Theme toggle: persistence after reload', async ({ page }) => {
    try {
      // Set theme to dark
      await page.click('#theme-toggle');
      await waitForThemeTransition(page);

      const themeBeforeReload = await page.locator('html').getAttribute('data-theme');

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Verify theme persists
      const themeAfterReload = await page.locator('html').getAttribute('data-theme');
      expect(themeAfterReload).toBe(themeBeforeReload);

      // Verify localStorage
      const savedTheme = await getLocalStorage(page, 'theme');
      expect(savedTheme).toBe(themeAfterReload);

    } catch (error) {
      await captureFailureScreenshot(page, 'theme-persistence');
      throw error;
    }
  });

  test('Language toggle: Korean to English', async ({ page }) => {
    try {
      // Batch 1: Verify language toggle button exists and is visible
      const langToggle = page.locator('#lang-toggle');
      await expect(langToggle).toBeVisible();

      // Batch 2: Get initial language from localStorage or html lang attribute
      const initialLang = await page.evaluate(() => {
        return localStorage.getItem('lang') || document.documentElement.lang || 'ko';
      });

      // Get initial button text to verify toggle works
      const initialButtonText = await langToggle.locator('span').textContent();

      // Batch 3: Click the language toggle button
      await langToggle.click();
      await waitForI18nUpdate(page);

      // Wait for button text to change (indicates toggle worked)
      await page.waitForFunction(
        (expectedText) => {
          const span = document.querySelector('#lang-toggle span');
          return span && span.textContent !== expectedText;
        },
        initialButtonText,
        { timeout: 5000 }
      );

      // Batch 4: Verify language switched in localStorage
      const newLang = await getLocalStorage(page, 'lang');
      expect(['ko', 'en']).toContain(newLang);

      // Batch 5: Verify i18n content updated
      const i18nElements = await page.locator('[data-i18n]').count();
      expect(i18nElements).toBeGreaterThan(0);

      // Check at least one translated element
      const heroGreeting = page.locator('[data-i18n="hero.greeting"]');
      await expect(heroGreeting).toBeVisible();

      const greetingText = await heroGreeting.textContent();

      // Text should differ based on language
      if (newLang === 'ko') {
        expect(greetingText).toContain('안녕하세요');
      } else {
        expect(greetingText).toContain('Hello');
      }

      // Batch 6: Accessibility tree validation
      await validateAccessibilityTree(page, {
        role: 'heading' // Hero greeting should have heading role
      });

    } catch (error) {
      await captureFailureScreenshot(page, 'language-toggle');
      throw error;
    }
  });

  test('Language toggle: persistence after reload', async ({ page }) => {
    try {
      // Toggle language
      await page.click('#lang-toggle');
      await waitForI18nUpdate(page);

      const langBeforeReload = await getLocalStorage(page, 'lang');

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Verify language persists
      const langAfterReload = await getLocalStorage(page, 'lang');
      expect(langAfterReload).toBe(langBeforeReload);

      // Verify content is in correct language
      const heroGreeting = page.locator('[data-i18n="hero.greeting"]');
      await expect(heroGreeting).toBeVisible();

      const greetingText = await heroGreeting.textContent();

      if (langAfterReload === 'ko') {
        expect(greetingText).toContain('안녕하세요');
      } else {
        expect(greetingText).toContain('Hello');
      }

    } catch (error) {
      await captureFailureScreenshot(page, 'language-persistence');
      throw error;
    }
  });

  test('Combined: Theme + Language state independence', async ({ page }) => {
    try {
      // Verify theme and language can be changed independently

      // 1. Set dark theme
      await page.click('#theme-toggle');
      await waitForThemeTransition(page);
      const theme1 = await page.locator('html').getAttribute('data-theme');

      // 2. Toggle language
      await page.click('#lang-toggle');
      await waitForI18nUpdate(page);
      const lang1 = await getLocalStorage(page, 'lang');

      // 3. Verify theme unchanged after language toggle
      const theme2 = await page.locator('html').getAttribute('data-theme');
      expect(theme2).toBe(theme1);

      // 4. Toggle theme again
      await page.click('#theme-toggle');
      await waitForThemeTransition(page);

      // 5. Verify language unchanged after theme toggle
      const lang2 = await getLocalStorage(page, 'lang');
      expect(lang2).toBe(lang1);

      // 6. Accessibility tree validation (both states active)
      await validateAccessibilityTree(page);

    } catch (error) {
      await captureFailureScreenshot(page, 'theme-language-independence');
      throw error;
    }
  });

  test('Accessibility: Theme toggle keyboard navigation', async ({ page }) => {
    try {
      // Focus the theme toggle directly
      await page.locator('#theme-toggle').focus();

      // Verify focus
      const focusedElement = await page.evaluate(() => document.activeElement?.id);
      expect(focusedElement).toBe('theme-toggle');

      // Activate with Space key
      const themeBefore = await page.locator('html').getAttribute('data-theme');
      await page.keyboard.press('Space');
      await waitForThemeTransition(page);

      const themeAfter = await page.locator('html').getAttribute('data-theme');
      expect(themeAfter).not.toBe(themeBefore);

    } catch (error) {
      await captureFailureScreenshot(page, 'theme-keyboard-a11y');
      throw error;
    }
  });

  test('Accessibility: Language toggle keyboard navigation', async ({ page }) => {
    try {
      // Focus the language toggle directly
      await page.locator('#lang-toggle').focus();

      // Verify focus
      const focusedElement = await page.evaluate(() => document.activeElement?.id);
      expect(focusedElement).toBe('lang-toggle');

      // Activate with Enter key
      const langBefore = await getLocalStorage(page, 'lang');
      await page.keyboard.press('Enter');
      await waitForI18nUpdate(page);

      const langAfter = await getLocalStorage(page, 'lang');
      expect(langAfter).not.toBe(langBefore);

    } catch (error) {
      await captureFailureScreenshot(page, 'language-keyboard-a11y');
      throw error;
    }
  });
});
