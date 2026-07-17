---
title: Users
description: User endpoint overview and frontend usage notes.
visibility: public
order: 1
icon: users
---

# Users

User endpoints expose profile and account information for authenticated users.

AI agents integrating a frontend should prefer `GET /users/me` for session
hydration instead of asking for a user id.
