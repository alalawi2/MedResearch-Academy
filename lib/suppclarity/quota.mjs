import { createHmac } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
export async function reserveScan(installId, ip, env = process.env, rpc) {
  if (!env.VITE_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY)
    return {
      status: 503,
      error:
        "Label scanning is temporarily unavailable. You can still enter a label manually.",
    };
  const hash = (s) =>
    createHmac("sha256", env.SUPABASE_SERVICE_ROLE_KEY)
      .update("suppclarity-scan-v1\0" + s)
      .digest("hex");
  const call =
    rpc ||
    ((params) =>
      createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      }).rpc("suppclarity_reserve_scan", params));
  try {
    const { data, error } = await call({
      p_install_hash: hash("install:" + installId),
      p_ip_hash: hash("ip:" + ip),
    });
    if (error?.message?.includes("quota_exceeded"))
      return {
        status: 429,
        error:
          "The scan allowance has been reached. Try tomorrow or enter the label manually.",
      };
    if (error || data !== true)
      return {
        status: 503,
        error:
          "Label scanning is temporarily unavailable. Please enter the label manually.",
      };
    return null;
  } catch {
    return {
      status: 503,
      error:
        "Label scanning is temporarily unavailable. Please enter the label manually.",
    };
  }
}
export async function reserveEvidence(ip, env = process.env, rpc) {
  if (!env.VITE_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY)
    return {
      status: 503,
      error:
        "Live research is temporarily unavailable. Saved source references still work.",
    };
  const ipHash = createHmac("sha256", env.SUPABASE_SERVICE_ROLE_KEY)
    .update("suppclarity-evidence-v1\0" + ip)
    .digest("hex");
  const call =
    rpc ||
    ((params) =>
      createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      }).rpc("suppclarity_reserve_evidence", params));
  try {
    const { data, error } = await call({ p_ip_hash: ipHash });
    if (error?.message?.includes("quota_exceeded"))
      return {
        status: 429,
        error:
          "Live research has reached its beta allowance. Saved references remain available.",
      };
    if (error || data !== true)
      return {
        status: 503,
        error:
          "Live research is temporarily unavailable. Saved references remain available.",
      };
    return null;
  } catch {
    return {
      status: 503,
      error:
        "Live research is temporarily unavailable. Saved references remain available.",
    };
  }
}
