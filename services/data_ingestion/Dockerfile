FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY shared/ shared/
COPY services/data_ingestion/ services/data_ingestion/
ENV PYTHONPATH=/app
CMD ["python", "services/data_ingestion/main.py"]
