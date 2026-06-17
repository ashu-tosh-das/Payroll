# TICKET-001 — Authentication & Role-Based Access Control

**Type:** Feature  
**Priority:** Critical  
**Status:** Done  
**Sprint:** 1

## Summary
Implement JWT-based authentication with a custom User model and RBAC permission system.

## Background
The payroll application must enforce strict access control. Different staff roles (HR Admin, Finance Manager, Employee, Auditor) require different levels of access to sensitive compensation and PII data.

## Requirements
- Custom `AbstractBaseUser` with email as username field
- `Role` model with 8 fine-grained permission booleans
- JWT access token (60 min) + refresh token (7 days) with rotation
- `/api/v1/auth/token/` — login endpoint returning token pair
- `/api/v1/auth/token/refresh/` — token refresh
- `/api/v1/auth/register/` — create new user (admin only)
- `/api/v1/auth/logout/` — blacklist refresh token
- `/api/v1/auth/me/` — get/update own profile
- `/api/v1/auth/change-password/`
- Full CRUD on Roles for super_admin

## Models
- `Role`: name, description, color, is_system, 8 permission flags
- `User`: email, first_name, last_name, role (FK), is_active, two_fa_enabled

## Acceptance Criteria
- [ ] Login returns `access` + `refresh` tokens
- [ ] Token payload includes `email`, `role`, `is_super_admin`
- [ ] Refresh rotates the token and blacklists the old one
- [ ] Unauthenticated requests return 401
- [ ] Role permissions are reflected in token claims
- [ ] `/api/docs/` Swagger UI shows all auth endpoints

## Testing Criteria
```
POST /api/v1/auth/token/      → 200, returns tokens
POST /api/v1/auth/token/      (bad creds) → 401
POST /api/v1/auth/token/refresh/ → 200, new access token
POST /api/v1/auth/logout/     → 205
GET  /api/v1/auth/me/         → 200, user object with role
PUT  /api/v1/auth/me/         → 200, updated user
```
