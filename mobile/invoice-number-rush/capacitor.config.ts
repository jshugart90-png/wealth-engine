import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ?? "https://wealth-engine-0qlj.onrender.com/games/invoice-number-rush/";

const config: CapacitorConfig = {
  appId: "com.wealthengine.invoicenumberrush",
  appName: "Invoice Number Rush",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, "") + "/",
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0c1a2e",
      showSpinner: false,
    },
  },
};

export default config;
