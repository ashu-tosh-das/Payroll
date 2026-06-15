# Feature 19 — Bank Transfer File Generator

## Overview

The Bank Transfer screen generates the salary disbursement file for submission to the bank (HDFC PayConnect). It ensures all employees receive their net pay on the scheduled disbursement date via NEFT/RTGS or NACH bulk transfer.

**Screen ID:** `bank-transfer`  
**File:** [screens/bank-transfer.jsx](../../screens/bank-transfer.jsx)  
**Portal:** Admin only

---

## 19.1 Transfer Summary

| Field | Description |
|---|---|
| Payroll period selector | Choose which payroll run to disburse |
| Total disbursement amount | Sum of all employee net pays |
| Employee count | Total vs validated bank accounts |
| Scheduled disbursement date/time | When funds will be credited |
| Transfer status | Pending / Initiated / Confirmed / Failed |

---

## 19.2 Employee Disbursement Table

Line-by-line breakdown of each employee's transfer:

| Column | Description |
|---|---|
| Employee | Name and ID |
| Bank | Bank name |
| IFSC | Branch IFSC code |
| Account number | Masked (last 4 digits visible) |
| Net pay | Amount to be credited |
| Status | Validated / Pending / Error |

- Error rows highlighted in red with specific error reason (e.g., "Invalid IFSC", "Account closed")
- **Retry** button for failed transfers

---

## 19.3 File Generation

| Action | Description |
|---|---|
| **Generate HDFC NEFT/RTGS file** | Outputs bank-format CSV/TXT for salary transfers |
| **Generate NACH bulk transfer file** | NPCI format for National Automated Clearing House |
| **Penny test** | Sends ₹1 test transaction to unvalidated accounts before full disbursement |

All generated files include a checksum for bank submission verification.

---

## 19.4 Reconciliation

After disbursement:
1. **Upload bank confirmation file** — mark transfers as confirmed
2. **Auto-match** confirmed transfers to employee records
3. **Flag unmatched / failed transfers** for manual resolution

---

## Related Features

- [03-payroll-run.md](03-payroll-run.md) — Bank Transfer is the final step after payroll approval
- [04-employees.md](04-employees.md) — Bank details maintained in employee profile (with change request flow)
- [16-fnf-settlement.md](16-fnf-settlement.md) — F&F settlements also disbursed via bank transfer
- [12-audit-log.md](12-audit-log.md) — Transfer initiation and confirmation logged
