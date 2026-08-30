import type { Metadata } from "next";
import { Inter, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  title: "Indra-MarketMind Dashboard",
  description: "AI-Powered Financial Intelligence & Market Sentiment Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${manrope.variable} ${spaceGrotesk.variable} font-sans bg-[#05070D] text-slate-200 antialiased h-screen overflow-hidden flex`}
      >
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          <TopNav />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 custom-scrollbar bg-radial-[at_100%_0%] from-indigo-900/10 via-[#05070D] to-[#030407]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
