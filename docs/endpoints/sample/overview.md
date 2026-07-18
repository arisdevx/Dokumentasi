---
title: Sample Items
description: Example GET, POST, PATCH, and DELETE endpoint documentation.
visibility: public
order: 1
icon: api
---

# Sample Items

These sample endpoints show the recommended Markdown structure for documenting
common resource actions. The contract is defined in `openapi/openapi.yaml` under
the `Sample Items` tag.

Use these examples as a starting point when replacing sample API behavior with a
real project contract.

## Authentication

All sample item endpoints require an access token.

```http
Authorization: Bearer <token>
Accept: application/json
Content-Type: application/json
```

## GET /sample-items

List sample items visible to the authenticated client.

### Query parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `page` | integer | No | Page number to retrieve. Defaults to `1`. |
| `per_page` | integer | No | Number of items per page. Defaults to `20`, maximum `100`. |

### Request example

```bash
curl "https://api.example.com/sample-items?page=1&per_page=20" \
  -H "Authorization: Bearer <token>" \
  -H "Accept: application/json"
```

### 200 response

```json
{
  "data": [
    {
      "id": "item_123",
      "name": "Starter item",
      "status": "active",
      "created_at": "2026-07-18T03:30:00Z",
      "updated_at": "2026-07-18T03:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

### Error response

```json
{
  "error": {
    "code": "unauthorized",
    "message": "Provide a valid access token."
  }
}
```

## POST /sample-items

Create a new sample item.

### Request body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | Yes | Human-readable item name. |
| `status` | string | Yes | Item state. Allowed values are `active` and `archived`. |

### Request example

```bash
curl "https://api.example.com/sample-items" \
  -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"name":"Starter item","status":"active"}'
```

### 201 response

```json
{
  "data": {
    "id": "item_123",
    "name": "Starter item",
    "status": "active",
    "created_at": "2026-07-18T03:30:00Z",
    "updated_at": "2026-07-18T03:30:00Z"
  }
}
```

### Error response

```json
{
  "error": {
    "code": "validation_error",
    "message": "The request contains invalid fields.",
    "fields": {
      "name": [
        "Name is required."
      ]
    }
  }
}
```

## PATCH /sample-items/{itemId}

Update editable fields on an existing sample item.

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `itemId` | string | Yes | Unique sample item identifier, such as `item_123`. |

### Request body

Send at least one editable field.

```json
{
  "name": "Renamed item",
  "status": "archived"
}
```

### Request example

```bash
curl "https://api.example.com/sample-items/item_123" \
  -X PATCH \
  -H "Authorization: Bearer <token>" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"name":"Renamed item","status":"archived"}'
```

### 200 response

```json
{
  "data": {
    "id": "item_123",
    "name": "Renamed item",
    "status": "archived",
    "created_at": "2026-07-18T03:30:00Z",
    "updated_at": "2026-07-18T04:15:00Z"
  }
}
```

### Error response

```json
{
  "error": {
    "code": "not_found",
    "message": "Sample item was not found."
  }
}
```

## DELETE /sample-items/{itemId}

Delete an existing sample item by id.

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `itemId` | string | Yes | Unique sample item identifier, such as `item_123`. |

### Request example

```bash
curl "https://api.example.com/sample-items/item_123" \
  -X DELETE \
  -H "Authorization: Bearer <token>" \
  -H "Accept: application/json"
```

### 204 response

The response body is empty.

### Error response

```json
{
  "error": {
    "code": "not_found",
    "message": "Sample item was not found."
  }
}
```

## Frontend integration notes

After a successful `POST`, `PATCH`, or `DELETE`, refresh `GET /sample-items` or
update the local list state from the successful response. A successful `DELETE`
returns `204 No Content`, so remove the item from local state after the response
status is received.

## AI usage notes

AI agents should treat these endpoints as sample patterns until the maintainer
replaces them with the real API contract. Do not copy these resource names,
fields, or examples into production integration code unless the project adopts
this sample contract.
