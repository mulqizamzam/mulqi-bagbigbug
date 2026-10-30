# Verification — Mulqi BagBigBug

## Refs and evidence

- Target: `mulqizamzam/mulqi-bagbigbug`, branch `main`.
- Pre-refactor head: `7cdb372bf18668143a181a5f7594582fc59da28b`.
- Upstream: `mdpsec/bug-bounty-hunting-prompts@5ed41580564c978417d5f0105f9c92457d77f3b5`.
- Harness baseline: `dsh-v0.2.1-rc.2@687f282e8625c6b8d11ff58211a90524be2e4317`.

## Actual checks

| Check | Status | Evidence |
|---|---|---|
| Upstream tree exhaustive enumeration | PASS | GitHub recursive tree: `truncated=false`, 19 blobs, 495,963 bytes. |
| Source snapshot prior to refactor | PASS | Target `source/original/` tree SHA `802c7d82a957c7641dbe7585f755fd25e0fd3d4f`; phases subtree SHA `5cdc77faf15d3f48f0e18d196a46bc0ca3357889`. |
| Harness contract review | PASS (static source inspection) | Exact tagged provider registry, consumer loader, plugin-development reference, and badge bundle inspected. |
| Historical CI on pre-refactor implementation | PASS | Run 40966230251 tested the previous state; this is not evidence for the new modular refactor. |
| Refactored source/hash validator | PASS | Run [41020319530](https://github.com/mulqizamzam/mulqi-bagbigbug/actions/runs/41020319530): validated all 19 source mirrors and 14 phase mappings. |
| Refactored provider smoke test | PASS | Run [41020319530](https://github.com/mulqizamzam/mulqi-bagbigbug/actions/runs/41020319530): 15 provider skills, all 14 original prompt bodies checked as unchanged suffixes, invocation and abort behavior checked. |
| npm package file inventory | PASS | Run [41020319530](https://github.com/mulqizamzam/mulqi-bagbigbug/actions/runs/41020319530): npm pack archive included every declared source/runtime/evidence path. |
| Real Harness `SkillRegistry` mount + real provider `apply` | PASS | `node scripts/live-harness-verify.mjs`: `discovered: 15/15  router=1 phases=14`; every phase body ends with the byte-exact upstream prompt (`suffix=true`); every skill `model=false user=true`. Mounts the real `@deepseek-ai/dsh-skill` registry from the Harness checkout, not a mock. |
| Real `dsh` CLI profile composition with the bundle patch | PASS | `DSH_HOME=<writable> dsh --profile probe --from-default-profile headless --dump-config` exited 0 (382 composed lines); after declaring `bagbigbug` as a profile bundle, the composed tree contains `# == bagbigbug` / `- id: bagbigbug` / `name: bagbigbug` / `disabled: true`. |
| `dsh plugin --profile … add` via pnpm | NOT PERFORMED (blocked) | pnpm must write its content-addressable store under `~/.local/share/pnpm/store`, outside the writable workspace; it fails `EROFS`. The profile was wired with the equivalent `dependencies` entry plus a `node_modules` symlink. |
| Full boot + enabled plugin + slash invocation in a live GUI session | NOT PERFORMED | Would require enabling the row in a GUI profile and an LLM-backed session. The row ships `disabled: true` by design. |
| Registry publication | NOT PERFORMED | No publishing action requested or performed. |

## CI commands required

- `python3 scripts/validate_source_manifest.py`
- `node --check index.js`
- `node --check src/catalog.js`
- `node --check src/safety.js`
- `node --check src/provider.js`
- `node --check tests/plugin-smoke.mjs`
- `node tests/plugin-smoke.mjs`
- `npm pack --dry-run --json > /tmp/bagbigbug-pack.json`
- `python3 scripts/validate_source_manifest.py --npm-pack-manifest /tmp/bagbigbug-pack.json`

Optional, non-CI live check (needs a resolvable Harness peer dependency):

- `node scripts/live-harness-verify.mjs`

`tests/plugin-smoke.mjs` uses a mock registry and is not end-to-end Cordis. `scripts/live-harness-verify.mjs` mounts the real `@deepseek-ai/dsh-skill` registry with the package's own `apply`, which is the live registry-contract evidence recorded above; it does not boot a GUI profile.
