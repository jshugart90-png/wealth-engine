import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ?? "https://wealth-engine-0qlj.onrender.com/billsnap/";

const config: CapacitorConfig = {
  appId: "com.wealthengine.billsnap",
  appName: "BillSnap",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, "") + "/",
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#f8fafc",
      showSpinner: false,
    },
  },
};

export default config;
