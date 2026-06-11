## Summary

<!-- What does this PR do? 1-3 sentences. -->

## Type of Change

- [ ] New test(s)
- [ ] Updated test(s) or page object(s)
- [ ] Bug fix (broken test or incorrect assertion)
- [ ] Refactor (no behavior change)
- [ ] Docs / config update

## What Was Tested

<!-- Describe the CleanRouter feature or page this covers. -->

## Test Tags Added / Modified

- [ ] `@smoke`
- [ ] `@navigation`
- [ ] `@forms`
- [ ] `@functional`
- [ ] `@visual`
- [ ] `@responsive`
- [ ] `@regression`

## Pre-PR Checklist

- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run lint` passes with zero errors
- [ ] All new tests have at least one tag
- [ ] No hardcoded URLs — `baseURL` from Playwright config used throughout
- [ ] No form submissions in tests
- [ ] No `expect()` inside page object methods
- [ ] No `page.waitForTimeout()` calls — Playwright auto-waiting used instead
- [ ] Page objects extend `BasePage` and follow POM conventions
- [ ] Visual baselines updated if `@visual` tests changed (`npm run baseline`)

## Screenshots / Evidence

<!-- If this adds or changes visual regression baselines, attach before/after screenshots. -->
