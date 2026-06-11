# Skills

This document catalogs the **Claude Code skills (slash commands)** available in this repository.
Skills are defined in `.claude/commands/` and invoked with `/command-name` in a Claude Code session.

Reference: [Claude Code Skills docs](https://docs.anthropic.com/en/docs/claude-code/skills)

---

## What Are Skills?

Skills are reusable, on-demand workflows. Unlike CLAUDE.md rules (always in context), a
skill's body only enters context when invoked. Use skills for:

- Multi-step procedures you'd otherwise retype
- Checklists and structured workflows
- Tasks with a predictable shape that benefit from step-by-step instructions

Invoke any skill with `/<name>` in a Claude Code session open to this project.

---

## Skill Frontmatter Reference

Skill files in `.claude/commands/` may include optional YAML frontmatter. All fields are optional.

```yaml
---
name: my-skill                          # Display name (defaults to filename).
description: >                          # What this skill does and when to use it.
  One-line summary shown in skill list. # Keep it under ~100 chars.
when_to_use: >                          # Additional trigger phrases for auto-invocation.
  Use when the user asks to deploy...
argument-hint: "[environment]"          # Hint shown to users when typing the command.
arguments: [environment, version]       # Named args substituted as $environment, $version.
disable-model-invocation: false         # true = only user can invoke (not Claude auto-select).
user-invocable: true                    # false = Claude-only invocation.
allowed-tools: >                        # Pre-approved tools for this skill (no prompt).
  Bash(npm run *) Bash(npx playwright*)
disallowed-tools: Write, Edit           # Tools blocked during this skill.
model: inherit                          # sonnet | opus | haiku | fable | inherit
effort: high                            # low | medium | high | xhigh | max
context: fork                           # fork = run in isolated subagent context
agent: general-purpose                  # Which agent type when context: fork
---
```

**Key features:**
- Dynamic context injection: `` !`git diff HEAD` `` runs a shell command before Claude sees the content
- String substitution: `$0`, `$1`, `$ARGUMENTS`, `$name`, `${CLAUDE_SESSION_ID}`, `${CLAUDE_SKILL_DIR}`
- Supporting files referenced with markdown links: `[reference.md](reference.md)`

---

## Available Skills

### `/analyze-site`

**File:** `.claude/commands/analyze-site.md`

Inspect the live CleanRouter site and report its current structure — pages, nav links,
forms, interactive elements, and any changes since the last analysis.

**When to use:**
- Before writing new tests, to understand what has changed
- To verify `site.config.json` is still accurate
- To discover new pages or features that need coverage

```
/analyze-site
```

---

### `/generate-full-suite`

**File:** `.claude/commands/generate-full-suite.md`

Analyze the website and generate a complete set of POM classes and test files covering
every discoverable page and feature. Delegates to the `test-generator` agent.

**When to use:**
- Initial test suite setup for a new site
- After a major redesign that breaks existing selectors
- When adding a new section to the suite from scratch

```
/generate-full-suite
```

---

### `/run-smoke`

**File:** `.claude/commands/run-smoke.md`

Execute the `@smoke` test suite and return a structured pass/fail report with
failure details and recommended next steps.

**When to use:**
- Quick confidence check after a code change
- CI pre-flight before running the full suite
- Verifying the site is live before a demo or release

```
/run-smoke
```

---

### `/update-baseline`

**File:** `.claude/commands/update-baseline.md`

Refresh visual regression snapshot baselines to reflect intentional UI changes.
Runs `npm run baseline` and reports which snapshots were updated.

**When to use:**
- After a design update that changes colors, fonts, or layout
- After new features are added to the homepage
- Whenever `@visual` tests fail due to expected changes (not regressions)

```
/update-baseline
```

---

### `/generate-report`

**File:** `.claude/commands/generate-report.md`

Generate a human-readable test results summary from the most recent Playwright run.
Outputs pass/fail counts, failure details grouped by category, and a QA sign-off table.

**When to use:**
- Sharing results with a stakeholder
- Creating a QA sign-off document
- Debugging failures — the report groups errors by test tag

```
/generate-report
```

---

## Adding a New Skill

1. Create `.claude/commands/<name>.md`
2. Optionally add YAML frontmatter (see [Frontmatter Reference](#skill-frontmatter-reference) above)
3. Write the skill instructions in the body
4. Invoke with `/<name>` in any Claude Code session in this project
5. Add an entry to this file and commit both

**Template:**

```markdown
---
description: One sentence describing what this skill does and when to invoke it.
allowed-tools: Bash(npm run *) Bash(npx playwright*)
---

# My Skill

Brief description of what this skill accomplishes.

## Steps

1. Read `site.config.json` to get the target URL.
2. Run `npm run test:smoke` and capture output.
3. Report results.
```

---

## Skill vs CLAUDE.md Rule vs Agent

| | CLAUDE.md Rule | Skill | Agent |
|---|---|---|---|
| **Definition** | `CLAUDE.md` or `.claude/rules/*.md` | `.claude/commands/*.md` | `.claude/agents/*.md` |
| **Loaded** | Every session | On demand | On demand |
| **Context cost** | Loaded every token | Only when invoked | Separate window |
| **Best for** | Always-on facts and standards | Repeatable procedures | Heavy autonomous tasks |

See [AGENTS.md](./AGENTS.md) for the agent catalog.
