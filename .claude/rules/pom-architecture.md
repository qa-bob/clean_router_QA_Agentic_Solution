---
paths:
  - "src/pages/**/*.ts"
  - "src/fixtures/**/*.ts"
---

# Page Object Model Architecture

## Class Structure

Every page class must:
- Extend `BasePage` from `./base.page`
- Declare all locators as `readonly Locator` properties
- Initialize locators in the constructor
- Implement methods that represent **user actions**, not assertions

```typescript
import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import type { SiteConfig } from '@site-types/site-config.types';

export class ExamplePage extends BasePage {
  readonly primaryHeading: Locator;
  readonly submitButton: Locator;

  constructor(page: Page, config: SiteConfig) {
    super(page, config);
    this.primaryHeading = page.locator('h1').first();
    this.submitButton = page.getByRole('button', { name: /submit/i });
  }

  async getHeadingText(): Promise<string> {
    return (await this.primaryHeading.textContent()) ?? '';
  }

  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }
}
```

## Strict Rules

- `expect()` is NEVER called inside a page object method
- Methods return data or perform actions — they do not assert
- If a page needs a non-root URL, override `navigate()`:
  ```typescript
  async navigate(): Promise<void> {
    await this.page.goto(`${this.url}/purchase/`, { waitUntil: 'domcontentloaded' });
  }
  ```

## Fixture Registration

Every new page object class must be registered in `src/fixtures/site.fixture.ts`:

```typescript
import { MyNewPage } from '@pages/my-new.page';

export interface Fixtures {
  myNewPage: MyNewPage;
  // ... existing fixtures
}

export const test = base.extend<Fixtures>({
  myNewPage: async ({ page, siteConfig }, use) => {
    const myNewPage = new MyNewPage(page, siteConfig);
    await use(myNewPage);
  },
  // ... existing fixtures
});
```

## Inheritance

```
BasePage
  ├── HomePage
  ├── NavigationPage
  ├── ContactFormPage
  ├── FaqPage
  └── PurchasePage
```

Do not skip BasePage — always extend it, even for simple page objects. The shared
`navigate()`, `waitForLoad()`, `getTitle()`, and `isResponsive()` methods are used
across the test suite.
