---
title: Installation
description: Install, run, build, and deploy Dokumentasi.
visibility: public
order: 8
icon: server
---

# Installation

Dokumentasi is a static documentation generator. It does not require a database
or a custom backend server.

## Requirements

- Node.js 20 or newer
- npm

## Install dependencies

```bash
npm install
```

## Start local development

```bash
npm run dev
```

The development server serves the generated `dist/` directory.

## Validate documentation

```bash
npm run validate:docs
```

Validation checks Markdown frontmatter, visibility values, OpenAPI metadata,
JSON examples, placeholder text, and likely secrets.

## Build static output

```bash
npm run build
```

The build writes static files into `dist/`.

## Deploy

Upload the `dist/` directory to any static hosting provider, such as Nginx,
Cloudflare Pages, Netlify, Vercel static output, GitHub Pages, or a plain VPS.

## Configure

Copy `.env.example` to `.env` and adjust values for your API:

```bash
cp .env.example .env
```

Important settings:

```env
DOCS_TITLE="API Documentation"
DOCS_LOGO="/assets/logo.svg"
DOCS_API_PROD_URL="https://api.example.com"
DOCS_ENABLE_TRY_IT=true
DOCS_VISIBILITY="public"
```
