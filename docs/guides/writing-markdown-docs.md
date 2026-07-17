---
title: Writing Markdown Docs
description: Create Markdown pages, nested folders, icons, and API documentation content.
visibility: public
order: 2
icon: file-text
---

# Writing Markdown Docs

Use Markdown for human-readable explanations, onboarding, guides, API rules, and
frontend integration notes.

Endpoint contracts should come from OpenAPI. Markdown should explain how and
when to use the API.

## Create a page

Create a `.md` file in `docs/`.

```txt
docs/quick-start.md
```

Every page must include frontmatter:

```yaml
---
title: Quick Start
description: Make your first authenticated API request.
visibility: public
order: 2
icon: rocket
---
```

Required fields:

- `title`
- `description`
- `visibility`

Optional fields:

- `order`
- `icon`

## Visibility

Use `public` for public documentation:

```yaml
visibility: public
```

Use `internal` for private documentation:

```yaml
visibility: internal
```

When `DOCS_VISIBILITY=public`, internal pages are excluded from the generated
site and AI artifacts.

## Nested folders

Nested folders are supported.

```txt
docs/
├── guides/
│   ├── index.md
│   └── writing-markdown-docs.md
└── standards/
    └── pagination.md
```

Folder metadata can be defined with `_category.json`:

```json
{
  "title": "Standards",
  "order": 30,
  "visibility": "public",
  "icon": "shield-check"
}
```

## Icons

Sidebar icons use Tabler Icons outline names.

Set an icon in page frontmatter:

```yaml
icon: rocket
```

You may also use an `Icon` prefix:

```yaml
icon: IconRocket
```

Common icon examples:

| Icon name | Recommended use |
| --- | --- |
| `book` | Overview or general docs |
| `rocket` | Quick Start |
| `lock` | Authentication |
| `shield-check` | API rules or standards |
| `server` | Environment or installation |
| `alert-circle` | Errors |
| `gauge` | Rate limits |
| `history` | Changelog |
| `code` | Frontend or developer guides |
| `users` | User resources |
| `list-details` | Lists and pagination |
| `file-text` | Writing and page guides |
| `folder` | Folder categories |

Unknown icon names fall back to `book`.

Most outline icons from the installed `@tabler/icons` package are supported by
file name. For example, `brand-github`, `database`, `api`, or `plug-connected`.

## API documentation content

A useful API guide should include:

- what the endpoint or workflow is for
- when to use it
- required authentication
- important headers
- request examples
- response examples
- common errors
- frontend integration notes
- AI integration notes when helpful

Do not invent endpoints or fields in Markdown. If endpoint behavior is missing
from OpenAPI, update `openapi/openapi.yaml` first.
