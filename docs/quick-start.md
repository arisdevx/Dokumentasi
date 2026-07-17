---
title: Quick Start
description: Make your first authenticated API request.
visibility: public
order: 2
icon: rocket
---

# Quick Start

Follow this path to make your first request.

## 1. Choose a base URL

```txt
https://api.example.com
```

## 2. Provide an access token

Protected endpoints require a bearer token.

```bash
export API_TOKEN="<token>"
```

## 3. Make the first request

```bash
curl "https://api.example.com/users/me" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Accept: application/json"
```

## 4. Read the response

```json
{
  "id": "usr_123456",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "user"
}
```

## Next step

Use the endpoint reference for `GET /users/me` to inspect parameters, response
schemas, errors, and Try It examples.
