# Capability Map — Mulqi BagBigBug

**Source:** `mdpsec/bug-bounty-hunting-prompts@5ed41580564c978417d5f0105f9c92457d77f3b5`  
**Architecture:** skills-only DeepSeek Harness bundle + bundled skill provider.

Strategy is one of `WRAP`, `PORT`, `EXPOSE`, or `VENDOR-ONLY`. No speculative executable operations are added.

| ID | Source file(s) | Capability | User-facing? | Plugin surface | Strategy | Risk / rationale |
|---|---|---|---|---|---|---|
| CAP-01 | `phases/phase-00-recon.md` | Lightweight reconnaissance/evidence prompt | Yes | `/bagbigbug-phase-00-recon` | EXPOSE | Live recon requires current authorized scope; provider itself sends no requests. |
| CAP-02 | `phases/phase-01-access.md` | Researcher account/access workflow guidance | Yes | `/bagbigbug-phase-01-access` | EXPOSE | Sensitive access workflow; no credentials or login action in provider. |
| CAP-03 | `phases/phase-02-sweep.md` | Endpoint and vulnerability-class workflow | Yes | `/bagbigbug-phase-02-sweep` | EXPOSE | Active testing risk; no automatic scanning/probing. |
| CAP-04 | `phases/phase-03-closeout.md` | Handoff and resource-closeout guidance | Yes | `/bagbigbug-phase-03-closeout` | EXPOSE | Cleanup actions remain user-directed. |
| CAP-05 | `phases/phase-04a-scope.md` | Scope-only context | Yes | `/bagbigbug-phase-04a-scope` | EXPOSE | Scope validation boundary. |
| CAP-06 | `phases/phase-04b-browser-walk.md` | Authenticated browser-walk prompt | Yes | `/bagbigbug-phase-04b-browser-walk` | EXPOSE | No browser runtime is supplied; do not imply automated browsing. |
| CAP-07 | `phases/phase-05a-scope.md` | Critical-hunt scope context | Yes | `/bagbigbug-phase-05a-scope` | EXPOSE | Scope validation boundary. |
| CAP-08 | `phases/phase-05b-critical.md` | Critical-impact hunting prompt | Yes | `/bagbigbug-phase-05b-critical` | EXPOSE | High-impact workflow; explicit scope and bounded proofs. |
| CAP-09 | `phases/phase-06-triage.md` | Initial finding triage/deduplication | Yes | `/bagbigbug-phase-06-triage` | EXPOSE | Evidence integrity and duplicate handling. |
| CAP-10 | `phases/phase-07-validate-escalate.md` | Finding validation and escalation | Yes | `/bagbigbug-phase-07-validate-escalate` | EXPOSE | Revalidation must remain within scope. |
| CAP-11 | `phases/phase-08-verify-escalate.md` | Independent verification/escalation | Yes | `/bagbigbug-phase-08-verify-escalate` | EXPOSE | Re-test actions require authorization. |
| CAP-12 | `phases/phase-08a-independent-escalation.md` | Read-only pre-gate escalation | Yes | `/bagbigbug-phase-08a-independent-escalation` | EXPOSE | Read-only workflow guidance. |
| CAP-13 | `phases/phase-09-triage-gate.md` | Independent triage gate | Yes | `/bagbigbug-phase-09-triage-gate` | EXPOSE | Live triage remains gated by explicit permission. |
| CAP-14 | `phases/phase-10-self-duplicate-check.md` | Same-program duplicate convergence | Yes | `/bagbigbug-phase-10-self-duplicate-check` | EXPOSE | Analysis/report guidance only; no platform submission. |
| CAP-15 | `README.md` | Upstream prompt-pack overview | Reference | `source/original/README.md` | VENDOR-ONLY | Exact original retained; target README is adapter documentation. |
| CAP-16 | `ADAPTATION.md` | Placeholder/integration replacement index | Reference | `source/original/ADAPTATION.md` | VENDOR-ONLY | Describes external resources not shipped upstream; retained as reference. |
| CAP-17 | `SECURITY.md` | Upstream disclosure/security policy | Reference | `source/original/SECURITY.md` and root alias | VENDOR-ONLY | Exact policy mirror. |
| CAP-18 | `LICENSE` | MIT license | Legal | `source/original/LICENSE` and root alias | VENDOR-ONLY | Exact legal text. |
| CAP-19 | `.gitignore` | Upstream workspace ignore conventions | No runtime | `source/original/.gitignore` and npm alias | VENDOR-ONLY | Exact preservation, not a Harness runtime capability. |

## Explicit gaps and why no WRAP/PORT is available

The prompt text refers to browser management, proxy/HAR capture, researcher mailbox/SMS/MFA, out-of-band callbacks, hosted PoC, evidence capture, reporting/provenance systems, orchestration helpers, dashboards, credentials, and private RAG material. The pinned source has no implementation files, API contracts, command entrypoints, or shipped dependencies for these systems. No speculative WRAP or PORT is supportable. Those references remain verbatim inside the preserved prompts and `ADAPTATION.md`; no executable substitutes are invented.

## Reachability

- Reachable as Harness skills: router + all 14 phase prompts, each `modelInvocable:false` and `userInvocable:true`.
- Not available as executable plugin tools: external services and private helpers listed above.
- Source exclusion count: zero.
