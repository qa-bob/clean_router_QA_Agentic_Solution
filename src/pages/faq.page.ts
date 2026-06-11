import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import type { SiteConfig } from '@site-types/site-config.types';

export interface FaqItem {
  question: string;
  locator: Locator;
}

export class FaqPage extends BasePage {
  readonly faqSection: Locator;
  readonly faqItems: Locator;

  constructor(page: Page, config: SiteConfig) {
    super(page, config);

    // CleanRouter uses an anchor #faqs — try multiple selector patterns
    this.faqSection = page
      .locator('#faqs, [id*="faq" i], section')
      .filter({ hasText: /frequently asked/i })
      .first();

    // FAQ items: <details> elements are common for accordion; fall back to
    // wrapper divs with question text inside them
    this.faqItems = page.locator(
      'details, ' +
      '.faq-item, .faq__item, ' +
      '[class*="accordion" i] > *, ' +
      '[class*="faq" i] > *'
    );
  }

  /** Navigate to the homepage and scroll to the FAQ section. */
  async navigateToFaq(): Promise<void> {
    await this.page.goto(`${this.url}#faqs`, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Return an array of FAQ item objects with the question text and locator.
   * Handles both <details>/<summary> and div-based accordion patterns.
   */
  async getFaqItems(): Promise<FaqItem[]> {
    // Try <details> pattern first
    const detailsItems = this.page.locator('details');
    const detailsCount = await detailsItems.count();

    if (detailsCount > 0) {
      const items: FaqItem[] = [];
      for (let i = 0; i < detailsCount; i++) {
        const item = detailsItems.nth(i);
        const summary = item.locator('summary');
        const question = (await summary.textContent())?.trim() ?? '';
        if (question) {
          items.push({ question, locator: item });
        }
      }
      return items;
    }

    // Fall back: look for elements with heading-like text inside FAQ wrappers
    const faqWrappers = this.page.locator(
      '[class*="faq" i] [class*="question" i], ' +
      '[class*="faq" i] h3, ' +
      '[class*="faq" i] h4, ' +
      '[class*="accordion" i] [role="button"], ' +
      '[class*="accordion" i] button'
    );

    const count = await faqWrappers.count();
    const items: FaqItem[] = [];

    for (let i = 0; i < count; i++) {
      const el = faqWrappers.nth(i);
      const question = (await el.textContent())?.trim() ?? '';
      if (question) {
        items.push({ question, locator: el });
      }
    }

    return items;
  }

  /**
   * Click a FAQ item by zero-based index to expand it.
   * Works for both <details> and button-based accordions.
   */
  async clickFaqItem(index: number): Promise<void> {
    const items = await this.getFaqItems();
    if (index >= items.length) {
      throw new Error(`FAQ item index ${index} out of range (${items.length} items found)`);
    }
    await items[index].locator.click();
  }

  /**
   * Return the answer text for a FAQ item by index.
   * For <details>: returns text content excluding the <summary>.
   * For button accordions: returns the sibling/child answer panel text.
   */
  async getFaqAnswer(index: number): Promise<string> {
    const detailsItems = this.page.locator('details');
    const detailsCount = await detailsItems.count();

    if (detailsCount > 0 && index < detailsCount) {
      const detail = detailsItems.nth(index);
      // Get full text minus the summary text
      const fullText = (await detail.textContent())?.trim() ?? '';
      const summaryText = (await detail.locator('summary').textContent())?.trim() ?? '';
      return fullText.replace(summaryText, '').trim();
    }

    // For non-details accordions, look for the adjacent answer panel
    const answers = this.page.locator(
      '[class*="faq" i] [class*="answer" i], ' +
      '[class*="faq" i] [class*="content" i], ' +
      '[class*="accordion" i] [role="region"]'
    );

    if (await answers.count() > index) {
      return (await answers.nth(index).textContent())?.trim() ?? '';
    }

    return '';
  }

  /**
   * Returns true if a FAQ item is expanded (open attribute for <details>,
   * or aria-expanded="true" for button accordions).
   */
  async isFaqExpanded(index: number): Promise<boolean> {
    const detailsItems = this.page.locator('details');
    const detailsCount = await detailsItems.count();

    if (detailsCount > 0 && index < detailsCount) {
      const isOpen = await detailsItems.nth(index).getAttribute('open');
      return isOpen !== null;
    }

    const buttons = this.page.locator('[class*="faq" i] button, [class*="accordion" i] button');
    if (await buttons.count() > index) {
      const ariaExpanded = await buttons.nth(index).getAttribute('aria-expanded');
      return ariaExpanded === 'true';
    }

    return false;
  }

  /** Returns the total number of FAQ items found on the page. */
  async getFaqCount(): Promise<number> {
    const items = await this.getFaqItems();
    return items.length;
  }
}
