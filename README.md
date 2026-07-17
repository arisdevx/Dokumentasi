# Dokumentasi - Open Source Static API Documentation Platform

Dokumentasi is an open source static API documentation platform for teams that
want fast, searchable, deployable API docs built from Markdown and OpenAPI.

Use Dokumentasi to create API documentation websites with Markdown guides,
OpenAPI endpoint references, a browser-based Try It console, public/internal
visibility modes, Docker Compose support, and AI-readable outputs such as
`llms.txt`, `llms-full.txt`, and structured endpoint JSON.

It uses Markdown for readable guides, OpenAPI for the API contract, Tailwind CSS
for styling, and Alpine.js for lightweight browser behavior. The goal is to make
API documentation easy to install, easy to deploy, and structured enough for AI
tools to consume safely when building integrations.

## Keywords

API documentation, OpenAPI documentation, Markdown documentation, static API
docs, developer portal, API reference, llms.txt, AI-readable documentation,
Docker API documentation, Tailwind CSS documentation template.

## Table of Contents

- [Vision](#vision)
- [Open Source](#open-source)
- [Project Status](#project-status)
- [Features](#features)
- [Documentation Model](#documentation-model)
- [AI-Readable Documentation](#ai-readable-documentation)
- [UI Direction](#ui-direction)
- [Configuration](#configuration)
- [Installation](#installation)
- [Writing Markdown Documentation](#writing-markdown-documentation)
- [Icons](#icons)
- [Authoring Rules](#authoring-rules)
- [Public And Internal Docs](#public-and-internal-docs)
- [Contributing](#contributing)
- [Credits](#credits)
- [License](#license)

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

## Open Source

Dokumentasi is an open source project licensed under the MIT License. You can
use it as a starter project for your own API documentation, modify it for your
team, and deploy the generated static output on your own infrastructure.

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
- Tabler Icons support for sidebar navigation
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

## Installation

Use Dokumentasi as a starter project for your API documentation.

Clone the repository into a new project folder:

```bash
git clone https://github.com/arisdevx/Dokumentasi.git my-api-docs
cd my-api-docs
```

If you downloaded a ZIP file instead, extract it and open the extracted folder
in your terminal.

Create your local configuration:

```bash
cp .env.example .env
```

Edit `.env` for your API name, logo, public base URL, and documentation mode.

Install dependencies:

```bash
npm install
```

Replace the starter API content with your own:

- edit `openapi/openapi.yaml` for your API endpoints and schemas
- edit `docs/index.md` for the documentation home page
- edit `docs/quick-start.md` for the first successful API request
- edit `docs/authentication.md` for API key, bearer token, or session rules
- add more Markdown pages under `docs/`
- place logo and static assets under `public/assets/`

Validate your documentation:

```bash
npm run validate:docs
```

Build static output:

```bash
npm run build
```

Start the local preview server:

```bash
npm run dev
```

Run with Docker Compose:

```bash
docker compose up --build
```

The production container serves the site at `http://localhost:8080`.
Docker Compose reads `.env` values as build-time `DOCS_*` configuration, so
rebuild the image after changing docs or static configuration.

For live documentation editing, run the development profile:

```bash
docker compose --profile dev up docs-dev --build
```

The development container serves the site at `http://localhost:5173` and
rebuilds `dist/` when files under `docs/`, `openapi/`, `public/`, or `src/`
change.

The final build should produce a static `dist/` directory that can be hosted on
any static hosting provider.

Do not put real API keys, access tokens, passwords, private keys, or internal
production-only hostnames in public documentation.

## Writing Markdown Documentation

Create Markdown pages inside `docs/`.

```txt
docs/
├── index.md
├── quick-start.md
├── installation.md
└── guides/
    └── writing-markdown-docs.md
```

Every page requires frontmatter:

```yaml
---
title: Quick Start
description: Make your first authenticated API request.
visibility: public
order: 2
icon: rocket
---
```

Supported fields:

- `title`
- `description`
- `visibility`
- `order`
- `icon`

Nested folders are supported. Folder metadata can be configured with
`_category.json`.

```json
{
  "title": "Standards",
  "order": 30,
  "visibility": "public",
  "icon": "shield-check"
}
```

See [`docs/guides/writing-markdown-docs.md`](./docs/guides/writing-markdown-docs.md)
for the full authoring guide.

## Icons

Sidebar icons use Tabler Icons outline names.

Example:

```yaml
icon: rocket
```

The `Icon` prefix is also accepted:

```yaml
icon: IconRocket
```

Examples:

- `book`
- `rocket`
- `lock`
- `shield-check`
- `server`
- `alert-circle`
- `gauge`
- `history`
- `code`
- `users`
- `list-details`
- `file-text`
- `folder`

Most outline icons available from `@tabler/icons` can be used by their file
name, such as `api`, `brand-github`, `database`, or `plug-connected`. Unknown
icon names fall back to `book`.

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

## Credits

Dokumentasi is built with:

- [Markdown](https://daringfireball.net/projects/markdown/) for human-authored
  documentation
- [OpenAPI](https://www.openapis.org/) as the API contract format
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Alpine.js](https://alpinejs.dev/) for lightweight browser interactions
- [Tabler Icons](https://tabler.io/icons) as the icon direction
- [Marked](https://marked.js.org/) for Markdown rendering
- [Highlight.js](https://highlightjs.org/) for syntax highlighting
- [Vite](https://vite.dev/) for local static preview

## License

MIT
