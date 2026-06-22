import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ?? "https://wealth-engine-0qlj.onrender.com/hourly-rate-calculator-pro/";

const config: CapacitorConfig = {
  appId: "com.wealthengine.hourlyratecalculatorpro",
  appName: "Hourly Rate Calculator Pro",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, "") + "/",
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1e1b4b",
      showSpinner: false,
    },
  },
};

export default config;
