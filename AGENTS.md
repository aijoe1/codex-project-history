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

- Install locally: `bash install-local.sh`, then run **Developer: Reload Window** in VS Code.
- Automated tests: `npm test`
- Syntax checks: `npm run check`
- Shell checks: `bash -n install-local.sh demo/setup-fixture.sh`
- Real local smoke test: `node scripts/smoke.js "$PWD"` (review output before sharing it)
- Privacy-safe demo fixture: `bash demo/setup-fixture.sh`

The extension's read-only boundary is an architecture constraint. Do not add a Codex database
write path without a separate design, threat-model, and migration decision.
