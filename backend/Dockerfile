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

# Generate ML models during build (since .pkl and .pt are in .gitignore)
RUN python train_ml.py

# Expose the Flask API port
EXPOSE 5000

# Production server: gunicorn with 2 workers and generous timeout for SHAP
CMD ["gunicorn", \
     "--bind", "0.0.0.0:5000", \
     "--workers", "2", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-", \
     "app:app"]
