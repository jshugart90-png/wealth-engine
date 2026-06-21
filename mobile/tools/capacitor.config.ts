import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
  appId: "com.wealthengine.freelancertools",
  appName: "Freelancer Tools",
  webDir: "www",
  server: productionUrl
    ? {
        url: productionUrl.replace(/\/$/, ""),
        cleartext: false,
        androidScheme: "https",
      }
    : undefined,
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0a0a0f",
      showSpinner: false,
    },
  },
};

export default config;
