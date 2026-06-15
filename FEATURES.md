# Source One Payroll Cloud — Feature Documentation

> **Version 2.1 | June 2026 | Source One Technologies Pvt. Ltd.**
>
> Source One Payroll Cloud is an AI-powered, full-stack payroll and HR management platform built for Indian enterprises. It provides end-to-end payroll processing, statutory compliance, employee self-service, and advanced analytics — all in one unified interface with a built-in AI engine called **Atlas**.

> **Individual feature docs:** Each section below also has a dedicated doc file in [`docs/features/`](docs/features/). Architecture docs are in [`docs/architecture/`](docs/architecture/). See [`docs/README.md`](docs/README.md) for the full index.

---

## Table of Contents

1. [Navigation & Application Shell](#1-navigation--application-shell)
2. [Dashboard](#2-dashboard)
3. [Payroll Run](#3-payroll-run)
4. [Employees](#4-employees)
5. [Attendance & Leave](#5-attendance--leave)
6. [Anomalies (AI-Powered Detection)](#6-anomalies-ai-powered-detection)
7. [AI Copilot — Atlas](#7-ai-copilot--atlas)
8. [Payslips](#8-payslips)
9. [Compliance Hub](#9-compliance-hub)
10. [Letters & Documents](#10-letters--documents)
11. [Reports & Analytics](#11-reports--analytics)
12. [Audit Log](#12-audit-log)
13. [Support Center](#13-support-center)
14. [Roles & Access (Settings)](#14-roles--access-settings)
15. [Payroll Variance Report](#15-payroll-variance-report)
16. [Full & Final Settlement (F&F)](#16-full--final-settlement-ff)
17. [Salary Revision](#17-salary-revision)
18. [Headcount Forecast](#18-headcount-forecast)
19. [Bank Transfer File Generator](#19-bank-transfer-file-generator)
20. [Clients](#20-clients)
21. [Contractors](#21-contractors)
22. [Expenses](#22-expenses)
23. [Reimbursements (Admin)](#23-reimbursements-admin)
24. [Employee Self-Service Portal](#24-employee-self-service-portal)
25. [Cross-Cutting Platform Features](#25-cross-cutting-platform-features)
26. [Glossary](#26-glossary)

---

## 1. Navigation & Application Shell

The application shell provides the persistent frame — sidebar, topbar, and page header — visible across every screen in both the Admin and Employee portals.

### 1.1 Sidebar Navigation

The left sidebar organises all screens into logical sections. The nav items, sections, and badges all adapt automatically depending on whether the user is in the Admin or Employee portal.

**Admin Portal sections and screens:**

| Section | Screens |
|---|---|
| Operate | Dashboard, Payroll Run, Clients, Contractors, Expenses, Reimbursements, F&F Settlement, Salary Revision, Bank Transfer, Employees, Attendance & Leave, Payslips |
| Compliance | Compliance Hub, Letters & Docs |
| AI Studio | AI Copilot, Anomalies |
| Governance | Reports, Payroll Variance, HC Forecast, Audit Log, Support Center, Roles & Access |

**Employee Portal sections and screens:**

| Section | Screens |
|---|---|
| My Space | Dashboard, WFH Booking, My Profile, My Attendance, My Leave, Biometric Sync |
| Documents | My Payslips, Salary Calculator, IT Declaration, My Reimbursements |
| Help | Raise a Ticket |

- Live **badge counts** on nav items (e.g., "Nov" on Payroll Run, "12" pending on Expenses, "3" anomalies) update dynamically from live data.
- The sidebar footer shows the logged-in user's avatar, name, and role.

### 1.2 Topbar

The persistent top bar provides global controls visible at all times.

- **Company Switcher** — Displays the active company's code badge, name, and employee count. Clicking opens a dropdown to switch between multiple registered entities (e.g., Source One Technologies, Digital Labs, HR Services). Each entity shows its code, name, employee count, and active/inactive status. Switching shows a toast confirmation.
- **Portal Toggle** — Two buttons to switch between Admin Portal (green accent) and Employee Portal (blue accent) instantly, without a separate login.
- **Breadcrumb** — Shows current location as `Portal Name → Screen Name`.
- **Live Payroll Chip** — Shows the current payroll run progress (e.g., `Nov payroll · 3 of 6`). Clicking navigates directly to the Payroll Run screen.
- **Notification Bell** — Badge shows unread notification count. Clicking opens the Notifications Popover.
- **Help Button** — Opens the contextual Help Center sub-page.
- **Theme Toggle** — Switches between dark and light mode. Shows a toast confirmation.
- **Auto-Save Indicator** — Green dot with "Auto-saved" text, confirming all data changes are persisted to localStorage.

### 1.3 Notifications Popover

Opens from the bell icon; lists all system, payroll, and compliance notifications.

- Each notification shows a type-based icon and colour (alert = red, info = blue, check = green), title, and body text.
- **Mark as Read** — Click individual notifications to mark them read; the bell badge count decreases accordingly.
- **Mark All Read** — One-click button to clear all unread notifications at once.

### 1.4 Page Header

Each screen has a consistent page header with:
- **Page title** and optional subtitle (e.g., department name or current period)
- **Actions area** — screen-specific buttons (e.g., Export, Run Payroll, Add Employee) rendered here

---

## 2. Dashboard

The Dashboard is the executive entry point for payroll administrators. It delivers a real-time snapshot of payroll health, AI-generated insights, compliance status, and organisational metrics — all without needing to navigate to individual screens.

### 2.1 KPI Cards

Four top-level metric cards with sparkline trend charts:

- **Monthly Payroll Cost** — Current month total in ₹ Cr, with a percentage change indicator vs the prior month and a 6-month sparkline chart.
- **Headcount** — Total active employees with new joiners this month and a sparkline trend.
- **AI Anomalies Detected** — Count of unresolved anomalies, colour-coded by the highest active severity (red = high, amber = medium). Also shows the total held amount pending sign-off.
- **Compliance Score** — A 0–100 score with a filled progress bar. Sub-text shows the breakdown (e.g., "6 on track, 1 pending review").

### 2.2 Payroll Cost Trend Chart

An interactive line chart showing the payroll cost trajectory over time.

- **Time range selector** — Toggle between 7 months, 12 months, or full financial year.
- The chart uses a gradient-fill area below the line for visual clarity.
- Anomaly data is overlaid as stacked bars segmented by severity (high/medium/low), so you can see the correlation between payroll spikes and anomalies.

### 2.3 Department Cost Distribution (Donut Chart)

A donut chart that visualises the share of total payroll cost by department.

- Top departments are shown individually; the remainder are grouped as "Others".
- The legend below the chart shows each department's name, employee count, monthly cost, and percentage share.
- The total employee count is displayed in the chart centre.

### 2.4 Approval Workflow Tracker

A visual pipeline showing the real-time status of the multi-step payroll approval chain.

- **Progress bar** with circular nodes — one node per stage, connected by a gradient line.
- Node states: **Done** (green checkmark + timestamp), **Active** (pulsing ring animation), **Pending** (grey dot).
- Stages include: Payroll Prepared → Finance Review → Anomaly Check (AI) → HR Verification → CFO Sign-off → Bank Disbursement.
- Clicking an active stage node navigates to the Payroll Run screen.

### 2.5 Atlas AI Insights

A card presenting automated analysis generated by the Atlas AI engine.

- Plain-English narrative summarising payroll health, key changes, and risk areas for the current period.
- Three recommended actions, each with a tone badge: **OK** (green), **Warning** (amber), **Info** (blue), and an associated icon.
- Recommendations are clickable and navigate to the relevant screen.

### 2.6 Quick Statistics Grid

Four secondary metrics providing at-a-glance workforce economics:

- **Average CTC** — Company-wide average annual cost-to-company (e.g., ₹19.4L)
- **Median Tenure** — Median years of service across active employees
- **Attrition Rate** — Trailing twelve-month attrition percentage
- **Pay Equity Ratio** — Gender pay parity metric (target ≥ 1.0)

### 2.7 Client Payroll Summary

A consolidated grid showing the payroll breakdown per client organisation.

- One card per active client showing: client code, status chip, employee count, gross salary, total deductions, and net pay.
- A **View Payroll** button per client navigates to that client's payroll detail in the Payroll Run screen.
- A consolidated **totals row** at the bottom sums all clients.

### 2.8 Recent Activity Feed

A live audit trail excerpt of the most recent system events.

- Each entry shows: actor avatar (colour-coded initials or AI sparkle icon), actor name, action description, target object, timestamp, source IP, and risk level chip.
- Provides immediate visibility into who did what, without opening the full Audit Log screen.

### 2.9 Compliance Calendar

A forward-looking list of upcoming statutory obligations in the next 30 days.

- Each item shows: task name, responsible team, due date, and urgency colour-coding (red if ≤ 7 days away).
- Lets finance and HR teams stay ahead of TDS, PF, ESI, and PT deadlines.

---

## 3. Payroll Run

The Payroll Run screen is the central workspace for executing monthly salary processing. It covers pre-validation, per-client payroll generation, detailed cost breakdowns, approval workflows, and payslip registers.

### 3.1 Run Selector

A horizontally scrollable row of payroll period cards at the top of the screen.

- Each card shows: period name (e.g., "Nov 2025"), processing status (In Review / Paid), total amount in ₹ Cr, employee count, and anomaly count.
- Selecting a card loads all data — health checks, cost breakdown, payslip register — for that payroll period.

### 3.2 Atlas Pre-Flight Check

Before approving a payroll run, Atlas automatically runs a series of validation checks and displays the results.

- **New joiners without salary structure** — flags employees who can't be processed
- **Employees in notice period** — confirms severance calculations are in order
- **Unresolved anomalies** — lists anomalies requiring sign-off before disbursement
- **Upcoming compliance deadlines** — alerts for filings triggered by this run
- **Bank account coverage** — verifies all active employees have valid bank details
- **Pending reimbursements** — shows claims queued for inclusion in this run

Each check returns a status: **Pass** (green), **Warning** (amber), **Info** (blue), or **Fail** (red). Warnings and Failures block the Approve button until reviewed. A loading shimmer animation shows while the check is running.

### 3.3 Client Tab Navigation

Payroll can be viewed and managed per client or across all clients simultaneously.

- **All Clients tab** — consolidated grid of all client payroll cards with generate/generated status.
- **Individual client tabs** — one tab per active client, each showing client-specific payroll with a detailed cost breakdown.
- Tab header shows a generation status chip: **Pending** / **Generating** / **Generated**.

### 3.4 IT Declarations Section

IT declarations submitted by employees affect TDS calculations. This section shows them in context of the current payroll run.

- Table with columns: Employee, Financial Year, Submitted Date, Original TDS, Revised TDS, Annual Saving, Status, and Approve/Reject action buttons.
- Total TDS savings across all approved declarations is shown as a callout in the section header.
- Approving or rejecting a declaration immediately updates TDS computation for that employee.

### 3.5 Cost Breakdown

A detailed two-column breakdown of all payroll components for the selected client and period.

- **Earnings** — Basic, HRA, Special Allowance, LTA, Telephone Allowance, Employer PF, and a **Gross Earnings** total.
- **Deductions & Statutory** — Employee PF (12%), Professional Tax, TDS, LOP deductions, and **Total Deductions**.
- **LOP (Loss of Pay)** — A highlighted line item showing number of LOP days and the deduction amount.
- **Reimbursements** — Approved expense claims merged into this payroll, shown with count and value.
- **Net Payable** — A large-format highlight card showing the final disbursement amount, payment mode (e.g., HDFC PayConnect), and scheduled disbursement date.

### 3.6 Run Health Card

A compact card summarising key checks for the current payroll run:

- Attendance data imported and validated
- TDS recomputed with latest IT declarations
- AI anomaly scan completed (with anomaly count)
- All employee bank accounts verified
- No blocking statutory compliance issues

### 3.7 Variance Analysis

A comparison card showing how the current payroll differs from the previous month.

- Line items: Gross Salary, Variable & Bonus, Overtime, Reimbursements, TDS.
- Each line shows: previous month value, current month value, absolute change (₹), percentage change, and a reason for the variance (e.g., "New joiners", "Appraisal cycle", "LOP applied").

### 3.8 Payslip Register

A paginated register of all individual employee payslips for the selected run.

- Columns: Employee, Department (colour chip), Location, Gross Pay, Deductions, LOP (if applicable), Net Pay, Status chip.
- **Filters** — by Department and by pay type (All / LOP / Normal).
- 10 records per page with pagination controls and a record-range counter.
- **Export to CSV** button for the filtered register.
- Rows with anomalies or LOP are visually highlighted for quick identification.

### 3.9 Approval Workflow

The multi-step approval chain for the payroll run, surfaced within this screen.

- Six-stage pipeline with visual progress nodes.
- Completed stages show: approver name, role, and exact timestamp.
- The active stage shows a pulsing ring animation indicating it is awaiting action.
- The **Approve** button on the active stage is enabled only when all pre-flight checks pass.
- Clicking Approve advances the workflow to the next stage and logs the event to the Audit Log.

---

## 4. Employees

The Employees screen is the master directory of all staff. It supports searching, filtering, profile inspection, compensation review, and bulk operations.

### 4.1 Summary KPI Cards

- Total active employees
- Employees on approved leave today
- Employees in notice period
- Number of open positions
- Company-wide average CTC

### 4.2 Search & Filters

- **Full-text search** across employee names and IDs
- **Department filter** dropdown
- **Status filter** — Active, On Leave, Notice
- **Sort options** — Name A–Z, Highest CTC, Longest Tenure
- **Bank change request badge** — shows the count of pending bank detail update requests; clicking highlights affected employees in the table

### 4.3 Employee Table

The main data grid with the following columns:

| Column | Description |
|---|---|
| Checkbox | For bulk selection |
| Employee | Avatar (initials, colour-coded), full name, email |
| ID | Employee ID (e.g., SO-1042) |
| Department | Colour-coded chip |
| Designation | Job title with level badge |
| Location | Office location |
| Annual CTC | Total package in ₹ |
| Tenure | Years of service |
| Bank account | Masked account number |
| Status | Active / On Leave / Notice chip |
| Actions menu | Edit, View payslips, Open profile |

Pagination shows 30 records per page with a record-range counter.

### 4.4 Employee Profile Drawer

Clicking any employee row opens a side drawer with six tabs.

#### Overview Tab
- Core fields: Department, Location, Email, Manager (linked), Date of Joining, Status.
- Identity & Banking: PAN number, UAN (EPF), Bank account (masked), IFSC code.
- **Pending Bank Change Requests** — shows old vs new account details with Approve / Reject buttons.
- Documents panel: lists HR documents (Form 16, Appointment Letter, Offer Letter) with verification status badges.

#### Compensation Tab
- Annual CTC displayed prominently with a level badge (L2–L7) and last revision date.
- Monthly salary component breakdown: Basic, HRA, Special Allowance, LTA, Telephone Allowance.
- **Salary history timeline** — up to 3 past entries showing date, CTC value, percentage change, and reason (promotion, annual increment, etc.).

#### Attendance Tab
- Present days this month, average working hours per day, overtime hours.
- Leave balance progress bars per leave type (PL, SL, CL, WFH) with used/total counts and colour coding.

#### Documents Tab
- Full list of HR documents with download links and verification status (Verified / Pending).

#### Activity Tab
- Chronological timeline of employment events: compensation revisions, performance reviews, address changes, joining date.
- Each event shows date, event type, and details.

#### Biometric Tab
- Enrolment status, enrolled device count, and last biometric punch timestamp.
- **Force Re-enrol** button (admin action).
- Device table: location, device model, last sync time, record count, online/offline status.
- **Enrol on Device** button per listed device.

---

## 5. Attendance & Leave

This screen gives HR teams visibility into daily workforce presence, leave balances, pending leave requests, WFH bookings, and holiday administration.

### 5.1 Live Attendance Status Cards

Four real-time status cards:

- **Present** — employees on-site today, count and percentage of total headcount.
- **On Approved Leave** — employees on sanctioned leave today.
- **WFH** — employees working from home with an approved WFH booking.
- **Absent / Unmarked** — employees who are neither present nor on approved leave, with a pending reminder count.

### 5.2 Attendance Heatmap

A monthly calendar grid visualising attendance patterns across the organisation.

- Each cell represents one calendar day. Colour intensity reflects the day's attendance rate:
  - Dark green → ≥ 95% present
  - Light green → 90–94%
  - Dark blue → 80–89%
  - Red/Navy → below 80%
  - Light purple → holiday (shows holiday name on hover)
  - Dark grey → weekend
  - Greyed out → future dates
- A colour legend is shown below the calendar.
- A monthly average attendance percentage summary is shown in the bottom right.

### 5.3 Leave Balance Summary

Per-leave-type summary for the organisation:

- Each leave type (PL, SL, CL, WFH) shown as a row with a colour bar, label, used/total days, progress bar, and percentage used.
- Used for budgeting leave liability and identifying teams with high leave consumption.

### 5.4 Pending Leave Requests Table

Centralised inbox for leave approval decisions.

- Columns: Employee name, Leave type (colour chip), Date range, Duration (days), Reason, Submission details.
- **Approve** and **Decline** action buttons on each pending row.
- Processed rows show a status chip (Approved / Rejected) instead of action buttons.
- **Bulk "Approve All Pending"** button for one-click mass approval.

### 5.5 Workforce Distribution Donut Chart

Shows the current-day split of workforce presence:

- Segments: In Office, WFH, On Leave, Absent — each colour-coded.
- Total headcount in the chart centre.
- Legend with exact counts per segment.

### 5.6 Holiday Calendar Administration

Manage the company holiday master list:

- Holiday cards showing: date, day of week, holiday name (e.g., Diwali, Republic Day), and holiday type (National / Regional / Company).
- **Edit** button to modify existing holiday details.
- **Delete** button to remove a holiday.
- **Add Holiday** button opens an inline modal with a date picker, name, and type fields.
- **Publish Changes** button to push updates organisation-wide.

### 5.7 WFH Requests Management

Visibility into and control over work-from-home booking requests:

- Table columns: Employee, Requested dates, Reason, Submission time, Status, Actions.
- **Approve / Reject** buttons on pending requests.
- Approved rows show the approver name; rejected rows show a rejection indicator.
- **Bulk "Approve All Pending"** button in the header when pending items exist.

---

## 6. Anomalies (AI-Powered Detection)

The Anomalies screen is Atlas's core output for payroll integrity. It automatically surfaces irregularities and guides payroll administrators through investigation and resolution.

### 6.1 Severity Dashboard

Four top KPI cards:

- **High Severity** — count of critical anomalies requiring immediate action (red)
- **Medium Severity** — count of anomalies needing review (amber)
- **Low Severity** — count of informational anomalies (blue)
- **Detection Rate** — Atlas's overall precision metric and false positive rate

### 6.2 Anomaly Trend Chart

A stacked bar chart showing anomaly patterns over the past six months — segmented by severity (high/medium/low). Helps identify seasonal patterns or emerging risk areas.

### 6.3 Anomaly List

A scrollable card list of all detected anomalies:

- Each card shows: severity badge, confidence percentage, anomaly title, employee name (with a clickable employee tooltip), category tag (Overtime / Reimbursement / Variable / Bank), and variance amount (e.g., +₹38,400).
- Resolved anomalies appear with strikethrough text and reduced opacity.
- **Filter tabs**: All anomalies / Mine (assigned to current user).
- Clicking a card loads the full investigation detail panel on the right.

### 6.4 Anomaly Detail Panel

The right-side panel is a complete investigation workspace for each anomaly.

#### Header & Action Bar
- Severity badge, unique anomaly ID (e.g., AN-2811), category, and title.
- Action buttons: **Preview Alert Email**, **Escalate to Payroll**, **Dismiss**, **Hold & Review**.

#### Employee Summary
- Avatar, full name (clicking opens the Employees profile drawer), employee ID, department, role, level badge, and net pay variance amount.

#### Atlas Reasoning Card
- AI-generated plain-English explanation of why this anomaly was flagged.
- Relevant pay history context, policy context, and risk narrative.
- A suggested corrective action as a checkbox (e.g., "Hold ₹38,400 pending skip-level sign-off").
- Atlas model version badge and a **Regenerate** button to refresh the analysis.

#### Evidence Chart
- Bar chart showing the employee's last 6 months of the relevant metric (OT hours, expense amount, etc.).
- Current month is highlighted in red with a spike indicator.
- A median baseline line annotation for reference.

#### Statistical Signal Cards
- Confidence score (e.g., 94%) with a percentage bar.
- Deviation metric (e.g., 3.4 standard deviations from baseline).
- Comparable cases count (number of similar anomalies in history).

#### Decision History Timeline
- Chronological log of all actions taken on this anomaly.
- Each entry: actor (Atlas AI or HR admin with avatar), role, action taken (Flagged / Acknowledged / Escalated / Dismissed), timestamp, and notes.

#### Alert Email Preview Modal
- Opens a formatted email preview suitable for sending to the employee's manager.
- Shows email chrome (To, From, Subject), a summary table, the Atlas recommendation callout, a manager acknowledgment link, and an audit trail footer.

---

## 7. AI Copilot — Atlas

The Copilot screen provides a conversational interface to the Atlas AI engine. Payroll professionals can query data, request analysis, and get guided recommendations through natural language.

### 7.1 Chat Interface

- User messages appear as right-aligned speech bubbles with avatar and timestamp.
- Atlas responses appear as left-aligned cards with a green gradient background, a sparkle icon, model label, response time, and token count.
- **Loading state** — a pulsing dot animation with "Thinking…" text and a shimmer placeholder card while Atlas processes the query.
- **Follow-up suggestion chips** — contextual quick-replies derived from the query topic; clicking one sends it as the next message.
- **Message actions** — Copy to clipboard, Thumbs Up (positive feedback), Thumbs Down (negative feedback).
- **Source attribution** — each Atlas response cites its data source (e.g., "Sourced from Nov 2025 payroll snapshot · 3 evidence rows").

### 7.2 Response Content Blocks

Atlas responses can contain rich content blocks:

- **Callout blocks** — colour-coded cards (warning / error / info) with an icon, tone, title, and body text.
- **Summary cards** — recommendation blocks with a green checkmark, conclusion statement, and supporting detail.
- **Inline data tables** — when Atlas references structured payroll data, it renders a formatted table within the response.

### 7.3 Suggested Prompts

Four pre-built prompt buttons appear above the input area for common queries:

- Payroll variance analysis
- Anomaly explanation request
- Compliance status check
- Employee-specific payroll query

### 7.4 Input Controls

- **Text input field** for typing queries.
- **Voice input button** (microphone icon).
- **Tools button** to select optional Atlas capabilities.
- **Send button** (enabled only when input is non-empty).
- Disclaimer: *"Atlas may make mistakes. Always verify payroll-affecting actions."*

### 7.5 Conversation Persistence

- The full chat thread is saved to sessionStorage automatically.
- On returning to the Copilot screen, a banner appears: *"Conversation restored from last session."*
- **New Chat** button clears the session and starts fresh.
- **History** button allows viewing past conversation threads.

---

## 8. Payslips

The Payslips screen handles generation, preview, and distribution of employee payslips.

### 8.1 Distribution Summary

Four KPI cards showing the payslip health for the current period:

- **Generated** — percentage of payslips generated (e.g., 100%)
- **E-Delivered** — percentage successfully sent via email or portal (e.g., 97%)
- **Opened** — percentage of delivered payslips that have been viewed by the employee (e.g., 88%)
- **Disputes Raised** — count of payslip disputes, with a resolved sub-count

### 8.2 Employee Selector

A left-side panel for browsing and selecting individual employees:

- Search box to filter by name or ID.
- Period dropdown to switch between payroll months.
- Scrollable list: each row shows avatar, full name, ID, department, and monthly net salary.
- Selected employee is highlighted with a left border accent and background tint.

### 8.3 Payslip Preview

The main content area shows a pixel-accurate, print-ready payslip document:

**Actions:**
- **Preview PDF** — renders the payslip in a print-preview modal.
- **Download** — saves the payslip as a PDF file.
- **E-mail** — sends the payslip to the employee's registered email address.

**Document content includes:**
- Company header: Source One logo badge, company name, full address, TAN, and CIN.
- Payslip metadata: month/year period and generation date.
- Employee information grid (2 columns): Name, Employee ID, Designation, Department, Location, Date of Joining, PAN, Bank Account (masked), UAN, Days Worked.
- **Earnings table**: Basic, HRA, Special Allowance, LTA, Telephone Allowance, Total Earnings.
- **Deductions table**: Provident Fund (12%), Professional Tax (state-specific), TDS, Total Deductions.
- **Net Pay highlight box**: large rupee amount plus amount in words ("Rupees Forty-Two Thousand... only").
- Footer: payslip authenticity disclaimer, "Generated by Atlas" attribution, and a cryptographic hash for integrity verification.

---

## 9. Compliance Hub

The Compliance Hub centralises all statutory filing obligations — TDS, PF, ESI, Professional Tax, LWF, and quarterly TDS returns. It includes auto-calculation, challan generation, and batch Form 16 management.

### 9.1 Overview Metrics

- **Compliance Score** — rolling compliance percentage
- **Total Statutory Liability** — aggregate amount across all active obligations
- **Due in 30 Days** — count of filings with upcoming deadlines
- **On-Time Filing Rate** — historical percentage of filings submitted on or before due date

### 9.2 Tab: Upcoming Filings

Split-panel view for managing active compliance obligations.

**Left: Obligation List**

Each obligation is shown as a clickable card:
- TDS · 192, PF (EPFO), ESI (ESIC), Professional Tax, LWF, Form 24Q
- Each card shows: obligation ID badge, name, description, payable amount (colour-coded by risk), due date, days remaining, auto-calculated badge, challan number, and YTD filing count.

**Right: Detail Panel**

When an obligation is selected, the detail panel shows:
- Obligation name, description, and a "Due in X days" urgency badge.
- Grid: Period, Due date, Payable amount, Payment mode (e-Challan number), Computed for (employee count), Variance vs previous month.
- **Calculation breakdown table**: Gross taxable salary → Exemptions → Net taxable → Slab-wise tax → Cess → Surcharge → Total Payable.
- **Atlas Compliance Check card**: AI-generated recommendations on calculation accuracy, PAN-Aadhaar link status, declaration status, and auto-filing eligibility.
- Action buttons: **Preview Challan**, **Generate & File** (with loading spinner during submission).

### 9.3 Tab: Filing History

Complete filing history table:
- Rows by period (Nov 2025, Oct 2025, etc.).
- Columns per statutory type (TDS·192, PF, ESI, PT) — each cell shows amount filed, status chip, and submission timestamp.
- Total filed per period.
- **Download** button per row to retrieve filed documents.

### 9.4 Tab: Form 16 Batch Management

Manage the annual Form 16 issuance for all employees:

- Summary stats: Eligible employees (247), Generated (247), Digitally Signed (241), E-Delivered (218).
- **Filters**: Financial Year dropdown, Department filter, Location filter.
- **Bulk Download** button — generates a ZIP with all selected Form 16 PDFs.
- **Email Unselected** button — delivers Form 16 to employees not yet e-delivered.
- Table columns: Checkbox, Employee name, PAN, Gross Salary, TDS Deducted, Digital Signature status, Delivery status, per-row Download button.
- Download button states: "Download" (available), "Preparing" (spinner shown), "Downloaded" (green checkmark chip).

---

## 10. Letters & Documents

The Letters screen automates generation, customisation, delivery, and signing of all standard HR correspondence.

### 10.1 Activity Metrics

- Letters issued this month (e.g., 186)
- Auto-generated by Atlas (e.g., 142 — 76% automation rate)
- E-signed documents (e.g., 84)
- Average turnaround time (e.g., 42 minutes from request to delivery)

### 10.2 Template Library

Eight standard HR letter templates:

| Template | Purpose |
|---|---|
| Salary Certificate | Formal salary confirmation for banks, visa applications, etc. |
| Offer Letter | Employment offer with compensation details and joining terms |
| Experience Letter | Service confirmation for departing employees |
| Increment Letter | Salary revision notification with old and new CTC |
| Appointment Letter | Formal joining confirmation for new hires |
| Relieving Letter | Final-day confirmation for resigned employees |
| Promotion Letter | Role and grade change notification |
| Warning Letter | Performance or conduct advisory |

Each template card shows: icon, category chip, template name, number of uses, last edited date, and variable count.

### 10.3 Employee Selection & Atlas Recommendation

- **Searchable employee dropdown** shows avatar, name, ID, designation, department, and status badge.
- When an employee is selected, **Atlas analyses their current status** and suggests the most relevant template (e.g., recommends "Increment Letter" if a recent CTC revision is detected).
- Recommendation pills are colour-coded chips with a reason text explaining why Atlas recommends each template.

### 10.4 Variable Editor

Left panel for customising letter variables:
- Each variable shown as a `{{variable_name}}` syntax key with an editable value field.
- **Auto-filled indicator** (green checkmark) shows when Atlas has pre-populated the value from the HR database.
- Manually editable for custom or situational values.

### 10.5 Delivery Configuration

Toggles for how the letter will be delivered:

- **PDF Download** — saves locally
- **Email delivery** — sends to employee's registered email
- **Self-Service Portal** — makes available in employee's document library
- **WhatsApp link** — generates a secure share link
- **DocuSign E-Sign** — routes document for digital signature workflow

### 10.6 Document Preview

Right panel shows a pixel-accurate document preview that updates in real-time as variables are edited:
- Company letterhead (logo, name, address, reference number, date)
- Fully populated letter body with all resolved variables
- Signature block with authorised signatory name and title
- Footer with verification URL and document hash for authenticity

### 10.7 Recent Letters Log

Table of recently generated letters:
- Columns: Letter ID, Template used, Employee, Delivery channel, Generation date, Status, Download.
- Auto-generated badge distinguishes Atlas-created letters from manually generated ones.

---

## 11. Reports & Analytics

The Reports screen provides a library of pre-built standard reports and an interactive analytics dashboard for workforce and payroll insights.

### 11.1 Summary Statistics

- Total available reports: 42
- Downloads in current month: 186
- Auto-scheduled reports: 4 (recurring delivery without manual action)
- Compliance-ready reports: 100% (all statutory reports are current)

### 11.2 Featured Analytics

Three interactive visualisation cards:

- **Salary Distribution Histogram** — bar chart of employee count across salary bands (<₹50K, ₹50K–1L, ₹1L–1.5L, ₹1.5L–2L, >₹2L), with median and P90 annotations.
- **Department Cost Share** — horizontal bar per department showing percentage share of total payroll cost.
- **Location Distribution** — breakdown of headcount across office locations (Bengaluru, Mumbai, Gurgaon, Remote).

### 11.3 Report Category Tabs

Filter the library by: **All** | **Finance** | **Tax** | **Statutory** | **Analytics** | **Audit**

### 11.4 Report Library

Grid of available reports, each as a card showing:
- File type icon (PDF / XLSX / CSV / ZIP) in a type-specific colour
- Report name and category chip
- Period covered (e.g., "Nov 2025", "FY 24–25", "Q3 FY26")
- File size
- Action buttons: **Preview** (open inline), **Download** (save to disk), **Schedule** (set up recurring delivery)

**Standard reports include:**

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

---

## 12. Audit Log

The Audit Log is an immutable, tamper-evident record of every action performed in the system, designed to meet SOC 2 Type II, ISO 27001, and DPDP compliance requirements.

### 12.1 Real-Time Metrics

- Events in last 24 hours (e.g., 1,284)
- High-risk events requiring immediate attention
- Active sessions — concurrent users logged in
- **Integrity hash status** — VALID checkmark confirming the cryptographic chain is unbroken

### 12.2 Search & Filter Controls

- **Search box** — free-text search across actor name, target object, or source IP address.
- **Action filter** — dropdown by action type (Login, Approved, Flagged, Uploaded, Sync, etc.).
- **Actor filter** — All / Humans only / System only / AI only.
- **Risk tabs** — All | High | Medium | Low — instantly filters by risk level.

### 12.3 Event Table

| Column | Description |
|---|---|
| Event ID | Unique ID (e.g., EVT-9914) |
| Actor | Avatar (colour-coded initials), full name, role; system actions show a gear icon; AI actions show a sparkle icon |
| Action | Colour-coded chip by risk level (Approved = green, Blocked = red, Flagged = amber) |
| Target | Object acted upon (e.g., "Payroll Run · Nov 2025", "SO-1064", "attendance_nov.csv") |
| Source IP | Originating IP address ("—" for system and AI actions) |
| Risk | High / Medium / Low chip |
| Timestamp | Exact date and time |

### 12.4 Integrity Proof Card

- Displays the current **cryptographic chain head** hash.
- Hash algorithm used: SHA-256.
- Anchored to: **AWS QLDB** (Quantum Ledger Database) providing blockchain-style immutable anchoring.
- Code block displaying the current chain hash value for manual verification.

### 12.5 Risk Distribution Chart

Visual breakdown of all events by risk level — Critical (0), High (4), Medium (32), Low (1,248) — shown as proportional bars.

### 12.6 Compliance Framework Status

Real-time compliance posture panel:
- **SOC 2 Type II** — Audit period and certification status
- **ISO 27001** — Certification status
- **GDPR / DPDP** — Data processing compliance indicator
- **Data Residency** — Confirms all data stored within India
- **Encryption** — AES-256 at rest and in transit status

---

## 13. Support Center

The Support Center manages employee helpdesk tickets with an AI-first resolution model. Atlas automatically handles common queries; complex issues escalate to human agents.

### 13.1 Support Metrics

- Open tickets (current unresolved count)
- In Progress tickets (actively being worked on)
- Resolved in last 7 days (resolution velocity)
- **Bot Deflection Rate** — percentage of tickets resolved by Atlas without human intervention (e.g., 71%)

### 13.2 Ticket List

Left panel showing all support tickets:

- **Filter tabs**: All | Open | Mine (assigned to me) | Bot (handled by Atlas).
- Table columns: Ticket ID, Subject (with SLA indicator), Employee (clickable — opens Employee drawer), Category, Channel (Email / Chat / WhatsApp), Priority (High / Medium / Normal), Assigned Agent (Atlas badge, human avatar, or "Unassigned"), Status chip.
- Selected row is highlighted for the active ticket.

### 13.3 Ticket Detail View

Right panel providing the full conversation and resolution workspace.

**Ticket Header** — Ticket ID, category chip, priority badge, SLA metric (time remaining to resolution target).

**Employee Card** — Avatar, full name, employee ID, and original submission channel.

**Conversation Thread:**
- Employee's original message (left-aligned bubble with timestamp)
- Atlas bot response (green gradient card) with: token info, suggested action chips (e.g., "View leave policy", "Apply leave now"), and Atlas attribution
- Human agent replies (if any)
- **Auto-actions box** — shows automated actions Atlas took (policy lookup, balance calculation, etc.)

**Reply Box:**
- Free-text input for composing replies
- **Suggest** button — pre-fills the reply box with an Atlas-generated suggested response
- **Attach** button — attach documents or screenshots
- **Send** button
- Quick actions: **Assign to Me**, **Add KB Article**, **Mark Resolved**

### 13.4 Category Breakdown Chart

A horizontal bar chart showing ticket distribution by category: Payroll query, Reimbursement, Leave, IT declaration, Bank change, Other — with count and percentage per category.

### 13.5 Most Accessed FAQs

A list of the most frequently accessed knowledge base articles with icon, title, and view count. Helps identify common pain points and knowledge gaps.

---

## 14. Roles & Access (Settings)

The Settings screen provides Role-Based Access Control (RBAC) administration, permission management, and security policy configuration.

### 14.1 Overview Metrics

- Active roles (e.g., 6 — 2 system-defined, 4 custom)
- Total users (e.g., 302 — employees + service accounts)
- 2FA enrolled (e.g., 98%)
- Privileged sessions currently active

### 14.2 Create New Role

A modal dialog for defining custom roles:
- **Role Name** — text input
- **Description** — optional purpose text
- **Role Color** — five preset colour options for visual identification in the UI
- **Inherit Permissions From** — dropdown to copy an existing role's permission set as the starting baseline
- **Create Role** button — adds the role to the system and persists it

### 14.3 Roles List

Left sidebar listing all configured roles:
- System roles: Super Admin, Payroll Manager, Finance, HR Business Partner, People Manager, Employee
- Custom roles created by administrators
- Each entry: colour dot, role name, member count
- **Delete** button (disabled for Super Admin to prevent lockout)

### 14.4 Role Permissions Matrix

Right panel for managing a selected role's permissions. Eight configurable permissions, each with an on/off toggle:

| Permission | Description |
|---|---|
| View all payslips | Access payslips for all employees |
| Edit compensation | Modify salary structures and CTCs |
| Run payroll cycle | Initiate the monthly payroll processing |
| Approve payroll run | Sign off on approval workflow stages |
| Export PII data | Download reports containing personal data |
| Edit bank details | Update employee bank account information |
| View audit log | Access the immutable audit trail |
| Manage roles & access | Create, edit, and delete roles |

Changes are persisted immediately when a toggle is switched.

### 14.5 Security Policy

Four security controls configurable per role or organisation-wide:
- **Two-Factor Authentication** — Required / Optional toggle
- **Session Timeout** — Auto-logout after 30 minutes of inactivity
- **IP Allowlist** — Restrict access to specific IP ranges
- **Privileged MFA** — Additional MFA step required for high-privilege actions

### 14.6 Role Members Preview

Shows up to 6 employees assigned to the selected role, with avatar, name, employee ID, and a remove-from-role option.

### 14.7 Developer Tools

A utility card (red-bordered) for testing and demo environments:
- **Reset to Demo Data** — clears all localStorage persistence and reloads with original seed data
- **View Persisted Stores** — lists all active localStorage keys and their record counts for debugging

---

## 15. Payroll Variance Report

Provides a structured month-on-month comparison of payroll costs, helping finance and HR teams understand what changed, why, and by how much.

### 15.1 Period Selection

Month selector dropdown to choose the comparison period (Apr 2025 – Nov 2025). Comparison is always against the immediately preceding month.

### 15.2 Summary KPIs

- Total variance amount (absolute, in ₹)
- Percentage change from previous month
- Number of employees with changed components
- Number of new joiners and exits contributing to the variance

### 15.3 Variance Table

Line-by-line comparison of payroll components:

| Component | Description |
|---|---|
| Gross Salary | Base + allowances |
| Variable Pay & Bonus | Incentives and performance bonuses |
| Overtime | Total OT hours × rate |
| Reimbursements | Approved expense claims in this run |
| TDS | Tax deducted at source |
| Net Pay | Total net disbursement |

Each row shows: component name, previous month value, current month value, absolute change (₹), percentage change, and reason for variance (e.g., "New joiners", "Appraisal cycle", "LOP applied").

### 15.4 Visual Breakdown

Bar chart showing each component's variance magnitude — green bars for cost decreases, red bars for cost increases.

---

## 16. Full & Final Settlement (F&F)

Manages the complete financial close-out for employees who are resigning, retiring, or being terminated.

### 16.1 F&F Queue

List of employees with pending F&F settlements — showing name, ID, last working day, and reason for separation. Status indicators: Initiated, In Progress, Pending Approval, Disbursed.

### 16.2 Settlement Calculation

For each employee, the system auto-calculates:
- Outstanding salary (pro-rated to last working day)
- Pending leave encashment (unused PL × daily rate)
- Gratuity (if applicable — based on years of service)
- Bonus and variable pay proportionate to the period worked
- Notice period recovery (if applicable)
- Loan recovery (outstanding salary advance deductions)
- TDS on the full-and-final amount
- **Net Payable F&F amount**

### 16.3 Document Generation

- Auto-generate Experience Letter
- Auto-generate Relieving Letter
- Settlement breakup statement PDF
- Form 16 Part-A for the settlement amount

### 16.4 Approval & Disbursement

- Multi-step approval workflow: Manager → HR → Finance
- Bank transfer integration for settlement payout
- Disbursement confirmation and receipt

---

## 17. Salary Revision

Manages appraisal cycles, individual salary increments, and bulk revision workflows.

### 17.1 Revision Cycle Overview

- Current appraisal cycle name and period (e.g., "Annual Appraisal FY 25–26")
- Progress metrics: pending revisions, approved, disbursed
- Budget utilisation: total increment budget vs consumed

### 17.2 Employee Revision Grid

Table of employees eligible for revision:
- Columns: Employee, Department, Level, Current CTC, Proposed CTC, Increment %, Reason, Status, Action.
- Inline editable: proposed CTC and reason fields.
- **Validate** button: checks if proposed increment is within policy bands.
- **Approve / Reject** per row.

### 17.3 Bulk Operations

- Upload increment sheet: CSV import for bulk CTC updates
- Apply department-wide flat percentage increase
- Export current revision sheet to Excel

### 17.4 Increment Letter Generation

- Auto-generate increment letters for all approved revisions
- Bulk e-mail delivery to employees

---

## 18. Headcount Forecast

Gives HR and Finance teams predictive visibility into workforce growth, attrition, and payroll cost projections.

### 18.1 Forecast Dashboard

- Current headcount (247) with projected end-of-year headcount
- Projected payroll cost for next 3 / 6 / 12 months
- Attrition forecast based on historical trends
- Net headcount change (hires minus exits) per month

### 18.2 Monthly Projection Table

Row per month showing:
- Projected headcount, expected new hires, projected exits, net change
- Projected gross payroll cost with variance from current month
- Confidence interval bands (optimistic / base / conservative scenarios)

### 18.3 Department-Level Breakdown

- Per-department headcount projections
- Hiring plan vs actual tracking
- Budget vs projected cost per department

### 18.4 Scenario Planning

- Model different hiring/attrition scenarios
- Adjust growth assumptions and see updated projections in real-time

---

## 19. Bank Transfer File Generator

Generates the salary disbursement file for submission to the bank (HDFC PayConnect), ensuring all employees receive their net pay on the scheduled disbursement date.

### 19.1 Transfer Summary

- Payroll period selector
- Total disbursement amount
- Employee count (total vs validated bank accounts)
- Scheduled disbursement date and time
- Transfer status: Pending / Initiated / Confirmed / Failed

### 19.2 Employee Disbursement Table

Line-by-line breakdown of each employee's transfer:
- Columns: Employee, Bank, IFSC, Account number (masked), Net pay, Status (Validated / Pending / Error).
- Error rows highlighted in red with a specific error reason (e.g., "Invalid IFSC", "Account closed").
- **Retry** button for failed transfers.

### 19.3 File Generation

- **Generate HDFC NEFT/RTGS transfer file** — outputs bank-format CSV/TXT.
- **Generate NACH bulk transfer file** (National Automated Clearing House).
- **Penny test** — sends ₹1 test transaction to unvalidated accounts before full disbursement.
- File download with checksum for bank submission.

### 19.4 Reconciliation

- Upload bank confirmation file to mark transfers as confirmed.
- Auto-match confirmed transfers to employee records.
- Flag unmatched or failed transfers for manual resolution.

---

## 20. Clients

Manages the portfolio of client organisations for whom Source One provides payroll processing services.

### 20.1 Client Directory

- Client cards: client code, name, industry, location, primary contact, email, status (Active/Inactive), relationship start date.
- Quick filters: Active only, by industry, by location.
- Total active clients KPI.

### 20.2 Client Detail View

- Client header: code badge, name, industry, HQ location, contact details.
- Employee count for this client.
- Payroll status for current month: Pending / Generated / Approved / Paid.
- **Timesheet upload section** — upload attendance CSV for client employees for the current payroll period.
- **Timesheet preview table** — rows per employee showing: working days, present days, leave days, overtime hours.

### 20.3 Client Payroll Navigation

"View Payroll" button navigates to the Payroll Run screen filtered to this client's data.

---

## 21. Contractors

Manages the invoicing and payment pipeline for contract and gig workers.

### 21.1 Contractor KPIs

- Active contractors, November payouts, Awaiting approval, TDS auto-deducted

### 21.2 Invoice Pipeline

A 5-stage visual funnel: **Submitted → Validated → Approved → TDS Applied → Paid**. Each stage card shows count and total amount.

### 21.3 Contractor Table

- Columns: Contractor (avatar, name, ID, country, currency), Type (chip), Service, Rate, This Month, Channel (chip), Status.

### 21.4 Contractor Detail Panel

- Info card: avatar, name, ID, type, service.
- Grid: onboarded date, country, rate, status.
- YTD amount.
- Invoice list for the selected contractor (pending / approved / paid).
- **Add Invoice** form for creating new invoices.

---

## 22. Expenses

Manages corporate expense submissions from employees and contractors, including policy validation, approval workflows, and integration with payroll reimbursements.

### 22.1 Expense Overview KPIs

- Total pending claims count and value
- AI flags count (Atlas-detected policy violations)
- Auto-approved percentage
- November total spend

### 22.2 Submission Channels

Shows distribution of expense submissions across channels:
- WhatsApp, Slack, Mobile App, Email/Web — each with count, percentage, and colour-coded icon.

### 22.3 Expense Claims

- **Status filter tabs** — All, Pending, Approved, Rejected, Flagged.
- **Expense list** (left) — selected claim highlighted; each row shows: employee, category, amount, date, status.
- **Detail panel** (right) — receipt preview, employee info, policy check result, AI risk score, and **Approve / Reject / Hold** buttons.

### 22.4 Policy Rules Card

Inline policy rule management:
- Rule table with columns: Category, Rule, Limit, Per (day/month), Notes, Scope, Exceptions, Active toggle.
- **Edit / Delete** buttons per rule.
- **Add Rule** button to create new expense limits.

---

## 23. Reimbursements (Admin)

A focused view for HR/Finance teams to review and process employee reimbursement claims submitted via the Employee Portal.

### 23.1 Reimbursement Queue

- List of all reimbursement claims with: employee name, category, description, amount, submission date, status.
- **Filter** by status (Pending / Approved / Rejected / Flagged) and by month.
- **Approve / Reject / Flag** action buttons per claim.

### 23.2 AI Anomaly Integration

- Claims flagged by Atlas (e.g., duplicate amounts, policy violations) are highlighted with an AI flag icon and a note explaining the concern.
- These align with anomalies surfaced in the Anomalies screen for cross-referencing.

### 23.3 Payroll Auto-Inclusion

- Approved claims for the current payroll period are automatically added to the payroll reimbursement line item.
- A confirmation chip shows how many claims are queued for the next payroll run.

---

## 24. Employee Self-Service Portal

The Employee Portal gives individual employees secure, role-scoped access to their own payroll and HR information.

### 24.1 Employee Dashboard

- Next salary credit date and amount
- Current leave balance summary (PL/SL/CL days remaining)
- Pending support tickets count
- Recent documents (latest payslip, last letter received)
- Quick action links: Apply Leave, Book WFH, Download Payslip, View IT Declaration

### 24.2 My Payslips

- Monthly payslip archive with period selector (month/year dropdown).
- Each payslip row: period, net pay, availability status.
- **Preview** — renders full payslip document in-browser.
- **Download** — saves PDF locally.
- **Email** — re-sends payslip to registered email address.

### 24.3 My Attendance

- Personal monthly attendance heatmap (same calendar view as admin, filtered to the individual).
- Daily punch-in/punch-out times.
- Leave balance bars per leave type (used vs available).
- WFH days used vs policy allowance.

### 24.4 My Leave

Complete leave management for the employee:
- **Leave application form** — select leave type, date range, reason.
- **Policy display** — entitlement and current balance per leave type.
- **Leave history table** — past requests with status (Approved/Rejected/Pending), approver name, and dates.
- **Cancel** button for pending applications.

### 24.5 WFH Booking

- Calendar-based interface — click or select days to request WFH.
- Current month view showing approved WFH days, rejected days, and available days.
- WFH policy reminder (maximum days per month, blackout dates).
- **Submit WFH Request** button — generates a request visible to admin on the Attendance & Leave screen.

### 24.6 IT Declaration

Annual income tax saving declaration form:

- **Section 80C investments** — PPF, ELSS, NSC, LIC premium, home loan principal — each with an amount input and max limit indicator.
- **HRA exemption** — monthly rent input, landlord PAN (if rent > ₹1L/year).
- **Section 80D** — health insurance premium for self and family.
- **Other deductions** — NPS, home loan interest, education loan interest.
- **Real-time TDS recalculation** — as amounts are entered, revised monthly TDS and annual saving are shown instantly.
- **Submit** button — sends declaration for HR approval and updates payroll TDS for subsequent months.
- Submission status: Pending Approval / Approved, with approver name and date.

### 24.7 Salary Calculator

An interactive take-home pay simulator:
- **Input** — Gross CTC amount.
- **Output** — Monthly and annual breakdown of earnings (Basic, HRA, SA, LTA) and deductions (PF, PT, TDS).
- Net take-home amount displayed prominently.
- Adjust variables: HRA city classification (metro/non-metro), rent amount, 80C investments.
- Real-time recalculation as inputs change.

### 24.8 My Profile

Employee self-service profile management:
- View and edit: personal details (address, emergency contact, personal email, phone).
- Document upload: Aadhaar, PAN, passport, educational certificates.
- **Bank account change request** — submit new account details for admin approval (visible to HR on Employees screen).
- Linked accounts: PF UAN, Aadhaar verification status.

### 24.9 My Reimbursements

Employee-side view of expense claims:
- **Submit new claim** — category, amount, date, description, proof upload (JPG/PDF).
- **Claims history** — all past submissions with status, approver, and notes.
- Download receipt of an approved claim.

### 24.10 Raise a Ticket

Employee-facing support interface:
- **New ticket form** — subject, category (Payroll/Leave/IT Declaration/Bank/Other), description, attachment.
- **Ticket history** — list of past and open tickets with ID, subject, status, last reply date.
- Click any ticket to view the full conversation thread.
- Reply to existing tickets directly from this screen.

### 24.11 Biometric Sync

- Shows the employee's biometric enrolment status across all company devices.
- Last 5 punch records: check-in/check-out events with device location and timestamp.
- **Request Re-enrolment** button (if biometric data is lost or the device changes).

---

## 25. Cross-Cutting Platform Features

These features are embedded across the entire platform and are not screen-specific.

### 25.1 Data Persistence (Auto-Save)

All data changes are automatically persisted to the browser's localStorage:

- `window.persist(key, data)` — saves any data array/object under the `so_` prefix and updates the global variable simultaneously.
- `window.loadStore(key, fallback)` — reads from localStorage on page load; falls back to seed data if no stored value exists.
- `window.resetAll()` — clears all `so_*` localStorage keys and reloads the application with original demo data.
- The **Auto-save indicator** in the topbar (green dot + "Auto-saved" text) confirms data is being persisted in real-time.

### 25.2 Toast Notification System

A global toast notification system for user feedback:

- Toasts appear in the top-right corner and auto-dismiss after 3 seconds.
- Types: **OK** (green), **Warning** (amber), **Danger** (red), **Info** (blue), **AI** (purple).
- Each toast shows an icon, main message, optional sub-text, and a manual dismiss button.
- Multiple toasts stack without overlapping.

### 25.3 Global Modal System

A centralised confirmation modal available across all screens:

- Title, subtitle/description, Cancel button, and Confirm button.
- Confirm button text is customisable per use case (e.g., "Yes, reset everything").
- Triggered via `window.openModal({ title, subtitle, confirmText, onConfirm })`.
- Renders via a React portal appended to `document.body`, ensuring it always appears above all other content.

### 25.4 Atlas AI — Embedded Throughout

Atlas is the unified AI engine powering features across the platform:

| Capability | Where it appears |
|---|---|
| Anomaly detection | Anomalies screen — scans every payroll run for statistical outliers |
| Pre-flight validation | Payroll Run screen — checks integrity before approval |
| Compliance recommendations | Compliance Hub — reviews calculations before filing |
| Document generation | Letters screen — auto-populates HR letter templates |
| Support chatbot | Support Center — handles Tier 1 queries with 71% deflection rate |
| Conversational analytics | Copilot screen — answers natural-language payroll queries |
| Anomaly explanation | Anomalies screen — plain-English narratives per anomaly |
| Smart template recommendation | Letters screen — suggests relevant template based on employee status |

### 25.5 Multi-Company Support

The platform supports multiple legal entities under a single login:

- Up to 3 companies configurable: Source One Technologies (247 employees), Source One Digital Labs (23 employees), Source One HR Services (47 employees, inactive).
- **Company Switcher** in the topbar allows instant context switch.
- Each company has: ID, name, short name, code badge, PAN, employee count, and active status.
- Switching companies changes the active dataset context and shows a toast confirmation.

### 25.6 Dark / Light Theme

- Full dark-mode and light-mode support across all screens.
- Toggle via the moon/sun icon button in the topbar.
- Theme preference applied via CSS `data-theme` attribute on the root HTML element.
- Toast confirmation on each theme switch.

### 25.7 Tweaks Panel

A development-mode side panel providing:
- **Layout controls** — sidebar style (labelled / icon-only), density (compact / comfortable).
- **Navigate section** — quick buttons to jump to any admin screen directly.

### 25.8 Dual-Portal Architecture

Single URL, two distinct experiences:

- **Admin Portal** — full payroll management suite for HR, Finance, and Payroll teams (green accent colour).
- **Employee Portal** — self-service interface scoped to the individual employee's own data (blue accent colour).
- Instant switch via the portal toggle in the topbar — no separate login required.
- Each portal has its own navigation structure and branding accent colour.

---

## 26. Glossary

| Term | Definition |
|---|---|
| **Atlas** | The AI engine embedded in Source One Payroll Cloud, responsible for anomaly detection, pre-flight checks, compliance recommendations, document generation, and the Copilot chat interface. |
| **CTC** | Cost to Company — the total annual compensation package inclusive of all salary components, employer contributions, and allowances. |
| **TDS** | Tax Deducted at Source — the monthly income tax deducted from employee salaries and remitted to the Income Tax Department. |
| **PF / EPF** | Provident Fund / Employees' Provident Fund — a mandatory retirement savings contribution (12% of basic salary) from both employee and employer, managed by EPFO. |
| **ESI** | Employees' State Insurance — a statutory social security and health insurance scheme for employees earning up to ₹21,000/month. |
| **PT** | Professional Tax — a state-level employment tax levied by state governments (Karnataka rate used in this platform). |
| **LWF** | Labour Welfare Fund — a state-mandated statutory contribution for employee welfare activities. |
| **LOP** | Loss of Pay — salary deduction for unauthorised absence or leave taken beyond the sanctioned balance. |
| **F&F Settlement** | Full and Final Settlement — the comprehensive financial settlement process for an employee leaving the organisation. |
| **HRA** | House Rent Allowance — a salary component provided to help employees meet rental accommodation costs; partially tax-exempt. |
| **UAN** | Universal Account Number — a unique, permanent 12-digit number assigned to each EPF member, enabling portability across employers. |
| **Form 16** | An annual TDS certificate issued by the employer to the employee, detailing total salary paid and TDS deducted during the financial year. |
| **24Q** | Quarterly TDS return filed by employers detailing TDS deducted on salaries. |
| **RBAC** | Role-Based Access Control — a permission model where system access is governed by assigned roles rather than individual user grants. |
| **SOC 2** | Service Organisation Control 2 — an auditing standard for data security, availability, and confidentiality. |
| **NACH** | National Automated Clearing House — a bulk payment system managed by NPCI for recurring and one-time electronic fund transfers. |
| **QLDB** | Quantum Ledger Database (AWS) — an immutable, cryptographically verifiable ledger used to anchor the Audit Log hash chain. |
| **IT Declaration** | Annual declaration of tax-saving investments (80C, HRA, 80D) submitted to the employer for revised TDS computation. |
| **Anomaly** | A statistical outlier detected by Atlas in payroll data — e.g., an unusual spike in overtime, a duplicate expense claim, or an unexplained salary variance. |
| **Pre-flight Check** | The set of automated validation steps Atlas runs before a payroll run can be approved, ensuring data integrity and compliance. |

---

*Generated by Source One Payroll Cloud · Atlas AI Engine*
