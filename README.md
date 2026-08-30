<div align="center">
  
  <a href="https://github.com/indrajitkumar23541-a11y/Indra-MarketMind">
    <img src="https://capsule-render.vercel.app/api?type=waving&color=00F0FF&height=300&section=header&text=⚡%20Indra-MarketMind&fontSize=70&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=The%20World's%20Most%20Advanced%20AI%20Financial%20Intelligence%20Platform&descAlignY=55&descAlign=60" alt="Header" />
  </a>
  
  <p align="center">
    <a href="https://github.com/indrajitkumar23541-a11y/Indra-MarketMind/stargazers"><img src="https://img.shields.io/github/stars/indrajitkumar23541-a11y/Indra-MarketMind?color=00F0FF&logo=github&style=for-the-badge" alt="Stars" /></a>
    <a href="https://github.com/indrajitkumar23541-a11y/Indra-MarketMind/network/members"><img src="https://img.shields.io/github/forks/indrajitkumar23541-a11y/Indra-MarketMind?color=6C63FF&logo=github&style=for-the-badge" alt="Forks" /></a>
    <a href="https://github.com/indrajitkumar23541-a11y/Indra-MarketMind/issues"><img src="https://img.shields.io/github/issues/indrajitkumar23541-a11y/Indra-MarketMind?color=FF3366&logo=github&style=for-the-badge" alt="Issues" /></a>
    <a href="https://github.com/indrajitkumar23541-a11y/Indra-MarketMind/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-success?style=for-the-badge&color=00F0FF" alt="License" /></a>
  </p>

  <img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=700&size=24&duration=3000&pause=1000&color=00F0FF&center=true&vCenter=true&width=800&height=50&lines=Decoding+Market+Emotions...;Predicting+Trends+with+Deep+Learning...;Real-Time+Sentiment+Analysis...;Welcome+to+Indra-MarketMind!" alt="Typing Animation" />
  
  <br>
  
  <table>
    <tr>
      <td align="center">Python 3.10+</td>
      <td align="center">FastAPI</td>
      <td align="center">PyTorch & NLP</td>
      <td align="center">Next.js 14 UI</td>
      <td align="center">Docker Ready</td>
    </tr>
  </table>

</div>

---

## 🚀 Welcome to the Future of Trading

**Indra-MarketMind** is a state-of-the-art, enterprise-grade open-source market intelligence platform. Created exclusively by **Indrajit Kumar**, this system doesn't just look at numbers—it reads the market's mind.

By utilizing a highly parallelized Microservices architecture, it ingests millions of data points across global news, social media, and SEC filings. It then processes them through an ensemble of **5 cutting-edge NLP models** to quantify market emotion, feeding this directly into a **Deep Learning Hybrid Forecaster** to predict price action before it happens.

> *Why pay $35,000/yr for traditional terminal software when you can run a superior AI brain locally?*

---

## ✨ Features That Defy Gravity

<div align="center">
  <table>
    <tr>
      <td width="50%" align="center">
        <h3>🧠 5-Model NLP Ensemble</h3>
        <p>Utilizes <i>FinBERT, RoBERTa, FinGPT, VADER, and TextBlob</i> working in harmony to score sentiment with unparalleled accuracy.</p>
      </td>
      <td width="50%" align="center">
        <h3>🌌 Premium UI</h3>
        <p>A custom-built Next.js + React frontend featuring Dark Sci-Fi Neumorphism, glassmorphism layers, and dynamic interactive charts.</p>
      </td>
    </tr>
    <tr>
      <td width="50%" align="center">
        <h3>🔮 Hybrid ML Forecasting</h3>
        <p>Combines Facebook Prophet (for baseline trends) and PyTorch LSTMs (for sentiment-driven volatility spikes).</p>
      </td>
      <td width="50%" align="center">
        <h3>🔭 3D Sector Rotation</h3>
        <p>Visualize institutional money flow across 11 major market sectors in a stunning interactive 3D WebGL space.</p>
      </td>
    </tr>
  </table>
</div>

### 🔥 More Core Modules
- 🌍 **Global Sentiment Map:** Track real-time bullish/bearish heatmaps across 50+ global exchanges.
- 😱 **Fear & Greed Index:** A proprietary 7-factor gauge tracking momentum, volatility, and safe-haven demand.
- 👔 **Insider Signals:** Track SEC Form 4 filings to see what CEOs and CFOs are doing with their capital.
- 🚨 **Automated Alerts:** Instant Telegram and Email alerts when critical market shifts occur.

---

## 🏗️ The Neural Architecture

Indra-MarketMind is engineered for massive scale and extreme low-latency using asynchronous Python microservices.

```mermaid
graph TB
    subgraph GATEWAY["🔀 Gateway / Client"]
        UI["🖥️ Premium Dashboard (Next.js - Port 3000)"]
    end

    subgraph SERVICES["⚙️ Microservices (FastAPI)"]
        direction LR
        S1["📡 Data Ingestion (8001)"]
        S2["🧠 Sentiment Engine (8002)"]
        S3["🔮 ML Forecast (8004)"]
        S4["🚨 Alert System (8005)"]
    end

    subgraph INFRA["🗄️ Core Infrastructure"]
        DB[("🗃️ PostgreSQL 16")]
        CACHE[("⚡ Redis 7 Queue")]
    end

    UI ===>|REST API| SERVICES
    S1 --->|"Raw Market Data"| CACHE
    CACHE --->|"Async Triggers"| S2
    S2 --->|"Processed Scores"| DB
    S2 --->|"Anomaly Signals"| S4
    S3 --->|"LSTM Predictions"| DB
```

---

## ⚡ Quickstart Guide

Getting your personal AI financial terminal online takes less than 3 minutes.

### Prerequisites
- **Docker** & **Docker Compose** installed on your machine.
- Git.

### 1. Clone the Brain
```bash
git clone https://github.com/indrajitkumar23541-a11y/Indra-MarketMind.git
cd Indra-MarketMind
```

### 2. Configure the Synapses
Copy the example environment file and insert your API keys (NewsAPI, Finnhub, etc.).
```bash
cp .env.example .env
```
*(No API keys? No problem. The system will automatically use intelligent mock fallbacks so you can explore the UI immediately!)*

### 3. Ignite the Backend Cluster
```bash
docker-compose up --build
```

### 4. Start the Next.js Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

### 5. Enter the Dashboard
Once the microservices achieve harmony, open your browser and witness the magic:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 💻 Elite Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
</p>

---

## 👑 About the Creator

<div align="center">
  <a href="https://github.com/indrajitkumar23541-a11y">
    <img src="https://github-readme-stats.vercel.app/api?username=indrajitkumar23541-a11y&show_icons=true&theme=radical&hide_border=true&bg_color=0D1117&title_color=00F0FF&text_color=FFFFFF" alt="Indrajit's GitHub Stats" />
  </a>
</div>

This platform is a testament to the intersection of Artificial Intelligence and Finance. Built from the ground up by **Indrajit Kumar**.

---

## 📝 License & Disclaimer

Distributed under the MIT License. See `LICENSE` for more information.

> **Disclaimer:** Indra-MarketMind is an intelligence tool, not a financial advisor. The AI predictions and sentiment scores are for educational and research purposes only. Always do your own due diligence before trading.

<div align="center">
  <br>
  <img src="https://capsule-render.vercel.app/api?type=waving&color=00F0FF&height=100&section=footer" width="100%" />
</div>
