# Use python 3.11 slim image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=7860

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create user with UID 1000 to match Hugging Face Spaces expectation
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user
ENV PATH=/home/user/.local/bin:$PATH

# Set working directory inside user's home
WORKDIR $HOME/app

# Copy requirements.txt and install dependencies
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Copy application files
COPY --chown=user . .

# Ensure start.sh has execute permissions
RUN chmod +x start.sh

# Expose port 7860
EXPOSE 7860

# Run start.sh to run migrations and launch gunicorn
CMD ["./start.sh"]
