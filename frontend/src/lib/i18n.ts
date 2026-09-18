export type LanguageCode = "en" | "hi" | "hinglish" | "en-IN" | "es" | "ja" | "de";

export interface Translations {
  [key: string]: {
    [lang in LanguageCode]: string;
  };
}

export const TRANSLATIONS: Translations = {
  // Navigation
  "nav.dashboard": {
    en: "Dashboard",
    hi: "अवलोकन (Dashboard)",
    hinglish: "Dashboard (Market Overview)",
    "en-IN": "Dashboard",
    es: "Panel Principal",
    ja: "ダッシュボード",
    de: "Übersicht",
  },
  "nav.copilot": {
    en: "MarketMind Copilot",
    hi: "मार्केटमाइंड कॉपायलट",
    hinglish: "MarketMind AI Copilot",
    "en-IN": "MarketMind Copilot",
    es: "Copiloto MarketMind",
    ja: "AI コパイロット",
    de: "MarketMind Copilot",
  },
  "nav.globalMap": {
    en: "Global Map",
    hi: "ग्लोबल मार्केट रडार",
    hinglish: "Global Market Map",
    "en-IN": "Global Map",
    es: "Mapa Global",
    ja: "グローバルマップ",
    de: "Weltkarte",
  },
  "nav.liveFeed": {
    en: "Live Feed",
    hi: "लाइव समाचार व फीड",
    hinglish: "Live Khabrein & Feed",
    "en-IN": "Live Feed",
    es: "Noticias en Vivo",
    ja: "ライブフィード",
    de: "Live-Feed",
  },
  "nav.forecast": {
    en: "AI Forecast",
    hi: "एआई पूर्वानुमान (Forecast)",
    hinglish: "AI Price Prediction",
    "en-IN": "AI Forecast",
    es: "Pronóstico IA",
    ja: "AI 価格予測",
    de: "KI-Prognose",
  },
  "nav.deepDive": {
    en: "Deep Dive",
    hi: "गहन विश्लेषण (Deep Dive)",
    hinglish: "Deep Dive Analysis",
    "en-IN": "Deep Dive",
    es: "Análisis Profundo",
    ja: "ディープダイブ",
    de: "Tiefenanalyse",
  },
  "nav.fearGreed": {
    en: "Fear & Greed",
    hi: "डर व लालच सूचकांक",
    hinglish: "Fear & Greed (Darr & Laalach)",
    "en-IN": "Fear & Greed Index",
    es: "Miedo y Codicia",
    ja: "強欲・恐怖指数",
    de: "Angst & Gier",
  },
  "nav.quantLab": {
    en: "AI Quant Lab",
    hi: "एआई क्वांट लैब",
    hinglish: "AI Quant Lab",
    "en-IN": "AI Quant Lab",
    es: "Laboratorio Cuantitativo",
    ja: "AI クオンツラボ",
    de: "KI-Quantenlabor",
  },
  "nav.screener": {
    en: "Stock Screener",
    hi: "स्टॉक स्क्रीनर",
    hinglish: "Stock Screener",
    "en-IN": "Stock Screener",
    es: "Filtro de Acciones",
    ja: "株式スクリーナー",
    de: "Aktien-Screener",
  },
  "nav.sector": {
    en: "Sector Rotation",
    hi: "सेक्टर रोटेशन",
    hinglish: "Sector Rotation",
    "en-IN": "Sector Rotation",
    es: "Rotación Sectorial",
    ja: "セクターローテーション",
    de: "Sektor-Rotation",
  },
  "nav.insider": {
    en: "Insider Signals",
    hi: "इनसाइडर सिग्नल्स",
    hinglish: "Insider Signals",
    "en-IN": "Insider Signals",
    es: "Señales Internas",
    ja: "インサイダーシグナル",
    de: "Insider-Signale",
  },
  "nav.watchlist": {
    en: "Watchlist",
    hi: "वॉचलिस्ट (पसंदीदा)",
    hinglish: "Apni Watchlist",
    "en-IN": "Watchlist",
    es: "Lista de Seguimiento",
    ja: "ウォッチリスト",
    de: "Beobachtungsliste",
  },
  "nav.alerts": {
    en: "Alerts",
    hi: "अलर्ट्स व ट्रिगर्स",
    hinglish: "Alerts & Triggers",
    "en-IN": "Alerts",
    es: "Alertas",
    ja: "アラート",
    de: "Warnungen",
  },
  "nav.settings": {
    en: "Settings",
    hi: "सेटिंग्स (प्राथमिकताएं)",
    hinglish: "App Settings",
    "en-IN": "Settings",
    es: "Configuración",
    ja: "設定",
    de: "Einstellungen",
  },
  "nav.support": {
    en: "Help & Support",
    hi: "सहायता व दस्तावेज़",
    hinglish: "Madad & Support",
    "en-IN": "Help & Support",
    es: "Ayuda y Soporte",
    ja: "ヘルプ＆サポート",
    de: "Hilfe & Support",
  },

  // Common Header & Actions
  "header.searchPlaceholder": {
    en: "Search stocks, crypto, or indices...",
    hi: "शेयर (RELIANCE, TCS), क्रिप्टो या इंडेक्स खोजें...",
    hinglish: "Stocks (RELIANCE, TCS), Crypto ya Index search karein...",
    "en-IN": "Search stocks (NIFTY, RELIANCE, TCS)...",
    es: "Buscar acciones, cripto o índices...",
    ja: "銘柄、暗号資産、指数を検索...",
    de: "Aktien, Krypto oder Indizes suchen...",
  },
  "header.liveTerminal": {
    en: "Live Terminal",
    hi: "लाइव टर्मिनल सक्रिय",
    hinglish: "Live Terminal Chalu Hai",
    "en-IN": "Live Terminal Active",
    es: "Terminal en Vivo",
    ja: "ライブ端末",
    de: "Live-Terminal",
  },
  "header.signIn": {
    en: "Sign In",
    hi: "साइन इन",
    hinglish: "Sign In Karein",
    "en-IN": "Sign In",
    es: "Iniciar Sesión",
    ja: "ログイン",
    de: "Anmelden",
  },

  // Sentiments
  "sentiment.bullish": {
    en: "Bullish",
    hi: "तेज़ी (Bullish)",
    hinglish: "Tezi (Bullish)",
    "en-IN": "Bullish",
    es: "Alcista",
    ja: "強気",
    de: "Bullisch",
  },
  "sentiment.bearish": {
    en: "Bearish",
    hi: "मंदी (Bearish)",
    hinglish: "Mandi (Bearish)",
    "en-IN": "Bearish",
    es: "Bajista",
    ja: "弱気",
    de: "Bärisch",
  },
  "sentiment.neutral": {
    en: "Neutral",
    hi: "तटस्थ (Neutral)",
    hinglish: "Barabar (Neutral)",
    "en-IN": "Neutral",
    es: "Neutral",
    ja: "中立",
    de: "Neutral",
  },

  // Dashboard
  "dashboard.welcome": {
    en: "Welcome to",
    hi: "में आपका स्वागत है",
    hinglish: "Aapka Swagat Hai",
    "en-IN": "Welcome to",
    es: "Bienvenido a",
    ja: "へようこそ",
    de: "Willkommen bei",
  },
  "dashboard.tagline": {
    en: "AI-Powered Financial Intelligence & Real-Time Market Sentiment Terminal",
    hi: "एआई-संचालित वित्तीय बुद्धिमत्ता और वास्तविक समय बाज़ार भावना टर्मिनल",
    hinglish: "AI-Powered Financial Intelligence aur Real-Time Market Sentiment Terminal",
    "en-IN": "AI-Powered Financial Intelligence & Real-Time Market Sentiment Terminal",
    es: "Inteligencia Financiera con IA y Terminal de Sentimiento en Tiempo Real",
    ja: "AI搭載の金融インテリジェンスとリアルタイム市場心理ターミナル",
    de: "KI-gestützte Finanzintelligenz und Echtzeit-Marktstimmungsterminal",
  },
  "dashboard.greetings.morning": {
    en: "Good Morning",
    hi: "शुभ प्रभात",
    hinglish: "Good Morning",
    "en-IN": "Good Morning",
    es: "Buenos Días",
    ja: "おはようございます",
    de: "Guten Morgen",
  },
  "dashboard.greetings.afternoon": {
    en: "Good Afternoon",
    hi: "शुभ दोपहर",
    hinglish: "Good Afternoon",
    "en-IN": "Good Afternoon",
    es: "Buenas Tardes",
    ja: "こんにちは",
    de: "Guten Tag",
  },
  "dashboard.greetings.evening": {
    en: "Good Evening",
    hi: "शुभ संध्या",
    hinglish: "Good Evening",
    "en-IN": "Good Evening",
    es: "Buenas Noches",
    ja: "こんばんは",
    de: "Guten Abend",
  },
  "dashboard.kpi.fearGreed": {
    en: "GLOBAL FEAR & GREED",
    hi: "ग्लोबल डर व लालच इंडेक्स",
    hinglish: "GLOBAL FEAR & GREED (DARR & LAALACH)",
    "en-IN": "GLOBAL FEAR & GREED",
    es: "MIEDO Y CODICIA GLOBAL",
    ja: "世界市場の恐怖と強欲",
    de: "GLOBALE ANGST & GIER",
  },
  "dashboard.kpi.articlesScanned": {
    en: "ARTICLES SCANNED (24H)",
    hi: "स्कैन किए गए समाचार (24 घंटे)",
    hinglish: "KHABREIN SCAN HUI (24 GHANTE)",
    "en-IN": "ARTICLES SCANNED (24H)",
    es: "ARTÍCULOS ESCANEADOS (24H)",
    ja: "スキャン記事数 (24時間)",
    de: "GESCANNTE ARTIKEL (24H)",
  },
  "dashboard.kpi.sentimentDist": {
    en: "Sentiment Distribution",
    hi: "बाजार भावना वितरण",
    hinglish: "Market Sentiment Breakdown",
    "en-IN": "Sentiment Distribution",
    es: "Distribución del Sentimiento",
    ja: "センチメントの分布",
    de: "Stimmungsverteilung",
  },
  "dashboard.kpi.majorIndices": {
    en: "Major Indices",
    hi: "प्रमुख सूचकांक",
    hinglish: "Top Market Indices",
    "en-IN": "Major Indices",
    es: "Índices Principales",
    ja: "主要株価指数",
    de: "Hauptindizes",
  },
  "dashboard.kpi.viewAll": {
    en: "View All",
    hi: "सभी देखें",
    hinglish: "Sab Dekhein",
    "en-IN": "View All",
    es: "Ver Todo",
    ja: "すべて表示",
    de: "Alle ansehen",
  },
  "dashboard.kpi.liveFeed": {
    en: "Live News & Sentiment",
    hi: "लाइव समाचार व भावना",
    hinglish: "Live Khabrein & Sentiment",
    "en-IN": "Live News & Sentiment",
    es: "Noticias en Vivo y Sentimiento",
    ja: "リアルタイム速報とセンチメント",
    de: "Live-Nachrichten & Stimmung",
  },

  // Screener
  "screener.presets.all": {
    en: "All Assets",
    hi: "सभी शेयर",
    hinglish: "Sabhi Stocks",
    "en-IN": "All Assets",
    es: "Todos",
    ja: "全銘柄",
    de: "Alle",
  },
  "screener.presets.momentum": {
    en: "Momentum Breakout",
    hi: "मोमेंटम ब्रेकआउट",
    hinglish: "Tezi Breakout Stocks",
    "en-IN": "Momentum Breakout",
    es: "Ruptura de Impulso",
    ja: "モメンタム急騰",
    de: "Momentum-Ausbruch",
  },
  "screener.presets.value": {
    en: "Value Stocks",
    hi: "वैल्यू शेयर",
    hinglish: "Value Stocks (Saste Share)",
    "en-IN": "Value Stocks",
    es: "Acciones de Valor",
    ja: "バリュー株",
    de: "Value-Aktien",
  },
  "screener.presets.oversold": {
    en: "Oversold (RSI < 35)",
    hi: "अति-बिका हुआ (RSI < 35)",
    hinglish: "Oversold Dip-Buy (RSI < 35)",
    "en-IN": "Oversold (RSI < 35)",
    es: "Sobrevendido (RSI < 35)",
    ja: "売られすぎ (RSI < 35)",
    de: "Überverkauft (RSI < 35)",
  },
  "screener.presets.goldenCross": {
    en: "Golden Cross",
    hi: "गोल्डन क्रॉस",
    hinglish: "Golden Cross (50>200 SMA)",
    "en-IN": "Golden Cross",
    es: "Cruce Dorado",
    ja: "ゴールデンクロス",
    de: "Golden Cross",
  },
  "screener.presets.high52": {
    en: "52W High Breakout",
    hi: "52-सप्ताह नया उच्च स्तर",
    hinglish: "52W High Breakout",
    "en-IN": "52W High Breakout",
    es: "Máximo 52 Semanas",
    ja: "年初来高値ブレイク",
    de: "52-Wochen-Hoch",
  },

  // Watchlist
  "watchlist.indiaPortfolio": {
    en: "INDIA EQUITIES PORTFOLIO",
    hi: "भारतीय इक्विटी पोर्टफोलियो",
    hinglish: "INDIAN STOCKS PORTFOLIO",
    "en-IN": "INDIA EQUITIES PORTFOLIO",
    es: "PORTAFOLIO DE ACCIONES DE INDIA",
    ja: "インド株式ポートフォリオ",
    de: "INDIEN-AKTIENPORTFOLIO",
  },
  "watchlist.usPortfolio": {
    en: "US TECH PORTFOLIO",
    hi: "अमेरिकी टेक पोर्टफोलियो",
    hinglish: "US TECH STOCKS PORTFOLIO",
    "en-IN": "US TECH PORTFOLIO",
    es: "PORTAFOLIO TECNOLÓGICO DE EE. UU.",
    ja: "米国ハイテクポートフォリオ",
    de: "US-TECH-PORTFOLIO",
  },
  "watchlist.invested": {
    en: "Invested",
    hi: "कुल निवेश",
    hinglish: "Kul Invested",
    "en-IN": "Invested",
    es: "Invertido",
    ja: "投資総額",
    de: "Investiert",
  },
  "watchlist.unrealizedPL": {
    en: "Unrealized P&L",
    hi: "अवास्तविक लाभ/हानि",
    hinglish: "Munafa / Nuksan (P&L)",
    "en-IN": "Unrealized P&L",
    es: "Ganancia/Pérdida no realizada",
    ja: "含み損益",
    de: "Nicht realisierter G/V",
  },
  "watchlist.addBtn": {
    en: "Add to Watchlist",
    hi: "वॉचलिस्ट में जोड़ें",
    hinglish: "Watchlist Me Add Karein",
    "en-IN": "Add to Watchlist",
    es: "Añadir a la Lista",
    ja: "ウォッチリストに追加",
    de: "Zur Liste hinzufügen",
  },
  "watchlist.refreshBtn": {
    en: "Refresh Quotes",
    hi: "भाव ताज़ा करें",
    hinglish: "Live Quotes Refresh Karein",
    "en-IN": "Refresh Quotes",
    es: "Actualizar Precios",
    ja: "株価を更新",
    de: "Kurse aktualisieren",
  },

  // Alerts & Voice Speech
  "alerts.voiceTest": {
    en: "Simulate Voice Alert",
    hi: "ध्वनि अलर्ट सुनें",
    hinglish: "Voice Alert Suniye",
    "en-IN": "Simulate Voice Alert",
    es: "Simular Alerta de Voz",
    ja: "音声アラートのテスト",
    de: "Sprachalarm simulieren",
  },

  // Common UI
  "common.save": {
    en: "Save Settings",
    hi: "सेटिंग्स सुरक्षित करें",
    hinglish: "Settings Save Karein",
    "en-IN": "Save Settings",
    es: "Guardar Ajustes",
    ja: "設定を保存",
    de: "Einstellungen speichern",
  },
  "common.saved": {
    en: "Settings Saved Successfully!",
    hi: "सेटिंग्स सफलतापूर्वक सुरक्षित की गईं!",
    hinglish: "Settings Kamyabi Se Save Ho Gayi!",
    "en-IN": "Settings Saved Successfully!",
    es: "¡Ajustes guardados con éxito!",
    ja: "設定が正常に保存されました！",
    de: "Einstellungen erfolgreich gespeichert!",
  },
  "common.refresh": {
    en: "Refresh",
    hi: "ताज़ा करें",
    hinglish: "Refresh Karein",
    "en-IN": "Refresh",
    es: "Actualizar",
    ja: "更新",
    de: "Aktualisieren",
  },
  "dashboard.viewFeed": {
    en: "View Feed",
    hi: "फीड देखें",
    hinglish: "Feed Dekhein",
    "en-IN": "View Feed",
    es: "Ver Noticias",
    ja: "フィードを見る",
    de: "Feed anzeigen",
  },
  "dashboard.viewAllNews": {
    en: "View All News Feeds",
    hi: "सभी समाचार देखें",
    hinglish: "Saari Khabrein Dekhein",
    "en-IN": "View All News Feeds",
    es: "Ver Todas las Noticias",
    ja: "すべてのニュースを見る",
    de: "Alle News anzeigen",
  },
  "dashboard.syncBanner.title": {
    en: "Real-Time Market Synchronized",
    hi: "रीयल-टाइम बाज़ार सिंक्रोनाइज़्ड",
    hinglish: "Real-Time Market Synchronized",
    "en-IN": "Real-Time Market Synchronized",
    es: "Mercado Sincronizado en Tiempo Real",
    ja: "リアルタイム市場同期完了",
    de: "Echtzeit-Markt synchronisiert",
  },
  "dashboard.syncBanner.desc": {
    en: "Market overview, indices and NLP sentiment engines are operating live at 100% capacity with sub-second polling.",
    hi: "बाज़ार अवलोकन, सूचकांक और एनएलपी भावना इंजन सब-सेकंड पोलिंग के साथ 100% क्षमता पर लाइव काम कर रहे हैं।",
    hinglish: "Market overview, indices aur NLP sentiment engines sub-second polling ke sath 100% capacity par live operate kar rahe hain.",
    "en-IN": "Market overview, indices and NLP sentiment engines are operating live at 100% capacity with sub-second polling.",
    es: "Los índices del mercado y motores de sentimiento NLP operan en vivo al 100% de capacidad con sondeo continuo.",
    ja: "市場概況、指数、NLP感情分析エンジンがサブセコンド更新で100%稼働中です。",
    de: "Marktübersicht, Indizes und NLP-Stimmungs-Engines laufen mit 100% Kapazität bei Subsekunden-Polling.",
  },
};

