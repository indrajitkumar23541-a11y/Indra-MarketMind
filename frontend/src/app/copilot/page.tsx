import type { Metadata } from "next";
import CopilotView from "@/components/CopilotView";

export const metadata: Metadata = {
  title: "MarketMind Copilot - Real-Time Financial Intelligence | Indra-MarketMind",
  description:
    "Institutional AI Copilot grounded in real-time market telemetry, 5-model NLP sentiment feeds, and quantitative risk models.",
};

export default function CopilotPage() {
  return <CopilotView />;
}
