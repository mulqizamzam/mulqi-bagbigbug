#!/usr/bin/env python3
"""Fail-closed source fidelity and refactored DeepSeek Harness package checks."""
from __future__ import annotations
import argparse
import hashlib
import json
import sys
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / 'docs' / 'source-to-target-manifest.json'
SOURCE_ROOT = ROOT / 'source' / 'original'
EXPECTED_HARNESS = '0.2.1-rc.2'

def fail(message: str) -> None:
    print(f'FAIL: {message}', file=sys.stderr)
    raise SystemExit(1)

def git_blob_sha1(data: bytes) -> str:
    return hashlib.sha1(b'blob ' + str(len(data)).encode('ascii') + b'\\0' + data).hexdigest()

def safe_relative_path(value: str) -> bool:
    path = PurePosixPath(value)
    return bool(value) and not path.is_absolute() and '\\\\' not in value and all(
        part not in ('', '.', '..') for part in path.parts
    )

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--npm-pack-manifest', type=Path)
    args = parser.parse_args()
    try:
        manifest = json.loads(MANIFEST_PATH.read_text(encoding='utf-8'))
    except Exception as exc:
        fail(f'cannot parse source manifest: {exc}')
    items = manifest.get('items')
    if not isinstance(items, list) or len(items) != 19:
        fail('expected 19 upstream file entries')
    source_paths: set[str] = set()
    target_paths: set[str] = set()
    for item in items:
        source_path, target_path = item.get('source_path', ''), item.get('target_path', '')
        if not safe_relative_path(source_path) or not safe_relative_path(target_path):
            fail(f'unsafe source/target path: {source_path!r} -> {target_path!r}')
        if source_path in source_paths or target_path in target_paths:
            fail(f'duplicate manifest path: {source_path} -> {target_path}')
        source_paths.add(source_path); target_paths.add(target_path)
        expected = item.get('source_git_blob_sha1')
        if item.get('target_git_blob_sha1') != expected or item.get('target_blob_matches_source_sha1') is not True:
            fail(f'manifest does not attest exact Git blob identity for {source_path}')
        path = ROOT / target_path
        if not path.is_file() or path.is_symlink(): fail(f'missing or unsafe preserved source file: {target_path}')
        data = path.read_bytes()
        if len(data) != item.get('source_size_bytes') or git_blob_sha1(data) != expected:
            fail(f'source fidelity failure: {target_path}')
    actual_paths = {path.relative_to(ROOT).as_posix() for path in SOURCE_ROOT.rglob('*') if path.is_file()}
    if any(path.is_symlink() for path in SOURCE_ROOT.rglob('*')) or actual_paths != target_paths:
        fail('preserved source snapshot tree differs from manifest')
    gitignore_item = next(item for item in items if item['source_path'] == '.gitignore')
    compat = manifest.get('npm_compatibility_mirrors', {}).get('.gitignore')
    if not compat or compat.get('path') != 'source/original-dotgitignore.txt': fail('missing declared npm .gitignore compatibility mirror')
    compat_path = ROOT / compat['path']
    if not compat_path.is_file() or compat_path.is_symlink(): fail('missing npm compatibility mirror bytes')
    compat_data = compat_path.read_bytes()
    if len(compat_data) != gitignore_item['source_size_bytes'] or git_blob_sha1(compat_data) != gitignore_item['source_git_blob_sha1']:
        fail('npm compatibility mirror is not byte-identical')
    phase_items = [item for item in items if item.get('runtime_module')]
    phase_modules = manifest.get('phase_modules', [])
    if len(phase_items) != 14 or len(phase_modules) != 14: fail('expected all 14 source phase mappings')
    item_names = {item['runtime_module']['skill_name'] for item in phase_items}
    if {module.get('skill_name') for module in phase_modules} != item_names: fail('phase mapping names do not reconcile')
    if any(module.get('model_invocable') is not False or module.get('user_invocable') is not True for module in phase_modules):
        fail('phase invocation policy mismatch')
    if len({item['source_git_blob_sha1'] for item in phase_items}) != 13: fail('duplicate source phase blobs not accounted for')
    package = json.loads((ROOT / 'package.json').read_text(encoding='utf-8'))
    if package.get('name') != 'bagbigbug': fail('unexpected package name')
    if package.get('dsh', {}).get('engines', {}).get('dsh') != EXPECTED_HARNESS: fail('wrong Harness engine pin')
    if package.get('dsh', {}).get('bundle', {}).get('patch') != './cordis.patch.yml': fail('bundle patch is not declared')
    if package.get('main') != './index.js': fail('main entry must be ./index.js')
    required = ['index.js', 'src/catalog.js', 'src/provider.js', 'src/safety.js', 'cordis.patch.yml', 'icon.svg', 'locale/en.json', 'instructions/bagbigbug.md']
    for relative in required:
        path = ROOT / relative
        if not path.is_file() or path.is_symlink(): fail('missing or unsafe runtime file: ' + relative)
    entry = (ROOT / 'index.js').read_text(encoding='utf-8').strip()
    if entry != "export { name, inject, apply } from './src/provider.js'": fail('index.js is not the thin provider entrypoint')
    provider = (ROOT / 'src/provider.js').read_text(encoding='utf-8')
    for token in ('BUNDLED_SKILL_RANK', 'ctx.skills.registerProvider', 'PHASE_SAFETY_PREAMBLE'):
        if token not in provider: fail('provider is missing required contract: ' + token)
    catalog = (ROOT / 'src/catalog.js').read_text(encoding='utf-8')
    if 'sourceGitBlobSha1' not in catalog or 'phase-10-self-duplicate-check' not in catalog: fail('catalog lacks phase provenance/coverage')
    safety = (ROOT / 'src/safety.js').read_text(encoding='utf-8')
    if 'Mandatory authorization and host-safety boundary' not in safety: fail('safety boundary missing')
    pack_checked = False
    if args.npm_pack_manifest:
        try: packed = {entry['path'] for entry in json.loads(args.npm_pack_manifest.read_text(encoding='utf-8'))[0].get('files', [])}
        except Exception as exc: fail(f'cannot parse npm pack manifest: {exc}')
        source_pack = target_paths - {'source/original/.gitignore'}
        source_pack.add(compat['path'])
        expected = source_pack | set(required) | {'package.json', 'README.md', 'LICENSE', 'SECURITY.md', 'docs/source-to-target-manifest.json', 'docs/reconciliation-report.md', 'repo-inventory.md', 'capability-map.md', 'ledger.md', 'verification.md', 'CONVERSION_REPORT.md', 'scripts/validate_source_manifest.py'}
        missing = sorted(expected - packed)
        if missing: fail('npm archive omitted required paths: ' + ', '.join(missing))
        pack_checked = True
    print(json.dumps({'status':'passed','upstream_files':len(items),'source_mirrors_verified':len(actual_paths),'source_bytes':manifest['source_snapshot']['total_file_bytes'],'phase_mappings':len(phase_items),'unique_phase_blobs':13,'npm_pack_contents_checked':pack_checked,'provider_contract':'BUNDLED_SKILL_RANK import; ctx.skills.registerProvider'}, indent=2))
    return 0

if __name__ == '__main__': raise SystemExit(main())
