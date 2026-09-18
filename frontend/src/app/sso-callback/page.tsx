import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <div className="min-h-screen bg-[#060913] flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3 text-white text-center">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(0,240,255,0.4)]" />
        <h3 className="text-sm font-space font-bold text-white tracking-wide">
          Verifying Identity...
        </h3>
        <p className="text-xs text-slate-400 font-sans">
          Establishing encrypted session with Indra-MarketMind.
        </p>
        <AuthenticateWithRedirectCallback />
      </div>
    </div>
  );
}
