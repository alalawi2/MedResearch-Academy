import { allowedOrigin } from "../../lib/suppclarity/http.mjs";
import {
  productQuery,
  searchProducts,
  getProductLabel,
} from "../../lib/suppclarity/products.mjs";
export function createHandler({
  search = searchProducts,
  read = getProductLabel,
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
    const { q, id } = req.query || {};
    if (
      Object.keys(req.query || {}).some((k) => !["q", "id"].includes(k)) ||
      !!q === !!id
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
      const signal = AbortSignal.timeout(20000);
      const data = id
        ? { label: await read({ id, signal }), requiresConfirmation: true }
        : { products: await search({ query: q, signal }) };
      res.setHeader(
        "Cache-Control",
        "public, max-age=0, s-maxage=3600, stale-while-revalidate=3600",
      );
      return res.status(200).json({
        ...data,
        provider: "NIH DSLD",
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
