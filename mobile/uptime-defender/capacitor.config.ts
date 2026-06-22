import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ?? "https://wealth-engine-0qlj.onrender.com/games/uptime-defender/";

const config: CapacitorConfig = {
  appId: "com.wealthengine.uptimedefender",
  appName: "Uptime Defender",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, "") + "/",
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0a0a12",
      showSpinner: false,
    },
  },
};

export default config;
