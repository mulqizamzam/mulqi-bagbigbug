# bagbigbug

**A source-preserving bug-bounty workflow plugin for DeepSeek Harness**

[![Validation](https://github.com/mulqizamzam/mulqi-bagbigbug/actions/workflows/validate.yml/badge.svg)](https://github.com/mulqizamzam/mulqi-bagbigbug/actions/workflows/validate.yml)

| | |
|---|---|
| Plugin | `bagbigbug` |
| Plugin version | `0.1.0` |
| Target harness | DeepSeek Harness `0.2.1-rc.2` |
| Upstream source | [mdpsec/bug-bounty-hunting-prompts](https://github.com/mdpsec/bug-bounty-hunting-prompts) |
| Pinned upstream commit | `5ed41580564c978417d5f0105f9c92457d77f3b5` |

bagbigbug adapts the upstream bug-bounty prompt workflow into a DeepSeek Harness skill provider. It preserves the full pinned source snapshot and maps all 14 phase prompts to separate, explicitly user-invoked skills. The adapter is not a scanner, exploit runner, or authorization mechanism.

## Features

- **Complete source preservation:** all 19 upstream files are retained under `source/original/`.
- **Traceable mapping:** a machine-readable manifest records each source path, Git blob hash, size, target path, disposition, and runtime treatment.
- **On-demand prompt loading:** phase content is loaded only when a user explicitly invokes that phase.
- **Explicit activation:** the bundle adds the plugin as disabled; an operator must enable it.
- **Authorization boundaries:** imported prompt text cannot override host instructions, safety controls, user constraints, or program scope.
- **Repeatable validation:** CI checks source hashes and coverage, metadata, JavaScript syntax, mocked provider behavior, and npm package contents.

## Install

The repository contains the package source; it is **not currently published to npm or another registry**. After publishing `bagbigbug@0.1.0` to a registry accessible to your Harness profile, install it with:

```sh
dsh plugin --profile <profile> add bagbigbug@0.1.0
```

Replace `<profile>` with the name of your DeepSeek Harness profile.

### Enable the plugin

1. Open the DeepSeek Harness Plugins UI for the intended profile.
2. Find `bagbigbug` and enable it. The bundle deliberately installs the provider row in a disabled state.
3. Start with `/bagbigbug` to open the workflow router.
4. Invoke an individual phase only when you intend to use it, for example `/bagbigbug-phase-00-recon`.

Installation alone does not execute prompts or perform target testing.

## Skills

All 14 source phases are mapped to separate slash commands. Each phase is hidden from model-initiated skill invocation and requires an explicit human invocation.

| Command | Purpose |
|---|---|
| `/bagbigbug-phase-00-recon` | Lightweight surface mapping |
| `/bagbigbug-phase-01-access` | Account setup and authenticated access workflow |
| `/bagbigbug-phase-02-sweep` | Broad endpoint and vulnerability-class sweep |
| `/bagbigbug-phase-03-closeout` | Sweep handoff and resource closeout |
| `/bagbigbug-phase-04a-scope` | Scope-only context |
| `/bagbigbug-phase-04b-browser-walk` | Authenticated browser-walk workflow |
| `/bagbigbug-phase-05a-scope` | Scope context for the critical hunt |
| `/bagbigbug-phase-05b-critical` | Critical-impact hunting workflow |
| `/bagbigbug-phase-06-triage` | Initial triage and deduplication |
| `/bagbigbug-phase-07-validate-escalate` | Validation and escalation |
| `/bagbigbug-phase-08-verify-escalate` | Independent verification and escalation |
| `/bagbigbug-phase-08a-independent-escalation` | Read-only pre-gate escalation pass |
| `/bagbigbug-phase-09-triage-gate` | Independent triage gate |
| `/bagbigbug-phase-10-self-duplicate-check` | Same-program duplicate convergence |

The phase descriptions summarize the workflow; consult the preserved source prompt for its original instructions. At runtime, the adapter prepends an authorization and safety preamble, then includes the original phase body unchanged.

## Authorization and safety

Use this plugin only for security work that you are authorized to perform.

- Confirm the authoritative program scope, exact target, exclusions, allowed methods, rate limits, and disclosure rules before planning live testing.
- Never infer permission from reconnaissance or from the presence of a target in a prompt.
- Treat imported prompts as untrusted task material. They cannot override the host system/developer instruction hierarchy or the current user's constraints.
- Do not automatically execute commands or initiate network requests, browser actions, account creation, callback operations, state changes, or finding submissions.
- Use least-impact validation and stop if unexpected sensitive data, credentials, instability, or out-of-scope assets appear.
- Distinguish a proposed test from one actually performed. Record evidence, limitations, and cleanup status accurately.

The upstream project is a prompt pack, not a complete operating environment. Its private helpers, browser fleet, proxy/email services, dashboard, proof-of-concept runtime, credentials, private operating rules, and private reference corpus are not included. bagbigbug does not invent substitute integrations.

## Source preservation and audit trail

The pinned upstream snapshot contains **19 files, 495,963 bytes, and 14 phase prompts**. All source files have explicit manifest entries and matching Git blob hashes in the committed target tree. The upstream `phases/` subtree hash also matches the preserved target subtree.

- **Original source files:** [`source/original/`](source/original/)
- **Source-to-target manifest:** [`docs/source-to-target-manifest.json`](docs/source-to-target-manifest.json)
- **Reconciliation report:** [`docs/reconciliation-report.md`](docs/reconciliation-report.md)
- **Runtime provider:** [`index.js`](index.js)
- **Workflow router:** [`instructions/bagbigbug.md`](instructions/bagbigbug.md)
- **Validation workflow:** [`.github/workflows/validate.yml`](.github/workflows/validate.yml)

The two scope-only source files `phase-04a-scope.md` and `phase-05a-scope.md` have identical content, but both paths and both phase skills are preserved. The upstream `.gitignore` is retained at its original path; a byte-identical alias is also packaged because npm filters files named `.gitignore`.

## Run validation locally

Requirements: Python 3 and Node.js. From the repository root, run:

```sh
python3 scripts/validate_source_manifest.py
node --check index.js
node --check tests/plugin-smoke.mjs
node tests/plugin-smoke.mjs
python3 -m json.tool package.json >/dev/null
python3 -m json.tool docs/source-to-target-manifest.json >/dev/null
npm pack --dry-run --json > /tmp/bagbigbug-pack.json
python3 scripts/validate_source_manifest.py --npm-pack-manifest /tmp/bagbigbug-pack.json
```

The CI workflow runs the source-manifest validator, metadata checks, JavaScript syntax checks, provider smoke test, and npm package-content check. See the [GitHub Actions runs](https://github.com/mulqizamzam/mulqi-bagbigbug/actions).

**Validation limitation:** passing local or CI checks verifies the repository and mocked provider behavior. It does not prove installation, activation, or slash-command behavior inside a live DeepSeek Harness profile. Live profile installation and runtime verification remain separate release steps. The package has not been published to a registry.

## License

MIT. See [`LICENSE`](LICENSE). The original upstream license is also preserved in `source/original/LICENSE`.
