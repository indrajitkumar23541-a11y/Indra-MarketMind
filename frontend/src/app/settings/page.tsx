import type { Metadata } from "next";
import SettingsView from "@/components/settings/SettingsView";

export const metadata: Metadata = {
  title: "Settings & Preferences | Indra-MarketMind",
  description:
    "Manage your profile, trading preferences, market breakout alerts, and AI Copilot.",
};

export default function SettingsPage() {
  return <SettingsView />;
}
