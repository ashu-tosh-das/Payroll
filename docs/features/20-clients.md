# Feature 20 — Clients

## Overview

The Clients screen manages the portfolio of client organisations for whom Source One provides payroll processing services. It provides a directory, per-client payroll navigation, and a timesheet upload sub-page for importing attendance data.

**Screen ID:** `clients`  
**File:** [screens/clients.jsx](../../screens/clients.jsx)  
**Portal:** Admin only

---

## 20.1 Client Directory

Client cards displayed in a grid:

| Field | Description |
|---|---|
| Client code | Short identifier (e.g., CLT-001) |
| Name | Full organisation name |
| Industry | Sector classification |
| Location | HQ city |
| Primary contact | Name and designation |
| Email | Contact email |
| Status | Active / Inactive chip |
| Relationship start date | When Source One began servicing this client |

**Filters:** Active only, by industry, by location  
**KPI:** Total active clients count

---

## 20.2 Client Detail View

Selecting a client shows:

- Client header: code badge, name, industry, HQ location, contact details
- Employee count for this client
- Payroll status for current month: Pending / Generated / Approved / Paid

### Timesheet Upload Section

Upload attendance CSV for client employees for the current payroll period.

**Sub-page ID:** `timesheet-upload`

After upload, a **Timesheet Preview Table** shows per-employee data:

| Column | Description |
|---|---|
| Employee | Name and ID |
| Working days | Scheduled working days in the period |
| Present days | Actual days present |
| Leave days | Sanctioned leave taken |
| Overtime hours | OT recorded in the period |

---

## 20.3 Client Payroll Navigation

Two entry points to per-client payroll:

1. **"View Payroll" button** on the client detail view — opens `ClientPayroll` sub-page
2. **Dashboard client card "View payroll →"** — opens `ClientPayroll` sub-page pre-filtered to that client

**Sub-page ID:** `client-payroll`

The `ClientPayroll` sub-page shows:
- Client-specific employee payroll register
- Generate payroll button (per client)
- Download Excel for the generated run

---

## Client List (Source One demo data)

| Code | Name | Employees | Status |
|---|---|---|---|
| CLT-001 | Infosys BPO Ltd. | ~80 | Active |
| CLT-002 | Wipro Technologies | ~65 | Active |
| CLT-003 | HCL Services | ~55 | Active |
| CLT-004 | TCS Managed Services | ~47 | Active |
| (others) | … | … | Active |

---

## Related Features

- [02-dashboard.md](02-dashboard.md) — Client payroll cards on dashboard link here
- [03-payroll-run.md](03-payroll-run.md) — Per-client tabs in Payroll Run feed from this screen
- [21-contractors.md](21-contractors.md) — Contractor invoices often billed against a client
