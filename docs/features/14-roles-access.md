# Feature 14 — Roles & Access (Settings)

## Overview

The Settings screen provides Role-Based Access Control (RBAC) administration, permission management, and security policy configuration. It also includes developer tools for resetting demo data.

**Screen ID:** `settings`  
**File:** [screens/settings.jsx](../../screens/settings.jsx)  
**Portal:** Admin only

---

## 14.1 Overview Metrics

| Metric | Example |
|---|---|
| Active roles | 6 (2 system-defined, 4 custom) |
| Total users | 302 (employees + service accounts) |
| 2FA enrolled | 98% |
| Privileged sessions active | — |

---

## 14.2 Create New Role

Modal dialog for defining custom roles:

| Field | Description |
|---|---|
| Role Name | Text input |
| Description | Optional purpose text |
| Role Color | Five preset colour options for visual identification in the UI |
| Inherit Permissions From | Dropdown — copies an existing role's permissions as baseline |

**Create Role** button adds the role and persists it to localStorage.

---

## 14.3 Roles List (Left Panel)

Lists all configured roles:

**System roles (built-in):**
1. Super Admin
2. Payroll Manager
3. Finance
4. HR Business Partner
5. People Manager
6. Employee

Plus any custom roles created by administrators.

Each entry: colour dot, role name, member count, **Delete** button (disabled for Super Admin to prevent lockout).

---

## 14.4 Role Permissions Matrix (Right Panel)

Eight configurable permissions per role, each with an on/off toggle:

| Permission | Description |
|---|---|
| View all payslips | Access payslips for all employees |
| Edit compensation | Modify salary structures and CTCs |
| Run payroll cycle | Initiate monthly payroll processing |
| Approve payroll run | Sign off on approval workflow stages |
| Export PII data | Download reports containing personal data |
| Edit bank details | Update employee bank account information |
| View audit log | Access the immutable audit trail |
| Manage roles & access | Create, edit, and delete roles |

Changes persist immediately when a toggle is switched.

---

## 14.5 Security Policy

Four security controls configurable per role or organisation-wide:

| Control | Setting |
|---|---|
| Two-Factor Authentication | Required / Optional toggle |
| Session Timeout | Auto-logout after 30 minutes of inactivity |
| IP Allowlist | Restrict access to specific IP ranges |
| Privileged MFA | Additional MFA step for high-privilege actions |

---

## 14.6 Role Members Preview

Shows up to 6 employees assigned to the selected role:
- Avatar, name, employee ID
- Remove-from-role option per member

---

## 14.7 Developer Tools

Red-bordered utility card for testing and demo environments:

| Action | Effect |
|---|---|
| **Reset to Demo Data** | Clears all `so_*` localStorage keys and reloads with original seed data |
| **View Persisted Stores** | Lists all active localStorage keys and their record counts |

---

## Permission Sub-Page

**Sub-page ID:** `permission-audit`  
Full audit trail of all permission changes, accessible from the Settings header.

---

## Super Admin Role

The `super_admin` role has special behaviour across the app:
- `window.isSuperAdmin` is set to `true` when this role is active
- The **Add Employee** button in the Employees screen is only shown to Super Admins
- Super Admin role cannot be deleted from the roles list

**Demo personas for testing:**

| Role key | Name | Title |
|---|---|---|
| `super_admin` | Priya Kapoor | Super Admin |
| `hr_manager` | Rahul Mehta | HR Manager |
| `finance_manager` | Raj Kumar | Finance Manager |

Switching persona: Sidebar footer → click user area → select persona.

---

## Related Features

- [01-navigation-shell.md](01-navigation-shell.md) — Role picker in sidebar footer
- [04-employees.md](04-employees.md) — Add Employee gated by Super Admin role
- [12-audit-log.md](12-audit-log.md) — All role/permission changes logged
- [25-platform-features.md](25-platform-features.md) — localStorage persistence for role state
