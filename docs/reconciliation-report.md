## Architecture refactor (2026-10-30)

The former monolithic provider implementation is now split into focused modules:

- `src/catalog.js`: source-backed phase names, descriptions, paths, and Git blob provenance.
- `src/safety.js`: adapter-authored runtime authorization preamble.
- `src/provider.js`: DeepSeek Harness provider registration, rank import, lazy loading, abort handling, and Cordis disposer.
- `index.js`: thin public entrypoint.

The provider imports `BUNDLED_SKILL_RANK` from `@deepseek-ai/dsh-skill` rather than duplicating its current numeric value. Its `list(options)` and `get(candidate, options)` respect both caller and registration cancellation. It returns the disposer from `ctx.skills.registerProvider()`. All source bodies are still checked as unchanged suffixes, and the immutable source snapshot remains outside runtime modules.

See `repo-inventory.md`, `capability-map.md`, `ledger.md`, `verification.md`, and `CONVERSION_REPORT.md` for the full audit and gap accounting.
