# AGENTS.md

This repository is a lightweight API documentation platform for one API project.
It is designed for both human readers and AI agents that need to understand and
integrate with the documented API.

All AI agents working in this repository must follow these rules.

## Product Direction

Build and maintain a static API documentation platform with:

- configurable logo and product identity.
- Markdown-based narrative documentation.
- OpenAPI-based endpoint documentation.
- Tailwind CSS for styling.
- Alpine.js for lightweight UI behavior.
- Static build output that is easy to deploy.
- A browser-based "Try It" API console.
- Public and internal documentation modes.
- AI-readable artifacts for frontend/API integration agents.

The platform must stay lightweight. Do not introduce a database, backend service,
large frontend framework, or complex server configuration unless explicitly
requested by the maintainer.

## Core Principles

1. OpenAPI is the contract.
2. Markdown is the explanation.
3. AI artifacts are generated from trusted sources.
4. Validation is mandatory.
5. Documentation must be useful to both humans and AI agents.

If Markdown documentation conflicts with OpenAPI, OpenAPI wins and the conflict
must be fixed.

## Scope

This platform supports one API project only.

Do not design or implement multi-collection behavior like Postman workspaces,
multiple independent API collections, or multi-tenant documentation unless the
maintainer explicitly changes this requirement.

## Expected Project Shape

Use this structure unless the existing project has already established a better
equivalent:

```txt
.
├── AGENTS.md
├── docs/
│   ├── index.md
│   ├── quick-start.md
│   ├── authentication.md
│   ├── api-rules.md
│   ├── environment.md
│   ├── errors.md
│   ├── rate-limit.md
│   ├── changelog.md
│   ├── guides/
│   │   ├── index.md
│   │   └── frontend-integration.md
│   ├── standards/
│   │   ├── pagination.md
│   │   └── webhooks.md
│   └── endpoints/
│       └── users/
│           └── overview.md
├── openapi/
│   └── openapi.yaml
├── src/
│   ├── build.js
│   ├── client/
│   │   ├── app.js
│   │   ├── search.js
│   │   └── try-it.js
│   ├── styles/
│   │   └── input.css
│   └── templates/
│       └── layout.html
├── public/
│   └── assets/
├── dist/
├── .env.example
├── package.json
└── tailwind.config.js
```

Generated files belong in `dist/` and must not be treated as source content
unless the maintainer explicitly asks to inspect generated output.

## Source Of Truth

Endpoint data must come from one of these trusted sources:

- `openapi/openapi.yaml` or `openapi/openapi.json`.
- Backend source code available in the repository.
- Official examples provided by the maintainer.
- Explicit maintainer instructions in the current task.

AI agents must not invent endpoints, request fields, response fields, enum
values, authentication behavior, rate limits, or error codes.

When information is missing, write a clear note, ask for clarification when
needed, or mark the field as intentionally unknown in a standards-compliant way.

## Markdown Documentation Rules

Markdown pages must use frontmatter.

Required frontmatter:

```yaml
---
title: Page Title
description: Short, specific description.
visibility: public
---
```

Allowed `visibility` values:

- `public`
- `internal`

Public pages must not link to internal-only pages or reveal internal-only
implementation details.

Use Markdown for:

- Quick Start instructions.
- Overview and onboarding.
- Authentication explanations.
- API-wide rules and behavior.
- Environment setup.
- Error handling.
- Rate limits.
- Webhook behavior.
- Changelog entries.
- Business rules and frontend integration notes.
- Human-readable explanations that do not belong in OpenAPI.

Avoid vague filler such as:

- "This endpoint manages data."
- "Returns information."
- "Handles requests."
- "Various parameters."

Documentation must be specific, testable, and tied to actual API behavior.

## Required Core Pages

The documentation should include these core pages unless the maintainer
explicitly removes them:

- `docs/index.md`
- `docs/quick-start.md`
- `docs/authentication.md`
- `docs/api-rules.md`
- `docs/environment.md`
- `docs/errors.md`
- `docs/rate-limit.md`
- `docs/changelog.md`

`quick-start.md` is a practical first-success path. It should help a reader make
their first valid API request quickly.

Quick Start should include:

- base URL
- how to provide an access token or API key
- first request example
- success response example
- next recommended integration step

`api-rules.md` is the API-wide behavior contract. It should explain rules that
apply across endpoints.

API Rules should cover relevant items such as:

