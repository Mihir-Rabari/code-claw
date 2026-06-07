# MEMORY_GUIDE.md

A short guide for contributing to repository memory.

## The workflow

### 1. Record an observation

Use `observations/` for one fact per file. Keep it small and verifiable.

Suggested template:

```md
# Observation: <short title>

- **Date:** YYYY-MM-DD
- **Source:** <link, path, issue, PR, command output, or human note>
- **Observation:** <what was observed>
- **Why it matters:** <why future contributors should know>
```

### 2. Draft a proposal

Use `memory-proposals/` when you want to promote observations into durable memory.

A proposal should answer:

- What changed?
- Why is it worth remembering?
- Which observation(s) support it?
- What should be merged?
- What should stay unresolved?

### 3. Human review

A human reviewer must approve the proposal before durable memory is updated.

Review should check:

- accuracy
- scope
- whether the proposal is stable enough to keep
- whether the right destination was chosen

### 4. Merge into durable memory

After approval, merge the accepted content into one or more of:

- `REALITY.md`
- `concepts/`
- `debates/`
- `decisions/`

## File selection guide

- `observations/` — evidence and signal
- `memory-proposals/` — reviewable promotion bundles
- `concepts/` — distilled reusable ideas
- `debates/` — unresolved tradeoffs and open questions
- `decisions/` — approved rules and commitments
- `REALITY.md` — current best-known state

## Style

- Markdown only.
- Prefer short headings and bullet lists.
- Use links to source material whenever possible.
- Avoid speculative prose.
- Avoid monolithic summaries when a smaller note will do.
