"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Brain,
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RefreshCw,
  TrendingUp,
  Shield,
  ChevronDown,
  CornerDownLeft,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  suggestedFollowUps?: string[];
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-welcome",
    sender: "ai",
    text: `### 🌌 Welcome to Indra-MarketMind AI Copilot!

I am your institutional financial co-pilot, grounded in real-time market quotes, 5-model NLP sentiment feeds, and quantitative risk models.

**How can I assist your market analysis today?**
- Inquire about live benchmarks (*"What is the NIFTY 50 trend?"*)
- Request an institutional tear-sheet (*"Analyze Reliance"* or *"Analyze NVDA"*)
- Decode institutional sentiment (*"Explain today's Fear & Greed index"*)
- Explore sector momentum (*"Which sectors are leading?"*)`,
    timestamp: "Now",
    suggestedFollowUps: [
      "What is the NIFTY 50 trend today?",
      "Analyze Reliance Industries",
      "Where is smart money flowing?",
      "Fear & Greed index breakdown",
    ],
  },
];

export default function MarketMindCopilot() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputQuery, setInputQuery] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, history: messages.slice(-4) }),
      });

      if (!res.ok) throw new Error("Copilot response error");

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: "ai-" + Date.now(),
        sender: "ai",
        text: data.answer || "I have analyzed your query with live market feeds.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedFollowUps: data.suggestedFollowUps || [],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: "ai-err-" + Date.now(),
        sender: "ai",
        text: "Apologies, I encountered a temporary latency glitch connecting to live market telemetry. Please try re-sending your question.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right, elevated above MobileBottomNav on mobile) */}
      {!isOpen && (
        <div className="fixed bottom-16 right-3 sm:bottom-5 sm:right-5 z-40">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:shadow-[0_0_40px_rgba(0,240,255,0.6)] hover:scale-105 transition-all cursor-pointer border border-white/30"
          >
            <div className="relative">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-black drop-shadow" />
              <span className="animate-ping absolute -top-1 -right-1 flex h-2 sm:h-2.5 w-2 sm:w-2.5 rounded-full bg-cyan-300 opacity-80" />
            </div>
            <span className="font-space tracking-wide text-slate-950 font-extrabold hidden sm:inline">
              MARKET COPILOT
            </span>
            <span className="text-[9px] sm:text-[10px] bg-black/40 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-bold">
              AI
            </span>
          </button>
        </div>
      )}

      {/* Slide-out Glassmorphism Chat Drawer */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col rounded-3xl border border-cyan-500/30 bg-[#060A14]/95 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden ${
            isExpanded
              ? "inset-x-2 bottom-16 top-14 sm:inset-auto sm:bottom-5 sm:right-5 sm:w-[650px] sm:h-[85vh]"
              : "inset-x-2 bottom-16 sm:inset-auto sm:bottom-5 sm:right-5 sm:w-[420px] max-h-[82vh] h-[520px]"
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-cyan-950/40 via-indigo-950/20 to-purple-950/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                <Brain className="w-4 h-4 text-black" />
              </div>
              <div>
                <div className="font-space font-bold text-sm text-white flex items-center gap-1.5">
                  MarketMind Copilot
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[10px] text-cyan-400/80 font-mono">Real-Time Financial Intelligence</div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                title="Close Copilot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg) => {
              const isAi = msg.sender === "ai";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isAi ? "items-start" : "items-start flex-row-reverse"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      isAi
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                    }`}
                  >
                    {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      isAi
                        ? "bg-slate-900/90 text-slate-200 border border-white/10 shadow-md"
                        : "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-medium shadow-md"
                    }`}
                  >
                    <div className="whitespace-pre-line font-sans space-y-1">
                      {msg.text}
                    </div>

                    {/* Follow-up Suggestion Chips */}
                    {isAi && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Suggested Deep Dives:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestedFollowUps.map((chip, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSend(chip)}
                              className="text-[10px] px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 text-cyan-300 font-semibold transition-all text-left cursor-pointer hover:scale-105"
                            >
                              {chip} →
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-[9px] text-slate-500 mt-1.5 text-right font-mono">
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="text-[10px] text-slate-400 font-mono ml-2">Reasoning live market vectors...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-white/10 bg-[#070B14]">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Ask Indra-MarketMind anything (e.g. 'Analyze Reliance', 'NIFTY trend')..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                className="w-full bg-[#0D1322] border border-white/10 rounded-xl pl-3.5 pr-11 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 shadow-inner"
              />
              <button
                onClick={() => handleSend()}
                disabled={isTyping || !inputQuery.trim()}
                className="absolute right-1.5 p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold disabled:opacity-40 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                title="Send query"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-[9px] text-slate-500 text-center mt-1.5 font-mono">
              MarketMind AI grounds answers with live financial feeds. Not registered financial advice.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
