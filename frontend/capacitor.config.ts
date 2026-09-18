import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.indramarketmind.app",
  appName: "Indra-MarketMind",
  webDir: "public",
  server: {
    url: "https://indra-marketmind.vercel.app",
    cleartext: true,
    androidScheme: "https",
  },
  android: {
    backgroundColor: "#05070D",
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: "#05070D",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
};

export default config;
