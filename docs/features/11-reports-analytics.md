# Feature 11 — Reports & Analytics

## Overview

The Reports screen provides a library of 42 pre-built standard reports and an interactive analytics dashboard for workforce and payroll insights. Reports can be previewed inline, downloaded, or scheduled for recurring delivery.

**Screen ID:** `reports`  
**File:** [screens/reports.jsx](../../screens/reports.jsx)  
**Portal:** Admin only

---

## 11.1 Summary Statistics

| Metric | Value |
|---|---|
| Available reports | 42 |
| Downloads this month | 186 |
| Auto-scheduled reports | 4 |
| Compliance-ready | 100% |

---

## 11.2 Featured Analytics

Three interactive visualisation cards:

### Salary Distribution Histogram
- Bar chart of employee count across salary bands: <₹50K, ₹50K–1L, ₹1L–1.5L, ₹1.5L–2L, >₹2L
- Median and P90 annotations

### Department Cost Share
- Horizontal bar per department showing percentage share of total payroll cost

### Location Distribution
- Breakdown of headcount across office locations: Bengaluru, Mumbai, Gurgaon, Remote

---

## 11.3 Report Category Tabs

Filter the report library by:
**All | Finance | Tax | Statutory | Analytics | Audit**

---

## 11.4 Report Library

Grid of available reports. Each card shows:
- File type icon (PDF / XLSX / CSV / ZIP) in a type-specific colour
- Report name and category chip
- Period covered (e.g., "Nov 2025", "FY 24–25", "Q3 FY26")
- File size
- Action buttons: **Preview** (inline), **Download** (save to disk), **Schedule** (set up recurring delivery)

### Standard Reports

| Report | Format |
|---|---|
| Monthly Payroll Register | PDF |
| Form 16 — Annual Tax | ZIP (bulk) |
| PF/ESI Challan | PDF |
| TDS Quarterly 24Q | XLSX |
| Department Cost Allocation | XLSX |
| Salary Distribution Histogram | PDF |
| Headcount & Attrition | PDF |
| Bank Disbursement Advice | CSV |
| Variable Pay Audit | PDF |
| Leave Liability Provision | XLSX |

### Download Action

Each Download button has an explicit `onClick` handler that shows a named toast:
```
"Payroll Register Nov 2025.pdf — 2.4 MB"
```

### Schedule Action

Clicking Schedule shows a toast:
```
"Scheduled: Monthly Payroll Register · Next run: Nov 30"
```

---

## Report Sub-Pages

### Scheduled Reports (`scheduled-reports`)
Lists all configured recurring reports with frequency, next run date, and delivery channel. Accessible from the Reports header.

### Report Builder (`report-builder`)
Custom report builder for creating non-standard reports. Accessible from the Reports header.

---

## Related Features

- [03-payroll-run.md](03-payroll-run.md) — Payroll Register generated from each payroll run
- [09-compliance-hub.md](09-compliance-hub.md) — Statutory reports (Form 16, PF/ESI challan)
- [12-audit-log.md](12-audit-log.md) — Audit reports available in the library
- [18-headcount-forecast.md](18-headcount-forecast.md) — Headcount & Attrition report
