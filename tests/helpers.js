// @ts-check
import { expect } from '@playwright/test';

/**
 * Helper utilities for token-efficient Playwright tests
 * Phase 1.1: browser_snapshot priority strategy
 */

/**
 * Validate accessibility tree structure (replaces screenshot validation)
 * @param {import('@playwright/test').Page} page
 * @param {Object} expectations - Expected accessibility tree properties
 * @returns {Promise<Object|null>} Accessibility snapshot
 */
export async function validateAccessibilityTree(page, expectations = {}) {
  let snapshot = null;

  try {
    // Check if accessibility API is available
    if (page.accessibility && typeof page.accessibility.snapshot === 'function') {
      snapshot = await page.accessibility.snapshot();
    }
  } catch (error) {
    console.log('⚠️ Accessibility snapshot error:', error.message);
  }

  // If snapshot is available, validate it
  if (snapshot) {
    // Optional role-based validation
    if (expectations.role) {
      const roles = collectRoles(snapshot);
      expect(roles).toContain(expectations.role);
    }

    // Optional name-based validation
    if (expectations.name) {
      const names = collectNames(snapshot);
      expect(names).toContain(expectations.name);
    }
  } else {
    // Fallback: verify page is loaded and has expected elements
    const bodyLocator = page.locator('body');
    await expect(bodyLocator).toBeVisible();
    console.log('⚠️ Accessibility snapshot unavailable, using fallback validation');
  }

  return snapshot;
}

/**
 * Collect all roles from accessibility tree
 * @param {Object} node - Accessibility tree node
 * @returns {string[]} Array of role values
 */
function collectRoles(node) {
  if (!node) return [];

  const roles = node.role ? [node.role] : [];
  if (node.children) {
    for (const child of node.children) {
      roles.push(...collectRoles(child));
    }
  }
  return roles;
}

/**
 * Collect all accessible names from tree
 * @param {Object} node - Accessibility tree node
 * @returns {string[]} Array of accessible names
 */
function collectNames(node) {
  if (!node) return [];

  const names = node.name ? [node.name] : [];
  if (node.children) {
    for (const child of node.children) {
      names.push(...collectNames(child));
    }
  }
  return names;
}

/**
 * Batch assertion helper: combines multiple checks in single page load
 * @param {import('@playwright/test').Page} page
 * @param {Function[]} assertions - Array of assertion functions
 */
export async function batchAssertions(page, assertions) {
  for (const assertion of assertions) {
    await assertion(page);
  }
}

/**
 * Conditional screenshot: only capture on test failure
 * Usage: wrap test logic in try/catch, call this on error
 * @param {import('@playwright/test').Page} page
 * @param {string} name - Screenshot filename
 */
export async function captureFailureScreenshot(page, name) {
  const timestamp = Date.now();
  const path = `.playwright-mcp/failure-${name}-${timestamp}.png`;
  await page.screenshot({ path, fullPage: true });
  console.error(`📸 Failure screenshot saved: ${path}`);
  return path;
}

/**
 * Wait for theme transition to complete (avoid flaky tests)
 * @param {import('@playwright/test').Page} page
 */
export async function waitForThemeTransition(page) {
  // Wait for CSS transitions (theme.js uses 300ms duration)
  await page.waitForTimeout(350);
}

/**
 * Wait for i18n update to complete
 * @param {import('@playwright/test').Page} page
 */
export async function waitForI18nUpdate(page) {
  // i18n updates are synchronous, but wait for DOM to settle
  await page.waitForTimeout(100);
}

/**
 * Get localStorage value (cross-browser compatible)
 * @param {import('@playwright/test').Page} page
 * @param {string} key
 * @returns {Promise<string|null>}
 */
export async function getLocalStorage(page, key) {
  return await page.evaluate((k) => localStorage.getItem(k), key);
}

/**
 * Verify element is visible in accessibility tree
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 */
export async function verifyAccessible(page, selector) {
  const element = page.locator(selector);
  await expect(element).toBeVisible();

  // Verify it's in the accessibility tree
  const role = await element.getAttribute('role') || await element.evaluate(el => el.tagName.toLowerCase());
  expect(role).toBeTruthy();
}