export function translate(key: string, lang: LanguageCode = "en"): string {
  if (TRANSLATIONS[key] && TRANSLATIONS[key][lang]) {
    return TRANSLATIONS[key][lang];
  }
  if (TRANSLATIONS[key] && TRANSLATIONS[key]["en"]) {
    return TRANSLATIONS[key]["en"];
  }
  return key;
}

/**
 * Text-to-Speech Engine that speaks alert in the user's selected language
 */
export function speakText(text: string, lang: LanguageCode = "en"): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langVoiceMap: Record<LanguageCode, string> = {
      en: "en-US",
      "en-IN": "en-IN",
      hi: "hi-IN",
      hinglish: "hi-IN",
      es: "es-ES",
      ja: "ja-JP",
      de: "de-DE",
    };
    utterance.lang = langVoiceMap[lang] || "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Speech synthesis error", err);
  }
}

/**
 * Exact Curated Direct Headlines Mapping for pristine institutional readability
 */
const CURATED_HEADLINES: Record<string, Partial<Record<LanguageCode, string>>> = {
  "RBI maintains repo rate, reinforces focus on resilient GDP growth": {
    hinglish: "RBI ne repo rate sthir rakha, mazboot GDP growth par focus barkarar",
    hi: "आरबीआई ने रेपो दर यथावत रखी, मजबूत जीडीपी वृद्धि पर ध्यान केंद्रित",
    es: "El Banco Central mantiene la tasa repo y refuerza el enfoque en el PIB",
    ja: "インド中銀、政策金利を据え置き、堅調なGDP成長に注力",
    de: "Zentralbank belässt Leitzins unverändert und setzt auf BIP-Wachstum",
  },
  "Asian markets track mixed cues ahead of global central bank commentary": {
    hinglish: "Global central bank commentary se pehle Asian markets me mila-jula rukh",
    hi: "वैश्विक केंद्रीय बैंकों की टिप्पणी से पहले एशियाई बाज़ारों में मिला-जुला रुख",
    es: "Los mercados asiáticos muestran señales mixtas ante comentarios de bancos centrales",
    ja: "主要中央銀行の発言を前にアジア市場はまちまちの展開",
    de: "Asiatische Märkte uneinheitlich vor Erklärungen der globalen Zentralbanken",
  },
  "Nifty tests 23,450 support level amid foreign institutional profit taking": {
    hinglish: "Foreign institutional profit booking ke beech Nifty 23,450 support level test kar raha hai",
    hi: "विदेशी संस्थागत मुनाफावसूली के बीच निफ्टी ने 23,450 समर्थन स्तर का परीक्षण किया",
    es: "Nifty prueba el soporte de 23.450 ante toma de beneficios de instituciones extranjeras",
    ja: "海外機関投資家の利益確定売りでニフティが23,450のサポートを試す",
    de: "Nifty testet Unterstützung bei 23.450 angesichts ausländischer Gewinnmitnahmen",
  },
};

