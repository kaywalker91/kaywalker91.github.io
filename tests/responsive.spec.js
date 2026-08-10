// @ts-check
import { test, expect } from '@playwright/test';
import {
  captureFailureScreenshot,
  openProjectPanel,
  validateProjectPanelState,
  waitForSmoothScroll
} from './helpers.js';

/**
 * Phase 2.2: Responsive Validation
 * Tests layout and behavior across viewport sizes
 *
 * Token efficiency:
 * - Layout validation via page.evaluate() (structural checks)
 * - Conditional screenshots (failure only)
 * - browser_snapshot for accessibility validation
 */

/**
 * Measure the projects list stack.
 * The 2/3-column `.projects__grid` was replaced by `.projects__list`, a flex
 * column of full-width accordion cards at every breakpoint — so the shape is
 * asserted the same way on mobile, tablet and desktop.
 * @param {import('@playwright/test').Page} page
 */
async function getProjectsListLayout(page) {
  return await page.evaluate(() => {
    const list = document.querySelector('.projects__list');
    if (!list) return null;

    const style = window.getComputedStyle(list);
    const listRect = list.getBoundingClientRect();
    const cards = Array.from(list.querySelectorAll('.project-card'));

    const lefts = new Set(cards.map(card => Math.round(card.getBoundingClientRect().left)));
    const fullWidth = cards.filter(
      card => Math.abs(card.getBoundingClientRect().width - listRect.width) <= 1
    );

    return {
      display: style.display,
      flexDirection: style.flexDirection,
      distinctCardLefts: lefts.size,
      cardsAtFullWidth: fullWidth.length
    };
  });
}

