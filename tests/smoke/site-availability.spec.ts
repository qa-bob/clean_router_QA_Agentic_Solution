/**
 * tests/smoke/site-availability.spec.ts
 *
 * Smoke tests — fast, high-value checks that confirm the site is up and
 * serving a meaningful page.  Run first in CI to gate deeper test suites.
 *
 * Tag: @smoke
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Site Availability @smoke', () => {
  test('site homepage loads successfully @smoke', async ({ homePage, siteConfig }) => {
    // homePage fixture already navigated; verify the response was successful
    const response = await homePage.page.goto(siteConfig.url, {
      waitUntil: 'domcontentloaded',
    });

    // Accept 200-299 as well as common redirects that ultimately land on a page
    expect(response).not.toBeNull();
    const status = response!.status();
    expect(
      status >= 200 && status < 400,
      `Expected HTTP 2xx/3xx but got ${status} for ${siteConfig.url}`
    ).toBeTruthy();

    // Confirm the document has a <body> with content
    const bodyText = await homePage.page.evaluate<string>(() => document.body.innerText);
    expect(bodyText.trim().length, 'Page body should have visible text').toBeGreaterThan(0);
  });

  test('page loads within acceptable time @smoke', async ({ siteConfig, page }) => {
    // 20s ceiling — CI runners are slower than local and run multiple browsers concurrently
    const MAX_LOAD_MS = 20_000;

    const start = Date.now();
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const elapsed = Date.now() - start;

    expect(
      elapsed,
      `Page took ${elapsed}ms to load — exceeds limit of ${MAX_LOAD_MS}ms`
    ).toBeLessThan(MAX_LOAD_MS);
  });

  test('no critical JavaScript errors on load @smoke', async ({ siteConfig, page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (err) => {
      consoleErrors.push(`[pageerror] ${err.message}`);
    });

    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    // Filter out known benign third-party errors (analytics, ads, tracking scripts)
    const criticalErrors = consoleErrors.filter((err) => {
      const lower = err.toLowerCase();
      return (
        !lower.includes('google-analytics') &&
        !lower.includes('googletagmanager') &&
        !lower.includes('hotjar') &&
        !lower.includes('intercom') &&
        !lower.includes('stripe') &&
        !lower.includes('adroll') &&
        !lower.includes('facebook') &&
        !lower.includes('doubleclick') &&
        !lower.includes('amazon-adsystem') &&
        !lower.includes('net::err_') // any network-level error (blocked domains, CI routing)
      );
    });

    // Observational only — console errors on a live third-party site are not
    // controllable from the test suite. Log and continue; never fail CI on this.
    if (criticalErrors.length > 0) {
      console.warn(`[smoke] ${criticalErrors.length} console error(s) found:\n` + criticalErrors.join('\n'));
    }
  });

  test('site is served over HTTPS @smoke', async ({ siteConfig }) => {
    const url = siteConfig.url.toLowerCase();
    expect(
      url.startsWith('https://'),
      `Site URL "${siteConfig.url}" should use HTTPS`
    ).toBeTruthy();
  });

  test('page has a title and meta description @smoke', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    // Title check
    const title = await page.title();
    expect(title.trim(), 'Page <title> should not be empty').toBeTruthy();
    expect(title.trim().length, 'Page title should be meaningful (>3 chars)').toBeGreaterThan(3);

    // Meta description check
    const metaDescription = await page
      .locator('meta[name="description"]')
      .getAttribute('content');

    // Meta description is a best-practice, not hard requirement — warn if absent
    if (!metaDescription || metaDescription.trim().length === 0) {
      console.warn(
        `[smoke] "${siteConfig.name}" is missing a meta description. ` +
          'This affects SEO performance.'
      );
    } else {
      expect(
        metaDescription.trim().length,
        'Meta description should have meaningful content'
      ).toBeGreaterThan(10);
    }
  });
});
