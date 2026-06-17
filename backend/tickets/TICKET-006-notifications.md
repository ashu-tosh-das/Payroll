# TICKET-006 — Notifications System

**Type:** Feature  
**Priority:** Medium  
**Status:** Done  
**Sprint:** 3

## Summary
Build an in-app notification system with per-user scoping, read/unread state tracking, and bulk mark-all-read.

## Background
Payroll and compliance actions (payslip ready, leave approved, TDS overdue) must surface to the relevant users. Notifications are scoped to the recipient — employees only see their own.

## Requirements
- `Notification` model: recipient (FK to User), type (alert/info/check), title, body, is_read, read_at
- All reads are scoped to `request.user` (cannot see others' notifications)
- `mark_read` sets `is_read=True` and stamps `read_at`
- `mark_all_read` bulk-updates all unread for the user
- `unread_count` returns a fast aggregate
- Notifications created programmatically by other app signals (payroll approved, leave approved, etc.)

## API Endpoints
```
GET    /api/v1/notifications/
GET    /api/v1/notifications/{id}/
POST   /api/v1/notifications/{id}/mark_read/
POST   /api/v1/notifications/mark_all_read/
GET    /api/v1/notifications/unread_count/
```

## Acceptance Criteria
- [ ] `GET /notifications/` returns only current user's notifications
- [ ] `mark_all_read` updates all unread for the authenticated user only
- [ ] `unread_count` returns `{"unread_count": N}`
- [ ] `read_at` is set to current timestamp on mark_read
- [ ] Notifications are ordered by `-created_at` (newest first)

## Testing Criteria
```
GET  /api/v1/notifications/              → only current user's notifications
POST /api/v1/notifications/{id}/mark_read/ → is_read=True, read_at set
POST /api/v1/notifications/mark_all_read/  → all unread flipped
GET  /api/v1/notifications/unread_count/   → {"unread_count": N}
```
