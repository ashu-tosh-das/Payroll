# TICKET-005 — Statutory Compliance (TDS, PF, ESI, PT, LWF, Form 16)

**Type:** Feature  
**Priority:** High  
**Status:** Done  
**Sprint:** 3

## Summary
Implement statutory compliance tracking for all Indian payroll obligations: TDS 192, PF (EPFO), ESI (ESIC), Professional Tax, LWF, Form 24Q filing, Form 16 generation, and per-employee TDS computation.

## Background
Indian payroll law mandates monthly filing of TDS (7th of next month), PF (15th), ESI (15th), PT (varies by state), LWF (twice yearly). Non-compliance attracts interest and penalties. This module tracks obligations, stores challan references, and manages Form 16 delivery.

## Requirements
- `StatutoryObligation` per obligation type per month: payable amount, due date, challan number
- `days_remaining` property auto-calculates from today
- Status: upcoming → filed (with challan) or overdue (past due date)
- `Form16` per employee per FY: gross salary, TDS deducted, digital signature status, delivery tracking
- `TDSComputation` per employee per month: slab tax + 4% cess + surcharge + monthly TDS
- Mark-filed workflow stores challan and actor
- Overdue detection (due_date < today and status != filed)

## API Endpoints
```
GET/POST   /api/v1/compliance/obligations/
GET/PUT    /api/v1/compliance/obligations/{id}/
POST       /api/v1/compliance/obligations/{id}/mark_filed/
GET/POST   /api/v1/compliance/form16/
POST       /api/v1/compliance/form16/{id}/mark_delivered/
GET/POST   /api/v1/compliance/tds-computations/
```

## Acceptance Criteria
- [ ] `days_remaining` returns negative value for overdue obligations
- [ ] `mark_filed` stores `challan_number`, `filed_by`, `filed_at`
- [ ] Form 16 status transitions: pending → generated → digitally_signed → delivered
- [ ] TDS = slab_tax + cess (4%) + surcharge (applicable above ₹50L)
- [ ] Obligations can be filtered by `obligation_type` and `period_year`
- [ ] Overdue obligations are flagged (days_remaining < 0, status != filed)

## Testing Criteria
```
GET  /api/v1/compliance/obligations/?obligation_type=pf   → PF obligations only
POST /api/v1/compliance/obligations/{id}/mark_filed/      → status=filed, challan saved
GET  /api/v1/compliance/form16/?financial_year=2024-25    → Form 16 for FY
POST /api/v1/compliance/form16/{id}/mark_delivered/       → status=delivered, delivered_at set
GET  /api/v1/compliance/tds-computations/?employee=42     → TDS history for employee
```
