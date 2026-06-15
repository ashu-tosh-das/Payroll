# Feature 05 — Attendance & Leave

## Overview

The Attendance & Leave screen gives HR teams visibility into daily workforce presence, leave balances, pending leave requests, WFH bookings, and holiday administration. It also provides a gateway to the Holiday Calendar sub-page.

**Screen ID:** `attendance`  
**File:** [screens/attendance.jsx](../../screens/attendance.jsx)  
**Portal:** Admin only

---

## 5.1 Live Attendance Status Cards

Four real-time status cards:

| Card | Description |
|---|---|
| Present | Employees on-site today — count + % of headcount |
| On Approved Leave | Employees on sanctioned leave today |
| WFH | Employees working from home with an approved WFH booking |
| Absent / Unmarked | Employees neither present nor on leave — includes pending reminder count |

---

## 5.2 Attendance Heatmap

Monthly calendar grid visualising attendance patterns across the organisation.

Each cell = one calendar day. Colour intensity reflects attendance rate:

| Colour | Attendance rate |
|---|---|
| Dark green | ≥ 95% |
| Light green | 90–94% |
| Dark blue | 80–89% |
| Red/Navy | < 80% |
| Light purple | Holiday (name shown on hover) |
| Dark grey | Weekend |
| Greyed out | Future date |

- Colour legend shown below the calendar
- Monthly average attendance percentage summarised in bottom-right

---

## 5.3 Leave Balance Summary

Per-leave-type organisation-wide summary:

| Leave type | Display |
|---|---|
| PL (Privilege Leave) | Colour bar, used/total, progress bar, % used |
| SL (Sick Leave) | Same |
| CL (Casual Leave) | Same |
| WFH | Same |

Used for budgeting leave liability and identifying high-consumption teams.

---

## 5.4 Pending Leave Requests Table

Centralised inbox for leave approval decisions.

**Columns:** Employee name, Leave type (chip), Date range, Duration (days), Reason, Submission details

- **Approve** / **Decline** buttons on each pending row
- Processed rows show Approved / Rejected status chip instead of action buttons
- **Bulk "Approve All Pending"** button for one-click mass approval

---

## 5.5 Workforce Distribution Donut Chart

Current-day split of workforce presence:

- Segments: In Office, WFH, On Leave, Absent — each colour-coded
- Total headcount in chart centre
- Legend with exact counts per segment

---

## 5.6 Holiday Calendar Administration

Manage the company holiday master:

- Holiday cards: date, day of week, name, type (National / Regional / Company)
- **Edit** button — modify existing holiday
- **Delete** button — remove a holiday
- **Add Holiday** button — opens inline modal with date picker, name, and type
- **Publish Changes** — pushes updates organisation-wide
- **View Full Calendar** button — opens the `holiday-calendar` sub-page

---

## 5.7 WFH Requests Management

Control over work-from-home booking requests.

**Columns:** Employee, Requested dates, Reason, Submission time, Status, Actions

- **Approve / Reject** buttons on pending requests
- Approved rows show approver name; rejected rows show rejection indicator
- **Bulk "Approve All Pending"** button when pending items exist

---

## Holiday Calendar Sub-Page

**Sub-page ID:** `holiday-calendar`  
**File:** [screens/holiday-calendar.jsx](../../screens/holiday-calendar.jsx)

Launched from the Attendance screen via "View Full Calendar".

### Holiday Master Data (`HOLIDAYS_2025`)

15 public and regional holidays for 2025, each with:

| Field | Description |
|---|---|
| `id` | Unique ID: `HOL-01` through `HOL-15` |
| `date` | Display date (e.g., `"Jan 01"`) |
| `day` | Day of week abbreviation |
| `name` | Holiday name |
| `type` | `"Gazetted"` / `"Regional"` / `"Restricted"` |
| `loc` | Applicable locations |

> **Bug fix (Jun 2026):** `HOLIDAYS_2025` entries were missing `id` fields, causing `key={h.id}` to always be `undefined` and triggering a React "unique key" warning across the entire Attendance component. Fixed by adding `HOL-01` through `HOL-15` IDs.

### Filter Tabs

All / Gazetted / Regional / Restricted

### Holiday Cards

Each holiday renders as a card with:
- Calendar date box (colour-coded by type: green/blue/purple)
- Holiday name, day chip, type chip, location
- Top colour strip (upcoming) or reduced opacity (past)

### Summary Metrics

- Total holidays (15 + 2 floating)
- Gazetted count (mandatory, all India)
- Regional count (state-specific)
- Restricted count (floating, employee choice)

---

## Related Features

- [24-employee-portal.md](24-employee-portal.md) — Employee-side leave application and WFH booking
- [04-employees.md](04-employees.md) — Leave balance visible in employee profile drawer
- [03-payroll-run.md](03-payroll-run.md) — LOP from unapproved absences flows into payroll
