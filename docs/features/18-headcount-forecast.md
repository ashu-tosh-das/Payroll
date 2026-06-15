# Feature 18 — Headcount Forecast

## Overview

The Headcount Forecast screen gives HR and Finance teams predictive visibility into workforce growth, attrition, and payroll cost projections. It supports scenario planning with real-time projection updates.

**Screen ID:** `headcount-forecast`  
**File:** [screens/headcount-forecast.jsx](../../screens/headcount-forecast.jsx)  
**Portal:** Admin only

---

## 18.1 Forecast Dashboard

| Metric | Description |
|---|---|
| Current headcount | 247 (live count) |
| Projected end-of-year headcount | Forecast based on hiring plans and historical attrition |
| Projected payroll cost | Next 3 / 6 / 12 month projections |
| Attrition forecast | Predicted exits based on historical trends |
| Net headcount change | Projected hires minus exits per month |

---

## 18.2 Monthly Projection Table

One row per month showing:

| Column | Description |
|---|---|
| Projected headcount | Expected total employees |
| Expected new hires | Planned additions |
| Projected exits | Expected attrition |
| Net change | Hires minus exits |
| Projected gross payroll cost | Forecast cost for the month |
| Variance from current | Difference from current month's cost |
| Confidence interval | Optimistic / Base / Conservative scenarios |

---

## 18.3 Department-Level Breakdown

- Per-department headcount projections
- Hiring plan vs actual tracking
- Budget vs projected cost per department
- Identifies departments likely to be over or under their approved headcount

---

## 18.4 Scenario Planning

- Model different hiring/attrition assumptions interactively
- Adjust growth rate, attrition rate, and hiring pace
- Projections update in real-time as inputs change
- Three scenario bands: Optimistic / Base / Conservative

---

## Related Features

- [04-employees.md](04-employees.md) — Current headcount source data
- [05-attendance-leave.md](05-attendance-leave.md) — Attrition visible in leave data
- [11-reports-analytics.md](11-reports-analytics.md) — Headcount & Attrition report in Reports library
- [15-payroll-variance.md](15-payroll-variance.md) — New joiners and exits drive payroll variance
