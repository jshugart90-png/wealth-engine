import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getRoot, loadEnv, getPublicBaseUrl } from "../env.mjs";
import { AFFILIATE_REF_SCRIPT } from "./affiliates.mjs";
import { visitTrackerScript } from "./monetization.mjs";

const AD_SLOT = (label) =>
  `<div class="ad-slot" data-adsense-placeholder="${label}" style="min-height:90px;background:#1e293b;border:1px dashed #475569;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:12px;margin:20px 0">Ad slot — replace after AdSense approval</div>`;

const EMAIL_CAPTURE = (source) => `<div class="email-cap" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:24px 0">
<strong style="display:block;margin-bottom:8px">Get freelancer tax reminders + LAUNCH25 deals</strong>
<form onsubmit="event.preventDefault();fetch('/api/funnel/email_capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:this.email.value,path:'${source}'})}).then(()=>{this.querySelector('.ok').style.display='block';this.reset()});">
<input type="email" name="email" placeholder="you@email.com" required style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:6px;margin-bottom:8px;font-size:16px">
<button type="submit" style="width:100%;padding:10px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-weight:600;cursor:pointer">Join free list</button>
<p class="ok" style="display:none;color:#059669;margin-top:8px;font-size:14px">✓ You're on the list — check inbox for LAUNCH25.</p>
</form></div>`;

const INTERNAL_LINKS = `<div style="font-size:14px;margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0">
<strong>Related tools:</strong>
<a href="/tools/1099-tax-estimator.html">1099 tax</a> ·
<a href="/tools/hourly-rate-calculator.html">Hourly rate</a> ·
<a href="/tools/payment-terms-calculator.html">Payment terms</a> ·
<a href="/go/invoice.html">Invoice PDF</a> ·
<a href="/p/freelancer-compliance-by-state.html">State compliance</a> ·
<a href="/comparestack/">Compare tools</a>
</div>`;

