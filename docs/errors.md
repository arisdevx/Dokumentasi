---
title: Errors
description: Standard API error response format and common status codes.
visibility: public
order: 6
---

# Errors

The API returns JSON errors.

```json
{
  "code": "UNAUTHORIZED",
  "message": "Missing or invalid access token"
}
```

## Common status codes

| Status | Meaning |
| --- | --- |
| `400` | Invalid request |
| `401` | Authentication is missing or invalid |
| `403` | The authenticated user cannot access the resource |
| `404` | The resource does not exist |
| `429` | Rate limit exceeded |
| `500` | Unexpected server error |
