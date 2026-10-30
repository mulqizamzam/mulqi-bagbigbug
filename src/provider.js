/** DeepSeek Harness skill-provider adapter; all prompt bodies remain source-backed. */
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
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

function toCandidate(skill, bundledSkillRank) {
  return {
    name: skill.name,
    description: skill.description,
    invocation: INVOCATION_POLICY,
    provider: PROVIDER_NAME,
    source: 'bundled',
    resourceBase: skill.kind === 'phase' ? PHASE_RESOURCE_BASE : ROUTER_RESOURCE_BASE,
    rank: bundledSkillRank,
    locator: skill.name,
    metadata: skill.metadata,
  }
}

export function createProvider(registrationSignal, bundledSkillRank) {
  return Object.freeze({
    name: PROVIDER_NAME,
    async list(options = {}) {
      throwIfUnavailable(options.signal, registrationSignal)
      return SKILLS.map((skill) => toCandidate(skill, bundledSkillRank))
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

const requireFromHere = createRequire(import.meta.url)

/**
 * Read the bundled skill rank synchronously from the host Harness.
 *
 * The rank has to be known at registration time, and it must come from the
 * running Harness rather than a duplicated constant, so it is resolved through
 * a synchronous `require` of the peer dependency.
 */
function resolveBundledSkillRank() {
  let mod
  try {
    mod = requireFromHere('@deepseek-ai/dsh-skill')
  } catch (error) {
    throw new Error(
      'bagbigbug: cannot resolve the Harness peer dependency @deepseek-ai/dsh-skill, '
      + 'so the bundled skill rank is unavailable. Install the plugin into a DeepSeek Harness '
      + `profile instead of running it standalone. Cause: ${error?.message ?? error}`,
    )
  }
  const rank = mod?.BUNDLED_SKILL_RANK
  if (typeof rank !== 'number' || !Number.isFinite(rank)) {
    throw new Error('bagbigbug: @deepseek-ai/dsh-skill does not export a numeric BUNDLED_SKILL_RANK')
  }
  return rank
}

/**
 * Register the provider on a Harness skills registry.
 *
 * `SkillRegistry.registerProvider()` invokes the factory SYNCHRONOUSLY and
 * reads `provider.name` off the returned object, so the factory must never be
 * async: an async factory yields a Promise, the registry cannot read a name
 * from it, and the provider is silently skipped. Keeping the rank an argument
 * makes that contract testable without a Harness installation.
 */
export function registerProviderOn(ctx, bundledSkillRank) {
  return ctx.skills.registerProvider((control) => createProvider(control.signal, bundledSkillRank))
}

/** Cordis plugin entry: resolve the host's bundled rank, then register. */
export function apply(ctx) {
  return registerProviderOn(ctx, resolveBundledSkillRank())
}
