"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Brain,
  X,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ArrowUp,
  Copy,
  Check,
  TrendingUp,
  Shield,
  Compass,
  LineChart,
} from "lucide-react";
import { useNav } from "@/lib/NavContext";
import { usePathname } from "next/navigation";

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

/**
 * Format markdown text into clean React elements
 */
function FormattedMessage({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 text-sm leading-relaxed text-slate-200">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith("### ")) {
          return (
            <h4
              key={idx}
              className="text-base font-bold text-cyan-300 font-space mt-3 mb-1.5 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 inline" />
              {trimmed.replace("### ", "")}
            </h4>
          );
        }

        if (trimmed.startsWith("## ")) {
          return (
            <h3
              key={idx}
              className="text-lg font-bold text-white font-space mt-4 mb-2"
            >
              {trimmed.replace("## ", "")}
            </h3>
          );
        }

        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const itemText = trimmed.replace(/^[-*]\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
              <span
                dangerouslySetInnerHTML={{
                  __html: formatInlineMarkdown(itemText),
                }}
              />
            </div>
          );
        }

        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
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
      '<code class="px-1.5 py-0.5 rounded bg-black/40 text-cyan-300 font-mono text-xs border border-white/10">$1</code>'
    );
}

export default function MarketMindCopilot() {
  const pathname = usePathname();
  const { isCopilotOpen, setIsCopilotOpen, closeCopilot } = useNav();
  const isOpen = isCopilotOpen;
  const setIsOpen = setIsCopilotOpen;

  if (pathname === "/copilot") {
    return null;
  }

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputQuery, setInputQuery] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Auto focus input when opened
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, isOpen]);

  // Handle ESC key to close or minimize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (isExpanded) {
          setIsExpanded(false);
        } else {
          closeCopilot();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isExpanded, closeCopilot]);

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
    <>
      {/* Floating Trigger Button for Desktop (Hidden on mobile since Copilot is integrated into MobileBottomNav) */}
      {!isOpen && (
        <div className="hidden lg:block fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 px-5 py-3.5 rounded-full bg-[#0B1220]/90 backdrop-blur-xl text-white font-bold text-xs shadow-[0_0_30px_rgba(0,240,255,0.35)] hover:shadow-[0_0_45px_rgba(0,240,255,0.6)] hover:scale-105 transition-all cursor-pointer border border-cyan-500/40"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                <Brain className="w-4 h-4 text-black" />
              </div>
              <span className="animate-ping absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 rounded-full bg-cyan-400 opacity-80" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-space tracking-wider text-white font-bold text-xs">
                MARKET COPILOT
              </span>
              <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Financial AI
              </span>
            </div>
          </button>
        </div>
      )}

      {/* ChatGPT-Style Full-Screen Interface */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-[#05070D] text-slate-200 overflow-hidden ${
            // Mobile is always 100% full screen
            // Desktop expands to full screen if isExpanded is true, else shows modern docked panel
            isExpanded
              ? "inset-0 h-screen w-full"
              : "inset-0 h-[100dvh] w-full lg:inset-auto lg:bottom-6 lg:right-6 lg:w-[460px] lg:h-[660px] lg:rounded-3xl lg:border lg:border-cyan-500/30 lg:shadow-[0_0_60px_rgba(0,0,0,0.95)]"
          }`}
        >
          {/* Top Header Bar */}
          <header className="shrink-0 h-16 px-4 md:px-6 border-b border-white/10 bg-[#070C18]/90 backdrop-blur-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Back / Close button for mobile and collapse for desktop */}
              <button
                onClick={() => closeCopilot()}
                className="p-2 -ml-1 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                title="Back to MarketMind"
                aria-label="Back"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Glowing Icon Logo */}
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center text-black font-bold shadow-[0_0_20px_rgba(0,240,255,0.45)]">
                <Brain className="w-5 h-5 text-black" />
              </div>

              {/* Title & Subtitle Requested by User */}
              <div className="flex flex-col">
                <div className="font-space font-bold text-sm md:text-base text-white tracking-tight flex items-center gap-2">
                  MarketMind Copilot
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                </div>
                <div className="text-[11px] text-cyan-400 font-mono tracking-wide">
                  Real-Time Financial Intelligence
                </div>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-1.5">
              {/* Reset/Clear Chat */}
              <button
                onClick={handleClearChat}
                className="p-2 text-slate-400 hover:text-cyan-300 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                title="Reset Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Maximize / Minimize toggle (Desktop only) */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden lg:flex p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                title={isExpanded ? "Collapse to side panel" : "Expand to full screen"}
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={() => closeCopilot()}
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Centered Message Flow Area (ChatGPT-Style) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 sm:px-6 py-6 space-y-6">
            <div className="max-w-3xl mx-auto w-full space-y-6">
              {/* Welcome Hero when only initial message */}
              {messages.length === 1 && (
                <div className="text-center py-6 px-4">
                  <div className="inline-flex w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500/20 to-indigo-600/20 border border-cyan-500/30 items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
                    <Brain className="w-8 h-8 text-cyan-400 animate-pulse" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-space text-white mb-2 tracking-tight">
                    How can I help with your market research today?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6">
                    Ask for real-time benchmark trends, stock sentiment breakdowns,
                    or quantitative risk signals.
                  </p>

                  {/* Suggestion prompt cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left max-w-xl mx-auto">
                    {PROMPT_SUGGESTIONS.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSend(item.query)}
                          className="group p-3 rounded-2xl bg-[#0D1424] hover:bg-[#131E35] border border-white/10 hover:border-cyan-500/40 transition-all text-left cursor-pointer flex items-start gap-3 shadow-md hover:shadow-cyan-950/50"
                        >
                          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {item.query}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Message List */}
              {messages.map((msg) => {
                const isAi = msg.sender === "ai";
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 sm:gap-4 ${
                      isAi ? "items-start" : "items-start flex-row-reverse"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                        isAi
                          ? "bg-gradient-to-tr from-cyan-500/30 to-indigo-600/30 text-cyan-300 border border-cyan-500/40"
                          : "bg-indigo-600 text-white font-bold"
                      }`}
                    >
                      {isAi ? (
                        <Bot className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>

                    {/* Bubble Content */}
                    <div
                      className={`relative group max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 shadow-lg ${
                        isAi
                          ? "bg-[#0C1222]/90 border border-white/10 text-slate-200"
                          : "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-medium"
                      }`}
                    >
                      {/* Copy button for AI response */}
                      {isAi && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      {/* Render formatted message */}
                      {isAi ? (
                        <FormattedMessage content={msg.text} />
                      ) : (
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </div>
                      )}

                      {/* Follow-up Suggestion Chips */}
                      {isAi &&
                        msg.suggestedFollowUps &&
                        msg.suggestedFollowUps.length > 0 && (
                          <div className="mt-4 pt-3.5 border-t border-white/10 space-y-2">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-cyan-400" />
                              Suggested Follow-ups
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {msg.suggestedFollowUps.map((chip, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleSend(chip)}
                                  className="text-xs px-3 py-1.5 rounded-full bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 text-cyan-300 font-medium transition-all text-left cursor-pointer hover:scale-[1.02] shadow-sm hover:border-cyan-400"
                                >
                                  {chip} →
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Timestamp */}
                      <div className="text-[10px] text-slate-400/80 mt-2 text-right font-mono">
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/30 to-indigo-600/30 text-cyan-300 border border-cyan-500/40 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="bg-[#0C1222]/90 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-lg">
                    <span
                      className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                    <span className="text-xs text-slate-400 font-mono ml-2">
                      Reasoning live market vectors & order books...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Floating Pill Input Bar (ChatGPT Style, Strictly NO '+' icon) */}
          <footer className="shrink-0 p-3 sm:p-4 bg-gradient-to-t from-[#05070D] via-[#05070D]/95 to-transparent">
            <div className="max-w-3xl mx-auto w-full">
              {/* Clean Floating Pill Container */}
              <div className="relative flex items-center bg-[#0D1424]/95 border border-white/15 rounded-full px-4 py-2 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] focus-within:border-cyan-400 focus-within:shadow-[0_0_25px_rgba(0,240,255,0.25)] transition-all">
                {/* Text Input Field */}
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask Indra-MarketMind anything..."
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isTyping}
                  className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none py-1 pr-3"
                />

                {/* Circular Send Button with Upward Arrow (ChatGPT style) */}
                <button
                  onClick={() => handleSend()}
                  disabled={isTyping || !inputQuery.trim()}
                  className="w-9 h-9 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)] disabled:opacity-30 disabled:hover:bg-cyan-400 disabled:shadow-none transition-all cursor-pointer shrink-0"
                  title="Send message"
                  aria-label="Send message"
                >
                  <ArrowUp className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}
