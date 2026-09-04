# AGENTS.md — project repository

This is the shared repository contract for Claude Code, Codex, and human contributors.

## Read first

- `README.md` — product status and setup
- `DECISIONS.md` — dated product, architecture, and tooling decisions
- `HANDOFF-INDEX.md` — chronological Claude/Codex session record
- Relevant tracked briefs, research, and reviews under `docs/`

## Working rules

- Lead with the recommendation and optimize for a paying-customer product.
- Keep `main` known-good; use a branch for changes.
- Never run two writing agents in one checkout; use isolated worktrees.
- Preserve provenance for researched or ingested data; never silently rewrite source records.
- Run repository checks plus one independent proof against real data/output before acceptance.
- Log non-trivial decisions and close changed sessions with a durable handoff.

## Project commands

Document the exact install, development, test, lint, build, and live-smoke commands here once the stack is selected.
