import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ?? "https://wealth-engine-0qlj.onrender.com/pipekit/";

const config: CapacitorConfig = {
  appId: "com.wealthengine.pipekit",
  appName: "PipeKit",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, "") + "/",
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0d1117",
      showSpinner: false,
    },
  },
};

export default config;
