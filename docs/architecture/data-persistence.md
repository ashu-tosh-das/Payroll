# Architecture — Data Layer & Persistence

## Overview

The data layer is a collection of plain JavaScript arrays and objects in [data.jsx](../../data.jsx), combined with a simple `localStorage` persistence API. It simulates a REST API backend — all component prop interfaces are designed to be replaceable with real `fetch()` calls.

---

## Data Globals

All data is exposed on `window` for access from any screen component.

### Core Data Arrays

| Global | Type | Contents |
|---|---|---|
| `window.EMPLOYEES` | Array | All employee records |
| `window.CLIENTS` | Array | Client organisation records |
| `window.COMPANIES` | Array | Source One legal entities (3) |
| `window.DEPARTMENTS` | Array | Department definitions with colours |
| `window.NOTIFICATIONS` | Array | System notification entries (8) |
| `window.PAYROLL_RUNS` | Array | Monthly payroll run history |
| `window.LEAVE_REQUESTS` | Array | Leave and WFH requests (mutable) |
| `window.TICKETS` | Array | Support ticket records (mutable) |
| `window.ANOMALIES` | Array | Detected payroll anomalies |
| `window.PAYSLIP_DATA` | Array | Per-employee payslip records |

### Utility Functions

| Function | Signature | Description |
|---|---|---|
| `fmtINR` | `(number) → string` | Format number as ₹ Indian Rupees |
| `initials` | `(name) → string` | Extract 2-letter initials from full name |
| `avatarHueFor` | `(name) → number` | Deterministic HSL hue from name for avatar colours |

---

## Persistence API

```js
// Persist any value to localStorage under "so_" + key
window.persist(key, data)
// → saves to localStorage.setItem("so_" + key, JSON.stringify(data))
// → updates window[key] simultaneously

// Load from localStorage; falls back to seed data if not found
window.loadStore(key, fallback)
// → JSON.parse(localStorage.getItem("so_" + key)) || fallback

// Clear all so_* keys and reload the page
window.resetAll()
// → Object.keys(localStorage).filter(k => k.startsWith("so_")).forEach(k => localStorage.removeItem(k))
// → location.reload()
```

### Persisted Stores

| localStorage key | Global variable | Initial value |
|---|---|---|
| `so_employees` | `window.EMPLOYEES` | Seed employees array |
| `so_leave_requests` | `window.LEAVE_REQUESTS` | Seed leave requests |
| `so_tickets` | `window.TICKETS` | Seed support tickets |
| `so_notifications` | `window.NOTIFICATIONS` | Seed notifications (8 entries) |
| `so_current_user_role` | `window.currentUserRole` | `"super_admin"` |
| `so_wfh_requests` | `window.WFH_REQUESTS` | Seed WFH requests |
| `so_holiday_additions` | (merged into attendance state) | Custom added holidays |

---

## Employee Record Shape

```js
{
  id: "SO-1042",
  name: "Deepak Verma",
  email: "deepak.verma@sourceone.com",
  dept: "Engineering",
  designation: "Senior Engineer",
  level: "L4",
  location: "Bengaluru",
  status: "active",          // "active" | "on-leave" | "notice"
  ctc: 1800000,              // Annual CTC in ₹
  doj: "2021-03-15",         // Date of joining
  pan: "ABCDE1234F",
  uan: "100456789012",
  bank: "HDFC0001234",       // IFSC
  account: "****4521",       // Masked account number
  manager: "SO-1001",        // Manager employee ID
}
```

---

## Notification Record Shape

```js
{
  id: "N001",
  type: "alert",             // "alert" | "info" | "check"
  title: "High overtime detected",
  body: "Atlas flagged 3 employees with overtime > 50 hrs",
  read: false,
  timestamp: "2025-11-25T14:32:00"
}
```

---

## Replacing with a Real Backend

Each data array has a direct 1:1 mapping to a REST endpoint shape:

| Current | Future |
|---|---|
| `window.EMPLOYEES` | `GET /api/employees` |
| `window.persist('employees', data)` | `PUT /api/employees/{id}` |
| `window.PAYROLL_RUNS` | `GET /api/payroll/runs` |
| `window.NOTIFICATIONS` | `GET /api/notifications` or WebSocket feed |

Component prop interfaces already accept the same object shapes — the only change required is in [data.jsx](../../data.jsx) to call `fetch()` instead of reading from `window`.

---

## Demo Data Reset

The **Reset to Demo Data** button in [Settings → Developer Tools](../features/14-roles-access.md) calls `window.resetAll()` — clears all `so_*` localStorage keys and reloads with the original seed data. Useful for demos and testing.
