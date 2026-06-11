import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import type { SiteConfig } from '@site-types/site-config.types';

export class PurchasePage extends BasePage {
  readonly purchaseUrl: string;
  readonly pageHeading: Locator;
  readonly planSection: Locator;
  readonly buyNowLinks: Locator;

  constructor(page: Page, config: SiteConfig) {
    super(page, config);
    this.purchaseUrl = `${config.url.replace(/\/$/, '')}/purchase/`;

    this.pageHeading = page.locator('h1, h2').first();

    this.planSection = page
      .locator('#Plan_Select, [id*="plan" i], [class*="plan" i], [class*="pricing" i]')
      .first();

    this.buyNowLinks = page.locator('a, button').filter({
      hasText: /buy now|get started|checkout|order now|add to cart/i,
    });
  }

  /** Navigate directly to the CleanRouter purchase page. */
  async navigate(): Promise<void> {
    await this.page.goto(this.purchaseUrl, { waitUntil: 'domcontentloaded' });
  }

  /** Navigate to the purchase plan selection anchor. */
  async navigateToPlanSelect(): Promise<void> {
    await this.page.goto(`${this.purchaseUrl}#Plan_Select`, { waitUntil: 'domcontentloaded' });
  }

  /** Returns true if the purchase page has loaded with meaningful content. */
  async isLoaded(): Promise<boolean> {
    try {
      const headingCount = await this.page.locator('h1, h2').count();
      if (headingCount === 0) return false;

      const bodyText = await this.page.evaluate<string>(() => document.body.innerText);
      return bodyText.trim().length > 50;
    } catch {
      return false;
    }
  }

  /** Return the text of the main page heading. */
  async getHeadingText(): Promise<string> {
    if (await this.pageHeading.count() === 0) return '';
    return (await this.pageHeading.textContent())?.trim() ?? '';
  }

  /** Return all CTA links visible on the purchase page. */
  async getBuyNowLinks(): Promise<Locator[]> {
    return this.buyNowLinks.all();
  }

  /** Return true if a plan selection section exists on the page. */
  async hasPlanSection(): Promise<boolean> {
    return (await this.planSection.count()) > 0;
  }
}
