---
title: API Rules
description: API-wide request, response, and integration behavior.
visibility: public
order: 4
---

# API Rules

These rules apply across the API unless an endpoint says otherwise.

## Headers

Send JSON requests with:

```http
Accept: application/json
Content-Type: application/json
```

Protected endpoints also require:

```http
Authorization: Bearer <token>
```

## Error format

Errors use a stable JSON shape:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "The request is invalid",
  "errors": {}
}
```

## Dates and times

Date-time values use ISO 8601 strings in UTC.

```txt
2024-01-15T10:30:00Z
```

## Idempotency

For endpoints that create or charge resources, send an `Idempotency-Key` header
when the endpoint documentation requires it.
