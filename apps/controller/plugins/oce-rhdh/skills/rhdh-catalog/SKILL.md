---
name: rhdh-catalog
description: Query the RHDH Backstage catalog REST API and read entity relations for blast-radius analysis.
---

# RHDH catalog reads

Query the Backstage catalog of the Red Hat Developer Hub (RHDH) instance.
The `RHDH_TOKEN` environment variable holds the RHDH backend token. Send the
token as a Bearer token in the `Authorization` header. Never print the token.
Never write the token to output, files, logs, or pull requests.

## Read one entity

Use `rhdh catalog entity get` to read a single entity. The command calls
`GET /api/catalog/entities/by-name/{kind}/{namespace}/{name}`.

```sh
rhdh catalog entity get --kind Component --namespace default --name payments-api
```

Kind, namespace, and name are case-sensitive. Use values that the catalog
reports. Query first when a value is unknown. Do not guess values.

## Query entities

Use `rhdh catalog entities query` to read a list of entities. The command
calls `GET /api/catalog/entities/by-query`. Restrict the result with `filter`
parameters.

```sh
rhdh catalog entities query --filter kind=Component --filter spec.type=service
```

Request only the fields that the task needs. Use the `fields` parameter to
reduce the response. Use `limit` and `cursor` to page through large results.

## Relations and blast radius

Read the `relations` array of an entity before you report the effect of a
change. The relations connect the entity to other catalog entities. Use
`rhdh catalog entity relations` for the full relation list. The command calls
`GET /api/catalog/entities/by-name/{kind}/{namespace}/{name}/relations`.

For a blast-radius analysis, collect these items:

1. The target entity and its relations.
2. The entities that the relations point to.
3. The relations of other entities that reference the target.

Report the entities that a change can affect. The catalog commands are
read-only. Do not create, update, or delete catalog entities.

If a request fails with status 401 or 403, report the failure to the user.
Do not retry with a different token.

## Provisional command surface

No verified `rhdh` CLI exists yet. When the CLI is not installed, send the
documented REST request directly. Apply the same token discipline. The
command names follow the package operation map and may change with the
executable decision.
