import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ?? "https://wealth-engine-0qlj.onrender.com/late-fee-calculator-pro/";

const config: CapacitorConfig = {
  appId: "com.wealthengine.latefeecalculatorpro",
  appName: "Late Fee Calculator Pro",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, "") + "/",
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#450a0a",
      showSpinner: false,
    },
  },
};

export default config;
