import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ?? "https://wealth-engine-0qlj.onrender.com/ndagen/";

const config: CapacitorConfig = {
  appId: "com.wealthengine.ndagen",
  appName: "NDAGen",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, "") + "/",
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#059669",
      showSpinner: false,
    },
  },
};

export default config;
