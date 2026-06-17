# TICKET-002 — Employee Master Data & Org Structure

**Type:** Feature  
**Priority:** Critical  
**Status:** Done  
**Sprint:** 1

## Summary
Build the employee directory with department hierarchy, salary structures, and bank account management including an approval workflow for bank changes.

## Background
All payroll operations depend on accurate employee master data. Bank change requests need a dual-control approval workflow to prevent fraud.

## Requirements
- `Department` model with head employee reference
- `Employee` model: SO-XXXX IDs, PAN, UAN, Aadhaar (last 4), bank details, CTC, L1–L8 levels
- `SalaryStructure` with `compute()` method breaking CTC into components
- `BankChangeRequest` with pending/approved/rejected workflow
- Auto-generate `employee_id` in format `SO-XXXX`
- List, detail, create, update, deactivate endpoints
- Filter by department, status, level, location
- Search by name, email, employee_id

## API Endpoints
```
GET/POST   /api/v1/employees/
GET/PUT    /api/v1/employees/{id}/
GET        /api/v1/employees/active/
GET        /api/v1/employees/{id}/salary_structure/
GET/POST   /api/v1/employees/departments/
GET/POST   /api/v1/employees/bank-change-requests/
POST       /api/v1/employees/bank-change-requests/{id}/approve/
POST       /api/v1/employees/bank-change-requests/{id}/reject/
```

## Acceptance Criteria
- [ ] Employee list returns paginated results (30/page)
- [ ] `monthly_ctc` is computed as `annual_ctc / 12`
- [ ] `SalaryStructure.compute()` returns all earning components
- [ ] Bank change approval updates employee bank fields
- [ ] PAN validation enforces 10-character alphanumeric pattern
- [ ] Inactive employees are excluded from payroll runs

## Testing Criteria
```
GET  /api/v1/employees/?search=sharma    → employees matching "sharma"
GET  /api/v1/employees/active/           → only status=active employees
POST /api/v1/employees/bank-change-requests/{id}/approve/ → status=approved, employee bank updated
GET  /api/v1/employees/{id}/salary_structure/             → compute() breakdown
```
