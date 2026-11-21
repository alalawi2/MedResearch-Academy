import { discoverProducts } from "../../lib/suppclarity/discovery.mjs";
import { reserveEvidence } from "../../lib/suppclarity/quota.mjs";
import { allowedOrigin } from "../../lib/suppclarity/http.mjs";
import {
  productQuery,
  searchProducts,
  getProductLabel,
} from "../../lib/suppclarity/products.mjs";
export function createHandler({
  search = searchProducts,
  read = getProductLabel,
  discover = discoverProducts,
  reserve = reserveEvidence,
  env = process.env,
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
    const { q, id, web } = req.query || {};
    if (
      Object.keys(req.query || {}).some(
        (k) => !["q", "id", "web"].includes(k),
      ) ||
      !!q === !!id ||
      (web !== undefined && web !== "1") ||
      (web && !q)
    )
      return res
        .status(400)
        .json({ error: "Enter a product name or choose one record." });
    try {
      if (q) productQuery(q);
      if (id && (typeof id !== "string" || !/^\d{1,9}$/.test(id)))
        throw Error();
    } catch {
      return res
        .status(400)
        .json({ error: "Enter a product name, brand or complete barcode." });
    }
    try {
      const signal = AbortSignal.timeout(45000);
      let data;
      if (id)
        data = {
          label: await read({ id, signal }),
          requiresConfirmation: true,
        };
      else {
        let products = [];
        let databaseAvailable = true;
        try {
          products = await search({
            query: q,
            signal: AbortSignal.timeout(10000),
          });
        } catch {
          databaseAvailable = false;
        }
        let webMatches = [];
        let onlineStatus = "not-needed";
        if (!products.length || web) {
          onlineStatus = "unavailable";
          if (env.OPENAI_API_KEY) {
            const ip = String(
              req.headers["x-vercel-forwarded-for"] ||
                req.socket?.remoteAddress ||
                "unknown",
            )
              .split(",")[0]
              .trim();
            const blocked = await reserve(ip, env);
            if (blocked)
              onlineStatus =
                blocked.status === 429 ? "allowance-reached" : "unavailable";
            else {
              try {
                webMatches = await discover({
                  query: q,
                  apiKey: env.OPENAI_API_KEY,
                  model: env.SUPPCLARITY_SEARCH_MODEL || "gpt-4.1-mini",
                  signal,
                });
                onlineStatus = "searched";
              } catch (error) {
                console.error(
                  "suppclarity_discovery_failed",
                  error?.name === "TimeoutError" || error?.name === "AbortError"
                    ? "timeout"
                    : "provider_or_format",
                );
                onlineStatus = "unavailable";
              }
            }
          }
        }
        if (!databaseAvailable && onlineStatus === "unavailable")
          throw Error("Sources unavailable");
        data = { products, webMatches, onlineStatus, databaseAvailable };
      }
      if (id || data.products?.length || data.webMatches?.length)
        res.setHeader(
          "Cache-Control",
          "public, max-age=0, s-maxage=3600, stale-while-revalidate=3600",
        );
      return res.status(200).json({
        ...data,
        provider: "NIH DSLD and online sources",
        retrievedAt: new Date().toISOString(),
      });
    } catch {
      return res.status(502).json({
        error:
          "Product lookup is temporarily unavailable. You can use a photo or manual entry.",
      });
    }
  };
}
export default createHandler();
