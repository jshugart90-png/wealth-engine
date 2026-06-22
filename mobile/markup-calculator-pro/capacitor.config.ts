import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ?? "https://wealth-engine-0qlj.onrender.com/markup-calculator-pro/";

const config: CapacitorConfig = {
  appId: "com.wealthengine.markupcalculatorpro",
  appName: "Markup Calculator Pro",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, "") + "/",
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#022c22",
      showSpinner: false,
    },
  },
};

export default config;