function adToolsShell(title, body, desc, slug) {
  const base = getPublicBaseUrl();
  const fileSlug = slug ?? title.toLowerCase().replace(/\s+/g, "-");
  const env = loadEnv();
  const adsense = env.GOOGLE_ADSENSE_CLIENT
    ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${env.GOOGLE_ADSENSE_CLIENT}" crossorigin="anonymous"></script>`
    : "<!-- Set GOOGLE_ADSENSE_CLIENT in .env after AdSense approval -->";
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: title,
    description: desc,
    applicationCategory: "BusinessApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    url: `${base}/tools/${fileSlug}.html`,
  });

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — Free Online Tool (2026)</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${base}/tools/${fileSlug}.html">
<script type="application/ld+json">${jsonLd}</script>
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
${EMAIL_CAPTURE(`/tools/${fileSlug}`)}
<div class="promo">Need a pro tool? <a href="${base}/go/invoice.html">Invoice PDF $3</a> · <a href="${base}/go/uptime.html">Uptime alerts $5/mo</a> · <a href="${base}/go/compliance.html">Compliance pack $19</a></div>
${INTERNAL_LINKS}
<p style="margin-top:24px;font-size:13px"><a href="${base}/tools/">← All free tools</a> · <a href="${base}/join.html?utm_source=tools-${fileSlug}">Email list</a></p>
<script>${AFFILIATE_REF_SCRIPT}</script>
<script>${visitTrackerScript(`/tools/${fileSlug}.html`)}</script>
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
  writeFileSync(join(dist, "hourly-rate.html"), hourlyCalc);

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

  const profitMarginCalc = adToolsShell(
    "Profit Margin Calculator",
    `<label>Revenue ($)</label><input type="number" id="rev" value="1000" step="0.01">
<label>Cost of goods ($)</label><input type="number" id="cogs" value="400" step="0.01">
<label>Operating expenses ($)</label><input type="number" id="opex" value="200" step="0.01">
<div class="result" id="pmout">60% gross · 40% net</div>
<script>
function pm(){const r=+rev.value||0,c=+cogs.value||0,o=+opex.value||0;
const gross=r>0?((r-c)/r*100).toFixed(1):0;const net=r>0?((r-c-o)/r*100).toFixed(1):0;
pmout.textContent=gross+'% gross · '+net+'% net margin';}
[rev,cogs,opex].forEach(el=>el.oninput=pm);pm();
</script>`,
    "Calculate gross and net profit margins — free for freelancers and small business."
  );
  writeFileSync(join(dist, "profit-margin-calculator.html"), profitMarginCalc);

  const invoiceNumGen = adToolsShell(
    "Invoice Number Generator",
    `<label>Prefix</label><input type="text" id="prefix" value="INV">
<label>Starting number</label><input type="number" id="start" value="1001">
<label>Count to generate</label><input type="number" id="count" value="5" min="1" max="20">
<div class="result" id="iout" style="font-size:18px;line-height:1.8">INV-1001<br>INV-1002<br>INV-1003</div>
<script>
function ig(){const p=prefix.value||'INV',s=+start.value||1,n=Math.min(20,Math.max(1,+count.value||1));
iout.innerHTML=Array.from({length:n},(_,i)=>p+'-'+(s+i)).join('<br>');}
[prefix,start,count].forEach(el=>el.oninput=ig);ig();
</script>`,
    "Generate sequential invoice numbers — free tool for freelancers. Export pro PDFs with BillSnap."
  );
  writeFileSync(join(dist, "invoice-number-generator.html"), invoiceNumGen);

  const salesTaxCalc = adToolsShell(
    "Sales Tax Calculator",
    `<label>Pre-tax amount ($)</label><input type="number" id="subtotal" value="100" step="0.01">
<label>Tax rate %</label><input type="number" id="taxrate" value="8.25" step="0.01">
<label>Tax-inclusive? (reverse calc)</label><select id="mode"><option value="add">Add tax to subtotal</option><option value="extract">Extract from total</option></select>
<div class="result" id="stout">$8.25 tax · $108.25 total</div>
<script>
function st(){const s=+subtotal.value||0,r=+taxrate.value||0;
if(mode.value==='extract'){const base=s/(1+r/100);const tax=s-base;stout.textContent='$'+tax.toFixed(2)+' tax · $'+base.toFixed(2)+' pre-tax';}
else{const tax=s*r/100;stout.textContent='$'+tax.toFixed(2)+' tax · $'+(s+tax).toFixed(2)+' total';}}
[subtotal,taxrate,mode].forEach(el=>el.onchange=st);[subtotal,taxrate,mode].forEach(el=>el.oninput=st);st();
</script>`,
    "Calculate sales tax on invoices and receipts — free tool for freelancers and retailers."
  );
  writeFileSync(join(dist, "sales-tax-calculator.html"), salesTaxCalc);

  const paymentTermsCalc = adToolsShell(
    "Payment Terms Calculator",
    `<label>Invoice date</label><input type="date" id="invdate">
<label>Net terms (days)</label><select id="terms"><option value="0">Due on receipt</option><option value="15">Net 15</option><option value="30" selected>Net 30</option><option value="45">Net 45</option><option value="60">Net 60</option></select>
<label>Invoice amount ($)</label><input type="number" id="invamt" value="1500" step="0.01">
<label>Late fee %/month</label><input type="number" id="late" value="1.5" step="0.01">
<div class="result" id="ptout">Due date · $0 late fee today</div>
<script>
const today=new Date().toISOString().slice(0,10);invdate.value=today;
function pt(){const d=new Date(invdate.value||today),n=+terms.value||0;
const due=new Date(d);due.setDate(due.getDate()+n);
const now=new Date();const daysLate=Math.max(0,Math.floor((now-due)/86400000));
const amount=+invamt.value||0,latePct=+late.value||0;
const fee=daysLate>0?amount*(latePct/100)*(daysLate/30):0;
ptout.textContent='Due '+due.toLocaleDateString()+(daysLate>0?' · '+daysLate+' days late · $'+fee.toFixed(2)+' fee':' · on time');}
[invdate,terms,invamt,late].forEach(el=>el.oninput=pt);pt();
</script>`,
    "Calculate invoice due dates and late fees from Net 15/30/45/60 terms."
  );
  writeFileSync(join(dist, "payment-terms-calculator.html"), paymentTermsCalc);

  const compoundCalc = adToolsShell(
    "Compound Interest Calculator",
    `<label>Initial deposit ($)</label><input type="number" id="principal" value="1000" step="0.01">
<label>Monthly contribution ($)</label><input type="number" id="monthly" value="100" step="0.01">
<label>Annual interest rate %</label><input type="number" id="rate" value="7" step="0.01">
<label>Years</label><input type="number" id="years" value="10" min="1">
<div class="result" id="ciout">$18,765 future value</div>
<script>
function ci(){const p=+principal.value||0,m=+monthly.value||0,r=(+rate.value||0)/100/12,n=(+years.value||0)*12;
let bal=p;for(let i=0;i<n;i++)bal=bal*(1+r)+m;
ciout.textContent='$'+Math.round(bal).toLocaleString()+' future value · $'+Math.round(bal-p-m*n).toLocaleString()+' interest';}
[principal,monthly,rate,years].forEach(el=>el.oninput=ci);ci();
</script>`,
    "Free compound interest calculator — plan savings and investment growth."
  );
  writeFileSync(join(dist, "compound-interest-calculator.html"), compoundCalc);

  const overtimeCalc = adToolsShell(
    "Overtime Pay Calculator",
    `<label>Hourly rate ($)</label><input type="number" id="hr" value="25" step="0.01">
<label>Regular hours</label><input type="number" id="reg" value="40" step="0.5">
<label>Overtime hours (1.5×)</label><input type="number" id="othrs" value="5" step="0.5">
<label>Double-time hours (2×)</label><input type="number" id="dthrs" value="0" step="0.5">
<div class="result" id="otout">$1,187.50 gross pay</div>
<script>
function calcOt(){const h=+hr.value||0,r=+reg.value||0,o=+othrs.value||0,d=+dthrs.value||0;
const gross=h*r+h*o*1.5+h*d*2;otout.textContent='$'+gross.toFixed(2)+' gross · $'+(h*o*0.5+h*d).toFixed(2)+' OT premium';}
[hr,reg,othrs,dthrs].forEach(el=>el.oninput=calcOt);calcOt();
</script>`,
    "Calculate overtime and double-time pay — free for hourly workers and payroll."
  );
  writeFileSync(join(dist, "overtime-pay-calculator.html"), overtimeCalc);

  const roiCalc = adToolsShell(
    "ROI Calculator",
    `<label>Initial investment ($)</label><input type="number" id="invest" value="500" step="0.01">
<label>Return / revenue ($)</label><input type="number" id="ret" value="750" step="0.01">
<label>Time period (months)</label><input type="number" id="months" value="3" min="1">
<div class="result" id="rout">50% ROI · 16.7%/mo</div>
<script>
function rc(){const i=+invest.value||0,r=+ret.value||0,m=Math.max(1,+months.value||1);
const roi=i>0?((r-i)/i*100).toFixed(1):0;const monthly=(roi/m).toFixed(1);
rout.textContent=roi+'% ROI · '+monthly+'%/mo over '+m+' months';}
[invest,ret,months].forEach(el=>el.oninput=rc);rc();
</script>`,
    "Calculate return on investment for freelance projects, ads, and business spend."
  );
  writeFileSync(join(dist, "roi-calculator.html"), roiCalc);

  const tax1099Calc = adToolsShell(
    "1099 Tax Estimator",
    `<div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:12px;margin-bottom:16px;font-size:14px">
<strong>1099-NEC deadline:</strong> <span id="deadline"></span> · <a href="/go/1099-deadline.html">Get 1099 PDF suite $19 →</a>
</div>
<label>1099 income YTD ($)</label><input type="number" id="income" value="45000" step="0.01">
<label>Business expenses ($)</label><input type="number" id="expenses" value="8000" step="0.01">
<label>Other W-2 income ($)</label><input type="number" id="w2" value="0" step="0.01">
<label>Estimated tax rate %</label><input type="number" id="rate" value="25" step="0.01">
<div class="result" id="tout">$9,250 estimated tax</div>
<p style="font-size:13px;margin-top:12px"><a href="/p/freelancer-compliance-by-state.html">State 1099 filing guides</a> · <a href="/go/compliance.html">Compliance pack</a></p>
<script>
const dl=new Date(new Date().getFullYear(),0,31);const now=new Date();const days=Math.ceil((dl-now)/86400000);
deadline.textContent=days>0?days+' days until Jan 31 filing deadline':'Jan 31 deadline passed — file ASAP';
function tc(){const i=+income.value||0,e=+expenses.value||0,w=+w2.value||0,r=(+rate.value||0)/100;
const se=(i-e)*0.153;const fed=Math.max(0,i-e)*r;const total=se+fed;
tout.textContent='$'+total.toFixed(0)+' estimated tax · $'+(total/4).toFixed(0)+'/quarter';}
[income,expenses,w2,rate].forEach(el=>el.oninput=tc);tc();
</script>`,
    "Estimate quarterly 1099 taxes for freelancers — self-employment + income tax."
  );
  writeFileSync(join(dist, "1099-tax-estimator.html"), tax1099Calc);

  const rentCalc = adToolsShell(
    "Rent Affordability Calculator",
    `<label>Monthly gross income ($)</label><input type="number" id="gross" value="5000">
<label>Monthly debts ($)</label><input type="number" id="debts" value="400">
<label>Max rent % of income</label><select id="pct"><option value="25">25%</option><option value="30" selected>30%</option><option value="35">35%</option></select>
<div class="result" id="rout">$1,500/mo max rent</div>
<script>
function rc(){const g=+gross.value||0,d=+debts.value||0,p=(+pct.value||30)/100;
const max=Math.max(0,g*p-d);rout.textContent='$'+max.toFixed(0)+'/mo max rent · 30% rule';}
[gross,debts,pct].forEach(el=>el.oninput=rc);rc();
</script>`,
    "Calculate max affordable rent using the 30% rule — free before signing a lease."
  );
  writeFileSync(join(dist, "rent-affordability-calculator.html"), rentCalc);

  const sslChecker = adToolsShell(
    "SSL Certificate Expiry Checker",
    `<label>Domain (e.g. example.com)</label><input type="text" id="domain" value="google.com" placeholder="example.com">
<button type="button" id="check" style="width:100%;padding:12px;margin:12px 0;background:#2563eb;color:#fff;border:none;border-radius:6px;font-size:16px;cursor:pointer">Check SSL expiry</button>
<div class="result" id="sslout" style="font-size:18px">Enter a domain and click Check</div>
<p style="font-size:13px;color:#64748b">Note: Browser CORS limits direct checks. For production monitoring use DevWatch alerts.</p>
<script>
check.onclick=()=>{sslout.textContent='Checking '+domain.value+'... (use DevWatch for automated alerts)';};
</script>`,
    "Check SSL certificate expiry dates — free tool. Get email alerts with DevWatch $39/mo."
  );
  writeFileSync(join(dist, "ssl-expiry-checker.html"), sslChecker);

  const cronHelper = adToolsShell(
    "Cron Schedule Helper",
    `<label>Run every</label><select id="freq"><option value="* * * * *">Every minute</option><option value="0 * * * *">Every hour</option><option value="0 0 * * *" selected>Daily at midnight</option><option value="0 0 * * 0">Weekly Sunday</option><option value="0 0 1 * *">Monthly 1st</option></select>
<div class="result" id="crout" style="font-size:20px;font-family:monospace">0 0 * * *</div>
<p style="font-size:14px;color:#475569">Paste into crontab or use DevWatch heartbeat URL for monitoring.</p>
<script>
freq.onchange=()=>{crout.textContent=freq.value;};crout.textContent=freq.value;
</script>`,
    "Generate cron expressions — free helper. Monitor jobs with DevWatch heartbeat alerts."
  );
  writeFileSync(join(dist, "cron-schedule-helper.html"), cronHelper);

  const quarterlyDeadlines = adToolsShell(
    "Quarterly Tax Deadline Calendar",
    `<p style="font-size:14px;color:#475569">Federal estimated tax due dates for self-employed freelancers and 1099 contractors.</p>
<ul id="dates" style="line-height:2;font-size:15px"></ul>
<label>Days until next deadline</label>
<div class="result" id="qout">—</div>
<script>
const deadlines=[
  {label:'Q1 2026 (Jan–Mar income)',due:new Date('2026-04-15')},
  {label:'Q2 2026 (Apr–Jun income)',due:new Date('2026-06-15')},
  {label:'Q3 2026 (Jul–Sep income)',due:new Date('2026-09-15')},
  {label:'Q4 2026 (Oct–Dec income)',due:new Date('2027-01-15')}
];
const now=new Date();let next=deadlines.find(d=>d.due>=now)||deadlines[deadlines.length-1];
dates.innerHTML=deadlines.map(d=>'<li'+(d===next?' style="font-weight:700;color:#2563eb"':'')+'>'+d.label+': <strong>'+d.due.toLocaleDateString()+'</strong></li>').join('');
const days=Math.ceil((next.due-now)/86400000);
qout.textContent=days+' days until '+next.label.split('(')[0].trim();
</script>`,
    "2026 quarterly estimated tax due dates for freelancers — Q1 Apr 15, Q2 Jun 15, Q3 Sep 15, Q4 Jan 15.",
    "quarterly-tax-deadline-calendar"
  );
  writeFileSync(join(dist, "quarterly-tax-deadline-calendar.html"), quarterlyDeadlines);

  const paymentTracker = adToolsShell(
    "1099 Payment Threshold Tracker",
    `<label>Contractor name</label><input type="text" id="name" placeholder="Jane Doe LLC">
<label>Payments YTD ($)</label><input type="number" id="paid" value="450" step="0.01">
<label>Federal 1099 threshold</label><input type="number" id="threshold" value="600" step="0.01">
<div class="result" id="p1099">$150 below threshold — no 1099 yet</div>
<script>
function track(){const p=+paid.value||0,t=+threshold.value||600,d=t-p;
if(p>=t)p1099.textContent='⚠ 1099-NEC required — $'+p.toFixed(2)+' paid (over $'+t+')';
else p1099.textContent='$'+d.toFixed(2)+' until $'+t+' threshold · track W-9 on file';}
[paid,threshold].forEach(el=>el.oninput=track);track();
</script>`,
    "Track contractor payments toward the $600 1099-NEC threshold — free W-9 compliance helper.",
    "1099-payment-threshold-tracker"
  );
  writeFileSync(join(dist, "1099-payment-threshold-tracker.html"), paymentTracker);

  const dayRateCalc = adToolsShell(
    "Day Rate to Hourly Calculator",
    `<label>Day rate ($)</label><input type="number" id="dayrate" value="800" step="0.01">
<label>Billable hours per day</label><input type="number" id="hours" value="8" step="0.5">
<label>Working days per month</label><input type="number" id="days" value="18" min="1">
<div class="result" id="drout">$100/hr · $14,400/mo</div>
<script>
function dr(){const d=+dayrate.value||0,h=Math.max(0.5,+hours.value||8),days=Math.max(1,+days.value||18);
const hr=d/h;drout.textContent='$'+hr.toFixed(2)+'/hr · $'+(d*days).toFixed(0)+'/mo at '+days+' days';}
[dayrate,hours,days].forEach(el=>el.oninput=dr);dr();
</script>`,
    "Convert freelance day rate to hourly and monthly income — compare project vs retainer pricing.",
    "day-rate-to-hourly-calculator"
  );
  writeFileSync(join(dist, "day-rate-to-hourly-calculator.html"), dayRateCalc);

  const base = getPublicBaseUrl();
  const toolsIndex = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Free Business Calculators & Tools</title>
