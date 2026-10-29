# Source reconciliation and compatibility report

**Target repository:** [`mulqizamzam/mulqi-bagbigbug`](https://github.com/mulqizamzam/mulqi-bagbigbug)  
**Plugin:** `bagbigbug@0.1.0`  
**Harness target:** `0.2.1-rc.2`  
**Source repository:** [`mdpsec/bug-bounty-hunting-prompts`](https://github.com/mdpsec/bug-bounty-hunting-prompts)  
**Pinned source commit:** `5ed41580564c978417d5f0105f9c92457d77f3b5`  
**Pinned source tree:** `802c7d82a957c7641dbe7585f755fd25e0fd3d4f`  
**Report date:** 2026-10-30  
**Implementation commit with passing CI:** [`08074d86dfd957cf759f410b91a4f92a9741b2b6`](https://github.com/mulqizamzam/mulqi-bagbigbug/commit/08074d86dfd957cf759f410b91a4f92a9741b2b6)  
**GitHub Actions:** [validation run 40966107750 — success](https://github.com/mulqizamzam/mulqi-bagbigbug/actions/runs/40966107750)

## Executive result

The pinned upstream Git tree was enumerated with `truncated=false`. It contains **19 files** (five root files and 14 Markdown phase prompts), the `phases/` directory, **495,963 source bytes**, and 13 unique phase-content blobs. Every source item is assigned an explicit disposition in `docs/source-to-target-manifest.json`. No upstream file is intentionally excluded.

The 19 original source blobs were transferred to the target Git object store and each target blob SHA-1 matched the source Git blob SHA-1. This establishes byte-identity at the Git object level for the files mirrored under `source/original/`. The committed recursive target tree was subsequently checked: all 19 source-relative paths are present with matching blob IDs, and the `source/original/phases/` subtree SHA-1 equals the upstream subtree SHA-1. The two scope-only source files `phase-04a-scope.md` and `phase-05a-scope.md` have identical upstream blob IDs, but both file paths and separate runtime modules are retained.

## Inventory and dispositions

| Source group | Count | Disposition |
|---|---:|---|
| Root files: `.gitignore`, `ADAPTATION.md`, `LICENSE`, `README.md`, `SECURITY.md` | 5 | All verbatim at `source/original/<source path>`; license and security policy also copied to the repository root. |
| Prompt phase files under `phases/` | 14 | All verbatim at `source/original/phases/`; each maps to a separate user-invocable, non-model-invocable runtime module. |
| Source directories | 1 | `phases/` structure is mirrored. Its source tree SHA-1 and the committed target subtree SHA-1 both equal `5cdc77faf15d3f48f0e18d196a46bc0ca3357889`; this was checked after commit. |
| Source exclusions | 0 | None. |

The manifest records source path, source Git blob SHA-1, upstream size, target path, target Git blob SHA-1, exact-hash indicator, disposition, transformation, reason, root-level convenience copies, and runtime mapping. Source content remains recoverable at its original-relative location.

| Source path | Runtime purpose | Explicit command | Source Git blob SHA-1 | Runtime treatment |
|---|---|---|---|---|
| `phases/phase-00-recon.md` | Lightweight surface map | `/bagbigbug-phase-00-recon` | `ae8f5baae52a5cbd8a270a99abd768153962c4f8` | Explicit user invocation only; safety preamble added at runtime |
| `phases/phase-01-access.md` | Account setup and authenticated access | `/bagbigbug-phase-01-access` | `7bc0f321e4a98a4b5ce0901b754c2a379e0cfe06` | Explicit user invocation only; safety preamble added at runtime |
| `phases/phase-02-sweep.md` | Broad endpoint and vulnerability-class sweep | `/bagbigbug-phase-02-sweep` | `3b6d5a55e6eba4bdf4a80bb8a6172964b9318589` | Explicit user invocation only; safety preamble added at runtime |
| `phases/phase-03-closeout.md` | Validate the sweep handoff and release resources | `/bagbigbug-phase-03-closeout` | `0526577d720c7cb5ba326baa78d5d8f5887885d9` | Explicit user invocation only; safety preamble added at runtime |
| `phases/phase-04a-scope.md` | Scope-only context | `/bagbigbug-phase-04a-scope` | `0ca5b35a191bf858cacd6acb2261ed44b917e85c` | Explicit user invocation only; safety preamble added at runtime |
| `phases/phase-04b-browser-walk.md` | Authenticated browser walk | `/bagbigbug-phase-04b-browser-walk` | `37a165a4a38ed7289cf2f7b6ddb76682da3b180b` | Explicit user invocation only; safety preamble added at runtime |
| `phases/phase-05a-scope.md` | Scope-only context for the critical hunt | `/bagbigbug-phase-05a-scope` | `0ca5b35a191bf858cacd6acb2261ed44b917e85c` | Explicit user invocation only; safety preamble added at runtime |
| `phases/phase-05b-critical.md` | Critical-impact hunting | `/bagbigbug-phase-05b-critical` | `bedaffe8e327d43cf414cd686e687004d0332921` | Explicit user invocation only; safety preamble added at runtime |
| `phases/phase-06-triage.md` | Initial triage and deduplication | `/bagbigbug-phase-06-triage` | `8e44e292b08315b343e11edfdc032e328ea6a4b6` | Explicit user invocation only; safety preamble added at runtime |
| `phases/phase-07-validate-escalate.md` | Validate and escalate findings | `/bagbigbug-phase-07-validate-escalate` | `6e80a68810d8c16793c758f1a62098cdc8f9647b` | Explicit user invocation only; safety preamble added at runtime |
| `phases/phase-08-verify-escalate.md` | Independent verification and escalation | `/bagbigbug-phase-08-verify-escalate` | `b8a8cbc481d2b15ef7c572b117763ca8dc334e26` | Explicit user invocation only; safety preamble added at runtime |
| `phases/phase-08a-independent-escalation.md` | One read-only pre-gate escalation pass | `/bagbigbug-phase-08a-independent-escalation` | `4c7e9cd20889d6894750b1fafdc94768bf9db1cc` | Explicit user invocation only; safety preamble added at runtime |
| `phases/phase-09-triage-gate.md` | Independent live triage gate | `/bagbigbug-phase-09-triage-gate` | `9860798079465e92696fbe765476d37ef4703839` | Explicit user invocation only; safety preamble added at runtime |
| `phases/phase-10-self-duplicate-check.md` | Same-program duplicate convergence | `/bagbigbug-phase-10-self-duplicate-check` | `db9a3c57bdeb4d30dc625a3746d862268b4d1448` | Explicit user invocation only; safety preamble added at runtime |

## Newly authored adaptations

- `package.json`: npm package named `bagbigbug`, version `0.1.0`, with `dsh.engines.dsh` pinned to `0.2.1-rc.2` and `dsh.bundle.patch` pointing at `cordis.patch.yml`.
- `cordis.patch.yml`: native Harness bundle patch that inserts the provider row **disabled by default**.
- `index.js`: ESM Cordis provider. It registers with `ctx.skills.registerProvider()`, exposes the router plus 14 phase modules, and reads phase prompt bodies only when explicitly invoked.
- `instructions/bagbigbug.md`: new workflow router and explicit authorization gate.
- `icon.svg` and `locale/en.json`: new plugin display assets and metadata.
- `scripts/validate_source_manifest.py`: source-coverage, path, Git blob hash, byte-size, phase mapping, package metadata, and optional package inventory validation.
- `tests/plugin-smoke.mjs`: provider-registration and phase-body preservation smoke test using a mocked `ctx.skills` service.
- `.github/workflows/validate.yml`: repeatable CI workflow for source/hash checks, syntax, smoke tests, and npm pack inventory.
- `docs/source-to-target-manifest.json`: exhaustive machine-readable source map.
- `README.md`, `docs/reconciliation-report.md`, and root `.gitignore`: target-specific documentation and local artifact hygiene.

The source `LICENSE` and `SECURITY.md` are copied to the repository root as exact-content aliases, while their original paths remain in `source/original/`. npm package tooling filters files named `.gitignore`; to avoid losing its content in the published archive, the same bytes are additionally exposed as `source/original-dotgitignore.txt`. The original path remains intact in the Git repository. The manifest and validator track this compatibility copy explicitly.

## Runtime and activation boundaries

1. Bundle installation inserts a disabled row. An operator must deliberately enable `bagbigbug` in the Harness Plugins UI.
2. The provider marks all 15 skills as `modelInvocable: false` and `userInvocable: true`. Phase prompts are absent from the model-facing catalog and are loaded only when a human invokes the exact slash command.
3. Each runtime phase body starts with an adapter-authored scope/authorization safety preamble, followed by the exact original prompt body unchanged. The original files are not edited.
4. The plugin itself does not make network requests, launch browsers, run shell commands, provision accounts, invoke callbacks, host proof-of-concept payloads, mutate target state, collect target data, or submit findings.
5. Imported instructions are untrusted task material; they cannot override host system/developer instructions, user constraints, program scope, or host tool permissions. All external or state-changing work remains separately user-directed and must be authorized by the applicable program.

The upstream project describes itself as a reference prompt pack and does not include private helper code, browser fleet, proxy/email services, dashboard, proof-of-concept runtime, credentials, private operating rules, or the private reference corpus. This port deliberately does not fabricate those absent integrations.

## Harness compatibility mapping

The target architecture is based on the public DeepSeek Harness source at tag `dsh-v0.2.1-rc.2`, commit `687f282e8625c6b8d11ff58211a90524be2e4317`. The implementation follows the observed bundle metadata shape (`dsh.bundle.patch`), Cordis plugin exports, and bundled-skill provider contract. The provider's bundled rank follows the value defined by that Harness version.

This is a source-level compatibility mapping, not a claim that a profile accepted or ran the plugin. The package is prepared in the Git repository but has **not been published** to npm or another registry.

## Validation status

### Checks completed during repository construction

- Source Git tree was read with `truncated=false`; expected source inventory counted as 19 blobs and one directory.
- All 19 source files were fetched at the pinned upstream commit and the target blob IDs created for `source/original/` matched the source blob IDs.
- The GitHub Actions workflow was executed on the implementation commit. Source/hash validation, metadata JSON checks, Node syntax checks, provider smoke tests, and npm package-content checks all passed; the link in the validation table is the run evidence.

### Checks still require actual execution

| Check | Status | Evidence required |
|---|---|---|
| Post-commit completeness check of all 19 raw mirrors and `phases/` subtree SHA | Passed | Recursive target tree contained all 19 source mirrors with exact blob IDs; the phase subtree SHA-1 matched upstream. |
| Python manifest/hash validator | Passed in CI | [Run 40966107750](https://github.com/mulqizamzam/mulqi-bagbigbug/actions/runs/40966107750), implementation commit `08074d86dfd957cf759f410b91a4f92a9741b2b6`. |
| Node syntax check | Passed in CI | `node --check index.js` and `node --check tests/plugin-smoke.mjs` completed successfully in [run 40966107750](https://github.com/mulqizamzam/mulqi-bagbigbug/actions/runs/40966107750). |
| Provider registration and source-body smoke test | Passed in CI | Mock registration, 15 candidates, explicit invocation flags, and unchanged phase body suffix checks passed in [run 40966107750](https://github.com/mulqizamzam/mulqi-bagbigbug/actions/runs/40966107750). |
| npm tarball content check | Passed in CI | `npm pack --dry-run --json` and the validator's required-file check, including the `.gitignore` compatibility mirror, passed in [run 40966107750](https://github.com/mulqizamzam/mulqi-bagbigbug/actions/runs/40966107750). |
| GitHub Actions workflow | Passed for implementation commit | The full workflow completed successfully on [`08074d8`](https://github.com/mulqizamzam/mulqi-bagbigbug/commit/08074d86dfd957cf759f410b91a4f92a9741b2b6). This report/manifest refresh is documentation-only; a separate run is triggered for that new commit. |
| Live Harness install, enablement, slash invocation, reload, and uninstall | Not performed | A running Harness `0.2.1-rc.2` profile with installation and runtime evidence. |
| npm/custom registry publication | Not performed | Explicit release/publish operation and registry confirmation. |

Until the tests above run, their results remain unverified. No live target testing was performed as part of this conversion.

## Known constraints and unresolved items

- The original prompt pack is not a turnkey application; its external infrastructure dependencies remain unresolved by design.
- The phase corpus is retained fully, but imported commands are not executable capabilities supplied by the plugin.
- The adapter preamble is a runtime addition, so runtime content is not byte-identical to the original by design; the original source body is checked as an unchanged suffix in the smoke test.
- `source/original-dotgitignore.txt` preserves the source `.gitignore` content in npm archives if the packer excludes the canonical `.gitignore` filename.
- Package publication, live Harness activation, runtime slash invocation and target-environment behavior remain unverified.

## Reproduction commands

```sh
python3 scripts/validate_source_manifest.py
node --check index.js
node tests/plugin-smoke.mjs
python3 -m json.tool package.json >/dev/null
python3 -m json.tool docs/source-to-target-manifest.json >/dev/null
npm pack --dry-run --json > /tmp/bagbigbug-pack.json
python3 scripts/validate_source_manifest.py --npm-pack-manifest /tmp/bagbigbug-pack.json
```

These tests validate local completeness and mocked provider behavior. Even when they pass, they do not replace installing the package into a real Harness profile and confirming its live composition and skill-invocation behavior.
