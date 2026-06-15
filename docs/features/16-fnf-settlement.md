# Feature 16 — Full & Final Settlement (F&F)

## Overview

The F&F Settlement screen manages the complete financial close-out for employees who are resigning, retiring, or being terminated. It automates settlement calculation, document generation, multi-step approval, and bank disbursement.

**Screen ID:** `fnf-settlement`  
**File:** [screens/fnf-settlement.jsx](../../screens/fnf-settlement.jsx)  
**Portal:** Admin only

---

## 16.1 F&F Queue

List of employees with pending settlements.

Each entry shows:
- Employee name and ID
- Last working day
- Reason for separation (Resignation / Retirement / Termination)
- Status: Initiated / In Progress / Pending Approval / Disbursed

---

## 16.2 Settlement Calculation

Auto-calculated components for each employee:

| Component | Calculation |
|---|---|
| Outstanding salary | Pro-rated to last working day |
| Pending leave encashment | Unused PL × daily rate |
| Gratuity | Applicable if service ≥ 5 years (based on last salary × years) |
| Bonus / variable pay | Proportionate to period worked in the bonus cycle |
| Notice period recovery | Deducted if employee did not serve full notice |
| Loan recovery | Outstanding salary advance deductions |
| TDS on F&F amount | Computed on full-and-final payable |
| **Net Payable F&F** | Total after all deductions |

---

## 16.3 Document Generation

Auto-generated on settlement approval:

| Document | Description |
|---|---|
| Experience Letter | Service confirmation for the employee |
| Relieving Letter | Final-day exit confirmation |
| Settlement Breakup Statement | Itemised PDF of all settlement components |
| Form 16 Part-A | TDS certificate for the settlement amount |

---

## 16.4 Approval & Disbursement

**Multi-step approval workflow:**
1. Manager
2. HR
3. Finance

After all approvals:
- Bank transfer integration for settlement payout
- Disbursement confirmation and receipt generated
- Event logged to Audit Log

---

## Related Features

- [03-payroll-run.md](03-payroll-run.md) — F&F amounts are processed outside the regular payroll run
- [10-letters-documents.md](10-letters-documents.md) — Relieving and Experience Letters auto-generated
- [19-bank-transfer.md](19-bank-transfer.md) — Settlement disbursed via bank transfer
- [12-audit-log.md](12-audit-log.md) — All F&F actions logged
