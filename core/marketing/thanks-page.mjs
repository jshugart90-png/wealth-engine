import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getRoot, loadEnv, getMarketingBaseUrl } from "../env.mjs";

export function buildThanksPage() {
  const env = loadEnv();
  const dist = join(getRoot(), "dist");
  mkdirSync(dist, { recursive: true });
  const base = getMarketingBaseUrl();
  const conversionId = env.GOOGLE_ADS_CONVERSION_ID ?? "";
  const conversionLabel = env.GOOGLE_ADS_CONVERSION_LABEL ?? "";

  const gtagBlock =
    conversionId && conversionLabel
      ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${conversionId}"></script>
<script>
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('config','${conversionId}');
gtag('event','conversion',{send_to:'${conversionId}/${conversionLabel}'});
</script>`
      : `<!-- Set GOOGLE_ADS_CONVERSION_ID + GOOGLE_ADS_CONVERSION_LABEL in .env for conversion tracking -->`;

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Thank you — order confirmed</title>
<meta name="robots" content="noindex">
${gtagBlock}
<style>
body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;text-align:center}
.card{max-width:480px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);border-radius:16px;padding:36px}
h1{color:#22c55e;margin-bottom:12px}a{color:#38bdf8}
.btn{display:inline-block;background:#22c55e;color:#fff;text-decoration:none;padding:14px 24px;border-radius:8px;margin-top:16px;font-weight:700}
</style></head><body><div class="card">
<h1>✓ Payment received</h1>
<p>Check your email for license code and download link. It usually arrives within 2 minutes.</p>
<p style="margin-top:20px;font-size:14px;color:#94a3b8">Save your license code — you'll need it in the tool.</p>
<a class="btn" href="${base}/">Back to tools →</a>
<p style="margin-top:24px"><a href="${base}/bundles/freelancer-stack.html">Bundle deals →</a></p>
</div></body></html>`;

  writeFileSync(join(dist, "thanks.html"), html);
  return { path: join(dist, "thanks.html"), conversionTracking: !!(conversionId && conversionLabel) };
}
