#!/usr/bin/env node
/**
 * Live DeepSeek Harness verification for the bagbigbug provider.
 *
 * Mounts the REAL Harness SkillRegistry (not a mock) and the package's own
 * provider entry (`apply` from src/provider.js), then lists and loads every
 * skill exactly as the host would.
 *
 * Two claims are checked per phase skill:
 *   1. the loaded body ENDS with the byte-exact upstream prompt from
 *      source/original/phases/<file> (the adapter prepends a safety preamble,
 *      so the source must be an unchanged suffix);
 *   2. the invocation policy is modelInvocable:false / userInvocable:true.
 *
 * Requires @deepseek-ai/dsh-skill to be resolvable from this package; point
 * DSH_REPO at a DeepSeek Harness checkout to wire that up automatically.
 *
 * Usage: node scripts/live-harness-verify.mjs [--json]
 */
import { readFile, mkdir, symlink, rm } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const harnessRepo = process.env.DSH_REPO ?? '/home/administrator/deepseek-harness'
const failures = []

/** Wire @deepseek-ai/dsh-skill from a Harness checkout if it is not already resolvable. */
async function ensureHarnessResolution() {
  try {
    await import('@deepseek-ai/dsh-skill')
    return 'already-resolvable'
  } catch {
    /* fall through to the checkout shim */
  }
  const linkDir = join(root, 'node_modules', '@deepseek-ai')
  await mkdir(linkDir, { recursive: true })
  const target = join(harnessRepo, 'packages', 'skill', 'skill')
  await rm(join(linkDir, 'dsh-skill'), { recursive: true, force: true })
  await symlink(target, join(linkDir, 'dsh-skill'), 'dir')
  await import('@deepseek-ai/dsh-skill')
  return `linked from ${target}`
}

const resolution = await ensureHarnessResolution()
const { Context } = await import('@deepseek-ai/cordis')
const { default: SkillRegistry } = await import('@deepseek-ai/dsh-skill')
const providerModule = await import(pathToFileURL(join(root, 'src', 'provider.js')).href)
const { SKILLS } = await import(pathToFileURL(join(root, 'src', 'catalog.js')).href)

const ctx = new Context()
let fiber
let report
try {
  await ctx.plugin(SkillRegistry)
  fiber = await ctx.plugin(providerModule)

  const summaries = await ctx.skills.list({ cwd: root })
  const listed = summaries.map((s) => s.name).sort()
  const expected = SKILLS.map((s) => s.name).sort()
  if (JSON.stringify(listed) !== JSON.stringify(expected)) {
    failures.push(`listed set mismatch\n  listed:   ${listed.join(', ')}\n  expected: ${expected.join(', ')}`)
  }

  const loaded = []
  for (const summary of summaries) {
    const definition = await ctx.skills.get(summary.name, { cwd: root })
    if (definition === undefined) {
      failures.push(`${summary.name}: listed but get() returned undefined`)
      continue
    }
    const catalogEntry = SKILLS.find((s) => s.name === summary.name)
    const isPhase = catalogEntry?.kind === 'phase'
    let sourceSuffix = null
    if (isPhase) {
      const sourceText = await readFile(catalogEntry.file, 'utf8')
      sourceSuffix = definition.content.endsWith(sourceText)
      if (!sourceSuffix) failures.push(`${summary.name}: body does not end with the byte-exact source prompt`)
    }
    const invocation = definition.invocation ?? {}
    if (isPhase && (invocation.modelInvocable !== false || invocation.userInvocable !== true)) {
      failures.push(`${summary.name}: invocation policy is ${JSON.stringify(invocation)}, expected model=false/user=true`)
    }
    if (definition.provider !== 'bagbigbug') {
      failures.push(`${summary.name}: provider "${definition.provider}" != "bagbigbug"`)
    }
    if (!definition.description) failures.push(`${summary.name}: empty description`)
    loaded.push({
      name: definition.name,
      kind: catalogEntry?.kind ?? 'unknown',
      description: definition.description,
      provider: definition.provider,
      source: definition.source,
      rank: definition.rank ?? null,
      invocation: { modelInvocable: invocation.modelInvocable, userInvocable: invocation.userInvocable },
      contentChars: definition.content.length,
      sourceSuffixByteExact: sourceSuffix,
    })
  }

  report = {
    ok: failures.length === 0,
    harnessRepo,
    harnessResolution: resolution,
    provider: providerModule.name,
    discovered: summaries.length,
    expected: expected.length,
    phases: loaded.filter((s) => s.kind === 'phase').length,
    router: loaded.filter((s) => s.kind !== 'phase').length,
    skills: loaded,
    failures,
  }
} catch (error) {
  report = { ok: false, failures: [...failures, `crash: ${error?.stack ?? error}`], skills: [] }
} finally {
  try {
    await fiber?.dispose()
  } catch {
    /* teardown best effort */
  }
}

if (process.argv.includes('--json')) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
} else {
  process.stdout.write(`provider: ${report.provider} (harness resolution: ${report.harnessResolution})\n`)
  process.stdout.write(`discovered: ${report.discovered}/${report.expected}  router=${report.router} phases=${report.phases}\n\n`)
  for (const s of report.skills) {
    process.stdout.write(
      `${s.name.padEnd(46)} ${String(s.contentChars).padStart(7)} chars  `
      + `suffix=${String(s.sourceSuffixByteExact).padEnd(5)} model=${String(s.invocation.modelInvocable).padEnd(5)} user=${s.invocation.userInvocable}\n`,
    )
  }
  for (const f of report.failures) process.stderr.write(`FAIL: ${f}\n`)
  process.stdout.write(report.ok ? '\nLIVE HARNESS VERIFY OK\n' : `\nLIVE HARNESS VERIFY FAILED (${report.failures.length})\n`)
}
process.exit(report.ok ? 0 : 1)