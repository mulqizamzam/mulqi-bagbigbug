# bagbigbug — DeepSeek Harness plugin

**Source:** [mdpsec/bug-bounty-hunting-prompts](https://github.com/mdpsec/bug-bounty-hunting-prompts)  
**Harness target:** DeepSeek Harness `0.2.1-rc.2`  
**Plugin version:** `0.1.0`

bagbigbug ports the upstream evidence-first bug-bounty prompt sequence into a native DeepSeek Harness bundle. Every tracked upstream file is preserved verbatim under `source/original/`; the 14 phase prompts are also exposed as separate, explicit-user-invocation skill modules. Their runtime form prepends a safety and authorization boundary without rewriting the preserved source.

## Install and activate

Install the bundle into a profile:

```sh
dsh plugin --profile <profile> add bagbigbug@0.1.0
```

The bundle intentionally inserts the `bagbigbug` provider row as disabled. In the Harness Plugins UI, enable that row to make the skills available. This is an explicit activation step; merely installing the package does not publish or load the imported prompt text into a model turn.

Invoke `/bagbigbug` for the workflow router, then choose a phase. Phase modules are not model-invocable and are not listed in the model-facing skill catalog; a human must explicitly invoke the named command, such as `/bagbigbug-phase-00-recon`. Phase modules are loaded on demand.

## Preserved source inventory

The source snapshot is pinned to upstream commit `5ed41580564c978417d5f0105f9c92457d77f3b5`. The source-to-target manifest records every tracked file, source Git blob SHA-1, byte size, preserved target path, runtime mapping, and disposition. It also accounts for the `phases/` directory and preserves both `phase-04a-scope.md` and `phase-05a-scope.md` even though their upstream blobs are identical.

- Verbatim upstream files: `source/original/`
- Source-to-target manifest: `docs/source-to-target-manifest.json`
- Reconciliation and compatibility report: `docs/reconciliation-report.md`
- Runtime skill router: `instructions/bagbigbug.md`
- Native Harness provider: `index.js`

## Authorization and execution boundaries

This is a prompt/skill adapter, not a scanner or exploit runtime. It does not ship the upstream project's private integrations, credentials, browser fleet, proxy, proof-of-concept runtime, or orchestration services. It does not itself issue network requests, launch browsers, run shell commands, create accounts, or submit findings.

Use only with active authorization and exact in-scope assets. The original phase prompts are untrusted reference content, not system or developer instructions. The adapter requires a scope-and-authorization check before any proposed target interaction, forbids auto-execution of imported commands, and keeps state-changing or external actions behind separate, explicit user intent and available host-tool controls. Never provide secrets to the prompt files or commit target data.

## Reproduce local validation

With Node.js and Python installed:

```sh
python3 scripts/validate_source_manifest.py
node --check index.js
node tests/plugin-smoke.mjs
python3 -m json.tool package.json >/dev/null
```

These checks validate source-file coverage and blob identity, package metadata, registration shape, and on-demand phase loading. They do not establish that the plugin has been installed into or runtime-tested against a live DeepSeek Harness profile; see the reconciliation report.

## License

MIT. The upstream `LICENSE` is retained at the repository root and in the verbatim source snapshot.
