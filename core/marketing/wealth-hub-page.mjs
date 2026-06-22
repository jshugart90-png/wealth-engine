import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getRoot } from "../env.mjs";
import { generateWealthHubIndexHtml } from "../../mobile/shared/portfolio-catalog.mjs";

/** Build dist/wealth-hub/index.html for web + Capacitor production URL. */
export function buildWealthHubPage() {
  const distDir = join(getRoot(), "dist", "wealth-hub");
  mkdirSync(distDir, { recursive: true });
  const html = generateWealthHubIndexHtml({
    onlineUrl: "https://wealth-engine-0qlj.onrender.com/wealth-hub/",
  });
  writeFileSync(join(distDir, "index.html"), html);
  return { pages: ["wealth-hub/index"] };
}
