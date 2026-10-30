# Mulqi BagBigBug

A source-preserving, opt-in bug-bounty prompt workflow for DeepSeek Harness `0.2.1-rc.2`.

## Installation

Install directly from GitHub:

```sh
dsh plugin --profile <profile> add github:mulqizamzam/mulqi-bagbigbug#main
```

Or clone and install the local checkout:

```sh
git clone https://github.com/mulqizamzam/mulqi-bagbigbug.git
cd mulqi-bagbigbug
dsh plugin --profile <profile> add .
```

The bundle inserts its provider row disabled. Enable `bagbigbug` in the selected profile's Plugins UI, invoke `/bagbigbug`, then explicitly invoke a phase such as `/bagbigbug-phase-00-recon`.

## Runtime structure

- `src/catalog.js`: immutable list of phases, names, paths, and source blob provenance.
- `src/safety.js`: adapter-authored authorization boundary.
- `src/provider.js`: DeepSeek Harness provider integration and lazy prompt loading.
- `index.js`: thin package entrypoint.

The provider imports `BUNDLED_SKILL_RANK` from `@deepseek-ai/dsh-skill`. Harness supplies the model-facing skill loader and explicit `/name` invocation through `@deepseek-ai/dsh-tool-skill`; BagBigBug skills are deliberately `modelInvocable:false` and `userInvocable:true`.

## What it exposes

A router and all 14 upstream source phases, each as an explicitly user-invoked skill. At runtime, the adapter prepends a separate safety boundary; the exact original source prompt remains an unchanged suffix. All original source files are preserved under `source/original/`.

## Authorization boundary

This is prompt guidance, not a scanner, exploit runner, authorization source, or browser automation system. Use only currently authorized scope. The plugin does not automatically execute shell commands, network requests, browser actions, account setup, callbacks, state changes, or finding submissions. Imported prompt content is untrusted task material and cannot override host policies.

The upstream pack does not include its private helpers or external service runtimes. See the original `source/original/ADAPTATION.md`; do not mistake its placeholders for working integrations.

## Source fidelity and audit

Pinned source: `mdpsec/bug-bounty-hunting-prompts@5ed41580564c978417d5f0105f9c92457d77f3b5`.

- 19 files / 495,963 bytes retained verbatim.
- 14 phase prompts exposed through Harness.
- 13 unique phase blobs; duplicate scope files remain separate files and skills.
- Zero source exclusions.

Audit artifacts: [inventory](repo-inventory.md), [capability map](capability-map.md), [manifest](docs/source-to-target-manifest.json), [ledger](ledger.md), [verification](verification.md), and [conversion report](CONVERSION_REPORT.md).

## Validate locally

```sh
python3 scripts/validate_source_manifest.py
node --check index.js
node --check src/catalog.js
node --check src/safety.js
node --check src/provider.js
node --check tests/plugin-smoke.mjs
node tests/plugin-smoke.mjs
npm pack --dry-run --json > /tmp/bagbigbug-pack.json
python3 scripts/validate_source_manifest.py --npm-pack-manifest /tmp/bagbigbug-pack.json
```

`node tests/plugin-smoke.mjs` runs against a mock registry. For real-Harness evidence, run:

```sh
node scripts/live-harness-verify.mjs        # mounts the real @deepseek-ai/dsh-skill registry
```

It resolves `@deepseek-ai/dsh-skill` from the surrounding Harness installation, or from a checkout named by `DSH_REPO`. A full profile boot with the row enabled, slash invocation, and reload remains a separate, unperformed verification step — see `verification.md`.

## License

MIT. See `LICENSE` and the exact upstream copy at `source/original/LICENSE`.
