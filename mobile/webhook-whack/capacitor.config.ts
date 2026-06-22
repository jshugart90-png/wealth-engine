import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ?? "https://wealth-engine-0qlj.onrender.com/games/webhook-whack/";

const config: CapacitorConfig = {
  appId: "com.wealthengine.webhookwhack",
  appName: "Webhook Whack",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, "") + "/",
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0f0f1a",
      showSpinner: false,
    },
  },
};

export default config;
