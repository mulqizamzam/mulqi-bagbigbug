# Repository Inventory — Mulqi BagBigBug

- Target: https://github.com/mulqizamzam/mulqi-bagbigbug
- Inspected target ref: main at 7cdb372bf18668143a181a5f7594582fc59da28b
- Upstream: https://github.com/mdpsec/bug-bounty-hunting-prompts
- Upstream commit: 5ed41580564c978417d5f0105f9c92457d77f3b5
- Upstream tree: 802c7d82a957c7641dbe7585f755fd25e0fd3d4f (recursive enumeration not truncated)
- Inventory: 19 files, 495,963 bytes; 17 Markdown, one `.gitignore`, one extensionless `LICENSE`; 14 phases and 13 unique phase blobs.

## Upstream files

| Source path | Bytes | Language/kind | Entry/API | Target treatment |
|---|---:|---|---|---|
| `.gitignore` | 204 | ignore rules | ignore conventions | vendor-only, with package alias |
| `ADAPTATION.md` | 8,811 | Markdown | integration/placeholder index | vendor-only reference |
| `LICENSE` | 1,096 | MIT license text | legal terms | exact vendor copy + root alias |
| `README.md` | 4,657 | Markdown | user documentation | vendor-only reference |
| `SECURITY.md` | 898 | Markdown | security/disclosure policy | exact vendor copy + root alias |
| `phases/phase-00-recon.md` | 17,886 | Markdown prompt | phase 0 | exposed as user skill |
| `phases/phase-01-access.md` | 92,564 | Markdown prompt | phase 1 | exposed as user skill |
| `phases/phase-02-sweep.md` | 82,853 | Markdown prompt | phase 2 | exposed as user skill |
| `phases/phase-03-closeout.md` | 38,902 | Markdown prompt | phase 3 | exposed as user skill |
| `phases/phase-04a-scope.md` | 1,220 | Markdown prompt | phase 4a | exposed as user skill |
| `phases/phase-04b-browser-walk.md` | 7,352 | Markdown prompt | phase 4b | exposed as user skill |
| `phases/phase-05a-scope.md` | 1,220 | Markdown prompt | phase 5a | exposed as user skill |
| `phases/phase-05b-critical.md` | 14,281 | Markdown prompt | phase 5b | exposed as user skill |
| `phases/phase-06-triage.md` | 27,590 | Markdown prompt | phase 6 | exposed as user skill |
| `phases/phase-07-validate-escalate.md` | 62,590 | Markdown prompt | phase 7 | exposed as user skill |
| `phases/phase-08-verify-escalate.md` | 33,642 | Markdown prompt | phase 8 | exposed as user skill |
| `phases/phase-08a-independent-escalation.md` | 8,646 | Markdown prompt | phase 8a | exposed as user skill |
| `phases/phase-09-triage-gate.md` | 84,724 | Markdown prompt | phase 9 | exposed as user skill |
| `phases/phase-10-self-duplicate-check.md` | 6,827 | Markdown prompt | phase 10 | exposed as user skill |

## Source capability findings

- No CLI command, public API, application entrypoint, package manifest, executable runtime, build script, native build step, or upstream automated test suite exists in the pinned source tree.
- `ADAPTATION.md` documents placeholders and possible researcher-owned integrations (browser, proxy/HAR, email/SMS/MFA, OOB, PoC hosting, evidence/report tooling, orchestration). These are not implementations or dependency declarations.
- Runtime/build dependencies in source: none. Public user-facing assets: 14 phase prompt files plus adaptation/security/docs.
- Source licenses: one MIT `LICENSE`; no `NOTICE` file in the enumerated source tree.

## Harness compatibility evidence

- Target API baseline: DeepSeek Harness `dsh-v0.2.1-rc.2`, commit `687f282e8625c6b8d11ff58211a90524be2e4317`.
- `packages/skill/skill/src/index.ts` exports `BUNDLED_SKILL_RANK`, defines `SkillProvider.list(options)` and `get(candidate, options)`, and exposes `ctx.skills.registerProvider(create(control))` with lifecycle `signal` and `invalidate`.
- `packages/skill/tool-skill/src/index.ts` implements model-facing skill loader/catalog and explicit user slash invocation. It filters model catalog using `modelInvocable` and injects user-invoked skills using `userInvocable`.
- In-tree reference: `packages/experimental/badge-skill-bundle` uses `dsh.bundle.patch` and `cordis.patch.yml` for bundle insertion.
- Requested `dsh-better-deepseek` did not appear in the official Harness repository tree at the pinned tag; the same-tag official badge-skill bundle and provider sources were used instead.

## Pre-refactor target findings

- `index.js` mixed source catalog, safety preamble, lazy file loading, and provider integration in one file.
- It duplicated bundled rank as a hard-coded `600` rather than importing the official registry constant.
- `apply()` did not explicitly return the provider-registration disposer.
- Existing smoke test mocked only provider registration happy path and prompt-body suffix preservation.
- Previous CI validated 19 source hashes, metadata, syntax, mocked provider behavior, and npm pack inventory.

## Target file tree

Runtime modules after refactor: `index.js`, `src/catalog.js`, `src/safety.js`, `src/provider.js`; tests: `tests/plugin-smoke.mjs`; validator: `scripts/validate_source_manifest.py`; original snapshot: `source/original/**`; evidence artifacts: `capability-map.md`, `ledger.md`, `verification.md`, `CONVERSION_REPORT.md`.
