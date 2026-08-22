FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
# Need C++ build tools for prophet
RUN apt-get update && apt-get install -y build-essential
RUN pip install --no-cache-dir -r requirements.txt
COPY shared/ shared/
COPY services/forecasting/ services/forecasting/
ENV PYTHONPATH=/app
CMD ["python", "services/forecasting/main.py"]
