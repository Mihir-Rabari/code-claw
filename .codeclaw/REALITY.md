# REALITY.md

Current best-known state of the repository memory system.

## Known facts

- The repo has a dedicated markdown memory area at `.codeclaw/`.
- Memory changes are proposed first and reviewed by humans before merge.
- The repo does not allow direct automatic memory mutation.
- Memory is organized by purpose, not as a chronicle.

## Current operational assumptions

- The repository is the source of truth for its own memory.
- Observations are atomic and evidence-backed.
- Proposals are the only path from observations to durable memory.
- Concepts are derived from approved proposals and stable observations.

## What belongs here

Keep only stable, current facts that help the next contributor orient quickly.

Examples:

- active memory workflow rules
- current repo conventions
- known constraints that should not be guessed

## What does not belong here

- long-form history
- transient task notes
- unresolved debate detail
- raw evidence better stored in `observations/`

## Update rule

When reality changes, add a new observation or proposal first. Then update this file after the human-reviewed merge.
