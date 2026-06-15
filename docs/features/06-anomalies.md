# Feature 06 — Anomalies (AI-Powered Detection)

## Overview

The Anomalies screen is Atlas's core payroll integrity output. It automatically surfaces statistical irregularities in payroll data and guides administrators through investigation, analysis, and resolution. Every payroll run is scanned automatically before approval.

**Screen ID:** `anomalies`  
**File:** [screens/anomalies.jsx](../../screens/anomalies.jsx)  
**Portal:** Admin only  
**Nav badge:** `"3"` (unresolved anomaly count)

---

## 6.1 Severity Dashboard

Four KPI cards at the top:

| Card | Colour | Description |
|---|---|---|
| High Severity | Red | Critical anomalies requiring immediate action |
| Medium Severity | Amber | Anomalies needing review |
| Low Severity | Blue | Informational anomalies |
| Detection Rate | Green | Atlas precision metric + false positive rate |

---

## 6.2 Anomaly Trend Chart

Stacked bar chart of anomaly counts over the past six months, segmented by severity (high/medium/low).

- Helps identify seasonal patterns (e.g., month-end OT spikes)
- Surfaces emerging risk areas before they become critical

---

## 6.3 Anomaly List

Scrollable card list of all detected anomalies.

Each card shows:
- **Severity badge** (High / Medium / Low)
- **Confidence percentage** (e.g., 94%)
- **Anomaly title** (plain-English description)
- **Employee name** — clickable, opens the employee tooltip
- **Category tag** — Overtime / Reimbursement / Variable / Bank
- **Variance amount** (e.g., `+₹38,400`)
- Resolved anomalies: strikethrough text + reduced opacity

**Filter tabs:** All anomalies / Mine (assigned to current user)

Clicking a card loads the full investigation detail panel on the right.

---

## 6.4 Anomaly Detail Panel

Complete investigation workspace in the right panel.

### Header & Action Bar

- Severity badge, unique ID (e.g., `AN-2811`), category, title
- Action buttons:
  - **Preview Alert Email** — opens the email preview modal
  - **Escalate to Payroll** — routes to Payroll Run screen
  - **Dismiss** — marks as reviewed and not actionable
  - **Hold & Review** — holds the affected amount pending sign-off

### Employee Summary

- Avatar, full name (clicking opens the Employees profile drawer), employee ID, department, role, level badge, net pay variance

### Atlas Reasoning Card

- AI-generated plain-English explanation of why the anomaly was flagged
- Relevant pay history context, policy context, risk narrative
- Suggested corrective action as a checkbox (e.g., "Hold ₹38,400 pending skip-level sign-off")
- Atlas model version badge + **Regenerate** button

### Evidence Chart

- Bar chart of the employee's last 6 months of the relevant metric (OT hours, expense amount, etc.)
- Current month highlighted in red with a spike indicator
- Median baseline line annotation

### Statistical Signal Cards

| Metric | Example |
|---|---|
| Confidence score | 94% with percentage bar |
| Deviation | 3.4 standard deviations from baseline |
| Comparable cases | Count of similar historical anomalies |

### Decision History Timeline

Chronological log of all actions on this anomaly:

| Actor type | Visual |
|---|---|
| Atlas AI | Sparkle icon |
| HR Admin | Colour-coded avatar |

Each entry: actor, role, action (Flagged / Acknowledged / Escalated / Dismissed), timestamp, notes

---

## 6.5 Alert Email Preview Modal

Formatted email preview for sending to the employee's manager.

Contains:
- Email chrome (To, From, Subject)
- Summary table of the anomaly
- Atlas recommendation callout box
- Manager acknowledgment link
- Audit trail footer with anomaly ID

---

## Anomaly Categories

| Category | Typical signal |
|---|---|
| Overtime | OT hours > 3σ from employee baseline |
| Reimbursement | Duplicate amounts or policy-cap breach |
| Variable | Bonus payout without performance record |
| Bank | Account change shortly before disbursement |

---

## Related Features

- [03-payroll-run.md](03-payroll-run.md) — Anomalies block payroll approval until resolved/dismissed
- [02-dashboard.md](02-dashboard.md) — Anomaly KPI card + Atlas insights reference anomalies
- [04-employees.md](04-employees.md) — Employee name in anomaly card links to profile drawer
- [25-platform-features.md](25-platform-features.md) — Atlas AI engine description
