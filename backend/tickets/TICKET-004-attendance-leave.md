# TICKET-004 — Attendance, Leave & WFH Management

**Type:** Feature  
**Priority:** High  
**Status:** Done  
**Sprint:** 2

## Summary
Implement leave management (PL/SL/CL/WFH), attendance record tracking from biometric/manual sources, WFH booking with approval, and the holiday calendar for India.

## Background
Leave balances directly affect LOP (Loss of Pay) deductions in payroll. Accurate attendance data is the source of truth for working days calculation in payslip generation.

## Requirements
- `LeaveType` with configurable annual quota per code (PL=12, SL=12, CL=6, WFH=unlimited)
- `LeaveBalance` per employee per year with `available_days` property
- `LeaveRequest` with approve/reject workflow
- `AttendanceRecord` with punch_in/punch_out, overtime calculation
- `WFHRequest` with manager approval
- `Holiday` calendar (gazetted/regional/restricted) with location filter
- Seed 2025 Indian holiday list as management command

## API Endpoints
```
GET/POST   /api/v1/attendance/leave-types/
GET/POST   /api/v1/attendance/leave-balances/
GET/POST   /api/v1/attendance/leave-requests/
POST       /api/v1/attendance/leave-requests/{id}/approve/
POST       /api/v1/attendance/leave-requests/{id}/reject/
GET/POST   /api/v1/attendance/records/
GET/POST   /api/v1/attendance/wfh-requests/
POST       /api/v1/attendance/wfh-requests/{id}/approve/
GET/POST   /api/v1/attendance/holidays/
```

## Acceptance Criteria
- [ ] `available_days = total_days - used_days` computed correctly
- [ ] Approving a leave request deducts from `LeaveBalance.used_days`
- [ ] WFH requests deduplicate by (employee, date)
- [ ] Holiday calendar returns only holidays for the requested year
- [ ] Attendance records enforce unique (employee, date)
- [ ] Overtime hours = max(0, hours_worked - 9)

## Testing Criteria
```
POST /api/v1/attendance/leave-requests/               → creates pending request
POST /api/v1/attendance/leave-requests/{id}/approve/  → status=approved, balance updated
GET  /api/v1/attendance/leave-balances/?year=2025     → balances for 2025
GET  /api/v1/attendance/holidays/?year=2025           → 2025 holiday list
POST /api/v1/attendance/records/ (duplicate date)     → 400 unique constraint
```
