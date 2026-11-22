import { createClient } from "@supabase/supabase-js";
import { allowedOrigin } from "../../lib/suppclarity/http.mjs";
import { lookupPlan } from "../../lib/suppclarity/membership.mjs";
export function createHandler({
  env = process.env,
  lookup = lookupPlan,
  checkDatabase,
} = {}) {
  return async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    const origin = req.headers.origin;
    if (origin && allowedOrigin(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Headers", "X-SuppClarity-Billing");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    }
    if (req.method === "OPTIONS")
      return res.status(origin && allowedOrigin(origin) ? 204 : 403).end();
    if (origin && !allowedOrigin(origin))
      return res.status(403).json({ ready: false });
    if (req.method !== "GET") return res.status(405).json({ ready: false });
    const id = req.headers["x-suppclarity-billing"];
    if (
      typeof id !== "string" ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(
        id,
      )
    )
      return res.status(400).json({ ready: false });
    if (
      env.SUPPCLARITY_PLUS_ENABLED !== "true" ||
      !env.SUPPCLARITY_REVENUECAT_SECRET_KEY ||
      !env.SUPABASE_SERVICE_ROLE_KEY ||
      !env.VITE_SUPABASE_URL
    )
      return res.status(200).json({ ready: false });
    try {
      await lookup(id, env);
      const db =
        checkDatabase ||
        (() =>
          createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
          }).rpc("suppclarity_membership_ready"));
      const result = await db();
      return res
        .status(200)
        .json({ ready: result.data === true && !result.error });
    } catch {
      return res.status(503).json({ ready: false });
    }
  };
}
export default createHandler();
