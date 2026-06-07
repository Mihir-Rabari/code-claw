# CLAW.md

Repository memory policy for CodeClaw.

## Principles

- The repository owns its memory.
- Memory is markdown-first and human reviewable.
- No direct automatic memory mutation.
- New memory arrives as a proposal, not as a silent rewrite.
- No chronicles: do not maintain a single narrative log of the repo.
- Prefer small, auditable artifacts over large compound documents.

## Memory lifecycle

1. **Observation**
   - A fact, signal, issue, or pattern is captured in `observations/`.
   - Observations are atomic and should be source-linked when possible.
   - Observations are immutable once written; if wrong, add a corrective observation.

2. **Proposal PR**
   - One or more observations are assembled into a memory proposal in `memory-proposals/`.
   - The proposal explains what should be retained, promoted, or discarded.
   - The proposal is opened as a PR so a human can review the change.

3. **Human review**
   - A human reviews the proposal for accuracy, scope, and usefulness.
   - Review may accept, reject, or request revision.
   - Reviewer notes live alongside the proposal, not in hidden state.

4. **Merge**
   - Once approved, the accepted content is merged into the durable memory areas.
   - Merge may update `REALITY.md`, `concepts/`, `decisions/`, or `debates/`.
   - The merged state must remain readable without the proposal context.

5. **Concept**
   - Stable, reusable understanding is distilled into `concepts/`.
   - Concepts are higher-level than raw observations and should remain concise.
   - If a concept becomes a rule or commitment, promote it further into `decisions/`.

## Hard rules

- Do not auto-edit memory as a side effect of normal repo operations.
- Do not invent facts; only record what can be justified.
- Do not overwrite history in place when a new note or correction is safer.
- Do not use chronicles or a monolithic timeline file.
- Do not store private reasoning; store the auditable result.

## Repository memory areas

- `REALITY.md`: current, best-known state of the repository.
- `observations/`: atomic evidence and findings.
- `memory-proposals/`: reviewable promotion or change packages.
- `concepts/`: distilled, reusable understanding.
- `debates/`: open questions, tradeoffs, and unresolved disagreement.
- `decisions/`: accepted commitments and policy choices.

## Promotion rule

Only promote memory when it is:

- useful beyond a single task,
- stable enough to keep,
- supported by evidence,
- and approved by a human reviewer.

## Cleanup rule

If memory becomes stale, do not silently rewrite it. Add a new observation, debate, or proposal that explains the correction.
