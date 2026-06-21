import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";
import { getRoot } from "../env.mjs";

function loadAffiliateConfig() {
  return JSON.parse(readFileSync(join(getRoot(), "config", "affiliates.json"), "utf8"));
}

const sharedStyles = `
body{font-family:system-ui,-apple-system,sans-serif;max-width:720px;margin:0 auto;padding:24px 20px 48px;line-height:1.6;color:#0f172a;background:#f8fafc}
h1{color:#1e40af;font-size:1.75rem;margin:0 0 8px}
h2{color:#334155;font-size:1.15rem;margin:28px 0 12px;border-bottom:1px solid #e2e8f0;padding-bottom:6px}
.lead{color:#64748b;margin-bottom:24px}
.card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:16px 0;box-shadow:0 1px 3px rgba(0,0,0,.04)}
.code{background:#f0fdf4;border:1px solid #bbf7d0;padding:14px 16px;border-radius:8px;font-family:ui-monospace,monospace;font-size:15px;word-break:break-all;margin:12px 0}
.btn{display:inline-block;background:#2563eb;color:#fff;padding:12px 20px;text-decoration:none;border-radius:8px;font-weight:600;margin:6px 6px 6px 0;border:none;cursor:pointer;font-size:15px}
.btn:hover{background:#1d4ed8}
.btn.secondary{background:#fff;color:#2563eb;border:1px solid #2563eb}
.btn.secondary:hover{background:#eff6ff}
.btn.green{background:#16a34a}.btn.green:hover{background:#15803d}
table{width:100%;border-collapse:collapse;font-size:14px;margin:12px 0}
th,td{text-align:left;padding:10px 8px;border-bottom:1px solid #e2e8f0}
th{color:#64748b;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.04em}
.disclosure{font-size:13px;color:#64748b;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin:20px 0}
input[type=email],input[type=text]{width:100%;padding:12px;margin:8px 0 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:16px;box-sizing:border-box}
.ok{display:none;color:#059669;margin-top:12px;font-weight:600}
.nav{font-size:14px;margin-bottom:24px}
.nav a{color:#2563eb;margin-right:16px}
.tag{display:inline-block;background:#dbeafe;color:#1e40af;font-size:11px;font-weight:700;padding:3px 8px;border-radius:4px;text-transform:uppercase;letter-spacing:.05em}
.grid{display:grid;gap:12px;margin:16px 0}
@media(min-width:560px){.grid{grid-template-columns:1fr 1fr}}
`;

function commissionTable(cfg) {
  const subs = cfg.products.filter((p) => p.type === "subscription");
  const oneTime = cfg.products.filter((p) => p.type === "oneTime");
  return `
<table>
<thead><tr><th>Product</th><th>Price</th><th>Your commission</th></tr></thead>
<tbody>
${subs
  .map(
    (p) =>
      `<tr><td>${p.name}</td><td>$${p.priceUsd}/mo</td><td>$${(p.priceUsd * cfg.commissions.subscription.rate).toFixed(2)}/mo × ${cfg.commissions.subscription.months}mo</td></tr>`
  )
  .join("\n")}
${oneTime.map((p) => `<tr><td>${p.name}</td><td>$${p.priceUsd}</td><td>$${cfg.commissions.oneTime.flatUsd} flat</td></tr>`).join("\n")}
</tbody>
</table>
<p style="font-size:13px;color:#64748b">${cfg.commissions.subscription.description}. ${cfg.commissions.oneTime.description}. ${cfg.program.cookieDays}-day first-click cookie. ${cfg.program.payoutHoldDays}-day hold before payout.</p>`;
}

