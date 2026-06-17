from .base import *  # noqa

DEBUG = True

# Relax CORS in development
CORS_ALLOW_ALL_ORIGINS = True

# Show SQL queries in development
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "loggers": {
        "django.db.backends": {
            "handlers": ["console"],
            "level": "DEBUG",
        },
    },
}
