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

  const pctCalc = adToolsShell(
    "Percentage Calculator",
    `<label>Value</label><input type="number" id="val" value="100" step="0.01">
<label>What is % of?</label><input type="number" id="pctof" value="250" step="0.01">
<label>Increase/decrease by %</label><input type="number" id="delta" value="15" step="0.01">
<div class="result" id="pout">40% · +15 = 115</div>
<script>
function pc(){const v=+val.value||0,p=+pctof.value||1,d=+delta.value||0;
const pct=(v/p*100).toFixed(1);const inc=(v*(1+d/100)).toFixed(2);
pout.textContent=pct+'% of '+p+' · '+d+'% change = '+inc;}
[val,pctof,delta].forEach(el=>el.oninput=pc);pc();
</script>`,
    "Free percentage calculator — find % of a number, calculate increases instantly."
  );

  const billSplit = adToolsShell(
    "Bill Splitter",
    `<label>Total bill ($)</label><input type="number" id="total" value="120" step="0.01">
<label>Tip %</label><select id="tip"><option value="0">0</option><option value="18" selected>18</option><option value="20">20</option><option value="25">25</option></select>
<label>People</label><input type="number" id="people" value="4" min="1">
<div class="result" id="sout">$35.40/person</div>
<script>
function sp(){const t=+total.value||0,p=Math.max(1,+people.value||1),tip=+tip.value||0;
const grand=t*(1+tip/100);sout.textContent='$'+grand.toFixed(2)+' total · $'+(grand/p).toFixed(2)+'/person';}
[total,tip,people].forEach(el=>el.oninput=sp);sp();
</script>`,
    "Split restaurant bills with tip — free calculator, no app download."
  );

  writeFileSync(join(dist, "percentage-calculator.html"), pctCalc);
  writeFileSync(join(dist, "bill-splitter.html"), billSplit);

  const hourlyCalc = adToolsShell(
    "Freelance Hourly Rate Calculator",
    `<label>Target monthly income ($)</label><input type="number" id="income" value="6000">
<label>Billable hours/week</label><input type="number" id="hours" value="30">
<label>Weeks/year</label><input type="number" id="weeks" value="48">
<div class="result" id="hout">$41.67/hr</div>
<script>
function hc(){const i=+income.value||0,h=Math.max(1,+hours.value||1),w=Math.max(1,+weeks.value||1);
hout.textContent='$'+(i/(h*w)).toFixed(2)+'/hr';}
[income,hours,weeks].forEach(el=>el.oninput=hc);hc();
</script>`,
    "Calculate your freelance hourly rate from income goals."
  );
  writeFileSync(join(dist, "hourly-rate-calculator.html"), hourlyCalc);

  const markupCalc = adToolsShell(
    "Markup Calculator",
    `<label>Cost ($)</label><input type="number" id="cost" value="50" step="0.01">
<label>Desired markup %</label><input type="number" id="markup" value="40" step="0.01">
<label>Tax % (optional)</label><input type="number" id="tax" value="0" step="0.01">
<div class="result" id="mout">$70.00 price · $20 profit</div>
<script>
function mk(){const c=+cost.value||0,m=+markup.value||0,t=+tax.value||0;
const price=c*(1+m/100)*(1+t/100);const profit=price-c*(1+t/100);
mout.textContent='$'+price.toFixed(2)+' price · $'+profit.toFixed(2)+' profit';}
[cost,markup,tax].forEach(el=>el.oninput=mk);mk();
</script>`,
    "Calculate selling price from cost and markup — free for freelancers and retailers."
  );
  writeFileSync(join(dist, "markup-calculator.html"), markupCalc);

  const lateFeeCalc = adToolsShell(
    "Late Fee Calculator",
    `<label>Invoice amount ($)</label><input type="number" id="inv" value="500" step="0.01">
<label>Days late</label><input type="number" id="days" value="15" min="0">
<label>Monthly late fee %</label><input type="number" id="fee" value="1.5" step="0.01">
<div class="result" id="lout">$37.50 late fee · $537.50 total</div>
<script>
function lf(){const i=+inv.value||0,d=+days.value||0,f=+fee.value||0;
const late=i*(f/100)*(d/30);lout.textContent='$'+late.toFixed(2)+' late fee · $'+(i+late).toFixed(2)+' total';}
[inv,days,fee].forEach(el=>el.oninput=lf);lf();
</script>`,
    "Calculate invoice late fees by day — free tool for freelancers and small business."
  );
  writeFileSync(join(dist, "late-fee-calculator.html"), lateFeeCalc);

  const breakEvenCalc = adToolsShell(
    "Break-Even Calculator",
    `<label>Fixed costs/month ($)</label><input type="number" id="fixed" value="2000">
<label>Price per unit ($)</label><input type="number" id="price" value="25" step="0.01">
<label>Variable cost per unit ($)</label><input type="number" id="var" value="8" step="0.01">
<div class="result" id="beout">118 units to break even</div>
<script>
function be(){const f=+fixed.value||0,p=+price.value||0,v=+var.value||0;
const margin=p-v;beout.textContent=margin<=0?'Need price > cost':Math.ceil(f/margin)+' units to break even';}
[fixed,price,var].forEach(el=>el.oninput=be);be();
</script>`,
    "Free break-even calculator — find how many sales you need to cover costs."
  );
  writeFileSync(join(dist, "break-even-calculator.html"), breakEvenCalc);

  const discountCalc = adToolsShell(
    "Discount Calculator",
    `<label>Original price ($)</label><input type="number" id="orig" value="100" step="0.01">
<label>Discount %</label><input type="number" id="disc" value="25" step="0.01">
<div class="result" id="dout">$75.00 · save $25.00</div>
<script>
function dc(){const o=+orig.value||0,d=+disc.value||0,s=o*d/100;dout.textContent='$'+(o-s).toFixed(2)+' · save $'+s.toFixed(2)+' ('+d+'% off)';}
[orig,disc].forEach(el=>el.oninput=dc);dc();
</script>`,
    "Calculate sale price and savings — free discount calculator."
  );
  writeFileSync(join(dist, "discount-calculator.html"), discountCalc);

  const unitPriceCalc = adToolsShell(
    "Unit Price Calculator",
    `<label>Total price ($)</label><input type="number" id="price" value="12.99" step="0.01">
<label>Quantity / weight</label><input type="number" id="qty" value="16" step="0.01">
<label>Unit label</label><input type="text" id="unit" value="oz">
<div class="result" id="uout">$0.81/oz</div>
<script>
function uc(){const p=+price.value||0,q=Math.max(0.001,+qty.value||1),u=unit.value||'unit';
uout.textContent='$'+(p/q).toFixed(3)+'/'+u;}
[price,qty,unit].forEach(el=>el.oninput=uc);uc();
</script>`,
    "Compare grocery prices — cost per ounce, pound, or item."
  );
  writeFileSync(join(dist, "unit-price-calculator.html"), unitPriceCalc);

  const privacy = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Privacy Policy</title><style>body{font-family:system-ui;max-width:720px;margin:40px auto;padding:20px;line-height:1.6}</style></head><body>
<h1>Privacy Policy</h1><p>Wealth Engine tools process data locally in your browser. Payment checkout is handled by Stripe. We do not sell personal data.</p>
<p>Contact: orders@horseshoeroundme.com</p><p><a href="/">← Home</a></p></body></html>`;
  writeFileSync(join(getRoot(), "dist", "privacy.html"), privacy);

  return { pages: ["tip-calculator", "meeting-cost-free", "percentage-calculator", "bill-splitter", "hourly-rate-calculator", "markup-calculator", "late-fee-calculator", "break-even-calculator", "discount-calculator", "unit-price-calculator", "privacy"] };
}
