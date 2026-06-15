# Feature 07 — AI Copilot (Atlas)

## Overview

The Copilot screen provides a conversational interface to the Atlas AI engine. Payroll professionals can query data, request analysis, get guided recommendations, and trigger actions through natural language — all within the chat interface.

**Screen ID:** `copilot`  
**File:** [screens/copilot.jsx](../../screens/copilot.jsx)  
**Portal:** Admin only

---

## 7.1 Chat Interface

| Element | Description |
|---|---|
| User messages | Right-aligned speech bubbles with avatar and timestamp |
| Atlas responses | Left-aligned cards with green gradient background, sparkle icon, model label, response time, token count |
| Loading state | Pulsing dot animation + "Thinking…" text + shimmer placeholder card |
| Follow-up chips | Contextual quick-reply suggestions derived from the query topic |
| Message actions | Copy to clipboard, Thumbs Up (positive feedback), Thumbs Down (negative feedback) |
| Source attribution | Each response cites its data source (e.g., "Sourced from Nov 2025 payroll snapshot · 3 evidence rows") |

---

## 7.2 Response Content Blocks

Atlas responses can contain rich content blocks in addition to plain text:

| Block type | Description |
|---|---|
| **Callout** | Colour-coded card (warning/error/info) with icon, tone, title, body |
| **Summary card** | Recommendation block with green checkmark, conclusion, supporting detail |
| **Inline data table** | Formatted table when Atlas references structured payroll data |

---

## 7.3 Suggested Prompts

Four pre-built prompt buttons above the input for common queries:

1. Payroll variance analysis
2. Anomaly explanation request
3. Compliance status check
4. Employee-specific payroll query

Clicking a prompt sends it as a user message immediately.

---

## 7.4 Input Controls

| Control | Purpose |
|---|---|
| Text input | Free-text query entry |
| Voice button | Microphone icon for voice input |
| Tools button | Select optional Atlas capabilities |
| Send button | Enabled only when input is non-empty |

> **Disclaimer shown below input:** *"Atlas may make mistakes. Always verify payroll-affecting actions."*

---

## 7.5 Conversation Persistence

- Full chat thread saved to `sessionStorage` automatically
- On returning to Copilot: banner shows *"Conversation restored from last session"*
- **New Chat** button — clears session and starts fresh
- **History** button — view past conversation threads

---

## Atlas Model Context

Atlas is the shared AI engine across the entire platform. In the Copilot screen it operates in a conversational mode. Elsewhere it operates autonomously:

| Capability | Screen |
|---|---|
| Anomaly detection | Anomalies — scans every payroll run |
| Pre-flight validation | Payroll Run — checks before approval |
| Compliance recommendations | Compliance Hub |
| Document generation | Letters screen |
| Support chatbot (Tier 1) | Support Center — 71% deflection rate |
| Conversational analytics | Copilot (this screen) |
| Anomaly explanation | Anomalies — plain-English reasoning |
| Template recommendation | Letters — suggests template based on employee status |

---

## Related Features

- [06-anomalies.md](06-anomalies.md) — Atlas anomaly detection output
- [03-payroll-run.md](03-payroll-run.md) — Atlas pre-flight checks
- [09-compliance-hub.md](09-compliance-hub.md) — Atlas compliance recommendations
- [10-letters-documents.md](10-letters-documents.md) — Atlas document generation
- [13-support-center.md](13-support-center.md) — Atlas bot deflection
- [25-platform-features.md](25-platform-features.md) — Full Atlas capabilities overview
