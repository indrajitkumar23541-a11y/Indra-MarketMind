FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY services/crypto_onchain/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY services/crypto_onchain/ /app/services/crypto_onchain/

ENV PYTHONPATH=/app

CMD ["uvicorn", "services.crypto_onchain.main:app", "--host", "0.0.0.0", "--port", "8009"]
