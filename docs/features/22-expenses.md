# Feature 22 — Expenses

## Overview

The Expenses screen manages corporate expense submissions from employees and contractors. It includes Atlas AI policy validation, multi-channel submission tracking, approval workflows, and integration with payroll reimbursements.

**Screen ID:** `expenses`  
**File:** [screens/expenses.jsx](../../screens/expenses.jsx)  
**Portal:** Admin only  
**Nav badge:** `"12"` (pending claims)

---

## 22.1 Expense Overview KPIs

| Metric | Description |
|---|---|
| Pending claims count + value | Claims awaiting approval |
| AI flags | Atlas-detected policy violations |
| Auto-approved % | Claims approved automatically by Atlas |
| November total spend | Total approved expenses this month |

---

## 22.2 Submission Channels

Distribution of expense submissions across channels:

| Channel | Icon colour |
|---|---|
| WhatsApp | Green |
| Slack | Purple |
| Mobile App | Blue |
| Email / Web | Orange |

Each channel shows count, percentage, and colour-coded icon.

---

## 22.3 Expense Claims

**Status filter tabs:** All | Pending | Approved | Rejected | Flagged

**Left panel — Expense list:**
- Each row: employee, category, amount, date, status
- Selected claim highlighted

**Right panel — Detail panel:**

| Section | Content |
|---|---|
| Receipt preview | Attached receipt image |
| Employee info | Avatar, name, ID, department |
| Policy check result | Pass / Fail with specific policy rule cited |
| AI risk score | Atlas confidence that the claim is valid (0–100%) |
| Actions | **Approve / Reject / Hold** buttons |

---

## 22.4 Policy Rules Management

Inline policy rule table:

| Column | Description |
|---|---|
| Category | Meal, Travel, Accommodation, etc. |
| Rule | Policy description |
| Limit | Maximum allowed amount |
| Per | Day / Month / Trip |
| Notes | Additional restrictions |
| Scope | All employees / Specific level / Department |
| Exceptions | Roles or employees exempt from this rule |
| Active | On/Off toggle |

- **Edit** button — modify existing rule
- **Delete** button — remove a rule
- **Add Rule** button — create a new expense limit

---

## Related Features

- [23-reimbursements.md](23-reimbursements.md) — Approved expenses flow into the Reimbursements queue
- [03-payroll-run.md](03-payroll-run.md) — Reimbursements are included as a line item in payroll
- [06-anomalies.md](06-anomalies.md) — Expense anomalies surfaced by Atlas (duplicate claims, policy breach)
- [24-employee-portal.md](24-employee-portal.md) — Employee-side My Reimbursements screen for claim submission
