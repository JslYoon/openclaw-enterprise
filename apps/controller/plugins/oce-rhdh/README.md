# oce-rhdh

This package is an OCE managed plugin for Red Hat Developer Hub (RHDH). It
gives a dedicated OpenClaw worker read-only access to the Backstage catalog
REST API through the `rhdh` CLI, and a skill covering catalog reasoning and
TechDocs publishing through reviewed pull requests. See the
[package conventions](../README.md).

## What ships

- One skill ([skills/rhdh](./skills/rhdh/SKILL.md)): catalog reads
  (`query`, `get`, `relations`) and the TechDocs authoring-and-publish
  workflow. The managed catalog verifies exactly one skill per package.
- One executable (`bin/rhdh.mjs`, installed as
  `/usr/local/lib/oce/plugins/rhdh/bin/rhdh`): a dependency-free Node CLI.
  Both platform digests pin the same file; the script is
  platform-independent. Digests are verified at image build time.
- One credential slot (`account`): the RHDH backend service token, delivered
  to the harness as `RHDH_TOKEN` (bearer). The `issuer` and `tokenEndpoint`
  are nominal slot metadata for a static-token deployment; the reachable
  endpoint follows the bound credential source's `bearer-token` endpoint
  configuration (`host`, `port`, `path`), so one release serves any RHDH
  instance.

## Controller coupling

The controller loads every marketplace entry at startup. It validates the
release shape, the skill digest, the binary digests, and requires a reviewed
per-CLI credential policy; this package's policy lives in
`apps/controller/src/drivers/plugin/rhdh/credential-policy.ts` and is
registered in `managed-catalog.ts`'s `cliCredentialPolicies`. The package and
the controller change must land together.

## Verification

The CLI was exercised against a live RHDH 2.2 deployment (catalog `query`,
`get`, `relations` with a static service token). Real-runtime proof through
the opt-in lane in the [plugin testing guide](../../../docs/testing/plugins.md)
is required before this package can be bundled upstream.
