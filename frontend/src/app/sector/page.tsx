"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  RefreshCcw,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Activity,
  Compass,
} from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import QuantumLoader from "@/components/QuantumLoader";

interface SectorNode {
  ticker: string;
  name: string;
  category: "India NSE" | "US S&P";
  price: number;
  changePercent: number;
  weekChange: number;
  monthChange: number;
  relativeStrength: number;
  relativeMomentum: number;
  quadrant: "Leading" | "Weakening" | "Lagging" | "Improving";
  color: string;
  trail: { rs: number; rm: number; date: string }[];
  topConstituents: string[];
}

export default function SectorRotationPage() {
  const [sectors, setSectors] = useState<SectorNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<"ALL" | "India NSE" | "US S&P">("ALL");
  const [selectedSector, setSelectedSector] = useState<SectorNode | null>(null);

  const fetchSectorData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sector");
      if (!res.ok) throw new Error("Failed to fetch sector rotation data");
      const json = await res.json();
      const loaded: SectorNode[] = json.sectors || [];
      setSectors(loaded);
      if (loaded.length > 0 && !selectedSector) {
        setSelectedSector(loaded[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load sector data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectorData();
  }, []);

  const filteredSectors = useMemo(() => {
    if (category === "ALL") return sectors;
    return sectors.filter((s) => s.category === category);
  }, [sectors, category]);

  // Quadrant aggregations
  const leading = useMemo(() => filteredSectors.filter((s) => s.quadrant === "Leading"), [filteredSectors]);
  const weakening = useMemo(() => filteredSectors.filter((s) => s.quadrant === "Weakening"), [filteredSectors]);
  const lagging = useMemo(() => filteredSectors.filter((s) => s.quadrant === "Lagging"), [filteredSectors]);
  const improving = useMemo(() => filteredSectors.filter((s) => s.quadrant === "Improving"), [filteredSectors]);

  // Custom tooltip for RRG
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: SectorNode = payload[0].payload;
      return (
        <div className="glass-panel p-3 rounded-xl border border-cyan-500/40 bg-slate-950/95 shadow-xl text-xs z-50">
          <div className="font-bold text-white flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            {data.name} ({data.ticker})
          </div>
          <div className="text-slate-400">Quadrant: <span className="font-semibold text-white">{data.quadrant}</span></div>
          <div className="text-slate-400">Relative Strength: <span className="font-mono font-bold text-cyan-300">{data.relativeStrength}</span></div>
          <div className="text-slate-400">Relative Momentum: <span className="font-mono font-bold text-emerald-300">{data.relativeMomentum}</span></div>
          <div className="text-slate-400 mt-1">1-Month Return: <span className={`font-mono font-bold ${data.monthChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{data.monthChange >= 0 ? "+" : ""}{data.monthChange}%</span></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-5 sm:p-7 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/25 via-indigo-950/15 to-blue-950/20">
        <div className="absolute inset-0 bg-radial-[at_0%_0%] from-purple-500/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
              <RefreshCcw className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-manrope font-bold text-white tracking-tight flex items-center gap-2">
                Relative Rotation Graph (RRG) & Sector Flow
                <span className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  LIVE 3-MONTH ALPHA
                </span>
              </h1>
            </div>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Institutional RRG algorithm tracking sector rotation across Indian NSE indices and US S&P sectors against
            benchmark equity indices.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 self-end md:self-auto">
          {/* Category tabs */}
          <div className="flex bg-[#0A0E1A] rounded-xl p-1 border border-white/10">
            {(["ALL", "India NSE", "US S&P"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  category === cat
                    ? "bg-purple-500/25 text-purple-300 border border-purple-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={fetchSectorData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-purple-500/40 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Refresh Sectors"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin text-purple-400" : ""}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <QuantumLoader text="Computing 3-month relative strength and momentum vectors for global sectors..." />
        </div>
      ) : error ? (
        <div className="glass-panel p-8 text-center rounded-2xl border border-red-500/30 text-red-400">
          <p className="font-bold">{error}</p>
          <button
            onClick={fetchSectorData}
            className="mt-3 px-4 py-2 bg-red-500/20 text-red-300 rounded-xl text-xs font-bold"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Quadrant Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Leading */}
            <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]"></div>
                  LEADING QUADRANT
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">{leading.length}</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">High Relative Strength + Accelerating Momentum</p>
              <div className="flex flex-wrap gap-1.5">
                {leading.map((s) => (
                  <span
                    key={s.ticker}
                    onClick={() => setSelectedSector(s)}
                    className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold cursor-pointer hover:scale-105 transition-transform"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Weakening */}
            <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-950/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]"></div>
                  WEAKENING QUADRANT
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">{weakening.length}</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">High Relative Strength + Decelerating Momentum</p>
              <div className="flex flex-wrap gap-1.5">
                {weakening.map((s) => (
                  <span
                    key={s.ticker}
                    onClick={() => setSelectedSector(s)}
                    className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold cursor-pointer hover:scale-105 transition-transform"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Lagging */}
            <div className="glass-panel p-4 rounded-2xl border border-rose-500/30 bg-rose-950/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_#EF4444]"></div>
                  LAGGING QUADRANT
                </span>
                <span className="text-xs font-mono font-bold text-rose-400">{lagging.length}</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">Low Relative Strength + Decelerating Momentum</p>
              <div className="flex flex-wrap gap-1.5">
                {lagging.map((s) => (
                  <span
                    key={s.ticker}
                    onClick={() => setSelectedSector(s)}
                    className="text-xs px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono font-bold cursor-pointer hover:scale-105 transition-transform"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Improving */}
            <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30 bg-cyan-950/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F0FF]"></div>
                  IMPROVING QUADRANT
                </span>
                <span className="text-xs font-mono font-bold text-cyan-400">{improving.length}</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">Low Relative Strength + Accelerating Momentum</p>
              <div className="flex flex-wrap gap-1.5">
                {improving.map((s) => (
                  <span
                    key={s.ticker}
                    onClick={() => setSelectedSector(s)}
                    className="text-xs px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono font-bold cursor-pointer hover:scale-105 transition-transform"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RRG Chart and Sector Detail View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* RRG Canvas */}
            <div className="lg:col-span-8 glass-panel p-5 rounded-2xl border border-white/10 relative">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-purple-400" />
                  <h2 className="font-manrope font-bold text-base text-white">Relative Rotation Canvas</h2>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Benchmark: <span className="text-cyan-400 font-bold">NIFTY 50 (^NSEI)</span>
                </div>
              </div>

              <div className="h-80 sm:h-96 md:h-105 w-full relative">
                {/* Quadrant Background Overlay */}
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-15 pointer-events-none rounded-xl overflow-hidden border border-white/10">
                  {/* Top-Left: Improving */}
                  <div className="bg-cyan-500/30 p-2 flex items-start justify-start border-r border-b border-white/10">
                    <span className="text-[11px] font-bold text-cyan-300 tracking-wider">IMPROVING</span>
                  </div>
                  {/* Top-Right: Leading */}
                  <div className="bg-emerald-500/30 p-2 flex items-start justify-end border-b border-white/10">
                    <span className="text-[11px] font-bold text-emerald-300 tracking-wider">LEADING</span>
                  </div>
                  {/* Bottom-Left: Lagging */}
                  <div className="bg-rose-500/30 p-2 flex items-end justify-start border-r border-white/10">
                    <span className="text-[11px] font-bold text-rose-300 tracking-wider">LAGGING</span>
                  </div>
                  {/* Bottom-Right: Weakening */}
                  <div className="bg-amber-500/30 p-2 flex items-end justify-end">
                    <span className="text-[11px] font-bold text-amber-300 tracking-wider">WEAKENING</span>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 25, bottom: 25, left: 15 }}>
                    <XAxis
                      type="number"
                      dataKey="relativeStrength"
                      name="Relative Strength (RS)"
                      domain={[75, 125]}
                      tick={{ fill: "#64748B", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.15)" }}
                    />
                    <YAxis
                      type="number"
                      dataKey="relativeMomentum"
                      name="Relative Momentum (RM)"
                      domain={[75, 125]}
                      tick={{ fill: "#64748B", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.15)" }}
                    />
                    <ZAxis range={[250, 400]} />
                    <ReferenceLine x={100} stroke="#475569" strokeDasharray="3 3" strokeWidth={1.5} />
                    <ReferenceLine y={100} stroke="#475569" strokeDasharray="3 3" strokeWidth={1.5} />
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter
                      data={filteredSectors}
                      onClick={(node: any) => setSelectedSector(node)}
                      className="cursor-pointer"
                    >
                      {filteredSectors.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke={selectedSector?.ticker === entry.ticker ? "#FFFFFF" : "rgba(0,0,0,0.5)"}
                          strokeWidth={selectedSector?.ticker === entry.ticker ? 2.5 : 1}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
                <span>← Lagging (RS &lt; 100)</span>
                <span>Neutral Benchmark Equilibrium (100, 100)</span>
                <span>Leading (RS &gt; 100) →</span>
              </div>
            </div>

            {/* Selected Sector Deep Inspection */}
            <div className="lg:col-span-4 glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  SECTOR DIAGNOSTIC
                </div>

                {selectedSector ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white font-manrope">{selectedSector.name}</h3>
                        <div className="text-xs text-slate-400 font-mono">{selectedSector.ticker}</div>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-lg font-mono font-bold ${
                          selectedSector.quadrant === "Leading"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : selectedSector.quadrant === "Weakening"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                            : selectedSector.quadrant === "Lagging"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                            : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                        }`}
                      >
                        {selectedSector.quadrant.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3 bg-[#05070D]/60 rounded-xl border border-white/5">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase">Relative Strength</div>
                        <div className="text-base font-bold text-cyan-300 font-mono">
                          {selectedSector.relativeStrength}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase">Relative Momentum</div>
                        <div className="text-base font-bold text-purple-300 font-mono">
                          {selectedSector.relativeMomentum}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase">1-Week Return</div>
                        <div
                          className={`text-sm font-bold font-mono ${
                            selectedSector.weekChange >= 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {selectedSector.weekChange >= 0 ? "+" : ""}
                          {selectedSector.weekChange}%
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase">1-Month Return</div>
                        <div
                          className={`text-sm font-bold font-mono ${
                            selectedSector.monthChange >= 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {selectedSector.monthChange >= 0 ? "+" : ""}
                          {selectedSector.monthChange}%
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-300 mb-1.5">Top Sector Movers:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedSector.topConstituents.map((t) => (
                          <span
                            key={t}
                            className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-cyan-300 font-mono"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Select any node on the RRG canvas to inspect metrics.</p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  💡 <span className="text-slate-300 font-semibold">Institutional Playbook:</span> Overweight sectors in
                  the Leading quadrant. Accumulate Improving sectors before they transition into Leading.
                </div>
              </div>
            </div>
          </div>

          {/* Performance Table */}
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-4 bg-[#070B14]/80 border-b border-white/10 font-bold text-sm text-white flex items-center justify-between">
              <span>Complete Sector Matrix</span>
              <span className="text-xs text-slate-400 font-mono">{filteredSectors.length} Sectors Active</span>
            </div>
            <div className="sm:hidden px-4 py-1.5 text-[10px] text-purple-300 font-mono bg-purple-950/20 border-b border-white/5 flex items-center justify-between">
              <span>👉 Swipe horizontally for all performance metrics</span>
              <span className="font-bold">Matrix</span>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[860px]">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-[#0A0E1A]">
                    <th className="py-3 px-4">Sector Index</th>
                    <th className="py-3 px-4">Quadrant</th>
                    <th className="py-3 px-4">CMP</th>
                    <th className="py-3 px-4">Day %</th>
                    <th className="py-3 px-4">1-Week %</th>
                    <th className="py-3 px-4">1-Month %</th>
                    <th className="py-3 px-4">RS Score</th>
                    <th className="py-3 px-4">RM Score</th>
                    <th className="py-3 px-4">Key Stocks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-sans">
                  {filteredSectors.map((sec) => (
                    <tr
                      key={sec.ticker}
                      onClick={() => setSelectedSector(sec)}
                      className="hover:bg-purple-950/15 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sec.color }} />
                          {sec.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">{sec.ticker}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-md font-mono font-bold ${
                            sec.quadrant === "Leading"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : sec.quadrant === "Weakening"
                              ? "bg-amber-500/20 text-amber-400"
                              : sec.quadrant === "Lagging"
                              ? "bg-rose-500/20 text-rose-400"
                              : "bg-cyan-500/20 text-cyan-400"
                          }`}
                        >
                          {sec.quadrant}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-200">
                        {sec.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold">
                        <span className={sec.changePercent >= 0 ? "text-emerald-400" : "text-rose-400"}>
                          {sec.changePercent >= 0 ? "+" : ""}
                          {sec.changePercent}%
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span className={sec.weekChange >= 0 ? "text-emerald-400" : "text-rose-400"}>
                          {sec.weekChange >= 0 ? "+" : ""}
                          {sec.weekChange}%
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span className={sec.monthChange >= 0 ? "text-emerald-400" : "text-rose-400"}>
                          {sec.monthChange >= 0 ? "+" : ""}
                          {sec.monthChange}%
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-cyan-300">{sec.relativeStrength}</td>
                      <td className="py-3 px-4 font-mono font-bold text-purple-300">{sec.relativeMomentum}</td>

                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          {sec.topConstituents.map((c) => (
                            <span
                              key={c}
                              className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
