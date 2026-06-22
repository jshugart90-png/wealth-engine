import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ?? "https://wealth-engine-0qlj.onrender.com/games/word-scramble-biz/";

const config: CapacitorConfig = {
  appId: "com.wealthengine.wordscramblebiz",
  appName: "Word Scramble Biz",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, "") + "/",
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#fefce8",
      showSpinner: false,
    },
  },
};

export default config;
