# Agents

This document catalogs the **Claude Code subagents** available in this repository.
Agents are defined in `.claude/agents/` and loaded by Claude Code when relevant or referenced explicitly.

Reference: [Claude Code Sub-agents docs](https://docs.anthropic.com/en/docs/claude-code/sub-agents)

---

## What Are Agents?

Agents are specialized Claude Code subagents with:

- A **custom system prompt** scoped to one domain
- **Restricted tool access** — only the tools they need
- An **independent context window** — they do not pollute your main session

Claude Code auto-selects an agent when your prompt matches its `description` frontmatter field, or you can reference one explicitly: _"Use the test-generator agent to write FAQ tests."_

---

## Agent Frontmatter Reference

Every agent file in `.claude/agents/` begins with a YAML frontmatter block. All fields except `name` and `description` are optional.

```yaml
---
name: my-agent                          # Required. Unique kebab-case identifier.
description: >                          # Required. When Claude should auto-select
  One sentence: when/why to invoke.     # this agent. Keep it specific.
tools: Read, Grep, Glob, Bash           # Allowed tools (comma-separated).
                                        # Omit to inherit main session tools.
disallowedTools: Write, Edit            # Tools to block.
model: sonnet                           # sonnet | opus | haiku | fable | inherit
permissionMode: default                 # default | acceptEdits | auto | bypassPermissions | plan
maxTurns: 20                            # Max agentic turns before stopping.
effort: high                            # low | medium | high | xhigh | max
color: blue                             # red | blue | green | yellow | purple | orange | pink | cyan
background: false                       # true = run as background task
isolation: worktree                     # worktree = isolated git worktree (expensive)
memory: project                         # user | project | local — persistent memory scope
---
```

**Minimal example:**

```yaml
---
name: link-checker
description: Check all internal and external links on the site for 404s. Use when verifying link health.
tools: WebFetch, Read
---

You are a link health checker. Crawl the site, issue HEAD requests to every href,
and report broken links grouped by page.
```

---

## Available Agents

### `site-analyzer`

**File:** `.claude/agents/site-analyzer.md`
**Tools:** `WebFetch, Read, Write`
**Model:** inherits session default

**Purpose:**
Crawls `cleanrouter.com` (or any URL) and produces a fully-populated `site.config.json`
for the Playwright regression framework.

**Claude invokes this when:**
- You run `/analyze-site`
- You ask Claude to update `site.config.json`
- Onboarding a new site variant or after a redesign

**Outputs:**
- Updated `site.config.json` with URL, nav items, feature flags
- "Issues found" checklist
- Confidence assessment (High / Medium / Low)

**Example prompts:**
```
Analyze cleanrouter.com and update site.config.json
Run site-analyzer on https://cleanrouter.com
```

---

### `test-generator`

**File:** `.claude/agents/test-generator.md`
**Tools:** `WebFetch, Read, Write, Edit, Bash`
**Model:** inherits session default

**Purpose:**
Reads `site.config.json` and the live site, then generates site-specific Playwright
test files and page object additions for features not covered by the generic suite.

**Claude invokes this when:**
- You run `/generate-full-suite`
- You ask Claude to write tests for a specific page or feature
- Existing selectors break after a site redesign

**Outputs:**
- TypeScript spec files in `tests/functional/` or `tests/custom/`
- Page object additions in `src/pages/`
- TypeScript-clean output (runs `tsc --noEmit` to verify before finishing)

**Example prompts:**
```
Generate tests for the FAQ accordion
Write a purchase page test that covers plan selection
Use test-generator to add regression tests for the trust indicator stats
```

---

## Adding a New Agent

1. Create `.claude/agents/<kebab-name>.md`
2. Add YAML frontmatter at the top of the file (see [Frontmatter Reference](#agent-frontmatter-reference) above)
3. Write the agent's system prompt as the body of the file
4. Add an entry to this document
5. Commit both files

**Template:**

```markdown
---
name: my-agent
description: One sentence describing when Claude should auto-select this agent.
tools: Read, Grep, Glob
model: sonnet
effort: medium
color: green
---

# Agent: my-agent

## Role
Describe what this agent does.

## Step-by-step instructions
1. ...
2. ...
```

---

## Agent vs Skill vs Rule

| | Agent | Skill | Rule |
|---|---|---|---|
| **Definition file** | `.claude/agents/*.md` | `.claude/commands/*.md` | `.claude/rules/*.md` |
| **Loaded** | On demand | On demand | At session start (or when matching files open) |
| **Context** | Separate window | Same session | Same session |
| **Invocation** | Automatic or explicit | `/command-name` or automatic | Automatic |
| **Best for** | Heavy autonomous tasks | Multi-step procedures | Always-on coding standards |

See [Skills.md](./Skills.md) for the skill catalog and [CLAUDE.md](./CLAUDE.md) for rules.
