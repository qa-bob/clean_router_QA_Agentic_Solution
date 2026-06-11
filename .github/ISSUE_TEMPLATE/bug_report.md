---
name: Bug Report
about: A test is failing, flaky, or producing an incorrect result
title: "[BUG] "
labels: bug
assignees: ''
---

## Describe the Bug

<!-- What is the test doing wrong? -->

## Test File and Name

```
tests/<category>/<file>.spec.ts — "<test name>"
```

## Steps to Reproduce

1. Run `npx playwright test <file>.spec.ts`
2. Observe failure

## Expected Behavior

<!-- What should the test do? -->

## Actual Behavior

<!-- What does it actually do? Paste the error message. -->

```
<paste error output here>
```

## Environment

- OS:
- Node.js version (`node --version`):
- Playwright version (`npx playwright --version`):
- Browser: Chromium / Firefox / WebKit

## Possible Cause

<!-- Site changed? Selector broke? Timing issue? -->

## Screenshots / Traces

<!-- Attach Playwright trace zip or screenshot if available. -->
<!-- Trace files are in `test-results/` after a failed run. -->
