import { allowedOrigin } from "../../lib/suppclarity/http.mjs";
import { topics, searchEvidence } from "../../lib/suppclarity/evidence.mjs";
import { reserveEvidence } from "../../lib/suppclarity/quota.mjs";
export function createHandler({
  env = process.env,
  search = searchEvidence,
  reserve = reserveEvidence,
} = {}) {
  return async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    const origin = req.headers.origin;
    if (origin && allowedOrigin(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    }
    if (req.method === "OPTIONS")
      return res.status(origin && allowedOrigin(origin) ? 204 : 403).end();
    if (origin && !allowedOrigin(origin))
      return res.status(403).json({ error: "Origin not allowed." });
    if (req.method !== "GET")
      return res.status(405).json({ error: "Use GET." });
    const topic = req.query?.topic;
    if (typeof topic !== "string" || !Object.hasOwn(topics, topic))
      return res
        .status(400)
        .json({ error: "Choose a supported research topic." });
    if (!env.CONSENSUS_API_KEY)
      return res
        .status(503)
        .json({
          error:
            "Live Consensus search is not configured yet. Saved references remain available.",
        });
    const ip = String(
      req.headers["x-vercel-forwarded-for"] ||
        req.socket?.remoteAddress ||
        "unknown",
    )
      .split(",")[0]
      .trim();
    const blocked = await reserve(ip, env);
    if (blocked)
      return res.status(blocked.status).json({ error: blocked.error });
    try {
      const papers = await search({
        apiKey: env.CONSENSUS_API_KEY,
        topic,
        signal: AbortSignal.timeout(18000),
      });
      res.setHeader(
        "Cache-Control",
        "public, max-age=0, s-maxage=3600, stale-while-revalidate=3600",
      );
      return res
        .status(200)
        .json({
          provider: "Consensus",
          topic,
          papers,
          retrievedAt: new Date().toISOString(),
          purpose:
            "Additional reading only. These search matches do not automatically change the dated guidance rules.",
        });
    } catch {
      return res
        .status(502)
        .json({
          error:
            "Consensus research is temporarily unavailable. Your saved guidance sources remain available.",
        });
    }
  };
}
export default createHandler();
