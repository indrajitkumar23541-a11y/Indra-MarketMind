FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY services/analytics/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY shared/ /app/shared/
COPY services/analytics/ /app/services/analytics/

ENV PYTHONPATH=/app

CMD ["uvicorn", "services.analytics.main:app", "--host", "0.0.0.0", "--port", "8003"]
