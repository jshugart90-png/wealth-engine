import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getRoot, loadEnv, getPublicBaseUrl } from "../env.mjs";

const AD_SLOT = (label) =>
  `<div class="ad-slot" data-adsense-placeholder="${label}" style="min-height:90px;background:#1e293b;border:1px dashed #475569;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:12px;margin:20px 0">Ad slot — replace after AdSense approval</div>`;

function adToolsShell(title, body, desc) {
  const base = getPublicBaseUrl();
  const env = loadEnv();
  const adsense = env.GOOGLE_ADSENSE_CLIENT
    ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${env.GOOGLE_ADSENSE_CLIENT}" crossorigin="anonymous"></script>`
    : "<!-- Set GOOGLE_ADSENSE_CLIENT in .env after AdSense approval -->";

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${base}/tools/${title.toLowerCase().replace(/\s+/g, "-")}.html">
${adsense}
<style>
body{font-family:system-ui,sans-serif;max-width:640px;margin:0 auto;padding:24px 16px;line-height:1.5;color:#0f172a}
h1{font-size:clamp(24px,4vw,32px)}input,select{width:100%;padding:10px;margin:8px 0;border:1px solid #cbd5e1;border-radius:6px;font-size:16px}
.result{font-size:36px;font-weight:700;color:#2563eb;margin:16px 0}
.promo{background:#f0fdf4;border:1px solid #bbf7d0;padding:12px;border-radius:8px;margin-top:24px;font-size:14px}
.promo a{color:#059669;font-weight:600}
</style></head><body>
<h1>${title}</h1>
<p>${desc}</p>
${AD_SLOT("728x90")}
${body}
${AD_SLOT("300x250")}
<div class="promo">Need a pro tool? <a href="${base}/go/invoice.html">Invoice PDF $3</a> · <a href="${base}/go/uptime.html">Uptime alerts $5/mo</a></div>
<p style="margin-top:24px;font-size:13px"><a href="${base}/">← All Wealth Engine tools</a></p>
</body></html>`;
}

export function buildAdToolPages() {
  const dist = join(getRoot(), "dist", "tools");
  mkdirSync(dist, { recursive: true });

  const tipCalc = adToolsShell(
    "Tip Calculator",
    `<label>Bill amount ($)</label><input type="number" id="bill" value="50" step="0.01">
<label>Tip %</label><select id="pct"><option>15</option><option selected>18</option><option>20</option><option>25</option></select>
<label>Split between</label><input type="number" id="split" value="1" min="1">
<div class="result" id="out">$9.00 tip · $59.00 total</div>
<script>
function calc(){const b=+bill.value||0,p=+pct.value||0,s=Math.max(1,+split.value||1),t=b*p/100;out.textContent='$'+t.toFixed(2)+' tip · $'+(b+t).toFixed(2)+' total · $'+((b+t)/s).toFixed(2)+'/person';}
[bill,pct,split].forEach(el=>el.oninput=calc);calc();
</script>`,
    "Free tip calculator — split bills, calculate gratuity instantly."
  );

  const meetingFree = adToolsShell(
    "Meeting Cost Calculator",
    `<label>Attendees</label><input type="number" id="attendees" value="8">
<label>Avg hourly rate ($)</label><input type="number" id="rate" value="75">
<label>Duration (minutes)</label><input type="number" id="minutes" value="60">
<div class="result" id="mcout">$600</div>
<script>
function mc(){mcout.textContent='$'+Math.round((+attendees.value||0)*(+rate.value||0)*(+minutes.value||0)/60).toLocaleString();}
[attendees,rate,minutes].forEach(el=>el.oninput=mc);mc();
</script>`,
    "Calculate the true cost of meetings. Free viral tool with shareable results."
  );

  writeFileSync(join(dist, "tip-calculator.html"), tipCalc);
  writeFileSync(join(dist, "meeting-cost-free.html"), meetingFree);

  const privacy = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Privacy Policy</title><style>body{font-family:system-ui;max-width:720px;margin:40px auto;padding:20px;line-height:1.6}</style></head><body>
<h1>Privacy Policy</h1><p>Wealth Engine tools process data locally in your browser. Payment checkout is handled by Stripe. We do not sell personal data.</p>
<p>Contact: orders@horseshoeroundme.com</p><p><a href="/">← Home</a></p></body></html>`;
  writeFileSync(join(getRoot(), "dist", "privacy.html"), privacy);

  return { pages: ["tip-calculator", "meeting-cost-free", "privacy"] };
}
