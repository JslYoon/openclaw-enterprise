#!/usr/bin/env node
// RHDH catalog CLI for the oce-rhdh managed plugin. Reads the Red Hat Developer
// Hub (Backstage) software catalog over REST with the credential gateway's
// bearer token. No third-party dependencies: Node 24 built-ins only.
import { request as httpRequest } from "node:http";

const ENDPOINT_HELP =
  "Set RHDH_BASE_URL to the RHDH backend base URL (for example http://rhdh.rhdh.svc.cluster.local:7007).";

function fail(message) {
  process.stderr.write(`rhdh: ${message}\n`);
  process.exit(1);
}

function baseUrl() {
  const raw = process.env.RHDH_BASE_URL;
  if (!raw) {
    fail(`${ENDPOINT_HELP}`);
  }
  let url;
  try {
    url = new URL(raw);
  } catch {
    fail(`RHDH_BASE_URL is not a URL: ${raw}`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    fail(`RHDH_BASE_URL must be http or https: ${raw}`);
  }
  return url;
}

function token() {
  const value = process.env.RHDH_TOKEN;
  if (!value) {
    fail("Set RHDH_TOKEN to the RHDH backend service token.");
  }
  return value;
}

function catalogRequest(path, query) {
  const url = baseUrl();
  url.pathname = `${url.pathname.replace(/\/$/, "")}${path}`;
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        url.searchParams.append(key, String(item));
      }
    } else {
      url.searchParams.set(key, String(value));
    }
  }
  return new Promise((resolve, reject) => {
    const request = httpRequest(
      {
        hostname: url.hostname,
        port: url.port || 80,
        path: `${url.pathname}${url.search}`,
        method: "GET",
        headers: { authorization: `Bearer ${token()}`, accept: "application/json" },
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const body = Buffer.concat(chunks).toString("utf8");
          if (response.statusCode === 401 || response.statusCode === 403) {
            reject(
              new Error(
                `RHDH refused the request (HTTP ${response.statusCode}). Check the service token.`,
              ),
            );
            return;
          }
          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(new Error(`RHDH returned HTTP ${response.statusCode} for ${path}.`));
            return;
          }
          try {
            resolve(JSON.parse(body));
          } catch {
            reject(new Error(`RHDH returned a non-JSON body for ${path}.`));
          }
        });
      },
    );
    request.on("error", reject);
    request.end();
  });
}

const FIELDS = [
  "kind",
  "metadata.name",
  "metadata.description",
  "spec.owner",
  "spec.type",
  "spec.lifecycle",
  "metadata.tags",
];

function project(entity, fields) {
  const selected = {};
  for (const field of fields) {
    const value = field
      .split(".")
      .reduce(
        (node, part) => (node === undefined || node === null ? undefined : node[part]),
        entity,
      );
    if (value !== undefined) {
      selected[field] = value;
    }
  }
  return selected;
}

function parseFields(value) {
  const requested = (value ?? FIELDS.join(","))
    .split(",")
    .map((field) => field.trim())
    .filter(Boolean);
  return requested.length ? requested : FIELDS;
}

function parseFilter(value) {
  const filter = {};
  for (const term of (value ?? "").split(",")) {
    const [key, filterValue] = term.split("=", 2);
    if (key && filterValue !== undefined) {
      filter[key] = filterValue;
    }
  }
  return filter;
}

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

async function query(args) {
  const params = new Map(
    args.map((arg, index) =>
      arg.startsWith("--")
        ? [
            arg.replace(/^--/, "").replace(/^-/, ""),
            args[index + 1]?.startsWith("--") ? undefined : args[index + 1],
          ]
        : [null, null],
    ),
  );
  // Backstage takes each filter term as a repeated query parameter: filter=kind=Component.
  const filters = args
    .map((arg, index) => (arg === "--filter" ? args[index + 1] : undefined))
    .filter((term) => term !== undefined && !term.startsWith("--"));
  const fields = parseFields(params.get("fields"));
  const response = await catalogRequest("/api/catalog/entities", {
    filter: filters.length ? filters : undefined,
  });
  const items = response.map((entity) => project(entity, fields));
  printJson({ items, totalItems: items.length });
}

async function get(args) {
  const [kind, namespace, name] = args;
  if (!kind || !namespace || !name) {
    fail("Usage: rhdh get <kind> <namespace> <name>");
  }
  const entity = await catalogRequest(`/api/catalog/entities/by-name/${kind}/${namespace}/${name}`);
  printJson(project(entity, FIELDS));
}

async function relations(args) {
  const [kind, namespace, name] = args;
  if (!kind || !namespace || !name) {
    fail("Usage: rhdh relations <kind> <namespace> <name>");
  }
  const entity = await catalogRequest(`/api/catalog/entities/by-name/${kind}/${namespace}/${name}`);
  printJson({ relations: entity.relations ?? [] });
}

const commands = { query, get, relations };

const [command, ...args] = process.argv.slice(2);
if (!command || command === "--help" || command === "help") {
  process.stdout.write(`Usage: rhdh <command> [options]

Commands:
  query [--filter kind=Component,...] [--fields metadata.name,spec.owner]
  get <kind> <namespace> <name>
  relations <kind> <namespace> <name>

Environment:
  RHDH_BASE_URL  RHDH backend base URL
  RHDH_TOKEN     RHDH backend service token
`);
  process.exit(command ? 0 : 1);
}
const handler = commands[command];
if (!handler) {
  fail(`Unknown command: ${command}. Run rhdh --help.`);
}
await handler(args);
