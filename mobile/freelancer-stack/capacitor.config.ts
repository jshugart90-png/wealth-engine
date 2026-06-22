import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ??
  "https://wealth-engine-0qlj.onrender.com/bundles/freelancer-stack.html";

const config: CapacitorConfig = {
  appId: "com.wealthengine.freelancerstack",
  appName: "Freelancer Revenue Stack",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, ""),
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1e3a8a",
      showSpinner: false,
    },
  },
};

export default config;
