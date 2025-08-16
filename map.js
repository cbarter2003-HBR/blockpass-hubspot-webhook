export const store = globalThis.__MAP__ || (globalThis.__MAP__ = new Map());

export default async function handler(req, res) {
  try {
    const { clientId, scanRef, email } = await readJson(req);
    if (clientId && email) store.set(clientId, { email, scanRef, status: "pending" });
    res.status(200).json({ ok: true });
  } catch {
    res.status(200).json({ ok: true });
  }
}

async function readJson(req) {
  return new Promise((resolve) => {
    let d = ""; req.on("data", c => d += c); req.on("end", () => {
      try { resolve(JSON.parse(d||"{}")); } catch { resolve({}); }
    });
  });
}
