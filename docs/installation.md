---
title: Installation
description: Install, run, build, and deploy Dokumentasi.
visibility: public
order: 8
icon: server
---

# Installation

Dokumentasi is an open source starter project for publishing static API
documentation. Use it when you want to create documentation for your own API,
not only when you want to develop Dokumentasi itself.

It does not require a database or a custom backend server.

## Requirements

- Node.js 20 or newer
- npm

For Docker installation:

- Docker
- Docker Compose

## Download the project

Clone the repository into a new documentation project folder:

```bash
git clone https://github.com/arisdevx/Dokumentasi.git my-api-docs
cd my-api-docs
```

If you downloaded a ZIP file instead, extract it and open the extracted folder
in your terminal.

## Configure your documentation

Create a local `.env` file:

```bash
cp .env.example .env
```

Edit `.env` for your API:

```env
DOCS_TITLE="My API Documentation"
DOCS_DESCRIPTION="Official documentation for My API"
DOCS_API_PROD_URL="https://api.example.com"
DOCS_LOGO="/assets/logo.svg"
DOCS_LOGO_DARK="/assets/logo-dark.svg"
DOCS_VISIBILITY="public"
```

Do not commit real secrets in `.env`.

## Add your API content

Replace the starter content with your own API documentation:

- edit `openapi/openapi.yaml` for endpoints, request bodies, responses, schemas,
  examples, authentication, and endpoint visibility
- edit `docs/index.md` for the documentation home page
- edit `docs/quick-start.md` for the first successful API request
- edit `docs/authentication.md` for API key, bearer token, or session rules
- edit `docs/environment.md` for base URLs and environment behavior
- add more Markdown pages under `docs/`
- place logos and static assets under `public/assets/`

Use Markdown pages for explanation. Use OpenAPI as the source of truth for
endpoint behavior.

## Install dependencies

```bash
npm install
```

## Validate documentation

```bash
npm run validate:docs
```

Validation checks Markdown frontmatter, visibility values, OpenAPI metadata,
JSON examples, placeholder text, and likely secrets.

## Preview locally

```bash
npm run dev
```

The local preview serves the generated `dist/` directory. If you change Markdown
or OpenAPI files while using this command, restart the command to rebuild the
static output.

## Build static output

```bash
npm run build
```

The build writes static files into `dist/`.

Upload `dist/` to any static hosting provider when you are ready to publish.

## Run with Docker Compose

Docker Compose can run Dokumentasi as a production-style static site.

```bash
docker compose up --build
```

The site is available at:

```txt
http://localhost:8080
```

Set a different host port with `DOCS_PORT`:

```bash
DOCS_PORT=8081 docker compose up --build
```

The production container validates the documentation, builds `dist/`, and serves
the static output with Nginx.

Docker Compose reads values from `.env` when building the image. Because the
output is static, rebuild the image after changing documentation source files or
build-time `DOCS_*` configuration.

## Run Docker Compose for development

Use the development profile when editing Markdown, OpenAPI, styles, templates,
or client scripts.

```bash
docker compose --profile dev up docs-dev --build
```

The development site is available at:

```txt
http://localhost:5173
```

Set a different development port with `DOCS_DEV_PORT`:

```bash
DOCS_DEV_PORT=5174 docker compose --profile dev up docs-dev --build
```

In development mode, the project directory is mounted into the container. When
files under `docs/`, `openapi/`, `public/`, or `src/` change, the container
rebuilds `dist/` without requiring a container restart.

Production mode does not auto-update when source documentation changes. Rebuild
the image after changing docs:

```bash
docker compose up --build
```

## Deploy

Upload the `dist/` directory to any static hosting provider, such as Nginx,
Cloudflare Pages, Netlify, Vercel static output, GitHub Pages, or a plain VPS.

## Secret safety

Do not put real API keys, access tokens, passwords, private keys, or internal
production-only hostnames in public documentation. Use placeholders such as
`<token>`, `<api-key>`, and `https://api.example.com`.
