# PORTAL-001 — Login Page UI

**Type:** Feature  
**Priority:** Critical  
**Status:** Done  
**Sprint:** 5  
**Component:** Frontend

## Summary
Design and implement the login page. No signup option — user credentials are created and managed exclusively by the Super Admin.

## Requirements
- Email + password form fields
- "Sign In" CTA button with loading state
- Error message display for invalid credentials
- "Contact your administrator for access" notice (no signup link)
- Demo credentials panel for development testing
- Consistent with existing dark-theme design system (Inter font, indigo accent)
- Keyboard accessible (Enter submits form)
- Password show/hide toggle

## Acceptance Criteria
- [ ] Form renders centered on a full-screen dark background
- [ ] Invalid credentials shows "Invalid email or password" error
- [ ] Successful login redirects to the user's role-based portal
- [ ] No "Create Account" or "Sign Up" link anywhere on the page
- [ ] Demo credentials section shows all test accounts

## Testing Criteria
```
Valid email + password → user authenticated, portal loads
Invalid password → error message displayed, form remains
Empty fields → validation error before submission
Enter key → submits form
```