/**
 * Localize financial news headlines on the fly based on selected language
 */
export function localizeNewsHeadline(headline: string, lang: LanguageCode): string {
  if (!headline || lang === "en" || lang === "en-IN") return headline;

  const trimmed = headline.trim();
  if (CURATED_HEADLINES[trimmed] && CURATED_HEADLINES[trimmed][lang]) {
    return CURATED_HEADLINES[trimmed][lang]!;
  }

  // Fallback pattern translation pipeline
  if (lang === "hinglish") {
    return headline
      .replace(/tests\s+([0-9,]+)\s+support\s+level/gi, "ne $1 support level test kiya")
      .replace(/amid\s+foreign\s+institutional\s+profit\s+taking/gi, "foreign institutional profit booking ke beech")
      .replace(/foreign\s+institutional\s+investors/gi, "Foreign Institutional Investors (FIIs)")
      .replace(/maintains\s+repo\s+rate/gi, "repo rate sthir rakha")
      .replace(/reinforces\s+focus\s+on\s+resilient\s+GDP\s+growth/gi, "mazboot GDP growth par focus barkarar")
      .replace(/track(s)?\s+mixed\s+cues/gi, "me mila-jula rukh")
      .replace(/ahead\s+of\s+global\s+central\s+bank\s+commentary/gi, "global central bank ke bayan se pehle")
      .replace(/all-time high|record high/gi, "all-time high naye record par")
      .replace(/hits record high|reaches record high/gi, "naye record level par pahucha")
      .replace(/surge(s|d)?/gi, "me zabardast tezi")
      .replace(/rallies|rally/gi, "me tezi ki daud")
      .replace(/soars|skyrockets/gi, "aasman chhua")
      .replace(/plunge(s|d)?|drop(s|ped)?|fall(s)?|slumps|tumbles/gi, "me girawat")
      .replace(/crashes/gi, "bhaari girawat hui")
      .replace(/quarterly profit|net profit/gi, "net munafa")
      .replace(/gains/gi, "munafa darj kiya")
      .replace(/losses/gi, "nuksan me")
      .replace(/profit taking|profit booking/gi, "profit booking")
      .replace(/support level/gi, "support level")
      .replace(/resistance level/gi, "resistance level")
      .replace(/inflation/gi, "mehengai dar")
      .replace(/announces dividend/gi, "dividend ka ailan kiya")
      .replace(/interest rate(s)?/gi, "interest rates (byaaj dar)")
      .replace(/central bank(s)?/gi, "central banks")
      .replace(/shares|stocks/gi, "shares")
      .replace(/market(s)?/gi, "market");
  }

  if (lang === "hi") {
    return headline
      .replace(/tests\s+([0-9,]+)\s+support\s+level/gi, "ने $1 समर्थन स्तर का परीक्षण किया")
      .replace(/amid\s+foreign\s+institutional\s+profit\s+taking/gi, "विदेशी संस्थागत मुनाफावसूली के बीच")
      .replace(/foreign\s+institutional\s+investors/gi, "विदेशी संस्थागत निवेशक (FII)")
      .replace(/maintains\s+repo\s+rate/gi, "रेपो दर यथावत रखी")
      .replace(/reinforces\s+focus\s+on\s+resilient\s+GDP\s+growth/gi, "मजबूत जीडीपी वृद्धि पर ध्यान केंद्रित")
      .replace(/track(s)?\s+mixed\s+cues/gi, "में मिला-जुला रुख")
      .replace(/ahead\s+of\s+global\s+central\s+bank\s+commentary/gi, "वैश्विक केंद्रीय बैंकों की टिप्पणी से पहले")
      .replace(/all-time high|record high/gi, "सर्वकालिक उच्च स्तर पर")
      .replace(/hits record high|reaches record high/gi, "नए रिकॉर्ड स्तर पर पहुंचा")
      .replace(/surge(s|d)?/gi, "में भारी उछाल")
      .replace(/rallies|rally/gi, "में तेज़ बढ़त")
      .replace(/soars|skyrockets/gi, "आसमान छू गया")
      .replace(/plunge(s|d)?|drop(s|ped)?|fall(s)?|slumps|tumbles/gi, "में गिरावट")
      .replace(/crashes/gi, "भारी गिरावट")
      .replace(/quarterly profit|net profit/gi, "शुद्ध लाभ")
      .replace(/gains/gi, "बढ़त दर्ज")
      .replace(/losses/gi, "नुकसान")
      .replace(/profit taking|profit booking/gi, "मुनाफावसूली")
      .replace(/support level/gi, "समर्थन स्तर")
      .replace(/resistance level/gi, "प्रतिरोध स्तर")
      .replace(/inflation/gi, "महंगाई दर")
      .replace(/announces dividend/gi, "लाभांश की घोषणा")
      .replace(/interest rate(s)?/gi, "ब्याज दरें")
      .replace(/central bank(s)?/gi, "केंद्रीय बैंक")
      .replace(/shares/gi, "शेयर")
      .replace(/market(s)?/gi, "बाज़ार");
  }

  if (lang === "es") {
    return headline
      .replace(/surges|surged/gi, "se dispara")
      .replace(/drops|falls/gi, "cae")
      .replace(/record high/gi, "máximo histórico")
      .replace(/shares/gi, "acciones")
      .replace(/markets/gi, "mercados");
  }

  if (lang === "ja") {
    return headline
      .replace(/surges|surged/gi, "が急騰")
      .replace(/drops|falls/gi, "が下落")
      .replace(/shares/gi, "株式")
      .replace(/markets/gi, "市場");
  }

  if (lang === "de") {
    return headline
      .replace(/surges|surged/gi, "steigt stark")
      .replace(/drops|falls/gi, "fällt")
      .replace(/shares/gi, "Aktien")
      .replace(/markets/gi, "Märkte");
  }

  return headline;
}

