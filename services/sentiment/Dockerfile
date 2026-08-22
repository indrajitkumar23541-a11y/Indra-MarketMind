FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY shared/ shared/
COPY services/sentiment/ services/sentiment/
ENV PYTHONPATH=/app
CMD ["python", "services/sentiment/main.py"]
