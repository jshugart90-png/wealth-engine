import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getRoot, getPublicBaseUrl } from "../env.mjs";

export function buildReferralPages() {
  const distDir = join(getRoot(), "dist");
  const base = getPublicBaseUrl();

  const refer = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Refer a friend — LAUNCH25</title>
<style>body{font-family:system-ui;max-width:640px;margin:40px auto;padding:20px;line-height:1.6}
h1{color:#2563eb}.code{background:#f0fdf4;border:1px solid #bbf7d0;padding:16px;border-radius:8px;font-family:monospace;font-size:18px;margin:16px 0}
.btn{display:inline-block;background:#2563eb;color:#fff;padding:12px 20px;text-decoration:none;border-radius:8px;font-weight:600;margin:8px 4px 8px 0}
</style></head><body>
<h1>Share Wealth Engine tools</h1>
<p>Send freelancers and founders to our invoice, lease, and uptime tools. They save 25% with code <strong>LAUNCH25</strong> at checkout.</p>
<p>Add <code>?ref=YOURCODE</code> to any link to track referrals (optional).</p>
<div class="code">${base}/go/invoice.html?ref=share</div>
<a class="btn" href="${base}/go/invoice.html">Invoice PDF $3</a>
<a class="btn" href="${base}/go/lease.html">Lease check $7</a>
<a class="btn" href="${base}/go/uptime.html">Uptime $5/mo</a>
<p style="margin-top:32px"><a href="${base}/">← All products</a></p>
</body></html>`;

  const joinPage = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Get LAUNCH25 deals — Wealth Engine</title>
<style>body{font-family:system-ui;max-width:480px;margin:40px auto;padding:20px;text-align:center}
input{width:100%;padding:12px;margin:12px 0;border:1px solid #cbd5e1;border-radius:8px;font-size:16px}
button{background:#22c55e;color:#fff;border:none;padding:14px 24px;border-radius:8px;font-size:16px;font-weight:700;cursor:pointer;width:100%}
.ok{display:none;color:#059669;margin-top:16px;font-weight:600}
</style></head><body>
<h1>LAUNCH25 insider list</h1>
<p style="color:#64748b">New tool launches + 25% off codes. No spam — unsubscribe anytime.</p>
<input type="email" id="email" placeholder="you@email.com">
<button id="go">Join list</button>
<p class="ok" id="ok">You're in! Use LAUNCH25 at checkout today.</p>
<script>
document.getElementById('go').onclick=async()=>{
  const email=document.getElementById('email').value;
  if(!email.includes('@')){alert('Enter a valid email');return;}
  await fetch('/api/funnel/email_capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,path:'/join'})});
  document.getElementById('ok').style.display='block';
};
</script>
<p style="margin-top:24px;font-size:13px"><a href="${base}/privacy.html">Privacy</a> · <a href="${base}/">Home</a></p>
</body></html>`;

  writeFileSync(join(distDir, "refer.html"), refer);
  writeFileSync(join(distDir, "join.html"), joinPage);
  return { pages: ["refer", "join"] };
}
