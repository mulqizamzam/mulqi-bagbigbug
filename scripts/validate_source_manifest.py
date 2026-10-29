#!/usr/bin/env python3
"""Fail-closed source-to-target fidelity and DeepSeek Harness package checks."""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "docs" / "source-to-target-manifest.json"
SOURCE_ROOT = ROOT / "source" / "original"
EXPECTED_HARNESS = "0.2.1-rc.2"


def fail(message: str) -> None:
    print(f"FAIL: {message}", file=sys.stderr)
    raise SystemExit(1)


def git_blob_sha1(data: bytes) -> str:
    header = b"blob " + str(len(data)).encode("ascii") + b"\0"
    return hashlib.sha1(header + data).hexdigest()


def safe_relative_path(value: str) -> bool:
    path = PurePosixPath(value)
    return (
        bool(value)
        and not path.is_absolute()
        and "\\" not in value
        and all(part not in ("", ".", "..") for part in path.parts)
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--npm-pack-manifest", type=Path, help="JSON output from npm pack --dry-run --json")
    args = parser.parse_args()

    try:
        manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    except Exception as exc:
        fail(f"cannot parse source manifest: {exc}")

    items = manifest.get("items")
    if not isinstance(items, list) or len(items) != 19:
        fail("expected 19 upstream file entries, got " + str(len(items) if isinstance(items, list) else "invalid"))

    source_paths: set[str] = set()
    target_paths: set[str] = set()
    for item in items:
        source_path = item.get("source_path", "")
        target_path = item.get("target_path", "")
        if not safe_relative_path(source_path) or not safe_relative_path(target_path):
            fail(f"unsafe source or target path: {source_path!r} -> {target_path!r}")
        if source_path in source_paths or target_path in target_paths:
            fail(f"duplicate manifest path: {source_path} -> {target_path}")
        source_paths.add(source_path)
        target_paths.add(target_path)
        expected_source = item.get("source_git_blob_sha1")
        expected_target = item.get("target_git_blob_sha1")
        if expected_source != expected_target or item.get("target_blob_matches_source_sha1") is not True:
            fail(f"manifest does not attest matching source/target Git blob IDs for {source_path}")
        file_path = ROOT / target_path
        if not file_path.is_file() or file_path.is_symlink():
            fail(f"missing or unsafe preserved file: {target_path}")
        data = file_path.read_bytes()
        if len(data) != item.get("source_size_bytes"):
            fail(f"byte-size mismatch for {target_path}: {len(data)} != {item.get('source_size_bytes')}")
        actual = git_blob_sha1(data)
        if actual != expected_source:
            fail(f"content hash mismatch for {target_path}: {actual} != {expected_source}")

    actual_paths = {
        path.relative_to(ROOT).as_posix()
        for path in SOURCE_ROOT.rglob("*")
        if path.is_file()
    }
    if any(path.is_symlink() for path in SOURCE_ROOT.rglob("*")):
        fail("symlinks are not permitted in the preserved source snapshot")
    if actual_paths != target_paths:
        missing = sorted(target_paths - actual_paths)
        extra = sorted(actual_paths - target_paths)
        fail(f"source snapshot coverage mismatch; missing={missing}, extra={extra}")

    # npm intentionally filters .gitignore files. Preserve the bytes at an explicit
    # packageable alternate path; the original path remains intact in the Git repo.
    gitignore_item = next(item for item in items if item["source_path"] == ".gitignore")
    gitignore_compat = manifest.get("npm_compatibility_mirrors", {}).get(".gitignore")
    if not gitignore_compat or gitignore_compat.get("path") != "source/original-dotgitignore.txt":
        fail("npm compatibility mirror for the upstream .gitignore is not declared")
    compatibility_path = ROOT / gitignore_compat["path"]
    if not compatibility_path.is_file() or compatibility_path.is_symlink():
        fail("missing or unsafe npm compatibility mirror for upstream .gitignore")
    compat_data = compatibility_path.read_bytes()
    if git_blob_sha1(compat_data) != gitignore_item["source_git_blob_sha1"] or len(compat_data) != gitignore_item["source_size_bytes"]:
        fail("npm compatibility mirror does not preserve exact upstream .gitignore bytes")

    phase_items = [item for item in items if item.get("runtime_module")]
    phase_modules = manifest.get("phase_modules", [])
    if len(phase_items) != 14 or len(phase_modules) != 14:
        fail("expected a complete 14-phase source-to-runtime mapping")
    item_modules = {item["runtime_module"]["skill_name"]: item for item in phase_items}
    if {module.get("skill_name") for module in phase_modules} != set(item_modules):
        fail("phase module names do not reconcile with phase source items")
    if any(module.get("model_invocable") is not False or module.get("user_invocable") is not True for module in phase_modules):
        fail("phase modules must be hidden from model invocation and explicitly user-invocable")
    if len({item["source_git_blob_sha1"] for item in phase_items}) != 13:
        fail("expected the preserved duplicate scope-phase content (13 unique phase blobs)")

    try:
        package = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
    except Exception as exc:
        fail(f"cannot parse package.json: {exc}")
    if package.get("name") != "bagbigbug":
        fail("package name is not bagbigbug")
    if package.get("dsh", {}).get("engines", {}).get("dsh") != EXPECTED_HARNESS:
        fail("package must pin dsh.engines.dsh to " + EXPECTED_HARNESS)
    if package.get("dsh", {}).get("bundle", {}).get("patch") != "./cordis.patch.yml":
        fail("package must declare the Harness bundle patch")
    if package.get("main") != "./index.js":
        fail("package entrypoint must be ./index.js")
    for relative in ("index.js", "cordis.patch.yml", "icon.svg", "locale/en.json", "instructions/bagbigbug.md"):
        path = ROOT / relative
        if not path.is_file() or path.is_symlink():
            fail("missing or unsafe runtime file: " + relative)

    source = (ROOT / "index.js").read_text(encoding="utf-8")
    if "export const name = 'bagbigbug'" not in source or "ctx.skills.registerProvider" not in source:
        fail("plugin entry does not expose/register the bagbigbug skill provider")
    if "modelInvocable: false, userInvocable: true" not in source:
        fail("runtime invocation boundary is missing")

    pack_checked = False
    if args.npm_pack_manifest:
        try:
            pack_json = json.loads(args.npm_pack_manifest.read_text(encoding="utf-8"))
            packed_paths = {entry["path"] for entry in pack_json[0].get("files", [])}
        except Exception as exc:
            fail(f"cannot parse npm pack manifest: {exc}")
        # The original .gitignore path is retained in source control. npm filters
        # that filename, so the same bytes must be present at the declared mirror.
        package_source_paths = target_paths - {"source/original/.gitignore"}
        package_source_paths.add(gitignore_compat["path"])
        expected_pack = package_source_paths | {
            "index.js", "cordis.patch.yml", "icon.svg", "locale/en.json",
            "instructions/bagbigbug.md", "package.json", "README.md", "LICENSE",
            "SECURITY.md", "docs/source-to-target-manifest.json", "docs/reconciliation-report.md",
        }
        missing_pack = sorted(expected_pack - packed_paths)
        if missing_pack:
            fail(f"npm package omits required source/runtime paths: {missing_pack}")
        pack_checked = True

    print(json.dumps({
        "status": "passed",
        "upstream_file_count": len(items),
        "verbatim_source_paths_checked": len(actual_paths),
        "phase_source_and_module_mappings": len(phase_items),
        "distinct_phase_blob_sha1": len({item["source_git_blob_sha1"] for item in phase_items}),
        "source_hashes": "Git blob SHA-1 and byte length checked for every preserved file",
        "npm_dotgitignore_mirror": "verified byte-identical",
        "harness_version_declared": package["dsh"]["engines"]["dsh"],
        "plugin_registration_shape": "static check; registration also covered by node tests/plugin-smoke.mjs",
        "npm_pack_contents_checked": pack_checked,
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
