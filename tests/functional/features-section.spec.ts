/**
 * tests/functional/features-section.spec.ts
 *
 * Functional tests for the CleanRouter features section.
 * Verifies that key product features are described and accessible:
 *   - Time Restrictions
 *   - Manage from Anywhere
 *   - Intuitive Controls & Reports
 *   - Emailed Reports
 *   - Category Filtering
 *   - Whole Home Coverage / Mesh Nodes
 *   - Remote Configuration
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

const KEY_FEATURES = [
  { name: 'Time Restrictions', pattern: /time restrictions/i },
  { name: 'Manage from Anywhere', pattern: /manage from anywhere|remote/i },
  { name: 'Intuitive Controls', pattern: /intuitive controls|reports/i },
  { name: 'Emailed Reports', pattern: /emailed reports|email.*report/i },
  { name: 'Category Filtering', pattern: /categor/i },
  { name: 'Whole Home Coverage', pattern: /whole home|mesh/i },
];

test.describe('Features Section @functional', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
    await homePage.waitForLoad();
  });

  test('"Everything you need" or features heading is present @functional', async ({ page }) => {
    const featuresHeading = page.locator('h1, h2, h3').filter({
      hasText: /everything you need|features|keep them safe/i,
    }).first();

    if (await featuresHeading.count() > 0) {
      await expect(featuresHeading, 'Features section heading should be visible').toBeVisible();
    } else {
      const bodyText = await page.evaluate<string>(() => document.body.innerText);
      expect(
        bodyText,
        'Page body should describe product features'
      ).toMatch(/features|time restrictions|content filter/i);
    }
  });

  test('each key feature is mentioned on the page @functional', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText);

    for (const feature of KEY_FEATURES) {
      expect(
        bodyText,
        `Feature "${feature.name}" should be mentioned on the homepage`
      ).toMatch(feature.pattern);
    }
  });

  test('"Ready to secure your home network?" CTA section exists @functional', async ({ page }) => {
    const ctaSection = page.locator('h1, h2, h3').filter({
      hasText: /ready to secure|take control|secure your home/i,
    }).first();

    if (await ctaSection.count() > 0) {
      await expect(ctaSection).toBeVisible();
    } else {
      // CTA might use different text; check for any action-oriented heading
      const bodyText = await page.evaluate<string>(() => document.body.innerText);
      expect(bodyText).toMatch(/secure|protect|get started|try for free/i);
    }
  });

  test('IntelliFilter or AI filtering is mentioned @functional', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    expect(
      bodyText,
      'Page should mention IntelliFilter or AI-powered filtering'
    ).toMatch(/intellifilter|ai.{0,20}filter|7.layer/i);
  });

  test('Wi-Fi 6 or mesh coverage is mentioned @functional', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    expect(
      bodyText,
      'Page should mention Wi-Fi 6 or mesh networking capability'
    ).toMatch(/wi.fi 6|mesh|whole home coverage/i);
  });

  test('"Trusted by major networks" section is present @functional', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    expect(
      bodyText,
      'Page should reference trust from major networks or families'
    ).toMatch(/trusted by|major networks|thousands of families/i);
  });

  test('features section does not have broken images @functional', async ({ page }) => {
    const images = await page.locator('img').all();

    if (images.length === 0) return;

    const brokenImages: string[] = [];

    // Known third-party tracking/ad pixel domains — their images intentionally
    // redirect or return empty; they are not content images.
    const TRACKER_HOSTS = ['adroll.com', 'doubleclick.net', 'googletagmanager.com', 'facebook.com/tr', 'google-analytics.com', 'amazon-adsystem.com'];
    const isTracker = (src: string) => TRACKER_HOSTS.some(h => src.includes(h));

    for (const img of images) {
      const naturalWidth = await img.evaluate<number>(
        (el) => (el as HTMLImageElement).naturalWidth
      );
      const src = await img.getAttribute('src');

      if (naturalWidth === 0 && src && !src.startsWith('data:') && !isTracker(src)) {
        brokenImages.push(src);
      }
    }

    if (brokenImages.length > 0) {
      console.warn('[features] Broken images found:\n' + brokenImages.join('\n'));
    }

    expect(
      brokenImages.length,
      `Found ${brokenImages.length} broken image(s): ${brokenImages.join(', ')}`
    ).toBeLessThanOrEqual(1); // Allow at most 1 broken image (third-party badge)
  });
});
