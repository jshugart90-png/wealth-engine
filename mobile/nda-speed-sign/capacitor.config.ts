import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ?? "https://wealth-engine-0qlj.onrender.com/games/nda-speed-sign/";

const config: CapacitorConfig = {
  appId: "com.wealthengine.ndaspeedsign",
  appName: "NDA Speed Sign",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, "") + "/",
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1625",
      showSpinner: false,
    },
  },
};

export default config;
