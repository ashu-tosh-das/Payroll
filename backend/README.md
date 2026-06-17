# Source One Payroll Cloud — Django Backend

## Stack
- Django 6.0.3 + Django REST Framework 3.16
- PostgreSQL (psycopg2-binary)
- JWT auth via djangorestframework-simplejwt
- Celery + Redis for background tasks
- OpenAPI/Swagger via drf-spectacular

## Quick Start

### 1. Create virtualenv and install dependencies
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
```

### 2. Configure environment
```bash
copy .env.example .env
# Edit .env — set DB_PASSWORD and a strong SECRET_KEY
```

### 3. Create PostgreSQL database
```sql
CREATE DATABASE payroll_db;
```

### 4. Run migrations
```bash
python manage.py migrate
```

### 5. Create superuser
```bash
python manage.py createsuperuser
```

### 6. Start development server
```bash
python manage.py runserver 8000
```

### 7. API Documentation
- Swagger UI: http://localhost:8000/api/docs/
- OpenAPI schema: http://localhost:8000/api/schema/
- Django Admin: http://localhost:8000/admin/

## Apps & Endpoints

| App | Base URL |
|-----|----------|
| authentication | `/api/v1/auth/` |
| employees | `/api/v1/employees/` |
| payroll | `/api/v1/payroll/` |
| attendance | `/api/v1/attendance/` |
| compliance | `/api/v1/compliance/` |
| notifications | `/api/v1/notifications/` |
| reports | `/api/v1/reports/` |

## Celery (background tasks)
```bash
# In a separate terminal (requires Redis running)
celery -A config worker -l info
celery -A config beat -l info
```

## Settings
- Development: `config.settings.development` (default in manage.py)
- Production: set `DJANGO_SETTINGS_MODULE=config.settings.production`
