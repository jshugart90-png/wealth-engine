import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ?? "https://wealth-engine-0qlj.onrender.com/1099-threshold-tracker-pro/";

const config: CapacitorConfig = {
  appId: "com.wealthengine.thresholdtrackerpro",
  appName: "1099 Threshold Tracker Pro",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, "") + "/",
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1e1b4b",
      showSpinner: false,
    },
  },
};

export default config;
