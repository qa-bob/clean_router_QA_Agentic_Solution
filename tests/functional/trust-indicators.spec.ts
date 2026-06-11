/**
 * tests/functional/trust-indicators.spec.ts
 *
 * Functional tests for the CleanRouter social proof and trust indicators.
 * CleanRouter displays customer stats (50,000+ families, 100,000+ children,
 * 1,200+ five-star reviews) and media mentions (CBS 5, KGUN 9, PC Magazine).
 *
 * These tests verify the trust section is present and legible, not the exact
 * numbers (which may change as the product grows).
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Trust Indicators @functional', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
    await homePage.waitForLoad();
  });

  test('family/customer count stat is visible on homepage @functional', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText);

    // CleanRouter states "50,000+ families" — the number may change but the stat must exist
    expect(
      bodyText,
      'Page should display a family or customer count statistic'
    ).toMatch(/\d[\d,]+\+?\s*(families|customers|users|homes)/i);
  });

  test('children protected stat is visible @functional', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    expect(
      bodyText,
      'Page should display a "children protected" or similar statistic'
    ).toMatch(/\d[\d,]+\+?\s*children|children\s*protected/i);
  });

  test('review count or star rating is visible @functional', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    // Accept any mention of reviews, ratings, or stars — exact copy may vary
    const hasReviews = /\d[\d,.]*\+?\s*reviews?/i.test(bodyText);
    const hasFiveStars = /five[\s-]?stars?/i.test(bodyText);
    const hasRating = /\d[\d,.]*\+?\s*ratings?/i.test(bodyText);
    const hasReviewWord = /\breviews?\b/i.test(bodyText);
    expect(
      hasReviews || hasFiveStars || hasRating || hasReviewWord,
      'Page should display a review count, star rating, or mentions of reviews'
    ).toBeTruthy();
  });

  test('"Trusted by" or social proof heading is present @functional', async ({ page }) => {
    const trustHeading = page.locator('h1, h2, h3').filter({
      hasText: /trusted by|as seen in|our customers|what.*customers.*saying/i,
    }).first();

    if (await trustHeading.count() > 0) {
      await expect(trustHeading).toBeVisible();
    } else {
      const bodyText = await page.evaluate<string>(() => document.body.innerText);
      expect(bodyText).toMatch(/trusted by|customers|reviews/i);
    }
  });

  test('media mentions are present (CBS, PC Magazine, or similar) @functional', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    expect(
      bodyText,
      'Page should display media or news mentions'
    ).toMatch(/cbs|pc magazine|kgun|channel 3|news|press|media/i);
  });

  test('"What Our Customers Are Saying" section or testimonials exist @functional', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    expect(
      bodyText,
      'Page should contain customer testimonials or a reviews section'
    ).toMatch(/customers are saying|testimonial|reviews|five.star|rated/i);
  });

  test('"30-day money-back guarantee" is mentioned @functional', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    expect(
      bodyText,
      'Page should mention the 30-day money-back guarantee'
    ).toMatch(/30.day|money.back|guarantee/i);
  });
});
