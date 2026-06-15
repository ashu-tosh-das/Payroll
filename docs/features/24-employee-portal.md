# Feature 24 — Employee Self-Service Portal

## Overview

The Employee Portal gives individual employees secure, role-scoped access to their own payroll and HR information. It is a completely separate experience from the Admin Portal — same URL, different screens, blue accent colour, and a different sidebar navigation.

**Portal:** Employee (switch via portal toggle in topbar or `window.switchPortal('employee')`)  
**File:** [screens/employee-portal.jsx](../../screens/employee-portal.jsx) + [screens/sub-pages.jsx](../../screens/sub-pages.jsx)

---

## Employee Portal Screens

| Screen ID | Label | File |
|---|---|---|
| `emp-dashboard` | Dashboard | employee-portal.jsx |
| `my-payslips` | My Payslips | employee-portal.jsx |
| `my-attendance` | My Attendance | employee-portal.jsx |
| `my-leave` | My Leave | employee-portal.jsx |
| `wfh-booking` | WFH Booking | sub-pages.jsx |
| `emp-profile` | My Profile | sub-pages.jsx |
| `it-declaration` | IT Declaration | employee-portal.jsx |
| `salary-calculator` | Salary Calculator | employee-portal.jsx |
| `my-reimbursements` | My Reimbursements | employee-portal.jsx |
| `raise-ticket` | Raise a Ticket | employee-portal.jsx |
| `biometric-sync` | Biometric Sync | sub-pages.jsx |

---

## 24.1 Employee Dashboard

- Next salary credit date and amount
- Current leave balance summary (PL/SL/CL days remaining)
- Pending support tickets count
- Recent documents (latest payslip, last letter)
- Quick action links: Apply Leave, Book WFH, Download Payslip, View IT Declaration

---

## 24.2 My Payslips

Monthly payslip archive.

| Element | Description |
|---|---|
| Period selector | Month/year dropdown |
| Payslip rows | Period, net pay, availability status |
| Preview | Renders full payslip document in-browser |
| Download | Saves PDF locally |
| Email | Re-sends payslip to registered email |

---

## 24.3 My Attendance

- Personal monthly attendance heatmap (same calendar view as admin, filtered to the individual)
- Daily punch-in/punch-out times
- Leave balance bars per leave type (used vs available)
- WFH days used vs policy allowance

---

## 24.4 My Leave

Complete leave management:

| Section | Description |
|---|---|
| Leave application form | Select leave type, date range, reason |
| Policy display | Entitlement and current balance per leave type |
| Leave history | Past requests: status (Approved/Rejected/Pending), approver name, dates |
| Cancel button | Available on pending applications |

---

## 24.5 WFH Booking (`wfh-booking`)

- Calendar-based interface — click or select days to request WFH
- Current month view: approved WFH days, rejected days, available days
- WFH policy reminder (max days per month, blackout dates)
- **Submit WFH Request** button — generates a request visible to admin in Attendance & Leave

---

## 24.6 IT Declaration (`it-declaration`)

Annual income tax saving declaration form.

**Section 80C Investments:**
- PPF, ELSS, NSC, LIC premium, home loan principal
- Each with amount input and maximum limit indicator

**HRA Exemption:**
- Monthly rent input
- Landlord PAN (required if rent > ₹1L/year)

**Section 80D:**
- Health insurance premium (self + family)

**Other Deductions:**
- NPS (80CCD), home loan interest, education loan interest

**Real-time TDS recalculation:**
- As amounts are entered, revised monthly TDS and annual saving displayed instantly

**Submit:**
- Sends declaration for HR approval
- Updates payroll TDS for subsequent months
- Status shown: Pending Approval / Approved (with approver name and date)

---

## 24.7 Salary Calculator (`salary-calculator`)

Interactive take-home pay simulator.

| Input | Description |
|---|---|
| Gross CTC | Annual package amount |
| HRA city | Metro / Non-metro classification |
| Monthly rent | For HRA exemption calculation |
| 80C investments | Declared amounts |

**Output (real-time):**
- Monthly and annual breakdown of all earnings
- All deductions (PF, PT, TDS)
- **Net take-home amount** displayed prominently

---

## 24.8 My Profile (`emp-profile`)

Employee self-service profile management:

- View and edit: address, emergency contact, personal email, phone
- Document upload: Aadhaar, PAN, passport, educational certificates
- **Bank account change request** — submit new account details for admin approval
- Linked accounts: PF UAN, Aadhaar verification status

---

## 24.9 My Reimbursements (`my-reimbursements`)

Employee-side expense claim management:

**Submit new claim:**
- Category, amount, date, description, proof upload (JPG/PDF)

**Claims history:**
- All past submissions: status, approver, notes
- Download receipt of an approved claim

---

## 24.10 Raise a Ticket (`raise-ticket`)

Employee-facing support interface:

**New ticket form:**
- Subject, category (Payroll/Leave/IT Declaration/Bank/Other), description, attachment

**Ticket history:**
- List of past and open tickets: ID, subject, status, last reply date
- Click any ticket to view the full conversation thread
- Reply to existing tickets from this screen

**Nav badge:** Count of open tickets for the current employee (`SO-1042`)

---

## 24.11 Biometric Sync (`biometric-sync`)

- Enrolment status across all company devices
- Last 5 punch records: check-in/check-out with device location and timestamp
- **Request Re-enrolment** button (if biometric data is lost or device changes)

---

## Employee Holiday Calendar (`employee-holiday`)

Sub-page version of the holiday calendar for employees — read-only, no edit/delete/add controls.

---

## Related Features

- [05-attendance-leave.md](05-attendance-leave.md) — Admin view of leave requests submitted here
- [08-payslips.md](08-payslips.md) — Admin payslip screen; employee accesses via My Payslips
- [13-support-center.md](13-support-center.md) — Admin view of tickets raised here
- [23-reimbursements.md](23-reimbursements.md) — Admin view of claims submitted via My Reimbursements
- [01-navigation-shell.md](01-navigation-shell.md) — Portal switching via topbar toggle
