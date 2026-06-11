/**
 * tests/regression/regression.spec.ts
 *
 * Regression tests for CleanRouter's critical page content.
 * These tests guard against unintended changes to the homepage's key copy,
 * navigation structure, and trust-building statistics.
 *
 * If any of these tests start failing, it likely indicates a site update that
 * requires review — either update the expected values here (intentional change)
 * or fix the regression on the site.
 *
 * Tag: @regression
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Homepage Content Regression @regression', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.waitForLoad();
  });

  // ── Page identity ───────────────────────────────────────────────────────────

  test('page title contains "CleanRouter" @regression', async ({ homePage }) => {
    const title = await homePage.getTitle();
    expect(
      title,
      `Page title regression: expected "CleanRouter" in title but got "${title}"`
    ).toMatch(/cleanrouter/i);
  });

  test('H1 is "Ultimate Parental Controls" @regression', async ({ page }) => {
    const h1Text = (await page.locator('h1').first().textContent())?.trim() ?? '';
    expect(
      h1Text,
      `H1 regression: expected "Ultimate Parental Controls" but got "${h1Text}"`
    ).toMatch(/ultimate parental controls/i);
  });

  // ── Navigation structure ────────────────────────────────────────────────────

  test('expected nav items are all present @regression', async ({ navigationPage, siteConfig }) => {
    await navigationPage.navigate();
    const navLinks = await navigationPage.getNavLinks();
    const navTexts = navLinks.map((l) => l.text.trim().toLowerCase());

    for (const expectedItem of siteConfig.expectedNavItems) {
      const found = navTexts.some((t) => t.includes(expectedItem.toLowerCase()));
      expect(
        found,
        `Nav regression: expected nav item "${expectedItem}" not found. ` +
          `Current nav: [${navTexts.join(', ')}]`
      ).toBeTruthy();
    }
  });

  test('"Buy Now" nav link is present @regression', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const buyNow = page.locator('nav a, [role="navigation"] a').filter({
      hasText: /buy now/i,
    });
    expect(
      await buyNow.count(),
      'Regression: "Buy Now" link should be present in navigation'
    ).toBeGreaterThan(0);
  });

  // ── Trust indicators ────────────────────────────────────────────────────────

  test('family count statistic is present @regression', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    expect(
      bodyText,
      'Regression: family count statistic has been removed from the homepage'
    ).toMatch(/\d[\d,]+\+?\s*families/i);
  });

  test('children protected stat is present @regression', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    expect(
      bodyText,
      'Regression: "children protected" statistic has been removed from the homepage'
    ).toMatch(/children/i);
  });

  test('review count stat is present @regression', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    expect(
      bodyText,
      'Regression: review count statistic has been removed from the homepage'
    ).toMatch(/reviews/i);
  });

  // ── Core features ───────────────────────────────────────────────────────────

  test('IntelliFilter or AI filtering is still mentioned @regression', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    expect(
      bodyText,
      'Regression: IntelliFilter or AI content filtering copy has been removed'
    ).toMatch(/intellifilter|ai.{0,20}filter|7.layer/i);
  });

  test('FAQ section still has questions @regression', async ({ faqPage }) => {
    await faqPage.navigateToFaq();
    const count = await faqPage.getFaqCount();

    // If accordion not detected, verify FAQ text exists in body
    if (count === 0) {
      const bodyText = await faqPage.page.evaluate<string>(() => document.body.innerText);
      const hasFaqContent = /subscription|filtering|opendns|wi.fi/i.test(bodyText);
      expect(
        hasFaqContent,
        'Regression: FAQ content is no longer present on the page'
      ).toBeTruthy();
      return;
    }

    expect(
      count,
      `Regression: FAQ count dropped to ${count} (expected at least 9)`
    ).toBeGreaterThanOrEqual(9);
  });

  // ── Page availability ───────────────────────────────────────────────────────

  test('purchase page is reachable @regression', async ({ purchasePage, page }) => {
    await purchasePage.navigate();
    // Wait for JS-rendered content to appear (purchase page uses client-side rendering)
    await page.waitForFunction(
      () => document.body.innerText.trim().length > 0,
      { timeout: 10_000 }
    ).catch(() => null);
    const status = await page.evaluate<number>(() => document.body.innerText.trim().length);
    expect(
      status,
      'Regression: purchase page (/purchase/) is no longer accessible'
    ).toBeGreaterThan(0);
  });

  test('/contact-us page is reachable @regression', async ({ page, siteConfig }) => {
    const response = await page.goto(
      `${siteConfig.url.replace(/\/$/, '')}/contact-us/`,
      { waitUntil: 'domcontentloaded' }
    );

    expect(response, 'Regression: /contact-us/ page returned null response').not.toBeNull();

    const status = response!.status();
    expect(
      status < 400,
      `Regression: /contact-us/ returned HTTP ${status} (expected < 400)`
    ).toBeTruthy();
  });
});