export function buildReferralPages() {
  const distDir = join(getRoot(), "dist");
  const partnersDir = join(distDir, "partners");
  mkdirSync(partnersDir, { recursive: true });
  const cfg = loadAffiliateConfig();

  const starterLinks = cfg.starterLinks
    .map(
      (l) => `
<div class="card">
<strong>${l.label}</strong>
<p style="font-size:14px;color:#64748b;margin:8px 0">${l.pitch}</p>
<div class="code link-preview" data-path="${l.path}">/?ref=YOURCODE on ${l.path}</div>
<a class="btn secondary" href="${l.path}">Preview landing →</a>
</div>`
    )
    .join("");

  const partners = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Partner Program — Wealth Engine</title>
<meta name="description" content="Earn 25% recurring for 12 months promoting BillSnap, HookRelay, DevWatch, and 161 portfolio URLs. Self-serve signup in under 5 minutes.">
<style>${sharedStyles}
.hero{background:linear-gradient(135deg,#1e3a8a,#2563eb);color:#fff;border-radius:16px;padding:28px 24px;margin-bottom:24px}
.hero h1{color:#fff;font-size:1.85rem}
.hero .lead{color:#bfdbfe}
.hero .tag{background:rgba(255,255,255,.2);color:#fff}
.steps{counter-reset:step}
.step{counter-increment:step;padding-left:36px;position:relative;margin:12px 0}
.step::before{content:counter(step);position:absolute;left:0;top:0;width:24px;height:24px;background:#2563eb;color:#fff;border-radius:50%;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center}
</style></head><body>
<div class="nav"><a href="/">← Portfolio</a><a href="/refer.html">Your links</a><a href="/join.html">LAUNCH25 list</a></div>

<div class="hero">
<span class="tag">Partner program</span>
<h1>Earn 25% recurring across the portfolio</h1>
<p class="lead">One signup. 161 URLs. BillSnap, HookRelay, DevWatch, CompareStack, and more. Live referral link in under 5 minutes — no manual approval.</p>
</div>

<div class="disclosure">${cfg.program.ftcDisclosure}</div>

<h2>Commission structure</h2>
${commissionTable(cfg)}

<h2>How it works</h2>
<div class="card steps">
<div class="step"><strong>Sign up</strong> — enter your email below; we generate your unique <code>?ref=</code> code instantly.</div>
<div class="step"><strong>Share links</strong> — append <code>?ref=YOURCODE</code> to any portfolio URL (90-day cookie).</div>
<div class="step"><strong>Get paid</strong> — commissions credited on Stripe checkout; payouts via Stripe Connect (coming soon) or PayPal monthly.</div>
</div>

<h2>Join the program</h2>
<div class="card">
<label for="name">Name (optional)</label>
<input type="text" id="name" placeholder="Alex Rivera">
<label for="email">Email</label>
<input type="email" id="email" placeholder="you@newsletter.com" required>
<button class="btn green" id="signup" style="width:100%">Get my partner link →</button>
<p class="ok" id="ok"></p>
<p style="font-size:12px;color:#94a3b8;margin-top:12px">By joining you agree to our FTC disclosure requirements and no brand-bidding on paid search without approval. W-9 collected before $${cfg.program.taxFormThresholdUsd}/yr in payouts.</p>
</div>

<h2>Starter kit — deep links</h2>
<p class="lead">Copy these after signup. Replace YOURCODE with your partner code.</p>
${starterLinks}

<h2>Payouts</h2>
<div class="card">
<p><strong>Stripe Connect</strong> — self-serve onboarding placeholder. Connect your Stripe account to receive automatic monthly payouts (min $${cfg.program.minPayoutUsd}).</p>
<button class="btn secondary" disabled title="Stripe Connect onboarding coming soon">Connect Stripe (coming soon)</button>
<p style="font-size:13px;color:#64748b;margin-top:12px">Until Connect is live, commissions accrue in your dashboard and are paid manually via PayPal on the 1st of each month.</p>
</div>

<script>
document.getElementById('signup').onclick=async()=>{
  const email=document.getElementById('email').value;
  const name=document.getElementById('name').value;
  if(!email.includes('@')){alert('Enter a valid email');return;}
  const r=await fetch('/api/affiliate/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,name})});
  const d=await r.json();
  if(!d.ok){alert(d.error||'Signup failed');return;}
  localStorage.setItem('we_partner_code',d.code);
  document.getElementById('ok').style.display='block';
  document.getElementById('ok').innerHTML='Your code: <strong>'+d.code+'</strong> — <a href="/refer.html?code='+d.code+'">Open your dashboard →</a>';
  document.querySelectorAll('.link-preview').forEach(el=>{
    const path=el.dataset.path;
    el.textContent=location.origin+path+'?ref='+d.code;
  });
};
</script>
<p style="margin-top:32px;font-size:13px"><a href="/privacy.html">Privacy</a></p>
</body></html>`;

  const refer = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your referral links — Wealth Engine Partners</title>
<style>${sharedStyles}
.stat{display:inline-block;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;margin:6px 6px 6px 0;min-width:100px}
.stat strong{display:block;font-size:22px;color:#1e40af}
.stat span{font-size:12px;color:#64748b;text-transform:uppercase}
</style></head><body>
<div class="nav"><a href="/partners/">Partner program</a><a href="/">← Portfolio</a></div>
<h1>Your referral dashboard</h1>
<p class="lead">Share any link below. We track clicks for 90 days via first-click cookie.</p>

<div id="stats" style="display:none">
<div class="stat"><strong id="clicks">0</strong><span>Clicks</span></div>
<div class="stat"><strong id="conversions">0</strong><span>Conversions</span></div>
<div class="stat"><strong id="pending">$0</strong><span>Pending</span></div>
</div>

<label for="code">Partner code</label>
<input type="text" id="code" placeholder="Enter your code or sign up at /partners/">
<button class="btn" id="load">Load my links</button>

<div id="panel" style="display:none">
<h2>Primary link</h2>
<div class="code" id="primary">/?ref=</div>
<button class="btn secondary" id="copy">Copy link</button>

<h2>Top converters</h2>
<div class="grid" id="links"></div>

<h2>FTC disclosure (paste on your site)</h2>
<div class="code" id="ftc">${cfg.program.ftcDisclosure}</div>
<button class="btn secondary" id="copyFtc">Copy disclosure</button>
</div>

<p style="margin-top:24px">New partner? <a href="/partners/">Join the program →</a></p>

<script>
const base=location.origin;
const products=${JSON.stringify(cfg.starterLinks)};

function buildLinks(code){
  document.getElementById('panel').style.display='block';
  document.getElementById('primary').textContent=base+'/?ref='+code;
  const grid=document.getElementById('links');
  grid.innerHTML=products.map(p=>
    '<div class="card"><strong>'+p.label+'</strong><div class="code">'+base+p.path+'?ref='+code+'</div></div>'
  ).join('');
  localStorage.setItem('we_partner_code',code);
}

async function loadStats(code){
  const r=await fetch('/api/affiliate/stats?code='+encodeURIComponent(code));
  const d=await r.json();
  if(!d.ok)return;
  document.getElementById('stats').style.display='block';
  document.getElementById('clicks').textContent=d.clicks;
  document.getElementById('conversions').textContent=d.conversions;
  document.getElementById('pending').textContent='$'+Number(d.commissionPendingUsd).toFixed(2);
}

document.getElementById('load').onclick=async()=>{
  const code=(document.getElementById('code').value||'').trim()||localStorage.getItem('we_partner_code')||'';
  if(!code){alert('Enter your partner code or sign up at /partners/');return;}
  buildLinks(code);
  await loadStats(code);
};

document.getElementById('copy').onclick=()=>{
  navigator.clipboard.writeText(document.getElementById('primary').textContent);
  alert('Copied!');
};
document.getElementById('copyFtc').onclick=()=>{
  navigator.clipboard.writeText(document.getElementById('ftc').textContent);
  alert('Disclosure copied!');
};

const params=new URLSearchParams(location.search);
const fromUrl=params.get('code')||localStorage.getItem('we_partner_code');
if(fromUrl){
  document.getElementById('code').value=fromUrl;
  buildLinks(fromUrl);
  loadStats(fromUrl);
}
</script>
</body></html>`;

  const joinPage = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Join — LAUNCH25 deals & Partner Program</title>
<style>${sharedStyles}
.tabs{display:flex;gap:8px;margin-bottom:20px}
.tab{flex:1;padding:12px;border:2px solid #e2e8f0;background:#fff;border-radius:8px;cursor:pointer;font-weight:600;text-align:center;font-size:14px}
.tab.active{border-color:#2563eb;background:#eff6ff;color:#1e40af}
.panel{display:none}.panel.active{display:block}
</style></head><body>
<div class="nav"><a href="/">← Portfolio</a><a href="/partners/">Partner program</a><a href="/refer.html">Your links</a></div>

<h1>Join Wealth Engine</h1>
<p class="lead">Get launch deals or earn 25% recurring as a portfolio partner.</p>

<div class="tabs">
<button class="tab active" data-tab="deals">LAUNCH25 deals</button>
<button class="tab" data-tab="partner">Partner program</button>
</div>

<div class="panel active" id="deals">
<div class="card">
<p>New tool launches + <strong>25% off</strong> with code LAUNCH25 at checkout. No spam.</p>
<input type="email" id="email" placeholder="you@email.com">
<button class="btn green" id="go" style="width:100%">Join insider list</button>
<p class="ok" id="ok">You're in! Use LAUNCH25 at checkout today.</p>
</div>
</div>

<div class="panel" id="partner">
<div class="card">
<span class="tag">25% × 12 months</span>
<p>Earn recurring commissions on BillSnap ($29/mo), HookRelay ($29/mo), DevWatch ($39/mo), and 161 portfolio URLs. Self-serve — live link in under 5 minutes.</p>
<ul style="font-size:14px;color:#475569;padding-left:20px">
<li>25% recurring for 12 months on subscriptions</li>
<li>$1 flat on $3–$7 one-time purchases</li>
<li>90-day attribution cookie · sub-ID via <code>?ref=</code></li>
</ul>
<input type="text" id="pname" placeholder="Name (optional)">
<input type="email" id="pemail" placeholder="you@site.com">
<button class="btn" id="partnerGo" style="width:100%">Get my partner link →</button>
<p class="ok" id="pok"></p>
<p style="font-size:13px;margin-top:12px"><a href="/partners/">Full commission table & starter kit →</a></p>
</div>
<div class="disclosure">${cfg.program.ftcDisclosure}</div>
</div>

<script>
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));
  t.classList.add('active');
  document.getElementById(t.dataset.tab).classList.add('active');
});
if(location.hash==='#partner'){
  document.querySelector('[data-tab=partner]').click();
}
document.getElementById('go').onclick=async()=>{
  const email=document.getElementById('email').value;
  if(!email.includes('@')){alert('Enter a valid email');return;}
  await fetch('/api/funnel/email_capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,path:'/join'})});
  document.getElementById('ok').style.display='block';
};
document.getElementById('partnerGo').onclick=async()=>{
  const email=document.getElementById('pemail').value;
  const name=document.getElementById('pname').value;
  if(!email.includes('@')){alert('Enter a valid email');return;}
  const r=await fetch('/api/affiliate/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,name})});
  const d=await r.json();
  if(!d.ok){alert(d.error||'Signup failed');return;}
  localStorage.setItem('we_partner_code',d.code);
  document.getElementById('pok').style.display='block';
  document.getElementById('pok').innerHTML='Code <strong>'+d.code+'</strong> — <a href="/refer.html?code='+d.code+'">Open dashboard →</a>';
};
</script>
<p style="margin-top:24px;font-size:13px"><a href="/privacy.html">Privacy</a></p>
</body></html>`;

  writeFileSync(join(distDir, "refer.html"), refer);
  writeFileSync(join(distDir, "join.html"), joinPage);
  writeFileSync(join(partnersDir, "index.html"), partners);
  return { pages: ["refer", "join", "partners/index"] };
}
