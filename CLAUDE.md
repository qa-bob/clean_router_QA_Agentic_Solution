# QA Agentic Solution — Claude Code Instructions

This repository is a **Playwright + TypeScript regression test suite** for the website defined in `site.config.json`. It follows a **Page Object Model (POM)** architecture and is structured for agentic execution by Claude Code.

See @README.md for full project overview, setup, and architecture.
See @AGENTS.md for the agent catalog and frontmatter reference.
See @Skills.md for the skills/slash-command catalog and frontmatter reference.
See @.github/CONTRIBUTING.md for contributor rules and PR process.

---

## Project Purpose

Build and maintain a comprehensive GUI, functional, and regression test suite for **CleanRouter** (`https://cleanrouter.com`) — an AI-powered parental control Wi-Fi 6 router. Tests must cover every discoverable feature of the site without requiring account creation or actual form submission.

### Site Reference (cleanrouter.com)

| Detail | Value |
|--------|-------|
| H1 | "Ultimate Parental Controls" |
| Nav links | Buy Now, Features, Reviews, FAQs, CleanPhone, Blog, My Settings |
| FAQ count | 10 questions (anchor: `#faqs`) |
| Trust stats | 50,000+ families · 100,000+ children · 1,200+ reviews |
| Contact | No form — email only: support@cleantechnology.io |
| Purchase | `/purchase/#Plan_Select` |
| Key CTAs | "Protect Your Family Today" · "Try for FREE today!" |
| `hasContactForm` | false (`skipForms: true` in site.config.json) |

### Available Agents

See [AGENTS.md](./AGENTS.md) — `site-analyzer` and `test-generator` in `.claude/agents/`.

### Available Skills

See [Skills.md](./Skills.md) — `/analyze-site`, `/generate-full-suite`, `/run-smoke`, `/update-baseline`, `/generate-report`.

---

## Key Files

| File | Purpose |
|------|---------|
| `site.config.json` | Site URL, name, flags (hasContactForm, skipVisual, etc.) |
| `playwright.config.ts` | Playwright projects: desktop, mobile, tablet |
| `src/pages/` | Page Object Model classes, one per page or section |
| `src/fixtures/site.fixture.ts` | Custom Playwright fixtures exposing page objects |
| `src/utils/` | Helpers: link-checker, visual-helper |
| `src/types/` | TypeScript interfaces |
| `tests/smoke/` | @smoke — availability and basic load tests |
| `tests/navigation/` | @navigation — nav links, routing, menus |
| `tests/forms/` | @forms — form fields, validation (no submission) |
| `tests/functional/` | @functional — business logic, user flows |
| `tests/visual/` | @visual — screenshot regression |
| `tests/responsive/` | @responsive — layout at mobile/tablet/desktop |
| `tests/regression/` | @regression — critical content regression |
| `.claude/commands/` | Slash commands for agentic tasks |

---

## Architecture Rules

### Page Object Model
- Every page or major section has its own class in `src/pages/`
- Page classes extend `BasePage` from `./base.page`
- Locators are `readonly Locator` properties on the class
- Methods represent user actions, not assertions
- No `expect()` calls inside page objects — assertions belong in tests

### Tests
- Import page objects via the custom fixture in `src/fixtures/site.fixture.ts`
- Tag every test with at least one of: `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`, `@regression`
- Do not hardcode URLs — always use `baseURL` from Playwright config (which reads `site.config.json`)
- Never submit forms — test field interactions and validation only
- Never create accounts or enter real credentials

### TypeScript
- Strict mode is enabled (`tsconfig.json`)
- All page object properties must be typed
- Run `npx tsc --noEmit` to check for errors before finishing

---

## Available npm Scripts

```bash
npm test                    # Run all tests
npm run test:smoke          # @smoke tests only
npm run test:navigation     # @navigation tests only
npm run test:forms          # @forms tests only
npm run test:visual         # @visual tests only
npm run test:responsive     # @responsive tests only
npm run test:regression     # @regression tests only
npm run baseline            # Update visual snapshots
npm run lint                # ESLint
npm run typecheck           # TypeScript check
```

---

## Slash Commands

| Command | Description |
|---------|-------------|
| `/generate-full-suite` | Analyze the website and generate complete POM + tests |
| `/analyze-site` | Inspect site structure and report pages, forms, and elements |
| `/run-smoke` | Run smoke tests and report results |
| `/update-baseline` | Refresh visual regression baselines |
| `/generate-report` | Generate a test results summary |

---

## When Asked to Write or Update Tests

1. Read `site.config.json` first to get the URL and all flags
2. Use `WebFetch` to inspect the live site before writing any selectors
3. Write real selectors based on actual page HTML, not generic placeholders
4. Create or update the relevant page object class in `src/pages/`
5. Write tests that use the page object, not raw `page.locator()` calls in the test body
6. Run `npx tsc --noEmit` to verify TypeScript compiles cleanly

---

## Test Tagging Reference

| Tag | When to use |
|-----|-------------|
| `@smoke` | Site loads, title present, no console errors |
| `@navigation` | Nav links, routing, menus, breadcrumbs |
| `@forms` | Form fields, validation, accessibility |
| `@functional` | Business features: pricing, search, video, accordion |
| `@visual` | Screenshot regression with `toHaveScreenshot()` |
| `@responsive` | Viewport-specific layout checks |
| `@regression` | Critical content that must not change unexpectedly |

---

## Do Not

- Submit any form
- Create accounts or log in (unless `auth.required: true` in config)
- Hardcode the base URL in tests
- Put assertions inside page object methods
- Use `page.waitForTimeout()` — use `waitForSelector`, `waitFor`, or Playwright auto-waiting instead
- Use `any` type without explicit justification
