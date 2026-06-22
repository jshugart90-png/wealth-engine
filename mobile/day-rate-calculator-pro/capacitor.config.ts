import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ?? "https://wealth-engine-0qlj.onrender.com/day-rate-calculator-pro/";

const config: CapacitorConfig = {
  appId: "com.wealthengine.dayratecalculatorpro",
  appName: "Day Rate to Hourly Calculator Pro",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, "") + "/",
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#451a03",
      showSpinner: false,
    },
  },
};

export default config;
