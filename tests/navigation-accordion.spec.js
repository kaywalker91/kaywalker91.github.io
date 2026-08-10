// @ts-check
import { test, expect } from '@playwright/test';
import {
  batchAssertions,
  captureFailureScreenshot,
  waitForSmoothScroll,
  waitForFilterAnimation,
  waitForAccordionTransition,
  projectToggle,
  openProjectPanel,
  validateProjectPanelState,
  getActiveNavLink,
  getVisibleProjectCards
} from './helpers.js';

/**
 * Phase 2.1: Navigation + Accordion + Filter testing
 * Core interaction flow testing: Navigation, Project Filter, Project Accordion
 *
 * Token efficiency:
 * - browser_snapshot (500 tokens) vs screenshot (1000-2000 tokens)
 * - Batch assertions (single page load for multiple checks)
 * - Conditional screenshots (failure only)
 */

test.describe('Navigation & Accordion Validation (Phase 2.1)', () => {
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

      // Count visible project cards (should be 8)
      const visibleCount = await getVisibleProjectCards(page);
      expect(visibleCount).toBe(8);

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

      // Verify only company projects visible (4 cards)
      const visibleCount = await getVisibleProjectCards(page);
      expect(visibleCount).toBe(4);

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

  test('Accordion: open panel on toggle click', async ({ page }) => {
    try {
      // Navigate to projects section
      await page.click('a.nav__link[href="#projects"]');
      await waitForSmoothScroll(page, '#projects');

      // Verify panel is collapsed initially
      await validateProjectPanelState(page, 'mindlog', false);

      // Click the card's toggle (replaces the removed detail button + modal)
      await openProjectPanel(page, 'mindlog');

      // Verify panel is expanded in place
      await validateProjectPanelState(page, 'mindlog', true);

      // Verify the card is marked expanded for CSS state
      const card = page.locator('.project-card[data-project="mindlog"]');
      await expect(card).toHaveAttribute('data-expanded', 'true');

      // Verify the panel body was rendered from projectData (not written in markup)
      const panelContent = await page.evaluate(() => {
        const inner = document.querySelector('[data-project-panel="mindlog"]');
        if (!inner) return null;
        return {
          textLength: (inner.textContent || '').trim().length,
          labelCount: inner.querySelectorAll('.project-panel__label').length
        };
      });

      expect(panelContent).toBeTruthy();
      expect(panelContent.textLength).toBeGreaterThan(100);
      expect(panelContent.labelCount).toBeGreaterThan(0);

      // Unlike the removed modal, an inline panel must NOT lock background scroll
      const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
      expect(bodyOverflow).toBe('');

    } catch (error) {
      await captureFailureScreenshot(page, 'accordion-open');
      throw error;
    }
  });

  test('Accordion: close on second toggle click', async ({ page }) => {
    try {
      await page.click('a.nav__link[href="#projects"]');
      await waitForSmoothScroll(page, '#projects');

      await openProjectPanel(page, 'mindlog');
      await validateProjectPanelState(page, 'mindlog', true);

      // Re-click the same toggle (replaces Escape / overlay / close button)
      await projectToggle(page, 'mindlog').click();
      await waitForAccordionTransition(page);

      await validateProjectPanelState(page, 'mindlog', false);

      const card = page.locator('.project-card[data-project="mindlog"]');
      await expect(card).toHaveAttribute('data-expanded', 'false');

    } catch (error) {
      await captureFailureScreenshot(page, 'accordion-close');
      throw error;
    }
  });

  test('Accordion: panels expand independently', async ({ page }) => {
    try {
      await page.click('a.nav__link[href="#projects"]');
      await waitForSmoothScroll(page, '#projects');

      await openProjectPanel(page, 'mindlog');
      await openProjectPanel(page, 'cryptowallet');

      // Opening a second card must not collapse the first
      await validateProjectPanelState(page, 'mindlog', true);
      await validateProjectPanelState(page, 'cryptowallet', true);

    } catch (error) {
      await captureFailureScreenshot(page, 'accordion-independent');
      throw error;
    }
  });

  test('Accordion: aria-controls resolves to a labelled panel on every card', async ({ page }) => {
    try {
      await page.click('a.nav__link[href="#projects"]');
      await waitForSmoothScroll(page, '#projects');

      const wiring = await page.evaluate(() => {
        const toggles = Array.from(document.querySelectorAll('.project-card__toggle'));
        const broken = [];

        toggles.forEach(toggle => {
          const controls = toggle.getAttribute('aria-controls');
          const panel = controls ? document.getElementById(controls) : null;

          if (!panel) {
            broken.push({ toggle: toggle.id, reason: 'aria-controls unresolved' });
            return;
          }
          if (panel.getAttribute('role') !== 'region') {
            broken.push({ toggle: toggle.id, reason: 'panel is not role=region' });
          }
          if (panel.getAttribute('aria-labelledby') !== toggle.id) {
            broken.push({ toggle: toggle.id, reason: 'panel aria-labelledby mismatch' });
          }
          if (toggle.getAttribute('aria-expanded') === null) {
            broken.push({ toggle: toggle.id, reason: 'missing aria-expanded' });
          }
        });

        return { total: toggles.length, broken };
      });

      expect(wiring.broken).toEqual([]);
      expect(wiring.total).toBe(8);

    } catch (error) {
      await captureFailureScreenshot(page, 'accordion-aria-wiring');
      throw error;
    }
  });

  test('Accordion: filter change collapses an open panel', async ({ page }) => {
    try {
      await page.click('a.nav__link[href="#projects"]');
      await waitForSmoothScroll(page, '#projects');

      // Open a company card, then apply the filter that keeps it visible —
      // so the collapse cannot be explained away by the card being hidden.
      await openProjectPanel(page, 'pointtour');
      await validateProjectPanelState(page, 'pointtour', true);

      await page.locator('.projects__filter-btn[data-filter="company"]').click();
      await waitForFilterAnimation(page);
      await waitForAccordionTransition(page);

      const card = page.locator('.project-card[data-project="pointtour"]');
      await expect(card).not.toHaveAttribute('data-filter-hidden', 'true');
      await validateProjectPanelState(page, 'pointtour', false);

    } catch (error) {
      await captureFailureScreenshot(page, 'accordion-filter-collapse');
      throw error;
    }
  });

  test('Accordion: keyboard operable with focus retained on the toggle', async ({ page }) => {
    try {
      await page.click('a.nav__link[href="#projects"]');
      await waitForSmoothScroll(page, '#projects');

      const toggle = projectToggle(page, 'mindlog');
      await toggle.focus();
      await expect(toggle).toBeFocused();

      // Enter opens
      await page.keyboard.press('Enter');
      await waitForAccordionTransition(page);
      await validateProjectPanelState(page, 'mindlog', true);

      // Focus stays put — an inline panel has no focus trap to hand off to
      await expect(toggle).toBeFocused();

      // Space closes
      await page.keyboard.press('Space');
      await waitForAccordionTransition(page);
      await validateProjectPanelState(page, 'mindlog', false);
      await expect(toggle).toBeFocused();

    } catch (error) {
      await captureFailureScreenshot(page, 'accordion-keyboard');
      throw error;
    }
  });
});
