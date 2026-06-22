import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ?? "https://wealth-engine-0qlj.onrender.com/bill-splitter-pro/";

const config: CapacitorConfig = {
  appId: "com.wealthengine.billsplitterpro",
  appName: "Bill Splitter Pro",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, "") + "/",
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#431407",
      showSpinner: false,
    },
  },
};

export default config;
