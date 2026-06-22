import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ??
  "https://wealth-engine-0qlj.onrender.com/bundles/devwatch.html";

const config: CapacitorConfig = {
  appId: "com.wealthengine.devwatch",
  appName: "DevWatch",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, ""),
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0c1222",
      showSpinner: false,
    },
  },
};

export default config;
