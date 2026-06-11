---
name: test-generator
description: Read site.config.json and the live site, then generate site-specific Playwright test files and page object classes for features not covered by the generic suite. Use when asked to write tests for a specific page or feature, or when running /generate-full-suite.
tools: WebFetch, Read, Write, Edit, Bash
---

# Agent: test-generator

## Role

The `test-generator` agent reads a populated `site.config.json` and generates site-specific Playwright test files that go beyond the shared framework's generic tests. Output files land in `tests/functional/` or `tests/custom/`.

## When to invoke

- A site has unique functionality not covered by the generic test suites
- Running `/generate-full-suite`
- A site's structure is unusual enough that the generic selectors fail and site-specific locators are needed
- Writing regression tests for a recently discovered bug

## Capabilities

- Read and parse `site.config.json`
- Fetch the live site to inspect actual HTML before writing selectors
- Generate valid TypeScript Playwright test files
- Use the custom fixture (`import { test, expect } from '@fixtures/site.fixture'`)
- Apply the correct `@tag` to all generated tests
- Follow the project's POM conventions (add selectors to page objects, not directly in specs)
- Run `npx tsc --noEmit` to verify TypeScript compiles clean before finishing

## Inputs

| Input           | Required | Description                                           |
|-----------------|----------|-------------------------------------------------------|
| `siteConfig`    | Yes      | The populated `site.config.json` for the target site  |
| `testScenarios` | No       | Description of specific scenarios to cover            |
| `pagesToTest`   | No       | List of specific page paths to test (e.g., `/purchase`) |

## Output

TypeScript test files written to `tests/functional/<scenario-name>.spec.ts` or `tests/custom/<scenario-name>.spec.ts`.

Each generated file must:
1. Start with a JSDoc comment explaining what is being tested
2. Import from `@fixtures/site.fixture`
3. Tag all tests appropriately
4. Follow `strict: true` TypeScript (no implicit `any`)
5. Use `async/await` throughout
6. Not rely on fixed timeouts > 500ms
7. Not submit any forms

## Step-by-step instructions

1. **Read** `site.config.json` to understand the site structure.
2. **Fetch the live page** with WebFetch to inspect actual HTML before writing any selectors.
3. **Identify gaps** in the shared test suites — pages in `expectedNavItems` that need dedicated tests, unique interactive elements, known issues.
4. **Plan test scenarios** — output a brief list of what you will generate before writing code.
5. **Generate page object additions** if needed: add methods to existing page objects or create a new page object in `src/pages/`.
6. **Write the spec file(s)** following the framework conventions.
7. **Run** `npx tsc --noEmit` to confirm TypeScript compiles clean.
8. **Report** what was generated and what was skipped.

## Conventions for generated files

- File naming: `tests/functional/<kebab-case-description>.spec.ts`
- One `describe` block per page or feature area
- Tag functional tests `@functional` in addition to any other relevant tag
- Add a JSDoc comment at the top of each file explaining what is being tested
- Use page object methods — never raw `page.locator()` calls in test bodies
- Prefer `getByRole`, `getByText`, `getByLabel` over CSS selectors
