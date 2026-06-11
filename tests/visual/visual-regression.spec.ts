/**
 * tests/visual/visual-regression.spec.ts
 *
 * Visual regression tests — compare screenshots against stored baselines.
 * Run `npm run baseline` to capture new baselines after intentional design changes.
 *
 * Tag: @visual
 */

import { test, expect } from '@fixtures/site.fixture';
import { dismissCookieBanner, stabilizePage } from '@utils/visual-helper';

// Shared screenshot options applied to all visual tests.
// maxDiffPixelRatio (3%) tolerates small live-site dynamic content (counters,
// carousels) while still catching major layout regressions.
const SCREENSHOT_OPTIONS = {
  maxDiffPixelRatio: 0.03,
  animations: 'disabled',
  caret: 'hide',
  fullPage: true,
} as const;

test.describe('Visual Regression @visual', () => {
  // Skip entire suite when site config opts out
  test.beforeEach(async ({ siteConfig }) => {
    if (siteConfig.skipVisual) {
      test.skip(true, `Visual regression skipped for "${siteConfig.name}" (skipVisual: true)`);
    }
  });

  // ── Desktop ─────────────────────────────────────────────────────────────────

  test('homepage visual regression - desktop @visual', async ({ page, siteConfig }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(siteConfig.url, { waitUntil: 'load' });

    // Dismiss any cookie/consent banners that would interfere with comparison
    await dismissCookieBanner(page);

    // Freeze CSS animations and JS-driven timers (carousels, counters, etc.)
    await stabilizePage(page);

    // Final settle — intentional exception for screenshot stability
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      ...SCREENSHOT_OPTIONS,
    });
  });

  // ── Mobile ──────────────────────────────────────────────────────────────────

  test('homepage visual regression - mobile @visual', async ({ page, siteConfig }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(siteConfig.url, { waitUntil: 'load' });

    await dismissCookieBanner(page);
    await stabilizePage(page);
    // Final settle — intentional exception for screenshot stability
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      ...SCREENSHOT_OPTIONS,
    });
  });

  // ── Tablet ──────────────────────────────────────────────────────────────────

  // Tablet screenshot uses viewport-only (fullPage: false) because full-page scroll
  // at 768px triggers lazy-load/navigation events that prevent stable captures.
  // Only run on the [tablet] project — Desktop Chrome and Pixel 5 UAs serve
  // a different carousel layout at 768px that cannot be frozen.
  test('homepage visual regression - tablet @visual', async ({ page, siteConfig }) => {
    // Give this test a longer budget: navigation + stabilize + up to 30s for screenshot
    test.setTimeout(60_000);

    if (test.info().project.name !== 'tablet') {
      test.skip();
      return;
    }

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(siteConfig.url, { waitUntil: 'load' });

    await dismissCookieBanner(page);
    await stabilizePage(page);
    // Final settle — intentional exception for screenshot stability
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      ...SCREENSHOT_OPTIONS,
      fullPage: false,
      timeout: 30_000,
    });
  });
});
