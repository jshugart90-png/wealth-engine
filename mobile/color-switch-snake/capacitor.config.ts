import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ?? "https://wealth-engine-0qlj.onrender.com/games/color-switch-snake/";

const config: CapacitorConfig = {
  appId: "com.wealthengine.colorswitchsnake",
  appName: "Color Switch Snake",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, "") + "/",
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0c0c0c",
      showSpinner: false,
    },
  },
};

export default config;
