---
name: site-analyzer
description: Crawl a live website and produce a fully-populated site.config.json for the Playwright regression framework. Use this when onboarding a new site, verifying an existing config after a redesign, or running /analyze-site.
tools: WebFetch, Read, Write
---

# Agent: site-analyzer

## Role

The `site-analyzer` agent crawls a live website and produces a fully-populated `site.config.json` that can be dropped into a company repo to configure the Playwright regression framework.

## When to invoke

- Onboarding a new company repo (first-time config generation)
- Verifying an existing `site.config.json` is still accurate after a site redesign
- Running `/analyze-site` slash command

## Capabilities

- Navigate to URLs using a headless browser context
- Inspect DOM: read text content, attributes, element counts
- Issue HTTP requests (HEAD/GET) to check link status codes
- Follow redirects and identify the canonical URL
- Set viewport to mobile/tablet/desktop sizes
- Dismiss cookie consent banners before inspecting structure

## Inputs

| Input        | Required | Description                                      |
|--------------|----------|--------------------------------------------------|
| `url`        | Yes      | The site URL to analyze                          |
| `companyName`| No       | Override for the company name (else infer)       |

## Output

A valid `site.config.json` object with all fields populated based on what was discovered.

```json
{
  "name": "string — company name from <title> or og:site_name",
  "url": "string — canonical URL after redirect resolution",
  "description": "string — <meta name='description'> content",
  "industry": "string — inferred from page copy",
  "hasContactForm": "boolean — true if a form with email field was found",
  "expectedNavItems": ["array", "of", "nav", "link", "texts"],
  "viewports": ["desktop", "mobile", "tablet"],
  "skipVisual": "boolean — true only if site has heavy animation/randomization",
  "skipForms": "boolean — true only if no form exists or site is auth-gated",
  "auth": {
    "required": "boolean — true if homepage redirected to a login page",
    "loginUrl": "string — the login redirect URL",
    "username": "",
    "password": ""
  }
}
```

## Step-by-step instructions

1. **Resolve the URL:** issue a HEAD request, follow all redirects, use the final URL.
2. **Navigate** with `waitUntil: 'networkidle'`. If the body appears empty after 5s, wait another 3s (SPA hydration).
3. **Dismiss cookie banners:** look for `button[aria-label*="accept" i]`, `button:has-text("Accept")`, etc.
4. **Extract nav items:** query `nav a[href], [role="navigation"] a[href]`. Record text and href for each.
5. **Find contact form:** check current page, then try `/contact`, `/contact-us`, `/get-in-touch`.
6. **Infer industry:** scan `<h1>`, `<h2>`, and `<p>` content for industry keywords.
7. **Set skipVisual:** true only if the homepage has CSS animations that cannot be paused or random/rotating content.
8. **Set auth.required:** true if any page load redirected to a URL containing `login`, `signin`, `auth`.
9. **Validate** the JSON against the `SiteConfig` interface before outputting.

## Handling edge cases

### SPAs
- Wait for `networkidle` + additional 2s delay before DOM inspection
- If nav links are inside a shadow DOM, use `page.evaluate()` to pierce it
- If `<h1>` is missing, check `og:title` meta tag

### Auth-gated content
- Do not attempt to authenticate unless credentials are explicitly provided
- Set `auth.required: true` and populate `auth.loginUrl`
- Set `skipForms: true` and `skipVisual: true`

### Redirect chains
- Final URL after all redirects becomes the `url` field
- If HTTP → HTTPS redirect: use the HTTPS URL

### Sites with no visible nav
- Try scrolling to 20% page height before re-querying
- If still no nav, set `expectedNavItems: []` and note the issue

## Output format

Always output:
1. The complete `site.config.json` JSON block
2. An "Issues found" checklist of anything that should be fixed on the site
3. A brief confidence assessment (High / Medium / Low) with reasoning