/**
 * Phase 2.1: Navigation + Accordion + Filter helpers
 */

/**
 * Wait for smooth scroll to complete
 * @param {import('@playwright/test').Page} page
 * @param {string} targetSelector - Target section selector (e.g., '#projects')
 */
export async function waitForSmoothScroll(page, targetSelector) {
  // Wait for scroll to position target near top of viewport
  await page.waitForFunction(
    (selector) => {
      const element = document.querySelector(selector);
      if (!element) return false;
      const rect = element.getBoundingClientRect();
      // Consider scrolled when element is within 150px of top (accounting for header)
      return rect.top >= 0 && rect.top < 150;
    },
    targetSelector,
    { timeout: 5000 }
  );
}

/**
 * Wait for filter animation to complete
 * @param {import('@playwright/test').Page} page
 */
export async function waitForFilterAnimation(page) {
  // Filter animations are 200ms (fade-in/fade-out) + 50ms delay per card
  await page.waitForTimeout(400);
}

/**
 * Wait for the accordion panel height transition to settle
 * (max-height 0.5s in components.css)
 * @param {import('@playwright/test').Page} page
 */
export async function waitForAccordionTransition(page) {
  await page.waitForTimeout(600);
}

/**
 * Locator for a project card's accordion toggle
 * @param {import('@playwright/test').Page} page
 * @param {string} projectId - value of data-project (e.g. 'mindlog')
 */
export function projectToggle(page, projectId) {
  return page.locator(`.project-card[data-project="${projectId}"] .project-card__toggle`);
}

/**
 * Open a project accordion panel and wait for it to settle
 * @param {import('@playwright/test').Page} page
 * @param {string} projectId - value of data-project (e.g. 'mindlog')
 */
export async function openProjectPanel(page, projectId) {
  const toggle = projectToggle(page, projectId);
  await toggle.waitFor({ state: 'visible', timeout: 10000 });
  await toggle.click();
  await waitForAccordionTransition(page);
}

/**
 * Measure a project panel's rendered height (0 when collapsed)
 * @param {import('@playwright/test').Page} page
 * @param {string} projectId
 * @returns {Promise<number|null>} panel height in px, null if the card is missing
 */
export async function getProjectPanelHeight(page, projectId) {
  return await page.evaluate((id) => {
    const panel = document.querySelector(`.project-card[data-project="${id}"] .project-card__panel`);
    if (!panel) return null;
    return panel.getBoundingClientRect().height;
  }, projectId);
}

/**
 * Validate accordion panel open/close state
 * Replaces the removed modal flow: the panel is expanded in place, so state
 * lives on the toggle's aria-expanded plus the panel's measured height.
 * @param {import('@playwright/test').Page} page
 * @param {string} projectId - value of data-project (e.g. 'mindlog')
 * @param {boolean} shouldBeOpen - Expected panel state
 */
export async function validateProjectPanelState(page, projectId, shouldBeOpen) {
  const toggle = projectToggle(page, projectId);
  await expect(toggle).toHaveAttribute('aria-expanded', String(shouldBeOpen));

  const height = await getProjectPanelHeight(page, projectId);
  expect(height).not.toBeNull();

  if (shouldBeOpen) {
    expect(height).toBeGreaterThan(0);
  } else {
    expect(height).toBe(0);
  }
}

/**
 * Get active navigation link href
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<string|null>} href of active link (e.g., '#projects')
 */
export async function getActiveNavLink(page) {
  return await page.evaluate(() => {
    const activeLink = document.querySelector('.nav__link.active');
    return activeLink ? activeLink.getAttribute('href') : null;
  });
}

/**
 * Count visible project cards (not filtered out)
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<number>} Number of visible cards
 */
export async function getVisibleProjectCards(page) {
  return await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.project-card[data-category]'));
    return cards.filter(card => {
      // Card is visible if it doesn't have data-filter-hidden attribute
      return !card.hasAttribute('data-filter-hidden');
    }).length;
  });
}
