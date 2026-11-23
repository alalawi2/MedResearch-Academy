import { createHmac } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
const products = new Set([
  "suppclarity_plus_monthly",
  "suppclarity_plus_yearly",
]);
export function verifiedPlan(data, now = Date.now(), allowSandbox = false) {
  const subscriber = data?.subscriber;
  const entitlement = subscriber?.entitlements?.suppclarity_plus;
  const product = entitlement?.product_identifier;
  const subscription = subscriber?.subscriptions?.[product];
  if (
    !entitlement ||
    !products.has(String(product).split(":")[0]) ||
    !subscription ||
    subscription.refunded_at ||
    (subscription.is_sandbox === true &&
      (!allowSandbox ||
        !["app_store", "play_store"].includes(subscription.store)))
  )
    return { plus: false };
  const expires = Math.max(
    Date.parse(entitlement.expires_date || "") || 0,
    Date.parse(subscription.grace_period_expires_date || "") || 0,
  );
  if (!Number.isFinite(expires) || expires <= now) return { plus: false };
  return {
    plus: true,
    expiresAt: expires,
    subject:
      typeof subscriber.original_app_user_id === "string"
        ? subscriber.original_app_user_id
        : undefined,
  };
}
export async function lookupPlan(id, env = process.env, fetcher = fetch) {
  // The V1 subscriber endpoint accepts a public, app-specific SDK key.
  // Verification never needs administrator permissions to grant/refund/delete.
  const key =
    env.SUPPCLARITY_REVENUECAT_API_KEY || env.SUPPCLARITY_REVENUECAT_SECRET_KEY;
  if (!key) return { plus: false };
  const response = await fetcher(
    "https://api.revenuecat.com/v1/subscribers/" + encodeURIComponent(id),
    {
      headers: {
        Authorization: "Bearer " + key,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    },
  );
  if (response.status === 404) return { plus: false };
  if (!response.ok) throw Error("Subscription verification unavailable");
  return verifiedPlan(
    await response.json(),
    Date.now(),
    env.SUPPCLARITY_ALLOW_SANDBOX === "true",
  );
}
export async function reserveMembershipAction(
  req,
  kind,
  env = process.env,
  { lookup = lookupPlan, rpc } = {},
) {
  const id = req.headers?.["x-suppclarity-billing"];
  if (id === undefined) return { legacy: true }; // Keep the already released 0.6 clients working.
  if (
    typeof id !== "string" ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(
      id,
    )
  )
    return { status: 400, error: "Please reopen the app before trying again." };
  if (
    !["scan", "answer"].includes(kind) ||
    !env.VITE_SUPABASE_URL ||
    !env.SUPABASE_SERVICE_ROLE_KEY
  )
    return {
      status: 503,
      error:
        "Online help is temporarily unavailable. Your local guides still work.",
    };
  try {
    const plan = await lookup(id, env);
    const ip = String(
      req.headers["x-vercel-forwarded-for"] ||
        req.socket?.remoteAddress ||
        "unknown",
    )
      .split(",")[0]
      .trim();
    const hash = (value) =>
      createHmac("sha256", env.SUPABASE_SERVICE_ROLE_KEY)
        .update("suppclarity-membership-v1\0" + value)
        .digest("hex");
    const call =
      rpc ||
      ((params) =>
        createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
          auth: { persistSession: false, autoRefreshToken: false },
        }).rpc("suppclarity_reserve_membership_action", params));
    const { data, error } = await call({
      p_subject_hash: hash(
        "member:" + (plan.plus && plan.subject ? plan.subject : id),
      ),
      p_ip_hash: hash("ip:" + ip),
      p_kind: kind,
      p_plus: plan.plus === true,
    });
    if (error?.message?.includes("quota_exceeded"))
      return {
        status: 429,
        error:
          "Your " +
          kind +
          " allowance has been reached. It resets each calendar month; daily service limits also apply. Free guides and manual entry remain available.",
      };
    if (error || data !== true) throw Error("Allowance unavailable");
    return { legacy: false, plus: plan.plus === true };
  } catch {
    return {
      status: 503,
      error:
        "Could not check your online allowance. Please try again; local guides still work.",
    };
  }
}
