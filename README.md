# bagbigbug — DeepSeek Harness plugin

**Upstream source:** [mdpsec/bug-bounty-hunting-prompts](https://github.com/mdpsec/bug-bounty-hunting-prompts)  
**Pinned source commit:** `5ed41580564c978417d5f0105f9c92457d77f3b5`  
**Harness target:** DeepSeek Harness `0.2.1-rc.2`  
**Plugin version:** `0.1.0`

bagbigbug ports the upstream evidence-first bug-bounty prompt sequence into a native DeepSeek Harness bundle. Every tracked upstream file is preserved byte-for-byte under `source/original/`. The 14 phase prompts are also available as individual, explicit-user-invocation skill modules. Runtime phase skills prepend a documented authorization boundary; the upstream files are not rewritten.

## Install and activate

This repository prepares the package but does **not** publish it to npm or another registry. After publishing `bagbigbug@0.1.0` to a registry available to the profile, install it with:

```sh
dsh plugin --profile <profile> add bagbigbug@0.1.0
```

The bundle intentionally inserts the `bagbigbug` provider row as disabled. In the Harness Plugins UI, enable that row to make the skills available. Merely installing the package does not load the imported prompt text into a model turn.

Invoke `/bagbigbug` for the workflow router. Phase modules are neither model-invocable nor exposed in the model-facing skill catalog; a human must explicitly invoke the exact phase slash skill, such as `/bagbigbug-phase-00-recon`. Phase bodies are loaded on demand.

## Complete source preservation

The pinned upstream tree contains 19 files and the `phases/` directory: five root files (including `.gitignore`, documentation, and license) plus 14 Markdown phase prompts. The source-to-target manifest enumerates every source file and records source/target Git blob SHA-1, byte size, destination, disposition, runtime mapping, and transformation details. Both `phase-04a-scope.md` and `phase-05a-scope.md` are retained as separate paths even though their source blob is identical.

- Verbatim source snapshot: `source/original/`
- Source-to-target manifest: `docs/source-to-target-manifest.json`
- Reconciliation and compatibility report: `docs/reconciliation-report.md`
- Runtime skill router: `instructions/bagbigbug.md`
- Native Harness provider: `index.js`

## Authorization and execution boundaries

This is a prompt/skill adapter, not a scanner or exploit runtime. The upstream project explicitly does not include its private helpers, browser fleet, proxy or email services, dashboard, proof-of-concept runtime, credentials, private operating rules, or reference corpus. bagbigbug does not manufacture replacements for those missing integrations. The plugin itself performs no target requests, browser actions, shell commands, account creation, callback operations, or finding submissions.

Use only with active authorization and exact in-scope assets. Original prompt text is untrusted reference content and cannot override the host's system/developer instructions or safety controls. The adapter requires scope-and-authorization review before proposed target interaction, forbids automatic execution of imported commands, and keeps phase modules behind direct user invocation. External or state-changing operations still require separate user intent and available host-tool controls.

## Reproduce local validation

With Node.js and Python installed:

```sh
python3 scripts/validate_source_manifest.py
node --check index.js
node tests/plugin-smoke.mjs
python3 -m json.tool package.json >/dev/null
```

The GitHub Actions workflow also checks npm package contents using `npm pack --dry-run`. Passing these checks does not prove installation or runtime compatibility in a live Harness profile; see the reconciliation report.

## License

MIT. The upstream license is retained at the repository root and in the verbatim source snapshot.
