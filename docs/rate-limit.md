---
title: Rate Limit
description: How the API communicates rate limit behavior.
visibility: public
order: 7
---

# Rate Limit

When a client exceeds the allowed request rate, the API returns `429`.

```json
{
  "code": "RATE_LIMITED",
  "message": "Too many requests"
}
```

Clients should retry after the time indicated by the API response headers when
available.
