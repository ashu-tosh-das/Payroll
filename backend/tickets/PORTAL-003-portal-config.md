# PORTAL-003 — Portal Configuration & Role-Nav Mapping

**Type:** Feature  
**Priority:** Critical  
**Status:** Done  
**Sprint:** 5  
**Component:** Frontend / Config

## Summary
Create `portal-config.js` — the single source of truth mapping each role to its allowed navigation items and edit permissions.

## Portal Access Matrix

| Page | Super Admin | Payroll Admin | HR Manager | Finance Viewer | Read Only |
|------|:-----------:|:-------------:|:----------:|:--------------:|:---------:|
| Dashboard | ✓ full | ✓ full | ✓ full | ✓ full | ✓ view |
| Employees | ✓ full | ✓ view | ✓ full | — | — |
| Payroll | ✓ full | ✓ full | — | ✓ view | — |
| Reports | ✓ full | ✓ full | ✓ HR reports | ✓ finance | ✓ view |
| Settings | ✓ full | — | — | — | — |

## Acceptance Criteria
- [ ] `getPortalNav(role)` returns correct page IDs for each role
- [ ] `canEditPage(role, page)` returns false for view-only combinations
- [ ] Default fallback for unknown roles returns `['dashboard']` only
