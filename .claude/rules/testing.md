---
paths:
  - "tests/**/*.ts"
  - "tests/**/*.spec.ts"
---

# Testing Conventions

## Imports

Always import from the custom fixture, not directly from Playwright:

```typescript
// Correct
import { test, expect } from '@fixtures/site.fixture';

// Wrong
import { test, expect } from '@playwright/test';
```

## Test structure

- One `describe` block per page or feature area
- `describe` block title includes the tag: `'Hero Section @functional'`
- Individual test titles also include the tag: `'hero heading is visible @functional'`
- Use `test.beforeEach` for navigation shared across tests in a describe block

## Tags — required on every test

Every test must have at least one of these tags in both the `describe` title and `test` title:

| Tag | Use for |
|-----|---------|
| `@smoke` | Site loads, title present, no console errors |
| `@navigation` | Nav links, routing, menus, breadcrumbs |
| `@forms` | Form fields, validation, accessibility |
| `@functional` | Business features: FAQ, pricing, features section, CTAs |
| `@visual` | `toHaveScreenshot()` comparisons |
| `@responsive` | Viewport-specific layout checks |
| `@regression` | Critical content that must not change |

## URLs

Never hardcode URLs:

```typescript
// Wrong
await page.goto('http://cleanrouter.com');

// Correct
await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
```

## Waiting

Never use `page.waitForTimeout()`. Use Playwright's auto-waiting:

```typescript
// Wrong
await page.waitForTimeout(3000);

// Correct
await expect(locator).toBeVisible();
await page.waitForLoadState('domcontentloaded');
await page.waitForSelector('.element');
```

## Forms

Never submit forms. Test field interaction and HTML5 validation only.

## Assertions

All `expect()` calls belong in test files, never inside page object methods.
