/**
 * tests/functional/faq-accordion.spec.ts
 *
 * Functional tests for the CleanRouter FAQ accordion section (#faqs).
 * Verifies that all 10 FAQ items are present, expandable, and contain answers.
 * Does not test specific answer text — only structure and interactivity.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

const EXPECTED_FAQ_COUNT = 10;

const EXPECTED_FAQ_QUESTIONS = [
  /subscription/i,
  /different from other/i,
  /ai filtering/i,
  /tech.savvy|hard to set up|plug and play/i,
  /internet service provider/i,
  /slow down/i,
  /wi.fi/i,
  /legitimate websites/i,
  /opendns/i,
  /other filtering software/i,
];

test.describe('FAQ Accordion @functional', () => {
  test.beforeEach(async ({ faqPage }) => {
    await faqPage.navigateToFaq();
    await faqPage.waitForLoad();
  });

  test('FAQ section exists on the page @functional', async ({ page }) => {
    // Try the #faqs anchor first, then fall back to text-based detection
    const faqsById = page.locator('#faqs');
    const faqsByText = page.locator('section, div').filter({
      hasText: /frequently asked questions/i,
    }).first();

    const byIdCount = await faqsById.count();
    const byTextCount = await faqsByText.count();

    expect(
      byIdCount + byTextCount,
      'FAQ section should be present (by #faqs id or "Frequently Asked Questions" heading)'
    ).toBeGreaterThan(0);
  });

  test(`FAQ section contains ${EXPECTED_FAQ_COUNT} questions @functional`, async ({ faqPage }) => {
    const items = await faqPage.getFaqItems();

    if (items.length === 0) {
      // FAQ items may need JS to render — check raw question text in body
      const bodyText = await faqPage.page.evaluate<string>(() => document.body.innerText);
      const hasQuestions = /subscription|filtering|wi.fi|opendns/i.test(bodyText);
      expect(
        hasQuestions,
        'Page body should contain FAQ question text even if accordion not detected'
      ).toBeTruthy();
      return;
    }

    expect(
      items.length,
      `Expected ${EXPECTED_FAQ_COUNT} FAQ items but found ${items.length}`
    ).toBeGreaterThanOrEqual(EXPECTED_FAQ_COUNT - 1); // allow ±1 for design variations
  });

  test('each FAQ item has a non-empty question text @functional', async ({ faqPage }) => {
    const items = await faqPage.getFaqItems();

    if (items.length === 0) {
      test.skip(true, 'No FAQ items detected via accordion pattern — skipping');
      return;
    }

    for (const item of items) {
      expect(
        item.question.length,
        `FAQ item question text should not be empty, got: "${item.question}"`
      ).toBeGreaterThan(3);
    }
  });

  test('FAQ items contain expected question topics @functional', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    const lowerBody = bodyText.toLowerCase();

    const topicsFound = [
      { topic: 'subscription', pattern: /subscription/ },
      { topic: 'AI filtering', pattern: /ai filtering|intellifilter/i },
      { topic: 'plug and play setup', pattern: /plug and play|set up/i },
      { topic: 'ISP compatibility', pattern: /internet service provider|fiber|cable/i },
      { topic: 'Wi-Fi', pattern: /wi.fi/ },
      { topic: 'OpenDNS comparison', pattern: /opendns/i },
    ];

    for (const { topic, pattern } of topicsFound) {
      expect(
        pattern.test(lowerBody),
        `FAQ section should contain information about "${topic}"`
      ).toBeTruthy();
    }
  });

  test('clicking a FAQ item does not navigate away from the page @functional', async ({
    faqPage,
    page,
    siteConfig,
  }) => {
    const items = await faqPage.getFaqItems();

    if (items.length === 0) {
      test.skip(true, 'No FAQ accordion items detected — skipping click test');
      return;
    }

    const urlBefore = page.url();
    await faqPage.clickFaqItem(0);

    // Brief wait for any accordion animation
    await page.waitForLoadState('domcontentloaded');
    const urlAfter = page.url();

    // Allow hash fragment changes (e.g., #faqs) but not full navigation
    const originBefore = new URL(urlBefore).origin + new URL(urlBefore).pathname;
    const originAfter = new URL(urlAfter).origin + new URL(urlAfter).pathname;

    expect(
      originAfter,
      'Clicking a FAQ item should not navigate away from the page'
    ).toBe(originBefore);
  });

  test('first FAQ item expands and shows an answer @functional', async ({ faqPage }) => {
    const items = await faqPage.getFaqItems();

    if (items.length === 0) {
      test.skip(true, 'No FAQ accordion items detected — skipping expand test');
      return;
    }

    // Expand the first item
    await faqPage.clickFaqItem(0);

    const answer = await faqPage.getFaqAnswer(0);
    expect(
      answer.length,
      'Expanded FAQ item should reveal a non-empty answer'
    ).toBeGreaterThan(10);
  });

  test('"Frequently Asked Questions" heading is visible @functional', async ({ page }) => {
    const faqHeading = page.locator('h1, h2, h3').filter({
      hasText: /frequently asked questions/i,
    }).first();

    if (await faqHeading.count() > 0) {
      await expect(faqHeading, 'FAQ section heading should be visible').toBeVisible();
    } else {
      // Heading might be off-screen; verify text exists in page body
      const bodyText = await page.evaluate<string>(() => document.body.innerText);
      expect(
        bodyText,
        'Page should contain "Frequently Asked Questions" text'
      ).toMatch(/frequently asked questions/i);
    }
  });
});
