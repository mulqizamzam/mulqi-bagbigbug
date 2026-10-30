# CONVERSION_REPORT — Mulqi BagBigBug

## One-screen summary

- **Product:** a DeepSeek Harness skills-only bundled provider for the upstream public bug-bounty prompt pack.
- **WRAP:** 0. **PORT:** 0. **EXPOSE:** 14 phase prompts. **VENDOR-ONLY:** 5 source root files.
- **Source fidelity:** 19/19 source files, 495,963 bytes; zero intentional exclusions. Original files remain under `source/original/` and are hash-validated.
- **Reachable today in Harness:** router plus fourteen explicitly user-invoked phase skills. All have `modelInvocable:false`, `userInvocable:true`.
- **Not executable through this plugin:** private helper runtime, browser fleet, proxy/email/SMS/MFA/OOB/PoC services, dashboard, credentials, report platform APIs, private rules, and reference corpus. None are shipped in the upstream repository.

## Architecture and evidence

The implementation is separated into `src/catalog.js` (source phase metadata/provenance), `src/safety.js` (adapter-authored policy preamble), `src/provider.js` (Harness provider and lazy file loading), and a thin `index.js` entrypoint. Provider rank is imported from `@deepseek-ai/dsh-skill`; provider registration follows `ctx.skills.registerProvider()` with lifecycle abort handling. The model-facing loader and explicit slash-invocation consumer are supplied by `@deepseek-ai/dsh-tool-skill` in Harness, not reimplemented here.

Ground-truth reference: DeepSeek Harness tag `dsh-v0.2.1-rc.2`, commit `687f282e8625c6b8d11ff58211a90524be2e4317`. Requested `dsh-better-deepseek` was not found in the official Harness tree at this tag; same-tag official `badge-skill-bundle` used as known-good bundle reference.

## Install and smoke-test

```sh
dsh plugin --profile <profile> add github:mulqizamzam/mulqi-bagbigbug#main
```

Enable the `bagbigbug` provider in the profile's Plugins UI; its row is disabled by default. Invoke `/bagbigbug` and then one exact phase command, for example `/bagbigbug-phase-00-recon`, using an offline test context. Do not perform live target testing merely to verify plugin loading.

Repository verification:

```sh
python3 scripts/validate_source_manifest.py
node --check index.js && node --check src/catalog.js && node --check src/safety.js && node --check src/provider.js
node --check tests/plugin-smoke.mjs && node tests/plugin-smoke.mjs
npm pack --dry-run --json > /tmp/bagbigbug-pack.json
python3 scripts/validate_source_manifest.py --npm-pack-manifest /tmp/bagbigbug-pack.json
```

## Known Gaps

1. Live Harness installation, activation, slash invocation, and reload were not performed in this session; CI and mocked tests do not replace a live profile test.
2. Upstream contains prompt descriptions/placeholders but no implementation or API contracts for its private helper/browser/proxy/mailbox/SMS/MFA/OOB/PoC/report/dashboard/RAG services. They are not surfaced as executable tools.
3. Registry publication was not performed.
4. The requested `dsh-better-deepseek` reference was not located inside the exact official Harness tag; a first-party bundle in that tag provided verified patterns instead.

## Git delivery

- Target repository: https://github.com/mulqizamzam/mulqi-bagbigbug
- Branch: `main` (existing history retained; no reinitialization or force push).
- Pre-refactor head: `7cdb372bf18668143a181a5f7594582fc59da28b`.
- Refactor commit: pending until the commit is created.