- authentication behavior
- required headers
- request and response formats
- error format
- pagination
- filtering and sorting
- rate limits
- idempotency
- versioning
- date, time, and timezone format
- file upload behavior
- webhook behavior
- deprecation policy

## Nested Documentation And Subfolders

Markdown documentation must support nested folders.

Examples:

```txt
docs/
├── guides/
│   ├── index.md
│   ├── frontend-integration.md
│   └── webhook-setup.md
├── standards/
│   ├── api-behavior.md
│   ├── pagination.md
│   └── rate-limit.md
└── endpoints/
    ├── users/
    │   ├── overview.md
    │   └── examples.md
    └── orders/
        ├── overview.md
        └── lifecycle.md
```

Folder rules:

- a folder may have an `index.md` page
- nested pages must keep the same frontmatter requirements as root pages
- URLs should follow the folder path
- sidebar navigation should preserve the folder hierarchy
- search must include nested pages
- public/internal visibility must be enforced at every depth
- AI artifacts must consume eligible nested pages

Ordering should use frontmatter:

```yaml
---
title: Frontend Integration
description: How to integrate the API from a frontend application.
visibility: public
order: 1
---
```

Folder labels and ordering may use `_category.json`:

```json
{
  "title": "Guides",
  "order": 3,
  "visibility": "public"
}
```

If `_category.json` is missing, derive the folder title from the folder name.
For example, `frontend-guides` becomes `Frontend Guides`.

If a folder is marked `internal`, all child pages are internal unless a stricter
future rule is explicitly defined by the maintainer.

## OpenAPI Rules

OpenAPI must describe all public API endpoints that the documentation renders.

Each operation should include:

- `operationId`
- `summary`
- `description`
- `tags`
- `security`, when authentication is required
- path parameters, when applicable
- query parameters, when applicable
- request body schema, when applicable
- success responses
- common error responses
- examples for important request and response shapes

Use OpenAPI extensions for platform-specific metadata.

Recommended extensions:

```yaml
x-visibility: public
x-ai:
  usage: "Use this endpoint to retrieve the authenticated user profile."
  frontendFlow: "Call after login or token refresh."
  commonMistakes:
    - "Do not call this endpoint without an Authorization header."
    - "Do not poll this endpoint on every render."
```

Allowed `x-visibility` values:

- `public`
- `internal`

If `x-visibility` is missing, treat the operation as `public` unless the
maintainer defines a different default.

## Endpoint Documentation Standard

Every documented endpoint must make these details clear:

- HTTP method.
- Path.
- Purpose.
- Authentication requirement.
- Required headers.
- Path parameters.
- Query parameters.
- Request body fields.
- Success response shape.
- Common error response shapes.
- At least one valid request example.
- At least one valid success response example.
- At least one valid error response example.
- Rate limit, idempotency, or pagination behavior when relevant.
- Frontend integration notes when relevant.
- AI usage guidance when relevant.

Examples must be syntactically valid. JSON examples must parse as JSON.

Request examples, success response examples, and error response examples must be
rendered as readable code examples in the UI.

Do not include real secrets, real access tokens, passwords, private keys, or
production-only internal hostnames in examples.

Use placeholders such as:

```txt
<token>
<api-key>
<user-id>
https://api.example.com
```

## AI-Readable Artifacts

The built documentation should expose AI-readable files:

```txt
dist/
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

`llms.txt` should be short and point AI agents to the most important resources.

`llms-full.txt` should contain a fuller combined context generated from trusted
documentation sources.

`ai/endpoints.json` should contain a structured endpoint index with:

- operation id
- method
- path
- summary
- tags
- visibility
- auth requirement
- request body summary
- success response summary
- documentation URL

`ai/integration-guide.md` should explain how an AI agent should integrate the API
from a frontend or client application.

AI artifacts must be generated or derived from OpenAPI and approved Markdown
content. Do not hand-maintain generated AI artifacts unless explicitly requested.

## Try It Console Rules

The documentation should support a browser-based Try It console.

The Try It console may call the API directly when the API supports CORS.

If the API does not support CORS, use an optional proxy URL. Do not require a
proxy for the default static documentation build.

Never bake private tokens or credentials into generated frontend assets.

Users may provide tokens manually in the browser UI. Token persistence must be
explicit and understandable. Prefer memory-only storage by default. If local
storage is offered, make it an intentional user choice.

The Try It console must respect:

- selected environment base URL
- method
- path parameters
- query parameters
- headers
- request body
- authentication headers

## Environment Configuration

Use `.env.example` to document supported configuration. Do not commit real
secrets in `.env`.

Recommended variables:

```env
DOCS_TITLE="API Documentation"
DOCS_DESCRIPTION="Official API documentation"
DOCS_VERSION="v1"
DOCS_BASE_PATH="/"

