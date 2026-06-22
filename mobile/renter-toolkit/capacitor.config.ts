import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ??
  "https://wealth-engine-0qlj.onrender.com/bundles/landlord-tenant-stack.html";

const config: CapacitorConfig = {
  appId: "com.wealthengine.rentertoolkit",
  appName: "Renter Toolkit",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, ""),
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#14532d",
      showSpinner: false,
    },
  },
};

export default config;
