# Feature 13 — Support Center

## Overview

The Support Center manages employee helpdesk tickets with an AI-first resolution model. Atlas automatically handles common queries at Tier 1; complex issues escalate to human agents. The screen provides a ticket inbox, full conversation workspace, and analytics.

**Screen ID:** `support`  
**File:** [screens/support.jsx](../../screens/support.jsx)  
**Portal:** Admin only

---

## 13.1 Support Metrics

| Metric | Description |
|---|---|
| Open tickets | Current unresolved count |
| In Progress | Actively being worked on |
| Resolved (last 7 days) | Resolution velocity |
| Bot Deflection Rate | % of tickets resolved by Atlas without human intervention (e.g., 71%) |

---

## 13.2 Ticket List (Left Panel)

**Filter tabs:** All | Open | Mine (assigned to me) | Bot (handled by Atlas)

**Table columns:**

| Column | Description |
|---|---|
| Ticket ID | Unique ID (e.g., TKT-1042) |
| Subject | Ticket title with SLA indicator |
| Employee | Clickable — opens the Employee profile drawer |
| Category | Payroll query / Leave / IT Declaration / Bank change / Other |
| Channel | Email / Chat / WhatsApp |
| Priority | High / Medium / Normal |
| Assigned | Atlas badge / human avatar / "Unassigned" |
| Status | Open / In Progress / Resolved chip |

Selected row is highlighted for the active ticket.

---

## 13.3 Ticket Detail View (Right Panel)

Full conversation and resolution workspace.

**Ticket Header:**
- Ticket ID, category chip, priority badge
- SLA metric (time remaining to resolution target)

**Employee Card:**
- Avatar, full name, employee ID, original submission channel

**Conversation Thread:**

| Message type | Visual |
|---|---|
| Employee original message | Left-aligned bubble with timestamp |
| Atlas bot response | Green gradient card with token info, suggested action chips, Atlas attribution |
| Human agent replies | Standard bubble |
| Auto-actions box | Shows automated actions Atlas took (policy lookup, balance calculation, etc.) |

**Reply Box:**

| Control | Purpose |
|---|---|
| Text input | Compose reply |
| **Suggest** button | Pre-fills box with Atlas-generated suggested response |
| **Attach** button | Attach documents or screenshots |
| **Send** button | Sends the reply |
| Quick actions | Assign to Me, Add KB Article, Mark Resolved |

---

## 13.4 Category Breakdown Chart

Horizontal bar chart showing ticket distribution by category:

| Category | Description |
|---|---|
| Payroll query | Questions about salary, deductions |
| Reimbursement | Expense claim queries |
| Leave | Leave balance, policy questions |
| IT declaration | Tax saving declaration queries |
| Bank change | Account update requests |
| Other | Miscellaneous |

Each bar shows count and percentage.

---

## 13.5 Most Accessed FAQs

List of most frequently accessed knowledge base articles:
- Icon, article title, view count
- Helps identify common pain points and knowledge gaps

---

## Sub-Pages

### FAQ Library (`faq-library`)
Full knowledge base article library, accessible from the Support header.

### Bot Training (`bot-training`)
Interface for reviewing and improving Atlas's response accuracy on past tickets.

---

## Related Features

- [04-employees.md](04-employees.md) — Employee name in ticket list links to profile drawer
- [24-employee-portal.md](24-employee-portal.md) — Employee-side Raise a Ticket screen
- [25-platform-features.md](25-platform-features.md) — Atlas bot deflection capability
