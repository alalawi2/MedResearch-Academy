import { allowedOrigin } from "../../lib/suppclarity/http.mjs";
import { imageFromDataUrl, readLabel } from "../../lib/suppclarity/label.mjs";
import { reserveScan } from "../../lib/suppclarity/quota.mjs";
export const config = { api: { bodyParser: false } };
export function createHandler({
  env = process.env,
  read = readLabel,
  reserve = reserveScan,
} = {}) {
  return async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    const origin = req.headers.origin;
    if (origin && allowedOrigin(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, X-SuppClarity-Consent, X-SuppClarity-Install",
      );
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    }
    if (req.method === "OPTIONS")
      return res.status(origin && allowedOrigin(origin) ? 204 : 403).end();
    if (origin && !allowedOrigin(origin))
      return res.status(403).json({ error: "This origin is not allowed." });
    if (req.method !== "POST")
      return res.status(405).json({ error: "Use POST." });
    if (req.headers["x-suppclarity-consent"] !== "label-photo-v1")
      return res.status(403).json({
        error: "Please agree to send the label photo for reading first.",
      });
    const install = String(req.headers["x-suppclarity-install"] || "");
    if (!/^[A-Za-z0-9_-]{32,96}$/.test(install))
      return res
        .status(400)
        .json({ error: "Please reopen the app and try again." });
    if (
      String(req.headers["content-type"] || "").split(";")[0] !==
      "application/json"
    )
      return res.status(415).json({ error: "Expected an image request." });
    if (!env.OPENAI_API_KEY)
      return res.status(503).json({
        error: "Label scanning is not configured. Manual entry still works.",
      });
    if (Number(req.headers["content-length"]) > 3550000)
      return res
        .status(413)
        .json({ error: "Please crop closer to the label and try again." });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);
    try {
      let size = 0;
      const chunks = [];
      for await (const c of req) {
        size += c.length;
        if (size > 3550000)
          return res
            .status(413)
            .json({ error: "Please crop closer to the label and try again." });
        chunks.push(c);
      }
      let image;
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString());
        image = imageFromDataUrl(body.image);
      } catch {
        return res.status(400).json({
          error:
            "Please choose a readable JPG, PNG or WebP label photo under 2.5 MB.",
        });
      }
      // Vercel sets this forwarding header. Only a keyed hash is retained for quota.
      const ip = String(
        req.headers["x-vercel-forwarded-for"] ||
          req.socket?.remoteAddress ||
          "unknown",
      )
        .split(",")[0]
        .trim();
      const blocked = await reserve(install, ip, env);
      if (blocked)
        return res.status(blocked.status).json({ error: blocked.error });
      const label = await read({
        apiKey: env.OPENAI_API_KEY,
        model: env.SUPPCLARITY_LABEL_MODEL || "gpt-4.1-mini",
        image,
        signal: controller.signal,
      });
      return res.status(200).json({
        label,
        provider: "OpenAI",
        requiresConfirmation: true,
        coverage:
          "Confirmed label transcription; ingredient types and units must be checked in the app.",
      });
    } catch {
      return res.status(502).json({
        error:
          "We could not read this label reliably. Try a clearer photo or enter it manually.",
      });
    } finally {
      clearTimeout(timer);
    }
  };
}
export default createHandler();
