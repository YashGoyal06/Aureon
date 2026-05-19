#!/bin/bash
# Exit on error except for migrations
set -e

echo "Starting backend setup..."

# Run database migrations
if [ -n "$DATABASE_URL" ]; then
    echo "DATABASE_URL is set, running migrations..."
    python manage.py migrate --noinput || echo "Migration command failed, starting server anyway..."
else
    echo "DATABASE_URL is not set, skipping migrations..."
fi

# Start Gunicorn
echo "Starting Gunicorn..."
exec gunicorn --bind 0.0.0.0:7860 --workers 4 --timeout 120 aureon_backend.wsgi:application
