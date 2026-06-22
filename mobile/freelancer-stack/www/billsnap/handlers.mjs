export async function handleBillSnap(path, req, url) {
  if (path === "/api/billsnap/preview" && req.method === "POST") {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const data = JSON.parse(Buffer.concat(chunks).toString());
    const html = renderInvoiceHtml(data, { watermark: true });
    return { status: 200, headers: { "Content-Type": "text/html" }, body: html };
  }

  if (path === "/api/billsnap/pdf" && req.method === "POST") {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = JSON.parse(Buffer.concat(chunks).toString());
    const { license } = body;
    if (!license) {
      return { status: 402, body: JSON.stringify({ error: "license_required", checkout: "{{PAY:pro-pdf}}" }) };
    }
    const { redeemLicense } = await import("../../core/commerce.mjs");
    const r = redeemLicense(license, "billsnap");
    if (!r.ok) return { status: 403, body: JSON.stringify({ error: r.error }) };
    const html = renderInvoiceHtml(body.invoice, { watermark: false });
    return { status: 200, headers: { "Content-Type": "text/html" }, body: html };
  }

  return { status: 404, body: JSON.stringify({ error: "not_found" }) };
}

function renderInvoiceHtml(inv, { watermark }) {
  const items = (inv.items ?? []).map(
    (i) => `<tr><td>${esc(i.desc)}</td><td>${i.qty}</td><td>$${i.rate.toFixed(2)}</td><td>$${(i.qty * i.rate).toFixed(2)}</td></tr>`
  ).join("");
  const sub = (inv.items ?? []).reduce((s, i) => s + i.qty * i.rate, 0);
  const wm = watermark ? `<div style="position:fixed;top:40%;left:10%;font-size:80px;opacity:.08;transform:rotate(-30deg)">PREVIEW</div>` : "";
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoice ${esc(inv.number ?? "001")}</title>
<style>body{font-family:Georgia,serif;padding:40px;color:#111}table{width:100%;border-collapse:collapse;margin:20px 0}td,th{border:1px solid #ccc;padding:8px;text-align:left}th{background:#f5f5f5}.total{font-size:20px;font-weight:bold}</style></head>
<body>${wm}
<h1>INVOICE</h1>
<p><strong>From:</strong> ${esc(inv.from ?? "")}<br><strong>To:</strong> ${esc(inv.to ?? "")}<br><strong>Date:</strong> ${esc(inv.date ?? new Date().toISOString().slice(0, 10))}<br><strong>#</strong> ${esc(inv.number ?? "001")}</p>
<table><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>${items}</table>
<p class="total">Total: $${sub.toFixed(2)}</p>
${watermark ? `<p style="color:#666;margin-top:40px">Purchase Pro PDF to remove watermark — $3</p>` : ""}
<script>if(!${watermark}) window.print()</script>
</body></html>`;
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