DOCS_API_DEV_URL="https://dev-api.example.com"
DOCS_API_STAGING_URL="https://staging-api.example.com"
DOCS_API_PROD_URL="https://api.example.com"
DOCS_DEFAULT_ENV="production"

DOCS_ENABLE_TRY_IT=true
DOCS_TRY_IT_ALLOW_CUSTOM_BASE_URL=false
DOCS_TRY_IT_PROXY_URL=""

DOCS_VISIBILITY="public"
```

`DOCS_VISIBILITY=public` must exclude internal-only pages, endpoints, and AI
artifact content from the generated output.

`DOCS_VISIBILITY=internal` may include both public and internal content.

## Public And Internal Documentation

Every page and endpoint must have explicit or derived visibility.

Public builds must not include:

- internal-only Markdown pages
- internal-only OpenAPI operations
- internal-only AI guidance
- internal hostnames
- private deployment notes
- credentials or secrets

Internal builds may include operational notes, internal environment details, and
private integration guidance, but still must not include real secrets.

## Search And Navigation

Search should be client-side and static.

Search index content must respect the selected visibility mode. Public search
must not leak internal page titles, endpoint summaries, paths, or snippets.

Navigation should be generated from Markdown frontmatter and OpenAPI metadata
where possible.

## UI Layout Requirements

The documentation UI must support:

- configurable logo
- sidebar navigation
- top bar
- light and dark themes
- single icon-only theme toggle in the top bar
- default theme that follows the user's system preference
- responsive layout across desktop, tablet, and mobile
- responsive mobile navigation
- responsive documentation content
- responsive Try It console

The default desktop layout should use:

- a persistent sidebar on the left
- a top bar above the main documentation content
- a main documentation body area

Sidebar behavior:

- the sidebar must remain static or sticky on desktop
- the sidebar must not scroll with the documentation body
- the documentation body should be the primary scroll area
- long sidebar navigation may scroll inside the sidebar itself if needed
- active page state must be visible
- nested folders must be expandable or clearly grouped

Top bar behavior:

- show the configured logo or product mark when space allows
- include a circular icon-only theme toggle
- use Tabler Icons for the theme icon
- default to the user's system preference on first visit
- persist the user's explicit light/dark choice after they click the toggle
- avoid layout shift when toggling themes

Theme behavior:

- first visit follows `prefers-color-scheme`
- the theme toggle switches between light and dark
- after the user toggles manually, persist the explicit light or dark choice
- the theme button icon should reflect the available action or current state
- code blocks, tables, Try It panels, and navigation states must be readable in
  both light and dark modes

Theme toggle UI:

- use one circular button only
- do not show a segmented `System / Light / Dark` control
- use Tabler Icons, such as `IconSun`, `IconMoon`, or equivalent SVG paths
- include an accessible label such as `Toggle theme`
- keep the button size stable across themes

## Code Examples And Copy Actions

The UI must support syntax highlighting and copy actions for technical examples.

This applies to:

- request examples
- request body examples
- response examples
- error response examples
- Markdown fenced code blocks when practical
- future generated SDK or client examples

Endpoint example blocks must use a code panel pattern:

- visible label, such as `200 response`, `Error response`, `Request body`, or
  `JSON`
- syntax-highlighted content
- copy button
- copy feedback state, such as `Copied`
- readable colors in light and dark mode
- horizontal scrolling for long lines

JSON examples must be highlighted with distinct colors for keys, strings,
numbers, booleans, and null values.

Copy behavior:

- copy the raw example content, not the highlighted HTML
- keep formatting and indentation intact
- do not copy line numbers or UI labels
- show a short success or failure state
- preserve keyboard and screen-reader accessibility

Logo configuration should be documented through environment variables or a
simple config file. Recommended variables:

```env
DOCS_LOGO="/assets/logo.svg"
DOCS_LOGO_DARK="/assets/logo-dark.svg"
DOCS_LOGO_ALT="API Documentation"
```

## Responsive Requirements

The UI must work well on desktop, tablet, and mobile.

Recommended breakpoints may follow Tailwind defaults unless the implementation
has a better established convention:

- mobile: below `768px`
- tablet: `768px` to below `1024px`
- desktop: `1024px` and above

Desktop behavior:

- sidebar is persistent on the left
- top bar is visible above the documentation body
- Try It panel may be shown as a sticky right-side panel
- documentation body is the primary scroll area

Tablet behavior:

- sidebar may collapse into a drawer or compact rail
- top bar remains visible
- Try It panel may move below the endpoint summary or become a tab/accordion
- content width must stay readable

Mobile behavior:

- sidebar must become an off-canvas drawer
- top bar must include a menu button, search access, and the circular theme
  toggle
- logo may collapse to icon-only when space is limited
- Try It must move below the documentation content or into a clearly labeled
  section/tab
- tables must be horizontally scrollable or transformed into stacked rows
- code blocks must be horizontally scrollable
- long endpoint paths must wrap or scroll without breaking the layout
- buttons and form controls must remain touch-friendly

Responsive quality rules:

- no text overlap
- no clipped buttons
- no hidden required controls
- no horizontal page scroll except inside intentional code/table/path containers
- active sidebar state must remain visible in drawer mode
- nested navigation must remain usable on touch devices
- the theme toggle must keep a stable circular size on all breakpoints
- Try It form fields must be usable without zooming on mobile

## Validation Requirements

Before completing documentation or platform changes, run validation commands when
they exist:

```bash
npm run validate:docs
npm run build
```

If these scripts do not exist yet, create them when the task involves building
the platform foundation. At minimum, validation should check:

- Markdown frontmatter is valid.
- Required frontmatter fields exist.
- `visibility` values are valid.
- internal content is excluded from public builds.
- OpenAPI is valid.
- endpoint documentation matches OpenAPI.
- JSON code blocks parse.
- internal links resolve.
- generated AI artifacts exist.
- generated AI artifacts do not include internal content in public mode.
- examples do not contain likely secrets.
- placeholder text such as `TODO`, `TBD`, and `lorem ipsum` is not present in
  publishable documentation.

If validation cannot be run, report why and describe the residual risk.

## Secret Safety

Never commit or document real secrets.

Treat these as sensitive:

- API keys
- bearer tokens
- refresh tokens
- private keys
- passwords
- database URLs with credentials
- production credentials
- private service URLs that the maintainer has not approved for documentation

If a task includes a real secret, do not copy it into docs. Replace it with a
placeholder and mention the replacement in the final response.

## AI Authoring Workflow

When asked to write or update documentation, AI agents must:

1. Read this `AGENTS.md`.
2. Inspect the relevant Markdown files.
3. Inspect the relevant OpenAPI file.
4. Identify the trusted source for every endpoint or behavior being documented.
5. Make the smallest useful documentation change.
6. Update OpenAPI when the API contract is the thing that changed.
7. Update Markdown when explanation, guidance, or narrative changed.
8. Regenerate AI artifacts when applicable.
9. Run validation and build commands when available.
10. Report changed files, assumptions, and any validation limitations.

Do not present invented behavior as fact.

## Changelog Rules

Update `docs/changelog.md` when a change affects:

- endpoint behavior
- request or response schema
- authentication
- authorization
- error behavior
- rate limits
- pagination
- deprecation status
- frontend integration flow

Changelog entries should include the date and a concise description.

## Style Guidelines

Write API documentation in clear technical language.

Prefer direct, specific sentences.

Use consistent terms for:

- access token
- refresh token
- API key
- base URL
- request body
- response body
- path parameter
- query parameter
- pagination
- rate limit

Code examples should be minimal but complete enough to run after replacing
placeholders.

Use English for API field names, endpoint summaries, OpenAPI descriptions, and
AI artifacts unless the maintainer asks otherwise. Indonesian may be used for
internal notes, planning documents, or maintainer-facing explanations.

## Dependency And Architecture Rules

Keep dependencies modest.

Acceptable dependency categories:

- Markdown parser
- frontmatter parser
- OpenAPI parser/validator
- syntax highlighter
- Tailwind CSS
- Alpine.js
- small client-side search library
- environment variable loader

Avoid adding:

- React, Vue, Angular, Svelte, or Next.js
- databases
- backend servers
- heavy API gateway/proxy systems
- authentication platforms
- analytics SDKs

Only add heavier tools when the maintainer explicitly approves the tradeoff.

## Completion Criteria

A documentation/platform change is complete only when:

- source files are updated
- generated artifacts are updated when applicable
- validation passes or limitations are clearly reported
- build passes or limitations are clearly reported
- public/internal visibility rules are respected
- AI-readable outputs remain consistent with OpenAPI and Markdown sources
