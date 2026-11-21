---
name: rhdh
description: Read the Red Hat Developer Hub software catalog and publish TechDocs through reviewed pull requests. Use when asked which services exist, who owns them, what depends on what, or to generate and publish service documentation.
---

# Red Hat Developer Hub (RHDH)

RHDH is Red Hat's Backstage distribution: a developer portal holding a software
catalog of services, APIs, groups and resources, and TechDocs sites built from
each repository's `docs/` directory. The catalog is the source of truth for
what exists and who owns it; TechDocs is where a service's documentation
appears for its users.

The `rhdh` CLI reads the live catalog of this installation's RHDH instance.
The `RHDH_BASE_URL` and `RHDH_TOKEN` environment variables are already
configured; the credential gateway supplies the token.

## Catalog reads

List components with their owners:

    rhdh query --filter kind=Component --fields metadata.name,spec.owner,spec.type

Read one entity:

    rhdh get Component default payments-api

Read an entity's relations (dependencies, ownership, API relationships):

    rhdh relations Component default payments-api

Relations live on the entity document; the CLI prints them as a list of
`{type, targetRef}` entries. `dependsOn` relations answer "what does this
service need"; `dependencyOf` answers the reverse.

Catalog answers you can give directly: which services exist, who owns each,
what a service depends on, which teams would be affected by a change
(follow `dependencyOf` relations from the target).

## Publishing TechDocs

Documentation reaches RHDH as a reviewed pull request, never a direct write:

1. Read the service's source code. The manual must describe what the source
   shows: modules, entry points, configuration, operational behavior. Do not
   copy README content blindly; the code is the primary source.
2. Write a MkDocs site under `docs/` in the service repository:
   - `docs/index.md` is required; it is the site root.
   - `mkdocs.yml` nav paths are relative to `docs_dir` — no `docs/` prefix
     in nav entries.
   - Build locally with `mkdocs build --strict` before committing.
3. Publish through a pull request to the service repository (see the git
   publishing rules below). A person reviews and merges.
4. After merge, RHDH builds the TechDocs site for the catalog entity that
   references the repository (`backstage.io/techdocs-ref` annotation). If the
   service is not yet in the catalog, it must be registered first.

## Git publishing rules

- Publish through a pull request. Never push to `main` or a default branch.
- Work only inside your writable workspace; never use `/tmp` or `mktemp`.
- Run each git step as its own command; never combine publish steps into one
  script or use `rm -rf`.
- When writing `catalog-info.yaml`, set `spec.owner` to a real catalog group
  (for example `group:default/platform-team`), never a user entity.
