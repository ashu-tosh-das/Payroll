# Feature 02 — Dashboard

## Overview

The Dashboard is the executive entry point for payroll administrators. It delivers a real-time snapshot of payroll health, AI-generated insights, compliance status, organisational metrics, per-client payroll summaries, and a live activity feed — all on a single screen.

**Screen ID:** `dashboard`  
**File:** [screens/dashboard.jsx](../../screens/dashboard.jsx)  
**Portal:** Admin only

---

## 2.1 KPI Cards

Four top-level metric cards with sparkline trend charts:

| Card | Metric | Notes |
|---|---|---|
| Monthly Payroll Cost | Current month total in ₹ Cr | % change vs prior month + 6-month sparkline |
| Headcount | Total active employees | New joiners this month + sparkline trend |
| AI Anomalies Detected | Unresolved anomaly count | Colour-coded by highest severity (red/amber) + held amount |
| Compliance Score | 0–100 score | Filled progress bar + breakdown (e.g., "6 on track, 1 pending") |

---

## 2.2 Payroll Cost Trend Chart

Interactive line chart showing payroll cost over time.

- **Time range toggle:** 7 months / 12 months / Full FY
- Gradient-fill area below the line
- Anomaly data overlaid as stacked bars segmented by severity (high/medium/low)
- Clicking the chart area highlights the selected period's data

---

## 2.3 Department Cost Distribution (Donut Chart)

Donut chart visualising payroll cost share by department.

- Top departments shown individually; remainder grouped as "Others"
- Legend: department name, employee count, monthly cost, percentage share
- Total employee count displayed in the chart centre

---

## 2.4 Approval Workflow Tracker

Visual pipeline showing the real-time multi-step payroll approval chain.

**Stages:**
1. Payroll Prepared
2. Finance Review
3. Anomaly Check (AI)
4. HR Verification
5. CFO Sign-off
6. Bank Disbursement

**Node states:**
- Done — green checkmark + timestamp
- Active — pulsing ring animation
- Pending — grey dot

Clicking an active stage node navigates to the `payroll` screen.

---

## 2.5 Atlas AI Insights

Automated analysis card from the Atlas AI engine:

- Plain-English narrative of payroll health, key changes, and risk areas
- Three recommended actions with tone badges: **OK** (green), **Warning** (amber), **Info** (blue)
- Each recommendation is clickable and navigates to the relevant screen

---

## 2.6 Quick Statistics Grid

Four secondary workforce economics metrics:

| Metric | Example | Description |
|---|---|---|
| Average CTC | ₹19.4 L | Company-wide average annual CTC |
| Median Tenure | 3.2 yrs | Median years of service |
| Attrition Rate | 8.4% | Trailing 12-month attrition |
| Pay Equity Ratio | 1.02 | Gender pay parity (target ≥ 1.0) |

---

## 2.7 Client Payroll Summary

Consolidated grid of payroll status per client organisation.

- One card per active client: code, status chip, employee count, gross salary, deductions, net pay
- **View Payroll** button → opens `ClientPayroll` sub-page pre-filtered to that client (see CLIENT-001 in changelog)
- Consolidated totals row at the bottom

### Navigation Flow: Client Card → Client Payroll

```
Dashboard "View payroll →" button
    │  onClick: onSub("client-payroll", { clientId, clientName })
    ▼
App.setSubPage({ id: "client-payroll", clientId, clientName })
    ▼
<ClientPayroll clientId="CLT-001" clientName="Infosys BPO Ltd." onBack={closeSub}/>
```

---

## 2.8 Recent Activity Feed

Excerpt of the most recent system events from the audit trail.

Each entry shows:
- Actor avatar (colour-coded initials or AI sparkle icon)
- Actor name, action description, target object
- Timestamp, source IP, risk level chip

---

## 2.9 Compliance Calendar

Forward-looking list of statutory obligations due in the next 30 days.

- Task name, responsible team, due date
- Red highlight when ≤ 7 days away
- Covers TDS, PF, ESI, and PT deadlines

---

## Export Actions

The Export button in the page header triggers a named toast:
```
"Exporting Nov payroll summary… PDF ready"
```
(Explicit `onClick` handler — not relying on the global click fallback. See EXPORT-001 in changelog.)

---

## Related Features

- [03-payroll-run.md](03-payroll-run.md) — Payroll Run (linked via approval tracker and client cards)
- [06-anomalies.md](06-anomalies.md) — Anomalies (linked via KPI card and Atlas insights)
- [09-compliance-hub.md](09-compliance-hub.md) — Compliance (linked via compliance calendar)
- [20-clients.md](20-clients.md) — Clients (linked via client payroll cards)
