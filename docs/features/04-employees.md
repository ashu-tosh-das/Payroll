# Feature 04 — Employees

## Overview

The Employees screen is the master directory of all staff. It supports full-text search, multi-field filtering, profile inspection across six tabs, compensation review, document management, and bulk operations. The Add Employee flow is gated by Super Admin role.

**Screen ID:** `employees`  
**File:** [screens/employees.jsx](../../screens/employees.jsx)  
**Portal:** Admin only

---

## 4.1 Summary KPI Cards

| Metric | Description |
|---|---|
| Total Active Employees | Current headcount |
| On Approved Leave Today | Employees on sanctioned leave |
| In Notice Period | Employees working out their notice |
| Open Positions | Unfilled headcount requisitions |
| Average CTC | Company-wide average annual CTC |

---

## 4.2 Search & Filters

- **Full-text search** — across employee names and IDs
- **Department filter** — dropdown of all departments
- **Status filter** — Active / On Leave / Notice
- **Sort options** — Name A–Z, Highest CTC, Longest Tenure
- **Bank change request badge** — count of pending bank update requests; clicking highlights affected employees in the table

---

## 4.3 Employee Table

| Column | Content |
|---|---|
| Checkbox | Bulk selection |
| Employee | Avatar (initials, colour-coded), full name, email |
| ID | Employee ID (e.g., SO-1042) |
| Department | Colour-coded chip |
| Designation | Job title with level badge |
| Location | Office location |
| Annual CTC | Total package in ₹ |
| Tenure | Years of service |
| Bank Account | Masked account number |
| Status | Active / On Leave / Notice chip |
| Actions | Edit, View payslips, Open profile |

- 30 records per page with pagination and record-range counter
- Clicking a row opens the Employee Profile Drawer

---

## 4.4 Add Employee — Super Admin Guard

The **Add Employee** button is only shown when `window.isSuperAdmin === true` (i.e., the current persona is `super_admin`).

If a non-Super Admin user attempts to access the action, the button is hidden. This guard is checked at render time via `window.isSuperAdmin`.

---

## 4.5 Employee Profile Drawer

Clicking any employee row opens a right-side drawer with six tabs.

### Overview Tab

- Core fields: Department, Location, Email, Manager (linked), Date of Joining, Status
- Identity & Banking: PAN, UAN, Bank account (masked), IFSC
- **Pending Bank Change Requests** — old vs new account with Approve/Reject buttons
- Documents panel: Form 16, Appointment Letter, Offer Letter with verification status badges

### Compensation Tab

- Annual CTC with level badge (L2–L7) and last revision date
- Monthly breakdown: Basic, HRA, Special Allowance, LTA, Telephone Allowance
- **Salary history timeline** — up to 3 past entries with date, CTC value, % change, reason

### Attendance Tab

- Present days this month, average working hours per day, overtime hours
- Leave balance progress bars: PL, SL, CL, WFH — used/total + colour coding

### Documents Tab

- Full list of HR documents with download links and verification status (Verified / Pending)

### Activity Tab

- Chronological timeline of employment events: compensation revisions, performance reviews, address changes, joining date
- Each entry: date, event type, detail

### Biometric Tab

- Enrolment status, enrolled device count, last biometric punch timestamp
- **Force Re-enrol** button (admin action)
- Device table: location, device model, last sync, record count, online/offline status
- **Enrol on Device** button per listed device

---

## Related Features

- [05-attendance-leave.md](05-attendance-leave.md) — Leave requests visible in profile drawer
- [08-payslips.md](08-payslips.md) — View payslips from employee actions menu
- [14-roles-access.md](14-roles-access.md) — Super Admin role gates Add Employee
- [06-anomalies.md](06-anomalies.md) — Employee name in anomaly cards links to this drawer
