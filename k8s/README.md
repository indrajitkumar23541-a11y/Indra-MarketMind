# Indra-MarketMind Kubernetes (K8s) Deployment Guide

This directory contains the production-grade Kubernetes orchestration manifests for the entire **Indra-MarketMind** microservices suite.

## Architecture Overview

- **Namespace**: `marketmind`
- **Stateful Infrastructure**:
  - `postgres.yaml`: PostgreSQL 16 with `pgvector` extension and 10Gi PersistentVolumeClaim.
  - `redis.yaml`: Redis 7 in-memory cache and real-time message broker.
- **Config & Secrets**:
  - `configmap.yaml`: Microservice base URLs, environment configuration, and operational parameters.
  - `secrets.yaml`: Database credentials and optional API keys (Groq, OpenAI, Telegram, Alpaca).
- **Microservices Deployment** (`services-deployment.yaml`):
  1. `gateway` (Port 8000) - Central reverse proxy and authentication gateway
  2. `news-collector` (Port 8001) - Multi-source news, RSS, and Reddit ingestor
  3. `sentiment` (Port 8002) - FinGPT & RoBERTa sentiment classification
  4. `analytics` (Port 8003) - Technical indicators and volume anomaly detection
  5. `forecasting` (Port 8004) - Hybrid LSTM + Chronos-Bolt price forecasting
  6. `alerts` (Port 8005) - Real-time Telegram and WebSocket alert dispatcher
  7. `rag-chatbot` (Port 8006) - Grounded LLM RAG engine with pgvector retrieval
  8. `auto-trading` (Port 8007) - Automated paper trading and broker execution
  9. `multimodal` (Port 8008) - Earnings call audio transcription and tone analysis
  10. `crypto-onchain` (Port 8009) - Blockchain whale tracking and network metrics
  11. `alternative-data` (Port 8010) - Google Trends velocity and social FOMO tracker
  12. `dashboard` (Port 8501) - Interactive Streamlit UI
- **Traffic Routing & Ingress** (`ingress.yaml`):
  - Ingress controller routing `/api` to Gateway and `/` to Streamlit Dashboard.
- **Autoscaling** (`hpa.yaml`):
  - HorizontalPodAutoscalers for `sentiment`, `forecasting`, `analytics`, and `gateway`.

---

## Prerequisites

1. Kubernetes cluster (v1.26+) via **Minikube**, **Kind**, **GKE**, or **EKS**.
2. `kubectl` command line tool configured to connect to your cluster.
3. Docker images built and tagged, or pushed to your container registry:
   ```bash
   # Build all services
   docker compose build
   ```

---

## Step-by-Step Deployment

### 1. Create Namespace, Config, and Secrets
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
```

### 2. Deploy Databases (Postgres & Redis)
```bash
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml
```

Wait until PostgreSQL and Redis pods are ready:
```bash
kubectl wait --namespace marketmind --for=condition=ready pod -l app=postgres --timeout=90s
kubectl wait --namespace marketmind --for=condition=ready pod -l app=redis --timeout=60s
```

### 3. Deploy All Microservices
```bash
kubectl apply -f k8s/services-deployment.yaml
```

### 4. Enable Ingress & Autoscaling
```bash
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

---

## Verification & Monitoring

### Check Pod Status
```bash
kubectl get pods -n marketmind -o wide
```

### Check Services & Endpoints
```bash
kubectl get svc -n marketmind
```

### Check Horizontal Pod Autoscaling
```bash
kubectl get hpa -n marketmind
```

### Port Forwarding for Local Testing (Without Ingress)
```bash
# Gateway API (Port 8000)
kubectl port-forward -n marketmind svc/gateway-service 8000:8000

# Streamlit Dashboard (Port 8501)
kubectl port-forward -n marketmind svc/dashboard-service 8501:8501
```

---

## Dry-Run Validation
To test all manifests without deploying:
```bash
kubectl apply --dry-run=client -f k8s/
```
