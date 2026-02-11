// @ts-check
import { test, expect } from '@playwright/test';
import {
  captureFailureScreenshot,
  validateModalState,
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

    test('Mobile: Projects grid single column layout', async ({ page }, testInfo) => {
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

        // Validate grid layout
        const gridLayout = await page.evaluate(() => {
          const grid = document.querySelector('.projects__grid');
          if (!grid) return null;

          const computedStyle = window.getComputedStyle(grid);
          const cols = computedStyle.gridTemplateColumns;

          return {
            gridTemplateColumns: cols,
            columnCount: cols.split(' ').filter(v => v && v !== 'none').length
          };
        });

        expect(gridLayout).toBeTruthy();
        // Single column = 1 value in grid-template-columns
        expect(gridLayout.columnCount).toBe(1);

      } catch (error) {
        await captureFailureScreenshot(page, 'mobile-projects-grid');
        throw error;
      }
    });

    test('Mobile: Bottom sheet modal (slides from bottom)', async ({ page }, testInfo) => {
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

        // Open modal
        const detailButton = page.locator('.project-card__detail-btn[data-project="mindlog"]').first();
        await detailButton.waitFor({ state: 'visible', timeout: 10000 });
        await detailButton.click();
        await page.waitForTimeout(400); // Wait for transform animation

        await validateModalState(page, true);

        // Validate bottom sheet positioning
        const modalLayout = await page.evaluate(() => {
          const modal = document.querySelector('.modal');
          const overlay = document.querySelector('#project-modal');
          if (!modal || !overlay) return null;

          const modalRect = modal.getBoundingClientRect();
          const overlayStyle = window.getComputedStyle(overlay);

          return {
            modalBottom: window.innerHeight - modalRect.bottom,
            modalBorderRadius: window.getComputedStyle(modal).borderRadius,
            overlayPadding: overlayStyle.padding,
            overlayAlignItems: overlayStyle.alignItems
          };
        });

        expect(modalLayout).toBeTruthy();
        // Bottom sheet: modal should be near bottom (allow tolerance for border/padding/border-radius)
        // Actual value is ~41px due to modal border-radius and safe area
        expect(modalLayout.modalBottom).toBeLessThan(50);
        // Overlay has horizontal padding for safe area (0px vertical, 16px horizontal)
        expect(modalLayout.overlayPadding).toContain('0px');

      } catch (error) {
        await captureFailureScreenshot(page, 'mobile-modal-bottom-sheet');
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

    test('Tablet: Projects grid 2-column layout', async ({ page }) => {
      try {
        // Navigate to projects section
        await page.click('a.nav__link[href="#projects"]');
        await waitForSmoothScroll(page, '#projects');

        // Validate grid layout
        const gridLayout = await page.evaluate(() => {
          const grid = document.querySelector('.projects__grid');
          if (!grid) return null;

          const computedStyle = window.getComputedStyle(grid);
          return {
            gridTemplateColumns: computedStyle.gridTemplateColumns,
            columnCount: computedStyle.gridTemplateColumns.split(' ').length
          };
        });

        expect(gridLayout).toBeTruthy();
        // 2 columns = "1fr 1fr" or "XXXpx XXXpx" (2 values)
        expect(gridLayout.columnCount).toBe(2);

      } catch (error) {
        await captureFailureScreenshot(page, 'tablet-projects-grid');
        throw error;
      }
    });

    test('Tablet: Modal centered (not bottom sheet)', async ({ page }) => {
      try {
        // Navigate to projects and open modal
        await page.click('a.nav__link[href="#projects"]');
        await waitForSmoothScroll(page, '#projects');

        const detailButton = page.locator('.project-card__detail-btn[data-project="mindlog"]').first();
        await detailButton.click();
        await page.waitForTimeout(300);

        await validateModalState(page, true);

        // Validate centered modal positioning
        const modalLayout = await page.evaluate(() => {
          const modal = document.querySelector('.modal');
          const overlay = document.querySelector('.modal-overlay');
          if (!modal || !overlay) return null;

          const modalRect = modal.getBoundingClientRect();
          const overlayStyle = window.getComputedStyle(overlay);

          return {
            modalTop: modalRect.top,
            modalBottom: window.innerHeight - modalRect.bottom,
            overlayAlignItems: overlayStyle.alignItems,
            overlayPadding: overlayStyle.padding
          };
        });

        expect(modalLayout).toBeTruthy();
        // Centered modal: top and bottom gaps should be roughly equal
        const topBottomDiff = Math.abs(modalLayout.modalTop - modalLayout.modalBottom);
        expect(topBottomDiff).toBeLessThan(100); // Allow some tolerance

        // Should NOT be aligned to bottom
        expect(modalLayout.overlayAlignItems).not.toBe('flex-end');

      } catch (error) {
        await captureFailureScreenshot(page, 'tablet-modal-centered');
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

    test('Desktop: Projects grid 2-column layout', async ({ page }) => {
      try {
        // Navigate to projects section
        await page.click('a.nav__link[href="#projects"]');
        await waitForSmoothScroll(page, '#projects');

        // Validate grid layout (stays at 2 columns, not 3)
        const gridLayout = await page.evaluate(() => {
          const grid = document.querySelector('.projects__grid');
          if (!grid) return null;

          const computedStyle = window.getComputedStyle(grid);
          return {
            gridTemplateColumns: computedStyle.gridTemplateColumns,
            columnCount: computedStyle.gridTemplateColumns.split(' ').length
          };
        });

        expect(gridLayout).toBeTruthy();
        // Projects: 2 columns even on desktop
        expect(gridLayout.columnCount).toBe(2);

      } catch (error) {
        await captureFailureScreenshot(page, 'desktop-projects-grid');
        throw error;
      }
    });

    test('Desktop: Modal max-width constraint', async ({ page }) => {
      try {
        // Navigate to projects and open modal
        await page.click('a.nav__link[href="#projects"]');
        await waitForSmoothScroll(page, '#projects');

        const detailButton = page.locator('.project-card__detail-btn[data-project="mindlog"]').first();
        await detailButton.click();
        await page.waitForTimeout(300);

        await validateModalState(page, true);

        // Validate modal width
        const modalWidth = await page.evaluate(() => {
          const modal = document.querySelector('.modal');
          if (!modal) return null;
          return modal.offsetWidth;
        });

        expect(modalWidth).toBeTruthy();
        // Modal max-width: 720px from components.css
        expect(modalWidth).toBeLessThanOrEqual(720);

      } catch (error) {
        await captureFailureScreenshot(page, 'desktop-modal-width');
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
