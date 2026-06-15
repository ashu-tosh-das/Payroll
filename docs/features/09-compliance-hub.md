# Feature 09 — Compliance Hub

## Overview

The Compliance Hub centralises all statutory filing obligations — TDS, PF, ESI, Professional Tax, LWF, and quarterly TDS returns. It provides auto-calculation, challan generation, filing history, and batch Form 16 management — with Atlas AI integrated for compliance recommendations.

**Screen ID:** `compliance`  
**File:** [screens/compliance.jsx](../../screens/compliance.jsx)  
**Portal:** Admin only

---

## 9.1 Overview Metrics

| Metric | Description |
|---|---|
| Compliance Score | Rolling compliance percentage |
| Total Statutory Liability | Aggregate amount across all active obligations |
| Due in 30 Days | Count of filings with upcoming deadlines |
| On-Time Filing Rate | Historical percentage of on-time submissions |

---

## 9.2 Tab: Upcoming Filings

Split-panel view for managing active compliance obligations.

### Left Panel — Obligation List

Each obligation shown as a clickable card:

| Obligation | Description |
|---|---|
| TDS · 192 | Tax Deducted at Source on salaries |
| PF (EPFO) | Provident Fund monthly remittance |
| ESI (ESIC) | Employees' State Insurance contribution |
| Professional Tax | State-level employment tax |
| LWF | Labour Welfare Fund contribution |
| Form 24Q | Quarterly TDS return |

Each card shows: obligation ID badge, name, description, payable amount (colour-coded by risk), due date, days remaining, auto-calculated badge, challan number, YTD filing count.

### Right Panel — Detail View

When an obligation is selected:

- Obligation name, description, "Due in X days" urgency badge
- **Grid:** Period, Due date, Payable amount, Payment mode (e-Challan number), Computed for (employee count), Variance vs previous month

**Calculation Breakdown Table:**
```
Gross taxable salary
  → Exemptions
  → Net taxable
  → Slab-wise tax
  → Cess
  → Surcharge
  = Total Payable
```

**Atlas Compliance Check Card:**
- AI-generated recommendations on calculation accuracy
- PAN–Aadhaar link status
- Declaration status
- Auto-filing eligibility

**Action Buttons:**
- **Preview Challan** — renders challan document
- **Generate & File** — submits filing (loading spinner during submission)

---

## 9.3 Tab: Filing History

Complete filing history table.

- Rows by period (Nov 2025, Oct 2025, etc.)
- Columns per statutory type (TDS·192, PF, ESI, PT) — each cell: amount filed, status chip, timestamp
- Total filed per period
- **Download** button per row to retrieve filed documents

---

## 9.4 Tab: Form 16 Batch Management

Manage annual Form 16 issuance for all employees.

**Summary stats:**

| Stat | Example |
|---|---|
| Eligible employees | 247 |
| Generated | 247 |
| Digitally Signed | 241 |
| E-Delivered | 218 |

**Filters:** Financial Year dropdown, Department filter, Location filter

**Bulk Actions:**
- **Bulk Download** — ZIP with all selected Form 16 PDFs
- **Email Unselected** — delivers Form 16 to employees not yet e-delivered

**Table Columns:** Checkbox, Employee name, PAN, Gross Salary, TDS Deducted, Digital Signature status, Delivery status, per-row Download button

Download button states:
- `"Download"` — available
- `"Preparing"` — spinner shown
- `"Downloaded"` — green checkmark chip

---

## Filing Sub-Page

**Sub-page ID:** `filing-register`  
Accessible from the Compliance tab — shows the full historical filing register with search and export.

---

## Related Features

- [03-payroll-run.md](03-payroll-run.md) — Compliance deadlines shown in pre-flight checks
- [02-dashboard.md](02-dashboard.md) — Compliance calendar on the dashboard
- [12-audit-log.md](12-audit-log.md) — All filing actions logged in audit trail
- [25-platform-features.md](25-platform-features.md) — Atlas AI compliance recommendations
