import { allowedOrigin } from "../../lib/suppclarity/http.mjs";
import { reserveEvidence } from "../../lib/suppclarity/quota.mjs";
import { reserveMembershipAction } from "../../lib/suppclarity/membership.mjs";
import {
  answerQuestion,
  copilotInput,
  scopeAnswer,
} from "../../lib/suppclarity/copilot.mjs";
export const config = { api: { bodyParser: false } };
export function createHandler({
  env = process.env,
  answer = answerQuestion,
  reserve = reserveEvidence,
  reserveMembership = reserveMembershipAction,
} = {}) {
  return async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    const origin = req.headers.origin;
    if (origin && allowedOrigin(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-SuppClarity-Billing");
    }
    if (req.method === "OPTIONS")
      return res.status(origin && allowedOrigin(origin) ? 204 : 403).end();
    if (origin && !allowedOrigin(origin))
      return res.status(403).json({ error: "Origin not allowed." });
    if (req.method !== "POST")
      return res.status(405).json({ error: "Use POST." });
    if (
      String(req.headers["content-type"] || "").split(";")[0] !==
      "application/json"
    )
      return res.status(415).json({ error: "Expected a question." });
    let input;
    try {
      let size = 0;
      const chunks = [];
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 8000)
          return res
            .status(413)
            .json({ error: "Please shorten the question." });
        chunks.push(chunk);
      }
      input = copilotInput(JSON.parse(Buffer.concat(chunks).toString()));
    } catch {
      return res
        .status(400)
        .json({
          error: "Enter a supplement question of up to 500 characters.",
        });
    }
    const limited = scopeAnswer(input.question);
    if (limited)
      return res
        .status(200)
        .json({ ...limited, provider: "Prepared scope guidance" });
    if (!env.OPENAI_API_KEY)
      return res
        .status(503)
        .json({
          error:
            "Live answers are unavailable. The quick guides and prepared answers still work.",
        });
    const ip = String(
      req.headers["x-vercel-forwarded-for"] ||
        req.socket?.remoteAddress ||
        "unknown",
    )
      .split(",")[0]
      .trim();
    const membership = await reserveMembership(req, "answer", env);
    const blocked = membership.status ? membership : membership.legacy ? await reserve(ip, env) : null;
    if (blocked)
      return res
        .status(blocked.status)
        .json({
          error:
            blocked.status === 429 && membership.legacy
              ? "The live-answer daily allowance is reached. Prepared answers and guides still work."
              : blocked.error || "Live answers are temporarily unavailable.",
        });
    try {
      return res
        .status(200)
        .json({
          ...(await answer({
            ...input,
            apiKey: env.OPENAI_API_KEY,
            signal: AbortSignal.timeout(25000),
          })),
          provider: "OpenAI with curated guides",
        });
    } catch {
      return res
        .status(502)
        .json({
          error:
            "I could not finish that answer. Try a shorter question or read the related guide.",
        });
    }
  };
}
export default createHandler();
