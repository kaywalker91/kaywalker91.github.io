# Playwright QA Automation - Phase 1.1

## Overview

Token-efficient browser automation for `kaywalker91.github.io` using Playwright MCP with `browser_snapshot` priority strategy.

**Token Efficiency**: ~500 tokens per test vs 1000-2000 tokens with screenshot-based validation (80% reduction)

## Phase 1.1 Implementation

### Strategies Applied

1. **browser_snapshot Priority**
   - Uses accessibility tree instead of screenshots
   - 500 tokens per validation vs 1000-2000 for images
   - See `validateAccessibilityTree()` in `helpers.js`

2. **Batch Assertions**
   - Multiple checks in single page load
   - Reduces navigation overhead and token consumption
   - See `batchAssertions()` in `helpers.js`

3. **Conditional Screenshots**
   - Screenshots only on test failure
   - Configured in `playwright.config.js`: `screenshot: 'only-on-failure'`
   - Manual capture via `captureFailureScreenshot()`

### Test Coverage

**`theme-i18n.spec.js`** - Core interaction flows (7 tests):
- ✅ Theme toggle: dark mode activation
- ✅ Theme toggle: persistence after reload
- ✅ Language toggle: Korean to English
- ✅ Language toggle: persistence after reload
- ✅ Combined: Theme + Language state independence
- ✅ Accessibility: Theme toggle keyboard navigation
- ✅ Accessibility: Language toggle keyboard navigation

**Token Cost**: ~3.5K tokens for all 7 tests (vs ~14K with screenshot-based approach)

## Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers (Chromium only for token efficiency)
npm run playwright:install
```

## Running Tests

```bash
# Run all tests (headless)
npm test

# Run with browser visible (debugging)
npm run test:headed

# Run in UI mode (interactive)
npm run test:ui

# Debug mode (step through tests)
npm run test:debug

# View HTML report
npm run test:report
```

## Local Development Workflow

```bash
# 1. Start local server
python3 -m http.server 8080

# 2. Run tests (in another terminal)
npm test

# 3. View results
npm run test:report
```

## File Structure

```
tests/
├── README.md                 # This file
├── helpers.js                # Token-efficient test utilities
└── theme-i18n.spec.js        # Core interaction flow tests

playwright.config.js          # Playwright configuration
package.json                  # npm scripts
.playwright-mcp/              # Failure screenshots (gitignored)
```

## Helpers API

### `validateAccessibilityTree(page, expectations)`
Validates page structure via accessibility tree (replaces screenshots).

```javascript
const snapshot = await validateAccessibilityTree(page, {
  role: 'button',
  name: 'Toggle dark mode'
});
```

### `batchAssertions(page, assertions)`
Executes multiple assertions in sequence (single page load).

```javascript
await batchAssertions(page, [
  async (p) => expect(p.locator('#theme-toggle')).toBeVisible(),
  async (p) => expect(p.locator('html')).toHaveAttribute('data-theme')
]);
```

### `captureFailureScreenshot(page, name)`
Manually captures screenshot on test failure (auto-called in try/catch).

```javascript
try {
  // test logic
} catch (error) {
  await captureFailureScreenshot(page, 'test-name');
  throw error;
}
```

### Utility Functions
- `waitForThemeTransition(page)` - Wait for CSS theme transition (350ms)
- `waitForI18nUpdate(page)` - Wait for i18n DOM update (100ms)
- `getLocalStorage(page, key)` - Cross-browser localStorage access
- `verifyAccessible(page, selector)` - Verify element in accessibility tree

## Next Steps (Phase 2+)

### Phase 2.1: High Priority Flows (~2K tokens)
- Navigation + Smooth Scroll
- Project Modal + Focus Trap
- Project Filtering

### Phase 2.2: Responsive Validation (~1K tokens)
- Mobile (375x667)
- Tablet (768x1024)
- Desktop (1280x800)

### Phase 3: CI/CD Integration (~500 tokens)
- GitHub Actions workflow
- Pre-commit hook
- Integration with existing `portfolio-quality-gate` scripts

## Token Cost Analysis

| Test Suite | With Screenshots | With browser_snapshot | Savings |
|------------|------------------|----------------------|---------|
| theme-i18n.spec.js (7 tests) | ~14K tokens | ~3.5K tokens | 75% |
| Phase 2.1 (3 flows) | ~6K tokens | ~2K tokens | 67% |
| Phase 2.2 (3 viewports) | ~3K tokens | ~1K tokens | 67% |
| **Total Phase 1-2** | **~23K tokens** | **~6.5K tokens** | **72%** |

## References

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [Phase 1.1 Plan](../plan.md#phase-1-token-efficient-automation-strategy)
