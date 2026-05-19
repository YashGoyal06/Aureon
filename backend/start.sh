#!/bin/bash
# Exit on error
set -e

echo "Starting Aureon Backend..."

# Start Gunicorn with Render's PORT env variable (fallback to 8000 for local dev)
exec gunicorn --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120 aureon_backend.wsgi:application
