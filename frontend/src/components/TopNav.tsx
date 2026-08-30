import { Search, Bell, Sun, ChevronDown } from "lucide-react";

export default function TopNav() {
  return (
    <header className="h-18 flex items-center justify-between px-6 sticky top-0 z-50 bg-[#0B1020]/80 backdrop-blur-md border-b border-white/5 flex-shrink-0">
      <div className="flex-1 max-w-xl">
        <div className="relative flex items-center w-80">
          <Search className="absolute left-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search stocks, news, sectors..."
            className="w-full bg-[#0F172A] border border-white/5 rounded-lg py-2 pl-10 pr-12 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#00F0FF]/30 focus:ring-1 focus:ring-[#00F0FF]/30 transition-all"
          />
          <div className="absolute right-2 px-1.5 py-0.5 rounded border border-white/10 bg-slate-800 text-[10px] text-slate-400 font-medium">
            Ctrl /
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative cursor-pointer">
          <Bell className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors" />
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#00F0FF] rounded-full flex items-center justify-center text-[10px] font-bold text-black border-2 border-[#0B1020]">
            3
          </div>
        </div>
        
        <button className="text-slate-400 hover:text-slate-200 transition-colors">
          <Sun className="w-5 h-5" />
        </button>

        <div className="h-8 w-px bg-white/10"></div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-[#00F0FF] p-[2px]">
            <div className="w-full h-full bg-[#0B1020] rounded-full flex items-center justify-center overflow-hidden">
              <span className="text-sm font-bold text-slate-200">IK</span>
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">Indrajit Kumar</div>
            <div className="text-[11px] font-bold text-[#00F0FF] flex items-center gap-1">
              Open Source Contributor
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300 ml-1" />
        </div>
      </div>
    </header>
  );
}
