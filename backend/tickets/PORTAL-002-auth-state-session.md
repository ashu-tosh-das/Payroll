# PORTAL-002 — Auth State & Session Management

**Type:** Feature  
**Priority:** Critical  
**Status:** Done  
**Sprint:** 5  
**Component:** Frontend / Data Layer

## Summary
Implement localStorage-based session management, mock credential store, and route guard logic.

## Requirements
- `auth-data.js`: mock user store with email/password/role/name for all 5 roles
- `authLogin(email, password)` → returns user object or null
- `authGetSession()` → reads from localStorage
- `authSaveSession(user)` → writes to localStorage
- `authClearSession()` → removes session on logout
- App.js: check session on mount; show Login or App accordingly
- Session persists across browser refresh

## Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@sourceone.in | Admin@123 |
| Payroll Admin | payroll@sourceone.in | Payroll@123 |
| HR Manager | hr@sourceone.in | Hr@1234 |
| Finance Viewer | finance@sourceone.in | Finance@123 |
| Read Only | readonly@sourceone.in | Read@1234 |

## Acceptance Criteria
- [ ] Session persists on page refresh
- [ ] Logout clears session and returns to login page
- [ ] `authLogin()` is case-insensitive for email
- [ ] Session object never stores raw password
