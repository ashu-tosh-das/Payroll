# Feature 12 — Audit Log

## Overview

The Audit Log is an immutable, tamper-evident record of every action performed in the system. It is designed to meet SOC 2 Type II, ISO 27001, and DPDP compliance requirements. The log is anchored to AWS QLDB for cryptographic integrity.

**Screen ID:** `audit`  
**File:** [screens/audit.jsx](../../screens/audit.jsx)  
**Portal:** Admin only

---

## 12.1 Real-Time Metrics

| Metric | Description |
|---|---|
| Events in last 24 hours | e.g., 1,284 |
| High-risk events | Events requiring immediate attention |
| Active sessions | Concurrent users logged in |
| Integrity hash status | VALID ✓ — confirms cryptographic chain is unbroken |

---

## 12.2 Search & Filter Controls

| Control | Options |
|---|---|
| Search box | Free-text across actor name, target object, source IP |
| Action filter | Login, Approved, Flagged, Uploaded, Sync, etc. |
| Actor filter | All / Humans only / System only / AI only |
| Risk tabs | All \| High \| Medium \| Low |

---

## 12.3 Event Table

| Column | Description |
|---|---|
| Event ID | Unique ID (e.g., EVT-9914) |
| Actor | Avatar (colour-coded initials) / gear icon (system) / sparkle icon (AI) + name + role |
| Action | Colour-coded chip by risk level |
| Target | Object acted upon (e.g., "Payroll Run · Nov 2025", "SO-1064", "attendance_nov.csv") |
| Source IP | Originating IP address ("—" for system/AI actions) |
| Risk | High / Medium / Low chip |
| Timestamp | Exact date and time |

**Action chip colour coding:**

| Action | Colour |
|---|---|
| Approved | Green |
| Blocked | Red |
| Flagged | Amber |

---

## 12.4 Integrity Proof Card

- **Cryptographic chain head hash** — displayed in a code block for manual verification
- **Hash algorithm:** SHA-256
- **Anchored to:** AWS QLDB (Quantum Ledger Database) — blockchain-style immutable anchoring
- Confirms that no event has been modified or deleted since insertion

---

## 12.5 Risk Distribution Chart

Visual breakdown of all events by risk level:

| Level | Example count |
|---|---|
| Critical | 0 |
| High | 4 |
| Medium | 32 |
| Low | 1,248 |

Shown as proportional bars.

---

## 12.6 Compliance Framework Status

Real-time compliance posture:

| Framework | Status |
|---|---|
| SOC 2 Type II | Audit period + certification status |
| ISO 27001 | Certification status |
| GDPR / DPDP | Data processing compliance indicator |
| Data Residency | All data stored within India confirmed |
| Encryption | AES-256 at rest and in transit |

---

## Related Features

- [03-payroll-run.md](03-payroll-run.md) — Every payroll approval logs an event to this screen
- [14-roles-access.md](14-roles-access.md) — Role and permission changes are logged
- [09-compliance-hub.md](09-compliance-hub.md) — Filing submissions are logged
- [11-reports-analytics.md](11-reports-analytics.md) — Audit reports available in the Reports library
