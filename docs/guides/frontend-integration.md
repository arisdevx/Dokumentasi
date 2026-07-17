---
title: Frontend Integration
description: Recommended frontend integration flow for this API.
visibility: public
order: 1
---

# Frontend Integration

When building a frontend client, call `GET /users/me` after login to hydrate the
current user state.

Recommended flow:

1. Store the access token according to your security model.
2. Call `GET /users/me`.
3. Render authenticated navigation from the returned user profile.
4. Handle `401` by redirecting to login or refreshing the token.
