# Feature 21 — Contractors

## Overview

The Contractors screen manages the invoicing and payment pipeline for contract and gig workers. It tracks invoice lifecycle from submission through TDS deduction to payment, with a visual pipeline funnel and a per-contractor detail panel.

**Screen ID:** `contractors`  
**File:** [screens/contractors.jsx](../../screens/contractors.jsx)  
**Portal:** Admin only

---

## 21.1 Contractor KPIs

| Metric | Description |
|---|---|
| Active contractors | Total active contract workers |
| November payouts | Total disbursed this month |
| Awaiting approval | Invoices pending sign-off |
| TDS auto-deducted | Total TDS withheld and filed |

---

## 21.2 Invoice Pipeline

5-stage visual funnel showing invoice lifecycle:

| Stage | Description |
|---|---|
| Submitted | Invoice received from contractor |
| Validated | Invoice verified against contract terms |
| Approved | Sign-off obtained |
| TDS Applied | Tax deducted at source calculated and applied |
| Paid | Payment disbursed to contractor |

Each stage card shows: count of invoices + total amount at that stage.

---

## 21.3 Contractor Table

Horizontally scrollable table (7 columns) listing all contractors.

| Column | Description |
|---|---|
| Contractor | Avatar, name, ID, country, currency |
| Type | Contract type chip (Fixed / Hourly / Milestone) |
| Service | Service category |
| Rate | Hourly or fixed rate |
| This Month | Amount billed in the current period |
| Channel | Payment channel chip |
| Status | Active / Inactive / On Hold |

> **Bug fix (Jun 2026):** The contractor table was clipped by `overflow: hidden` on the card container without a scroll wrapper. Fixed by adding `<div style={{ overflowX: "auto" }}>` around the `<table>` — same pattern used in clients.jsx and employees.jsx.

---

## 21.4 Contractor Detail Panel

Clicking a contractor row opens the detail panel:

**Info card:** Avatar, name, ID, type, service

**Detail grid:**
- Onboarded date
- Country
- Rate
- Status

**YTD amount:** Total paid year-to-date

**Invoice list:**
- All invoices for the selected contractor
- Status: Pending / Approved / Paid

**Add Invoice form:**
- Create a new invoice for the selected contractor
- Fields: period, amount, description, supporting document upload

---

## Related Features

- [03-payroll-run.md](03-payroll-run.md) — Contractor payments are separate from employee payroll
- [22-expenses.md](22-expenses.md) — Contractor expense claims flow through Expenses
- [12-audit-log.md](12-audit-log.md) — Invoice approvals logged in the audit trail
