"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Brain,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  ArrowUp,
  Copy,
  Check,
  TrendingUp,
  Shield,
  Compass,
  LineChart,
} from "lucide-react";

export interface ChatMessage {
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

const PROMPT_SUGGESTIONS = [
  {
    icon: TrendingUp,
    title: "NIFTY & BANKNIFTY Trend",
    query: "What is the NIFTY 50 and BANKNIFTY trend today?",
  },
  {
    icon: LineChart,
    title: "Institutional Tear-Sheet",
    query: "Analyze Reliance Industries with live market metrics",
  },
  {
    icon: Shield,
    title: "Fear & Greed Breakdown",
    query: "Explain today's Fear & Greed index and institutional positioning",
  },
  {
    icon: Compass,
    title: "Macro & FII/DII Flows",
    query: "How are crude oil and USD/INR impacting smart money flows?",
  },
];

function FormattedMessage({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-1 text-xs sm:text-sm leading-relaxed text-slate-200">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith("### ")) {
          return (
            <h4
              key={idx}
              className="text-sm sm:text-base font-bold text-cyan-300 font-space mt-2.5 mb-1 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 inline" />
              {trimmed.replace("### ", "")}
            </h4>
          );
        }

        if (trimmed.startsWith("## ")) {
          return (
            <h3
              key={idx}
              className="text-base sm:text-lg font-bold text-white font-space mt-3 mb-1.5"
            >
              {trimmed.replace("## ", "")}
            </h3>
          );
        }

        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const itemText = trimmed.replace(/^[-*]\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <span
                dangerouslySetInnerHTML={{
                  __html: formatInlineMarkdown(itemText),
                }}
              />
            </div>
          );
        }

        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        return (
          <p
            key={idx}
            dangerouslySetInnerHTML={{
              __html: formatInlineMarkdown(line),
            }}
          />
        );
      })}
    </div>
  );
}

