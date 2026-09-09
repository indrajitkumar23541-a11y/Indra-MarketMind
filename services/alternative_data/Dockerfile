FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY services/alternative_data/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY services/alternative_data/ /app/services/alternative_data/

ENV PYTHONPATH=/app

CMD ["uvicorn", "services.alternative_data.main:app", "--host", "0.0.0.0", "--port", "8010"]
