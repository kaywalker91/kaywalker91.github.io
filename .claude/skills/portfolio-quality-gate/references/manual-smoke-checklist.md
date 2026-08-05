# Manual Smoke Checklist

Run this checklist after static checks pass.

## Core Interactions

- Verify desktop and mobile navigation open/close behavior.
- Verify active section highlight changes while scrolling.
- Verify theme toggle updates visual tokens and icon state.
- Verify language toggle updates major content strings.
- Verify project filter buttons show/hide cards correctly.
- Verify project modal opens, closes, and supports Escape key.
- Verify back-to-top button visibility and scroll behavior.

## Accessibility

- Verify keyboard access to nav, toggles, filter buttons, and modal controls.
- Verify focus indicators remain visible for keyboard navigation.
- Verify skip link moves focus to main content.
- Verify modal close control has a clear accessible label.

## Responsive Coverage

- Check at 375px, 768px, and >=1280px widths.
- Check both light and dark themes in each viewport.
- Confirm no text clipping, overflow, or overlapped CTAs.

## Console and Assets

- Confirm no runtime errors in browser console.
- Confirm no missing asset requests in network panel.
