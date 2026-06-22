import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.CAPACITOR_SERVER_URL ??
  "https://wealth-engine-0qlj.onrender.com/go/1099-deadline.html";

const config: CapacitorConfig = {
  appId: "com.wealthengine.1099suite",
  appName: "1099 Deadline Suite",
  webDir: "www",
  server: {
    url: productionUrl.replace(/\/$/, ""),
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#78350f",
      showSpinner: false,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#d97706",
    },
  },
};

export default config;
