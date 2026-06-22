const REGIONAL_BENCHMARKS = {
  south: {
    label: "South",
    basePerSqft: 175,
    laborFactor: 0.94,
    permitFactor: 0.028,
    note: "Lower median labor and land-development pressure in many Sun Belt markets",
  },
  midwest: {
    label: "Midwest",
    basePerSqft: 185,
    laborFactor: 0.98,
    permitFactor: 0.03,
    note: "Balanced labor and material costs across many non-coastal metros",
  },
  northeast: {
    label: "Northeast",
    basePerSqft: 260,
    laborFactor: 1.2,
    permitFactor: 0.045,
    note: "Higher labor, code, and site logistics in dense legacy markets",
  },
  west: {
    label: "West",
    basePerSqft: 285,
    laborFactor: 1.28,
    permitFactor: 0.052,
    note: "Higher labor, wildfire/seismic detailing, and entitlement costs",
  },
};

const MULTIPLIERS = {
  quality: { standard: 1, upgraded: 1.22, premium: 1.48 },
  buildType: { single: 1, basement: 1.2, bunker: 1.42, multi: 1.16 },
  scope: { newBuild: 1, renovation: 0.62, addition: 1.28 },
  complexity: { simple: 0.93, normal: 1, complex: 1.18 },
  site: { easy: 0.96, normal: 1, difficult: 1.14 },
};

const COMPONENT_SPLIT = [
  ["sitePrep", "Sitework, utilities, drainage", 0.08],
  ["foundation", "Foundation and below-grade work", 0.13],
  ["structure", "Framing and structural shell", 0.18],
  ["envelope", "Roofing, windows, facade", 0.15],
  ["mep", "Mechanical, electrical, plumbing", 0.18],
  ["interiors", "Interior finishes and fixtures", 0.21],
  ["softCosts", "Design, permits, survey, contingency", 0.07],
];

const BENCHMARK_SOURCE =
  "Benchmark blend from NAHB construction cost survey categories, HomeGuide/Angi public 2025-2026 cost-per-square-foot ranges, regional labor factors, and optional BLS PPI material-index refresh.";

async function readJsonBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw);
}

function pick(map, key, fallback) {
  return Object.hasOwn(map, key) ? map[key] : fallback;
}

function cleanNumber(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

async function getMaterialIndexFactor() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1600);
  try {
    const res = await fetch("https://api.bls.gov/publicAPI/v2/timeseries/data/WPU081", {
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`BLS ${res.status}`);
    const body = await res.json();
    const rows = body?.Results?.series?.[0]?.data ?? [];
    const values = rows
      .map((row) => ({ year: Number(row.year), period: row.period, value: Number(row.value) }))
      .filter((row) => Number.isFinite(row.value) && row.period !== "M13")
      .sort((a, b) => b.year - a.year || b.period.localeCompare(a.period));
    if (values.length < 2) throw new Error("BLS material series unavailable");
    const latest = values[0];
    const baseline = values.find((row) => row.year <= latest.year - 1) ?? values[values.length - 1];
    const rawFactor = latest.value / baseline.value;
    return {
      ok: true,
      factor: Math.max(0.94, Math.min(1.12, rawFactor)),
      label: `BLS PPI lumber series WPU081 ${latest.period} ${latest.year}`,
      latest: latest.value,
      baseline: baseline.value,
    };
  } catch {
    return {
      ok: false,
      factor: 1,
      label: "Embedded benchmark material index",
    };
  } finally {
    clearTimeout(timeout);
  }
}

function hardenedAllowance(buildType, sqft, qualityFactor) {
  if (buildType === "bunker") {
    const protectedSqft = Math.min(Math.max(220, sqft * 0.18), 900);
    return {
      label: "Hardened bunker shell, filtration, egress, and waterproofing allowance",
      amount: protectedSqft * 470 * qualityFactor,
      note: `${Math.round(protectedSqft)} protected sqft planning allowance`,
    };
  }
  if (buildType === "basement") {
    const basementSqft = Math.min(Math.max(500, sqft * 0.38), sqft * 0.7);
    return {
      label: "Basement excavation, waterproofing, slab, and egress allowance",
      amount: basementSqft * 88 * qualityFactor,
      note: `${Math.round(basementSqft)} below-grade sqft planning allowance`,
    };
  }
  return null;
}

