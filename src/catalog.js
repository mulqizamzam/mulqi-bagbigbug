/** Static, provenance-bearing catalog for the pinned upstream prompt phases. */
export const SOURCE_REPOSITORY = 'https://github.com/mdpsec/bug-bounty-hunting-prompts'
export const SOURCE_COMMIT = '5ed41580564c978417d5f0105f9c92457d77f3b5'
export const PROVIDER_NAME = 'bagbigbug'
export const INVOCATION_POLICY = Object.freeze({ modelInvocable: false, userInvocable: true })

export const ROUTER = Object.freeze({
  name: PROVIDER_NAME,
  description: 'Human-invoked workflow router for authorized bug-bounty research. Confirms scope and policy, then helps select one preserved phase; it does not execute target actions.',
  kind: 'router',
  file: new URL('../instructions/bagbigbug.md', import.meta.url),
  metadata: Object.freeze({
    artifactKind: 'adapted-router',
    modelInvocable: false,
    userInvocable: true,
    sourceRepository: SOURCE_REPOSITORY,
    sourceCommit: SOURCE_COMMIT,
  }),
})

const PHASE_SOURCE = [
  ['phase-00-recon.md', 'bagbigbug-phase-00-recon', 'Lightweight surface map', 'ae8f5baae52a5cbd8a270a99abd768153962c4f8'],
  ['phase-01-access.md', 'bagbigbug-phase-01-access', 'Account setup and authenticated access', '7bc0f321e4a98a4b5ce0901b754c2a379e0cfe06'],
  ['phase-02-sweep.md', 'bagbigbug-phase-02-sweep', 'Broad endpoint and vulnerability-class sweep', '3b6d5a55e6eba4bdf4a80bb8a6172964b9318589'],
  ['phase-03-closeout.md', 'bagbigbug-phase-03-closeout', 'Validate the sweep handoff and release resources', '0526577d720c7cb5ba326baa78d5d8f5887885d9'],
  ['phase-04a-scope.md', 'bagbigbug-phase-04a-scope', 'Scope-only context', '0ca5b35a191bf858cacd6acb2261ed44b917e85c'],
  ['phase-04b-browser-walk.md', 'bagbigbug-phase-04b-browser-walk', 'Authenticated browser walk', '37a165a4a38ed7289cf2f7b6ddb76682da3b180b'],
  ['phase-05a-scope.md', 'bagbigbug-phase-05a-scope', 'Scope-only context for the critical hunt', '0ca5b35a191bf858cacd6acb2261ed44b917e85c'],
  ['phase-05b-critical.md', 'bagbigbug-phase-05b-critical', 'Critical-impact hunting', 'bedaffe8e327d43cf414cd686e687004d0332921'],
  ['phase-06-triage.md', 'bagbigbug-phase-06-triage', 'Initial triage and deduplication', '8e44e292b08315b343e11edfdc032e328ea6a4b6'],
  ['phase-07-validate-escalate.md', 'bagbigbug-phase-07-validate-escalate', 'Validate and escalate findings', '6e80a68810d8c16793c758f1a62098cdc8f9647b'],
  ['phase-08-verify-escalate.md', 'bagbigbug-phase-08-verify-escalate', 'Independent verification and escalation', 'b8a8cbc481d2b15ef7c572b117763ca8dc334e26'],
  ['phase-08a-independent-escalation.md', 'bagbigbug-phase-08a-independent-escalation', 'One read-only pre-gate escalation pass', '4c7e9cd20889d6894750b1fafdc94768bf9db1cc'],
  ['phase-09-triage-gate.md', 'bagbigbug-phase-09-triage-gate', 'Independent live triage gate', '9860798079465e92696fbe765476d37ef4703839'],
  ['phase-10-self-duplicate-check.md', 'bagbigbug-phase-10-self-duplicate-check', 'Same-program duplicate convergence', 'db9a3c57bdeb4d30dc625a3746d862268b4d1448'],
]

export const PHASES = Object.freeze(PHASE_SOURCE.map(([filename, name, description, sourceSha1]) => {
  const sourcePath = 'phases/' + filename
  return Object.freeze({
    name,
    description,
    sourcePath,
    sourceSha1,
    kind: 'phase',
    file: new URL('../source/original/' + sourcePath, import.meta.url),
    metadata: Object.freeze({
      artifactKind: 'explicit-user-invoked-source-phase-adapter',
      sourcePath,
      sourceGitBlobSha1: sourceSha1,
      modelInvocable: false,
      userInvocable: true,
      transformation: 'prepend-authorization-safety-preamble; source-body-unchanged',
    }),
  })
}))

export const SKILLS = Object.freeze([
  ROUTER,
  ...PHASES.map((phase) => Object.freeze({
    ...phase,
    description: 'User-invoked only. ' + phase.description + '. Requires current authorization and a confirmed in-scope target.',
  })),
])
