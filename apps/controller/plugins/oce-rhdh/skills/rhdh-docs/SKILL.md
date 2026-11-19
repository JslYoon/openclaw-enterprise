---
name: rhdh-docs
description: Generate a maintainer and developer manual from service source code and publish it as TechDocs through a pull request.
---

# RHDH TechDocs publishing

Use this skill to produce living documentation for a service. The output is a
maintainer and developer manual. The output is NOT an end-user manual. Do not
write end-user instructions, marketing copy, or product tutorials.

## Workflow

1. Read the repository of the owning service. Start from the source code, not
   from existing documents. Read the build files, the entry points, and the
   test layout.
2. Draft the manual with these sections:
   - Architecture: components, data flow, and external dependencies.
   - Module layout: the purpose of each top-level directory or package.
   - Local development setup: prerequisites, commands, and expected results.
   - API reference: the operations or interfaces that the service exposes.
   - Operational notes: configuration, logs, metrics, and failure behavior.
3. Write the output as a MkDocs site. Create a `mkdocs.yml` file and a `docs/`
   tree. Use one Markdown file per section. Set `site_name` to the service
   name.
4. Validate the result. Run `mkdocs build --strict` when MkDocs is available.
   Fix warnings that report broken links or missing files. When MkDocs is not
   available, state in the pull request that the build was not validated.
5. Publish through a pull request. Use `rhdh techdocs publish` to open a pull
   request against the docs repository. Never push directly to a protected
   branch. Never commit to the default branch.

## Content rules

- Write for engineers who maintain the service.
- State facts that the source code shows. Do not invent behavior.
- Mark unclear items with a `TODO` and the open question.
- Do not put credentials, tokens, or secret values into the documentation or
  the pull request.
