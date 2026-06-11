# Contributing

Thank you for contributing to the Clean Router QA test suite. This guide covers
everything you need to write, review, and merge test code.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Writing Tests](#writing-tests)
- [Writing Page Objects](#writing-page-objects)
- [Selectors](#selectors)
- [Tagging](#tagging)
- [TypeScript Rules](#typescript-rules)
- [Pull Request Process](#pull-request-process)

---

## Getting Started

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Run the full suite to confirm everything passes locally
npm test

# Static analysis
npm run typecheck
npm run lint
```

---

## Architecture

This project follows a strict **Page Object Model (POM)** with OOP principles.

```
src/pages/              Page Object classes — one per page or major section
  base.page.ts          BasePage — extend this for every new page object
  home.page.ts          Homepage
  navigation.page.ts    Navigation
  contact.page.ts       Contact/support page
  faq.page.ts           FAQ accordion section
  purchase.page.ts      Purchase/checkout page

src/fixtures/
  site.fixture.ts       Custom Playwright fixtures that expose page objects to tests

tests/                  Spec files organized by tag category
```

**Key rules:**
- Every spec file imports from `@fixtures/site.fixture`, not from `@playwright/test` directly
- Page classes extend `BasePage` from `./base.page`
- Locators are `readonly Locator` properties declared on the class
- Methods represent **user actions** — `clickFaqItem()`, `getNavLinks()`
- `expect()` belongs in test files, never in page objects

---

## Writing Tests

### File location

| Tag | Directory |
|-----|-----------|
| `@smoke` | `tests/smoke/` |
| `@navigation` | `tests/navigation/` |
| `@forms` | `tests/forms/` |
| `@functional` | `tests/functional/` |
| `@visual` | `tests/visual/` |
| `@responsive` | `tests/responsive/` |
| `@regression` | `tests/regression/` |

### File naming

Use `kebab-case-description.spec.ts`. One `describe` block per page or feature area.

### Template

```typescript
import { test, expect } from '@fixtures/site.fixture';

test.describe('Feature Name @functional', () => {
  test.beforeEach(async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
  });

  test('describes what passes @functional', async ({ page }) => {
    // Arrange: use page objects
    // Act: user-facing interactions
    // Assert: expect() calls here, not in page objects
  });
});
```

### What NOT to do in tests

```typescript
// Bad — hardcoded URL
await page.goto('http://cleanrouter.com');

// Good — use baseURL from config
await page.goto(siteConfig.url);

// Bad — raw locator in test body
await page.locator('.hero-title').click();

// Good — use page object method
await homePage.clickHeroCTA();

// Bad — fixed timeout
await page.waitForTimeout(3000);

// Good — Playwright auto-waiting
await expect(element).toBeVisible();

// Bad — form submission
await page.locator('button[type="submit"]').click();
// Contact form tests must NOT submit
```

---

## Writing Page Objects

### File location

`src/pages/<page-name>.page.ts`

### Minimal example

```typescript
import { type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export class MyPage extends BasePage {
  readonly heroHeading: Locator;
  readonly ctaButton: Locator;

  constructor(page, config) {
    super(page, config);
    this.heroHeading = page.locator('h1').first();
    this.ctaButton = page.getByRole('link', { name: /protect your family/i });
  }

  async getHeadingText(): Promise<string> {
    return (await this.heroHeading.textContent()) ?? '';
  }

  async clickCTA(): Promise<void> {
    await this.ctaButton.click();
  }
}
```

### Rules

- Use `readonly` for all locator properties
- Prefer semantic selectors: `getByRole`, `getByText`, `getByLabel`
- Fall back to `locator()` with stable attributes (`id`, `name`, `data-*`)
- Avoid fragile selectors: positional CSS (`nth-child`), long class chains
- Never call `expect()` inside a page object method

---

## Selectors

Priority order (most preferred first):

1. `getByRole('button', { name: /text/i })` — ARIA role + accessible name
2. `getByLabel('Email address')` — label text
3. `getByText('Exact text', { exact: true })` — visible text
4. `locator('[data-testid="x"]')` — data attribute
5. `locator('#id')` — stable HTML id
6. `locator('[name="field"]')` — name attribute (forms)
7. `locator('.css-class')` — CSS class (last resort — fragile)

---

## Tagging

Every test must have at least one tag. Tags appear in both the `describe` block and the
individual `test()` call so they appear in reports:

```typescript
test.describe('Hero Section @functional', () => {
  test('hero heading is visible @functional', async () => { ... });
  test('hero heading is also smoke-level @smoke @functional', async () => { ... });
});
```

---

## TypeScript Rules

- Strict mode is enabled — no implicit `any`
- All page object properties must be typed
- Run `npx tsc --noEmit` before opening a PR — it must pass clean

---

## Pull Request Process

1. Branch from `main`: `git checkout -b feat/describe-change`
2. Write tests and page objects following this guide
3. Run `npm run typecheck` — zero errors
4. Run `npm run lint` — zero errors
5. Run `npm test` — all tests pass (or document expected failures)
6. Open a PR against `main` using the PR template
7. A reviewer will check:
   - POM conventions followed
   - Tags present
   - No hardcoded URLs or form submissions
   - TypeScript clean
8. Merge after approval

---

## Questions?

Open a GitHub issue using the [Test Request](.github/ISSUE_TEMPLATE/test_request.md) template,
or ask in the project chat.
