import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ?? "https://wealth-engine-0qlj.onrender.com/quarterly-tax-deadline-pro/";

const config: CapacitorConfig = {
  appId: "com.wealthengine.quarterlytaxdeadlinepro",
  appName: "Quarterly Tax Deadline Pro",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, "") + "/",
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0c4a6e",
      showSpinner: false,
    },
  },
};

export default config;
