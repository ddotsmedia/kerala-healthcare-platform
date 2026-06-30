# Phase Specs — Kerala Healthcare Platform

This folder contains the complete, untruncated spec for every build phase.
Each file is self-contained and includes the Universal Prompt Law at the
top of its Claude Code prompt block.

## Why this folder exists

Pasting long prompts into chat occasionally truncates. Reading the spec
directly from a file on disk removes that risk entirely and gives every
future Claude Code session — and every other contributor — the same
durable source of truth.

## How to use

When starting a phase, tell Claude Code:

```
Read docs/phases/PHASE_N_SPEC.md in full and execute it.
```

Replace `N` with the phase number (0–5).

If resuming a partially-built phase:

```
Read docs/phases/PHASE_N_SPEC.md in full. Reconcile against what has
already been built (check git log and existing migrations/files first).
Do not duplicate existing work. Complete only the remaining tasks.
```

## Files

| File | Phase | Status |
|---|---|---|
| PHASE_0_SPEC.md | Foundation & Infrastructure | ✅ Complete — v0.1.0-foundation |
| PHASE_1_SPEC.md | Healthcare Directory | 🟡 In progress |
| PHASE_2_SPEC.md | Appointments & Patient Portal | ⬜ Not started |
| PHASE_3_SPEC.md | Health Knowledge Centre | ⬜ Not started |
| PHASE_4_SPEC.md | Healthcare Jobs Portal | ⬜ Not started |
| PHASE_5_SPEC.md | AI Assistant & Platform Scale | ⬜ Not started |

## Rule

Never edit a phase spec mid-build to "match what was already done."
If a gap is found between the spec and what's built, build the missing
piece additively — don't rewrite the spec to excuse the gap. The
spec is the source of truth; the codebase should match it, not the
other way around.