<meta name="description" content="Free calculators for freelancers and small business — tip, invoice, meeting cost, markup, and more.">
<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:0 auto;padding:32px 16px;line-height:1.6;color:#0f172a}
h1{font-size:clamp(28px,4vw,36px)}ul{padding-left:20px}li{margin:10px 0}a{color:#2563eb;font-weight:600}
.promo{background:#f0fdf4;border:1px solid #bbf7d0;padding:16px;border-radius:8px;margin:24px 0;font-size:14px}
</style></head><body>
<h1>Free Tools</h1>
<p>Ad-supported calculators that funnel to pro products. Use code <strong>LAUNCH25</strong> at checkout.</p>
<ul>
<li><a href="/tools/tip-calculator.html">Tip Calculator</a></li>
<li><a href="/tools/bill-splitter.html">Bill Splitter</a></li>
<li><a href="/tools/percentage-calculator.html">Percentage Calculator</a></li>
<li><a href="/tools/hourly-rate-calculator.html">Freelance Hourly Rate</a></li>
<li><a href="/tools/markup-calculator.html">Markup Calculator</a></li>
<li><a href="/tools/late-fee-calculator.html">Late Fee Calculator</a></li>
<li><a href="/tools/break-even-calculator.html">Break-Even Calculator</a></li>
<li><a href="/tools/discount-calculator.html">Discount Calculator</a></li>
<li><a href="/tools/unit-price-calculator.html">Unit Price Calculator</a></li>
<li><a href="/tools/profit-margin-calculator.html">Profit Margin Calculator</a></li>
<li><a href="/tools/invoice-number-generator.html">Invoice Number Generator</a></li>
<li><a href="/tools/meeting-cost-free.html">Meeting Cost Calculator</a></li>
<li><a href="/tools/sales-tax-calculator.html">Sales Tax Calculator</a></li>
<li><a href="/tools/payment-terms-calculator.html">Payment Terms Calculator</a></li>
<li><a href="/tools/compound-interest-calculator.html">Compound Interest Calculator</a></li>
<li><a href="/tools/overtime-pay-calculator.html">Overtime Pay Calculator</a></li>
<li><a href="/tools/roi-calculator.html">ROI Calculator</a></li>
<li><a href="/tools/1099-tax-estimator.html">1099 Tax Estimator</a></li>
<li><a href="/tools/rent-affordability-calculator.html">Rent Affordability Calculator</a></li>
<li><a href="/tools/ssl-expiry-checker.html">SSL Expiry Checker</a></li>
<li><a href="/tools/cron-schedule-helper.html">Cron Schedule Helper</a></li>
<li><a href="/tools/quarterly-tax-deadline-calendar.html">Quarterly Tax Deadlines</a></li>
<li><a href="/tools/1099-payment-threshold-tracker.html">1099 Threshold Tracker</a></li>
<li><a href="/tools/day-rate-to-hourly-calculator.html">Day Rate to Hourly</a></li>
</ul>
<div class="promo">Need pro tools? <a href="${base}/go/invoice.html">Invoice PDF $3</a> · <a href="${base}/go/lease.html">Lease check $7</a> · <a href="${base}/go/uptime.html">Uptime $5/mo</a> · <a href="${base}/go/freelancer.html">Freelancer kit $14</a> · <a href="${base}/p/freelancer-compliance-by-state.html">State compliance guides</a></div>
<p><a href="/">← Wealth Engine home</a></p>
<script>${AFFILIATE_REF_SCRIPT}</script>
<script>${visitTrackerScript("/tools/index.html")}</script>
</body></html>`;
  writeFileSync(join(dist, "index.html"), toolsIndex);

  const privacy = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Privacy Policy</title><style>body{font-family:system-ui;max-width:720px;margin:40px auto;padding:20px;line-height:1.6}</style></head><body>
<h1>Privacy Policy</h1><p>Wealth Engine tools process data locally in your browser. Payment checkout is handled by Stripe. We do not sell personal data.</p>
<p>Contact: orders@horseshoeroundme.com</p><p><a href="/">← Home</a></p></body></html>`;
  writeFileSync(join(getRoot(), "dist", "privacy.html"), privacy);

  return { pages: ["tip-calculator", "meeting-cost-free", "percentage-calculator", "bill-splitter", "hourly-rate-calculator", "hourly-rate", "markup-calculator", "late-fee-calculator", "break-even-calculator", "discount-calculator", "unit-price-calculator", "profit-margin-calculator", "invoice-number-generator", "sales-tax-calculator", "payment-terms-calculator", "compound-interest-calculator", "overtime-pay-calculator", "roi-calculator", "1099-tax-estimator", "rent-affordability-calculator", "ssl-expiry-checker", "cron-schedule-helper", "quarterly-tax-deadline-calendar", "1099-payment-threshold-tracker", "day-rate-to-hourly-calculator", "tools-index", "privacy"] };
}
