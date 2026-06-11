# GitHub Copilot Instructions

This file configures AI coding assistant behavior (GitHub Copilot, Claude Code, etc.)
for the Clean Router QA test suite.

---

## Project Context

This is a **Playwright + TypeScript** regression test suite for `cleanrouter.com` — an
AI-powered parental control Wi-Fi 6 router. All test code follows a **Page Object Model
(POM)** architecture with strict TypeScript.

---

## Architecture Rules

### Page Objects (`src/pages/`)
- Every page class extends `BasePage` from `./base.page`
- Locators are declared as `readonly Locator` properties on the class
- Methods represent user actions: `clickFaqItem()`, `getNavLinks()`
- **Never** put `expect()` inside a page object method
- **Never** use `page.waitForTimeout()` — use Playwright's built-in auto-waiting

### Tests (`tests/`)
- Import `{ test, expect }` from `@fixtures/site.fixture`, **not** from `@playwright/test`
- Use `siteConfig.url` for the base URL, never hardcode `http://cleanrouter.com`
- Tag every test: `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`, or `@regression`
- One `describe` block per page or feature area
- **Never submit forms** — test field interaction and validation only

### Selectors (priority order)
1. `getByRole('button', { name: /text/i })` — ARIA role
2. `getByLabel('...')` — form label
3. `getByText('...', { exact: true })` — visible text
4. `locator('[data-testid="x"]')` — data attribute
5. `locator('#id')` or `locator('[name="x"]')` — stable attributes
6. `locator('.class')` — last resort only

### TypeScript
- Strict mode is on — no implicit `any`
- All properties and return types must be explicitly typed
- Use `async/await` throughout — no `.then()` chains

---

## What to Avoid

- Hardcoded URLs in test bodies
- `page.waitForTimeout()` — use explicit waits or Playwright auto-waiting
- `expect()` inside page object classes
- Submitting forms or creating accounts
- Generic `any` types
- Long comment blocks — prefer self-documenting names

---

## Site-Specific Context (cleanrouter.com)

- **H1:** "Ultimate Parental Controls"
- **Nav links:** Buy Now, Features, Reviews, FAQs, CleanPhone, Blog, My Settings
- **FAQ section:** 10 questions in an accordion (anchor: `#faqs`)
- **Trust stats:** 50,000+ families, 100,000+ children, 1,200+ reviews
- **Contact:** No form — email only at support@cleantechnology.io
- **Purchase:** `/purchase/#Plan_Select`
- **Key CTAs:** "Protect Your Family Today", "Try for FREE today!"