function formatInlineMarkdown(text: string): string {
  return text
    .replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="text-white font-semibold">$1</strong>'
    )
    .replace(
      /\*(.*?)\*/g,
      '<em class="text-cyan-200/90 italic">$1</em>'
    )
    .replace(
      /`([^`]+)`/g,
      '<code class="px-1 py-0.5 rounded bg-black/40 text-cyan-300 font-mono text-[11px] border border-white/10">$1</code>'
    );
}

export default function CopilotView() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputQuery, setInputQuery] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
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
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        suggestedFollowUps: data.suggestedFollowUps || [],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: "ai-err-" + Date.now(),
        sender: "ai",
        text: "Apologies, I encountered a temporary latency glitch connecting to live market telemetry. Please try re-sending your question.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
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
    <div className="flex flex-col h-full w-full bg-[#060A14]/95 overflow-hidden">
      
      {/* Sleek & Slim Top Header Bar ("Thoda Patla") */}
      <header className="shrink-0 h-11 sm:h-12 px-3 sm:px-4 border-b border-white/10 bg-[#080E1C]/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Glowing Slim Icon Logo */}
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]">
            <Brain className="w-4 h-4 text-black" />
          </div>

          {/* Title & Subtitle Requested by User */}
          <div className="flex flex-col">
            <div className="font-space font-bold text-xs sm:text-sm text-white tracking-tight flex items-center gap-1.5 leading-none">
              MarketMind Copilot
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            </div>
            <div className="text-[9px] sm:text-[10px] text-cyan-400 font-mono tracking-tight mt-0.5">
              Real-Time Financial Intelligence
            </div>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleClearChat}
            className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
            title="Reset Conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-mono text-[10px]">Reset</span>
          </button>
        </div>
      </header>

      {/* Centered Message Stream (ChatGPT Style) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 sm:px-5 py-4 space-y-4">
        <div className="max-w-3xl mx-auto w-full space-y-4">
          
          {/* Welcome Hero when only initial message */}
          {messages.length === 1 && (
            <div className="text-center py-4 px-2">
              <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-600/20 border border-cyan-500/30 items-center justify-center mb-3 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                <Brain className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
              <h2 className="text-base sm:text-lg font-bold font-space text-white mb-1 tracking-tight">
                How can I help with your market research today?
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 max-w-sm mx-auto mb-4">
                Ask for real-time benchmark trends, stock sentiment breakdowns,
                or quantitative risk signals.
              </p>

              {/* Suggestion Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left max-w-lg mx-auto">
                {PROMPT_SUGGESTIONS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(item.query)}
                      className="group p-2.5 rounded-xl bg-[#0D1424] hover:bg-[#131E35] border border-white/10 hover:border-cyan-500/40 transition-all text-left cursor-pointer flex items-start gap-2.5 shadow-sm hover:shadow-cyan-950/40"
                    >
                      <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {item.query}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((msg) => {
            const isAi = msg.sender === "ai";
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3 ${
                  isAi ? "items-start" : "items-start flex-row-reverse"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 shadow-md ${
                    isAi
                      ? "bg-gradient-to-tr from-cyan-500/30 to-indigo-600/30 text-cyan-300 border border-cyan-500/40"
                      : "bg-indigo-600 text-white font-bold"
                  }`}
                >
                  {isAi ? (
                    <Bot className="w-3.5 h-3.5" />
                  ) : (
                    <User className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Bubble Content */}
                <div
                  className={`relative group max-w-[90%] sm:max-w-[82%] rounded-xl p-3 sm:p-3.5 shadow-md ${
                    isAi
                      ? "bg-[#0C1222]/90 border border-white/10 text-slate-200"
                      : "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-medium"
                  }`}
                >
                  {/* Copy button for AI response */}
                  {isAi && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}

                  {/* Render formatted message */}
                  {isAi ? (
                    <FormattedMessage content={msg.text} />
                  ) : (
                    <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </div>
                  )}

                  {/* Follow-up Suggestion Chips */}
                  {isAi &&
                    msg.suggestedFollowUps &&
                    msg.suggestedFollowUps.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1.5">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                          Suggested Follow-ups
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestedFollowUps.map((chip, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSend(chip)}
                              className="text-[11px] px-2.5 py-1 rounded-full bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 text-cyan-300 font-medium transition-all text-left cursor-pointer hover:scale-[1.02] shadow-sm hover:border-cyan-400"
                            >
                              {chip} →
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Timestamp */}
                  <div className="text-[9px] text-slate-400/70 mt-1.5 text-right font-mono">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-tr from-cyan-500/30 to-indigo-600/30 text-cyan-300 border border-cyan-500/40 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="bg-[#0C1222]/90 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-1.5 shadow-md">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
                <span className="text-[11px] text-slate-400 font-mono ml-1.5">
                  Reasoning live market telemetry...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Slim & Sleek Floating Pill Input Bar with tiny hairline gap */}
      <footer className="shrink-0 px-2.5 sm:px-3 pt-1.5 pb-2.5 sm:pb-3 border-t border-white/10 bg-[#070B14]">
        <div className="max-w-3xl mx-auto w-full">
          {/* Slim Floating Pill Container */}
          <div className="relative flex items-center bg-[#0D1424]/95 border border-white/15 rounded-full px-3.5 py-1 backdrop-blur-xl shadow-lg focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all">
            {/* Input Text Field */}
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask Indra-MarketMind anything..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none py-1 pr-2"
            />

            {/* Circular Send Button with Upward Arrow (ChatGPT style, NO + icon) */}
            <button
              onClick={() => handleSend()}
              disabled={isTyping || !inputQuery.trim()}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center font-bold shadow-[0_0_10px_rgba(0,240,255,0.4)] disabled:opacity-30 disabled:hover:bg-cyan-400 disabled:shadow-none transition-all cursor-pointer shrink-0"
              title="Send message"
              aria-label="Send message"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
