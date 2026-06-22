import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ?? "https://wealth-engine-0qlj.onrender.com/games/horseshoe-toss/";

const config: CapacitorConfig = {
  appId: "com.wealthengine.horseshoetoss",
  appName: "Horseshoe Toss",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, "") + "/",
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a2f1a",
      showSpinner: false,
    },
  },
};

export default config;
