import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl = process.env.CAPACITOR_SERVER_URL ?? "https://wealth-engine-0qlj.onrender.com/games/";

const config: CapacitorConfig = {
  appId: "com.wealthengine.gameshub",
  appName: "Horseshoe Games Hub",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, "") + "/",
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#6366f1",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
