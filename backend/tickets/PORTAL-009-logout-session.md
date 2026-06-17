# PORTAL-009 — Logout & Session Management

**Type:** Feature  
**Priority:** High  
**Status:** Done  
**Sprint:** 5  
**Component:** Frontend

## Summary
Implement logout flow: clear session, redirect to login page. Sidebar sign-out button triggers logout.

## Requirements
- Sidebar footer logout button clears `hrflow_session` from localStorage
- App re-renders to login page immediately
- No server call needed (localStorage only)
- Toast confirmation on logout

## Acceptance Criteria
- [ ] Clicking sign-out clears session and shows login page
- [ ] Page refresh after logout stays on login page (no session)
- [ ] After logout, back button does not re-enter the app
