import type { Metadata, Viewport } from "next";
import { Inter, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import MobileBottomDock from "@/components/MobileBottomDock";
import { NavProvider } from "@/lib/NavContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#05070D",
};

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
        className={`${inter.variable} ${manrope.variable} ${spaceGrotesk.variable} font-sans bg-[#05070D] text-slate-200 antialiased min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row`}
      >
        <NavProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 h-full relative">
            <TopNav />
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 pb-22 lg:pb-6 custom-scrollbar bg-radial-[at_100%_0%] from-indigo-900/10 via-[#05070D] to-[#030407]">
              {children}
            </main>
          </div>
          <MobileBottomDock />
        </NavProvider>
      </body>
    </html>
  );
}

