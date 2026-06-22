const RED_FLAGS = [
  { pattern: /automatic renewal|auto-?renew/i, severity: "high", title: "Automatic renewal clause", tip: "Ask for opt-in renewal instead of opt-out." },
  { pattern: /landlord.?s sole discretion|at landlord.?s discretion/i, severity: "medium", title: "Landlord discretion language", tip: "Vague discretion can hide unfair terms." },
  { pattern: /waive.*jury|binding arbitration/i, severity: "high", title: "Jury waiver / forced arbitration", tip: "You may lose ability to sue in court." },
  { pattern: /non-?refundable.*deposit|deposit.*non-?refundable/i, severity: "medium", title: "Non-refundable deposit", tip: "Check local law — many states cap or restrict this." },
  { pattern: /entry without notice|enter.*without.*notice|24 hour/i, severity: "medium", title: "Entry / notice terms", tip: "Verify notice period matches your state minimum." },
  { pattern: /fee.*late|late.*fee.*\$?\d+/i, severity: "low", title: "Late fee specified", tip: "Compare to state legal maximum for late fees." },
  { pattern: /sublet|assign.*without.*consent/i, severity: "low", title: "Subletting restriction", tip: "May affect roommates and Airbnb plans." },
  { pattern: /holdover|double rent|month-?to-?month.*\d+%/i, severity: "high", title: "Holdover / penalty rent", tip: "Penalties after lease end can be costly." },
  { pattern: /repair.*tenant|tenant.*maintain/i, severity: "medium", title: "Tenant maintenance duties", tip: "Ensure HVAC/plumbing aren't entirely on you." },
  { pattern: /liquidated damages/i, severity: "high", title: "Liquidated damages", tip: "Pre-set break-lease fees — verify reasonableness." },
];

export async function handleLeaseLens(path, req, url) {
  if (path === "/api/leaselens/analyze" && req.method === "POST") {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const { text, license } = JSON.parse(Buffer.concat(chunks).toString());
    const preview = analyze(text, { full: false });

    if (!license) {
      return { status: 200, body: { preview, upgrade: "{{PAY:single-report}}" } };
    }
    const { redeemLicense } = await import("../../core/commerce.mjs");
    const r = redeemLicense(license, "leaselens");
    if (!r.ok) return { status: 403, body: { error: r.error } };
    return { status: 200, body: { report: analyze(text, { full: true }) } };
  }
  return { status: 404, body: { error: "not_found" } };
}

function analyze(text, { full }) {
  const flags = [];
  for (const rule of RED_FLAGS) {
    if (rule.pattern.test(text)) flags.push(rule);
  }
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const score = Math.max(0, 100 - flags.filter((f) => f.severity === "high").length * 15 - flags.filter((f) => f.severity === "medium").length * 8);

  const report = {
    score,
    wordCount,
    flagCount: flags.length,
    summary: score >= 70 ? "Moderate risk — review flagged clauses." : score >= 40 ? "Elevated risk — negotiate or consult tenant org." : "High risk — strong negotiation recommended.",
    flags: full ? flags : flags.slice(0, 3),
    truncated: !full && flags.length > 3,
  };
  return report;
}
