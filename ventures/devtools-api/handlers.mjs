export async function handleApiRequest(path, req, url) {
  const tool = path.replace(/^\//, "").split("/")[0];

  if (tool === "uuid") {
    return { body: { uuids: Array.from({ length: parseInt(url.searchParams.get("n") ?? "1", 10) }, () => crypto.randomUUID()) } };
  }

  if (tool === "hash") {
    const text = url.searchParams.get("text") ?? "";
    const algo = url.searchParams.get("algo") ?? "SHA-256";
    const buf = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest(algo, buf);
    const hex = [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
    return { body: { algo, text, hash: hex } };
  }

  if (tool === "base64") {
    const text = url.searchParams.get("text") ?? "";
    const mode = url.searchParams.get("mode") ?? "encode";
    if (mode === "decode") {
      return { body: { result: Buffer.from(text, "base64").toString("utf8") } };
    }
    return { body: { result: Buffer.from(text, "utf8").toString("base64") } };
  }

  if (tool === "json") {
    const text = url.searchParams.get("text") ?? "{}";
    try {
      return { body: { valid: true, formatted: JSON.stringify(JSON.parse(text), null, 2) } };
    } catch (e) {
      return { status: 400, body: { valid: false, error: e.message } };
    }
  }

  if (tool === "timestamp") {
    const ts = url.searchParams.get("ts");
    const d = ts ? new Date(parseInt(ts, 10) * (ts.length > 10 ? 1 : 1000)) : new Date();
    return {
      body: {
        iso: d.toISOString(),
        unix: Math.floor(d.getTime() / 1000),
        unixMs: d.getTime(),
      },
    };
  }

  if (tool === "health") {
    return { body: { ok: true, service: "pipekit-api" } };
  }

  return {
    status: 404,
    body: {
      error: "unknown_endpoint",
      available: ["uuid", "hash", "base64", "json", "timestamp", "health"],
    },
  };
}
