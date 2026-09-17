"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Send,
  Zap,
  Clock,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface SmartAlert {
  id: string;
  ticker: string;
  condition: "PRICE_ABOVE" | "PRICE_BELOW" | "RSI_OVERSOLD" | "VOLATILITY_SPIKE" | "WHALE_FLOW";
  targetValue: number;
  currentValue?: number;
  active: boolean;
  createdAt: string;
  notes: string;
  lastTriggered?: string;
}

const DEFAULT_ALERTS: SmartAlert[] = [
  {
    id: "alt-01",
    ticker: "RELIANCE.NS",
    condition: "PRICE_ABOVE",
    targetValue: 3050,
    currentValue: 2985,
    active: true,
    createdAt: "2026-09-14",
    notes: "Upside breakout alert above critical resistance.",
  },
  {
    id: "alt-02",
    ticker: "NVDA",
    condition: "RSI_OVERSOLD",
    targetValue: 35,
    currentValue: 58.2,
    active: true,
    createdAt: "2026-09-15",
    notes: "Algorithmic dip-buying trigger when RSI drops below 35.",
  },
  {
    id: "alt-03",
    ticker: "^NSEI",
    condition: "PRICE_BELOW",
    targetValue: 23450,
    currentValue: 23489,
    active: true,
    createdAt: "2026-09-16",
    notes: "Macro Put OI wall invalidation defense stop.",
  },
  {
    id: "alt-04",
    ticker: "TATAMOTORS.NS",
    condition: "VOLATILITY_SPIKE",
    targetValue: 3.5,
    currentValue: 1.8,
    active: false,
    createdAt: "2026-09-12",
    notes: "Notify if daily range exceeds 3.5% intraday.",
  },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [ticker, setTicker] = useState<string>("");
  const [condition, setCondition] = useState<SmartAlert["condition"]>("PRICE_ABOVE");
  const [targetValue, setTargetValue] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [testNotification, setTestNotification] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("indra_alerts_v1");
      if (saved) {
        setAlerts(JSON.parse(saved));
      } else {
        setAlerts(DEFAULT_ALERTS);
      }
    } catch {
      setAlerts(DEFAULT_ALERTS);
    }
  }, []);

  const saveAlerts = (list: SmartAlert[]) => {
    setAlerts(list);
    try {
      localStorage.setItem("indra_alerts_v1", JSON.stringify(list));
    } catch {}
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker || !targetValue) return;

    const newAlert: SmartAlert = {
      id: "alt-" + Date.now(),
      ticker: ticker.toUpperCase().trim(),
      condition,
      targetValue: parseFloat(targetValue),
      active: true,
      createdAt: new Date().toISOString().split("T")[0],
      notes: notes.trim() || `${condition.replace("_", " ")} trigger configured`,
    };

    saveAlerts([newAlert, ...alerts]);
    setTicker("");
    setTargetValue("");
    setNotes("");
    setShowCreateForm(false);
  };

  const handleToggle = (id: string) => {
    const updated = alerts.map((a) => (a.id === id ? { ...a, active: !a.active } : a));
    saveAlerts(updated);
  };

  const handleDelete = (id: string) => {
    const updated = alerts.filter((a) => a.id !== id);
    saveAlerts(updated);
  };

  const triggerTestAlert = () => {
    setTestNotification("🚨 [TEST ALERT] NIFTY 50 Put-OI Wall Defense Triggered at 23,489 (Simulated Audio Alert)");
    setTimeout(() => {
      setTestNotification(null);
    }, 4500);
  };

  return (
    <div className="space-y-6 pb-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-5 sm:p-7 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-950/25 via-rose-950/15 to-orange-950/20">
        <div className="absolute inset-0 bg-radial-[at_0%_0%] from-red-500/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-red-500/10 text-red-400 rounded-xl border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.25)]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-manrope font-bold text-white tracking-tight flex items-center gap-2">
                Institutional Smart Alerts Console
                <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  MULTI-VECTOR TELEMETRY
                </span>
              </h1>
            </div>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Real-time algorithmic trigger management. Monitors price thresholds, RSI exhaustion, whale transaction flows,
            and intraday volatility surges.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={triggerTestAlert}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-red-500/40 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            Test Sound Alert
          </button>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Alert
          </button>
        </div>
      </div>

      {/* Test Notification Toast */}
      {testNotification && (
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/40 text-white text-xs font-mono font-bold flex items-center gap-3 shadow-2xl animate-bounce">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{testNotification}</span>
        </div>
      )}

      {/* Create Alert Modal / Panel */}
      {showCreateForm && (
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-red-500/30 bg-[#0A0E1A] space-y-4">
          <div className="font-bold text-sm text-white flex items-center justify-between">
            <span>Configure New Real-Time Alert</span>
            <button onClick={() => setShowCreateForm(false)} className="text-xs text-slate-400 hover:text-white">
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateAlert} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Ticker */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Asset Symbol</label>
              <input
                type="text"
                placeholder="e.g. RELIANCE.NS, NVDA, ^NSEI"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                required
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-red-400"
              />
            </div>

            {/* Condition */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400"
              >
                <option value="PRICE_ABOVE">Price Crosses Above</option>
                <option value="PRICE_BELOW">Price Crosses Below</option>
                <option value="RSI_OVERSOLD">RSI(14) Drops Below</option>
                <option value="VOLATILITY_SPIKE">Volatility Surge &gt; %</option>
                <option value="WHALE_FLOW">Whale Deal &gt; Cr/M</option>
              </select>
            </div>

            {/* Target Value */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Target Value</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 3050"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                required
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-400"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Alert Note / Rationale</label>
              <input
                type="text"
                placeholder="e.g. Breakout retest"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-4 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-red-500 hover:bg-red-400 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Save & Arm Alert
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((alt) => {
          let condLabel = "";
          if (alt.condition === "PRICE_ABOVE") condLabel = `Price crosses above ₹/$ ${alt.targetValue}`;
          else if (alt.condition === "PRICE_BELOW") condLabel = `Price drops below ₹/$ ${alt.targetValue}`;
          else if (alt.condition === "RSI_OVERSOLD") condLabel = `RSI drops below ${alt.targetValue}`;
          else if (alt.condition === "VOLATILITY_SPIKE") condLabel = `Intraday volatility > ${alt.targetValue}%`;
          else if (alt.condition === "WHALE_FLOW") condLabel = `Whale transaction > ${alt.targetValue} Cr`;

          return (
            <div
              key={alt.id}
              className={`glass-panel p-5 rounded-2xl border transition-all ${
                alt.active
                  ? "border-red-500/30 bg-gradient-to-r from-red-950/15 to-[#070B14]"
                  : "border-white/5 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-lg text-white">{alt.ticker}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
                      alt.active
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {alt.active ? "ARMED & ACTIVE" : "PAUSED"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(alt.id)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                    title={alt.active ? "Pause Alert" : "Activate Alert"}
                  >
                    {alt.active ? (
                      <ToggleRight className="w-6 h-6 text-red-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-500" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(alt.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete Alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-[#05070D]/60 rounded-xl border border-white/5 text-xs font-mono mb-3">
                <div className="text-slate-300 font-semibold mb-1">Trigger Condition:</div>
                <div className="text-red-300 font-bold">{condLabel}</div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[200px]">{alt.notes}</span>
                <span className="font-mono text-slate-500">Created: {alt.createdAt}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Backend Integration Guide */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#070B14]">
        <div className="flex items-center gap-2 mb-2 font-bold text-sm text-white">
          <Send className="w-4 h-4 text-cyan-400" />
          <span>Telegram & Webhook Notification Dispatcher (`services/alerts`)</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
          Indra-MarketMind includes a dedicated background scheduler (`services/alerts/scheduler.py`) capable of
          dispatching instant Telegram bot messages and SMTP emails directly to your smartphone when price thresholds
          breach in real-time. Configure your Telegram Bot Token in `.env` (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`) to
          enable push dispatching.
        </p>
      </div>
    </div>
  );
}
