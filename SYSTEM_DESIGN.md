<div align="center">

<img src="assets/banner.svg" width="100%" alt="Indra-MarketMind"/>

# 🏛️ SYSTEM DESIGN DOCUMENT
### *The World's Most Advanced AI-Powered Market Sentiment Intelligence Platform*

[![Architecture](https://img.shields.io/badge/Architecture-Event--Driven_CQRS-6C63FF?style=for-the-badge)](.)
[![Pattern](https://img.shields.io/badge/Pattern-Microservices_+_Event_Sourcing-FF6B35?style=for-the-badge)](.)
[![Scale](https://img.shields.io/badge/Scale-10M+_req/day-00D4AA?style=for-the-badge)](.)
[![Availability](https://img.shields.io/badge/Availability-99.99%25_SLA-22C55E?style=for-the-badge)](.)
[![Latency](https://img.shields.io/badge/Latency-P99_<_200ms-FF4757?style=for-the-badge)](.)

</div>

---

## 📑 System Design — Table of Contents

| # | Section |
|:-:|:--|
| 01 | [🌐 1. High-Level Architecture Overview](#-1-high-level-architecture-overview) |
| 02 | [📊 2. Data Flow — End to End](#-2-data-flow--end-to-end) |
| 03 | [🗄️ 3. Database Design — Polyglot Persistence](#-3-database-design--polyglot-persistence) |
| 04 | [🧠 4. AI/ML Pipeline — Feature Store + Vector DB](#-4-aiml-pipeline--feature-store--vector-db) |
| 05 | [⚡ 5. Real-Time Layer — Apache Kafka + WebSocket](#-5-real-time-layer--apache-kafka--websocket) |
| 06 | [🔀 6. CQRS + Event Sourcing Pattern](#-6-cqrs--event-sourcing-pattern) |
| 07 | [🛡️ 7. Caching Architecture — 4-Layer Strategy](#-7-caching-architecture--4-layer-strategy) |
| 08 | [🌍 8. Global CDN + Edge Architecture](#-8-global-cdn--edge-architecture) |
| 09 | [🔐 9. Security Architecture — Zero Trust](#-9-security-architecture--zero-trust) |
| 10 | [📈 10. Scalability — Auto-Scaling Design](#-10-scalability--auto-scaling-design) |
| 11 | [🔭 11. Observability — Full-Stack Monitoring](#-11-observability--full-stack-monitoring) |
| 12 | [🛠️ 12. CI/CD Pipeline — GitOps](#-12-cicd-pipeline--gitops) |
| 13 | [🔄 13. Disaster Recovery — RTO/RPO](#-13-disaster-recovery--rtorpo) |
| 14 | [📐 14. API Design — REST + gRPC + WebSocket](#-14-api-design--rest--grpc--websocket) |
| 15 | [📊 15. Capacity Planning & SLAs](#-15-capacity-planning--slas) |

---

## 🌐 1. High-Level Architecture Overview

> **Design Philosophy:** Inspired by Bloomberg's Ticker Plant, Robinhood's event-driven writes, and Coinbase's polyglot persistence — then extended with an AI-first ML layer that none of them have.

```mermaid
graph TB
    subgraph CLIENTS["👤 CLIENT LAYER"]
        C1["🖥️ Web Dashboard\nStreamlit · React"]
        C2["📱 Mobile PWA\nResponsive Web App"]
        C3["🤖 Telegram Bot\npython-telegram-bot"]
        C4["📡 REST API Clients\nExternal integrations"]
    end

    subgraph EDGE["🌍 EDGE / CDN LAYER"]
        CDN["☁️ CloudFlare CDN\nStatic assets · DDoS protection\nEdge caching · WAF"]
        LB["⚖️ Load Balancer\nNginx · SSL termination\nHealth checks · Rate limiting"]
    end

    subgraph GATEWAY["🔀 API GATEWAY LAYER"]
        GW["🚦 API Gateway\nFastAPI · JWT Auth\nRoute dispatch · CORS\nRequest validation · Logging"]
    end

    subgraph SERVICES["⚙️ MICROSERVICES LAYER (6 Core Services)"]
        direction LR
        MS1["📡 Data Ingestion\nPort 8001\nNewsAPI·Reddit·SEC\nyFinance·Finnhub\nCoinGecko·Google Trends"]
        MS2["🧠 Sentiment Engine\nPort 8002\nFinBERT·RoBERTa\nFinGPT·VADER·TextBlob\nGPU Batch Inference"]
        MS3["📊 Analytics Engine\nPort 8003\nGranger·Pearson\nFear&Greed·Insider\nSector Rotation"]
        MS4["🔮 ML Forecasting\nPort 8004\nLSTM·Prophet\nHybrid Model\nBacktesting"]
        MS5["🚨 Alert Engine\nPort 8005\nTelegram·Email\nWebSocket Push\nAlert Rules"]
        MS6["🖥️ Dashboard\nPort 8501\nStreamlit·Plotly\n10 Pages\nReal-time UI"]
    end

    subgraph ASYNC["📨 ASYNC MESSAGING LAYER"]
        KAFKA["🔴 Apache Kafka\nEvent Backbone\n5 Topics · 3 Partitions each\nRetention: 7 days · Replication: 3"]
        SCHEDULER["⏰ APScheduler\nCron Jobs\n15-min data fetch\nMarket hours aware"]
    end

    subgraph DATA["🗄️ DATA LAYER — Polyglot Persistence"]
        PG[("🐘 PostgreSQL 16\nPrimary + 2 Read Replicas\nSharded by exchange\nACID · Full-text search")]
        TS[("⏱️ TimescaleDB\nTime-series extension\nOHLCV · Sentiment scores\nAuto-compression · Partitions")]
        REDIS[("⚡ Redis Cluster\nL2 Cache · Pub/Sub\nSession store\nLeaderboard")]
        QDRANT[("🔮 Qdrant\nVector Database\nNews embeddings\nSemantic search\nHNSW index")]
        FS[("🧪 Feature Store\nHfeast + Redis\nOnline features\nPoint-in-time correct")]
        S3[("📁 Object Storage\nS3/MinIO\nModel weights · CSV exports\nHistorical archives")]
    end

    subgraph OBS["🔭 OBSERVABILITY LAYER"]
        PROM["📊 Prometheus\nMetrics scraping\n15s intervals"]
        GRAF["📈 Grafana\n12 Dashboards\nAlerts + PagerDuty"]
        JAEGER["🔍 Jaeger\nDistributed tracing\nRequest correlation"]
        ELK["📋 ELK Stack\nElasticsearch·Logstash\nKibana log explorer"]
    end

    CLIENTS --> CDN --> LB --> GW
    GW --> MS1 & MS2 & MS3 & MS4 & MS5 & MS6
    MS1 -->|"publish: raw_data"| KAFKA
    KAFKA -->|"consume"| MS2
    MS2 -->|"publish: sentiment_scored"| KAFKA
    KAFKA -->|"consume"| MS3 & MS4 & MS5
    SCHEDULER --> MS1
    MS1 & MS2 & MS3 & MS4 --> PG & TS
    MS2 --> QDRANT & FS
    MS3 & MS4 --> FS
    MS2 & MS3 & MS4 --> REDIS
    MS4 --> S3
    MS6 --> REDIS & PG & TS
    SERVICES --> OBS

    style CLIENTS fill:#0d1117,stroke:#6C63FF,color:#fff
    style EDGE fill:#1a1050,stroke:#22d3ee,color:#fff
    style GATEWAY fill:#0f2847,stroke:#60a5fa,color:#fff
    style SERVICES fill:#1e1040,stroke:#c084fc,color:#fff
    style ASYNC fill:#2d1b00,stroke:#f97316,color:#fff
    style DATA fill:#0a2e1a,stroke:#34d399,color:#fff
    style OBS fill:#2d0a0a,stroke:#f43f5e,color:#fff
```

<br/>

---

## 📊 2. Data Flow — End to End

### 🔄 Complete Data Pipeline (Happy Path)

```mermaid
flowchart LR
    subgraph SOURCES["📡 9 DATA SOURCES"]
        N1["NewsAPI\n70+ outlets"]
        N2["Reddit\nWSB·r/stocks"]
        N3["StockTwits\nCashtags"]
        N4["yFinance\n50+ exchanges"]
        N5["Finnhub\nReal-time"]
        N6["SEC EDGAR\nForm 4 · 10-K"]
        N7["CoinGecko\nCrypto"]
        N8["Google Trends\npytrends"]
        N9["RSS Feeds\nReuters·ET"]
    end

    subgraph INGEST["📥 INGESTION SERVICE (8001)"]
        FE["Async Fetchers\naiohttp · 9 parallel"]
        CL["Text Cleaner\nHTML·emoji·spam"]
        LD["Lang Detector\nlangdetect · 55 lang"]
        TR["Translator\ndeep-translator"]
        DD["Deduplicator\nTF-IDF cosine sim"]
        NER["NER Extractor\nspaCy · auto-ticker"]
    end

    subgraph KAFKA_IN["📨 Kafka: raw_articles topic"]
        K1[/"Partition 0\nINDIA stocks"/]
        K2[/"Partition 1\nUS stocks"/]
        K3[/"Partition 2\nGlobal·Crypto"/]
    end

    subgraph SENTIMENT["🧠 SENTIMENT SERVICE (8002)"]
        GPU["GPU Batch\nProcessor\n32-article batches"]
        FB["FinBERT\n35% weight"]
        RB["RoBERTa\n30% weight"]
        FG["FinGPT\n20% weight"]
        VD["VADER\n10% weight"]
        TB["TextBlob\n5% weight"]
        ENS["Ensemble\nScorer"]
        EMB["Embedding\nGenerator\n384-dim vectors"]
    end

    subgraph KAFKA_OUT["📨 Kafka: sentiment_scored topic"]
        K4[/"score + confidence\n+ ticker + timestamp"/]
    end

    subgraph DOWNSTREAM["⬇️ DOWNSTREAM CONSUMERS"]
        AN["Analytics\nService (8003)"]
        ML["Forecast\nService (8004)"]
        AL["Alert\nService (8005)"]
        VDB["Qdrant\nVector DB"]
        TS2["TimescaleDB\nTime-series"]
    end

    SOURCES --> FE
    FE --> CL --> LD --> TR --> DD --> NER
    NER --> K1 & K2 & K3
    K1 & K2 & K3 --> GPU
    GPU --> FB & RB & FG & VD & TB
    FB & RB & FG & VD & TB --> ENS
    ENS --> K4
    ENS --> EMB
    EMB --> VDB
    K4 --> AN & ML & AL & TS2

    style SOURCES fill:#0f2847,stroke:#22d3ee,color:#fff
    style INGEST fill:#1e1040,stroke:#c084fc,color:#fff
    style KAFKA_IN fill:#2d1b00,stroke:#f97316,color:#fff
    style SENTIMENT fill:#2d1b69,stroke:#818cf8,color:#fff
    style KAFKA_OUT fill:#2d1b00,stroke:#f97316,color:#fff
    style DOWNSTREAM fill:#0a2e1a,stroke:#34d399,color:#fff
```

<br/>

### ⏱️ Latency Budget per Pipeline Stage

```
╔══════════════════════════════════════════════════════════════════════════╗
║                    END-TO-END LATENCY BUDGET                            ║
╠══════════════════════════════════════════════════════════════════════════╣
║  Stage                         │  Target P50  │  Target P99  │  Budget  ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  API Source fetch (async)      │    800ms     │   2,000ms    │  2,000ms ║
║  Text cleaning & NER           │     50ms     │     200ms    │    200ms ║
║  Kafka publish                 │      5ms     │      20ms    │     20ms ║
║  GPU Batch inference (32 art.) │    200ms     │     500ms    │    500ms ║
║  Ensemble scoring              │     10ms     │      30ms    │     30ms ║
║  Qdrant vector upsert          │     20ms     │      80ms    │     80ms ║
║  TimescaleDB write             │     15ms     │      50ms    │     50ms ║
║  Redis cache update            │      2ms     │       5ms    │      5ms ║
║  Alert trigger (if applicable) │     30ms     │     100ms    │    100ms ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  TOTAL (news → alert)          │  ~1,132ms    │  ~2,985ms    │  ~3s max ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 🗄️ 3. Database Design — Polyglot Persistence

> **Strategy:** Use the **right database for the right job**. No single database handles all use cases optimally.

```mermaid
graph LR
    subgraph WHY["🗄️ WHY POLYGLOT PERSISTENCE?"]
        PG2["🐘 PostgreSQL\n━━━━━━━━━━━\nUse: Relational data\nWho: Users·Stocks·Alerts·Sessions\nWhy: ACID·Foreign keys·Full-text\nScale: 1 Primary + 2 Read Replicas\nSharding: by exchange_code\nIndexes: B-tree · GIN · BRIN"]

        TS2["⏱️ TimescaleDB\n━━━━━━━━━━━━━━\nUse: Time-series data\nWho: OHLCV·Sentiment scores over time\nWhy: 100x faster than Postgres for TS\nScale: Hypertables auto-partition by time\nRetention: 2yr full · 10yr downsampled\nIndex: BRIN on timestamp"]

        REDIS2["⚡ Redis Cluster\n━━━━━━━━━━━━━━\nUse: Cache + Pub/Sub + Leaderboard\nWho: Hot stock data · Sessions · Queues\nWhy: Sub-millisecond latency\nScale: 3-node cluster · AOF persistence\nEviction: allkeys-lru\nTTL: 15min (stock) · 1hr (sentiment)"]

        QDRANT2["🔮 Qdrant\n━━━━━━━━━━━━━━\nUse: Vector similarity search\nWho: News embeddings · Semantic search\nWhy: Find similar news across time\nScale: HNSW index · 384-dim vectors\nFilter: by ticker·date·sentiment\nUse case: Dedup · Semantic alert"]

        FEAST2["🧪 Feature Store (Feast)\n━━━━━━━━━━━━━━━━━━━━━━\nUse: ML feature serving\nWho: LSTM·Prophet training\nWhy: No training-serving skew\nOnline: Redis (real-time serving)\nOffline: Parquet + S3 (batch training)\nPoint-in-time: ✅ Correct lookups"]
    end
```

<br/>

### 📐 Core Database Schema

<details open>
<summary><b>🐘 PostgreSQL — Primary Schema (Key Tables)</b></summary>

```sql
-- ══════════════════════════════════════════════════
--  STOCKS UNIVERSE TABLE
-- ══════════════════════════════════════════════════
CREATE TABLE stocks (
    id              BIGSERIAL PRIMARY KEY,
    ticker          VARCHAR(20)  NOT NULL UNIQUE,    -- e.g. "RELIANCE.NS"
    name            VARCHAR(200) NOT NULL,            -- e.g. "Reliance Industries"
    exchange        VARCHAR(20)  NOT NULL,            -- e.g. "NSE", "NYSE"
    exchange_code   VARCHAR(10)  NOT NULL,            -- Shard key
    sector          VARCHAR(100),                     -- GICS sector
    country         CHAR(2)      NOT NULL,            -- ISO country code
    currency        CHAR(3)      NOT NULL,            -- ISO currency code
    market_cap_usd  BIGINT,
    is_active       BOOLEAN      DEFAULT TRUE,
    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX idx_stocks_exchange ON stocks(exchange_code);
CREATE INDEX idx_stocks_country ON stocks(country);
CREATE INDEX idx_stocks_sector ON stocks(sector);

-- ══════════════════════════════════════════════════
--  NEWS ARTICLES TABLE
-- ══════════════════════════════════════════════════
CREATE TABLE articles (
    id              BIGSERIAL    PRIMARY KEY,
    external_id     VARCHAR(64)  UNIQUE,             -- Source dedup hash
    ticker          VARCHAR(20)  REFERENCES stocks(ticker),
    source          VARCHAR(50)  NOT NULL,           -- "newsapi", "reddit", etc.
    title           TEXT         NOT NULL,
    body            TEXT,
    url             VARCHAR(500),
    language_orig   CHAR(5),                         -- Original language
    language_norm   CHAR(5)      DEFAULT 'en',       -- Normalized to EN
    published_at    TIMESTAMPTZ  NOT NULL,
    fetched_at      TIMESTAMPTZ  DEFAULT NOW(),
    content_hash    CHAR(64)     UNIQUE              -- SHA256 for dedup
);

CREATE INDEX idx_articles_ticker_time ON articles(ticker, published_at DESC);
CREATE INDEX idx_articles_published ON articles(published_at DESC);
CREATE INDEX idx_articles_source ON articles(source);
-- Full-text search index
CREATE INDEX idx_articles_fts ON articles USING GIN(to_tsvector('english', title || ' ' || COALESCE(body,'')));

-- ══════════════════════════════════════════════════
--  SENTIMENT SCORES TABLE
-- ══════════════════════════════════════════════════
CREATE TABLE sentiment_scores (
    id              BIGSERIAL    PRIMARY KEY,
    article_id      BIGINT       REFERENCES articles(id),
    ticker          VARCHAR(20)  REFERENCES stocks(ticker),
    scored_at       TIMESTAMPTZ  DEFAULT NOW(),
    -- Individual model scores
    finbert_score   DECIMAL(5,4),
    finbert_label   VARCHAR(10),
    roberta_score   DECIMAL(5,4),
    roberta_label   VARCHAR(10),
    fingpt_score    DECIMAL(5,4),
    fingpt_label    VARCHAR(10),
    vader_score     DECIMAL(5,4),
    textblob_score  DECIMAL(5,4),
    textblob_subj   DECIMAL(5,4),    -- Subjectivity 0-1
    -- Ensemble output
    ensemble_score  DECIMAL(5,4) NOT NULL,           -- -1.0 to +1.0
    ensemble_label  VARCHAR(15)  NOT NULL,           -- STRONG_BULLISH etc
    confidence      DECIMAL(5,4) NOT NULL,           -- 0.0 to 1.0
    model_agreement BOOLEAN      NOT NULL,           -- All models agree?
    processing_ms   INTEGER                          -- Inference latency
);

CREATE INDEX idx_sentiment_ticker_time ON sentiment_scores(ticker, scored_at DESC);
CREATE INDEX idx_sentiment_ensemble ON sentiment_scores(ensemble_score);

-- ══════════════════════════════════════════════════
--  USER WATCHLIST TABLE
-- ══════════════════════════════════════════════════
CREATE TABLE watchlists (
    id              BIGSERIAL    PRIMARY KEY,
    user_id         BIGINT       NOT NULL,
    ticker          VARCHAR(20)  REFERENCES stocks(ticker),
    added_at        TIMESTAMPTZ  DEFAULT NOW(),
    alert_bullish   DECIMAL(3,2) DEFAULT 0.75,       -- Custom threshold
    alert_bearish   DECIMAL(3,2) DEFAULT -0.60,
    UNIQUE(user_id, ticker)
);

-- ══════════════════════════════════════════════════
--  SIGNALS TABLE (Audit trail via Event Sourcing)
-- ══════════════════════════════════════════════════
CREATE TABLE signal_events (
    id              BIGSERIAL    PRIMARY KEY,
    event_id        UUID         DEFAULT gen_random_uuid() UNIQUE,
    event_type      VARCHAR(50)  NOT NULL,           -- "SIGNAL_GENERATED"
    ticker          VARCHAR(20)  REFERENCES stocks(ticker),
    event_payload   JSONB        NOT NULL,           -- Full event data
    ensemble_score  DECIMAL(5,4),
    signal_label    VARCHAR(20),
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- Event sourcing — never UPDATE or DELETE, only INSERT
-- JSONB index for payload queries
CREATE INDEX idx_signals_payload ON signal_events USING GIN(event_payload);
```

</details>

<details>
<summary><b>⏱️ TimescaleDB — Time-Series Hypertables</b></summary>

```sql
-- ══════════════════════════════════════════════════
--  OHLCV PRICE DATA (Hypertable — auto-partitioned by time)
-- ══════════════════════════════════════════════════
CREATE TABLE ohlcv (
    time        TIMESTAMPTZ NOT NULL,
    ticker      VARCHAR(20) NOT NULL,
    open        DECIMAL(12,4),
    high        DECIMAL(12,4),
    low         DECIMAL(12,4),
    close       DECIMAL(12,4),
    volume      BIGINT,
    adj_close   DECIMAL(12,4),
    currency    CHAR(3)
);

-- Convert to hypertable (partitioned by 1 week chunks)
SELECT create_hypertable('ohlcv', 'time', chunk_time_interval => INTERVAL '1 week');

-- Compression for data older than 30 days (saves ~90% space)
ALTER TABLE ohlcv SET (timescaledb.compress, timescaledb.compress_orderby = 'time DESC');
SELECT add_compression_policy('ohlcv', INTERVAL '30 days');

-- Data retention: keep 2 years full, downsample beyond
SELECT add_retention_policy('ohlcv', INTERVAL '2 years');

-- Continuous aggregate: 1-hour OHLCV rolled up automatically
CREATE MATERIALIZED VIEW ohlcv_hourly
WITH (timescaledb.continuous) AS
SELECT  time_bucket('1 hour', time) AS bucket,
        ticker,
        first(open, time)           AS open,
        max(high)                   AS high,
        min(low)                    AS low,
        last(close, time)           AS close,
        sum(volume)                 AS volume
FROM ohlcv GROUP BY bucket, ticker;

-- ══════════════════════════════════════════════════
--  ROLLING SENTIMENT AGGREGATES (Continuous Aggregate)
-- ══════════════════════════════════════════════════
CREATE MATERIALIZED VIEW sentiment_hourly
WITH (timescaledb.continuous) AS
SELECT  time_bucket('1 hour', scored_at)  AS bucket,
        ticker,
        avg(ensemble_score)               AS avg_score,
        count(*)                          AS article_count,
        stddev(ensemble_score)            AS score_stddev
FROM sentiment_scores GROUP BY bucket, ticker;
```

</details>

<details>
<summary><b>🔮 Qdrant — Vector Schema (News Embeddings)</b></summary>

```python
# Qdrant Collection Configuration
# 384-dim embeddings from sentence-transformers/all-MiniLM-L6-v2

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, HnswConfigDiff, PayloadSchemaType

client = QdrantClient(host="qdrant", port=6333)

# Create collection with HNSW index
client.create_collection(
    collection_name="news_embeddings",
    vectors_config=VectorParams(
        size=384,                    # all-MiniLM-L6-v2 output dim
        distance=Distance.COSINE     # Cosine similarity for text
    ),
    hnsw_config=HnswConfigDiff(
        m=16,                        # Connections per node (higher = more accurate)
        ef_construct=200,            # Build-time accuracy
        full_scan_threshold=10_000   # Use HNSW above this count
    ),
    # Payload indexes for filtered search
    optimizers_config={"default_segment_number": 4}
)

# Index payload fields for fast filtering
client.create_payload_index("news_embeddings", "ticker", PayloadSchemaType.KEYWORD)
client.create_payload_index("news_embeddings", "published_at", PayloadSchemaType.DATETIME)
client.create_payload_index("news_embeddings", "ensemble_score", PayloadSchemaType.FLOAT)
client.create_payload_index("news_embeddings", "source", PayloadSchemaType.KEYWORD)

# Example vector point payload:
# {
#   "id": "uuid4",
#   "vector": [0.023, -0.441, ..., 0.187],   # 384 floats
#   "payload": {
#     "article_id": 12345,
#     "ticker": "RELIANCE.NS",
#     "title": "Reliance beats Q3 earnings",
#     "source": "newsapi",
#     "published_at": "2025-01-15T09:30:00Z",
#     "ensemble_score": 0.87,
#     "ensemble_label": "STRONG_BULLISH"
#   }
# }
```

</details>

---

## 🧠 4. AI/ML Pipeline — Feature Store + Vector DB

```mermaid
flowchart TB
    subgraph OFFLINE["🗃️ OFFLINE PATH (Batch Training — Daily)"]
        direction LR
        RAW["📁 Raw Data\nS3/MinIO\nParquet files"]
        FP["🔧 Feature\nPipeline\nFeast offline store"]
        TRAIN["🏋️ Model Training\nLSTM · Prophet\nHyperparameter\nOptuna HPO"]
        EVAL["✅ Model Evaluation\nBacktest · RMSE\nSharpe ratio"]
        REG["📋 Model Registry\nMLflow · versioning\nA/B test metadata"]
        DEPLOY["🚀 Model Deploy\nBlue/Green\nCanary 5%→100%"]

        RAW --> FP --> TRAIN --> EVAL --> REG --> DEPLOY
    end

    subgraph ONLINE["⚡ ONLINE PATH (Real-time Inference — Sub-200ms)"]
        direction LR
        TRIGGER["📨 Kafka Event\nsentiment_scored"]
        FG2["⚡ Feature Getter\nFeast online store\nRedis · <5ms"]
        FEAT["🎯 Feature Vector\nSentiment rolling avg\nRSI · MACD · Volume\nFear&Greed · VIX"]
        INFER["🔮 Model Inference\nLSTM → 7d forecast\nProphet → trend\nHybrid ensemble"]
        CACHE["⚡ Redis Cache\nForecast stored\nTTL: 15 min"]
        PUSH["📤 Push to\nDashboard +\nAlert Engine"]

        TRIGGER --> FG2 --> FEAT --> INFER --> CACHE --> PUSH
    end

    subgraph FEATURE_STORE["🧪 FEAST FEATURE STORE"]
        ONLINE_STORE["⚡ Online Store\nRedis\nReal-time serving\n<5ms latency"]
        OFFLINE_STORE["📦 Offline Store\nParquet + S3\nTraining datasets\nPoint-in-time correct"]
    end

    subgraph VECTOR["🔮 QDRANT VECTOR DB"]
        EMB_STORE["384-dim\nHNSW index\nSemantic search\nFiltered by ticker"]
        SIM_SEARCH["Similarity Search\n'Find news similar to\nthis bearish signal'\nP99 < 20ms"]
    end

    subgraph MONITORING["📊 ML MONITORING"]
        DRIFT["🌊 Feature Drift\nKolmogorov-Smirnov\nPSI score"]
        PERF["📈 Model Performance\nOnline RMSE\nDirectional accuracy"]
        RETRAIN["🔄 Auto-Retrain\nTrigger if RMSE > 5%\nWeekly scheduled"]
    end

    OFFLINE --> OFFLINE_STORE
    ONLINE --> ONLINE_STORE
    ONLINE --> EMB_STORE
    INFER --> MONITORING
    MONITORING --> RETRAIN --> TRAIN

    style OFFLINE fill:#0f2847,stroke:#60a5fa,color:#fff
    style ONLINE fill:#1e1040,stroke:#c084fc,color:#fff
    style FEATURE_STORE fill:#0a2e1a,stroke:#34d399,color:#fff
    style VECTOR fill:#2d1b69,stroke:#818cf8,color:#fff
    style MONITORING fill:#2d0a0a,stroke:#f43f5e,color:#fff
```

<br/>

### 🎯 Feature Engineering — 47 ML Features

| Category | Features | Count |
|:--|:--|:--:|
| **Sentiment Features** | Rolling 1h/4h/1d/7d avg score · Score momentum · Model agreement flag · Confidence stddev | 8 |
| **Price/Volume Features** | RSI(14) · MACD(12,26,9) · SMA(7,20,50) · Bollinger Band width · Volume surge ratio · ATR | 12 |
| **Market Context Features** | VIX proxy · S&P 500 correlation · Sector relative strength · Put/call ratio proxy | 6 |
| **Social Signal Features** | Reddit mention velocity · StockTwits bull/bear ratio · Google Trends z-score | 5 |
| **Fundamental Features** | P/E ratio · Market cap tier · Revenue growth · Insider buy/sell ratio | 6 |
| **Temporal Features** | Day of week · Hour · Days until earnings · Days from last dividend | 5 |
| **Statistical Features** | Granger p-value(lag1) · Pearson r(30d) · Sentiment autocorrelation · Entropy | 5 |
| **TOTAL** | | **47** |

---

## ⚡ 5. Real-Time Layer — Apache Kafka + WebSocket

### 📨 Kafka Topic Design

```mermaid
graph LR
    subgraph PRODUCERS["📤 KAFKA PRODUCERS"]
        P1["Data Ingestion\nService 8001"]
        P2["Sentiment\nService 8002"]
        P3["Analytics\nService 8003"]
    end

    subgraph TOPICS["📋 KAFKA TOPICS (5 Topics)"]
        T1[/"raw_articles\n━━━━━━━━━━━━\n3 Partitions\nRetention: 7d\nReplication: 3\nKey: ticker"/]
        T2[/"sentiment_scored\n━━━━━━━━━━━━━━━\n6 Partitions\nRetention: 30d\nReplication: 3\nKey: ticker+date"/]
        T3[/"market_signals\n━━━━━━━━━━━━━━\n3 Partitions\nRetention: 90d\nReplication: 3\nKey: signal_id"/]
        T4[/"price_updates\n━━━━━━━━━━━━━\n12 Partitions\nRetention: 24h\nReplication: 3\nKey: ticker"/]
        T5[/"alert_triggers\n━━━━━━━━━━━━━\n3 Partitions\nRetention: 7d\nReplication: 3\nKey: user_id"/]
    end

    subgraph CONSUMERS["📥 KAFKA CONSUMER GROUPS"]
        C1["sentiment-workers\n(group: 4 consumers)\nService 8002"]
        C2["analytics-workers\n(group: 2 consumers)\nService 8003"]
        C3["forecast-workers\n(group: 2 consumers)\nService 8004"]
        C4["alert-workers\n(group: 3 consumers)\nService 8005"]
        C5["ws-broadcast\n(group: N consumers)\nWebSocket fan-out"]
        C6["ts-writer\n(group: 2 consumers)\nTimescaleDB sink"]
    end

    P1 --> T1
    P2 --> T2
    P3 --> T3
    P1 --> T4
    P3 --> T5

    T1 --> C1
    T2 --> C2 & C3 & C6
    T3 --> C4 & C5
    T4 --> C5 & C6
    T5 --> C4
```

<br/>

### 🔌 WebSocket — Fan-Out Architecture

```
USER DEVICE  ←── WebSocket ──→  WS Server Node 1  ─┐
USER DEVICE  ←── WebSocket ──→  WS Server Node 2  ──┤←── Redis Pub/Sub ←── Kafka Consumer
USER DEVICE  ←── WebSocket ──→  WS Server Node 3  ──┤
USER DEVICE  ←── WebSocket ──→  WS Server Node 4  ─┘

Max connections per node:  ~10,000 (configurable)
Total WebSocket capacity:  10,000 × N nodes (horizontally scaled)
Message fanout latency:    < 50ms (Redis Pub/Sub to client)
Protocol:                  WSS (TLS 1.3) + Binary MessagePack frames
Heartbeat interval:        30 seconds (detect stale connections)
Reconnect strategy:        Exponential backoff + jitter (1s → 30s max)
```

---

## 🔀 6. CQRS + Event Sourcing Pattern

> **Why CQRS?** The **Command side** (write: new sentiment score) has different performance requirements from the **Query side** (read: dashboard rendering). CQRS separates them for optimal performance at each.

```mermaid
graph LR
    subgraph COMMAND["✍️ COMMAND SIDE (Write Path)"]
        CMD["Command:\nCreateSentimentScore\n{ticker, scores, timestamp}"]
        VAL["Validation:\nSchema check\nDuplicate check\nBusiness rules"]
        HANDLER["Command Handler:\nPersist to PostgreSQL\nPublish to Kafka"]
        ES["Event Store\n(Kafka + PostgreSQL)\nImmutable audit log\nAll state changes"]
    end

    subgraph QUERY["📖 QUERY SIDE (Read Path)"]
        Q1["Query: GetSentimentForTicker\n{ticker, from, to}"]
        Q2["Query: GetTopBullishStocks\n{exchange, limit}"]
        Q3["Query: GetFearGreedIndex\n{date}"]
        READ_DB["Read Model\n(Read Replicas +\nRedis Cache +\nTimescaleDB views)"]
        PROJECTOR["Event Projector\n(Consumes Kafka events\nBuilds read-optimized views)"]
    end

    CMD --> VAL --> HANDLER --> ES
    ES -->|"async project"| PROJECTOR --> READ_DB
    Q1 & Q2 & Q3 --> READ_DB

    style COMMAND fill:#1e3a5f,stroke:#60a5fa,color:#fff
    style QUERY fill:#0a2e1a,stroke:#34d399,color:#fff
```

<br/>

**📋 Event Sourcing — Immutable Event Log Sample:**
```json
[
  { "event_id": "uuid1", "type": "ARTICLE_FETCHED",    "ticker": "TCS.NS", "source": "newsapi", "timestamp": "2025-08-21T09:00:00Z" },
  { "event_id": "uuid2", "type": "SENTIMENT_SCORED",   "ticker": "TCS.NS", "ensemble": 0.82, "label": "STRONG_BULLISH", "timestamp": "2025-08-21T09:00:01Z" },
  { "event_id": "uuid3", "type": "SIGNAL_GENERATED",   "ticker": "TCS.NS", "signal": "BUY", "confidence": 0.91, "timestamp": "2025-08-21T09:00:02Z" },
  { "event_id": "uuid4", "type": "ALERT_TRIGGERED",    "ticker": "TCS.NS", "user_id": 42, "channel": "telegram", "timestamp": "2025-08-21T09:00:03Z" },
  { "event_id": "uuid5", "type": "FORECAST_UPDATED",   "ticker": "TCS.NS", "7d_forecast": [3450, 3480, 3510], "timestamp": "2025-08-21T09:01:00Z" }
]
```
> Every state change is an **immutable event**. System can be **replayed from zero** to reconstruct any past state. Perfect for auditing, debugging, and regulatory compliance.

---

## 🛡️ 7. Caching Architecture — 4-Layer Strategy

```mermaid
graph TD
    REQ["🌐 Incoming Request"]

    subgraph L1["L1 · Browser Cache (Client-side)"]
        BC["Service Worker Cache\nStatic assets: 7 days\nAPI responses: 60 seconds\nCache-Control headers"]
    end

    subgraph L2["L2 · CDN Edge Cache (CloudFlare)"]
        CF["CloudFlare Workers\nStatic: 24hr\nMarket data API: 60s\nEdge compute: sentiment summaries\nGeographic distribution: 200+ PoPs"]
    end

    subgraph L3["L3 · Application Cache (Redis)"]
        R1["Hot Stock Data\nKey: sentiment:{ticker}\nTTL: 15 minutes\nEviction: allkeys-lru"]
        R2["Watchlist Cache\nKey: watchlist:{user_id}\nTTL: 5 minutes"]
        R3["Fear & Greed Index\nKey: fear_greed:{date}\nTTL: 1 hour"]
        R4["Top Movers\nKey: top:bullish:{exchange}\nTTL: 15 minutes"]
        R5["Session Store\nKey: session:{token}\nTTL: 24 hours"]
    end

    subgraph L4["L4 · Database Query Cache (PostgreSQL)"]
        PGC["pg_stat_statements\nShared buffers: 25% RAM\nEffective cache: 75% RAM\nMaterialized views\nTimescaleDB continuous aggregates"]
    end

    REQ --> L1
    L1 -->|"MISS"| L2
    L2 -->|"MISS"| L3
    L3 -->|"MISS"| L4
    L4 -->|"DB hit"| L3
    L3 -->|"populate"| L2

    style L1 fill:#0f2847,stroke:#22d3ee,color:#fff
    style L2 fill:#1e3a5f,stroke:#60a5fa,color:#fff
    style L3 fill:#2d1b00,stroke:#f97316,color:#fff
    style L4 fill:#0a2e1a,stroke:#34d399,color:#fff
```

<br/>

**📊 Cache Hit Rate Targets:**
| Layer | Target Hit Rate | Fallback |
|:--|:--:|:--|
| L1 Browser | 60% | → L2 CDN |
| L2 CDN Edge | 75% | → L3 Redis |
| L3 Redis | 92% | → L4 PostgreSQL |
| L4 PostgreSQL | 98% | → Disk I/O |
| **Effective DB load reduction** | **~99.5%** | — |

---

## 🌍 8. Global CDN + Edge Architecture

```mermaid
graph TB
    subgraph USERS["👤 Global Users"]
        U1["🇮🇳 India\nMumbai · Delhi"]
        U2["🇺🇸 United States\nNY · SF"]
        U3["🇬🇧 Europe\nLondon · Frankfurt"]
        U4["🌏 Asia Pacific\nTokyo · Singapore"]
    end

    subgraph CDN["☁️ CloudFlare Global Network"]
        PoP1["🇮🇳 Mumbai PoP\nEdge cache\nLatency: <10ms"]
        PoP2["🇺🇸 New York PoP\nEdge cache\nLatency: <10ms"]
        PoP3["🇬🇧 London PoP\nEdge cache\nLatency: <10ms"]
        PoP4["🇯🇵 Tokyo PoP\nEdge cache\nLatency: <10ms"]
    end

    subgraph ORIGIN["🏠 Origin Servers (Primary Region)"]
        APP["Application\nCluster\n(3 replicas)"]
        ML_CLUSTER["GPU ML\nCluster\n(Sentiment inference)"]
        DB_CLUSTER["Database\nCluster\n(Primary + Replicas)"]
    end

    subgraph DR["🛡️ Disaster Recovery Region (Standby)"]
        APP_DR["Standby App\n(Warm standby)"]
        DB_DR["DB Replica\n(Streaming replication\nRPO: < 5 seconds)"]
    end

    U1 --> PoP1
    U2 --> PoP2
    U3 --> PoP3
    U4 --> PoP4

    PoP1 & PoP2 & PoP3 & PoP4 -->|"Cache MISS"| APP
    APP --> ML_CLUSTER & DB_CLUSTER
    APP -->|"async replication"| APP_DR
    DB_CLUSTER -->|"streaming WAL"| DB_DR

    style USERS fill:#0d1117,stroke:#6C63FF,color:#fff
    style CDN fill:#1e3a5f,stroke:#22d3ee,color:#fff
    style ORIGIN fill:#1a1050,stroke:#c084fc,color:#fff
    style DR fill:#2d0a0a,stroke:#f43f5e,color:#fff
```

---

## 🔐 9. Security Architecture — Zero Trust

```mermaid
graph TB
    subgraph PERIMETER["🛡️ PERIMETER SECURITY"]
        WAF["☁️ CloudFlare WAF\nOWASP Top 10 rules\nBot protection\nDDoS mitigation\n10Tbps+ capacity"]
        RATELIMIT["⏱️ Rate Limiting\n/api/*: 100 req/min\n/api/search: 20 req/min\n/api/forecast: 10 req/min\nRedis sliding window"]
    end

    subgraph IDENTITY["🪪 IDENTITY & ACCESS"]
        JWT["🔑 JWT Authentication\nHS256 signed tokens\nAccess token: 15min TTL\nRefresh token: 7d TTL\nRotating secret keys"]
        RBAC["👥 Role-Based Access\nROLE_VIEWER: read-only\nROLE_ANALYST: +export\nROLE_ADMIN: full access"]
    end

    subgraph TRANSPORT["🔒 TRANSPORT SECURITY"]
        TLS["🔒 TLS 1.3 Only\nHTTP/2 + HTTP/3\nPerfect forward secrecy\nHSTS preloading\nOCSP stapling"]
        WSS["🔌 WSS (Secure WS)\nSame TLS 1.3 stack\nOrigin validation\nToken in first message"]
    end

    subgraph DATA_SEC["🗄️ DATA SECURITY"]
        ENCRYPT["🔐 Encryption at Rest\nAES-256 for DB volumes\nS3 SSE-S3 encryption\nRedis AUTH + TLS"]
        SECRETS["🤫 Secret Management\nHashiCorp Vault\nAPI keys in Vault\nAuto-rotation: 90 days\nNo keys in code/env"]
        AUDIT["📋 Audit Logging\nAll API calls logged\nUser actions recorded\nRetention: 2 years\nTamper-proof (Kafka)"]
    end

    WAF --> RATELIMIT --> JWT --> RBAC --> TLS

    style PERIMETER fill:#2d0a0a,stroke:#f43f5e,color:#fff
    style IDENTITY fill:#1e3a5f,stroke:#60a5fa,color:#fff
    style TRANSPORT fill:#0f2847,stroke:#22d3ee,color:#fff
    style DATA_SEC fill:#2d1b00,stroke:#f97316,color:#fff
```

---

## 📈 10. Scalability — Auto-Scaling Design

```mermaid
graph TB
    subgraph HORIZONTAL["↔️ HORIZONTAL SCALING"]
        HPA["Kubernetes HPA\n(Horizontal Pod Autoscaler)\nCPU threshold: 70%\nMemory threshold: 80%\nKafka lag threshold: 1000 msgs"]

        subgraph PODS["Auto-scaled Pods"]
            DS["Data Service\nMin: 2 · Max: 8 pods"]
            SS["Sentiment Service\nMin: 2 · Max: 6 pods\n(GPU-limited)"]
            AS["Analytics Service\nMin: 2 · Max: 6 pods"]
            FS["Forecast Service\nMin: 1 · Max: 4 pods"]
            ALS["Alert Service\nMin: 2 · Max: 10 pods"]
        end
    end

    subgraph DB_SCALE["🗄️ DATABASE SCALING"]
        PG_PRIMARY[("PostgreSQL Primary\nWrites only")]
        PG_R1[("Read Replica 1\nDashboard queries")]
        PG_R2[("Read Replica 2\nAPI reads · Exports")]
        TS_NODE[("TimescaleDB\nMulti-node\nDistributed hypertables")]
        REDIS_CLUSTER[("Redis Cluster\n3 masters + 3 replicas\nHash slot distribution")]
    end

    subgraph KAFKA_SCALE["📨 KAFKA SCALING"]
        K_B1["Kafka Broker 1"]
        K_B2["Kafka Broker 2"]
        K_B3["Kafka Broker 3"]
        ZK["ZooKeeper\n3-node quorum\n(or KRaft mode)"]
    end

    HPA --> PODS
    PG_PRIMARY -->|"WAL streaming"| PG_R1 & PG_R2
    K_B1 & K_B2 & K_B3 -.->|"coordination"| ZK

    style HORIZONTAL fill:#1e1040,stroke:#c084fc,color:#fff
    style DB_SCALE fill:#0a2e1a,stroke:#34d399,color:#fff
    style KAFKA_SCALE fill:#2d1b00,stroke:#f97316,color:#fff
```

<br/>

### 📊 Expected Capacity at Scale

| Metric | Phase 1 (MVP) | Phase 2 (Growth) | Phase 3 (Scale) |
|:--|:--:|:--:|:--:|
| Concurrent Users | 100 | 10,000 | 500,000 |
| Articles/day | 50K | 500K | 5M |
| Sentiment scores/day | 50K | 500K | 5M |
| API req/day | 500K | 10M | 500M |
| DB storage/month | 10 GB | 200 GB | 5 TB |
| Kafka throughput | 100 msg/s | 2K msg/s | 50K msg/s |
| Redis memory | 512 MB | 8 GB | 64 GB |

---

## 🔭 11. Observability — Full-Stack Monitoring

```mermaid
graph TB
    subgraph METRICS["📊 METRICS (Prometheus + Grafana)"]
        M1["Application Metrics\nRequest rate · Error rate · Latency P50/P95/P99\nSentiment scores/sec · Kafka consumer lag"]
        M2["Infrastructure Metrics\nCPU · Memory · Disk I/O · Network\nPod restarts · Container health"]
        M3["Business Metrics\nArticles processed/hr · Signal accuracy\nAlert delivery rate · Model drift score"]
    end

    subgraph TRACING["🔍 DISTRIBUTED TRACING (Jaeger)"]
        T1["Request Correlation IDs\nTrace: API Gateway → Data Service → Kafka → Sentiment → Alert\nVisualize full request lifecycle\nIdentify bottlenecks in microseconds"]
    end

    subgraph LOGS["📋 CENTRALIZED LOGS (ELK Stack)"]
        L1["Logstash\nCollect from all services\nParse + enrich JSON logs"]
        L2["Elasticsearch\nFull-text search on logs\nRetention: 90 days"]
        L3["Kibana\nLog explorer dashboards\nAlert on ERROR patterns"]
    end

    subgraph ALERTS["🚨 ALERTING (PagerDuty)"]
        A1["P1 · Service Down\nResponse SLA: 5 min\nPage on-call immediately"]
        A2["P2 · High Latency P99 > 2s\nResponse SLA: 30 min\nSlack + Email"]
        A3["P3 · Model Drift Detected\nResponse SLA: 4 hours\nEmail only"]
        A4["P4 · Kafka Lag > 10K\nResponse SLA: 24 hours\nTicket created"]
    end

    subgraph DASHBOARDS["📈 GRAFANA DASHBOARDS (12 boards)"]
        D1["Service Health Overview"]
        D2["Kafka Throughput & Lag"]
        D3["Sentiment Pipeline Metrics"]
        D4["ML Model Performance"]
        D5["Database Performance"]
        D6["Cache Hit Rates"]
        D7["WebSocket Connections"]
        D8["Alert Delivery Rates"]
        D9["Feature Drift Monitor"]
        D10["Cost & Resource Usage"]
        D11["Error Rate Heatmap"]
        D12["Business KPIs"]
    end

    METRICS --> DASHBOARDS
    TRACING --> DASHBOARDS
    LOGS --> A1 & A2 & A3 & A4
    METRICS --> A1 & A2 & A3 & A4

    style METRICS fill:#0f2847,stroke:#60a5fa,color:#fff
    style TRACING fill:#1e1040,stroke:#c084fc,color:#fff
    style LOGS fill:#2d1b00,stroke:#f97316,color:#fff
    style ALERTS fill:#2d0a0a,stroke:#f43f5e,color:#fff
    style DASHBOARDS fill:#0a2e1a,stroke:#34d399,color:#fff
```

---

## 🛠️ 12. CI/CD Pipeline — GitOps

```mermaid
graph LR
    subgraph DEV["👨‍💻 DEVELOPER"]
        GIT["git push\nfeature/xyz"]
    end

    subgraph PR["🔍 PULL REQUEST CHECKS"]
        LINT["Ruff · Black\nCode style"]
        TEST["pytest\nUnit + Integration\nMin coverage: 80%"]
        SEC["Bandit\nSecurity scan\nSnyk dependencies"]
        BUILD["Docker build\nImage scan\nTrivy vulnerabilities"]
    end

    subgraph STAGING["🧪 STAGING ENVIRONMENT"]
        STAGE_DEPLOY["kubectl apply\nStaging namespace"]
        INT_TEST["Integration tests\nAPI contract tests\nPerf benchmarks"]
        CANARY["Canary 10%\ntraffic → new version\nMonitor 30 min"]
    end

    subgraph PROD["🚀 PRODUCTION"]
        BLUE_GREEN["Blue/Green Deploy\nInstant rollback\nif error rate > 1%"]
        SMOKE["Smoke Tests\nHealth check all\n6 services"]
        MONITOR["Monitor 1hr\nP99 latency\nError rate\nKafka lag"]
    end

    GIT --> LINT --> TEST --> SEC --> BUILD
    BUILD -->|"merge to main"| STAGE_DEPLOY
    STAGE_DEPLOY --> INT_TEST --> CANARY
    CANARY -->|"✅ pass"| BLUE_GREEN
    BLUE_GREEN --> SMOKE --> MONITOR

    MONITOR -->|"❌ regression"| BLUE_GREEN
    BLUE_GREEN -->|"rollback"| BLUE_GREEN

    style DEV fill:#0d1117,stroke:#6C63FF,color:#fff
    style PR fill:#0f2847,stroke:#22d3ee,color:#fff
    style STAGING fill:#2d1b00,stroke:#f97316,color:#fff
    style PROD fill:#0a2e1a,stroke:#34d399,color:#fff
```

---

## 🔄 13. Disaster Recovery — RTO/RPO

| Scenario | RPO (Data Loss Max) | RTO (Recovery Time) | Strategy |
|:--|:--:|:--:|:--|
| Single pod crash | 0 | < 30 sec | Kubernetes restarts automatically |
| Single DB node failure | 0 | < 1 min | PostgreSQL streaming replication failover |
| Full primary region outage | < 5 sec | < 15 min | Warm standby DR region auto-failover |
| Kafka broker failure | 0 | < 2 min | Partition leader re-election (replication factor 3) |
| Redis cache loss | N/A (cache) | < 1 min | Rebuild from TimescaleDB/PostgreSQL |
| Catastrophic data loss | < 24 hr | < 4 hr | S3 daily snapshots restore + event replay |

### 🗂️ Backup Strategy

```
┌──────────────────────────────────────────────────────────┐
│                   BACKUP SCHEDULE                        │
├──────────────┬───────────────┬──────────────────────────┤
│  Frequency   │  Target       │  Retention               │
├──────────────┼───────────────┼──────────────────────────┤
│  Continuous  │  WAL archive  │  7 days (point-in-time)  │
│  Hourly      │  Redis RDB    │  24 hours                │
│  Daily       │  Full PG dump │  30 days                 │
│  Daily       │  TS data      │  90 days                 │
│  Weekly      │  Full S3 snap │  1 year                  │
│  Monthly     │  Cold archive │  7 years (compliance)    │
└──────────────┴───────────────┴──────────────────────────┘
```

---

## 📐 14. API Design — REST + gRPC + WebSocket

### 🌐 REST API Endpoints

```
BASE URL: https://api.indra-marketmind.io/v1

── STOCKS ────────────────────────────────────────────────
GET    /stocks                          List all stocks (paginated)
GET    /stocks/{ticker}                 Stock details + current sentiment
GET    /stocks/{ticker}/sentiment       Sentiment timeline
GET    /stocks/{ticker}/forecast        7d + 30d AI forecast
GET    /stocks/{ticker}/news            Latest news with NLP tags
GET    /stocks/{ticker}/insider         SEC insider trades
GET    /stocks/search?q={query}         Search by name or ticker

── MARKET ────────────────────────────────────────────────
GET    /market/fear-greed               Global Fear & Greed Index
GET    /market/top-bullish              Top bullish stocks (exchange filter)
GET    /market/top-bearish              Top bearish stocks (exchange filter)
GET    /market/sector-heatmap           All 11 GICS sectors sentiment
GET    /market/global-map               Country-level sentiment map data

── ANALYTICS ─────────────────────────────────────────────
GET    /analytics/correlation/{ticker}  Granger + Pearson results
GET    /analytics/rolling/{ticker}      Rolling correlation 7d/30d

── ALERTS ────────────────────────────────────────────────
GET    /alerts                          User's alert history
POST   /alerts/rules                    Create alert rule
PUT    /alerts/rules/{id}               Update rule
DELETE /alerts/rules/{id}               Delete rule

── USER ──────────────────────────────────────────────────
GET    /user/watchlist                  User's watchlist
POST   /user/watchlist/{ticker}         Add to watchlist
DELETE /user/watchlist/{ticker}         Remove from watchlist

── AUTH ──────────────────────────────────────────────────
POST   /auth/login                      Get JWT tokens
POST   /auth/refresh                    Refresh access token
POST   /auth/logout                     Invalidate tokens
```

### 🔌 WebSocket Protocol

```
ENDPOINT: wss://ws.indra-marketmind.io/v1/stream

── SUBSCRIBE MESSAGES ────────────────────────────────────
{ "action": "subscribe",   "tickers": ["RELIANCE.NS", "TCS.NS"] }
{ "action": "unsubscribe", "tickers": ["TCS.NS"] }
{ "action": "subscribe",   "channel": "fear_greed" }
{ "action": "subscribe",   "channel": "top_movers" }

── SERVER PUSH MESSAGES ──────────────────────────────────
{
  "type":       "sentiment_update",
  "ticker":     "RELIANCE.NS",
  "score":       0.82,
  "label":      "STRONG_BULLISH",
  "confidence":  0.91,
  "timestamp":  "2025-08-21T09:15:00Z",
  "trigger":    "Q3 earnings beat news"
}
{
  "type":    "price_update",
  "ticker":  "RELIANCE.NS",
  "price":    2847.50,
  "change":   1.23,
  "volume":   4523100
}
{
  "type":  "alert_triggered",
  "ticker": "TCS.NS",
  "signal": "STRONG_BEARISH",
  "message": "Sentiment dropped to -0.74"
}
```

---

## 📊 15. Capacity Planning & SLAs

### 🎯 Service Level Objectives (SLOs)

```
╔══════════════════════════════════════════════════════════════════════╗
║                    INDRA-MARKETMIND — SLA TARGETS                   ║
╠══════════════════════════════════════════════════════════════════════╣
║  Metric                          │  Target         │  Alert At      ║
╠══════════════════════════════════════════════════════════════════════╣
║  Uptime (Availability)           │  99.9% / month  │  < 99.5%       ║
║  API Latency P50                 │  < 80ms         │  > 150ms       ║
║  API Latency P99                 │  < 200ms        │  > 500ms       ║
║  WebSocket message delivery      │  < 50ms         │  > 200ms       ║
║  News → Sentiment lag            │  < 3 min        │  > 10 min      ║
║  Dashboard refresh rate          │  15 minutes     │  > 30 min      ║
║  Telegram alert delivery         │  < 30 seconds   │  > 2 min       ║
║  ML Forecast P99 latency         │  < 500ms        │  > 2s          ║
║  Search query latency            │  < 100ms        │  > 300ms       ║
║  Error rate (all APIs)           │  < 0.1%         │  > 0.5%        ║
╚══════════════════════════════════════════════════════════════════════╝
```

### 💰 Infrastructure Cost Estimate (Monthly — AWS/GCP)

| Service | Config | Est. Cost/month |
|:--|:--|--:|
| App servers (6 services × 3 replicas) | `c6i.xlarge` × 18 | ~$1,200 |
| GPU instance (Sentiment service) | `g4dn.xlarge` × 2 | ~$450 |
| PostgreSQL RDS | `db.r6g.large` + 2 replicas | ~$350 |
| TimescaleDB | `db.r6g.large` | ~$200 |
| Redis ElastiCache | `cache.r6g.large` cluster | ~$280 |
| Kafka (MSK) | 3 brokers `kafka.m5.large` | ~$400 |
| Qdrant (self-hosted) | `c6i.large` | ~$80 |
| Object Storage (S3) | 500 GB + transfer | ~$30 |
| CloudFlare CDN | Pro plan | ~$25 |
| Monitoring (Grafana Cloud) | Pro plan | ~$50 |
| **TOTAL** | | **~$3,065/month** |

> 💡 **Self-hosted alternative:** Run everything on a single `c6i.4xlarge` server (~$400/mo) for MVP phase using Docker Compose. Scale to K8s when traffic justifies it.

---

<div align="center">

---

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║   This system design borrows the best from:                             ║
║   Bloomberg (Ticker Plant) + Robinhood (Event-driven) +                 ║
║   Coinbase (Polyglot Persistence) + Zerodha (India-first) +             ║
║   then adds an AI-first ML layer that none of them have.               ║
║                                                                          ║
║               — Designed by Indrajit Kumar                              ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

**[← Back to Main Plan](Indra-MarketMind-Plan.md)** | **[View on GitHub](https://github.com/indrajitkumar23541-a11y/Indra-MarketMind)**

</div>
