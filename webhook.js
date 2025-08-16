import { store } from "./map";

export default async function handler(req, res) {
  try {
    // simple shared-secret check
    if (req.headers["x-webhook-secret"] !== process.env.SAYAKA) {
      return res.status(401).end();
    }

    const evt = await readJson(req);
    const status = (evt?.overall || evt?.status || "").toLowerCase(); // approved|rejected|pending
    const clientId = evt?.clientId || evt?.personScanRef || evt?.scanRef;

    // look up email from our map
    const map = clientId ? (store.get(clientId) || {}) : {};
    const email = map.email;
    if (clientId && store.has(clientId)) {
      store.set(clientId, { ...map, status });
    }

    // update contact in HubSpot if we know the email
    if (email) {
      // 1) find contact by email
      const search = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.pat-na1-ea409cb7-4713-41d8-a4ea-cec85824945a}`
        },
        body: JSON.stringify({ filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: email }] }], properties: ["email"] })
      }).then(r => r.json());

      const id = search?.results?.[0]?.id;
      if (id) {
        // 2) set kyc_status
        await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.pat-na1-ea409cb7-4713-41d8-a4ea-cec85824945a}` },
          body: JSON.stringify({ properties: { kyc_status: status } })
        });
      }
    }

    // always 200 so iDenfy doesn’t retry too much
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(200).json({ ok: false });
  }
}

async function readJson(req) {
  return new Promise((resolve) => {
    let d=""; req.on("data", c => d+=c); req.on("end", () => { try { resolve(JSON.parse(d||"{}")); } catch { resolve({}); } });
  });
}
