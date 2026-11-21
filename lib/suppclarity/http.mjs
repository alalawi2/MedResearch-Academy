const origins = new Set([
  "https://www.medresearch-academy.om",
  "https://medresearch-academy.om",
  "http://localhost:4183",
  "http://127.0.0.1:4183",
  "http://localhost:8081",
]);
export const allowedOrigin = (origin) =>
  origins.has(origin) ||
  /^https:\/\/med-research-academy-[a-z0-9-]+-alalawi2s-projects\.vercel\.app$/.test(
    origin || "",
  );
