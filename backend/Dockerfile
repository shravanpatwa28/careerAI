FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies for hdbscan & sentence-transformers
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the Flask API port for Hugging Face Spaces (defaults to 7860)
EXPOSE 7860

# Production server: gunicorn with 1 worker to save RAM on free tier
CMD ["gunicorn", \
     "--bind", "0.0.0.0:7860", \
     "--workers", "1", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-", \
     "app:app"]