/**
 * Localize financial article body snippets or takeaways
 */
export function localizeNewsSnippet(content: string, lang: LanguageCode): string {
  if (!content || lang === "en" || lang === "en-IN") return content;

  if (lang === "hinglish") {
    return content
      .replace(/Traders should evaluate sector momentum and maintain strict stop-losses\./gi, "Traders ko sector momentum evaluate karna chahiye aur strict stop-loss maintain karna chahiye.")
      .replace(/Risk-on sentiment supports broad index inflows\./gi, "Positive market sentiment ke chalte broad index me institutional inflows dekhne ko mil rahe hain.")
      .replace(/Lower uncertainty dampens option demand\./gi, "Volatility kam hone se options ki demand me kami aayi hai.")
      .replace(/Federal Reserve/gi, "US Federal Reserve")
      .replace(/inflation/gi, "mehengai")
      .replace(/interest rates/gi, "byaaj dar")
      .replace(/bullish/gi, "bullish (tezi)")
      .replace(/bearish/gi, "bearish (mandi)");
  }

  if (lang === "hi") {
    return content
      .replace(/Traders should evaluate sector momentum and maintain strict stop-losses\./gi, "व्यापारियों को क्षेत्र गतिशीलता का मूल्यांकन करना चाहिए और सख्त स्टॉप-लॉस बनाए रखना चाहिए।")
      .replace(/Risk-on sentiment supports broad index inflows\./gi, "सकारात्मक भावना के कारण व्यापक सूचकांक में संस्थागत प्रवाह को समर्थन मिल रहा है।")
      .replace(/Lower uncertainty dampens option demand\./gi, "कम अनिश्चितता विकल्पों की मांग को कम करती है।")
      .replace(/Federal Reserve/gi, "अमेरिकी फेडरल रिजर्व")
      .replace(/inflation/gi, "महंगाई")
      .replace(/interest rates/gi, "ब्याज दरें")
      .replace(/bullish/gi, "तेज़ी (Bullish)")
      .replace(/bearish/gi, "मंदी (Bearish)");
  }

  return content;
}
