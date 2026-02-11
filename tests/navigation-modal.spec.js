// @ts-check
import { test, expect } from '@playwright/test';
import {
  batchAssertions,
  captureFailureScreenshot,
  waitForSmoothScroll,
  waitForFilterAnimation,
  validateModalState,
  getActiveNavLink,
  getVisibleProjectCards
} from './helpers.js';

/**
 * Phase 2.1: Navigation + Modal + Filter testing
 * Core interaction flow testing: Navigation, Project Filter, Project Modal
 *
 * Token efficiency:
 * - browser_snapshot (500 tokens) vs screenshot (1000-2000 tokens)
 * - Batch assertions (single page load for multiple checks)
 * - Conditional screenshots (failure only)
 */

test.describe('Navigation & Modal Validation (Phase 2.1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Navigation: smooth scroll to section', async ({ page }) => {
    try {
      // Click navigation link to #projects section
      const projectsLink = page.locator('a.nav__link[href="#projects"]');
      await expect(projectsLink).toBeVisible();

      await projectsLink.click();

      // Wait for smooth scroll to complete
      await waitForSmoothScroll(page, '#projects');

      // Verify section is visible and near top of viewport
      const projectsSection = page.locator('#projects');
      await expect(projectsSection).toBeInViewport();

      // Verify scroll position (section should be near top)
      const isNearTop = await page.evaluate(() => {
        const section = document.querySelector('#projects');
        if (!section) return false;
        const rect = section.getBoundingClientRect();
        return rect.top >= 0 && rect.top < 150; // Account for header height
      });
      expect(isNearTop).toBe(true);

    } catch (error) {
      await captureFailureScreenshot(page, 'navigation-smooth-scroll');
      throw error;
    }
  });

  test('Navigation: active link highlighting', async ({ page }) => {
    try {
      // Scroll to #projects section
      await page.click('a.nav__link[href="#projects"]');
      await waitForSmoothScroll(page, '#projects');

      // Wait for IntersectionObserver to update active link
      await page.waitForTimeout(500);

      // Verify #projects link is active
      const activeLink = await getActiveNavLink(page);
      expect(activeLink).toBe('#projects');

      // Verify only one link has active class
      const activeCount = await page.evaluate(() => {
        return document.querySelectorAll('.nav__link.active').length;
      });
      expect(activeCount).toBe(1);

    } catch (error) {
      await captureFailureScreenshot(page, 'navigation-active-link');
      throw error;
    }
  });

  test('Project filter: all projects visible by default', async ({ page }) => {
    try {
      // Navigate to projects section first
      await page.click('a.nav__link[href="#projects"]');
      await waitForSmoothScroll(page, '#projects');

      // Verify "all" filter is active by default
      const allButton = page.locator('.projects__filter-btn[data-filter="all"]');
      await expect(allButton).toHaveClass(/active/);

      // Verify aria-selected
      const ariaSelected = await allButton.getAttribute('aria-selected');
      expect(ariaSelected).toBe('true');

      // Count visible project cards (should be 7)
      const visibleCount = await getVisibleProjectCards(page);
      expect(visibleCount).toBe(7);

    } catch (error) {
      await captureFailureScreenshot(page, 'filter-all-default');
      throw error;
    }
  });

  test('Project filter: personal category', async ({ page }) => {
    try {
      // Navigate to projects section
      await page.click('a.nav__link[href="#projects"]');
      await waitForSmoothScroll(page, '#projects');

      // Click "personal" filter
      const personalButton = page.locator('.projects__filter-btn[data-filter="personal"]');
      await personalButton.click();
      await waitForFilterAnimation(page);

      // Verify button state
      await expect(personalButton).toHaveClass(/active/);
      expect(await personalButton.getAttribute('aria-selected')).toBe('true');

      // Verify only personal projects visible (2 cards)
      const visibleCount = await getVisibleProjectCards(page);
      expect(visibleCount).toBe(2);

      // Verify correct cards are visible (mindlog, cryptowallet)
      const visibleCategories = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.project-card[data-category]'));
        return cards
          .filter(card => !card.hasAttribute('data-filter-hidden'))
          .map(card => card.getAttribute('data-category'));
      });

      expect(visibleCategories).toEqual(['personal', 'personal']);

    } catch (error) {
      await captureFailureScreenshot(page, 'filter-personal');
      throw error;
    }
  });

  test('Project filter: company category', async ({ page }) => {
    try {
      // Navigate to projects section
      await page.click('a.nav__link[href="#projects"]');
      await waitForSmoothScroll(page, '#projects');

      // Click "company" filter
      const companyButton = page.locator('.projects__filter-btn[data-filter="company"]');
      await companyButton.click();
      await waitForFilterAnimation(page);

      // Verify button state
      await expect(companyButton).toHaveClass(/active/);

      // Verify only company projects visible (3 cards)
      const visibleCount = await getVisibleProjectCards(page);
      expect(visibleCount).toBe(3);

      // Verify correct categories
      const visibleCategories = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.project-card[data-category]'));
        return cards
          .filter(card => !card.hasAttribute('data-filter-hidden'))
          .map(card => card.getAttribute('data-category'));
      });

      visibleCategories.forEach(cat => expect(cat).toBe('company'));

    } catch (error) {
      await captureFailureScreenshot(page, 'filter-company');
      throw error;
    }
  });

  test('Project filter: learning category', async ({ page }) => {
    try {
      // Navigate to projects section
      await page.click('a.nav__link[href="#projects"]');
      await waitForSmoothScroll(page, '#projects');

      // Click "learning" filter
      const learningButton = page.locator('.projects__filter-btn[data-filter="learning"]');
      await learningButton.click();
      await waitForFilterAnimation(page);

      // Verify only learning projects visible (2 cards)
      const visibleCount = await getVisibleProjectCards(page);
      expect(visibleCount).toBe(2);

    } catch (error) {
      await captureFailureScreenshot(page, 'filter-learning');
      throw error;
    }
  });

  test('Modal: open on project detail button click', async ({ page }) => {
    try {
      // Navigate to projects section
      await page.click('a.nav__link[href="#projects"]');
      await waitForSmoothScroll(page, '#projects');

      // Verify modal is closed initially
      await validateModalState(page, false);

      // Click first project detail button (mindlog)
      const detailButton = page.locator('.project-card__detail-btn[data-project="mindlog"]').first();
      await detailButton.click();

      // Wait for modal to open
      await page.waitForTimeout(300); // CSS transition duration

      // Verify modal is open
      await validateModalState(page, true);

      // Verify modal title
      const modalTitle = page.locator('.modal__title');
      await expect(modalTitle).toContainText('MindLog');

      // Verify body overflow hidden (prevent background scroll)
      const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
      expect(bodyOverflow).toBe('hidden');

    } catch (error) {
      await captureFailureScreenshot(page, 'modal-open');
      throw error;
    }
  });

  test('Modal: close on Escape key', async ({ page }) => {
    try {
      // Navigate to projects and open modal
      await page.click('a.nav__link[href="#projects"]');
      await waitForSmoothScroll(page, '#projects');

      const detailButton = page.locator('.project-card__detail-btn[data-project="mindlog"]').first();
      await detailButton.click();
      await page.waitForTimeout(300);

      // Verify modal is open
      await validateModalState(page, true);

      // Press Escape key
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);

      // Verify modal is closed
      await validateModalState(page, false);

      // Verify body overflow restored
      const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
      expect(bodyOverflow).toBe('');

    } catch (error) {
      await captureFailureScreenshot(page, 'modal-close-escape');
      throw error;
    }
  });

  test('Modal: close on overlay click', async ({ page }) => {
    try {
      // Navigate to projects and open modal
      await page.click('a.nav__link[href="#projects"]');
      await waitForSmoothScroll(page, '#projects');

      const detailButton = page.locator('.project-card__detail-btn[data-project="mindlog"]').first();
      await detailButton.click();
      await page.waitForTimeout(300);

      // Verify modal is open
      await validateModalState(page, true);

      // Click on modal overlay (not on .modal itself)
      const modalOverlay = page.locator('#project-modal');
      await modalOverlay.click({ position: { x: 5, y: 5 } }); // Click near edge (overlay area)
      await page.waitForTimeout(100);

      // Verify modal is closed
      await validateModalState(page, false);

    } catch (error) {
      await captureFailureScreenshot(page, 'modal-close-overlay');
      throw error;
    }
  });

  test('Modal: close button functionality', async ({ page }) => {
    try {
      // Navigate to projects and open modal
      await page.click('a.nav__link[href="#projects"]');
      await waitForSmoothScroll(page, '#projects');

      const detailButton = page.locator('.project-card__detail-btn[data-project="mindlog"]').first();
      await detailButton.click();
      await page.waitForTimeout(300);

      // Verify modal is open
      await validateModalState(page, true);

      // Click close button
      const closeButton = page.locator('.modal__close');
      await closeButton.click();
      await page.waitForTimeout(100);

      // Verify modal is closed
      await validateModalState(page, false);

    } catch (error) {
      await captureFailureScreenshot(page, 'modal-close-button');
      throw error;
    }
  });

  test('Modal: focus trap on open', async ({ page }) => {
    try {
      // Navigate to projects and open modal
      await page.click('a.nav__link[href="#projects"]');
      await waitForSmoothScroll(page, '#projects');

      const detailButton = page.locator('.project-card__detail-btn[data-project="mindlog"]').first();
      await detailButton.click();
      await page.waitForTimeout(300);

      // Verify modal is open
      await validateModalState(page, true);

      // Wait for focus trap to activate (CSS transition + focus() call)
      await page.waitForTimeout(500);

      // Verify modal has focusable elements
      const focusableCount = await page.evaluate(() => {
        const modal = document.querySelector('#project-modal');
        if (!modal) return 0;
        const focusable = modal.querySelectorAll('button, a[href]');
        return focusable.length;
      });

      expect(focusableCount).toBeGreaterThan(0);

      // Verify focus is on a button or link (not on body)
      const focusedElementTag = await page.evaluate(() => {
        const focused = document.activeElement;
        return focused ? focused.tagName.toLowerCase() : null;
      });

      // Focus should be on button or link, not on body
      expect(['button', 'a']).toContain(focusedElementTag);

    } catch (error) {
      await captureFailureScreenshot(page, 'modal-focus-trap');
      throw error;
    }
  });
});
