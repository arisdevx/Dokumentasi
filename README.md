# Dokumentasi

Dokumentasi is a lightweight, static API documentation platform designed for
humans and AI agents.

It uses Markdown for readable guides, OpenAPI for the API contract, Tailwind CSS
for styling, and Alpine.js for small interactive behavior. The goal is to make
API documentation easy to install, easy to deploy, and structured enough for AI
tools to consume safely when building integrations.

## Vision

Most API documentation is written only for humans, while AI agents often need a
clearer contract to integrate APIs correctly.

Dokumentasi is built around one principle:

> OpenAPI is the contract. Markdown is the explanation. AI artifacts are
> generated from trusted sources.

This project aims to provide:

- human-friendly API documentation
- AI-readable API context
- a static, lightweight deployment model
- strict authoring rules for AI-assisted documentation
- a built-in Try It experience
- public and internal documentation modes

## Project Status

Dokumentasi currently has an initial working MVP.

The documentation standards and AI authoring rules are defined in
[`AGENTS.md`](./AGENTS.md). The implementation follows those requirements as the
project contract.

## Features

- Markdown-based documentation pages
- OpenAPI-based endpoint rendering
- static HTML output
- Tailwind CSS UI
- Alpine.js interactions
- configurable logo and product identity
- fixed desktop sidebar
- responsive mobile sidebar drawer
- top bar with search
- single circular light/dark theme toggle
- default theme based on system preference
- client-side search
- browser-based Try It console
- environment selector for API base URLs
- public/internal visibility filtering
- nested documentation folders
- generated `llms.txt`
- generated `llms-full.txt`
- generated AI endpoint index
- generated AI integration guide
- documentation validator
- secret safety checks

## Documentation Model

Dokumentasi uses a hybrid documentation model.

Markdown is used for narrative pages:

```txt
docs/
├── index.md
├── quick-start.md
├── authentication.md
├── api-rules.md
├── environment.md
├── errors.md
├── rate-limit.md
└── changelog.md
```

OpenAPI is used as the source of truth for endpoints:

```txt
openapi/
└── openapi.yaml
```

Generated output lives in:

```txt
dist/
├── index.html
├── openapi.json
├── openapi.yaml
├── llms.txt
├── llms-full.txt
└── ai/
    ├── api-summary.json
    ├── endpoints.json
    ├── examples.json
    └── integration-guide.md
```

## AI-Readable Documentation

Dokumentasi is designed so AI agents can safely consume API documentation when
building frontend or client integrations.

AI artifacts include:

- `llms.txt` for AI discovery
- `llms-full.txt` for fuller context
- `ai/endpoints.json` for structured endpoint metadata
- `ai/examples.json` for code examples
- `ai/integration-guide.md` for integration guidance
- `openapi.json` and `openapi.yaml` for the API contract

AI-facing content must be generated from trusted sources such as OpenAPI,
approved Markdown, backend source code, or maintainer-provided examples.

## UI Direction

The UI is a technical documentation interface, not a marketing page.

Core layout:

- static left sidebar on desktop
- documentation body as the primary scroll area
- top bar with search and theme toggle
- sticky or adjacent Try It panel on desktop
- drawer sidebar on mobile
- responsive Try It section on smaller screens

Default visual direction:

- font: Poppins
- primary button: `purple-900` background with white text
- secondary button: `purple-300` background, `purple-900` border, and
  `purple-900` text
- soft gray borders
- restrained purple accents
- readable light and dark modes

## Configuration

Dokumentasi should be configurable through environment variables or a simple
configuration file.

Example:

```env
DOCS_TITLE="API Documentation"
DOCS_DESCRIPTION="Official API documentation"
DOCS_VERSION="v1"
DOCS_BASE_PATH="/"

DOCS_LOGO="/assets/logo.svg"
DOCS_LOGO_DARK="/assets/logo-dark.svg"
DOCS_LOGO_ALT="API Documentation"

DOCS_API_DEV_URL="https://dev-api.example.com"
DOCS_API_STAGING_URL="https://staging-api.example.com"
DOCS_API_PROD_URL="https://api.example.com"
DOCS_DEFAULT_ENV="production"

DOCS_ENABLE_TRY_IT=true
DOCS_TRY_IT_ALLOW_CUSTOM_BASE_URL=false
DOCS_TRY_IT_PROXY_URL=""

DOCS_VISIBILITY="public"
```

## Expected Commands

Use these commands:

```bash
npm install
npm run dev
npm run build
npm run validate:docs
```

The final build should produce a static `dist/` directory that can be hosted on
any static hosting provider.

## Authoring Rules

AI-assisted documentation must follow strict rules.

AI agents must not invent:

- endpoints
- request fields
- response fields
- authentication behavior
- error codes
- rate limits
- enum values

Endpoint behavior must come from trusted sources:

- OpenAPI files
- backend source code
- official maintainer examples
- explicit maintainer instructions

See [`AGENTS.md`](./AGENTS.md) for the complete documentation and AI authoring
standard.

## Public And Internal Docs

Dokumentasi is planned to support both public and internal documentation builds.

Pages and endpoints may define visibility:

```yaml
---
title: Internal Setup
description: Internal deployment notes.
visibility: internal
---
```

Public builds must not leak internal pages, endpoint metadata, search snippets,
or AI artifacts.

## Contributing

This project is not ready for broad contributions yet, but the intended standard
is already documented in [`AGENTS.md`](./AGENTS.md).

Before contributing, read the project rules and keep changes aligned with the
lightweight static documentation direction.

## License

MIT
