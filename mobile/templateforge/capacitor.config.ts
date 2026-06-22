import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ?? "https://wealth-engine-0qlj.onrender.com/templateforge/";

const config: CapacitorConfig = {
  appId: "com.wealthengine.templateforge",
  appName: "TemplateForge",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, "") + "/",
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#fafafa",
      showSpinner: false,
    },
  },
};

export default config;
