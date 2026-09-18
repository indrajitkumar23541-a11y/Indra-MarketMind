"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Footer from "./Footer";

export default function MainContentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCopilot = pathname === "/copilot";

  return (
    <main
      className={cn(
        "flex-1 min-h-0 custom-scrollbar bg-radial-[at_100%_0%] from-indigo-900/10 via-[#05070D] to-[#030407]",
        isCopilot
          ? "overflow-hidden p-0 pb-[60px] lg:pb-0 flex flex-col h-full"
          : "overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 pb-36 lg:pb-28"
      )}
    >
      <div className="w-full">{children}</div>
      {!isCopilot && <Footer />}
    </main>
  );
}