test.describe('Responsive Validation (Phase 2.2)', () => {

  // ===================================
  // Mobile Viewport (375x667)
  // ===================================

  test.describe('Mobile (375x667)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    test('Mobile: Projects list single column stack', async ({ page }, testInfo) => {
      testInfo.setTimeout(60000); // Increase timeout for mobile tests

      try {
        // Wait for page to be fully loaded
        await page.waitForLoadState('domcontentloaded');

        // On mobile, nav links are hidden in toggle menu
        // Scroll directly to projects section instead
        await page.evaluate(() => {
          const section = document.querySelector('#projects');
          if (section) {
            const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
            const targetPosition = section.getBoundingClientRect().top + window.scrollY - headerHeight;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
          }
        });

        await page.waitForTimeout(500); // Wait for scroll

        // The grid was replaced by a flex column of accordion cards
        expect(await getProjectsListLayout(page)).toEqual({
          display: 'flex',
          flexDirection: 'column',
          distinctCardLefts: 1,
          cardsAtFullWidth: 8
        });

      } catch (error) {
        await captureFailureScreenshot(page, 'mobile-projects-list');
        throw error;
      }
    });

    test('Mobile: Accordion panel expands inline without horizontal overflow', async ({ page }, testInfo) => {
      testInfo.setTimeout(60000); // Increase timeout for mobile tests

      try {
        // Wait for page to be fully loaded
        await page.waitForLoadState('domcontentloaded');

        // On mobile, nav links are hidden in toggle menu
        // Scroll directly to projects section instead
        await page.evaluate(() => {
          const section = document.querySelector('#projects');
          if (section) {
            const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
            const targetPosition = section.getBoundingClientRect().top + window.scrollY - headerHeight;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
          }
        });

        await page.waitForTimeout(500); // Wait for scroll

        await openProjectPanel(page, 'mindlog');
        await validateProjectPanelState(page, 'mindlog', true);

        // The panel replaced a bottom-sheet modal: it must grow the card in
        // place, stay inside the card box, and never widen the document.
        const panelLayout = await page.evaluate(() => {
          const card = document.querySelector('.project-card[data-project="mindlog"]');
          const panel = card && card.querySelector('.project-card__panel');
          if (!card || !panel) return null;

          const cardRect = card.getBoundingClientRect();
          const panelRect = panel.getBoundingClientRect();

          return {
            panelWidthOverflow: Math.round(panelRect.width - cardRect.width),
            panelClipped: Math.round(panelRect.bottom - cardRect.bottom) > 1,
            documentOverflow: document.documentElement.scrollWidth - window.innerWidth
          };
        });

        expect(panelLayout).toBeTruthy();
        expect(panelLayout.panelWidthOverflow).toBeLessThanOrEqual(0);
        expect(panelLayout.panelClipped).toBe(false);
        expect(panelLayout.documentOverflow).toBeLessThanOrEqual(0);

      } catch (error) {
        await captureFailureScreenshot(page, 'mobile-accordion-panel');
        throw error;
      }
    });

    test('Mobile: Back-to-top button size adjustment', async ({ page }) => {
      try {
        // Scroll down to trigger back-to-top button
        await page.evaluate(() => window.scrollTo(0, 1000));
        await page.waitForTimeout(300);

        const backToTopButton = page.locator('.back-to-top.visible');
        await expect(backToTopButton).toBeVisible();

        // Validate button size (mobile: 44x44px)
        const buttonSize = await page.evaluate(() => {
          const btn = document.querySelector('.back-to-top');
          if (!btn) return null;
          return {
            width: btn.offsetWidth,
            height: btn.offsetHeight
          };
        });

        expect(buttonSize).toBeTruthy();
        expect(buttonSize.width).toBe(44);
        expect(buttonSize.height).toBe(44);

      } catch (error) {
        await captureFailureScreenshot(page, 'mobile-back-to-top');
        throw error;
      }
    });

    test('Mobile: Container padding (Tailwind px-4)', async ({ page }) => {
      try {
        // Most containers use Tailwind px-4 class (16px)
        const containerPadding = await page.evaluate(() => {
          const container = document.querySelector('.container.mx-auto.px-4');
          if (!container) return null;

          const computedStyle = window.getComputedStyle(container);
          return {
            paddingLeft: computedStyle.paddingLeft,
            paddingRight: computedStyle.paddingRight
          };
        });

        expect(containerPadding).toBeTruthy();
        // Mobile padding: Tailwind px-4 = 1rem = 16px
        expect(containerPadding.paddingLeft).toBe('16px');
        expect(containerPadding.paddingRight).toBe('16px');

      } catch (error) {
        await captureFailureScreenshot(page, 'mobile-container-padding');
        throw error;
      }
    });
  });

  // ===================================
  // Tablet Viewport (768x1024)
  // ===================================

  test.describe('Tablet (768x1024)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    test('Tablet: Projects list stays a single column stack', async ({ page }) => {
      try {
        // Navigate to projects section
        await page.click('a.nav__link[href="#projects"]');
        await waitForSmoothScroll(page, '#projects');

        // No multi-column breakpoint any more — the stack is the layout
        expect(await getProjectsListLayout(page)).toEqual({
          display: 'flex',
          flexDirection: 'column',
          distinctCardLefts: 1,
          cardsAtFullWidth: 8
        });

      } catch (error) {
        await captureFailureScreenshot(page, 'tablet-projects-list');
        throw error;
      }
    });

    test('Tablet: Project toggle meets the 44px touch target', async ({ page }) => {
      try {
        await page.click('a.nav__link[href="#projects"]');
        await waitForSmoothScroll(page, '#projects');

        // The toggle is now the only way into project detail, so it carries the
        // touch-target contract the removed detail button used to hold.
        const undersized = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('.project-card__toggle'))
            .filter(toggle => toggle.getBoundingClientRect().height < 44)
            .map(toggle => toggle.id);
        });

        expect(undersized).toEqual([]);

      } catch (error) {
        await captureFailureScreenshot(page, 'tablet-toggle-touch-target');
        throw error;
      }
    });

    test('Tablet: Navigation horizontal layout', async ({ page }) => {
      try {
        const navLayout = await page.evaluate(() => {
          const navMenu = document.querySelector('.nav__menu');
          if (!navMenu) return null;

          const computedStyle = window.getComputedStyle(navMenu);
          return {
            position: computedStyle.position,
            flexDirection: computedStyle.flexDirection,
            transform: computedStyle.transform,
            opacity: computedStyle.opacity,
            visibility: computedStyle.visibility
          };
        });

        expect(navLayout).toBeTruthy();
        // Tablet/Desktop: static horizontal nav
        expect(navLayout.position).toBe('static');
        expect(navLayout.flexDirection).toBe('row');
        expect(navLayout.opacity).toBe('1');
        expect(navLayout.visibility).toBe('visible');
        // Transform should be 'none' or 'matrix(1, 0, 0, 1, 0, 0)' (identity matrix)
        expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(navLayout.transform);

      } catch (error) {
        await captureFailureScreenshot(page, 'tablet-navigation-layout');
        throw error;
      }
    });

    test('Tablet: Container padding (Tailwind px-4)', async ({ page }) => {
      try {
        // Most containers use Tailwind px-4 which stays 16px at all breakpoints
        const containerPadding = await page.evaluate(() => {
          const container = document.querySelector('.container.mx-auto.px-4');
          if (!container) return null;

          const computedStyle = window.getComputedStyle(container);
          return {
            paddingLeft: computedStyle.paddingLeft,
            paddingRight: computedStyle.paddingRight
          };
        });

        expect(containerPadding).toBeTruthy();
        // Tailwind px-4 = 1rem = 16px (unchanged from mobile)
        expect(containerPadding.paddingLeft).toBe('16px');
        expect(containerPadding.paddingRight).toBe('16px');

      } catch (error) {
        await captureFailureScreenshot(page, 'tablet-container-padding');
        throw error;
      }
    });
  });

  // ===================================
  // Desktop Viewport (1280x800)
  // ===================================

  test.describe('Desktop (1280x800)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    test('Desktop: Hero terminal visible', async ({ page }) => {
      try {
        const heroTerminal = page.locator('.hero__terminal');

        // Validate terminal is visible on desktop
        await expect(heroTerminal).toBeVisible();

        // Validate it's displayed (not hidden)
        const terminalDisplay = await page.evaluate(() => {
          const terminal = document.querySelector('.hero__terminal');
          if (!terminal) return null;
          return window.getComputedStyle(terminal).display;
        });

        expect(terminalDisplay).toBe('block');

      } catch (error) {
        await captureFailureScreenshot(page, 'desktop-hero-terminal');
        throw error;
      }
    });

    test('Desktop: Skills grid 3-column layout', async ({ page }) => {
      try {
        // Navigate to skills section
        await page.click('a.nav__link[href="#skills"]');
        await waitForSmoothScroll(page, '#skills');

        // Skills use Tailwind classes: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
        const gridLayout = await page.evaluate(() => {
          // Find the skills grid (it uses Tailwind classes, not .skills__grid)
          const grids = Array.from(document.querySelectorAll('#skills .grid'));
          const skillsGrid = grids.find(g => {
            const classes = g.className;
            return classes.includes('grid-cols');
          });

          if (!skillsGrid) return null;

          const computedStyle = window.getComputedStyle(skillsGrid);
          const cols = computedStyle.gridTemplateColumns;

          return {
            gridTemplateColumns: cols,
            columnCount: cols.split(' ').filter(v => v && v !== 'none').length
          };
        });

        expect(gridLayout).toBeTruthy();
        // 3 columns on desktop (lg:grid-cols-3)
        expect(gridLayout.columnCount).toBe(3);

      } catch (error) {
        await captureFailureScreenshot(page, 'desktop-skills-grid');
        throw error;
      }
    });

    test('Desktop: Projects list stays a single column stack', async ({ page }) => {
      try {
        // Navigate to projects section
        await page.click('a.nav__link[href="#projects"]');
        await waitForSmoothScroll(page, '#projects');

        expect(await getProjectsListLayout(page)).toEqual({
          display: 'flex',
          flexDirection: 'column',
          distinctCardLefts: 1,
          cardsAtFullWidth: 8
        });

      } catch (error) {
        await captureFailureScreenshot(page, 'desktop-projects-list');
        throw error;
      }
    });

    test('Desktop: Projects container capped at --container-max', async ({ page }) => {
      try {
        await page.click('a.nav__link[href="#projects"]');
        await waitForSmoothScroll(page, '#projects');

        // The reading column the modal used to bypass: 1080px from variables.css
        const containerWidth = await page.evaluate(() => {
          const container = document.querySelector('#projects .container');
          return container ? container.offsetWidth : null;
        });

        expect(containerWidth).toBeTruthy();
        expect(containerWidth).toBeLessThanOrEqual(1080);

      } catch (error) {
        await captureFailureScreenshot(page, 'desktop-projects-container');
        throw error;
      }
    });

    test('Desktop: Back-to-top button standard size', async ({ page }) => {
      try {
        // Scroll down to trigger back-to-top button
        await page.evaluate(() => window.scrollTo(0, 1000));
        await page.waitForTimeout(300);

        const backToTopButton = page.locator('.back-to-top.visible');
        await expect(backToTopButton).toBeVisible();

        // Validate button size (desktop: 48x48px)
        const buttonSize = await page.evaluate(() => {
          const btn = document.querySelector('.back-to-top');
          if (!btn) return null;
          return {
            width: btn.offsetWidth,
            height: btn.offsetHeight
          };
        });

        expect(buttonSize).toBeTruthy();
        expect(buttonSize.width).toBe(48);
        expect(buttonSize.height).toBe(48);

      } catch (error) {
        await captureFailureScreenshot(page, 'desktop-back-to-top');
        throw error;
      }
    });
  });
});
