# Feature 15 — Payroll Variance Report

## Overview

The Payroll Variance Report provides a structured month-on-month comparison of payroll costs. Finance and HR teams use it to understand what changed between payroll runs, why it changed, and by how much — with line-item detail for every payroll component.

**Screen ID:** `payroll-variance`  
**File:** [screens/payroll-variance.jsx](../../screens/payroll-variance.jsx)  
**Portal:** Admin only

---

## 15.1 Period Selection

Month selector dropdown: Apr 2025 – Nov 2025

Comparison is always against the immediately preceding month.

---

## 15.2 Summary KPIs

| Metric | Description |
|---|---|
| Total variance amount | Absolute change in total payroll (₹) |
| Percentage change | % change from previous month |
| Employees with changed components | Count of employees whose pay changed |
| New joiners / exits | Count contributing to the variance |

---

## 15.3 Variance Table

Line-by-line comparison for each payroll component:

| Component | Shows |
|---|---|
| Gross Salary | Base + allowances |
| Variable Pay & Bonus | Incentives and performance bonuses |
| Overtime | Total OT hours × rate |
| Reimbursements | Approved expense claims in this run |
| TDS | Tax deducted at source |
| Net Pay | Total net disbursement |

Each row: component name, previous month value, current month value, absolute change (₹), percentage change, reason for variance.

**Example variance reasons:**
- "New joiners" — headcount increased
- "Appraisal cycle" — salary revision applied
- "LOP applied" — loss of pay deductions
- "One-time bonus" — special incentive payment

---

## 15.4 Visual Breakdown

Bar chart showing each component's variance magnitude:
- Green bars — cost decrease
- Red bars — cost increase

Helps quickly identify the primary driver of variance.

---

## Related Features

- [03-payroll-run.md](03-payroll-run.md) — Variance analysis card embedded in Payroll Run
- [11-reports-analytics.md](11-reports-analytics.md) — Variance data feeds into Reports analytics
- [17-salary-revision.md](17-salary-revision.md) — Appraisal cycles drive variance
