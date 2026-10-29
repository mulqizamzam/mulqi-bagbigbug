import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { apply, inject, name } from '../index.js'

assert.equal(name, 'bagbigbug')
assert.deepEqual(inject, ['skills'])

let provider
const ctx = {
  skills: {
    registerProvider(factory) {
      provider = factory()
      return function dispose() {}
    }
  }
}
apply(ctx)
assert.ok(provider, 'apply() must register the skill provider')
assert.equal(provider.name, 'bagbigbug')

const candidates = await provider.list()
assert.equal(candidates.length, 15, 'router + 14 source phase modules')
assert.equal(new Set(candidates.map(skill => skill.name)).size, 15)
assert.ok(candidates.every(skill => skill.invocation.modelInvocable === false))
assert.ok(candidates.every(skill => skill.invocation.userInvocable === true))

const routerCandidate = candidates.find(skill => skill.name === 'bagbigbug')
assert.ok(routerCandidate)
const router = await provider.get(routerCandidate)
const routerSource = await readFile(new URL('../instructions/bagbigbug.md', import.meta.url), 'utf8')
assert.equal(router.content, routerSource, 'router must load its authored instruction file without mutation')

for (const candidate of candidates.filter(skill => skill.name !== 'bagbigbug')) {
  const sourcePath = candidate.metadata.sourcePath
  const original = await readFile(new URL('../source/original/' + sourcePath, import.meta.url), 'utf8')
  const loaded = await provider.get(candidate)
  assert.ok(loaded.content.startsWith('# Mandatory authorization and host-safety boundary (adapter-added)'))
  assert.ok(loaded.content.endsWith(original), sourcePath + ' source body must remain an unchanged suffix')
  assert.equal(loaded.metadata.sourceGitBlobSha1, candidate.metadata.sourceGitBlobSha1)
  assert.ok(loaded.resourceBase.path.endsWith('/source/original/phases/'), 'relative resources resolve from the original phase directory')
  assert.equal(loaded.invocation.modelInvocable, false)
  assert.equal(loaded.invocation.userInvocable, true)
}
console.log(JSON.stringify({
  status: 'passed',
  registration: 'provider registered through ctx.skills.registerProvider',
  skills: candidates.length,
  router: 'explicit user invocation only',
  phaseModules: candidates.length - 1,
  phaseLoading: 'each source prompt body verified as an unchanged suffix after adapter preamble'
}, null, 2))
