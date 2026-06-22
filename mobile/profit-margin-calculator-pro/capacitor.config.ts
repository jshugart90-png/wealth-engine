import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ?? "https://wealth-engine-0qlj.onrender.com/profit-margin-calculator-pro/";

const config: CapacitorConfig = {
  appId: "com.wealthengine.profitmargincalculatorpro",
  appName: "Profit Margin Calculator Pro",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, "") + "/",
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#064e3b",
      showSpinner: false,
    },
  },
};

export default config;
