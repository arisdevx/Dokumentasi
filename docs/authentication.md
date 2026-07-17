---
title: Authentication
description: Learn how authenticated requests are authorized.
visibility: public
order: 3
---

# Authentication

The API uses bearer token authentication.

Send the access token in the `Authorization` header:

```http
Authorization: Bearer <token>
```

Do not include real tokens in documentation, examples, public issues, or
frontend source code.

## Failed authentication

Requests with missing, expired, or invalid tokens return `401 Unauthorized`.

```json
{
  "code": "UNAUTHORIZED",
  "message": "Missing or invalid access token"
}
```
