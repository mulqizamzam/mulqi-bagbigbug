# Refactor Ledger

| Batch | Date | Files touched | Capability IDs | Remaining | Blockers / result |
|---|---|---|---|---:|---|
| B00 | 2026-10-30 | `repo-inventory.md`, `capability-map.md` | CAP-01..CAP-19 mapped | 0 source files | Pinned source tree and target runtime audited. |
| B01 | 2026-10-30 | `index.js`, `src/catalog.js`, `src/safety.js`, `src/provider.js`, `tests/plugin-smoke.mjs`, `scripts/validate_source_manifest.py`, `package.json` | CAP-01..CAP-19 retained; CAP-01..14 routed | 0 | Modular provider refactor implemented; CI run 41020319530 passed. |
| B02 | 2026-10-30 | `.github/workflows/validate.yml`, `README.md`, `docs/reconciliation-report.md`, `verification.md`, `CONVERSION_REPORT.md` | All capability rows reconciled | 0 | Documentation, verification evidence, and report updated; live Harness runtime remains a known gap. |
| B03 | 2026-10-30 | `src/provider.js`, `scripts/validate_source_manifest.py`, `tests/plugin-smoke.mjs`, `scripts/live-harness-verify.mjs`, `package.json`, `verification.md`, `ledger.md`, `CONVERSION_REPORT.md`, `README.md` | CAP-01..CAP-19 unchanged; runtime contract hardened | 0 | Fixed the async-provider-factory defect (registry reads `provider.name` synchronously; an async factory is silently skipped). Rank now resolved from the host peer dependency instead of a duplicated constant. Live evidence: real `SkillRegistry` mount 15/15, and real `dsh` CLI profile composition inserts the `bagbigbug` row. |

**Source files remaining:** 0. **Unclosed batches:** 0. Live evidence now covers the registry contract and bundle-patch composition; a full GUI profile with the row enabled and an LLM session remains unperformed (see `verification.md`).
