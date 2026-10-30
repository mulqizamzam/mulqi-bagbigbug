import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createProvider, inject, name } from '../src/provider.js'
import { PHASES, SKILLS, SOURCE_COMMIT, INVOCATION_POLICY } from '../src/catalog.js'
import { PHASE_SAFETY_PREAMBLE } from '../src/safety.js'

assert.equal(name, 'bagbigbug')
assert.deepEqual(inject, ['skills'])
assert.equal(SOURCE_COMMIT, '5ed41580564c978417d5f0105f9c92457d77f3b5')
assert.equal(PHASES.length, 14)
assert.equal(SKILLS.length, 15)
assert.equal(new Set(SKILLS.map((skill) => skill.name)).size, 15)

const registration = new AbortController()
const provider = createProvider(registration.signal, 600)
assert.equal(provider.name, 'bagbigbug')

const candidates = await provider.list({})
assert.equal(candidates.length, 15)
assert.ok(candidates.every((candidate) => Number.isInteger(candidate.rank) && candidate.rank > 0))
assert.ok(candidates.every((candidate) => candidate.invocation.modelInvocable === false))
assert.ok(candidates.every((candidate) => candidate.invocation.userInvocable === true))
assert.deepEqual(new Set(candidates.map((candidate) => candidate.name)), new Set(SKILLS.map((skill) => skill.name)))

const routerCandidate = candidates.find((candidate) => candidate.name === 'bagbigbug')
assert.ok(routerCandidate)
const router = await provider.get(routerCandidate, {})
const routerSource = await readFile(new URL('../instructions/bagbigbug.md', import.meta.url), 'utf8')
assert.equal(router.content, routerSource)

for (const phase of PHASES) {
  const candidate = candidates.find((entry) => entry.name === phase.name)
  assert.ok(candidate, 'candidate missing for ' + phase.sourcePath)
  assert.equal(candidate.locator, phase.name)
  assert.equal(candidate.metadata.sourceGitBlobSha1, phase.sourceSha1)
  const original = await readFile(phase.file, 'utf8')
  const loaded = await provider.get(candidate, {})
  assert.ok(loaded.content.startsWith(PHASE_SAFETY_PREAMBLE))
  assert.ok(loaded.content.endsWith(original), phase.sourcePath + ' must remain an unchanged suffix')
  assert.equal(loaded.metadata.sourceGitBlobSha1, phase.sourceSha1)
  assert.ok(loaded.resourceBase.path.endsWith('/source/original/phases/'))
}

await assert.rejects(provider.get({ name: 'not-registered', locator: 'not-registered' }, {}), /Unknown bagbigbug skill candidate/)
const aborted = new AbortController()
aborted.abort(new Error('cancelled by test'))
await assert.rejects(provider.list({ signal: aborted.signal }), /cancelled by test/)
await assert.rejects(provider.get(routerCandidate, { signal: aborted.signal }), /cancelled by test/)

const entry = await readFile(new URL('../index.js', import.meta.url), 'utf8')
assert.match(entry, /export \\{ name, inject, apply \\} from '\\.\\/src\\/provider\\.js'/)
const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
assert.ok(packageJson.files.includes('src/'))
const patch = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8')
assert.match(patch, /id: bagbigbug/)
assert.match(patch, /disabled: true/)

registration.abort(new Error('provider disposed'))
await assert.rejects(provider.list({}), /provider disposed/)

console.log(JSON.stringify({
  status: 'passed',
  skills: candidates.length,
  phases: PHASES.length,
  rank: candidates[0].rank,
  sourceBodies: 'all 14 source prompts verified as unchanged runtime suffixes',
  invocation: 'all skills are user-invocable and model-invocation-disabled',
  cancellation: 'caller and registration abort signals enforced',
  lifecycle: 'registration disposer returned and aborts provider',
}, null, 2))
