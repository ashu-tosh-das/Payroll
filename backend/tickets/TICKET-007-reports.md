# TICKET-007 — Reports & Analytics

**Type:** Feature  
**Priority:** Medium  
**Status:** Done  
**Sprint:** 4

## Summary
Implement a report catalog with async generation queue (via Celery), file storage, and scheduled delivery by email.

## Background
Finance, HR, and Compliance teams need regular reports (payroll summary, TDS reconciliation, PF challan, headcount analytics). Reports can be large and must be generated asynchronously. Scheduled reports auto-run and email the output.

## Requirements
- `Report` catalog: 5 categories (finance, tax, statutory, analytics, audit), 4 formats (PDF, XLSX, CSV, ZIP)
- `ReportGeneration` async queue: pending → generating → ready / failed, file stored in `/media/reports/`
- `ScheduledReport` per user: daily/weekly/monthly, delivery email, next_run_at computed by Celery beat
- Generation triggered via POST — Celery task picks it up and updates status to ready
- File size stored in bytes; exposed in API for download UX

## API Endpoints
```
GET/POST   /api/v1/reports/catalog/
GET/POST   /api/v1/reports/generations/
GET        /api/v1/reports/generations/{id}/
GET/POST   /api/v1/reports/scheduled/
PUT/DELETE /api/v1/reports/scheduled/{id}/
POST       /api/v1/reports/scheduled/{id}/toggle/
```

## Acceptance Criteria
- [ ] `ReportGeneration` auto-sets `requested_by=request.user` and `status=pending`
- [ ] Only `is_active=True` reports appear in the catalog
- [ ] Scheduled reports are scoped to the owner (`request.user`)
- [ ] `toggle` flips `is_active` and returns updated record
- [ ] `file_size` defaults to 0 until generation completes
- [ ] Generations are ordered by `-requested_at`

## Testing Criteria
```
POST /api/v1/reports/generations/               → creates pending generation, requested_by set
GET  /api/v1/reports/generations/{id}/          → returns status + file_size
POST /api/v1/reports/scheduled/                 → creates scheduled report for current user
POST /api/v1/reports/scheduled/{id}/toggle/     → flips is_active
GET  /api/v1/reports/catalog/?category=tax      → only tax reports
```
