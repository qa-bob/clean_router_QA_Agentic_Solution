---
paths:
  - "src/pages/**/*.ts"
  - "tests/**/*.ts"
---

# Selector Strategy

Use selectors in this priority order. Go as high as possible before dropping to lower options.

## Priority Order

1. **ARIA role + accessible name** — most resilient to DOM changes
   ```typescript
   page.getByRole('button', { name: /protect your family/i })
   page.getByRole('link', { name: 'Buy Now' })
   page.getByRole('heading', { name: 'Ultimate Parental Controls' })
   ```

2. **Label text** — for form inputs
   ```typescript
   page.getByLabel('Email address')
   ```

3. **Visible text** — for buttons and links
   ```typescript
   page.getByText('Protect Your Family Today', { exact: true })
   ```

4. **Data test attribute**
   ```typescript
   page.locator('[data-testid="hero-cta"]')
   ```

5. **Stable HTML id**
   ```typescript
   page.locator('#faqs')
   ```

6. **Name attribute** — for form fields
   ```typescript
   page.locator('[name="email"]')
   ```

7. **CSS class** — last resort; fragile when design changes
   ```typescript
   page.locator('.faq-item') // only if no better option exists
   ```

## What to Avoid

- Long chained CSS selectors: `.container > .row > .col:nth-child(2) > p`
- `:nth-child()` or positional selectors that break when items are added
- Text that is likely to change (marketing copy, version numbers)
- XPath — prefer Playwright's built-in locators

## Page Object Declarations

Declare locators as `readonly` class properties, initialized in the constructor:

```typescript
export class FaqPage extends BasePage {
  readonly faqSection: Locator;
  readonly faqItems: Locator;

  constructor(page: Page, config: SiteConfig) {
    super(page, config);
    this.faqSection = page.locator('#faqs, [id*="faq" i], section').filter({
      hasText: /frequently asked/i,
    }).first();
    this.faqItems = page.locator('details, .faq-item, [class*="accordion"]');
  }
}
```
