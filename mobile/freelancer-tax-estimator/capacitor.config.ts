import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ?? "https://wealth-engine-0qlj.onrender.com/freelancer-tax-estimator/";

const config: CapacitorConfig = {
  appId: "com.wealthengine.freelancertaxestimatorpro",
  appName: "Freelancer Tax Estimator Pro",
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
