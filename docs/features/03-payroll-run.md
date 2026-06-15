# Feature 03 — Payroll Run

## Overview

The Payroll Run screen is the central workspace for executing monthly salary processing. It covers pre-flight validation, per-client payroll generation, detailed cost breakdowns, IT declaration management, approval workflows, and the payslip register.

**Screen ID:** `payroll`  
**File:** [screens/payroll.jsx](../../screens/payroll.jsx)  
**Portal:** Admin only  
**Nav badge:** `"Nov"` (current payroll period)

---

## 3.1 Run Selector

Horizontally scrollable row of payroll period cards at the top of the screen.

Each card shows:
- Period name (e.g., "Nov 2025")
- Processing status chip: **In Review** / **Paid**
- Total amount in ₹ Cr
- Employee count
- Anomaly count

Selecting a card loads all data for that period — health checks, breakdown, register.

---

## 3.2 Atlas Pre-Flight Check

Automated validation suite run before payroll approval. Results display as a grid of status cards.

| Check | Status levels |
|---|---|
| New joiners without salary structure | Pass / Warning / Fail |
| Employees in notice period | Pass / Info |
| Unresolved anomalies | Pass / Warning / Fail |
| Upcoming compliance deadlines | Pass / Warning |
| Bank account coverage | Pass / Fail |
| Pending reimbursements | Pass / Info |

- **Pass** → green
- **Warning / Info** → amber/blue — must be reviewed before approval
- **Fail** → red — blocks the Approve button
- A loading shimmer plays while checks are running

---

## 3.3 Client Tab Navigation

Payroll viewed and managed per client or across all clients.

- **All Clients tab** — consolidated grid of all client payroll cards with generate/generated status
- **Individual client tabs** — one tab per active client, showing client-specific breakdown
- Tab header shows a generation status chip: **Pending** / **Generating** / **Generated**

---

## 3.4 IT Declarations

IT declarations submitted by employees affect TDS calculations for the current run.

**Table columns:** Employee, Financial Year, Submitted Date, Original TDS, Revised TDS, Annual Saving, Status, Actions

- **Approve** — accepts the declaration; updates TDS computation for that employee
- **Reject** — declines the declaration; TDS reverts to original amount
- Total TDS savings across all approved declarations shown in the section header

---

## 3.5 Cost Breakdown

Detailed two-column breakdown for the selected client and period.

**Earnings**
- Basic, HRA, Special Allowance, LTA, Telephone Allowance, Employer PF
- → **Gross Earnings** total

**Deductions & Statutory**
- Employee PF (12%), Professional Tax, TDS, LOP Deductions
- → **Total Deductions**

**Highlighted line items**
- **LOP (Loss of Pay)** — days and deduction amount
- **Reimbursements** — approved claims merged into this run (count + value)

**Net Payable card**
- Large-format highlight showing final disbursement amount
- Payment mode (e.g., HDFC PayConnect)
- Scheduled disbursement date

---

## 3.6 Run Health Card

Compact card summarising key readiness checks for the current run:

- Attendance data imported and validated
- TDS recomputed with latest IT declarations
- AI anomaly scan completed (with count)
- All employee bank accounts verified
- No blocking statutory compliance issues

---

## 3.7 Variance Analysis

Month-on-month comparison card showing what changed and why.

| Component | Shows |
|---|---|
| Gross Salary | Prev month, current month, ₹ change, % change, reason |
| Variable & Bonus | Same |
| Overtime | Same |
| Reimbursements | Same |
| TDS | Same |

Example reasons: "New joiners", "Appraisal cycle", "LOP applied"

---

## 3.8 Payslip Register

Paginated register of all employee payslips for the selected run.

**Columns:** Employee, Department (chip), Location, Gross Pay, Deductions, LOP (if applicable), Net Pay, Status chip

**Filters:**
- Department dropdown
- Pay type: All / LOP / Normal

- 10 records per page with pagination controls and record-range counter
- **Export to CSV** button for the filtered register
- Rows with anomalies or LOP are visually highlighted

---

## 3.9 Approval Workflow

Six-stage approval pipeline surfaced within this screen.

**Stages:**
1. Payroll Prepared
2. Finance Review
3. Anomaly Check (AI)
4. HR Verification
5. CFO Sign-off
6. Bank Disbursement

- Completed stages show: approver name, role, exact timestamp
- Active stage shows a pulsing ring animation
- **Approve** button enabled only when all pre-flight checks pass
- Clicking Approve advances the workflow and logs to Audit Log

---

## Related Features

- [02-dashboard.md](02-dashboard.md) — Dashboard (approval tracker preview, client cards)
- [06-anomalies.md](06-anomalies.md) — Anomalies (blocks payroll approval if unresolved)
- [09-compliance-hub.md](09-compliance-hub.md) — Compliance (deadlines shown in pre-flight)
- [19-bank-transfer.md](19-bank-transfer.md) — Bank Transfer (next step after payroll approval)
- [08-payslips.md](08-payslips.md) — Payslips (individual payslip preview from register)
