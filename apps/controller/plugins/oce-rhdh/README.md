# oce-rhdh (pilot scaffold)

This package scaffolds an OCE managed plugin for Red Hat Developer Hub (RHDH).
It gives a dedicated OpenClaw worker two capabilities: read-only access to the
Backstage catalog REST API, and TechDocs publishing through a pull request.
See the [package conventions](../README.md).

This is a pilot scaffold. The package is NOT deployable and NOT installable
as-is.

## Pilot workflows

1. **Living documentation, source-code-first.** The agent reads the owning
   service's repository and publishes a maintainer and developer manual as a
   MkDocs site through `rhdh techdocs publish`. See
   [rhdh-docs](./skills/rhdh-docs/SKILL.md).
2. **Dependency upgrade radar, above Renovate.** The agent reads catalog
   entities and dependency manifests, checks advisories through OSV.dev, and
   reports upgrades that Renovate does not already automate. See
   [rhdh-catalog](./skills/rhdh-catalog/SKILL.md).

## Open decisions

- **Executable choice.** No verified `rhdh` CLI exists. The release declares
  the placeholder `executable: "tbd-cli"`. The choice between a custom wrapper
  CLI and curl or Node scripts is pending. All command names in the
  [operation map](./ai.openclaw.oce/operations.json) are examples pending this
  decision.
- **Digests and artifacts.** Every `*Sha256` field is the placeholder string
  `sha256:<unpinned-placeholder>`, and artifact URLs use `placeholder.invalid`.
  Do not publish or install this release. Pin real digests only after a
  reviewed executable exists.
- **Single pinned skill.** The managed catalog verifies exactly one skill per
  package. This release pins `rhdh-catalog`; `rhdh-docs` ships beside it
  without loader support. The eventual PR must either extend the loader or
  consolidate the skills.
- **RHDH service-token provisioning.** How the RHDH backend token is issued,
  scoped, and rotated is undecided. The credential `issuer` and
  `tokenEndpoint` are placeholders for the deployed RHDH base URL.
- **Verification.** Real-runtime proof is required through the opt-in lane in
  the [plugin testing guide](../../../docs/testing/plugins.md) before this
  package can be bundled.

## Controller coupling for the eventual PR

The controller loads every marketplace entry at startup. It validates the
release shape, the skill digest, the binary digests, and a per-CLI credential
policy. Adding this package to the marketplace index therefore requires the
matching controller changes in the same change; the entry cannot land alone.
