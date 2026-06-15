# Feature 17 — Salary Revision

## Overview

The Salary Revision screen manages appraisal cycles, individual salary increments, and bulk revision workflows. It covers budget tracking, inline editing of proposed CTCs, policy validation, and auto-generation of increment letters.

**Screen ID:** `salary-increment`  
**File:** [screens/salary-increment.jsx](../../screens/salary-increment.jsx)  
**Portal:** Admin only

---

## 17.1 Revision Cycle Overview

| Metric | Description |
|---|---|
| Cycle name | Current appraisal cycle (e.g., "Annual Appraisal FY 25–26") |
| Period | Start and end dates of the cycle |
| Pending revisions | Count not yet approved |
| Approved | Count approved and ready for disbursement |
| Disbursed | Count already applied to payroll |
| Budget utilisation | Total increment budget vs consumed |

---

## 17.2 Employee Revision Grid

Table of employees eligible for revision.

**Columns:**

| Column | Description |
|---|---|
| Employee | Name, ID, department |
| Level | Grade (L2–L7) |
| Current CTC | Existing annual package |
| Proposed CTC | Inline editable |
| Increment % | Auto-calculated from current vs proposed |
| Reason | Inline editable (Annual / Promotion / Market correction) |
| Status | Pending / Validated / Approved / Rejected chip |
| Action | Validate / Approve / Reject buttons |

**Validate** button checks if the proposed increment is within policy bands (e.g., max 30% for standard increment, no cap for promoted employees).

---

## 17.3 Bulk Operations

| Operation | Description |
|---|---|
| Upload increment sheet | CSV import for bulk CTC updates |
| Department-wide flat % | Apply a fixed percentage to all employees in a department |
| Export revision sheet | Download current revision data to Excel for offline editing |

---

## 17.4 Increment Letter Generation

After revision approval:
- Auto-generate increment letters for all approved revisions via the Letters module
- Bulk email delivery to all affected employees
- Letters available in employee's document library via the Employee Portal

---

## Related Features

- [10-letters-documents.md](10-letters-documents.md) — Increment Letter template used
- [15-payroll-variance.md](15-payroll-variance.md) — Salary revision is a primary driver of payroll variance
- [03-payroll-run.md](03-payroll-run.md) — Revised CTCs applied in the next payroll run
- [04-employees.md](04-employees.md) — Salary history in employee profile updated
