# Feature 23 — Reimbursements (Admin)

## Overview

The Admin Reimbursements screen gives HR and Finance teams a focused view for reviewing and processing employee reimbursement claims submitted via the Employee Portal. Approved claims are automatically included in the next payroll run.

**Screen ID:** `reimbursements`  
**File:** [screens/admin-reimbursements.jsx](../../screens/admin-reimbursements.jsx)  
**Portal:** Admin only  
**Nav badge:** `"5"` (pending claims)

---

## 23.1 Reimbursement Queue

List of all reimbursement claims.

| Column | Description |
|---|---|
| Employee | Name and ID |
| Category | Meal / Travel / Medical / Fuel / Other |
| Description | Brief description of the expense |
| Amount | Claimed amount in ₹ |
| Submission date | When the employee submitted the claim |
| Status | Pending / Approved / Rejected / Flagged chip |

**Filters:**
- Status: Pending / Approved / Rejected / Flagged
- Month: filter by submission month

**Actions per claim:** **Approve / Reject / Flag**

---

## 23.2 AI Anomaly Integration

Claims flagged by Atlas are highlighted with:
- AI flag icon
- A note explaining the concern (e.g., "Duplicate amount detected", "Exceeds monthly policy cap")

These flags align with anomalies surfaced in the Anomalies screen for cross-referencing — the same anomaly may appear in both places.

---

## 23.3 Payroll Auto-Inclusion

- Approved claims for the current payroll period are automatically added to the payroll reimbursement line item
- A confirmation chip in the section header shows how many claims are queued for the next payroll run
- Once included in payroll, claims show a "In Payroll" status badge

---

## Related Features

- [22-expenses.md](22-expenses.md) — Claims originate from the Expenses screen (admin) or employee portal
- [03-payroll-run.md](03-payroll-run.md) — Reimbursements are a payroll cost breakdown line item
- [06-anomalies.md](06-anomalies.md) — Duplicate/policy-breach claims flagged by Atlas
- [24-employee-portal.md](24-employee-portal.md) — Employees submit claims via My Reimbursements