function calculateEstimate(input, materialIndex) {
  const sqft = cleanNumber(input.sqft, 2000, 200, 20000);
  const levels = cleanNumber(input.levels, 1, 1, 8);
  const regionKey = Object.hasOwn(REGIONAL_BENCHMARKS, input.region) ? input.region : "midwest";
  const region = REGIONAL_BENCHMARKS[regionKey] ?? REGIONAL_BENCHMARKS.midwest;
  const qualityFactor = pick(MULTIPLIERS.quality, input.quality, 1);
  const buildFactor = pick(MULTIPLIERS.buildType, input.buildType, 1);
  const scopeFactor = pick(MULTIPLIERS.scope, input.scope, 1);
  const complexityFactor = pick(MULTIPLIERS.complexity, input.complexity, 1);
  const siteFactor = pick(MULTIPLIERS.site, input.site, 1);
  const verticalFactor = levels > 2 ? 1 + (levels - 2) * 0.045 : 1;
  const materialFactor = materialIndex.factor;

  const adjustedPerSqft =
    region.basePerSqft *
    qualityFactor *
    buildFactor *
    scopeFactor *
    complexityFactor *
    siteFactor *
    verticalFactor *
    (0.7 + region.laborFactor * 0.3) *
    materialFactor;

  const subtotal = sqft * adjustedPerSqft;
  const permitAndDesign = subtotal * region.permitFactor;
  const special = hardenedAllowance(input.buildType, sqft, qualityFactor);
  const likely = subtotal + permitAndDesign + (special?.amount ?? 0);
  const rangeFactor = input.scope === "renovation" ? 0.24 : input.buildType === "bunker" ? 0.3 : 0.2;
  const low = likely * (1 - rangeFactor);
  const high = likely * (1 + rangeFactor);

  const lineItems = COMPONENT_SPLIT.map(([key, label, pct]) => ({
    key,
    label,
    amount: subtotal * pct,
    note: `${Math.round(pct * 100)}% benchmark category`,
  }));
  lineItems.push({
    key: "permitsDesign",
    label: "Design, permit, and jurisdiction allowances",
    amount: permitAndDesign,
    note: `${Math.round(region.permitFactor * 1000) / 10}% regional allowance`,
  });
  if (special) lineItems.push({ key: "specialty", ...special });

  return {
    ok: true,
    low,
    likely,
    high,
    perSqft: adjustedPerSqft,
    region: region.label,
    source: materialIndex.ok ? `${BENCHMARK_SOURCE} Live adjustment: ${materialIndex.label}.` : BENCHMARK_SOURCE,
    materialIndex,
    lineItems,
    assumptions: [
      `${region.label} baseline starts at $${region.basePerSqft}/sqft before project multipliers.`,
      region.note,
      "Estimate excludes land, financing, owner furniture, utility tap surprises, unusual soil remediation, and final code-driven engineering changes.",
      "Use this for early feasibility; request local bids and licensed drawings before construction.",
    ],
  };
}

export async function handleHomeStudio(path, req) {
  if (path === "/api/homestudio/cost-estimate" && req.method === "POST") {
    try {
      const body = await readJsonBody(req);
      const materialIndex = await getMaterialIndexFactor();
      return { status: 200, body: calculateEstimate(body, materialIndex) };
    } catch (e) {
      return { status: 400, body: { ok: false, error: "bad_request", message: e.message } };
    }
  }

  if (path === "/api/homestudio/cost-estimate" && req.method === "GET") {
    return {
      status: 200,
      body: calculateEstimate(
        { sqft: 2200, region: "midwest", buildType: "single", quality: "standard", scope: "newBuild", complexity: "normal", site: "normal", levels: 1 },
        { ok: false, factor: 1, label: "Embedded benchmark material index" }
      ),
    };
  }

  return { status: 404, body: { ok: false, error: "not_found" } };
}
