# Clean Router — QA Agentic Solution

> Playwright + TypeScript regression test suite for [cleanrouter.com](https://cleanrouter.com) — the AI-powered parental control Wi-Fi 6 router.
> Built with a **Page Object Model (POM)** architecture and driven by Claude Code agentic workflows.

---

## Contents

1. [Purpose](#1-purpose)
2. [Tech Stack](#2-tech-stack)
3. [Prerequisites & Setup](#3-prerequisites--setup)
4. [Running Tests](#4-running-tests)
5. [Architecture: POM + OOP](#5-architecture-pom--oop)
6. [Test Suite Overview](#6-test-suite-overview)
7. [Claude Code Initialization](#7-claude-code-initialization)
8. [Agents](#8-agents)
9. [Skills (Slash Commands)](#9-skills-slash-commands)
10. [Rules](#10-rules)
11. [GitHub Integration (.github/)](#11-github-integration-github)
12. [Contributor Rules](#12-contributor-rules)
13. [CI/CD](#13-cicd)

---

## 1. Purpose

This repository provides a complete, **agentic** regression test suite for `cleanrouter.com`. Coverage includes:

| Category | What's Tested |
|----------|--------------|
| Smoke | Site reachability, HTTP status, console errors, title/meta |
| Navigation | All nav links resolve, mobile menu toggle, logo link |
| Forms | Contact page fields and validation (no form submission) |
| Functional | Hero content, FAQ accordion, features section, trust indicators, purchase page |
| Visual Regression | Full-page screenshots across desktop/mobile/tablet |
| Responsive | Layout integrity at three viewport sizes |
| Regression | Cross-cutting checks — critical copy, stat counts, key headings |

Tests are tagged, modular, and can be run selectively. The framework is designed to be maintained by Claude Code agents — see [AGENTS.md](./AGENTS.md) and [Skills.md](./Skills.md).

### Company Profile

| Field | Details |
|-------|---------|
| **Company** | Clean Router |
| **Product** | AI-powered parental control Wi-Fi 6 router with IntelliFilter™ content filtering |
| **Website** | [https://cleanrouter.com](https://cleanrouter.com) |
| **CEO** | Spencer Thomason |
| **Founded** | 2010 |
| **Location** | Gilbert, AZ |
| **Customers** | 50,000+ families, 100,000+ children protected |

---

## 2. Tech Stack

| Tool | Purpose |
|------|---------|
| [Playwright](https://playwright.dev) | Browser automation and assertions |
| TypeScript (strict) | Type-safe test and page object code |
| Page Object Model (POM) | Encapsulates page interactions in reusable, typed classes |
| OOP patterns | Inheritance via `BasePage`, single responsibility per page class |
| [Claude Code](https://code.claude.com) | AI-assisted test generation, site analysis, and maintenance |
| GitHub Actions | CI/CD pipeline for automated test runs on push and PR |

---

## 3. Prerequisites & Setup

### Prerequisites

- **Node.js** 18 or later — `node --version`
- **npm** 9 or later — bundled with Node.js
- **Git**
- **Claude Code** (optional, for AI-assisted workflows) — [code.claude.com](https://code.claude.com)

### Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd clean_router_QA_Agentic_Solution

# 2. Install Node dependencies
npm install

# 3. Install Playwright browsers (Chromium only, recommended)
npx playwright install chromium

# Or install all browsers with system dependencies
npx playwright install --with-deps

# 4. Verify setup — run smoke tests
npm run test:smoke
```

---

## 4. Running Tests

```bash
# Run the full test suite
npm test

# Run by tag
npm run test:smoke          # @smoke — fast availability checks
npm run test:navigation     # @navigation — nav links and routing
npm run test:forms          # @forms — contact page fields (skipped for this site)
npm run test:functional     # @functional — feature-level tests
npm run test:visual         # @visual — screenshot regression
npm run test:responsive     # @responsive — viewport layout
npm run test:regression     # @regression — cross-cutting regression

# Run in headed browser (useful for debugging)
npm run test:headed

# Update visual regression baselines
npm run baseline

# Static analysis
npm run lint                # ESLint
npm run typecheck           # TypeScript strict check (zero errors required)
```

### View Test Reports

```bash
npx playwright show-report
# or
npm run report
```

The HTML report opens in your browser and shows pass/fail status, screenshots, videos, and traces for failures.

---

## 5. Architecture: POM + OOP

All page interactions are encapsulated in **Page Object** classes in `src/pages/`. Tests import page objects via fixtures — no raw `page.locator()` calls in test bodies.

```
BasePage (src/pages/base.page.ts)
  navigate(), waitForLoad(), getTitle(), isResponsive(), takeScreenshot()
  │
  ├── HomePage (home.page.ts)
  │     getHeroText(), getCTAButtons(), getMainHeading(), isLoaded()
  │
  ├── NavigationPage (navigation.page.ts)
  │     getNavLinks(), clickNavItem(), getMobileMenuToggle(), openMobileMenu()
  │     checkAllNavLinksReachable()
  │
  ├── ContactFormPage (contact.page.ts)
  │     findContactForm(), getFormFields(), hasEmailField(), hasSubmitButton()
  │     fillForm() (no submit)
  │
  ├── FaqPage (faq.page.ts)
  │     navigateToFaq(), getFaqItems(), clickFaqItem(), getFaqAnswer()
  │     isFaqExpanded(), getFaqCount()
  │
  └── PurchasePage (purchase.page.ts)
        navigate(), navigateToPlanSelect(), isLoaded(), getHeadingText()
        getBuyNowLinks(), hasPlanSection()
```

**OOP rules:**
- Page classes extend `BasePage` — no exceptions
- Locators are `readonly Locator` properties initialized in the constructor
- Methods represent user actions, not assertions
- `expect()` belongs in test files, never in page objects

---

## 6. Test Suite Overview

```
tests/
├── smoke/                    # @smoke — run first in CI
│   └── site-availability.spec.ts
├── navigation/               # @navigation
│   └── nav-links.spec.ts
├── forms/                    # @forms — skipped (skipForms: true)
│   └── contact-form.spec.ts
├── functional/               # @functional
│   ├── hero-content.spec.ts
│   ├── faq-accordion.spec.ts
│   ├── features-section.spec.ts
│   ├── trust-indicators.spec.ts
│   └── purchase-page.spec.ts
├── visual/                   # @visual — screenshot regression
│   └── visual-regression.spec.ts
├── responsive/               # @responsive
│   └── layout.spec.ts
└── regression/               # @regression — critical content guard
    └── regression.spec.ts
```

| Tag | Use for |
|-----|---------|
| `@smoke` | Site loads, title present, no console errors |
| `@navigation` | Nav links, routing, menus, breadcrumbs |
| `@forms` | Form fields, validation, accessibility |
| `@functional` | Business features: FAQ, pricing, features section, CTAs |
| `@visual` | `toHaveScreenshot()` comparisons |
| `@responsive` | Viewport-specific layout checks |
| `@regression` | Critical content that must not change |

---

## 7. Claude Code Initialization

This repo is initialized for Claude Code per the [official docs](https://docs.anthropic.com/en/docs/claude-code/overview).

### What's included

| File / Directory | Purpose |
|-----------------|---------|
| `CLAUDE.md` | Project instructions loaded by Claude Code every session |
| `AGENTS.md` | Human-readable agent catalog (see Section 8) |
| `Skills.md` | Human-readable skills catalog (see Section 9) |
| `.claude/settings.json` | Project-level permissions (committed, shared with team) |
| `.claude/settings.local.json` | Personal settings override (gitignored, not committed) |
| `.claude/agents/site-analyzer.md` | Site crawl + `site.config.json` generator |
| `.claude/agents/test-generator.md` | Playwright test + POM generator |
| `.claude/commands/analyze-site.md` | `/analyze-site` slash command |
| `.claude/commands/generate-full-suite.md` | `/generate-full-suite` slash command |
| `.claude/commands/run-smoke.md` | `/run-smoke` slash command |
| `.claude/commands/update-baseline.md` | `/update-baseline` slash command |
| `.claude/commands/generate-report.md` | `/generate-report` slash command |
| `.claude/rules/pom-architecture.md` | POM architecture rules (applies to `src/pages/**`) |
| `.claude/rules/selectors.md` | Selector strategy rules (applies to `src/pages/**`, `tests/**`) |
| `.claude/rules/testing.md` | Test authoring conventions (applies to `tests/**`) |

### CLAUDE.md

`CLAUDE.md` is the project instruction file loaded by Claude Code at the start of every session. It contains:
- Project purpose and site reference
- Key file index
- Architecture rules (POM, test conventions, TypeScript)
- Available npm scripts
- Slash command reference
- "Do not" list

Keep `CLAUDE.md` **under 200 lines** — longer files consume context and reduce adherence.

### Personal local settings

Create these files locally (both are gitignored):

```bash
# Personal Claude Code settings for this project
touch CLAUDE.local.md

# Personal permission overrides
touch .claude/settings.local.json
```

`CLAUDE.local.md` is a personal note file — add your own reminders, preferred workflows, or temporary instructions. It is merged with `CLAUDE.md` in your local sessions but is not committed.

### Rules

Rules in `.claude/rules/` are path-scoped instruction files. They are automatically applied when Claude Code opens matching files:

| Rule file | Applies when editing |
|-----------|---------------------|
| `pom-architecture.md` | Any file in `src/pages/**` |
| `selectors.md` | Any file in `src/pages/**` or `tests/**` |
| `testing.md` | Any file in `tests/**` |

---

## 8. Agents

Claude Code subagents in `.claude/agents/` run in isolated context windows with custom prompts and restricted tool access. See [AGENTS.md](./AGENTS.md) for the full catalog, frontmatter reference, and instructions for adding new agents.

| Agent | Purpose | Invocation |
|-------|---------|-----------|
| `site-analyzer` | Crawls the live site and produces a `site.config.json` | `/analyze-site` or ask Claude to update the config |
| `test-generator` | Generates site-specific Playwright test files + POM additions | `/generate-full-suite` or ask Claude to write tests |

---

## 9. Skills (Slash Commands)

Skills in `.claude/commands/` are on-demand workflows invoked with `/command-name`. See [Skills.md](./Skills.md) for the full catalog, frontmatter reference, and instructions for adding new skills.

| Command | Description |
|---------|-------------|
| `/analyze-site` | Inspect site structure and report pages, forms, elements |
| `/generate-full-suite` | Analyze the site and generate complete POM + tests |
| `/run-smoke` | Run smoke tests and report results |
| `/update-baseline` | Refresh visual regression baselines |
| `/generate-report` | Generate a test results summary |

---

## 10. Rules

Rules in `.claude/rules/` enforce coding standards automatically when matching files are open:

| Rule | Scope | Summary |
|------|-------|---------|
| `pom-architecture.md` | `src/pages/**` | POM class structure, constructor pattern, no `expect()` in page objects |
| `selectors.md` | `src/pages/**`, `tests/**` | Selector priority order; prefer `getByRole` / `getByLabel` over CSS class selectors |
| `testing.md` | `tests/**` | Import from fixture, required tags, no hardcoded URLs, no `waitForTimeout()` |

---

## 11. GitHub Integration (.github/)

The `.github/` directory contains GitHub-specific configuration for this project.

```
.github/
├── workflows/
│   └── playwright.yml            # CI: run full suite on push/PR to main
├── ISSUE_TEMPLATE/
│   ├── bug_report.md             # Bug report template (failing/flaky tests)
│   └── test_request.md           # Request new test coverage
├── PULL_REQUEST_TEMPLATE.md      # PR checklist (typecheck, lint, tags, POM rules)
├── CONTRIBUTING.md               # Full contributor guide
└── copilot-instructions.md       # AI coding assistant context (Copilot, Claude Code)
```

### `workflows/playwright.yml`

Runs on every push to `main` and every PR targeting `main`:
1. Checkout code
2. Setup Node.js 20 + npm cache
3. `npm ci` — install dependencies
4. `npx playwright install chromium` — install browser
5. `npm run typecheck` — TypeScript strict check
6. `npm run test:smoke` — smoke gate (fails fast if site is unreachable)
7. `npm test` — full suite
8. Upload HTML report + test results as CI artifacts (30-day retention)

### Issue Templates

Use the **Bug Report** template to report failing, flaky, or incorrect tests.
Use the **Test Request** template to request new coverage for a CleanRouter page or feature.

### Pull Request Template

The PR template enforces the pre-merge checklist:
- `npm run typecheck` passes with zero errors
- `npm run lint` passes with zero errors
- All new tests have at least one tag
- No hardcoded URLs
- No form submissions
- No `expect()` inside page objects
- No `page.waitForTimeout()` calls
- Visual baselines updated if `@visual` tests changed

### `copilot-instructions.md`

Configures AI coding assistant behavior (GitHub Copilot, Claude Code) for this repo. Contains project context, architecture rules, selector priority, and site-specific constants. Keeps AI suggestions consistent with the project conventions.

---

## 12. Contributor Rules

Full guide: [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md)

### Quick checklist before opening a PR

```
[ ] npm run typecheck — zero TypeScript errors
[ ] npm run lint      — zero lint errors
[ ] npm test          — all tests pass (or document expected failures)
[ ] Every new test has at least one tag (@smoke, @navigation, etc.)
[ ] No hardcoded URLs — siteConfig.url used throughout
[ ] No form submissions — interaction and validation only
[ ] No expect() inside page object methods
[ ] No page.waitForTimeout() — use Playwright auto-waiting
[ ] Page objects extend BasePage and follow POM conventions
[ ] Visual baselines updated if @visual tests changed (npm run baseline)
```

### Branching

```bash
git checkout -b feat/describe-change   # New test coverage or feature
git checkout -b fix/describe-fix       # Bug fix (broken test, bad selector)
git checkout -b chore/describe-chore   # Config, deps, cleanup
```

### Commit style

Use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat: add FAQ accordion expansion tests`
- `fix: update purchase page selector after redesign`
- `chore: bump Playwright to 1.45`

---

## 13. CI/CD

GitHub Actions runs on every push to `main` and every pull request targeting `main`.

The pipeline is defined in `.github/workflows/playwright.yml`. On failure, the Playwright HTML report is uploaded as a CI artifact and retained for 30 days — open it to see per-test screenshots, video replays, and network traces for failures.

To run with a different site URL (e.g., a staging environment):

```bash
SITE_URL=https://staging.cleanrouter.com npm test
```

---

## Project Structure

```
clean_router_QA_Agentic_Solution/
├── CLAUDE.md                     # Claude Code instructions (loaded every session)
├── AGENTS.md                     # Agent catalog — Claude Code subagents
├── Skills.md                     # Skills/slash command catalog
├── site.config.json              # Site URL, flags, expected nav items
├── playwright.config.ts          # Playwright projects: desktop, mobile, tablet
├── tsconfig.json                 # TypeScript strict config with path aliases
├── package.json                  # Scripts and dependencies
│
├── .claude/
│   ├── settings.json             # Project-level Claude Code settings (committed)
│   ├── settings.local.json       # Personal settings override (gitignored)
│   ├── agents/                   # Custom Claude Code subagent definitions
│   │   ├── site-analyzer.md
│   │   └── test-generator.md
│   ├── commands/                 # Slash command skill files
│   │   ├── analyze-site.md
│   │   ├── generate-full-suite.md
│   │   ├── generate-report.md
│   │   ├── run-smoke.md
│   │   └── update-baseline.md
│   └── rules/                    # Path-scoped instruction files
│       ├── pom-architecture.md
│       ├── selectors.md
│       └── testing.md
│
├── .github/
│   ├── workflows/playwright.yml  # CI pipeline
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── test_request.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── CONTRIBUTING.md
│   └── copilot-instructions.md
│
├── src/
│   ├── pages/                    # Page Object Model classes
│   │   ├── base.page.ts          # BasePage base class
│   │   ├── home.page.ts
│   │   ├── navigation.page.ts
│   │   ├── contact.page.ts
│   │   ├── faq.page.ts
│   │   └── purchase.page.ts
│   ├── fixtures/
│   │   └── site.fixture.ts       # Custom Playwright fixtures
│   ├── utils/
│   │   ├── link-checker.ts
│   │   └── visual-helper.ts
│   └── types/
│       └── site-config.types.ts
│
└── tests/
    ├── smoke/
    ├── navigation/
    ├── forms/
    ├── functional/
    ├── visual/
    ├── responsive/
    └── regression/
```

---

## License

Private — internal QA tooling for Clean Router.
