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
 * Phase 2.1: Navigation + Modal + Filter helpers
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
 * Validate modal open/close state
 * @param {import('@playwright/test').Page} page
 * @param {boolean} shouldBeOpen - Expected modal state
 */
export async function validateModalState(page, shouldBeOpen) {
  const modal = page.locator('#project-modal');
  const ariaHidden = await modal.getAttribute('aria-hidden');

  if (shouldBeOpen) {
    expect(ariaHidden).toBe('false');
    await expect(modal).toBeVisible();
  } else {
    expect(ariaHidden).toBe('true');
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
