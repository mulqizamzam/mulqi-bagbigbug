/** DeepSeek Harness skill-provider adapter; all prompt bodies remain source-backed. */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { BUNDLED_SKILL_RANK } from '@deepseek-ai/dsh-skill'
import { INVOCATION_POLICY, PROVIDER_NAME, SKILLS } from './catalog.js'
import { PHASE_SAFETY_PREAMBLE } from './safety.js'

export const name = PROVIDER_NAME
export const inject = ['skills']

const ROUTER_RESOURCE_BASE = Object.freeze({
  kind: 'directory',
  path: fileURLToPath(new URL('../', import.meta.url)),
})
const PHASE_RESOURCE_BASE = Object.freeze({
  kind: 'directory',
  path: fileURLToPath(new URL('../source/original/phases/', import.meta.url)),
})
const SKILL_BY_NAME = new Map(SKILLS.map((skill) => [skill.name, skill]))

function throwIfUnavailable(signal, registrationSignal) {
  signal?.throwIfAborted()
  registrationSignal?.throwIfAborted()
}

function toCandidate(skill) {
  return {
    name: skill.name,
    description: skill.description,
    invocation: INVOCATION_POLICY,
    provider: PROVIDER_NAME,
    source: 'bundled',
    resourceBase: skill.kind === 'phase' ? PHASE_RESOURCE_BASE : ROUTER_RESOURCE_BASE,
    rank: BUNDLED_SKILL_RANK,
    locator: skill.name,
    metadata: skill.metadata,
  }
}

function createProvider(registrationSignal) {
  return Object.freeze({
    name: PROVIDER_NAME,
    async list(options = {}) {
      throwIfUnavailable(options.signal, registrationSignal)
      return SKILLS.map(toCandidate)
    },
    async get(candidate, options = {}) {
      throwIfUnavailable(options.signal, registrationSignal)
      const definition = SKILL_BY_NAME.get(candidate?.name)
      if (!definition || candidate.locator !== definition.name) {
        throw new Error('Unknown bagbigbug skill candidate "' + String(candidate?.name) + '"')
      }
      const sourceContent = await readFile(definition.file, 'utf8')
      throwIfUnavailable(options.signal, registrationSignal)
      return {
        name: definition.name,
        description: definition.description,
        invocation: INVOCATION_POLICY,
        provider: PROVIDER_NAME,
        source: 'bundled',
        resourceBase: definition.kind === 'phase' ? PHASE_RESOURCE_BASE : ROUTER_RESOURCE_BASE,
        content: definition.kind === 'phase'
          ? PHASE_SAFETY_PREAMBLE + '\n\n' + sourceContent
          : sourceContent,
        metadata: definition.metadata,
      }
    },
  })
}

/** Register the provider and return Cordis' registration disposer. */
export function apply(ctx) {
  return ctx.skills.registerProvider((control) => createProvider(control.signal))
}
