import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getRoot, getPublicBaseUrl } from "../env.mjs";

export function buildEmbedWidgets() {
  const dist = join(getRoot(), "dist", "embed");
  mkdirSync(dist, { recursive: true });
  const base = getPublicBaseUrl();

  const meetingWidget = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:system-ui;margin:0;padding:12px;font-size:14px}
input{width:60px;padding:4px}button{background:#2563eb;color:#fff;border:none;padding:8px 12px;cursor:pointer;border-radius:4px}
#r{margin-top:8px;font-weight:bold;color:#dc2626}a{font-size:11px;color:#666}</style></head><body>
<label>People <input type="number" id="n" value="8" min="1"></label>
<label>$/hr <input type="number" id="r" value="75" min="1"></label>
<label>Min <input type="number" id="m" value="60" min="1"></label>
<button type="button" onclick="calc()">Calc</button><div id="res"></div>
<a href="${base}/meetingcost/index.html" target="_blank">Full tool →</a>
<script>function calc(){var p=+document.getElementById('n').value||8,r=+document.getElementById('r').value||75,m=+document.getElementById('m').value||60;document.getElementById('res').textContent='$'+Math.round(p*r*m/60);}</script>
</body></html>`;

  const embedCode = `<iframe src="${base}/embed/meeting.html" width="320" height="120" frameborder="0"></iframe>`;

  writeFileSync(join(dist, "meeting.html"), meetingWidget);
  writeFileSync(join(dist, "embed-code.html"), `<!DOCTYPE html><html><body><h3>Embed this (free):</h3><textarea rows="3" cols="60">${esc(embedCode)}</textarea><hr>${embedCode}</body></html>`);
  return { widgets: 2, embedUrl: "/embed/embed-code.html" };
}

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}
