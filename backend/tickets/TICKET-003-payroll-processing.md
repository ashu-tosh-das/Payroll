# TICKET-003 — Payroll Processing & Payslip Generation

**Type:** Feature  
**Priority:** Critical  
**Status:** Done  
**Sprint:** 2

## Summary
Implement the monthly payroll processing pipeline: draft → in_review → approved → paid, with per-employee payslip generation, IT declarations for tax savings, and an integrity hash for tamper detection.

## Background
Payroll runs must follow a strict approval chain before disbursement. Payslips must be immutable after approval and carry an integrity hash. IT declarations allow employees to submit tax-saving investments that reduce TDS.

## Requirements
- `PayrollRun` with 4-stage lifecycle, total aggregations, anomaly count
- `Payslip` per employee per run: all earnings + deductions fields, integrity_hash (SHA-256)
- `ITDeclaration`: 80C (PPF, ELSS, NSC, LIC, home loan principal), HRA (monthly rent), 80D (health insurance), 80CCD (NPS), 24 (home loan interest)
- Approval workflow endpoints (submit → approve → disburse)
- Payslip PDF generation via Celery background task (stub)

## API Endpoints
```
GET/POST   /api/v1/payroll/runs/
GET/PUT    /api/v1/payroll/runs/{id}/
POST       /api/v1/payroll/runs/{id}/submit_for_review/
POST       /api/v1/payroll/runs/{id}/approve/
POST       /api/v1/payroll/runs/{id}/disburse/
GET/POST   /api/v1/payroll/payslips/
GET        /api/v1/payroll/payslips/{id}/
GET/POST   /api/v1/payroll/it-declarations/
POST       /api/v1/payroll/it-declarations/{id}/approve/
```

## Acceptance Criteria
- [ ] Only one PayrollRun per (month, year) combination (unique_together constraint)
- [ ] Status transitions are enforced (draft → in_review → approved → paid)
- [ ] `integrity_hash` is populated on payslip save
- [ ] IT declaration approval saves `reviewed_by` and `reviewed_at`
- [ ] Payroll run totals are automatically aggregated from payslips
- [ ] Anomaly count flags employees with LOP > 5 or TDS change > 20%

## Testing Criteria
```
POST /api/v1/payroll/runs/                     → creates draft run
POST /api/v1/payroll/runs/{id}/submit_for_review/ → status=in_review
POST /api/v1/payroll/runs/{id}/approve/          → status=approved
POST /api/v1/payroll/runs/{id}/disburse/         → status=paid
POST /api/v1/payroll/runs/ (same month/year)     → 400 unique constraint
GET  /api/v1/payroll/payslips/?search=emp_id     → filtered payslips
```
