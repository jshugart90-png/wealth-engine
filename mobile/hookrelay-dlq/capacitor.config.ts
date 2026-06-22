import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ??
  "https://wealth-engine-0qlj.onrender.com/go/hookrelay-dlq.html";

const config: CapacitorConfig = {
  appId: "com.wealthengine.hookrelaydlqpro",
  appName: "HookRelay DLQ Pro",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, ""),
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
