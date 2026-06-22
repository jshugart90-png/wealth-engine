import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ?? "https://wealth-engine-0qlj.onrender.com/games/receipt-rush/";

const config: CapacitorConfig = {
  appId: "com.wealthengine.receiptrush",
  appName: "Receipt Rush",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, "") + "/",
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#fef3c7",
      showSpinner: false,
    },
  },
};

export default config;
