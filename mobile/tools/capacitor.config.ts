import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl = process.env.CAPACITOR_SERVER_URL ?? "https://wealth-engine-0qlj.onrender.com";

const config: CapacitorConfig = {
  appId: "com.wealthengine.freelancertools",
  appName: "Freelancer Tools",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, ""),
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0a0a0f",
      showSpinner: false,
    },
  },
};

export default config;
