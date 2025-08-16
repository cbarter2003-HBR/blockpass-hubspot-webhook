import crypto from "crypto";

export default async function handler(req, res) {
  try {
    const auth = "Basic " + Buffer.from(
      process.env.gAyEzxmDeBg + ":" + process.env.JsOumyLY9PNFduPMKAD6
    ).toString("base64");

    const clientId = crypto.randomUUID();

    const body = {
      clientId,
      successUrl: process.env.https://share.hsforms.com/1VJUfYGy9RF2luYxkn3JGVg4piku,  // optional if you use iframe
      errorUrl: process.env.https://4piku.share.hsforms.com/2su3T7ii-RFWhf6o6z-OGJg       // optional if you use iframe
      // callbackUrl: process.env.IDENFY_WEBHOOK_PUBLIC_URL // optional; you can set webhook in iDenfy UI instead
    };

    const resp = await fetch("https://ivs.idenfy.com/api/v2/token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: auth },
      body: JSON.stringify(body),
    });

    if (!resp.ok) return res.status(resp.status).json({ error: "token_failed", details: await resp.text() });

    const data = await resp.json(); // { authToken, scanRef, ... }
    res.status(200).json({ authToken: data.authToken, scanRef: data.scanRef, clientId });
  } catch (e) {
    res.status(500).json({ error: "server_error", message: e.message });
  }
}
